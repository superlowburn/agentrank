/**
 * AgentRank Cron Snapshot Worker
 *
 * Runs on two schedules:
 *   - Daily 06:00 UTC  — snapshot current rankings into rank_history
 *   - Monday 14:00 UTC — also generate weekly tweet content (movers, new tools, top 10)
 *
 * The tweet content is read by the local tweet-bot.ts via the /api/v1/movers
 * and /api/v1/new-tools endpoints, then posted via Playwright.
 */

export interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  DASH_TOKEN?: string;
  UNSUB_SECRET?: string;
  GITHUB_TOKEN?: string;
}

// ---------------------------------------------------------------------------
// Skill install tracking — fetch AgentRank's own install count from skills.sh
// ---------------------------------------------------------------------------

const SKILLS_SH_SLUGS = [
  // Our own skill listing on skills.sh (source/skillId format)
  // Adjust if the slug changes after submission
  "agentrank-ai/agentrank",
];

async function fetchSkillInstalls(slug: string): Promise<number | null> {
  // The skills.sh leaderboard embeds skill data as RSC streaming JSON
  // Extract install count for our specific skill
  const url = `https://skills.sh/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AgentRank/1.0 (https://agentrank-ai.com)" },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Try meta tag with total installs first
    const installsMatch = html.match(/"installs"\s*:\s*(\d+)/);
    if (installsMatch?.[1]) {
      return parseInt(installsMatch[1], 10);
    }

    // Fallback: look for install count patterns in RSC payload
    const countMatch = html.match(/(\d{1,8})\s+(?:total\s+)?installs?/i);
    if (countMatch?.[1]) {
      return parseInt(countMatch[1], 10);
    }

    return null;
  } catch {
    return null;
  }
}

async function checkpointSkillInstalls(db: D1Database): Promise<void> {
  for (const slug of SKILLS_SH_SLUGS) {
    const installs = await fetchSkillInstalls(slug);
    if (installs === null) {
      console.log(`[cron-snapshot] Could not fetch install count for ${slug} (skill may not be listed yet)`);
      continue;
    }

    // Only record if value changed since the last checkpoint
    const last = await db
      .prepare(`SELECT installs FROM install_checkpoints WHERE slug = ? ORDER BY checked_at DESC LIMIT 1`)
      .bind(slug)
      .first<{ installs: number }>();

    if (last && last.installs === installs) {
      console.log(`[cron-snapshot] ${slug} installs unchanged at ${installs}`);
      continue;
    }

    await db
      .prepare(`INSERT INTO install_checkpoints (slug, source, installs) VALUES (?, 'skills.sh', ?)`)
      .bind(slug, installs)
      .run();

    console.log(`[cron-snapshot] ${slug} installs: ${last?.installs ?? 'new'} → ${installs}`);
  }
}

// GitHub org/user -> Twitter handle mapping (keep in sync with tweet-bot.ts)
const TWITTER_HANDLES: Record<string, string> = {
  PrefectHQ: "@PrefectIO",
  mark3labs: "@mark3labs",
  laravel: "@laravelphp",
  modelcontextprotocol: "@AnthropicAI",
  punkpeye: "@punkpeye",
  microsoft: "@microsoft",
  "browser-use": "@browser_use",
  vercel: "@vercel",
  supabase: "@supabase",
  cloudflare: "@Cloudflare",
};

function twitterHandle(slug: string): string {
  const org = slug.split("/")[0];
  return TWITTER_HANDLES[org] || `@${org}`;
}

function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// --- Step 1: Snapshot current rankings into rank_history ---

async function snapshotRankings(db: D1Database, date: string): Promise<number> {
  // Snapshot tools
  const tools = await db
    .prepare(
      `SELECT full_name, rank, score, stars
       FROM tools
       WHERE rank IS NOT NULL AND score IS NOT NULL
       ORDER BY rank ASC
       LIMIT 2000`
    )
    .all();

  const skills = await db
    .prepare(
      `SELECT slug AS full_name, rank, score, gh_stars AS stars
       FROM skills
       WHERE rank IS NOT NULL AND score IS NOT NULL
       ORDER BY rank ASC
       LIMIT 2000`
    )
    .all();

  let inserted = 0;

  const batchSize = 50;
  const allRows = [
    ...(tools.results || []).map((r) => ({ ...r, type: "tool" })),
    ...(skills.results || []).map((r) => ({ ...r, type: "skill" })),
  ];

  for (let i = 0; i < allRows.length; i += batchSize) {
    const batch = allRows.slice(i, i + batchSize);
    const stmts = batch.map((r) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO rank_history (snapshot_date, tool_full_name, tool_type, rank, score, stars)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          date,
          r.full_name as string,
          r.type as string,
          r.rank as number,
          r.score as number,
          (r.stars as number) ?? 0
        )
    );
    const results = await db.batch(stmts);
    inserted += results.reduce((sum, r) => sum + (r.meta?.changes ?? 0), 0);
  }

  return inserted;
}

// --- Step 1b: Snapshot component-level scores into score_history ---

function computeFreshnessScore(lastCommitAt: string | null, isArchived: number): number {
  if (isArchived) return 0;
  if (!lastCommitAt) return 0;
  const days = (Date.now() - new Date(lastCommitAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 7) return 1.0;
  if (days <= 90) return 1.0 - (days - 7) / (90 - 7);
  return Math.max(0, Math.exp(-(days - 90) / 90) * 0.1);
}

async function snapshotScoreHistory(db: D1Database, date: string): Promise<number> {
  const tools = await db
    .prepare(
      `SELECT full_name, score, stars, open_issues, closed_issues, contributors, dependents, last_commit_at, is_archived
       FROM tools WHERE score IS NOT NULL ORDER BY rank ASC LIMIT 5000`
    )
    .all();

  const rows = (tools.results || []) as Array<{
    full_name: string;
    score: number;
    stars: number;
    open_issues: number;
    closed_issues: number;
    contributors: number;
    dependents: number;
    last_commit_at: string | null;
    is_archived: number;
  }>;

  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const stmts = batch.map((r) => {
      const freshness = computeFreshnessScore(r.last_commit_at, r.is_archived);
      const total = (r.open_issues ?? 0) + (r.closed_issues ?? 0);
      const issueHealth = total === 0 ? 0.3 : (r.closed_issues ?? 0) / total;
      const dependentScore = Math.min(
        1,
        (r.dependents ?? 0) > 0 ? Math.log(1 + r.dependents) / Math.log(1 + 100000) : 0
      );

      return db
        .prepare(
          `INSERT OR IGNORE INTO score_history
             (tool_slug, tool_type, score, stars, freshness_score, issue_health, contributors, dependent_score, recorded_at)
           VALUES (?, 'tool', ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          r.full_name,
          r.score,
          r.stars ?? 0,
          Math.round(freshness * 1000) / 1000,
          Math.round(issueHealth * 1000) / 1000,
          r.contributors ?? 0,
          Math.round(dependentScore * 1000) / 1000,
          date
        );
    });

    const results = await db.batch(stmts);
    inserted += results.reduce((sum, r) => sum + (r.meta?.changes ?? 0), 0);
  }

  return inserted;
}

