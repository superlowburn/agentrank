/**
 * generate-weekly-roundup.mjs
 *
 * Generates the weekly "This Week in MCP" blog post and weekly JSON summary
 * from data/ranked.json + data/weekly/baseline.json.
 *
 * Usage:
 *   node scripts/generate-weekly-roundup.mjs [--date YYYY-MM-DD]
 *
 * Reads:
 *   - data/ranked.json              (current full ranked list)
 *   - data/ranked-skills.json       (for total skills count)
 *   - data/weekly/baseline.json     (previous week's snapshot)
 *
 * Writes:
 *   - data/weekly/YYYY-MM-DD.json   (structured weekly summary)
 *   - data/weekly/baseline.json     (updated to current week)
 *   - site/src/pages/blog/this-week-in-mcp-YYYY-MM-DD.astro
 *   - Updates site/src/pages/blog/index.astro
 *
 * Idempotent: re-running for the same date produces identical output.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RANKED_PATH    = join(ROOT, 'data', 'ranked.json');
const SKILLS_PATH    = join(ROOT, 'data', 'ranked-skills.json');
const WEEKLY_DIR     = join(ROOT, 'data', 'weekly');
const BASELINE_PATH  = join(WEEKLY_DIR, 'baseline.json');
const BLOG_DIR       = join(ROOT, 'site', 'src', 'pages', 'blog');
const BLOG_INDEX     = join(BLOG_DIR, 'index.astro');

// ── CLI arg: --date YYYY-MM-DD ────────────────────────────────────────────────
const dateArgIdx = process.argv.indexOf('--date');
const today = dateArgIdx !== -1 && process.argv[dateArgIdx + 1]
  ? process.argv[dateArgIdx + 1]
  : new Date().toISOString().slice(0, 10);

const slug        = `this-week-in-mcp-${today}`;
const blogPostPath = join(BLOG_DIR, `${slug}.astro`);

// ── Idempotency check ─────────────────────────────────────────────────────────
if (existsSync(blogPostPath)) {
  console.log(`Weekly roundup already generated for ${today}. Skipping.`);
  process.exit(0);
}

if (!existsSync(WEEKLY_DIR)) mkdirSync(WEEKLY_DIR, { recursive: true });

// ── Load data ─────────────────────────────────────────────────────────────────
console.log('Loading ranked.json...');
const ranked = JSON.parse(readFileSync(RANKED_PATH, 'utf-8'));

console.log('Loading ranked-skills.json...');
let totalSkills = 0;
try {
  const skills = JSON.parse(readFileSync(SKILLS_PATH, 'utf-8'));
  totalSkills = Array.isArray(skills) ? skills.length : 0;
} catch { /* non-fatal */ }

console.log('Loading baseline snapshot...');
let baseline = null;
if (existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
  console.log(`  Baseline date: ${baseline.date} (${baseline.tool_count} tools)`);
} else {
  console.log('  No baseline found — first weekly report.');
}

// ── Compute stats from ranked.json ────────────────────────────────────────────
const totalTools = ranked.length;
const avgScore = ranked.length > 0
  ? Math.round((ranked.reduce((s, t) => s + (t.score ?? 0), 0) / ranked.length) * 10) / 10
  : 0;
const top10 = ranked.slice(0, 10);

// Language breakdown (top 5)
const langCounts = {};
for (const t of ranked) {
  if (t.language) langCounts[t.language] = (langCounts[t.language] ?? 0) + 1;
}
const langRows = Object.entries(langCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([lang, count]) => ({ language: lang, count }));

// Notable commits/releases: high-scoring repos with commits in last 7 days
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const mostActiveRows = ranked
  .filter(t => t.last_commit_at && new Date(t.last_commit_at).getTime() >= sevenDaysAgo)
  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  .slice(0, 5)
  .map(t => ({
    full_name: t.full_name,
    stars: t.stars ?? 0,
    score: t.score ?? 0,
    last_commit_at: t.last_commit_at,
  }));

// ── Movers vs baseline ────────────────────────────────────────────────────────
let newReposCount  = 0;
let topGainers     = [];
let topLosers      = [];
let newEntries     = [];

