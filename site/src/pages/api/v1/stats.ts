/**
 * GET /api/v1/stats
 *
 * Returns aggregate counts from D1 for the index.
 * Cached for 1 hour (CDN + browser).
 *
 * Response fields:
 *   totalTools          — tools with a score
 *   totalSkills         — skills with a score
 *   toolsUpdatedWeek    — tools with a commit in the last 7 days
 *   averageScore        — mean score across all scored tools
 *   totalCategories     — distinct non-null categories across tools and skills
 *   generatedAt         — ISO timestamp for cache staleness awareness
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;
  const db: D1Database = env.DB;

  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [toolsRow, skillsRow, weekRow, avgRow, catRow] = await Promise.all([
      db.prepare('SELECT COUNT(*) AS n FROM tools WHERE score IS NOT NULL').first<{ n: number }>(),
      db.prepare('SELECT COUNT(*) AS n FROM skills WHERE score IS NOT NULL').first<{ n: number }>(),
      db.prepare("SELECT COUNT(*) AS n FROM tools WHERE last_commit_at >= ?1").bind(cutoff).first<{ n: number }>(),
      db.prepare('SELECT ROUND(AVG(score), 1) AS avg FROM tools WHERE score IS NOT NULL').first<{ avg: number }>(),
      db.prepare(
        `SELECT COUNT(DISTINCT category) AS n FROM (
           SELECT category FROM tools WHERE category IS NOT NULL
           UNION ALL
           SELECT category FROM skills WHERE category IS NOT NULL
         )`
      ).first<{ n: number }>(),
    ]);

    return json({
      totalTools: toolsRow?.n ?? 0,
      totalSkills: skillsRow?.n ?? 0,
      toolsUpdatedWeek: weekRow?.n ?? 0,
      averageScore: avgRow?.avg ?? null,
      totalCategories: catRow?.n ?? 0,
      generatedAt: new Date().toISOString(),
    }, 200, {
      'Cache-Control': 'public, s-maxage=3600, max-age=3600',
    });
  } catch (e: any) {
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
  first<T = unknown>(): Promise<T | null>;
}