// --- Step 2: Compute biggest movers (rank delta over last 7 days) ---

interface Mover {
  full_name: string;
  tool_type: string;
  current_rank: number;
  prev_rank: number;
  rank_delta: number; // positive = gained, negative = dropped
  current_score: number;
}

async function getBiggestMovers(db: D1Database, today: string): Promise<Mover[]> {
  // Get date 7 days ago
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 7);
  const prevDate = utcDateString(d);

  const result = await db
    .prepare(
      `SELECT
         cur.tool_full_name AS full_name,
         cur.tool_type,
         cur.rank AS current_rank,
         prev.rank AS prev_rank,
         (prev.rank - cur.rank) AS rank_delta,
         cur.score AS current_score
       FROM rank_history cur
       JOIN rank_history prev
         ON cur.tool_full_name = prev.tool_full_name
        AND cur.tool_type = prev.tool_type
        AND prev.snapshot_date = ?1
       WHERE cur.snapshot_date = ?2
         AND cur.rank <= 500
         AND prev.rank <= 500
         AND ABS(prev.rank - cur.rank) >= 3
       ORDER BY ABS(prev.rank - cur.rank) DESC
       LIMIT 20`
    )
    .bind(prevDate, today)
    .all();

  return (result.results || []) as Mover[];
}

// --- Step 3: Find newly added tools (first appeared in last 7 days) ---

interface NewTool {
  full_name: string;
  tool_type: string;
  rank: number;
  score: number;
  stars: number;
}

async function getNewTools(db: D1Database, today: string): Promise<NewTool[]> {
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 7);
  const cutoff = utcDateString(d);

  // Tools that appear in rank_history for today but NOT before the cutoff
  const result = await db
    .prepare(
      `SELECT
         cur.tool_full_name AS full_name,
         cur.tool_type,
         cur.rank,
         cur.score,
         cur.stars
       FROM rank_history cur
       WHERE cur.snapshot_date = ?1
         AND NOT EXISTS (
           SELECT 1 FROM rank_history old
           WHERE old.tool_full_name = cur.tool_full_name
             AND old.tool_type = cur.tool_type
             AND old.snapshot_date < ?2
         )
       ORDER BY cur.score DESC
       LIMIT 50`
    )
    .bind(today, cutoff)
    .all();

  return (result.results || []) as NewTool[];
}

// ---------------------------------------------------------------------------
// ISO week helpers
// ---------------------------------------------------------------------------

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Set to nearest Thursday: current date + 4 - current day number, make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

