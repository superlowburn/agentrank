/**
 * GET /api/v1/claimed
 *
 * Returns the list of tool_full_name values that have active, verified claims.
 * Used by static/prerendered pages to add Claimed badges via client-side JS.
 *
 * Response: { claimed: string[] }  — array of "owner/repo" strings
 * Cached: 1 hour (serves well from CDN edge)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { env } = (locals as any).runtime;

  const result = await env.DB.prepare(
    `SELECT DISTINCT tool_full_name FROM claims WHERE status = 'active' AND verified = 1`
  ).all<{ tool_full_name: string }>();

  const claimed = (result.results ?? []).map((r) => r.tool_full_name);

  return new Response(JSON.stringify({ claimed }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
