import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { computeSignals, type RepoData } from "./signals.js";
import { normalizeSignals } from "./normalize.js";
import { getWeights, weightedScore } from "./weights.js";
import { scoreSkills } from "./skills-scorer.js";
import { generateMovers } from "./movers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../data/agentrank.db");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/ranked.json");

interface DbRepo extends RepoData {
  id: number;
  full_name: string;
  url: string;
  language: string | null;
  matched_queries: string;
}

function main(): void {
  console.log("AgentRank Scorer starting...\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Create score_snapshots table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS score_snapshots (
      snapshot_date TEXT NOT NULL,
      type TEXT NOT NULL,
      identifier TEXT NOT NULL,
      score REAL NOT NULL,
      rank INTEGER NOT NULL,
      PRIMARY KEY (snapshot_date, type, identifier)
    )
  `);

  // Snapshot current tool scores before re-scoring (idempotent: skip if today's snapshot exists)
  const today = new Date().toISOString().slice(0, 10);
  const existingSnapshot = db.prepare(
    "SELECT 1 FROM score_snapshots WHERE snapshot_date = ? AND type = 'tool' LIMIT 1"
  ).get(today);

  if (!existingSnapshot) {
    const toolsWithScores = db.prepare(
      "SELECT full_name, score, rank FROM repos WHERE score IS NOT NULL AND rank IS NOT NULL"
    ).all() as Array<{ full_name: string; score: number; rank: number }>;

    if (toolsWithScores.length > 0) {
      const insertSnapshot = db.prepare(
        "INSERT OR IGNORE INTO score_snapshots (snapshot_date, type, identifier, score, rank) VALUES (?, 'tool', ?, ?, ?)"
      );
      const snapshotMany = db.transaction(() => {
        for (const t of toolsWithScores) {
          insertSnapshot.run(today, t.full_name, t.score, t.rank);
        }
      });
      snapshotMany();
      console.log(`Snapshotted ${toolsWithScores.length} tool scores for ${today}`);
    }
  }

  const repos = db.prepare("SELECT * FROM repos").all() as DbRepo[];
  console.log(`Scoring ${repos.length} repos`);

  if (repos.length === 0) {
    console.log("No repos to score. Run the crawler first.");
    db.close();
    return;
  }

  // Compute raw signals
  const rawSignals = repos.map((repo) => ({
    id: repo.id,
    signals: computeSignals(repo),
  }));

  // Find maxes for normalization
  const maxStars = Math.max(...rawSignals.map((r) => r.signals.stars));
  const maxContributors = Math.max(...rawSignals.map((r) => r.signals.contributors));
  const maxDependents = Math.max(...rawSignals.map((r) => r.signals.dependents));
  const hasDependents = maxDependents > 0;
  const weights = getWeights(hasDependents);

  console.log(`Max stars: ${maxStars}, max contributors: ${maxContributors}, max dependents: ${maxDependents}`);
  console.log(`Weights:`, weights);

  // Normalize and score
  const scored = rawSignals.map((r) => {
    const normalized = normalizeSignals(r.signals, maxStars, maxContributors, maxDependents);
    const score = Math.round(weightedScore(normalized, weights) * 100 * 100) / 100; // 0-100, 2 decimal places
    return { id: r.id, score, signals: normalized };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Write scores and ranks to DB
  const updateStmt = db.prepare("UPDATE repos SET score = ?, rank = ? WHERE id = ?");
  const updateMany = db.transaction(() => {
    for (let i = 0; i < scored.length; i++) {
      updateStmt.run(scored[i].score, i + 1, scored[i].id);
    }
  });
  updateMany();

  // Export ranked.json
  const rankedRepos = db
    .prepare("SELECT * FROM repos WHERE rank IS NOT NULL ORDER BY rank ASC")
    .all() as (DbRepo & { score: number; rank: number })[];

  const output = rankedRepos.map((r) => ({
    rank: r.rank,
    full_name: r.full_name,
    url: r.url,
    description: r.description,
    score: r.score,
    stars: r.stars,
    forks: r.forks,
    open_issues: r.open_issues,
    closed_issues: r.closed_issues,
    contributors: r.contributors,
    dependents: r.dependents,
    language: r.language,
    license: r.license,
    last_commit_at: r.last_commit_at,
    is_archived: r.is_archived === 1,
    matched_queries: JSON.parse(r.matched_queries),
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\nScoring complete.`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`\nTop 20:`);
  for (const r of output.slice(0, 20)) {
    console.log(`  #${r.rank.toString().padStart(4)} ${r.score.toString().padStart(6)} | ${r.stars.toString().padStart(6)} stars | ${r.full_name}`);
  }

  db.close();

  // Score skills
  console.log("\n" + "=".repeat(50));
  scoreSkills();

  // Generate movers data
  console.log("\n" + "=".repeat(50));
  generateMovers();
}

main();
