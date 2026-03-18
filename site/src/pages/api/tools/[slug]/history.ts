/**
 * GET /api/tools/:slug/history
 *
 * Returns the last 30 days of score snapshots for a tool.
 * Used by tool detail pages to render sparklines and trend indicators.
 *
 * Query params:
 *   days  — lookback window (default: 30, max: 90)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, locals }) => {
  const { env } = (locals as any).runtime;
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');

  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '30', 10) || 30, 1), 90);

  try {
    // Query rank_history — already populated daily by cron-snapshot worker
    const histResult = await (env.DB as D1Database)
      .prepare(
        `SELECT snapshot_date as date, score, rank, stars
         FROM rank_history
         WHERE tool_full_name = ? AND tool_type = 'tool'
         ORDER BY snapshot_date DESC
         LIMIT ?`
      )
      .bind(fullName, days)
      .all();

    const historyDesc = (histResult.results || []) as HistoryRow[];

    // Compute 7-day trend (score delta vs most recent snapshot >= 7 days ago)
    let trend_7d: Trend | null = null;
    if (historyDesc.length >= 2) {
      const current = historyDesc[0];
      const cutoff = new Date(current.date + 'T00:00:00Z');
      cutoff.setUTCDate(cutoff.getUTCDate() - 7);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      const baseline = historyDesc.find((h) => h.date <= cutoffStr);
      if (baseline) {
        const scoreDelta = Math.round((current.score - baseline.score) * 100) / 100;
        const pctChange =
          baseline.score > 0 ? Math.round((scoreDelta / baseline.score) * 1000) / 10 : 0;
        trend_7d = {
          score_change: scoreDelta,
          pct_change: pctChange,
          direction: scoreDelta > 0.5 ? 'up' : scoreDelta < -0.5 ? 'down' : 'stable',
          baseline_date: baseline.date,
        };
      }
    }

    return json({
      full_name: fullName,
      history: [...historyDesc].reverse(), // oldest-first for chart rendering
      trend_7d,
    });
  } catch (e: any) {
    if ((e.message || '').includes('no such table')) {
      return json({ full_name: fullName, history: [], trend_7d: null });
    }
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

interface HistoryRow {
  date: string;
  score: number;
  rank: number;
  stars: number;
}

interface Trend {
  score_change: number;
  pct_change: number;
  direction: 'up' | 'down' | 'stable';
  baseline_date: string;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<{ results: unknown[] }>;
}
