/**
 * Weekly Ecosystem Report Generator
 *
 * Generates every Monday (or on demand):
 *   - data/weekly/YYYY-MM-DD.json       — structured weekly summary + tweet
 *   - site/src/pages/blog/this-week-in-mcp-YYYY-MM-DD.astro  — blog post
 *
 * Also prepends the new post to site/src/pages/blog/index.astro.
 *
 * Run manually: npx tsx scripts/weekly-report.ts
 * Run in pipeline: called from run-pipeline.sh on Mondays.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DB_PATH = path.resolve(ROOT_DIR, "data/agentrank.db");
const RANKED_PATH = path.resolve(ROOT_DIR, "data/ranked.json");
const MOVERS_PATH = path.resolve(ROOT_DIR, "data/movers.json");
const WEEKLY_DIR = path.resolve(ROOT_DIR, "data/weekly");
const BASELINE_PATH = path.resolve(ROOT_DIR, "data/weekly/baseline.json");
const BLOG_DIR = path.resolve(ROOT_DIR, "site/src/pages/blog");
const BLOG_INDEX = path.resolve(BLOG_DIR, "index.astro");

// --- Types ---

interface RankedTool {
  rank: number;
  full_name: string;
  url: string;
  description: string | null;
  score: number;
  stars: number;
  forks: number;
  open_issues: number;
  closed_issues: number;
  contributors: number;
  language: string | null;
  last_commit_at: string | null;
}

interface MoverEntry {
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

interface MoversData {
  generated_at: string;
  comparison_date: string | null;
  days_span: number | null;
  has_data: boolean;
  tools: {
    gainers: MoverEntry[];
    losers: MoverEntry[];
    new_entries: NewEntry[];
  };
  skills: {
    gainers: MoverEntry[];
    losers: MoverEntry[];
    new_entries: NewEntry[];
  };
}

interface BaselineSnapshot {
  date: string;
  tool_count: number;
  tools: Record<string, { score: number; rank: number }>;
}

// --- Helpers ---

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function toolSlug(fullName: string): string {
  return fullName.replace(/\//g, "--");
}

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
  CoplayDev: "@CoplayDev",
};

function twitterHandle(fullName: string): string {
  const org = fullName.split("/")[0];
  return TWITTER_HANDLES[org] || `@${org}`;
}

function escapeForAstro(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

// --- Fetch top news from live API (best-effort) ---

async function fetchTopNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://agentrank-ai.com/api/v1/news?limit=7", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { items: any[]; meta: { mock: boolean } };
    if (data.meta?.mock) return []; // skip placeholder data
    return data.items.map((n: any) => ({
      title: n.title,
      summary: n.summary ?? null,
      source_url: n.source_url ?? null,
      category: n.category ?? "community",
      author_handle: n.author_handle ?? null,
    }));
  } catch {
    return [];
  }
}

// --- Main ---

async function main(): Promise<void> {
  console.log("Weekly Report Generator starting...\n");

  // Fetch top news items from live API (best-effort, non-blocking)
  const topNews = await fetchTopNews();
  console.log(topNews.length > 0 ? `Fetched ${topNews.length} published news items` : "No published news items (ingestion pipeline may not be running yet)");

  const today = new Date().toISOString().slice(0, 10);
  const slug = `this-week-in-mcp-${today}`;
  const blogPostPath = path.resolve(BLOG_DIR, `${slug}.astro`);

  // Skip if already generated today
  if (fs.existsSync(blogPostPath)) {
    console.log(`Weekly report already generated for ${today}. Skipping.`);
    return;
  }

  // Ensure weekly dir exists
  if (!fs.existsSync(WEEKLY_DIR)) {
    fs.mkdirSync(WEEKLY_DIR, { recursive: true });
  }

  // --- Load baseline snapshot (previous week's comparison point) ---
  let baseline: BaselineSnapshot | null = null;
  if (fs.existsSync(BASELINE_PATH)) {
    console.log("Loading baseline snapshot...");
    baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf-8"));
    console.log(`  Baseline date: ${baseline!.date} (${baseline!.tool_count} tools)`);
  } else {
    console.log("No baseline snapshot found — this is the first weekly report.");
  }

  // --- Load ranked.json ---
  console.log("Loading ranked.json...");
  const ranked: RankedTool[] = JSON.parse(fs.readFileSync(RANKED_PATH, "utf-8"));
  const top10 = ranked.slice(0, 10);

  // --- Load movers.json ---
  console.log("Loading movers.json...");
  const movers: MoversData = JSON.parse(fs.readFileSync(MOVERS_PATH, "utf-8"));

  // --- Query agentrank.db ---
  console.log("Querying database...");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const totalTools = (
    db
      .prepare("SELECT COUNT(*) as count FROM repos WHERE score IS NOT NULL")
      .get() as { count: number }
  ).count;

  const totalSkills = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM skills WHERE score IS NOT NULL"
      )
      .get() as { count: number }
  ).count;

  const avgScore =
    (
      db
        .prepare(
          "SELECT ROUND(AVG(score), 1) as avg FROM repos WHERE score IS NOT NULL"
        )
        .get() as { avg: number | null }
    ).avg ?? 0;

  const langRows = db
    .prepare(
      `SELECT language, COUNT(*) as count
       FROM repos
       WHERE language IS NOT NULL AND score IS NOT NULL
       GROUP BY language
       ORDER BY count DESC
       LIMIT 5`
    )
    .all() as { language: string; count: number }[];

  const mostActiveRows = db
    .prepare(
      `SELECT full_name, stars, score, last_commit_at
       FROM repos
       WHERE last_commit_at >= datetime('now', '-7 days')
         AND score IS NOT NULL
       ORDER BY score DESC
       LIMIT 5`
    )
    .all() as {
    full_name: string;
    stars: number;
    score: number;
    last_commit_at: string;
  }[];

  db.close();

  // --- Compute new_tools_this_week from baseline comparison ---
  // Use baseline to determine which repos are genuinely new this week.
  // If no baseline exists, count is 0 (first report — no comparison available).
  let newReposCount = 0;
  if (baseline) {
    const baselineNames = new Set(Object.keys(baseline.tools));
    newReposCount = ranked.filter((r) => !baselineNames.has(r.full_name)).length;
    console.log(`New tools vs baseline (${baseline.date}): ${newReposCount}`);
  } else {
    console.log("No baseline — new_tools_this_week = 0 (first report)");
  }

  // --- Compute movers from baseline if movers.json has no data ---
  let topGainers: MoverEntry[] = [];
  let topLosers: MoverEntry[] = [];
  let newEntries: NewEntry[] = [];

  if (movers.has_data) {
    topGainers = movers.tools.gainers.slice(0, 5);
    topLosers = movers.tools.losers.slice(0, 5);
    newEntries = movers.tools.new_entries.slice(0, 10);
  } else if (baseline) {
    // Compute gainers/losers/new_entries directly from baseline
    const baselineTools = baseline.tools;
    const gainersRaw: MoverEntry[] = [];
    const losersRaw: MoverEntry[] = [];
    const newEntriesRaw: NewEntry[] = [];

    for (const tool of ranked) {
      const prev = baselineTools[tool.full_name];
      if (!prev) {
        newEntriesRaw.push({
          identifier: tool.full_name,
          name: tool.full_name,
          score: tool.score,
          rank: tool.rank,
        });
      } else {
        const scoreChange = Math.round((tool.score - prev.score) * 100) / 100;
        if (scoreChange > 0) {
          gainersRaw.push({
            identifier: tool.full_name,
            name: tool.full_name,
            current_score: tool.score,
            previous_score: prev.score,
            score_change: scoreChange,
            current_rank: tool.rank,
            previous_rank: prev.rank,
            rank_change: prev.rank - tool.rank,
          });
        } else if (scoreChange < 0) {
          losersRaw.push({
            identifier: tool.full_name,
            name: tool.full_name,
            current_score: tool.score,
            previous_score: prev.score,
            score_change: scoreChange,
            current_rank: tool.rank,
            previous_rank: prev.rank,
            rank_change: prev.rank - tool.rank,
          });
        }
      }
    }

    topGainers = gainersRaw.sort((a, b) => b.score_change - a.score_change).slice(0, 5);
    topLosers = losersRaw.sort((a, b) => a.score_change - b.score_change).slice(0, 5);
    newEntries = newEntriesRaw.sort((a, b) => b.score - a.score).slice(0, 10);
    console.log(`Baseline comparison: ${topGainers.length} gainers, ${topLosers.length} losers, ${newEntriesRaw.length} new entries`);
  }

  const hasMoversData = movers.has_data || (baseline !== null && topGainers.length + topLosers.length + newEntries.length > 0);

  // --- Tweet snippet ---
  let tweet: string;
  if (topGainers.length > 0) {
    const top = topGainers[0];
    const delta =
      top.score_change > 0 ? `+${top.score_change}` : `${top.score_change}`;
    tweet = `This week in MCP: ${newReposCount > 0 ? newReposCount + " new tools," : ""} ${topGainers.length} tools gained score.\n\nBiggest riser: ${top.identifier} (${delta} pts, now #${top.current_rank})\n\nFull report: agentrank-ai.com/blog/${slug}/`.replace(/  +/g, " ").trim();
  } else if (baseline) {
    tweet = `This week in MCP: ${totalTools.toLocaleString("en-US")} tools indexed${newReposCount > 0 ? ", " + newReposCount + " new this week" : ""}.\n\nFull weekly report: agentrank-ai.com/blog/${slug}/`;
  } else {
    // First report — no baseline, no comparison
    tweet = `First weekly MCP report: ${totalTools.toLocaleString("en-US")} tools indexed and scored. Tracking freshness, issue health, stars, contributors, and dependents.\n\nFull report: agentrank-ai.com/blog/${slug}/`;
  }
  if (tweet.length > 280) tweet = tweet.slice(0, 277) + "...";

  // --- Write JSON summary ---
  const weeklyData = {
    date: today,
    generated_at: new Date().toISOString(),
    stats: {
      total_tools: totalTools,
      total_skills: totalSkills,
      new_tools_this_week: newReposCount,
      avg_score: avgScore,
    },
    top10: top10.map((t) => ({
      rank: t.rank,
      full_name: t.full_name,
      score: t.score,
      stars: t.stars,
      language: t.language,
    })),
    gainers: topGainers,
    losers: topLosers,
    new_entries: newEntries,
    most_active: mostActiveRows,
    languages: langRows,
    tweet,
    has_movers_data: hasMoversData,
    movers_comparison_date: movers.comparison_date ?? baseline?.date ?? null,
  };

  const weeklyJsonPath = path.resolve(WEEKLY_DIR, `${today}.json`);
  fs.writeFileSync(weeklyJsonPath, JSON.stringify(weeklyData, null, 2));
  console.log(`Weekly JSON written to ${weeklyJsonPath}`);

  // --- Generate Astro blog post ---
  const blogPost = generateBlogPost({
    today,
    slug,
    top10,
    topGainers,
    topLosers,
    newEntries,
    mostActiveRows,
    langRows,
    avgScore,
    totalTools,
    totalSkills,
    newReposCount,
    hasMoversData: hasMoversData,
    tweet,
    topNews,
  });

  fs.writeFileSync(blogPostPath, blogPost);
  console.log(`Blog post written to ${blogPostPath}`);

  // --- Update blog index ---
  updateBlogIndex({ slug, today, newReposCount, totalTools });

  // --- Save baseline snapshot for next week's comparison ---
  const newBaseline: BaselineSnapshot = {
    date: today,
    tool_count: totalTools,
    tools: Object.fromEntries(
      ranked.map((t) => [t.full_name, { score: t.score, rank: t.rank }])
    ),
  };
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(newBaseline, null, 2));
  console.log(`Baseline snapshot saved to ${BASELINE_PATH} (${totalTools} tools)`);

  console.log("\nWeekly report generation complete.");
  console.log(`  Slug:  ${slug}`);
  console.log(`  Tweet (${tweet.length} chars):\n${tweet}`);
}

// --- Blog post generator ---

interface NewsItem {
  title: string;
  summary: string | null;
  source_url: string | null;
  category: string;
  author_handle: string | null;
}

interface BlogParams {
  today: string;
  slug: string;
  top10: RankedTool[];
  topGainers: MoverEntry[];
  topLosers: MoverEntry[];
  newEntries: NewEntry[];
  mostActiveRows: {
    full_name: string;
    stars: number;
    score: number;
    last_commit_at: string;
  }[];
  langRows: { language: string; count: number }[];
  avgScore: number;
  totalTools: number;
  totalSkills: number;
  newReposCount: number;
  hasMoversData: boolean;
  tweet: string;
  topNews: NewsItem[];
}

function generateBlogPost(p: BlogParams): string {
  const formattedDate = formatDate(p.today);

  // Pre-render table rows as HTML strings to avoid JSX escaping complexity
  const top10Rows = p.top10
    .map((t) => {
      const slug = toolSlug(t.full_name);
      const lang = t.language ?? "—";
      return `          <tr>
            <td class="num rank-cell">#${t.rank}</td>
            <td class="tool-cell"><a href="/tool/${slug}/" class="tool-link">${escapeHtml(t.full_name)}</a></td>
            <td class="num score-cell">${t.score}</td>
            <td class="num">${t.stars.toLocaleString("en-US")}</td>
            <td class="lang-cell">${escapeHtml(lang)}</td>
          </tr>`;
    })
    .join("\n");

  const langTotal = p.langRows.reduce((s, l) => s + l.count, 0);
  const langRows = p.langRows
    .map((l) => {
      const pct =
        langTotal > 0 ? ((l.count / langTotal) * 100).toFixed(1) : "0";
      return `          <tr>
            <td>${escapeHtml(l.language)}</td>
            <td class="num">${l.count.toLocaleString("en-US")}</td>
            <td class="num">${pct}%</td>
            <td class="bar-cell"><div class="bar" style="width: ${pct}%"></div></td>
          </tr>`;
    })
    .join("\n");

  const gainersRows =
    p.topGainers.length > 0
      ? p.topGainers
          .map((g) => {
            const delta =
              g.score_change > 0
                ? `+${g.score_change}`
                : `${g.score_change}`;
            const slug = toolSlug(g.identifier);
            return `          <tr>
            <td class="tool-cell"><a href="/tool/${slug}/" class="tool-link">${escapeHtml(g.identifier)}</a></td>
            <td class="num positive">${escapeHtml(delta)}</td>
            <td class="num muted">#${g.previous_rank}</td>
            <td class="num">#${g.current_rank}</td>
          </tr>`;
          })
          .join("\n")
      : "";

  const losersRows =
    p.topLosers.length > 0
      ? p.topLosers
          .map((l) => {
            const delta =
              l.score_change > 0
                ? `+${l.score_change}`
                : `${l.score_change}`;
            const slug = toolSlug(l.identifier);
            return `          <tr>
            <td class="tool-cell"><a href="/tool/${slug}/" class="tool-link">${escapeHtml(l.identifier)}</a></td>
            <td class="num negative">${escapeHtml(delta)}</td>
            <td class="num muted">#${l.previous_rank}</td>
            <td class="num">#${l.current_rank}</td>
          </tr>`;
          })
          .join("\n")
      : "";

  const newEntriesRows =
    p.newEntries.length > 0
      ? p.newEntries
          .map((n) => {
            const slug = toolSlug(n.identifier);
            return `          <tr>
            <td class="tool-cell"><a href="/tool/${slug}/" class="tool-link">${escapeHtml(n.identifier)}</a></td>
            <td class="num">${n.score.toFixed(1)}</td>
            <td class="num">#${n.rank}</td>
          </tr>`;
          })
          .join("\n")
      : "";

  const noMoversNote = !p.hasMoversData
    ? `      <div class="no-data-note">
        <p>No comparison snapshot available yet — this is the first weekly report. Rankings will be compared against this week going forward.</p>
      </div>`
    : "";

  const gainersSection =
    p.topGainers.length > 0
      ? `      <table class="data-table movers-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th class="num">Score change</th>
            <th class="num">Prev rank</th>
            <th class="num">Now</th>
          </tr>
        </thead>
        <tbody>
${gainersRows}
        </tbody>
      </table>`
      : `      <p class="muted-note">No significant gainers this week.</p>`;

  const losersSection =
    p.topLosers.length > 0
      ? `      <table class="data-table movers-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th class="num">Score change</th>
            <th class="num">Prev rank</th>
            <th class="num">Now</th>
          </tr>
        </thead>
        <tbody>
${losersRows}
        </tbody>
      </table>`
      : `      <p class="muted-note">No significant drops this week.</p>`;

  const newEntriesSection =
    p.newEntries.length > 0
      ? `      <p>${p.newReposCount.toLocaleString("en-US")} new repositories entered the index this week. Top newcomers by score:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th class="num">Score</th>
            <th class="num">Rank</th>
          </tr>
        </thead>
        <tbody>
${newEntriesRows}
        </tbody>
      </table>`
      : `      <p>${p.newReposCount.toLocaleString("en-US")} new repositories entered the index this week.</p>`;

  // Escape tweet for HTML/Astro output
  const tweetHtml = escapeHtml(p.tweet);

  const newToolsDesc = p.newReposCount > 0 ? `${p.newReposCount} new MCP tools` : `${p.totalTools.toLocaleString("en-US")} MCP tools indexed`;
  const ledeNewPart = p.newReposCount > 0
    ? `<strong>${p.newReposCount.toLocaleString("en-US")} new repositories</strong>,`
    : ``;

  return `---
export const prerender = true;

import Base from '../../layouts/Base.astro';
import BlogSubscribeCTA from '../../components/BlogSubscribeCTA.astro';

const publishDate = '${p.today}';
---

<Base
  title="This Week in MCP — ${formattedDate} | AgentRank"
  description="Weekly ecosystem report: ${newToolsDesc}, biggest movers, and ecosystem stats for the week of ${formattedDate}."
  activeTab="blog"
  keywords="this week in MCP ${p.today}, MCP weekly report, MCP server updates ${formattedDate}, AgentRank weekly"
  canonicalUrl="https://agentrank-ai.com/blog/${p.slug}/"
>
  <article class="blog-post">
    <header class="post-header">
      <div class="breadcrumb"><a href="/blog/">Blog</a> <span>/</span></div>
      <h1>This Week in MCP</h1>
      <div class="post-meta">
        <time datetime={publishDate}>${formattedDate}</time>
        <span class="sep">&middot;</span>
        <span>5 min read</span>
        <span class="sep">&middot;</span>
        <span>AgentRank Index</span>
      </div>
      <p class="lede">
        Weekly data from the AgentRank index. Auto-generated from real GitHub signals every Monday.
        ${ledeNewPart}
        <strong>${p.totalTools.toLocaleString("en-US")} tools</strong> total,
        and <strong>${p.totalSkills.toLocaleString("en-US")} agent skills</strong> indexed.
      </p>
    </header>

    <nav class="toc">
      <strong>Contents</strong>
      <ol>
        <li><a href="#stats">Ecosystem stats</a></li>
        <li><a href="#new-tools">New tools this week</a></li>
        <li><a href="#gainers">Biggest gainers</a></li>
        <li><a href="#drops">Biggest drops</a></li>
        <li><a href="#top10">Current top 10</a></li>
        <li><a href="#languages">Language breakdown</a></li>
        <li><a href="#tweet">Tweet this week</a></li>
        ${p.topNews.length > 0 ? '<li><a href="#news">Top news this week</a></li>' : ''}
      </ol>
    </nav>

    <section id="stats">
      <h2>Ecosystem stats</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${p.totalTools.toLocaleString("en-US")}</div>
          <div class="stat-label">Tools indexed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${p.newReposCount > 0 ? "+" + p.newReposCount.toLocaleString("en-US") : "—"}</div>
          <div class="stat-label">New this week</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${p.totalSkills.toLocaleString("en-US")}</div>
          <div class="stat-label">Skills indexed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${p.avgScore}</div>
          <div class="stat-label">Avg score (0&ndash;100)</div>
        </div>
      </div>
    </section>

    <section id="new-tools">
      <h2>New tools this week</h2>
${newEntriesSection}
    </section>

    <section id="gainers">
      <h2>Biggest gainers</h2>
      <p>Tools with the largest score increase compared to the previous week's snapshot.</p>
${noMoversNote}
${gainersSection}
    </section>

    <section id="drops">
      <h2>Biggest drops</h2>
      <p>Tools with the largest score decrease compared to the previous week's snapshot.</p>
${losersSection}
    </section>

    <section id="top10">
      <h2>Current top 10</h2>
      <p>
        The highest-scoring tools in the index right now, scored by stars, freshness,
        issue health, contributors, and dependents.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th class="num">#</th>
            <th>Repository</th>
            <th class="num">Score</th>
            <th class="num">Stars</th>
            <th>Language</th>
          </tr>
        </thead>
        <tbody>
${top10Rows}
        </tbody>
      </table>
      <p>
        <a href="/tools/" class="inline-link">Browse all ${p.totalTools.toLocaleString("en-US")} tools &rarr;</a>
      </p>
    </section>

    <section id="languages">
      <h2>Language breakdown (top 5)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Language</th>
            <th class="num">Tools</th>
            <th class="num">Share</th>
            <th>Bar</th>
          </tr>
        </thead>
        <tbody>
${langRows}
        </tbody>
      </table>
    </section>

    <section id="tweet">
      <h2>Tweet this week</h2>
      <p>Auto-generated tweet from this week's top insight:</p>
      <div class="tweet-box">
        <pre class="tweet-text">${tweetHtml}</pre>
      </div>
    </section>

    ${p.topNews.length > 0 ? `<section id="news">
      <h2>Top news this week</h2>
      <p>Top ecosystem news from the past 7 days, ingested from Twitter and GitHub. <a href="/news/" class="inline-link">See all news &rarr;</a></p>
      <div class="news-list">
        ${p.topNews.slice(0, 7).map((n) => {
          const catLabel = n.category.charAt(0).toUpperCase() + n.category.slice(1);
          const link = n.source_url ?? "https://agentrank-ai.com/news";
          const handle = n.author_handle ? `<span class="news-handle">@${escapeHtml(n.author_handle)}</span>` : "";
          const summary = n.summary ? `<p class="news-summary">${escapeHtml(n.summary.slice(0, 200))}${n.summary.length > 200 ? "…" : ""}</p>` : "";
          return `        <div class="news-item">
          <div class="news-meta"><span class="news-cat">${escapeHtml(catLabel)}</span>${handle}</div>
          <a href="${escapeHtml(link)}" class="news-title" target="_blank" rel="noopener">${escapeHtml(n.title)}</a>
          ${summary}
        </div>`;
        }).join("\n")}
      </div>
    </section>` : ''}

    <BlogSubscribeCTA />
  </article>

  <style>
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .stat-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 0.4rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .tweet-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1rem 0;
    }

    .tweet-text {
      font-family: inherit;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text);
    }

    .muted-note {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-style: italic;
    }

    .no-data-note {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      margin: 1rem 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .news-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1rem 0;
    }

    .news-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }

    .news-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }

    .news-cat {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      border-radius: 3px;
      padding: 2px 6px;
    }

    .news-handle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .news-title {
      display: block;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
      margin-bottom: 0.3rem;
    }

    .news-title:hover {
      color: var(--accent);
    }

    .news-summary {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
  </style>
</Base>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Blog index updater ---

function updateBlogIndex(params: {
  slug: string;
  today: string;
  newReposCount: number;
  totalTools: number;
}): void {
  if (!fs.existsSync(BLOG_INDEX)) {
    console.warn("Blog index not found, skipping update.");
    return;
  }

  const content = fs.readFileSync(BLOG_INDEX, "utf-8");

  // Check if already in the index
  if (content.includes(`slug: '${params.slug}'`)) {
    console.log("Blog index already contains this week's entry, skipping.");
    return;
  }

  const formattedDate = formatDate(params.today);
  const newEntry = `  {
    slug: '${params.slug}',
    title: 'This Week in MCP — ${formattedDate}',
    description: 'Weekly ecosystem report: ${params.newReposCount} new tools, biggest movers, and index stats for the week of ${formattedDate}. Auto-generated from the AgentRank index.',
    date: '${params.today}',
    readTime: '5 min read',
  },`;

  // Insert after `const posts = [`
  const insertAfter = "const posts = [";
  const idx = content.indexOf(insertAfter);
  if (idx === -1) {
    console.warn("Could not find posts array in blog index, skipping update.");
    return;
  }

  const insertAt = idx + insertAfter.length;
  const updated =
    content.slice(0, insertAt) +
    "\n" +
    newEntry +
    content.slice(insertAt);

  fs.writeFileSync(BLOG_INDEX, updated);
  console.log("Blog index updated.");
}

main().catch((e) => { console.error(e); process.exit(1); });
