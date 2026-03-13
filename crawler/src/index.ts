import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { initDb, getDb, getRepoCount, getSkillCount, closeDb } from "./db.js";
import { SEARCH_QUERIES } from "./queries.js";
import { runSearch } from "./search.js";
import { enrichRepos } from "./enrich.js";
import { crawlSkillsSh } from "./skills.js";
import { crawlGlama } from "./glama.js";
import { crawlClawHub } from "./clawhub.js";

// CRAWL_MODE=incremental: only search repos created in last 2 days, skip fork/noise cleanup
// CRAWL_MODE=full (default): full crawl from 2023-01-01
const CRAWL_MODE = process.env.CRAWL_MODE || "full";

function getIncrementalStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

const ThrottledOctokit = Octokit.plugin(throttling);

function createOctokit(): InstanceType<typeof ThrottledOctokit> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN not set. Copy .env.example to .env and add your token.");
    process.exit(1);
  }

  return new ThrottledOctokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(`Rate limit hit for ${(options as { url: string }).url}, retrying after ${retryAfter}s (attempt ${retryCount + 1})`);
        return retryCount < 3;
      },
      onSecondaryRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(`Secondary rate limit for ${(options as { url: string }).url}, retrying after ${retryAfter}s`);
        return retryCount < 2;
      },
    },
  });
}

async function main(): Promise<void> {
  console.log("AgentRank Crawler starting...\n");
  const startTime = Date.now();

  // Init
  initDb();
  const octokit = createOctokit();
  const countBefore = getRepoCount();

  // Search phase
  const isIncremental = CRAWL_MODE === "incremental";
  const searchStartDate = isIncremental ? getIncrementalStartDate() : undefined;
  console.log(`=== Search Phase (${isIncremental ? "incremental from " + searchStartDate : "full"}) ===`);

  for (const query of SEARCH_QUERIES) {
    console.log(`\n--- Query: ${query} ---`);
    const found = await runSearch(octokit, query, searchStartDate);
    console.log(`Collected ${found} results for ${query}`);
  }

  const countAfterSearch = getRepoCount();
  console.log(`\n=== Search complete: ${countAfterSearch} repos (${countAfterSearch - countBefore} new) ===`);

  // Filter: remove forks that have fewer stars than parent (skip on incremental — already done)
  const db = getDb();
  if (!isIncremental) {
    const forksRemoved = db
      .prepare(
        `DELETE FROM repos WHERE is_fork = 1 AND parent_stars IS NOT NULL AND stars < parent_stars`
      )
      .run();
    console.log(`Removed ${forksRemoved.changes} low-value forks`);

    // Filter: remove noise (0 stars AND no description)
    const noiseRemoved = db
      .prepare(`DELETE FROM repos WHERE stars = 0 AND (description IS NULL OR description = '')`)
      .run();
    console.log(`Removed ${noiseRemoved.changes} noise repos (0 stars, no description)`);
  }

  // Enrichment phase
  console.log("\n=== Enrichment Phase ===");
  await enrichRepos(octokit);

  // Skills crawling phase — run all three in parallel
  console.log("\n=== Skills Crawling Phase (parallel) ===");

  const [skillsShCount, glamaResult, clawHubCount] = await Promise.all([
    crawlSkillsSh().catch((err) => {
      console.error("skills.sh crawler failed:", err);
      return 0;
    }),
    crawlGlama().catch((err) => {
      console.error("Glama crawler failed:", err);
      return { total: 0, matched: 0 };
    }),
    crawlClawHub().catch((err) => {
      console.error("ClawHub crawler failed:", err);
      return 0;
    }),
  ]);

  console.log(`\nskills.sh: ${skillsShCount} skills processed`);
  console.log(`Glama: ${glamaResult.total} servers processed, ${glamaResult.matched} matched to repos`);
  console.log(`ClawHub: ${clawHubCount} skills processed`);

  // Summary
  const finalCount = getRepoCount();
  const skillCount = getSkillCount();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done ===`);
  console.log(`Total repos: ${finalCount}`);
  console.log(`Total skills: ${skillCount}`);
  console.log(`Elapsed: ${elapsed}s`);

  // Quick sanity check
  const top10 = db
    .prepare("SELECT full_name, stars FROM repos ORDER BY stars DESC LIMIT 10")
    .all() as { full_name: string; stars: number }[];
  console.log(`\nTop 10 repos by stars:`);
  for (const r of top10) {
    console.log(`  ${r.stars.toString().padStart(6)} ${r.full_name}`);
  }

  const top10Skills = db
    .prepare("SELECT slug, installs FROM skills ORDER BY installs DESC LIMIT 10")
    .all() as { slug: string; installs: number }[];
  console.log(`\nTop 10 skills by installs:`);
  for (const s of top10Skills) {
    console.log(`  ${s.installs.toString().padStart(8)} ${s.slug}`);
  }

  closeDb();
}

main().catch((err) => {
  console.error("Crawler failed:", err);
  closeDb();
  process.exit(1);
});