if (baseline) {
  const baselineTools = baseline.tools ?? {};
  const gainersRaw = [];
  const losersRaw  = [];
  const newRaw     = [];

  for (const tool of ranked) {
    const prev = baselineTools[tool.full_name];
    if (!prev) {
      newRaw.push({
        identifier: tool.full_name,
        name: tool.full_name,
        score: tool.score ?? 0,
        rank: tool.rank ?? 0,
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
  topLosers  = losersRaw.sort((a, b) => a.score_change - b.score_change).slice(0, 5);
  newEntries = newRaw.sort((a, b) => b.score - a.score).slice(0, 10);
  newReposCount = newRaw.length;
  console.log(`Baseline comparison: ${topGainers.length} gainers, ${topLosers.length} losers, ${newRaw.length} new entries`);
} else {
  console.log('No baseline — skipping movers computation.');
}

const hasMoversData = baseline !== null && (topGainers.length + topLosers.length + newEntries.length > 0);

// ── Tweet snippet ─────────────────────────────────────────────────────────────
let tweet;
if (topGainers.length > 0) {
  const top = topGainers[0];
  const delta = top.score_change > 0 ? `+${top.score_change}` : `${top.score_change}`;
  tweet = `This week in MCP: ${newReposCount > 0 ? newReposCount + ' new tools, ' : ''}${topGainers.length} tools gained score.\n\nBiggest riser: ${top.identifier} (${delta} pts, now #${top.current_rank})\n\nFull report: agentrank-ai.com/blog/${slug}/`;
} else if (baseline) {
  tweet = `This week in MCP: ${totalTools.toLocaleString('en-US')} tools indexed${newReposCount > 0 ? ', ' + newReposCount + ' new this week' : ''}.\n\nFull weekly report: agentrank-ai.com/blog/${slug}/`;
} else {
  tweet = `First weekly MCP report: ${totalTools.toLocaleString('en-US')} tools indexed and scored.\n\nFull report: agentrank-ai.com/blog/${slug}/`;
}
if (tweet.length > 280) tweet = tweet.slice(0, 277) + '...';

// ── Write weekly JSON ─────────────────────────────────────────────────────────
const weeklyData = {
  date: today,
  generated_at: new Date().toISOString(),
  stats: { total_tools: totalTools, total_skills: totalSkills, new_tools_this_week: newReposCount, avg_score: avgScore },
  top10: top10.map(t => ({ rank: t.rank, full_name: t.full_name, score: t.score, stars: t.stars, language: t.language })),
  gainers: topGainers,
  losers: topLosers,
  new_entries: newEntries,
  most_active: mostActiveRows,
  languages: langRows,
  tweet,
  has_movers_data: hasMoversData,
  movers_comparison_date: baseline?.date ?? null,
};

const weeklyJsonPath = join(WEEKLY_DIR, `${today}.json`);
writeFileSync(weeklyJsonPath, JSON.stringify(weeklyData, null, 2));
console.log(`Weekly JSON written to ${weeklyJsonPath}`);

// ── Generate Astro blog post ──────────────────────────────────────────────────
const blogPost = generateBlogPost({ today, slug, top10, topGainers, topLosers, newEntries, mostActiveRows, langRows, avgScore, totalTools, totalSkills, newReposCount, hasMoversData, tweet });
writeFileSync(blogPostPath, blogPost);
console.log(`Blog post written to ${blogPostPath}`);

// ── Update blog index ─────────────────────────────────────────────────────────
updateBlogIndex({ slug, today, newReposCount, totalTools });

// ── Save new baseline ─────────────────────────────────────────────────────────
const newBaseline = {
  date: today,
  tool_count: totalTools,
  tools: Object.fromEntries(ranked.map(t => [t.full_name, { score: t.score, rank: t.rank }])),
};
writeFileSync(BASELINE_PATH, JSON.stringify(newBaseline, null, 2));
console.log(`Baseline saved to ${BASELINE_PATH} (${totalTools} tools)`);

console.log(`\nWeekly roundup complete.`);
console.log(`  Slug:  ${slug}`);
console.log(`  Tweet (${tweet.length} chars):\n${tweet}`);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toolSlug(fullName) {
  return fullName.replace(/\//g, '--');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Return the 3 most recent "this-week-in-mcp-*" posts before today, plus 2 evergreen posts. */
function buildRelatedPosts(today) {
  const related = [];
  if (existsSync(BLOG_DIR)) {
    const weekly = readdirSync(BLOG_DIR)
      .filter(f => /^this-week-in-mcp-\d{4}-\d{2}-\d{2}\.astro$/.test(f))
      .map(f => f.replace('.astro', ''))
      .filter(s => s < `this-week-in-mcp-${today}`)
      .sort()
      .reverse()
      .slice(0, 3);
    for (const s of weekly) {
      const d = s.replace('this-week-in-mcp-', '');
      related.push({ href: `/blog/${s}/`, title: `This Week in MCP — ${formatShortDate(d)}` });
    }
  }
  const evergreen = [
    { href: '/blog/mcp-server-landscape-q1-2026/', title: 'The MCP Server Landscape: Q1 2026' },
    { href: '/blog/how-to-choose-an-mcp-server/', title: 'How to Choose an MCP Server in 2026' },
    { href: '/blog/top-mcp-servers-2026/', title: 'Top 10 MCP Servers for AI Agents in 2026' },
    { href: '/blog/mcp-server-comparison-top-10/', title: 'MCP Server Comparison: Top 10 Head-to-Head' },
    { href: '/blog/state-of-mcp-2026/', title: 'The State of MCP Servers & Agent Tools in 2026' },
  ];
  for (const e of evergreen) {
    if (related.length >= 5) break;
    if (!related.find(r => r.href === e.href)) related.push(e);
  }
  return related.slice(0, 5);
}

function generateBlogPost({ today, slug, top10, topGainers, topLosers, newEntries, mostActiveRows, langRows, avgScore, totalTools, totalSkills, newReposCount, hasMoversData, tweet }) {
  const formattedDate = formatDate(today);
  const relatedPosts  = buildRelatedPosts(today);

  const newToolsDesc = newReposCount > 0
    ? `${newReposCount} new MCP tools entered the index`
    : `${totalTools.toLocaleString('en-US')} MCP tools indexed`;

  // ── Top-10 rows ──
  const top10Rows = top10.map(t => `          <tr>
            <td class="num rank-cell">#${t.rank}</td>
            <td class="tool-cell"><a href="/tool/${toolSlug(t.full_name)}/" class="tool-link">${escapeHtml(t.full_name)}</a></td>
            <td class="num score-cell">${t.score}</td>
            <td class="num">${(t.stars ?? 0).toLocaleString('en-US')}</td>
            <td class="lang-cell">${escapeHtml(t.language ?? '—')}</td>
          </tr>`).join('\n');

  // ── Language rows ──
  const langTotal = langRows.reduce((s, l) => s + l.count, 0);
  const langRowsHtml = langRows.map(l => {
    const pct = langTotal > 0 ? ((l.count / langTotal) * 100).toFixed(1) : '0';
    return `          <tr>
            <td>${escapeHtml(l.language)}</td>
            <td class="num">${l.count.toLocaleString('en-US')}</td>
            <td class="num">${pct}%</td>
            <td class="bar-cell"><div class="bar" style="width: ${pct}%"></div></td>
          </tr>`;
  }).join('\n');

  // ── Gainers rows ──
  const gainersRows = topGainers.map(g => {
    const delta = g.score_change > 0 ? `+${g.score_change}` : `${g.score_change}`;
    return `          <tr>
            <td class="tool-cell"><a href="/tool/${toolSlug(g.identifier)}/" class="tool-link">${escapeHtml(g.identifier)}</a></td>
            <td class="num positive">${escapeHtml(delta)}</td>
            <td class="num muted">#${g.previous_rank}</td>
            <td class="num">#${g.current_rank}</td>
          </tr>`;
  }).join('\n');

  // ── Losers rows ──
  const losersRows = topLosers.map(l => {
    const delta = l.score_change > 0 ? `+${l.score_change}` : `${l.score_change}`;
    return `          <tr>
            <td class="tool-cell"><a href="/tool/${toolSlug(l.identifier)}/" class="tool-link">${escapeHtml(l.identifier)}</a></td>
            <td class="num negative">${escapeHtml(delta)}</td>
            <td class="num muted">#${l.previous_rank}</td>
            <td class="num">#${l.current_rank}</td>
          </tr>`;
  }).join('\n');

  // ── New entries section ──
  const newEntriesRows = newEntries.map(n => `          <tr>
            <td class="tool-cell"><a href="/tool/${toolSlug(n.identifier)}/" class="tool-link">${escapeHtml(n.identifier)}</a></td>
            <td class="num">${n.score.toFixed(1)}</td>
            <td class="num">#${n.rank}</td>
          </tr>`).join('\n');

  const newEntriesSection = newEntries.length > 0
    ? `      <p>${newReposCount.toLocaleString('en-US')} new repositories entered the index this week. Top newcomers by score:</p>
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
    : `      <p>${newReposCount.toLocaleString('en-US')} new repositories entered the index this week.</p>`;

  // ── Gainers section ──
  const noMoversNote = !hasMoversData
    ? `      <div class="no-data-note">
        <p>No comparison snapshot available yet — this is the first weekly report. Rankings will be compared against this week going forward.</p>
      </div>`
    : '';

  const gainersSection = topGainers.length > 0
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

  // ── Losers section ──
  const losersSection = topLosers.length > 0
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

  // ── Notable commits/releases section ──
  const commitsSection = mostActiveRows.length > 0
    ? `    <section id="commits">
      <h2>Notable commits &amp; releases</h2>
      <p>High-scoring tools with commits in the last 7 days.</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th class="num">Score</th>
            <th class="num">Stars</th>
            <th>Last commit</th>
          </tr>
        </thead>
        <tbody>
${mostActiveRows.map(r => `          <tr>
            <td class="tool-cell"><a href="/tool/${toolSlug(r.full_name)}/" class="tool-link">${escapeHtml(r.full_name)}</a></td>
            <td class="num score-cell">${r.score}</td>
            <td class="num">${r.stars.toLocaleString('en-US')}</td>
            <td class="date-cell">${r.last_commit_at ? r.last_commit_at.slice(0, 10) : '—'}</td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </section>

`
    : '';

  // ── Related posts JSON ──
  const relatedPostsJson = JSON.stringify(relatedPosts, null, 2).replace(/"/g, "'");

  // ── JSON-LD ──
  const descriptionText = newReposCount > 0
    ? `Weekly ecosystem report: ${newReposCount} new tools indexed this week, biggest score movers, and ecosystem stats for the week of ${formattedDate}.`
    : `Weekly ecosystem report: ${totalTools.toLocaleString('en-US')} MCP tools indexed, biggest score movers, and ecosystem stats for the week of ${formattedDate}.`;

  const keywords = `this week in MCP ${today}, MCP weekly report, MCP server updates ${formattedDate}, AgentRank weekly, mcp server news, mcp tools this week`;

  const tweetHtml = escapeHtml(tweet);

  const ledeNewPart = newReposCount > 0
    ? `<strong>${newReposCount.toLocaleString('en-US')} new repositories</strong>,`
    : '';

  return `---
export const prerender = true;

import Base from '../../layouts/Base.astro';
import BlogSubscribeCTA from '../../components/BlogSubscribeCTA.astro';
import RelatedPosts from '../../components/RelatedPosts.astro';

const relatedPosts = ${relatedPostsJson};

const publishDate = '${today}';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'This Week in MCP \u2014 ${formattedDate}',
  description: '${escapeHtml(descriptionText)}',
  datePublished: publishDate,
  dateModified: publishDate,
  author: {
    '@type': 'Organization',
    name: 'AgentRank',
    url: 'https://agentrank-ai.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AgentRank',
    url: 'https://agentrank-ai.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://agentrank-ai.com/og-image.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://agentrank-ai.com/blog/${slug}/',
  },
  image: 'https://agentrank-ai.com/og/${slug}.png',
  keywords: '${keywords}',
};
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How often does AgentRank publish ecosystem updates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "AgentRank publishes a weekly 'This Week in MCP' digest covering the biggest movers, new tools entering the top 100, and notable ecosystem events. Subscribe to the newsletter for automatic delivery.",
      },
    },
    {
      '@type': 'Question',
      name: 'How many new MCP servers are added each week?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Based on index data from ${today}, dozens to hundreds of new MCP-related repositories are discovered each week. The ecosystem is growing rapidly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I track MCP server score changes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The AgentRank Movers page shows the biggest week-over-week score changes. Subscribe to the digest for a curated weekly summary.',
      },
    },
  ],
};
---

<Base
  title="This Week in MCP \u2014 ${formattedDate} | AgentRank"
  description="${escapeHtml(descriptionText)}"
  activeTab="blog"
  keywords="${keywords}"
  canonicalUrl="https://agentrank-ai.com/blog/${slug}/"
  jsonLd={[jsonLd, faqJsonLd]}
  ogImage="/og/${slug}.png"
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
        <strong>${totalTools.toLocaleString('en-US')} tools</strong> total,
        and <strong>${totalSkills.toLocaleString('en-US')} agent skills</strong> indexed.
      </p>
    </header>

    <nav class="toc">
      <strong>Contents</strong>
      <ol>
        <li><a href="#stats">Ecosystem stats</a></li>
        <li><a href="#new-tools">New tools this week</a></li>
        <li><a href="#gainers">Biggest gainers</a></li>
        <li><a href="#drops">Biggest drops</a></li>
        <li><a href="#top10">Current top 10</a></li>${mostActiveRows.length > 0 ? `
        <li><a href="#commits">Notable commits &amp; releases</a></li>` : ''}
        <li><a href="#languages">Language breakdown</a></li>
        <li><a href="#tweet">Tweet this week</a></li>
      </ol>
    </nav>

    <section id="stats">
      <h2>Ecosystem stats</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${totalTools.toLocaleString('en-US')}</div>
          <div class="stat-label">Tools indexed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${newReposCount > 0 ? '+' + newReposCount.toLocaleString('en-US') : '&mdash;'}</div>
          <div class="stat-label">New this week</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${totalSkills.toLocaleString('en-US')}</div>
          <div class="stat-label">Skills indexed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${avgScore}</div>
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
        <a href="/tools/" class="inline-link">Browse all ${totalTools.toLocaleString('en-US')} tools &rarr;</a>
      </p>
    </section>

${commitsSection}    <section id="languages">
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
${langRowsHtml}
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

    <RelatedPosts posts={relatedPosts} />
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

    .date-cell {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }
  </style>
</Base>
`;
}

// ─────────────────────────────────────────────────────────────────────────────

function updateBlogIndex({ slug, today, newReposCount, totalTools }) {
  if (!existsSync(BLOG_INDEX)) {
    console.warn('Blog index not found, skipping update.');
    return;
  }

  const content = readFileSync(BLOG_INDEX, 'utf-8');
  if (content.includes(`slug: '${slug}'`)) {
    console.log('Blog index already contains this week\'s entry, skipping.');
    return;
  }

  const formattedDate = formatDate(today);
  const newEntry = `  {
    slug: '${slug}',
    title: 'This Week in MCP \u2014 ${formattedDate}',
    description: 'Weekly ecosystem report: ${newReposCount} new tools, biggest movers, and index stats for the week of ${formattedDate}. Auto-generated from the AgentRank index.',
    date: '${today}',
    readTime: '5 min read',
  },`;

  const insertAfter = 'const posts = [';
  const idx = content.indexOf(insertAfter);
  if (idx === -1) {
    console.warn('Could not find posts array in blog index, skipping update.');
    return;
  }

  const insertAt = idx + insertAfter.length;
  const updated = content.slice(0, insertAt) + '\n' + newEntry + content.slice(insertAt);
  writeFileSync(BLOG_INDEX, updated);
  console.log('Blog index updated.');
}
