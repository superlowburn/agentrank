import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}

export const GET: APIRoute = async ({ locals, url }) => {
  const { env } = (locals as any).runtime;
  const token = url.searchParams.get('token');

  if (!env.DASH_TOKEN || token !== env.DASH_TOKEN) {
    return json({ error: 'Unauthorized' }, 403);
  }

  const db = env.DB;

  try {
    const [
      totals24h,
      totals7d,
      totals30d,
      uniqueIPs24h,
      uniqueIPs7d,
      uniqueIPs30d,
      errorRates24h,
      topEndpoints30d,
      topReferrers30d,
      skillInstalls30d,
      dailyTraffic30d,
    ] = await Promise.all([
      // Total requests by type
      db.prepare(`
        SELECT
          SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS page_visits,
          SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS api_calls,
          SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcp_calls,
          COUNT(*) AS total
        FROM request_log WHERE ts > datetime('now', '-1 day')
      `).first(),

      db.prepare(`
        SELECT
          SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS page_visits,
          SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS api_calls,
          SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcp_calls,
          COUNT(*) AS total
        FROM request_log WHERE ts > datetime('now', '-7 days')
      `).first(),

      db.prepare(`
        SELECT
          SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS page_visits,
          SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS api_calls,
          SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcp_calls,
          COUNT(*) AS total
        FROM request_log WHERE ts > datetime('now', '-30 days')
      `).first(),

      // Unique IPs
      db.prepare(`SELECT COUNT(DISTINCT ip_hash) AS unique_ips FROM skill_pings WHERE ts > datetime('now', '-1 day')`).first().catch(() => ({ unique_ips: null })),
      db.prepare(`SELECT COUNT(DISTINCT ip_hash) AS unique_ips FROM skill_pings WHERE ts > datetime('now', '-7 days')`).first().catch(() => ({ unique_ips: null })),
      db.prepare(`SELECT COUNT(DISTINCT ip_hash) AS unique_ips FROM skill_pings WHERE ts > datetime('now', '-30 days')`).first().catch(() => ({ unique_ips: null })),

      // Error rates (4xx/5xx) by endpoint (24h)
      db.prepare(`
        SELECT path, COUNT(*) AS errors
        FROM request_log
        WHERE ts > datetime('now', '-1 day')
          AND status >= 400
        GROUP BY path
        ORDER BY errors DESC
        LIMIT 20
      `).all(),

      // Top API endpoints (30d)
      db.prepare(`
        SELECT path, COUNT(*) AS calls, ROUND(AVG(duration_ms), 0) AS avg_ms
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
          AND type IN ('api', 'mcp')
        GROUP BY path
        ORDER BY calls DESC
        LIMIT 20
      `).all(),

      // Top referrers (30d, external only)
      db.prepare(`
        SELECT referrer, COUNT(*) AS visits
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
          AND type = 'page'
          AND referrer IS NOT NULL AND referrer != ''
          AND referrer NOT LIKE '%agentrank-ai.com%'
        GROUP BY referrer
        ORDER BY visits DESC
        LIMIT 20
      `).all(),

      // Skill installs (30d)
      db.prepare(`
        SELECT slug, COUNT(*) AS pings, COUNT(DISTINCT ip_hash) AS unique_installs
        FROM skill_pings
        WHERE ts > datetime('now', '-30 days')
        GROUP BY slug
        ORDER BY unique_installs DESC
      `).all().catch(() => ({ results: [] })),

      // Daily traffic (30d)
      db.prepare(`
        SELECT
          date(ts) AS day,
          SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS page_visits,
          SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS api_calls,
          SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcp_calls,
          COUNT(*) AS total
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
        GROUP BY day
        ORDER BY day ASC
      `).all(),
    ]);

    return json({
      totals_24h: totals24h,
      totals_7d: totals7d,
      totals_30d: totals30d,
      unique_ips: {
        last_24h: uniqueIPs24h?.unique_ips ?? 0,
        last_7d: uniqueIPs7d?.unique_ips ?? 0,
        last_30d: uniqueIPs30d?.unique_ips ?? 0,
      },
      error_rates_24h: errorRates24h.results,
      top_endpoints_30d: topEndpoints30d.results,
      top_referrers_30d: topReferrers30d.results,
      skill_installs_30d: skillInstalls30d.results,
      daily_traffic_30d: dailyTraffic30d.results,
      generated_at: new Date().toISOString(),
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