function getWeekSlug(date: Date): string {
  const { week, year } = getISOWeek(date);
  return `week-${year}-w${String(week).padStart(2, '0')}`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

// ---------------------------------------------------------------------------
// Weekly ecosystem report — generated on Mondays, stored in weekly_reports
// ---------------------------------------------------------------------------

async function generateWeeklyReport(db: D1Database, today: string): Promise<void> {
  const date = new Date(today + 'T00:00:00Z');
  const monday = getMondayOf(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = sunday.toISOString().slice(0, 10);
  const { week, year } = getISOWeek(monday);
  const id = getWeekSlug(monday);

  // Check if already generated for this week
  const existing = await db.prepare('SELECT id FROM weekly_reports WHERE id = ?').bind(id).first();
  if (existing) {
    console.log(`[cron-snapshot] generateWeeklyReport: ${id} already exists, skipping`);
    return;
  }

  const d7Ago = new Date(today + 'T00:00:00Z');
  d7Ago.setUTCDate(d7Ago.getUTCDate() - 7);
  const prevDate = d7Ago.toISOString().slice(0, 10);

  // 1. Top 10 tools
  const top10Result = await db
    .prepare('SELECT full_name, rank, score, stars, category FROM tools WHERE rank IS NOT NULL ORDER BY rank ASC LIMIT 10')
    .all<{ full_name: string; rank: number; score: number; stars: number; category: string | null }>();
  const top10 = top10Result.results ?? [];

  // 2. Total tool count
  const countResult = await db
    .prepare('SELECT COUNT(*) as n FROM tools WHERE score IS NOT NULL')
    .first<{ n: number }>();
  const totalTools = countResult?.n ?? 0;

  // 3. Biggest movers (top 5 gainers + top 5 losers)
  const moversResult = await db
    .prepare(`
      SELECT cur.tool_full_name AS full_name, cur.tool_type,
             cur.rank AS current_rank, prev.rank AS prev_rank,
             (prev.rank - cur.rank) AS rank_delta,
             cur.score AS current_score, cur.stars
      FROM rank_history cur
      JOIN rank_history prev
        ON cur.tool_full_name = prev.tool_full_name
       AND cur.tool_type = prev.tool_type
       AND prev.snapshot_date = ?1
      WHERE cur.snapshot_date = ?2
        AND cur.rank <= 500
        AND prev.rank <= 500
        AND ABS(prev.rank - cur.rank) >= 3
      ORDER BY ABS(prev.rank - cur.rank) DESC
      LIMIT 20
    `)
    .bind(prevDate, today)
    .all<{ full_name: string; tool_type: string; current_rank: number; prev_rank: number; rank_delta: number; current_score: number; stars: number }>();
  const allMovers = moversResult.results ?? [];
  const gainers = allMovers.filter(m => m.rank_delta > 0).slice(0, 5);
  const losers = allMovers.filter(m => m.rank_delta < 0).slice(0, 5);
  const biggestMovers = [...gainers, ...losers];

  // 4. New tools this week
  const newToolsResult = await db
    .prepare(`
      SELECT cur.tool_full_name AS full_name, cur.tool_type, cur.rank, cur.score, cur.stars
      FROM rank_history cur
      WHERE cur.snapshot_date = ?1
        AND NOT EXISTS (
          SELECT 1 FROM rank_history old
          WHERE old.tool_full_name = cur.tool_full_name
            AND old.tool_type = cur.tool_type
            AND old.snapshot_date < ?2
        )
      ORDER BY cur.score DESC
      LIMIT 20
    `)
    .bind(today, prevDate)
    .all<{ full_name: string; tool_type: string; rank: number; score: number; stars: number }>();
  const newTools = newToolsResult.results ?? [];

  // 5. Notable releases from news_items this week
  const releasesResult = await db
    .prepare(`
      SELECT title, summary, source_url, related_tool_slugs, published_at
      FROM news_items
      WHERE category = 'release'
        AND status = 'published'
        AND published_at >= ?1
        AND published_at <= ?2
      ORDER BY published_at DESC
      LIMIT 10
    `)
    .bind(weekStart, weekEnd + 'T23:59:59')
    .all<{ title: string; summary: string | null; source_url: string; related_tool_slugs: string | null; published_at: string }>();
  const notableReleases = releasesResult.results ?? [];

  // 6. Category stats — count tools per category
  const catResult = await db
    .prepare(`
      SELECT category, COUNT(*) as count
      FROM tools
      WHERE category IS NOT NULL AND score IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 20
    `)
    .all<{ category: string; count: number }>();
  const categoryStats: Record<string, number> = {};
  for (const row of catResult.results ?? []) {
    categoryStats[row.category] = row.count;
  }

  await db
    .prepare(`
      INSERT OR REPLACE INTO weekly_reports
        (id, week_start, week_end, week_number, year, total_tools, new_tools_count,
         top_10, biggest_movers, new_tools, notable_releases, category_stats, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      id, weekStart, weekEnd, week, year, totalTools, newTools.length,
      JSON.stringify(top10),
      JSON.stringify(biggestMovers),
      JSON.stringify(newTools),
      JSON.stringify(notableReleases),
      JSON.stringify(categoryStats)
    )
    .run();

  console.log(`[cron-snapshot] generateWeeklyReport: stored ${id} (week ${week}/${year}, ${newTools.length} new tools, ${biggestMovers.length} movers, ${notableReleases.length} releases)`);
}

// --- Tweet generators ---

function generateMoversTweet(movers: Mover[]): string {
  const gainers = movers.filter((m) => m.rank_delta > 0).slice(0, 3);
  const losers = movers.filter((m) => m.rank_delta < 0).slice(0, 2);

  const lines: string[] = [];

  for (const m of gainers) {
    const handle = twitterHandle(m.full_name);
    const repo = m.full_name.split("/")[1];
    const arrow = `+${m.rank_delta}`;
    lines.push(`${arrow} ${handle}/${repo} (#${m.prev_rank} → #${m.current_rank})`);
  }
  for (const m of losers) {
    const handle = twitterHandle(m.full_name);
    const repo = m.full_name.split("/")[1];
    const arrow = `${m.rank_delta}`;
    lines.push(`${arrow} ${handle}/${repo} (#${m.prev_rank} → #${m.current_rank})`);
  }

  return `Biggest movers this week on AgentRank:

${lines.join("\n")}

Rankings update nightly from GitHub signals. Full leaderboard: agentrank-ai.com/tools`;
}

function generateNewToolsTweet(newTools: NewTool[]): string {
  const count = newTools.length;
  if (count === 0) return "";

  const top = newTools.slice(0, 3);
  const lines = top.map((t) => {
    const handle = twitterHandle(t.full_name);
    const repo = t.full_name.split("/")[1];
    return `- ${handle}/${repo} (score: ${Math.round(t.score)})`;
  });

  return `${count} new tool${count === 1 ? "" : "s"} entered the AgentRank index this week.

Top newcomers:
${lines.join("\n")}

Ranked from day one by real GitHub signals.

agentrank-ai.com/tools`;
}

async function generateTop10Tweet(db: D1Database): Promise<string> {
  const result = await db
    .prepare(
      `SELECT full_name, rank, score
       FROM tools
       WHERE rank IS NOT NULL
       ORDER BY rank ASC
       LIMIT 10`
    )
    .all();

  const tools = (result.results || []) as { full_name: string; rank: number; score: number }[];

  const lines = tools.map((t) => {
    const handle = twitterHandle(t.full_name);
    const repo = t.full_name.split("/")[1];
    return `${t.rank}. ${handle}/${repo} — ${Math.round(t.score)}`;
  });

  return `AgentRank top 10 MCP servers this week:

${lines.join("\n")}

Scored nightly. Full index: agentrank-ai.com/tools`;
}

// ---------------------------------------------------------------------------
// IndexNow — notify Bing and Yandex of updated URLs
// ---------------------------------------------------------------------------

const INDEXNOW_KEY = '8a7a5c3b-6d37-44fb-a44c-ded68d35d4f2';
const SITE = 'https://agentrank-ai.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_BATCH_SIZE = 9000;

const STATIC_URLS = [
  '/', '/tools/', '/movers/', '/agents/', '/compare/', '/compare/mcp-sdks/', '/submit/',
  '/docs/', '/blog/', '/category/', '/pricing/', '/methodology/', '/integrations/', '/embed/',
  '/dashboard/', '/dashboard/publisher/',
  '/blog/best-python-mcp-libraries/',
  '/blog/fastmcp-tutorial-python-mcp-server/',
  '/blog/mcp-setup-guide-claude-cursor-windsurf/',
  '/blog/this-week-in-mcp-2026-03-24/',
  '/blog/top-mcp-servers-2026/',
  '/blog/what-is-mcp-model-context-protocol-explained/',
  '/blog/how-to-build-an-mcp-server/',
  '/blog/how-to-choose-an-mcp-server/',
  '/blog/mcp-server-landscape-q1-2026/',
  '/blog/mcp-server-vs-rest-api/',
  '/blog/state-of-mcp-2026/',
  '/blog/this-week-in-mcp-2026-03-17/',
  '/blog/mcp-server-comparison-top-10/',
  '/blog/mcp-server-directory-comparison/',
  '/blog/best-mcp-servers-code-generation/',
  '/blog/best-mcp-servers-database/',
  '/blog/best-mcp-servers-security/',
  '/blog/best-mcp-servers-productivity/',
  '/blog/best-mcp-servers-devops/',
  '/blog/best-mcp-servers-web-browser/',
  '/blog/best-mcp-servers-ai-ml/',
  '/blog/best-mcp-servers-communication/',
];

async function submitIndexNow(db: D1Database): Promise<void> {
  const [toolRows, skillRows, categoryRows, reportRows] = await Promise.all([
    db.prepare('SELECT full_name FROM tools WHERE score IS NOT NULL').all(),
    db.prepare('SELECT slug FROM skills WHERE score IS NOT NULL').all(),
    db.prepare('SELECT DISTINCT category FROM tools WHERE category IS NOT NULL AND score IS NOT NULL UNION SELECT DISTINCT category FROM skills WHERE category IS NOT NULL AND score IS NOT NULL').all(),
    db.prepare('SELECT id FROM weekly_reports ORDER BY week_start DESC LIMIT 52').all<{ id: string }>().catch(() => ({ results: [] as { id: string }[] })),
  ]);

  const urls: string[] = STATIC_URLS.map(p => `${SITE}${p}`);

  for (const row of toolRows.results as { full_name: string }[]) {
    urls.push(`${SITE}/tool/${row.full_name.replace('/', '--')}/`);
  }
  for (const row of skillRows.results as { slug: string }[]) {
    urls.push(`${SITE}/skill/${row.slug.replace(/\//g, '--').replace(/:/g, '-')}/`);
  }
  for (const row of categoryRows.results as { category: string }[]) {
    urls.push(`${SITE}/category/${row.category}/`);
  }
  urls.push(`${SITE}/reports/`);
  for (const row of (reportRows.results ?? []) as { id: string }[]) {
    urls.push(`${SITE}/reports/${row.id}/`);
  }

  // Submit in batches
  let submitted = 0;
  for (let i = 0; i < urls.length; i += INDEXNOW_BATCH_SIZE) {
    const batch = urls.slice(i, i + INDEXNOW_BATCH_SIZE);
    const body = {
      host: 'agentrank-ai.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`[cron-snapshot] IndexNow batch ${i / INDEXNOW_BATCH_SIZE + 1}: ${batch.length} URLs → HTTP ${res.status}`);
    submitted += batch.length;
  }

  console.log(`[cron-snapshot] IndexNow: submitted ${submitted} URLs total`);
}

// ---------------------------------------------------------------------------
// Weekly digest email — runs Tuesday 09:00 UTC
// ---------------------------------------------------------------------------

async function generateUnsubToken(secret: string, email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildDigestHtml(
  top10: { full_name: string; rank: number; score: number; stars: number }[],
  gainers: { full_name: string; current_rank: number; prev_rank: number; rank_delta: number }[],
  newTools: { full_name: string; rank: number; score: number; stars: number }[],
  weekOf: string,
  unsubUrl: string,
): string {
  const site = 'https://agentrank-ai.com';
  const shortName = (s: string) => s.split('/').pop() ?? s;
  const ghUrl = (s: string) => `https://github.com/${s}`;

  const top10Rows = top10.map(t => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;color:#6b7280;font-size:13px;">#${t.rank}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;">
        <a href="${ghUrl(t.full_name)}" style="color:#818cf8;text-decoration:none;font-weight:600;">${shortName(t.full_name)}</a>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-size:13px;">${t.score.toFixed(1)}</td>
      <td style="padding:8px 0 8px 8px;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;font-size:13px;">&#9733; ${t.stars.toLocaleString()}</td>
    </tr>`).join('');

  const gainersRows = gainers.length ? gainers.map(g => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;">
        <a href="${ghUrl(g.full_name)}" style="color:#818cf8;text-decoration:none;font-weight:600;">${shortName(g.full_name)}</a>
      </td>
      <td style="padding:8px 0 8px 12px;border-bottom:1px solid #1f2937;text-align:right;color:#22c55e;white-space:nowrap;">
        &#9650; ${g.rank_delta} (#${g.prev_rank} &rarr; #${g.current_rank})
      </td>
    </tr>`).join('') : `<tr><td colspan="2" style="padding:12px 0;color:#6b7280;font-style:italic;">No significant movers this week.</td></tr>`;

  const newToolsRows = newTools.length ? newTools.map(t => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;">
        <a href="${ghUrl(t.full_name)}" style="color:#818cf8;text-decoration:none;font-weight:600;">${shortName(t.full_name)}</a>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;font-size:13px;">${t.score.toFixed(1)} · &#9733; ${t.stars.toLocaleString()}</td>
    </tr>`).join('') : '';

  const newSection = newTools.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">New in the Index</h2>
        <table width="100%" cellpadding="0" cellspacing="0"><tbody>${newToolsRows}</tbody></table>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AgentRank Weekly Digest</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 32px;">
          <a href="${site}/" style="text-decoration:none;">
            <span style="font-size:22px;font-weight:700;color:#f9fafb;">AgentRank</span>
            <span style="font-size:13px;color:#6b7280;margin-left:8px;">Weekly Digest</span>
          </a>
          <div style="font-size:12px;color:#4b5563;margin-top:4px;">Week of ${weekOf}</div>
        </td></tr>
        <tr><td style="padding:0 0 32px;">
          <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">Top 10 This Week</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead><tr>
              <th style="text-align:left;font-size:11px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">#</th>
              <th style="text-align:left;font-size:11px;color:#4b5563;padding:0 12px 8px;border-bottom:1px solid #1f2937;">Tool</th>
              <th style="text-align:right;font-size:11px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">Score</th>
              <th style="text-align:right;font-size:11px;color:#4b5563;padding:0 0 8px 8px;border-bottom:1px solid #1f2937;">Stars</th>
            </tr></thead>
            <tbody>${top10Rows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:0 0 32px;">
          <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">Biggest Movers</h2>
          <table width="100%" cellpadding="0" cellspacing="0"><tbody>${gainersRows}</tbody></table>
        </td></tr>
        ${newSection}
        <tr><td style="padding:0 0 40px;text-align:center;">
          <a href="${site}/" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:13px 32px;border-radius:6px;font-weight:600;font-size:14px;">
            View Full Leaderboard
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid #111827;padding:24px 0 0;">
          <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
            You're receiving this because you subscribed to AgentRank at
            <a href="${site}/" style="color:#4b5563;">agentrank-ai.com</a>.<br>
            <a href="${unsubUrl}" style="color:#4b5563;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Welcome email — sent once per subscriber, daily cron picks up new signups
// ---------------------------------------------------------------------------

function buildWelcomeHtml(
  top10: { full_name: string; rank: number; score: number; stars: number }[],
  unsubUrl: string,
): string {
  const site = 'https://agentrank-ai.com';
  const shortName = (s: string) => s.split('/').pop() ?? s;
  const ghUrl = (s: string) => `https://github.com/${s}`;

  const top10Rows = top10.map(t => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;color:#6b7280;font-size:13px;">#${t.rank}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1f2937;">
        <a href="${ghUrl(t.full_name)}" style="color:#818cf8;text-decoration:none;font-weight:600;">${shortName(t.full_name)}</a>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-size:13px;">${t.score.toFixed(1)}</td>
      <td style="padding:8px 0 8px 8px;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;font-size:13px;">&#9733; ${t.stars.toLocaleString()}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Welcome to AgentRank</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 32px;">
          <a href="${site}/" style="text-decoration:none;">
            <span style="font-size:22px;font-weight:700;color:#f9fafb;">AgentRank</span>
          </a>
        </td></tr>
        <tr><td style="padding:0 0 28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#e5e7eb;line-height:1.6;">
            Welcome — you're now subscribed to the AgentRank weekly digest.
          </p>
          <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">
            AgentRank tracks every MCP server and agent tool on GitHub, scoring them nightly by real signals:
            stars, freshness, issue health, contributors, and dependents. No hype — just data.
          </p>
        </td></tr>
        <tr><td style="padding:0 0 32px;">
          <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">Top 10 MCP Tools Right Now</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead><tr>
              <th style="text-align:left;font-size:11px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">#</th>
              <th style="text-align:left;font-size:11px;color:#4b5563;padding:0 12px 8px;border-bottom:1px solid #1f2937;">Tool</th>
              <th style="text-align:right;font-size:11px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">Score</th>
              <th style="text-align:right;font-size:11px;color:#4b5563;padding:0 0 8px 8px;border-bottom:1px solid #1f2937;">Stars</th>
            </tr></thead>
            <tbody>${top10Rows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:0 0 40px;text-align:center;">
          <a href="${site}/tools/" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:13px 32px;border-radius:6px;font-weight:600;font-size:14px;">
            View Full Leaderboard
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid #111827;padding:24px 0 0;">
          <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
            You'll receive a weekly digest every Tuesday with the latest rankings and movers.<br>
            <a href="${unsubUrl}" style="color:#4b5563;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendWelcomeEmails(env: Env): Promise<void> {
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('[cron-snapshot] sendWelcomeEmails: RESEND_API_KEY not set, skipping');
    return;
  }

  const db = env.DB;

  // Find subscribers who haven't received a welcome email yet
  const subsResult = await db
    .prepare(`SELECT id, email FROM email_subscribers WHERE welcome_sent_at IS NULL ORDER BY subscribed_at ASC LIMIT 90`)
    .all()
    .catch(() => ({ results: [] as unknown[] }));

  const subscribers = (subsResult.results || []) as { id: number; email: string }[];

  if (subscribers.length === 0) {
    console.log('[cron-snapshot] sendWelcomeEmails: no new subscribers, skipping');
    return;
  }

  // Fetch top 10 tools once
  const top10Result = await db
    .prepare(`SELECT full_name, rank, score, stars FROM tools WHERE rank IS NOT NULL ORDER BY rank ASC LIMIT 10`)
    .all()
    .catch(() => ({ results: [] as unknown[] }));

  const top10 = (top10Result.results || []) as { full_name: string; rank: number; score: number; stars: number }[];

  const unsubSecret = env.UNSUB_SECRET || env.DASH_TOKEN || 'change-me';
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubToken = await generateUnsubToken(unsubSecret, sub.email);
    const unsubUrl = `https://agentrank-ai.com/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${unsubToken}`;
    const html = buildWelcomeHtml(top10, unsubUrl);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AgentRank <digest@agentrank-ai.com>',
        to: sub.email,
        subject: 'Welcome to AgentRank — top MCP tools this week',
        html,
      }),
    }).catch(() => null);

    if (res?.ok) {
      // Mark welcome email as sent
      await db
        .prepare(`UPDATE email_subscribers SET welcome_sent_at = datetime('now') WHERE id = ?`)
        .bind(sub.id)
        .run()
        .catch(() => null);
      sent++;
    } else {
      failed++;
      console.log(`[cron-snapshot] sendWelcomeEmails: failed to send to ${sub.email}: HTTP ${res?.status ?? 'error'}`);
    }
  }

  console.log(`[cron-snapshot] sendWelcomeEmails: sent=${sent} failed=${failed} total=${subscribers.length}`);
}

async function sendWeeklyDigest(env: Env): Promise<void> {
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('[cron-snapshot] sendWeeklyDigest: RESEND_API_KEY not set, skipping');
    return;
  }

  const today = utcDateString();
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7);
  const prevDate = d.toISOString().slice(0, 10);

  const weekLabel = new Date(today + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  const subject = `AgentRank Weekly — ${weekLabel}`;

  const db = env.DB;

  const [top10Result, gainersResult, newToolsResult, subsResult] = await Promise.all([
    db.prepare(`SELECT full_name, rank, score, stars FROM tools WHERE rank IS NOT NULL ORDER BY rank ASC LIMIT 10`)
      .all().catch(() => ({ results: [] as unknown[] })),

    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank AS current_rank,
        prev.rank AS prev_rank,
        (prev.rank - cur.rank) AS rank_delta
      FROM rank_history cur
      JOIN rank_history prev
        ON cur.tool_full_name = prev.tool_full_name
       AND cur.tool_type = prev.tool_type
      WHERE cur.snapshot_date = ?1
        AND prev.snapshot_date = ?2
        AND cur.tool_type = 'tool'
        AND (prev.rank - cur.rank) >= 3
      ORDER BY (prev.rank - cur.rank) DESC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank,
        cur.score,
        cur.stars
      FROM rank_history cur
      WHERE cur.snapshot_date = ?1
        AND cur.tool_type = 'tool'
        AND NOT EXISTS (
          SELECT 1 FROM rank_history old
          WHERE old.tool_full_name = cur.tool_full_name
            AND old.tool_type = 'tool'
            AND old.snapshot_date < ?2
        )
      ORDER BY cur.score DESC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    db.prepare(`SELECT email FROM email_subscribers ORDER BY subscribed_at ASC`)
      .all().catch(() => ({ results: [] as unknown[] })),
  ]);

  const top10 = (top10Result.results || []) as { full_name: string; rank: number; score: number; stars: number }[];
  const gainers = (gainersResult.results || []) as { full_name: string; current_rank: number; prev_rank: number; rank_delta: number }[];
  const newTools = (newToolsResult.results || []) as { full_name: string; rank: number; score: number; stars: number }[];
  const subscribers = (subsResult.results || []).map((r: any) => r.email as string);

  if (subscribers.length === 0) {
    console.log('[cron-snapshot] sendWeeklyDigest: no subscribers, skipping send');
    return;
  }

  const unsubSecret = env.UNSUB_SECRET || env.DASH_TOKEN || 'change-me';
  let sent = 0;
  let failed = 0;

  for (const email of subscribers) {
    const unsubToken = await generateUnsubToken(unsubSecret, email);
    const unsubUrl = `https://agentrank-ai.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;
    const html = buildDigestHtml(top10, gainers, newTools, weekLabel, unsubUrl);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AgentRank <digest@agentrank-ai.com>',
        to: email,
        subject,
        html,
      }),
    }).catch(() => null);

    if (res?.ok) {
      sent++;
    } else {
      failed++;
      console.log(`[cron-snapshot] sendWeeklyDigest: failed to send to ${email}: HTTP ${res?.status ?? 'error'}`);
    }
  }

  console.log(`[cron-snapshot] sendWeeklyDigest: sent=${sent} failed=${failed} total=${subscribers.length}`);
}

// ---------------------------------------------------------------------------
// Activity Event Detection — ingest star spikes, new tools, movers, deprecated
// ---------------------------------------------------------------------------

async function ingestActivityEvents(
  db: D1Database,
  today: string
): Promise<number> {
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 7);
  const prevDate = utcDateString(d);

  // Load existing source_urls for today to dedup within this run
  const existingResult = await db
    .prepare(
      `SELECT source_url FROM news_items
       WHERE source_url IS NOT NULL
         AND published_at >= ?`
    )
    .bind(today)
    .all<{ source_url: string }>();
  const existingUrls = new Set(
    existingResult.results?.map((r) => r.source_url) ?? []
  );

  const toInsert: Array<{
    title: string;
    summary: string;
    source_url: string;
    category: string;
    related_tool_slugs: string;
    published_at: string;
  }> = [];

  // --- 1. Star velocity spikes (>50% week-over-week growth, min 100 stars) ---
  const spikeRows = await db
    .prepare(
      `SELECT t.full_name, t.stars AS current_stars, sh.stars AS prev_stars
       FROM tools t
       JOIN score_history sh
         ON sh.tool_slug = t.full_name
        AND sh.tool_type = 'tool'
        AND sh.recorded_at = ?1
       WHERE t.stars >= 100
         AND sh.stars > 0
         AND CAST(t.stars - sh.stars AS REAL) / sh.stars >= 0.5
       ORDER BY CAST(t.stars - sh.stars AS REAL) / sh.stars DESC
       LIMIT 20`
    )
    .bind(prevDate)
    .all<{ full_name: string; current_stars: number; prev_stars: number }>();

  for (const row of spikeRows.results ?? []) {
    const url = `https://github.com/${row.full_name}#trending-${today}`;
    if (existingUrls.has(url)) continue;
    const pct = Math.round(
      ((row.current_stars - row.prev_stars) / row.prev_stars) * 100
    );
    const repoName = row.full_name.split("/")[1] ?? row.full_name;
    toInsert.push({
      title: `${repoName} is trending (+${pct}% stars this week)`,
      summary: `${row.full_name} grew from ${row.prev_stars} to ${row.current_stars} stars in 7 days (+${pct}%).`,
      source_url: url,
      category: "trending",
      related_tool_slugs: JSON.stringify([row.full_name]),
      published_at: today,
    });
    existingUrls.add(url);
  }

  // --- 2. New tools entering the index ---
  const newTools = await getNewTools(db, today);
  for (const tool of newTools.slice(0, 20)) {
    const url = `https://github.com/${tool.full_name}#new-${today}`;
    if (existingUrls.has(url)) continue;
    const repoName = tool.full_name.split("/")[1] ?? tool.full_name;
    toInsert.push({
      title: `${repoName} entered the AgentRank index`,
      summary: `${tool.full_name} is a new ${tool.tool_type} in the index, ranked #${tool.rank} with ${tool.stars} stars.`,
      source_url: url,
      category: "new-tool",
      related_tool_slugs: JSON.stringify([tool.full_name]),
      published_at: today,
    });
    existingUrls.add(url);
  }

  // --- 3. Big movers (10+ rank change — top 5 gainers + top 5 losers) ---
  const allMovers = await getBiggestMovers(db, today);
  const bigMovers = allMovers.filter((m) => Math.abs(m.rank_delta) >= 10);
  const gainers = bigMovers.filter((m) => m.rank_delta > 0).slice(0, 5);
  const losers = bigMovers.filter((m) => m.rank_delta < 0).slice(0, 5);

  for (const mover of [...gainers, ...losers]) {
    const direction = mover.rank_delta > 0 ? "up" : "down";
    const url = `https://github.com/${mover.full_name}#mover-${direction}-${today}`;
    if (existingUrls.has(url)) continue;
    const repoName = mover.full_name.split("/")[1] ?? mover.full_name;
    const delta = Math.abs(mover.rank_delta);
    toInsert.push({
      title: `${repoName} moved ${direction} ${delta} spots on AgentRank`,
      summary: `${mover.full_name} ${direction === "up" ? "gained" : "dropped"} ${delta} ranks (#${mover.prev_rank} → #${mover.current_rank}).`,
      source_url: url,
      category: "mover",
      related_tool_slugs: JSON.stringify([mover.full_name]),
      published_at: today,
    });
    existingUrls.add(url);
  }

  // --- 4. Repos newly archived/deprecated ---
  const archivedRows = await db
    .prepare(
      `SELECT t.full_name
       FROM tools t
       WHERE t.is_archived = 1
         AND NOT EXISTS (
           SELECT 1 FROM news_items ni
           WHERE ni.category = 'deprecated'
             AND ni.source_url = 'https://github.com/' || t.full_name || '#deprecated'
         )
       LIMIT 20`
    )
    .all<{ full_name: string }>();

  for (const row of archivedRows.results ?? []) {
    const url = `https://github.com/${row.full_name}#deprecated`;
    if (existingUrls.has(url)) continue;
    const repoName = row.full_name.split("/")[1] ?? row.full_name;
    toInsert.push({
      title: `${repoName} has been archived`,
      summary: `${row.full_name} is now archived on GitHub. It may no longer be actively maintained.`,
      source_url: url,
      category: "deprecated",
      related_tool_slugs: JSON.stringify([row.full_name]),
      published_at: today,
    });
    existingUrls.add(url);
  }

  if (toInsert.length === 0) {
    console.log(`[cron-snapshot] ingestActivityEvents: no new events for ${today}`);
    return 0;
  }

  // Batch insert in chunks of 50
  const INSERT_CHUNK = 50;
  let totalInserted = 0;
  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK);
    const stmts = chunk.map((item) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO news_items
             (id, title, summary, source_url, source, category, related_tool_slugs, status, published_at)
           VALUES (?, ?, ?, ?, 'internal', ?, ?, 'published', ?)`
        )
        .bind(
          crypto.randomUUID(),
          item.title,
          item.summary,
          item.source_url,
          item.category,
          item.related_tool_slugs,
          item.published_at
        )
    );
    await db.batch(stmts);
    totalInserted += chunk.length;
  }

  console.log(
    `[cron-snapshot] ingestActivityEvents: inserted ${totalInserted} events for ${today}`
  );
  return totalInserted;
}

// ---------------------------------------------------------------------------
// GitHub Release Monitor — ingest new tool releases as news_items
// ---------------------------------------------------------------------------

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
}

async function fetchToolReleases(
  fullName: string,
  githubToken: string,
  limit = 5
): Promise<GitHubRelease[]> {
  const url = `https://api.github.com/repos/${fullName}/releases?per_page=${limit}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "AgentRank/1.0 (https://agentrank-ai.com)",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as GitHubRelease[];
  } catch {
    return [];
  }
}

