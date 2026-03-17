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

// --- Scheduled handler ---

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const today = utcDateString();
    const isMonday = new Date().getUTCDay() === 1;

    console.log(`[cron-snapshot] Running at ${event.scheduledTime}, date=${today}, isMonday=${isMonday}`);

    // Step 1: Always snapshot current rankings
    const inserted = await snapshotRankings(env.DB, today);
    console.log(`[cron-snapshot] Snapshot complete: ${inserted} rows inserted for ${today}`);

    // Step 2: Always check our own skill install counts
    await checkpointSkillInstalls(env.DB);

    // Step 3: On Mondays, log weekly content for the bot to consume
    // The bot reads from /api/v1/movers and /api/v1/new-tools — no storage needed here.
    // Just log for observability; the API endpoints do the computation live.
    if (isMonday) {
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
