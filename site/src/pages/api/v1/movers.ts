/**
 * GET /api/v1/movers
 *
 * Returns tools with the largest rank changes over the past N days.
 * Used by tweet-bot.ts to generate "biggest movers" content.
 *
 * Query params:
 *   days   — lookback window in days (default: 7, max: 30)
 *   limit  — number of results (default: 10, max: 50)
 *   type   — 'tool' | 'skill' | '' (default: 'tool')
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;

  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10) || 7, 1), 30);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 1), 50);
  const type = (url.searchParams.get('type') || 'tool').toLowerCase();

  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  const prevDate = d.toISOString().slice(0, 10);

  const typeFilter = type === 'tool' || type === 'skill' ? `AND cur.tool_type = ?3` : '';

  try {
    const result = await (env.DB as D1Database)
      .prepare(
        `SELECT
           cur.tool_full_name AS full_name,
           cur.tool_type,
           cur.rank AS current_rank,
           prev.rank AS prev_rank,
           (prev.rank - cur.rank) AS rank_delta,
           cur.score AS current_score,
           cur.stars
         FROM rank_history cur
         JOIN rank_history prev
           ON cur.tool_full_name = prev.tool_full_name
          AND cur.tool_type = prev.tool_type
         WHERE cur.snapshot_date = ?1
           AND prev.snapshot_date = (
             SELECT MAX(snapshot_date)
             FROM rank_history
             WHERE snapshot_date <= ?2
               AND tool_full_name = cur.tool_full_name
               AND tool_type = cur.tool_type
           )
           AND ABS(prev.rank - cur.rank) >= 1
           ${typeFilter}
         ORDER BY ABS(prev.rank - cur.rank) DESC
         LIMIT ?${typeFilter ? 4 : 3}`
      )
      .bind(
        today,
        prevDate,
        ...(typeFilter ? [type, limit] : [limit])
      )
      .all();

    const movers = (result.results || []).map((r: any) => ({
      full_name: r.full_name as string,
      tool_type: r.tool_type as string,
      current_rank: r.current_rank as number,
      prev_rank: r.prev_rank as number,
      rank_delta: r.rank_delta as number,
      current_score: Math.round((r.current_score as number) * 10) / 10,
      stars: r.stars as number,
      url: r.tool_type === 'tool'
        ? `https://agentrank-ai.com/tool/${r.full_name}/`
        : `https://agentrank-ai.com/skill/${(r.full_name as string).replace(/\//g, '--').replace(/:/g, '-')}/`,
    }));

    return json(
      { movers, meta: { today, prev_date: prevDate, days, count: movers.length } },
      200,
      { 'Cache-Control': 'public, s-maxage=300, max-age=300' }
    );
  } catch (e: any) {
    // rank_history may not exist yet (before first snapshot)
    if ((e.message || '').includes('no such table')) {
      return json(
        { movers: [], meta: { today, prev_date: prevDate, days, count: 0, note: 'rank_history table not yet populated' } },
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
