import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

async function level0(db: any) {
  const [tools, skills, agents, pending, archived, reqs24h, reqs7d, uniqueAgents7d, emailSubscribers] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total, ROUND(AVG(score), 1) AS avg_score, ROUND(MAX(score), 1) AS top_score, MAX(last_commit_at) AS latest_commit FROM tools`).first(),
    db.prepare(`SELECT COUNT(*) AS total, ROUND(AVG(score), 1) AS avg_score, ROUND(MAX(score), 1) AS top_score FROM skills`).first(),
    db.prepare(`SELECT COUNT(*) AS total FROM agents`).first(),
    db.prepare(`SELECT COUNT(*) AS total FROM submissions WHERE status = 'pending'`).first(),
    db.prepare(`SELECT COUNT(*) AS total FROM tools WHERE is_archived = 1`).first(),
    db.prepare(`SELECT type, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-1 day') GROUP BY type`).all(),
    db.prepare(`SELECT type, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-7 days') GROUP BY type`).all(),
    db.prepare(`SELECT COUNT(DISTINCT ua) AS total FROM request_log WHERE ts > datetime('now', '-7 days') AND type IN ('api', 'mcp') AND ua IS NOT NULL AND ua != ''`).first(),
    db.prepare(`SELECT COUNT(*) AS total FROM email_subscribers`).first(),
  ]);
  return { tools, skills, agents, pending, archived, reqs_24h: reqs24h.results, reqs_7d: reqs7d.results, unique_agents_7d: uniqueAgents7d?.total ?? 0, email_subscribers: emailSubscribers?.total ?? 0 };
}

