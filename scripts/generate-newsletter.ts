/**
 * generate-newsletter.ts
 *
 * Generates a weekly AgentRank newsletter draft from D1 (remote) or local data.
 *
 * Usage:
 *   npx tsx scripts/generate-newsletter.ts
 *   npx tsx scripts/generate-newsletter.ts --issue 7 --week "April 16, 2026"
 *
 * Reads:
 *   - data/weekly/{latest-date}.json   (top10, gainers, losers, new_entries, stats)
 *   - D1 remote: skills table          (category breakdown, top tools by category)
 *
 * Writes:
 *   - agents/growth-engineer/newsletters/newsletter-{NNN}.md
 *
 * The output is a draft for Steve to review — never send directly.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NEWSLETTERS_DIR = join(ROOT, 'agents/growth-engineer/newsletters');
const WEEKLY_DIR = join(ROOT, 'data/weekly');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let issueOverride: number | null = null;
let weekOverride: string | null = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--issue' && args[i + 1]) issueOverride = parseInt(args[i + 1], 10);
  if (args[i] === '--week' && args[i + 1]) weekOverride = args[i + 1];
}

// ---------------------------------------------------------------------------
// Determine next issue number
// ---------------------------------------------------------------------------

function getNextIssueNumber(): number {
  if (issueOverride) return issueOverride;
  if (!existsSync(NEWSLETTERS_DIR)) return 2;
  const existing = readdirSync(NEWSLETTERS_DIR)
    .filter(f => /^newsletter-\d{3}\.md$/.test(f))
    .map(f => parseInt(f.replace('newsletter-', '').replace('.md', ''), 10))
    .sort((a, b) => b - a);
  return existing.length > 0 ? existing[0] + 1 : 2;
}

// ---------------------------------------------------------------------------
// Load latest weekly data
// ---------------------------------------------------------------------------

function loadWeeklyData(): Record<string, any> {
  const files = readdirSync(WEEKLY_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse();
  if (files.length === 0) throw new Error('No weekly data files found in data/weekly/');
  const latest = files[0];
  console.error(`Using weekly data: ${latest}`);
  return JSON.parse(readFileSync(join(WEEKLY_DIR, latest), 'utf-8'));
}

// ---------------------------------------------------------------------------
// Query D1 remote for category stats and top tools
// ---------------------------------------------------------------------------

interface D1Row {
  [key: string]: string | number | null;
}

function queryD1(sql: string): D1Row[] {
  try {
    const cmd = `npx wrangler d1 execute agentrank-db --remote --command "${sql.replace(/"/g, '\\"')}" 2>/dev/null`;
    const output = execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 });
    // Extract JSON array from wrangler output
    const match = output.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return parsed[0]?.results ?? [];
  } catch {
    return [];
  }
}

function getCategoryStats(): Array<{ category: string; cnt: number }> {
  return queryD1('SELECT category, COUNT(*) as cnt FROM skills GROUP BY category ORDER BY cnt DESC LIMIT 12') as any;
}

function getTopToolsByCategory(category: string, limit = 5): D1Row[] {
  return queryD1(
    `SELECT slug, name, score, rank, gh_stars, installs FROM skills WHERE category='${category}' ORDER BY score DESC LIMIT ${limit}`
  );
}

function getTopByInstalls(limit = 10): D1Row[] {
  return queryD1(
    `SELECT slug, name, installs, score, rank, category FROM skills WHERE installs > 0 ORDER BY installs DESC LIMIT ${limit}`
  );
}

function getTotalSkillCount(): number {
  const rows = queryD1('SELECT COUNT(*) as cnt FROM skills');
  return (rows[0]?.cnt as number) ?? 0;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function toolUrl(slug: string): string {
  return `https://agentrank-ai.com/tool/${slug.replace('glama:', 'glama/')}`;
}

function toolName(row: D1Row): string {
  const n = row.name as string;
  // Clean up "X by Y" patterns from Glama
  return n?.replace(/ by .+$/, '') ?? (row.slug as string).split('/').pop() ?? String(row.slug);
}

// ---------------------------------------------------------------------------
// Generate newsletter markdown
// ---------------------------------------------------------------------------

function generateNewsletter(issueNum: number, weekLabel: string, weekly: Record<string, any>): string {
  const paddedNum = String(issueNum).padStart(3, '0');
  const today = new Date().toISOString().split('T')[0];

  const stats = weekly.stats ?? {};
  const top10: any[] = weekly.top10 ?? [];
  const gainers: any[] = (weekly.gainers ?? []).slice(0, 5);
  const newEntries: any[] = (weekly.new_entries ?? []).slice(0, 5);

  // D1 live data
  const totalSkills = getTotalSkillCount();
  const categoryStats = getCategoryStats();
  const topMcpServers = getTopToolsByCategory('mcp-server', 5);
  const topByInstalls = getTopByInstalls(8);

  // Top 10 table
  const top10Rows = top10.slice(0, 10).map((t: any) =>
    `| ${t.rank} | [${t.full_name}](https://agentrank-ai.com/tool/${t.full_name}) | ${t.score.toFixed(1)} | ${fmtNum(t.stars)} | ${t.language ?? '—'} |`
  ).join('\n');

  // Gainers table
  const gainersRows = gainers.length > 0
    ? gainers.map((g: any) =>
        `| ${g.name ?? g.identifier} | +${g.score_change.toFixed(1)} pts | #${g.previous_rank} → #${g.current_rank} |`
      ).join('\n')
    : '| — | No significant movers this week | — |';

  // New entries section
  const newEntriesSection = newEntries.length > 0
    ? `### New tools entering the index\n\n${newEntries.map((e: any) => `- **${e.name ?? e.identifier}** — score ${e.score.toFixed(1)} at entry`).join('\n')}\n\n`
    : '';

  // Category breakdown
  const categoryRows = categoryStats.slice(0, 8).map((c: any) =>
    `| ${c.category} | ${c.cnt} |`
  ).join('\n');

  // Top MCP servers
  const mcpRows = topMcpServers.slice(0, 5).map((t: any, i: number) =>
    `| ${i + 1} | [${toolName(t)}](${toolUrl(t.slug as string)}) | ${(t.score as number).toFixed(1)} | ${fmtNum(t.gh_stars as number)} | ${fmtNum(t.installs as number)} |`
  ).join('\n');

  // Top by installs
  const installRows = topByInstalls.slice(0, 8).map((t: any) =>
    `| [${toolName(t)}](${toolUrl(t.slug as string)}) | ${fmtNum(t.installs as number)} | ${fmtNum(t.gh_stars as number)} | ${(t.score as number).toFixed(1)} |`
  ).join('\n');

  return `# AgentRank Newsletter #${issueNum} — Draft

> **STATUS: DRAFT — Do NOT send. Steve must approve before sending.**

Generated: ${today}

---

## Subject Line Options

1. \`The top 10 MCP tools this week — week of ${weekLabel}\`
2. \`${top10[0]?.full_name ?? 'Top tool'}: still #1. Here's who moved.\`
3. \`AgentRank #${issueNum}: This week's leaderboard + biggest movers\`

**Recommended:** Option 2.

---

## Preview Text

\`${gainers[0] ? `${gainers[0].name ?? gainers[0].identifier} jumped ${gainers[0].rank_change} spots. ` : ''}${totalSkills.toLocaleString()} tools tracked. Here's what changed.\`

---

## Body

---

**AgentRank** | Issue #${issueNum} | Week of ${weekLabel}

---

### This week's leaderboard

The index tracks ${(stats.total_tools ?? 0).toLocaleString()} repos and ${totalSkills.toLocaleString()} skills. Scores update daily.

| # | Tool | Score | Stars | Language |
|---|------|-------|-------|----------|
${top10Rows}

---

### Biggest movers

Score changes from the past 7 days.

| Tool | Score Change | Rank Change |
|------|-------------|-------------|
${gainersRows}

---

${newEntriesSection}### Top MCP servers (by score)

| # | Server | Score | Stars | Installs |
|---|--------|-------|-------|---------|
${mcpRows}

---

### Most-installed tools

Install counts from Glama. Stars shown for comparison — the gaps are instructive.

| Tool | Installs | Stars | Score |
|------|----------|-------|-------|
${installRows}

---

### Ecosystem snapshot

| Category | Tools tracked |
|----------|---------------|
${categoryRows}

Total across all categories: **${totalSkills.toLocaleString()} skills** tracked.

---

### Full rankings

Every tool, every score, updated daily: [agentrank-ai.com](https://agentrank-ai.com)

---

You're receiving this because you signed up for AgentRank updates.
[Unsubscribe](#) | [View in browser](#)

---

*AgentRank indexes ${(stats.total_tools ?? 0).toLocaleString()}+ GitHub repos and ${totalSkills.toLocaleString()}+ skills. Scores update daily.*
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(NEWSLETTERS_DIR)) {
    mkdirSync(NEWSLETTERS_DIR, { recursive: true });
  }

  const issueNum = getNextIssueNumber();
  const weekly = loadWeeklyData();

  const weekDate = weekly.date ?? new Date().toISOString().split('T')[0];
  const weekLabel = weekOverride ?? new Date(weekDate + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  console.error(`Generating newsletter #${issueNum} for week of ${weekLabel}...`);

  const content = generateNewsletter(issueNum, weekLabel, weekly);
  const paddedNum = String(issueNum).padStart(3, '0');
  const outPath = join(NEWSLETTERS_DIR, `newsletter-${paddedNum}.md`);

  writeFileSync(outPath, content, 'utf-8');
  console.log(outPath);
  console.error(`Done. Saved to ${outPath}`);
  console.error('REMINDER: This is a draft. Steve must approve before sending.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
