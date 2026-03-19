/**
 * GET  /api/v1/news — Public. Returns published news items, reverse-chronological, paginated.
 *   ?limit=20 &offset=0 &category=community &source=manual
 *
 * POST /api/v1/news — Internal ingestion endpoint.
 *   Requires Authorization: Bearer $DASH_TOKEN
 *   Body (JSON): { title, summary?, source_url?, source?, category?,
 *                  related_tool_slugs?, author?, author_handle?,
 *                  thread_context?, engagement_score?, status?, published_at? }
 */

import type { APIRoute } from 'astro';
import { randomUUID } from 'crypto';

// Placeholder items displayed before the news_items table is populated in D1.
// Remove (or leave) once real items start flowing from the ingestion pipeline.
const MOCK_NEWS_ITEMS = [
  {
    id: 'mock-1',
    title: 'FastMCP reaches 10k GitHub stars',
    summary: 'The Python MCP framework hit a major milestone this week, cementing its position as the go-to library for building MCP servers quickly. The project saw 500+ new stars in the last 7 days.',
    source_url: 'https://github.com/jlowin/fastmcp',
    source: 'github',
    category: 'trending',
    related_tool_slugs: ['jlowin-fastmcp'],
    author: 'Jeremiah Lowin',
    author_handle: 'jlowin',
    engagement_score: 95,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'mcp-use launches multi-agent orchestration support',
    summary: 'mcp-use shipped v0.4.0 with native support for coordinating multiple MCP clients in a single pipeline. Enables complex agent workflows with shared tool access.',
    source_url: 'https://github.com/mcp-use/mcp-use',
    source: 'github',
    category: 'launch',
    related_tool_slugs: ['mcp-use-mcp-use'],
    author: 'mcp-use team',
    author_handle: 'mcp_use',
    engagement_score: 88,
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Home Assistant MCP server adds 40 new tool endpoints',
    summary: 'The ha-mcp project dropped a massive update exposing nearly every Home Assistant service as an MCP tool. Covers lights, climate, media players, and automations.',
    source_url: 'https://github.com/homeassistant-ai/ha-mcp',
    source: 'github',
    category: 'update',
    related_tool_slugs: ['homeassistant-ai-ha-mcp'],
    author: 'HA AI Team',
    author_handle: 'homeassistant_ai',
    engagement_score: 82,
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'Community spotlight: Serena now supports 12 language servers',
    summary: "Oraios's Serena project — a semantic coding MCP — expanded LSP support to cover Go, Rust, Java, and more. Users are reporting 40% fewer hallucinated code edits from their AI assistants.",
    source_url: 'https://github.com/oraios/serena',
    source: 'twitter',
    category: 'community',
    related_tool_slugs: ['oraios-serena'],
    author: 'AgentRank Community',
    author_handle: 'AgentRank_ai',
    engagement_score: 74,
    published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    title: 'mark3labs/mcp-go hits 3k dependents',
    summary: 'The Go MCP SDK is now one of the most-depended-on packages in the ecosystem. Its clean API and zero-dependency footprint are driving adoption across enterprise Go shops.',
    source_url: 'https://github.com/mark3labs/mcp-go',
    source: 'github',
    category: 'trending',
    related_tool_slugs: ['mark3labs-mcp-go'],
    author: 'mark3labs',
    author_handle: 'mark3labs',
    engagement_score: 71,
    published_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    title: 'Microsoft ships Azure DevOps MCP to GA',
    summary: 'After 6 weeks in preview, the Azure DevOps MCP server graduated to general availability. Supports pipelines, boards, repos, and artifacts from a single MCP connection.',
    source_url: 'https://github.com/microsoft/azure-devops-mcp',
    source: 'github',
    category: 'launch',
    related_tool_slugs: ['microsoft-azure-devops-mcp'],
    author: 'Microsoft',
    author_handle: 'Microsoft',
    engagement_score: 68,
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
  },
];

export const prerender = false;

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;

  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
  const category = url.searchParams.get('category') || '';
  const source = url.searchParams.get('source') || '';

  try {
    let query = `SELECT id, title, summary, source_url, source, category,
                        related_tool_slugs, author, author_handle,
                        engagement_score, published_at, ingested_at
                 FROM news_items
                 WHERE status = 'published'`;
    const bindings: (string | number)[] = [];

    if (category) {
      query += ` AND category = ?${bindings.length + 1}`;
      bindings.push(category);
    }
    if (source) {
      query += ` AND source = ?${bindings.length + 1}`;
      bindings.push(source);
    }

    query += ` ORDER BY published_at DESC LIMIT ?${bindings.length + 1} OFFSET ?${bindings.length + 2}`;
    bindings.push(limit, offset);

    const stmt = env.DB.prepare(query).bind(...bindings);
    const result = await stmt.all();
    const dbItems = (result.results || []).map((row: any) => ({
      ...row,
      related_tool_slugs: row.related_tool_slugs ? JSON.parse(row.related_tool_slugs) : [],
    }));

    // If no items in DB yet, fall back to mock data for a non-empty page experience
    const items = dbItems.length > 0 ? dbItems : MOCK_NEWS_ITEMS;

    return json(
      { items, meta: { limit, offset, count: items.length, mock: dbItems.length === 0 } },
      200,
      { 'Cache-Control': 'public, s-maxage=60, max-age=30' }
    );
  } catch {
    // Table not yet created — serve mock data so the page is functional
    const filtered = category
      ? MOCK_NEWS_ITEMS.filter((n) => n.category === category)
      : source
        ? MOCK_NEWS_ITEMS.filter((n) => n.source === source)
        : MOCK_NEWS_ITEMS;
    const items = filtered.slice(offset, offset + limit);
    return json(
      { items, meta: { limit, offset, count: items.length, mock: true } },
      200,
      { 'Cache-Control': 'public, s-maxage=30, max-age=15' }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  // Auth check — internal only
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token || token !== env.DASH_TOKEN) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { title, summary, source_url, source, category,
          related_tool_slugs, author, author_handle,
          thread_context, engagement_score, status, published_at } = body;

  if (!title?.trim()) {
    return json({ error: 'title is required' }, 400);
  }

  const id = randomUUID();
  const slugsJson = Array.isArray(related_tool_slugs) ? JSON.stringify(related_tool_slugs) : null;

  try {
    await env.DB.prepare(`
      INSERT INTO news_items
        (id, title, summary, source_url, source, category, related_tool_slugs,
         author, author_handle, thread_context, engagement_score, status, published_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
    `).bind(
      id,
      title.trim(),
      summary ?? null,
      source_url ?? null,
      source ?? 'manual',
      category ?? 'community',
      slugsJson,
      author ?? null,
      author_handle ?? null,
      thread_context ?? null,
      engagement_score ?? 0,
      status ?? 'draft',
      published_at ?? null,
    ).run();

    return json({ id, created: true }, 201);
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};