async function level1(db: any) {
  const [scoreDist, languages, freshness, licenses, topTools, topSkills, hourlyTraffic, topPaths, topCountries, agentClients, topSearches, topLookups, topReferrers, utmSources] = await Promise.all([
    db.prepare(`SELECT
      CASE
        WHEN score < 10 THEN '0-9'
        WHEN score < 20 THEN '10-19'
        WHEN score < 30 THEN '20-29'
        WHEN score < 40 THEN '30-39'
        WHEN score < 50 THEN '40-49'
        WHEN score < 60 THEN '50-59'
        WHEN score < 70 THEN '60-69'
        WHEN score < 80 THEN '70-79'
        WHEN score < 90 THEN '80-89'
        ELSE '90-100'
      END AS bucket,
      COUNT(*) AS count
      FROM tools WHERE score IS NOT NULL
      GROUP BY bucket ORDER BY bucket`).all(),
    db.prepare(`SELECT language, COUNT(*) AS count FROM tools WHERE language IS NOT NULL AND language != '' GROUP BY language ORDER BY count DESC LIMIT 15`).all(),
    db.prepare(`SELECT
      CASE
        WHEN julianday('now') - julianday(last_commit_at) <= 7 THEN 'this week'
        WHEN julianday('now') - julianday(last_commit_at) <= 30 THEN 'this month'
        WHEN julianday('now') - julianday(last_commit_at) <= 90 THEN '< 90 days'
        WHEN julianday('now') - julianday(last_commit_at) <= 365 THEN '< 1 year'
        ELSE 'stale (1y+)'
      END AS bucket,
      COUNT(*) AS count
      FROM tools WHERE last_commit_at IS NOT NULL
      GROUP BY bucket`).all(),
    db.prepare(`SELECT license, COUNT(*) AS count FROM tools WHERE license IS NOT NULL AND license != '' GROUP BY license ORDER BY count DESC LIMIT 10`).all(),
    db.prepare(`SELECT rank, full_name, ROUND(score, 1) AS score, stars, last_commit_at FROM tools ORDER BY rank ASC LIMIT 20`).all(),
    db.prepare(`SELECT rank, name, ROUND(score, 1) AS score, installs, source FROM skills WHERE rank IS NOT NULL ORDER BY rank ASC LIMIT 20`).all(),
    db.prepare(`SELECT strftime('%Y-%m-%d %H:00', ts) AS hour, type, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-1 day') GROUP BY hour, type ORDER BY hour`).all(),
    db.prepare(`SELECT path, COUNT(*) AS total, SUM(CASE WHEN type='page' THEN 1 ELSE 0 END) AS pages, SUM(CASE WHEN type='api' THEN 1 ELSE 0 END) AS apis, SUM(CASE WHEN type='mcp' THEN 1 ELSE 0 END) AS mcps FROM request_log WHERE ts > datetime('now', '-7 days') GROUP BY path ORDER BY total DESC LIMIT 20`).all(),
    db.prepare(`SELECT country, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-7 days') AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 15`).all(),
    // Agent activity: distinct clients hitting API/MCP endpoints (7d)
    db.prepare(`SELECT ua, COUNT(*) AS requests, MIN(ts) AS first_seen, MAX(ts) AS last_seen FROM request_log WHERE ts > datetime('now', '-7 days') AND type IN ('api', 'mcp') AND ua IS NOT NULL AND ua != '' GROUP BY ua ORDER BY requests DESC LIMIT 25`).all(),
    // Top search queries (7d)
    db.prepare(`SELECT query, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-7 days') AND path = '/api/search' AND query IS NOT NULL AND query != '' GROUP BY query ORDER BY count DESC LIMIT 20`).all(),
    // Top lookup URLs (7d)
    db.prepare(`SELECT query, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-7 days') AND path = '/api/lookup' AND query IS NOT NULL AND query != '' GROUP BY query ORDER BY count DESC LIMIT 20`).all(),
    // Top referrers (7d) — page visits with a non-self referrer
    db.prepare(`SELECT referrer, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-7 days') AND type = 'page' AND referrer IS NOT NULL AND referrer != '' AND referrer NOT LIKE '%agentrank-ai.com%' GROUP BY referrer ORDER BY count DESC LIMIT 20`).all(),
    // UTM source attribution (30d) — shows which distribution channels are driving traffic
    db.prepare(`SELECT utm_source, COUNT(*) AS visits, COUNT(DISTINCT country) AS countries FROM request_log WHERE ts > datetime('now', '-30 days') AND utm_source IS NOT NULL AND utm_source != '' GROUP BY utm_source ORDER BY visits DESC LIMIT 20`).all(),
  ]);
  return {
    score_distribution: scoreDist.results,
    languages: languages.results,
    freshness: freshness.results,
    licenses: licenses.results,
    top_tools: topTools.results,
    top_skills: topSkills.results,
    hourly_traffic: hourlyTraffic.results,
    top_paths: topPaths.results,
    top_countries: topCountries.results,
    agent_clients: agentClients.results,
    top_searches: topSearches.results,
    top_lookups: topLookups.results,
    top_referrers: topReferrers.results,
    utm_sources: utmSources.results,
  };
}

