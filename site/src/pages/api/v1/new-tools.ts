/**
 * GET /api/v1/new-tools
 *
 * Returns tools that appeared in the index for the first time within the
 * last N days (based on rank_history first-seen date).
 * Used by tweet-bot.ts to generate "new tools" content.
 *
 * Query params:
 *   days   — lookback window in days (default: 7, max: 30)
 *   limit  — number of results (default: 20, max: 100)
 *   type   — 'tool' | 'skill' | '' (default: 'tool')
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;

  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 30);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const type = (url.searchParams.get('type') || 'tool').toLowerCase();

  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  const cutoff = d.toISOString().slice(0, 10);

  const typeFilter = type === 'tool' || type === 'skill' ? `AND cur.tool_type = ?3` : '';

  try {
    // Tools that exist in today's snapshot but have no history before the cutoff
    const result = await (env.DB as D1Database)
      .prepare(
        `SELECT
           cur.tool_full_name AS full_name,
           cur.tool_type,
           cur.rank,
           cur.score,
           cur.stars,
           MIN(rh.snapshot_date) AS first_seen
         FROM rank_history cur
         JOIN rank_history rh
           ON rh.tool_full_name = cur.tool_full_name
          AND rh.tool_type = cur.tool_type
         WHERE cur.snapshot_date = ?1
           ${typeFilter}
         GROUP BY cur.tool_full_name, cur.tool_type
         HAVING first_seen >= ?2
         ORDER BY cur.score DESC
         LIMIT ?${typeFilter ? 4 : 3}`
      )
      .bind(
        today,
        cutoff,
        ...(typeFilter ? [type, limit] : [limit])
      )
      .all();

    const tools = (result.results || []).map((r: any) => ({
      full_name: r.full_name as string,
      tool_type: r.tool_type as string,
      rank: r.rank as number,
      score: Math.round((r.score as number) * 10) / 10,
      stars: r.stars as number,
      first_seen: r.first_seen as string,
      url: r.tool_type === 'tool'
        ? `https://agentrank-ai.com/tool/${r.full_name}/`
        : `https://agentrank-ai.com/skill/${(r.full_name as string).replace(/\//g, '--').replace(/:/g, '-')}/`,
    }));

    return json(
      { tools, meta: { today, cutoff, days, count: tools.length } },
      200,
      { 'Cache-Control': 'public, s-maxage=300, max-age=300' }
    );
  } catch (e: any) {
    if ((e.message || '').includes('no such table')) {
      return json(
        { tools: [], meta: { today, cutoff, days, count: 0, note: 'rank_history table not yet populated' } },
        200,
        { 'Cache-Control': 'public, s-maxage=300, max-age=300' }
      );
    }
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};

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

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<{ results: unknown[] }>;
}
