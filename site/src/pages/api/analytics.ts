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
      daily30d,
      hourly24h,
      topPages,
      topReferrers,
      utmSources,
      topCountries,
      topApiEndpoints,
    ] = await Promise.all([
      // Summary counts
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

      // Daily breakdown (30d) by type
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

      // Hourly breakdown (24h)
      db.prepare(`
        SELECT
          strftime('%H:00', ts) AS hour,
          SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS page_visits,
          SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS api_calls,
          SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcp_calls,
          COUNT(*) AS total
        FROM request_log
        WHERE ts > datetime('now', '-1 day')
        GROUP BY hour
        ORDER BY hour ASC
      `).all(),

      // Top pages by visits (30d)
      db.prepare(`
        SELECT path, COUNT(*) AS visits
        FROM request_log
        WHERE ts > datetime('now', '-30 days') AND type = 'page'
        GROUP BY path
        ORDER BY visits DESC
        LIMIT 20
      `).all(),

      // Top referrers (30d)
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

      // UTM source attribution (30d)
      db.prepare(`
        SELECT
          utm_source,
          COUNT(*) AS visits,
          COUNT(DISTINCT country) AS countries,
          MIN(date(ts)) AS first_seen
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
          AND utm_source IS NOT NULL AND utm_source != ''
        GROUP BY utm_source
        ORDER BY visits DESC
        LIMIT 20
      `).all(),

      // Top countries (30d)
      db.prepare(`
        SELECT country, COUNT(*) AS visits
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
          AND country IS NOT NULL AND country != ''
        GROUP BY country
        ORDER BY visits DESC
        LIMIT 15
      `).all(),

      // Top API endpoints (30d)
      db.prepare(`
        SELECT path, COUNT(*) AS calls
        FROM request_log
        WHERE ts > datetime('now', '-30 days')
          AND type IN ('api', 'mcp')
        GROUP BY path
        ORDER BY calls DESC
        LIMIT 15
      `).all(),
    ]);

    return json({
      totals_24h: totals24h,
      totals_7d: totals7d,
      totals_30d: totals30d,
      daily_30d: daily30d.results,
      hourly_24h: hourly24h.results,
      top_pages: topPages.results,
      top_referrers: topReferrers.results,
      utm_sources: utmSources.results,
      top_countries: topCountries.results,
      top_api_endpoints: topApiEndpoints.results,
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
