/**
 * Skills scorer
 *
 * Computes a composite score for each skill in the skills table.
 * Skills with a linked GitHub repo get blended signals from both
 * registry data and GitHub signals. Skills without GitHub repos
 * are scored purely from registry data.
 *
 * Signals and weights (with GitHub):
 *   Installs:           30%
 *   Freshness:          20%  (from GitHub)
 *   Issue Health:       15%  (from GitHub)
 *   Stars:              10%  (from GitHub)
 *   Platform Breadth:   10%  (from registry)
 *   Contributors:       10%  (from GitHub)
 *   Description:         5%  (from registry)
 *
 * Without GitHub (imputed neutral values):
 *   Same weights as above, with freshness=0.5, issueHealth=0.5,
 *   stars=0, contributors=0. Produces a baseline ~17.5 points from
 *   neutral imputation.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../data/agentrank.db");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/ranked-skills.json");

interface SkillRow {
  id: number;
  slug: string;
  name: string | null;
  description: string | null;
  github_repo: string | null;
  source: string;
  installs: number;
  trending_rank: number | null;
  platforms: string;
  author: string | null;
  gh_stars: number | null;
  gh_open_issues: number | null;
  gh_closed_issues: number | null;
  gh_contributors: number | null;
  gh_last_commit_at: string | null;
  gh_is_archived: number;
}

interface RepoRow {
  stars: number;
  forks: number;
  open_issues: number;
  closed_issues: number;
  contributors: number;
  last_commit_at: string | null;
  is_archived: number;
  license: string | null;
}

function logNormalize(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  return Math.log(1 + value) / Math.log(1 + maxValue);
}

function computeFreshness(lastCommitAt: string | null, isArchived: number): number {
  if (isArchived) return 0;
  if (!lastCommitAt) return 0;
  const days = Math.max(0, (Date.now() - new Date(lastCommitAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return 1.0;
  if (days <= 90) return 1.0 - (days - 7) / (90 - 7);
  return Math.max(0, Math.exp(-(days - 90) / 90) * 0.1);
}

function computeIssueHealth(openIssues: number, closedIssues: number): number {
  const total = openIssues + closedIssues;
  return total === 0 ? 0.5 : closedIssues / total;
}

function computeDescriptionQuality(desc: string | null): number {
  if (!desc) return 0;
  if (desc.length < 50) return 0.3;
  if (desc.length < 150) return 0.7;
  return 1.0;
}

export function scoreSkills(): void {
  console.log("Skills Scorer starting...\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const skills = db.prepare("SELECT * FROM skills").all() as SkillRow[];
  console.log(`Scoring ${skills.length} skills`);

  if (skills.length === 0) {
    console.log("No skills to score.");
    db.close();
    return;
  }

  // Find max values for normalization
  const maxInstalls = Math.max(...skills.map((s) => s.installs), 1);
  const maxPlatforms = Math.max(...skills.map((s) => {
    try { return JSON.parse(s.platforms).length; } catch { return 0; }
  }), 1);

  // Load repo data for cross-referencing
  const repoLookup = new Map<string, RepoRow>();
  const repos = db.prepare("SELECT full_name, stars, forks, open_issues, closed_issues, contributors, last_commit_at, is_archived, license FROM repos").all() as (RepoRow & { full_name: string })[];
  for (const r of repos) {
    repoLookup.set(r.full_name, r);
  }

  // Also build a lookup by GitHub URL for skills that store full URLs
  const repoByUrl = new Map<string, RepoRow>();
  for (const r of repos) {
    repoByUrl.set(`https://github.com/${r.full_name}`, r);
  }

  // Find max GitHub values across linked skills for normalization
  // Check both repo table matches and skill-level GitHub data
  let maxStars = 0;
  let maxContributors = 0;
  for (const skill of skills) {
    const repo = findRepo(skill, repoLookup, repoByUrl);
    if (repo) {
      maxStars = Math.max(maxStars, repo.stars);
      maxContributors = Math.max(maxContributors, repo.contributors);
    } else if (skill.gh_stars !== null) {
      maxStars = Math.max(maxStars, skill.gh_stars);
      maxContributors = Math.max(maxContributors, skill.gh_contributors ?? 0);
    }
  }

  console.log(`Max installs: ${maxInstalls}, max platforms: ${maxPlatforms}, max stars: ${maxStars}, max contributors: ${maxContributors}`);

  // Score each skill
  const scored: Array<{ id: number; score: number }> = [];

  let ghFromRepo = 0;
  let ghFromSkill = 0;
  let registryOnly = 0;

  for (const skill of skills) {
    const repo = findRepo(skill, repoLookup, repoByUrl);
    let platforms: string[] = [];
    try { platforms = JSON.parse(skill.platforms); } catch { /* empty */ }

    const installsNorm = logNormalize(skill.installs, maxInstalls);
    const platformBreadth = platforms.length / maxPlatforms;
    const descQuality = computeDescriptionQuality(skill.description);

    let score: number;

    if (repo) {
      // Full scoring with GitHub signals from repos table
      let freshness = computeFreshness(repo.last_commit_at, repo.is_archived);
      // Freshness floor for established tools
      if (repo.stars >= 200 && freshness < 0.3) {
        freshness = 0.3;
      }
      const issueHealth = computeIssueHealth(repo.open_issues, repo.closed_issues);
      const starsNorm = logNormalize(repo.stars, maxStars);
      const contribNorm = logNormalize(repo.contributors, maxContributors);

      score = (
        installsNorm * 0.30 +
        freshness * 0.20 +
        issueHealth * 0.15 +
        starsNorm * 0.10 +
        platformBreadth * 0.10 +
        contribNorm * 0.10 +
        descQuality * 0.05
      );
      ghFromRepo++;
    } else if (skill.gh_stars !== null) {
      // Fallback: use skill-level GitHub data
      let freshness = computeFreshness(skill.gh_last_commit_at, skill.gh_is_archived);
      // Freshness floor for established tools
      if ((skill.gh_stars ?? 0) >= 200 && freshness < 0.3) {
        freshness = 0.3;
      }
      const issueHealth = computeIssueHealth(skill.gh_open_issues ?? 0, skill.gh_closed_issues ?? 0);
      const starsNorm = logNormalize(skill.gh_stars, maxStars);
      const contribNorm = logNormalize(skill.gh_contributors ?? 0, maxContributors);

      score = (
        installsNorm * 0.30 +
        freshness * 0.20 +
        issueHealth * 0.15 +
        starsNorm * 0.10 +
        platformBreadth * 0.10 +
        contribNorm * 0.10 +
        descQuality * 0.05
      );
      ghFromSkill++;
    } else {
      // Registry-only: impute neutral for freshness/issue health, 0 for stars/contributors
      score = (
        installsNorm * 0.30 +
        0.5 * 0.20 +           // freshness: neutral
        0.5 * 0.15 +           // issue health: neutral (same default as "no issues")
        0.0 * 0.10 +           // stars: no evidence
        platformBreadth * 0.10 +
        0.0 * 0.10 +           // contributors: no evidence
        descQuality * 0.05
      );
      registryOnly++;
    }

    scored.push({ id: skill.id, score: Math.round(score * 100 * 100) / 100 });
  }

  console.log(`GitHub from repos: ${ghFromRepo}, from skill enrichment: ${ghFromSkill}, registry-only: ${registryOnly}`);

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Write scores and ranks to DB
  const updateStmt = db.prepare("UPDATE skills SET score = ?, rank = ? WHERE id = ?");
  const updateMany = db.transaction(() => {
    for (let i = 0; i < scored.length; i++) {
      updateStmt.run(scored[i].score, i + 1, scored[i].id);
    }
  });
  updateMany();

  // Export ranked-skills.json (top 500)
  const rankedSkills = db
    .prepare("SELECT * FROM skills WHERE rank IS NOT NULL ORDER BY rank ASC LIMIT 500")
    .all() as (SkillRow & { score: number; rank: number })[];

  const output = rankedSkills.map((s) => ({
    rank: s.rank,
    slug: s.slug,
    name: s.name,
    description: s.description,
    score: s.score,
    installs: s.installs,
    platforms: JSON.parse(s.platforms),
    source: s.source,
    github_repo: s.github_repo,
    author: s.author,
    trending_rank: s.trending_rank,
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\nSkills scoring complete.`);
  console.log(`Output: ${OUTPUT_PATH} (${output.length} skills)`);
  console.log(`\nTop 20 skills:`);
  for (const s of output.slice(0, 20)) {
    console.log(`  #${s.rank.toString().padStart(4)} ${s.score.toString().padStart(6)} | ${s.installs.toString().padStart(8)} installs | ${s.slug}`);
  }

  db.close();
}

function findRepo(
  skill: SkillRow,
  byName: Map<string, RepoRow>,
  byUrl: Map<string, RepoRow>
): RepoRow | undefined {
  if (!skill.github_repo) return undefined;

  // Try direct full_name match
  const direct = byName.get(skill.github_repo);
  if (direct) return direct;

  // Try URL match
  const byUrlMatch = byUrl.get(skill.github_repo);
  if (byUrlMatch) return byUrlMatch;

  // Try extracting full_name from URL
  const ghMatch = skill.github_repo.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
  if (ghMatch) {
    return byName.get(ghMatch[1]);
  }

  return undefined;
}
