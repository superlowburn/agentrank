/**
 * Standalone dependents backfill script.
 *
 * Fetches GitHub dependents counts for repos ordered by stars (highest first).
 * Skips repos that already have dependents > 0.
 *
 * Usage:
 *   npx tsx src/crawl-dependents.ts                    # Default: top 1000, min 5 stars
 *   npx tsx src/crawl-dependents.ts --limit=500        # First 500
 *   npx tsx src/crawl-dependents.ts --min-stars=100    # Only repos with 100+ stars
 *   npx tsx src/crawl-dependents.ts --offset=1000      # Skip first 1000 (for resuming)
 */

import { initDb, getReposForDependents, updateDependents, closeDb } from "./db.js";
import { getDependentsCount, sleep, randomDelay } from "./dependents.js";

function parseArgs(): { limit: number; offset: number; minStars: number } {
  const args = process.argv.slice(2);
  let limit = 1000;
  let offset = 0;
  let minStars = 5;

  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, "").split("=");
    if (key === "limit") limit = parseInt(val, 10);
    if (key === "offset") offset = parseInt(val, 10);
    if (key === "min-stars") minStars = parseInt(val, 10);
  }

  return { limit, offset, minStars };
}

async function main() {
  const { limit, offset, minStars } = parseArgs();

  console.log(`[dependents] Starting backfill: limit=${limit}, offset=${offset}, min-stars=${minStars}`);

  initDb();

  const repos = getReposForDependents(limit, offset, minStars);
  console.log(`[dependents] Found ${repos.length} repos to process (dependents=0, stars>=${minStars})`);

  if (repos.length === 0) {
    console.log("[dependents] Nothing to do.");
    closeDb();
    return;
  }

  let processed = 0;
  let withDependents = 0;
  let backoffCount = 0;
  const MAX_BACKOFFS = 3;

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];

    // Progress logging every 25 repos
    if (i % 25 === 0) {
      console.log(
        `[dependents] ${i + 1}/${repos.length}: ${repo.full_name}` +
        ` (${repo.stars} stars) — found ${withDependents} with dependents so far`
      );
    }

    try {
      const result = await getDependentsCount(repo.full_name);

      if (result.rateLimited) {
        backoffCount++;
        const backoffMs = 60_000 * Math.pow(2, backoffCount - 1); // 60s, 120s, 240s
        console.warn(
          `[dependents] Rate limited on ${repo.full_name}. Backoff ${backoffCount}/${MAX_BACKOFFS}: waiting ${backoffMs / 1000}s`
        );

        if (backoffCount >= MAX_BACKOFFS) {
          console.error(`[dependents] Too many rate limits. Stopping after ${processed} repos.`);
          break;
        }

        await sleep(backoffMs);
        // Retry this repo
        i--;
        continue;
      }

      // Reset backoff counter on success
      backoffCount = 0;

      if (result.count > 0) {
        updateDependents(repo.full_name, result.count);
        withDependents++;
      }

      processed++;
    } catch (err) {
      console.warn(`[dependents] Error fetching ${repo.full_name}: ${(err as Error).message}`);
    }

    // Randomized delay
    if (i < repos.length - 1) {
      await sleep(randomDelay());
    }
  }

  console.log(`[dependents] Backfill complete.`);
  console.log(`[dependents]   Processed: ${processed}/${repos.length}`);
  console.log(`[dependents]   With dependents: ${withDependents}`);

  closeDb();
}

main().catch((err) => {
  console.error("[dependents] Fatal error:", err);
  process.exit(1);
});
