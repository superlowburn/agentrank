/**
 * Select the Tool of the Day.
 * Picks the highest-ranked tool not featured in the last 30 days.
 * Writes today's selection to data/tool-of-the-day.json.
 *
 * Usage: node scripts/select-tool-of-day.mjs [--date YYYY-MM-DD] [--force]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RANKED_PATH = join(ROOT, 'data/ranked.json');
const TOTD_PATH = join(ROOT, 'data/tool-of-the-day.json');

const args = process.argv.slice(2);
const forceDateIdx = args.indexOf('--date');
const forceFlag = args.includes('--force');
const today = forceDateIdx >= 0 ? args[forceDateIdx + 1] : new Date().toISOString().slice(0, 10);

const ranked = JSON.parse(readFileSync(RANKED_PATH, 'utf-8'));
const history = JSON.parse(readFileSync(TOTD_PATH, 'utf-8'));

if (history[today] && !forceFlag) {
  console.log(`Already set for ${today}: ${history[today]}`);
  process.exit(0);
}

// Collect tools featured in the last 30 days (excluding today so --force works)
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const recentFeatured = new Set(
  Object.entries(history)
    .filter(([date]) => date !== today && new Date(date) >= thirtyDaysAgo)
    .map(([, name]) => name)
);

// Pick the highest-ranked tool not recently featured
const candidate = ranked.find(
  (t) => !t.is_archived && t.description && !recentFeatured.has(t.full_name)
);

if (!candidate) {
  console.error('No eligible candidate found');
  process.exit(1);
}

history[today] = candidate.full_name;

// Prune entries older than 60 days to keep the file lean
const sixtyDaysAgo = new Date(today);
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
for (const date of Object.keys(history)) {
  if (new Date(date) < sixtyDaysAgo) delete history[date];
}

writeFileSync(TOTD_PATH, JSON.stringify(history, null, 2) + '\n');
console.log(`Selected for ${today}: ${candidate.full_name} (score: ${candidate.score?.toFixed(1)})`);