async function monitorGitHubReleases(
  db: D1Database,
  githubToken: string
): Promise<number> {
  // 1. Query top 500 tools by score
  const tools = await db
    .prepare(`SELECT full_name FROM tools ORDER BY score DESC LIMIT 500`)
    .all<{ full_name: string }>();

  if (!tools.results?.length) return 0;

  // 2. Load existing github release source_urls for dedup
  const existingResult = await db
    .prepare(
      `SELECT source_url FROM news_items WHERE source = 'github' AND source_url IS NOT NULL`
    )
    .all<{ source_url: string }>();
  const existingUrls = new Set(
    existingResult.results?.map((r) => r.source_url) ?? []
  );

  // 3. Process tools in parallel batches of 20
  const BATCH_SIZE = 20;
  const toInsert: Array<{
    title: string;
    summary: string | null;
    source_url: string;
    category: string;
    related_tool_slugs: string;
    published_at: string;
  }> = [];

  for (let i = 0; i < tools.results.length; i += BATCH_SIZE) {
    const batch = tools.results.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async ({ full_name }) => {
        const releases = await fetchToolReleases(full_name, githubToken, 5);
        return { full_name, releases };
      })
    );

    for (const { full_name, releases } of batchResults) {
      for (const release of releases) {
        if (release.draft || release.prerelease) continue;
        if (!release.published_at) continue;
        if (existingUrls.has(release.html_url)) continue;

        const repoName = full_name.split("/")[1] ?? full_name;
        const displayName = release.name?.trim() || release.tag_name;
        const title = `${repoName} ${displayName} released`;
        const summary = release.body
          ? release.body.replace(/\r\n|\r/g, "\n").trim().slice(0, 280)
          : null;

        toInsert.push({
          title,
          summary,
          source_url: release.html_url,
          category: "release",
          related_tool_slugs: JSON.stringify([full_name]),
          published_at: release.published_at,
        });

        // Track locally to dedup within this run
        existingUrls.add(release.html_url);
      }
    }
  }

  if (toInsert.length === 0) {
    console.log(`[cron-snapshot] monitorGitHubReleases: no new releases found`);
    return 0;
  }

  // 4. Batch insert in chunks of 50
  const INSERT_CHUNK = 50;
  let totalInserted = 0;
  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK);
    const stmts = chunk.map((item) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO news_items
             (id, title, summary, source_url, source, category, related_tool_slugs, status, published_at)
           VALUES (?, ?, ?, ?, 'github', ?, ?, 'published', ?)`
        )
        .bind(
          crypto.randomUUID(),
          item.title,
          item.summary,
          item.source_url,
          item.category,
          item.related_tool_slugs,
          item.published_at
        )
    );
    await db.batch(stmts);
    totalInserted += chunk.length;
  }

  console.log(
    `[cron-snapshot] monitorGitHubReleases: inserted ${totalInserted} new release items`
  );
  return totalInserted;
}

// ---------------------------------------------------------------------------
// Fast-poll GitHub Events — runs every 30 min, inserts news_items immediately
// ---------------------------------------------------------------------------

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: {
    action?: string;
    release?: {
      tag_name: string;
      name: string | null;
      body: string | null;
      html_url: string;
      published_at: string | null;
      draft: boolean;
      prerelease: boolean;
    };
  };
}

async function fetchRepoEvents(
  fullName: string,
  githubToken: string
): Promise<GitHubEvent[]> {
  const url = `https://api.github.com/repos/${fullName}/events?per_page=30`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "AgentRank/1.0 (https://agentrank-ai.com)",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as GitHubEvent[];
  } catch {
    return [];
  }
}

