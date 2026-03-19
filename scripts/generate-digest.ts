/**
 * generate-digest.ts
 *
 * Generates the weekly AgentRank digest email from local data files.
 *
 * Usage:
 *   npx tsx scripts/generate-digest.ts
 *
 * Reads:
 *   - data/weekly/{latest-date}.json  (top10, gainers, losers, new_entries, stats)
 *   - site/src/pages/blog/this-week-in-mcp-{date}.astro  (featured blog post)
 *
 * Writes:
 *   - site/src/pages/newsletter-{date}.html  (preview-ready HTML)
 *
 * Prints the subject line to stdout.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateDigestEmail, type DigestData } from '../site/src/lib/email-template.js';

// ---------------------------------------------------------------------------
// Fetch top news from live API (best-effort — fails silently)
// ---------------------------------------------------------------------------

async function fetchTopNews(): Promise<DigestData['top_news']> {
  try {
    const res = await fetch('https://agentrank-ai.com/api/v1/news?limit=7', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const data = await res.json() as { items: any[]; meta: { mock: boolean } };
    // Skip mock data — only include real ingested news
    if (data.meta?.mock) return undefined;
    return data.items.map((n: any) => ({
      title: n.title,
      summary: n.summary ?? null,
      source_url: n.source_url ?? null,
      category: n.category ?? 'community',
      author_handle: n.author_handle ?? null,
    }));
  } catch {
    return undefined;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Step 1: Find the latest weekly JSON
// ---------------------------------------------------------------------------

const weeklyDir = join(ROOT, 'data', 'weekly');
const weeklyFiles = readdirSync(weeklyDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .sort()
  .reverse();

if (weeklyFiles.length === 0) {
  console.error('No weekly data files found in data/weekly/');
  process.exit(1);
}

const latestWeeklyFile = weeklyFiles[0];
const weeklyDate = latestWeeklyFile.replace('.json', '');
const weeklyData = JSON.parse(readFileSync(join(weeklyDir, latestWeeklyFile), 'utf-8'));

console.error(`Using weekly data: ${latestWeeklyFile}`);

// ---------------------------------------------------------------------------
// Step 2: Find the latest "this-week-in-mcp" blog post
// ---------------------------------------------------------------------------

const blogDir = join(ROOT, 'site', 'src', 'pages', 'blog');
let featuredBlog: DigestData['featured_blog'];

try {
  const blogFiles = readdirSync(blogDir)
    .filter(f => /^this-week-in-mcp-\d{4}-\d{2}-\d{2}\.astro$/.test(f))
    .sort()
    .reverse();

  if (blogFiles.length > 0) {
    const latestBlog = blogFiles[0];
    const blogDate = latestBlog.replace('this-week-in-mcp-', '').replace('.astro', '');
    const blogUrl = `https://agentrank-ai.com/blog/this-week-in-mcp-${blogDate}/`;

    // Extract title from the astro file
    const blogContent = readFileSync(join(blogDir, latestBlog), 'utf-8');

    let title = `This Week in MCP — ${blogDate}`;

    // Try title= attribute: title="This Week in MCP — ... | AgentRank"
    const titleAttrMatch = blogContent.match(/title="([^"]*This Week in MCP[^"]+)"/);
    if (titleAttrMatch) {
      title = titleAttrMatch[1].replace(/\s*\|\s*AgentRank$/, '').trim();
    } else {
      // Fallback: look for <h1> tag content + date
      const h1Match = blogContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
      if (h1Match) {
        const dateObj = new Date(blogDate + 'T00:00:00Z');
        const fmtBlogDate = dateObj.toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
        });
        title = `${h1Match[1].trim()} — ${fmtBlogDate}`;
      }
    }

    featuredBlog = {
      title,
      url: blogUrl,
      description: `The latest MCP ecosystem report: top movers, new tools, and ecosystem stats for the week of ${blogDate}.`,
    };

    console.error(`Featured blog: ${latestBlog} → "${title}"`);
  }
} catch (e) {
  console.error(`Could not detect blog post (non-fatal): ${(e as Error).message}`);
}

// ---------------------------------------------------------------------------
// Step 3: Build DigestData from weekly JSON
// ---------------------------------------------------------------------------

const topNews = await fetchTopNews();
if (topNews?.length) {
  console.error(`Fetched ${topNews.length} published news items for digest`);
} else {
  console.error('No published news items found (pipeline may not be running yet)');
}

const digestData: DigestData = {
  date: weeklyData.date ?? weeklyDate,
  stats: {
    total_tools: weeklyData.stats?.total_tools ?? 0,
    total_skills: weeklyData.stats?.total_skills ?? 0,
    new_tools_this_week: weeklyData.stats?.new_tools_this_week ?? 0,
    avg_score: weeklyData.stats?.avg_score ?? 0,
  },
  top10: (weeklyData.top10 ?? []).map((t: any) => ({
    rank: t.rank,
    full_name: t.full_name,
    score: t.score,
    stars: t.stars ?? 0,
    language: t.language ?? '',
  })),
  gainers: (weeklyData.gainers ?? []).map((g: any) => ({
    name: g.name ?? g.identifier,
    current_score: g.current_score,
    score_change: g.score_change,
    current_rank: g.current_rank,
    rank_change: g.rank_change,
  })),
  losers: (weeklyData.losers ?? []).map((l: any) => ({
    name: l.name ?? l.identifier,
    current_score: l.current_score,
    score_change: l.score_change,
    current_rank: l.current_rank,
    rank_change: l.rank_change,
  })),
  new_entries: (weeklyData.new_entries ?? []).map((e: any) => ({
    full_name: e.full_name,
    score: e.score,
    stars: e.stars ?? 0,
    language: e.language ?? '',
  })),
  featured_blog: featuredBlog,
  top_news: topNews,
  // Placeholder unsubscribe URL for preview; real sends inject per-subscriber token
  unsubscribe_url: 'https://agentrank-ai.com/unsubscribe?preview=1',
};

// ---------------------------------------------------------------------------
// Step 4: Generate email
// ---------------------------------------------------------------------------

const { html, subject } = generateDigestEmail(digestData);

// ---------------------------------------------------------------------------
// Step 5: Write preview HTML
// ---------------------------------------------------------------------------

const outFile = join(ROOT, 'site', 'src', 'pages', `newsletter-${weeklyDate}.html`);
writeFileSync(outFile, html, 'utf-8');

console.error(`Preview written to: site/src/pages/newsletter-${weeklyDate}.html`);

// Print subject to stdout (for piping/scripting)
console.log(subject);
