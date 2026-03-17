/**
 * Movers generator
 *
 * Compares current scores/ranks against a ~7-day-old snapshot
 * and exports data/movers.json for the site to consume.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../data/agentrank.db");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/movers.json");

interface SnapshotRow {
  identifier: string;
  score: number;
  rank: number;
}

interface Mover {
  identifier: string;
  name: string | null;
  current_score: number;
  previous_score: number;
  score_change: number;
  current_rank: number;
  previous_rank: number;
  rank_change: number;
}

interface NewEntry {
  identifier: string;
  name: string | null;
  score: number;
  rank: number;
}

interface MoversCategory {
  gainers: Mover[];
  losers: Mover[];
  new_entries: NewEntry[];
}

interface MoversOutput {
  generated_at: string;
  comparison_date: string | null;
  days_span: number | null;
  has_data: boolean;
  tools: MoversCategory;
  skills: MoversCategory;
}

function emptyCategory(): MoversCategory {
  return { gainers: [], losers: [], new_entries: [] };
}

export function generateMovers(): void {
  console.log("Movers generator starting...\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const today = new Date().toISOString().slice(0, 10);

  // Find the most recent snapshot older than today (best available comparison baseline)
  const comparisonRow = db.prepare(`
    SELECT DISTINCT snapshot_date
    FROM score_snapshots
    WHERE snapshot_date < ?
    ORDER BY snapshot_date DESC
    LIMIT 1
  `).get(today) as { snapshot_date: string } | undefined;

  if (!comparisonRow) {
    console.log("No comparison snapshot found. Writing empty movers data.");
    const output: MoversOutput = {
      generated_at: new Date().toISOString(),
      comparison_date: null,
      days_span: null,
      has_data: false,
      tools: emptyCategory(),
      skills: emptyCategory(),
    };
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    db.close();
    return;
  }

  const comparisonDate = comparisonRow.snapshot_date;
  const daysSpan = Math.round(
    (new Date(today).getTime() - new Date(comparisonDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  console.log(`Comparing against snapshot from ${comparisonDate} (${daysSpan} days ago)`);

  // Build movers for tools
  const toolMovers = buildMovers(db, "tool", comparisonDate);

  // Build movers for skills
  const skillMovers = buildMovers(db, "skill", comparisonDate);

  const output: MoversOutput = {
    generated_at: new Date().toISOString(),
    comparison_date: comparisonDate,
    days_span: daysSpan,
    has_data: true,
    tools: toolMovers,
    skills: skillMovers,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  // Prune snapshots older than 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const pruned = db.prepare("DELETE FROM score_snapshots WHERE snapshot_date < ?").run(cutoffStr);
  if (pruned.changes > 0) {
    console.log(`Pruned ${pruned.changes} snapshot rows older than ${cutoffStr}`);
  }

  console.log(`\nMovers data written to ${OUTPUT_PATH}`);
  console.log(`  Tools: ${toolMovers.gainers.length} gainers, ${toolMovers.losers.length} losers, ${toolMovers.new_entries.length} new`);
  console.log(`  Skills: ${skillMovers.gainers.length} gainers, ${skillMovers.losers.length} losers, ${skillMovers.new_entries.length} new`);

  db.close();
}

function buildMovers(
  db: Database.Database,
  type: "tool" | "skill",
  comparisonDate: string
): MoversCategory {
  // Get snapshot data
  const snapshotRows = db.prepare(
    "SELECT identifier, score, rank FROM score_snapshots WHERE snapshot_date = ? AND type = ?"
  ).all(comparisonDate, type) as SnapshotRow[];

  const snapshotMap = new Map<string, SnapshotRow>();
  for (const row of snapshotRows) {
    snapshotMap.set(row.identifier, row);
  }

  // Get current data
  let currentRows: Array<{ identifier: string; name: string | null; score: number; rank: number }>;
  if (type === "tool") {
    currentRows = db.prepare(
      "SELECT full_name as identifier, full_name as name, score, rank FROM repos WHERE score IS NOT NULL AND rank IS NOT NULL ORDER BY rank"
    ).all() as Array<{ identifier: string; name: string | null; score: number; rank: number }>;
  } else {
    currentRows = db.prepare(
      "SELECT slug as identifier, name, score, rank FROM skills WHERE score IS NOT NULL AND rank IS NOT NULL ORDER BY rank"
    ).all() as Array<{ identifier: string; name: string | null; score: number; rank: number }>;
  }

  const movers: Mover[] = [];
  const newEntries: NewEntry[] = [];

  for (const current of currentRows) {
    const prev = snapshotMap.get(current.identifier);
    if (!prev) {
      newEntries.push({
        identifier: current.identifier,
        name: current.name,
        score: current.score,
        rank: current.rank,
      });
    } else {
      const scoreChange = Math.round((current.score - prev.score) * 100) / 100;
      const rankChange = prev.rank - current.rank; // positive = moved up
      if (scoreChange !== 0) {
        movers.push({
          identifier: current.identifier,
          name: current.name,
          current_score: current.score,
          previous_score: prev.score,
          score_change: scoreChange,
          current_rank: current.rank,
          previous_rank: prev.rank,
          rank_change: rankChange,
        });
      }
    }
  }

  // Sort gainers by score_change descending, losers by score_change ascending
  const gainers = movers
    .filter((m) => m.score_change > 0)
    .sort((a, b) => b.score_change - a.score_change)
    .slice(0, 20);

  const losers = movers
    .filter((m) => m.score_change < 0)
    .sort((a, b) => a.score_change - b.score_change)
    .slice(0, 20);

  return { gainers, losers, new_entries: newEntries };
}