async function level2(db: any) {
  const [completeness, bestMaintained, mostDepended, mostStarred, skillSources, submissionsQueue, skillScoreDist, recentRequests, dailyTraffic, apiEndpointsByDay, installTrend] = await Promise.all([
    db.prepare(`SELECT
      ROUND(100.0 * COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) / COUNT(*), 1) AS pct_description,
      ROUND(100.0 * COUNT(CASE WHEN readme_excerpt IS NOT NULL AND readme_excerpt != '' THEN 1 END) / COUNT(*), 1) AS pct_readme,
      ROUND(100.0 * COUNT(CASE WHEN license IS NOT NULL AND license != '' THEN 1 END) / COUNT(*), 1) AS pct_license,
      ROUND(100.0 * COUNT(CASE WHEN language IS NOT NULL AND language != '' THEN 1 END) / COUNT(*), 1) AS pct_language,
      ROUND(100.0 * COUNT(CASE WHEN dependents > 0 THEN 1 END) / COUNT(*), 1) AS pct_dependents
      FROM tools`).first(),
    db.prepare(`SELECT full_name, ROUND(1.0 * closed_issues / (open_issues + closed_issues), 3) AS close_ratio, open_issues, closed_issues
      FROM tools WHERE (open_issues + closed_issues) > 10
      ORDER BY close_ratio DESC LIMIT 15`).all(),
    db.prepare(`SELECT full_name, dependents, stars, ROUND(score, 1) AS score FROM tools WHERE dependents > 0 ORDER BY dependents DESC LIMIT 15`).all(),
    db.prepare(`SELECT full_name, stars, ROUND(score, 1) AS score, dependents FROM tools ORDER BY stars DESC LIMIT 15`).all(),
    db.prepare(`SELECT source, COUNT(*) AS count, ROUND(AVG(score), 1) AS avg_score FROM skills GROUP BY source`).all(),
    db.prepare(`SELECT id, type, github_url, name, contact_email, submitted_at FROM submissions WHERE status = 'pending' ORDER BY submitted_at DESC`).all(),
    db.prepare(`SELECT
      CASE
        WHEN score < 10 THEN '0-9'
        WHEN score < 20 THEN '10-19'
        WHEN score < 30 THEN '20-29'
        WHEN score < 40 THEN '30-39'
        WHEN score < 50 THEN '40-49'
        WHEN score < 60 THEN '50-59'
        WHEN score < 70 THEN '60-69'
        WHEN score < 80 THEN '70-79'
        WHEN score < 90 THEN '80-89'
        ELSE '90-100'
      END AS bucket,
      COUNT(*) AS count
      FROM skills WHERE score IS NOT NULL
      GROUP BY bucket ORDER BY bucket`).all(),
    db.prepare(`SELECT path, type, method, status, ua, country, ts, duration_ms FROM request_log ORDER BY id DESC LIMIT 50`).all(),
    db.prepare(`SELECT strftime('%Y-%m-%d', ts) AS day, type, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-30 days') GROUP BY day, type ORDER BY day`).all(),
    // Per-API-endpoint per-day breakdown (30d) — top 10 most active API paths
    db.prepare(`SELECT path, strftime('%Y-%m-%d', ts) AS day, COUNT(*) AS count FROM request_log WHERE ts > datetime('now', '-30 days') AND type = 'api' GROUP BY path, day ORDER BY day DESC, count DESC`).all(),
    // Install trend for our own skill on skills.sh
    db.prepare(`SELECT slug, installs, checked_at FROM install_checkpoints ORDER BY checked_at DESC LIMIT 90`).all(),
  ]);

  // Pivot api_endpoints_by_day: top 10 paths, then daily counts
  const endpointDayRaw = (apiEndpointsByDay.results || []) as { path: string; day: string; count: number }[];
  const pathTotals = new Map<string, number>();
  for (const r of endpointDayRaw) {
    pathTotals.set(r.path, (pathTotals.get(r.path) ?? 0) + r.count);
  }
  const top10Paths = Array.from(pathTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path]) => path);
  const apiEndpointTrend = top10Paths.map(path => ({
    path,
    total: pathTotals.get(path) ?? 0,
    days: endpointDayRaw.filter(r => r.path === path).map(r => ({ day: r.day, count: r.count })),
  }));

  return {
    completeness,
    best_maintained: bestMaintained.results,
    most_depended: mostDepended.results,
    most_starred: mostStarred.results,
    skill_sources: skillSources.results,
    submissions_queue: submissionsQueue.results,
    skill_score_distribution: skillScoreDist.results,
    recent_requests: recentRequests.results,
    daily_traffic: dailyTraffic.results,
    api_endpoint_trend: apiEndpointTrend,
    install_trend: installTrend.results,
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  const { env } = (locals as any).runtime;
  const token = url.searchParams.get('token');

  if (!env.DASH_TOKEN || token !== env.DASH_TOKEN) {
    return json({ error: 'Unauthorized' }, 403);
  }

  const level = parseInt(url.searchParams.get('level') ?? '0', 10);

  try {
    let data: any;
    if (level === 0) data = await level0(env.DB);
    else if (level === 1) data = await level1(env.DB);
    else if (level === 2) data = await level2(env.DB);
    else return json({ error: 'Invalid level (0, 1, or 2)' }, 400);

    return json({ level, data });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