async function fastPollGitHubEvents(
  db: D1Database,
  githubToken: string
): Promise<number> {
  // Poll top 100 tools by score — avoids new-repo discovery, safe API budget
  const toolsResult = await db
    .prepare(`SELECT full_name FROM tools ORDER BY score DESC LIMIT 100`)
    .all<{ full_name: string }>();

  if (!toolsResult.results?.length) return 0;

  // Dedup against existing news_items (any source_url already recorded)
  const existingResult = await db
    .prepare(`SELECT source_url FROM news_items WHERE source_url IS NOT NULL`)
    .all<{ source_url: string }>();
  const existingUrls = new Set(existingResult.results?.map((r) => r.source_url) ?? []);

  const cutoff = new Date(Date.now() - 35 * 60 * 1000); // 35 min window (buffer for clock drift)
  const nowIso = new Date().toISOString();

  const toInsert: Array<{
    title: string;
    summary: string | null;
    source_url: string;
    category: string;
    related_tool_slugs: string;
    published_at: string;
  }> = [];

  // Process in parallel batches of 20 to respect CF Worker subrequest limits
  const BATCH = 20;
  for (let i = 0; i < toolsResult.results.length; i += BATCH) {
    const batch = toolsResult.results.slice(i, i + BATCH);
    const batchData = await Promise.all(
      batch.map(async ({ full_name }) => {
        const events = await fetchRepoEvents(full_name, githubToken);
        return { full_name, events };
      })
    );

    for (const { full_name, events } of batchData) {
      const repoName = full_name.split("/")[1] ?? full_name;

      // --- ReleaseEvent: new release published within the window ---
      const releaseEvents = events.filter(
        (e) =>
          e.type === "ReleaseEvent" &&
          e.payload?.action === "published" &&
          new Date(e.created_at) >= cutoff
      );

      for (const evt of releaseEvents) {
        const release = evt.payload?.release;
        if (!release || release.draft || release.prerelease) continue;
        const url = release.html_url;
        if (!url || existingUrls.has(url)) continue;

        const displayName = release.name?.trim() || release.tag_name;
        toInsert.push({
          title: `${repoName} ${displayName} released`,
          summary: release.body
            ? release.body.replace(/\r\n|\r/g, "\n").trim().slice(0, 280)
            : null,
          source_url: url,
          category: "release",
          related_tool_slugs: JSON.stringify([full_name]),
          published_at: release.published_at || evt.created_at,
        });
        existingUrls.add(url);
      }

      // --- WatchEvent: real-time star momentum (10+ stars in 30 min) ---
      const recentStars = events.filter(
        (e) =>
          e.type === "WatchEvent" &&
          e.payload?.action === "started" &&
          new Date(e.created_at) >= cutoff
      ).length;

      if (recentStars >= 10) {
        const url = `https://github.com/${full_name}#live-trending-${cutoff.toISOString().slice(0, 16)}`;
        if (!existingUrls.has(url)) {
          toInsert.push({
            title: `${repoName} gaining stars fast (+${recentStars} in 30 min)`,
            summary: `${full_name} received ${recentStars} new stars in the last 30 minutes — real-time momentum signal.`,
            source_url: url,
            category: "trending",
            related_tool_slugs: JSON.stringify([full_name]),
            published_at: nowIso,
          });
          existingUrls.add(url);
        }
      }
    }
  }

  if (toInsert.length === 0) {
    console.log(`[cron-snapshot] fastPollGitHubEvents: no new events`);
    return 0;
  }

  const INSERT_CHUNK = 50;
  let totalInserted = 0;
  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK);
    const stmts = chunk.map((item) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO news_items
             (id, title, summary, source_url, source, category, related_tool_slugs, status, published_at)
           VALUES (?, ?, ?, ?, 'github', ?, ?, 'published', ?)`
        )
        .bind(
          crypto.randomUUID(),
          item.title,
          item.summary,
          item.source_url,
          item.category,
          item.related_tool_slugs,
          item.published_at
        )
    );
    await db.batch(stmts);
    totalInserted += chunk.length;
  }

  console.log(
    `[cron-snapshot] fastPollGitHubEvents: inserted ${totalInserted} new items`
  );
  return totalInserted;
}

// --- Scheduled handler ---

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const today = utcDateString();
    const isMonday = new Date().getUTCDay() === 1;
    const isTuesday = new Date().getUTCDay() === 2;

    console.log(`[cron-snapshot] Running at ${event.scheduledTime}, date=${today}, isMonday=${isMonday}`);

    // Fast-poll path: lightweight GitHub Events check every 30 min
    if (event.cron === "*/30 * * * *") {
      if (env.GITHUB_TOKEN) {
        try {
          const count = await fastPollGitHubEvents(env.DB, env.GITHUB_TOKEN);
          console.log(`[cron-snapshot] fastPoll complete: ${count} new news items`);
        } catch (e: any) {
          console.log(`[cron-snapshot] fastPollGitHubEvents failed: ${e?.message}`);
        }
      } else {
        console.log(`[cron-snapshot] fastPoll: skipped (no GITHUB_TOKEN)`);
      }
      return;
    }

    // Step 1: Always snapshot current rankings
    const inserted = await snapshotRankings(env.DB, today);
    console.log(`[cron-snapshot] Snapshot complete: ${inserted} rows inserted for ${today}`);

    // Step 1b: Snapshot component-level scores into score_history
    try {
      const shInserted = await snapshotScoreHistory(env.DB, today);
      console.log(`[cron-snapshot] score_history: ${shInserted} rows inserted for ${today}`);
    } catch (e: any) {
      // score_history table may not exist yet on older D1 instances — non-fatal
      console.log(`[cron-snapshot] score_history snapshot skipped: ${e?.message}`);
    }

    // Step 2: Always check our own skill install counts
    await checkpointSkillInstalls(env.DB);

    // Step 3: Submit updated URLs to IndexNow (Bing + Yandex)
    try {
      await submitIndexNow(env.DB);
    } catch (e: any) {
      console.log(`[cron-snapshot] IndexNow submission failed (non-fatal): ${e?.message}`);
    }

    // Step 4: Every day, send welcome emails to subscribers who haven't received one yet
    try {
      await sendWelcomeEmails(env);
    } catch (e: any) {
      console.log(`[cron-snapshot] sendWelcomeEmails failed (non-fatal): ${e?.message}`);
    }

    // Step 4b: Ingest activity events (star spikes, new tools, movers, deprecated)
    try {
      const eventCount = await ingestActivityEvents(env.DB, today);
      console.log(`[cron-snapshot] ingestActivityEvents: ${eventCount} events`);
    } catch (e: any) {
      console.log(`[cron-snapshot] ingestActivityEvents failed (non-fatal): ${e?.message}`);
    }

    // Step 4d: Monitor GitHub releases for top tools and ingest as news_items
    if (env.GITHUB_TOKEN) {
      try {
        const releaseCount = await monitorGitHubReleases(env.DB, env.GITHUB_TOKEN);
        console.log(`[cron-snapshot] monitorGitHubReleases: ${releaseCount} new items`);
      } catch (e: any) {
        console.log(`[cron-snapshot] monitorGitHubReleases failed (non-fatal): ${e?.message}`);
      }
    } else {
      console.log(`[cron-snapshot] monitorGitHubReleases: skipped (no GITHUB_TOKEN)`);
    }

    // Step 4e: On Tuesdays, send the weekly email digest to all subscribers
    if (isTuesday) {
      try {
        await sendWeeklyDigest(env);
      } catch (e: any) {
        console.log(`[cron-snapshot] sendWeeklyDigest failed (non-fatal): ${e?.message}`);
      }
    }

    // Step 5: On Mondays, generate weekly report + log weekly content for the bot
    if (isMonday) {
      // Generate and store weekly ecosystem report in D1
      try {
        await generateWeeklyReport(env.DB, today);
      } catch (e: any) {
        console.log(`[cron-snapshot] generateWeeklyReport failed (non-fatal): ${e?.message}`);
      }

      const [movers, newTools, top10] = await Promise.all([
        getBiggestMovers(env.DB, today),
        getNewTools(env.DB, today),
        generateTop10Tweet(env.DB),
      ]);

      const moversTweet = movers.length >= 2 ? generateMoversTweet(movers) : null;
      const newToolsTweet = newTools.length > 0 ? generateNewToolsTweet(newTools) : null;

      console.log(`[cron-snapshot] Weekly content generated:`);
      console.log(`  movers: ${movers.length} tools with significant rank changes`);
      console.log(`  new tools: ${newTools.length} newcomers`);
      if (moversTweet) console.log(`  movers tweet: ${moversTweet.length} chars`);
      if (newToolsTweet) console.log(`  new tools tweet: ${newToolsTweet.length} chars`);
      console.log(`  top10 tweet: ${top10.length} chars`);
    }
  },

  // Minimal fetch handler (health check)
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, worker: "cron-snapshot" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
