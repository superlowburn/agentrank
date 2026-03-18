/**
 * One-time backfill: clear generic descriptions and enrich from GitHub.
 * Run with: npx tsx crawler/src/backfill-descriptions.ts
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { getDb, initDb } from "./db.js";

const ThrottledOctokit = Octokit.plugin(throttling);
const octokit = new ThrottledOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter: number, _options: unknown, _o: unknown, retryCount: number) => {
      console.warn(`Rate limit, retrying after ${retryAfter}s (attempt ${retryCount + 1})`);
      return retryCount < 3;
    },
    onSecondaryRateLimit: (retryAfter: number) => {
      console.warn(`Secondary rate limit, waiting ${retryAfter}s`);
      return true;
    },
  },
});

const GENERIC = "Discover and install skills for AI agents.";

function parseOwnerRepo(repo: string): string | null {
  const urlMatch = repo.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
  if (urlMatch) return urlMatch[1].replace(/\.git$/, "");
  if (/^[\w.-]+\/[\w.-]+$/.test(repo)) return repo;
  return null;
}

initDb();
const db = getDb();

// Step 1: Convert existing generic descriptions to NULL
const cleared = db.prepare("UPDATE skills SET description = NULL WHERE description = ?").run(GENERIC);
console.log(`Cleared ${cleared.changes} generic descriptions → NULL`);

// Step 2: Enrich skills with github_repo but no description
const skills = db.prepare(
  "SELECT slug, github_repo FROM skills WHERE github_repo IS NOT NULL AND description IS NULL ORDER BY installs DESC LIMIT 2000"
).all() as { slug: string; github_repo: string }[];

console.log(`Enriching ${skills.length} skills from GitHub...`);

// Cache repo descriptions to avoid duplicate API calls for same repo
const repoCache = new Map<string, string | null>();
let enriched = 0;
let skipped = 0;

for (const skill of skills) {
  const ownerRepo = parseOwnerRepo(skill.github_repo);
  if (!ownerRepo) { skipped++; continue; }

  let desc = repoCache.get(ownerRepo);
  if (desc === undefined) {
    const [owner, repo] = ownerRepo.split("/");
    try {
      const { data } = await octokit.rest.repos.get({ owner, repo });
      desc = (data.description && data.description.length > 10) ? data.description : null;
      repoCache.set(ownerRepo, desc);
    } catch {
      repoCache.set(ownerRepo, null);
      skipped++;
      continue;
    }
  }

  if (desc) {
    db.prepare("UPDATE skills SET description = ? WHERE slug = ?").run(desc, skill.slug);
    enriched++;
  } else {
    skipped++;
  }

  if ((enriched + skipped) % 100 === 0) {
    console.log(`  Progress: ${enriched} enriched, ${skipped} skipped (${repoCache.size} unique repos fetched)`);
  }
}

// Step 3: Skills without github_repo — infer from slug
const withoutRepo = db.prepare(
  "SELECT slug FROM skills WHERE github_repo IS NULL AND description IS NULL ORDER BY installs DESC LIMIT 500"
).all() as { slug: string }[];

console.log(`\nInferring repos for ${withoutRepo.length} skills...`);
let inferred = 0;

for (const skill of withoutRepo) {
  const parts = skill.slug.split("/");
  if (parts.length < 2) continue;
  const inferredRepo = `${parts[0]}/${parts[1]}`;

  let desc = repoCache.get(inferredRepo);
  if (desc === undefined) {
    try {
      const { data } = await octokit.rest.repos.get({ owner: parts[0], repo: parts[1] });
      desc = (data.description && data.description.length > 10) ? data.description : null;
      repoCache.set(inferredRepo, desc);
      db.prepare("UPDATE skills SET github_repo = ? WHERE slug = ? AND github_repo IS NULL").run(inferredRepo, skill.slug);
    } catch {
      repoCache.set(inferredRepo, null);
      continue;
    }
  }
  if (desc) {
    db.prepare("UPDATE skills SET description = ? WHERE slug = ?").run(desc, skill.slug);
    inferred++;
  }
}

console.log(`\nInferred ${inferred} descriptions from slug`);

const finalGeneric = db.prepare(
  "SELECT COUNT(*) as c FROM skills WHERE description IS NULL OR description = ?"
).get(GENERIC) as { c: number };
const total = db.prepare("SELECT COUNT(*) as c FROM skills").get() as { c: number };
console.log(`\nFinal: ${finalGeneric.c} / ${total.c} still null/generic`);
console.log(`Enriched: ${enriched}, slug-inferred: ${inferred}, skipped: ${skipped}`);
