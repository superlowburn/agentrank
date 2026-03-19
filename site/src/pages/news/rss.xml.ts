/**
 * GET /news/rss.xml — RSS 2.0 feed of published AgentRank news items.
 *
 * Queries D1 news_items directly (published only), reverse-chronological.
 * Falls back to empty feed if the table doesn't exist yet.
 */

import type { APIRoute } from 'astro';

export const prerender = false;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

interface NewsRow {
  id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  source: string;
  category: string;
  author: string | null;
  author_handle: string | null;
  engagement_score: number;
  published_at: string;
}

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;

  const SITE = 'https://agentrank-ai.com';
  const FEED_URL = `${SITE}/news/rss.xml`;
  const NEWS_URL = `${SITE}/news`;

  let items: NewsRow[] = [];

  try {
    const result = await env.DB.prepare(`
      SELECT id, title, summary, source_url, source, category,
             author, author_handle, engagement_score, published_at
      FROM news_items
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 50
    `).all();
    items = result.results as NewsRow[];
  } catch {
    // Table not yet populated — return empty feed
    items = [];
  }

  const now = new Date().toUTCString();

  const itemsXml = items.map((item) => {
    const title = escapeXml(item.title);
    const description = item.summary ? escapeXml(item.summary) : title;
    const link = item.source_url ? escapeXml(item.source_url) : escapeXml(NEWS_URL);
    const guid = escapeXml(`${SITE}/news#${item.id}`);
    const pubDate = item.published_at ? rfc822(item.published_at) : now;
    const author = item.author_handle ? escapeXml(`@${item.author_handle}`) : '';
    const category = escapeXml(item.category);

    return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <description>${description}</description>
    <guid isPermaLink="false">${guid}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${category}</category>
    ${author ? `<author>${author}</author>` : ''}
  </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AgentRank News — MCP Ecosystem Updates</title>
    <link>${SITE}</link>
    <description>Daily news from the MCP server and AI agent tool ecosystem, curated by AgentRank.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE}/og/home.png</url>
      <title>AgentRank</title>
      <link>${SITE}</link>
    </image>${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, max-age=600',
    },
  });
};
