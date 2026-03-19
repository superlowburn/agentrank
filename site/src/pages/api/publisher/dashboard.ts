import type { APIRoute } from 'astro';

export const prerender = false;

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split('; ').filter(Boolean).map((c) => {
      const i = c.indexOf('=');
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  const cookies = parseCookies(request.headers.get('cookie') || '');
  const rawSession = cookies.claim_session ? decodeURIComponent(cookies.claim_session) : null;

  if (!rawSession) {
    return json({ error: 'unauthenticated' }, 401);
  }

  const colonIdx = rawSession.indexOf(':');
  const sessionSlug = rawSession.slice(0, colonIdx);
  const githubUsername = rawSession.slice(colonIdx + 1);

  if (!githubUsername) {
    return json({ error: 'unauthenticated' }, 401);
  }

  // Verified claims for this user
  const claimsResult = await env.DB.prepare(
    'SELECT tool_full_name FROM claims WHERE github_username = ? AND verified = 1 AND status = ? ORDER BY created_at ASC'
  ).bind(githubUsername, 'active').all();

  const claimedTools = (claimsResult.results || []) as { tool_full_name: string }[];

  if (claimedTools.length === 0) {
    return json({ error: 'no_claims' }, 403);
  }

  const urlParams = new URL(request.url).searchParams;
  const requestedSlug = urlParams.get('slug');
  const requestedFullName = requestedSlug ? requestedSlug.replace('--', '/') : null;

  let currentFullName: string;
  if (requestedFullName && claimedTools.some((c) => c.tool_full_name === requestedFullName)) {
    currentFullName = requestedFullName;
  } else {
    const cookieFullName = sessionSlug.replace('--', '/');
    currentFullName = claimedTools.some((c) => c.tool_full_name === cookieFullName)
      ? cookieFullName
      : claimedTools[0].tool_full_name;
  }

  const currentSlug = currentFullName.replace('/', '--');

  // Tool data
  const tool = await env.DB.prepare(
    `SELECT full_name, url, description, rank, score, stars, open_issues, closed_issues,
            contributors, dependents, last_commit_at, language, license, category
     FROM tools WHERE full_name = ?`
  ).bind(currentFullName).first() as Record<string, unknown> | null;

  if (!tool) {
    return json({ error: 'tool_not_found' }, 404);
  }

  // Claim enrichment
  const claim = await env.DB.prepare(
    'SELECT tagline, category, logo_url, is_deprecated FROM claims WHERE tool_full_name = ? AND github_username = ? AND verified = 1'
  ).bind(currentFullName, githubUsername).first() as Record<string, unknown> | null;

  // 7-day page views (human only)
  const view7dResult = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM request_log
     WHERE path LIKE ? AND type = 'page' AND is_bot = 0 AND ts >= datetime('now', '-7 days')`
  ).bind(`/tool/${currentSlug}%`).first() as { count: number } | null;

  // 30-day page views (human only)
  const view30dResult = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM request_log
     WHERE path LIKE ? AND type = 'page' AND is_bot = 0 AND ts >= datetime('now', '-30 days')`
  ).bind(`/tool/${currentSlug}%`).first() as { count: number } | null;

  // Total tools
  const totalResult = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM tools WHERE is_archived = 0'
  ).first() as { count: number } | null;

  // 30-day rank/score history
  const histResult = await env.DB.prepare(
    `SELECT snapshot_date, score, rank
     FROM rank_history
     WHERE tool_full_name = ? AND tool_type = 'tool'
     ORDER BY snapshot_date DESC
     LIMIT 30`
  ).bind(currentFullName).all();

  const histRowsDesc = (histResult.results || []) as { snapshot_date: string; score: number; rank: number }[];
  const history = [...histRowsDesc].reverse();

  // Rank/score change vs 7 days ago
  let rankChange: number | null = null;
  let scoreChange: number | null = null;
  if (history.length >= 2) {
    const latest = history[history.length - 1];
    const cutoffDate = new Date(latest.snapshot_date + 'T00:00:00Z');
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 7);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);
    const baseline = histRowsDesc.find((h) => h.snapshot_date <= cutoffStr);
    if (baseline) {
      rankChange = baseline.rank - latest.rank;
      scoreChange = Math.round((latest.score - baseline.score) * 10) / 10;
    }
  }

  // Top referrers (30d)
  const refResult = await env.DB.prepare(
    `SELECT referrer, COUNT(*) as cnt FROM request_log
     WHERE path LIKE ? AND type = 'page' AND is_bot = 0
     AND referrer IS NOT NULL AND ts >= datetime('now', '-30 days')
     GROUP BY referrer ORDER BY cnt DESC LIMIT 6`
  ).bind(`/tool/${currentSlug}%`).all();

  const topReferrers = (refResult.results || []) as { referrer: string; cnt: number }[];

  // Category average
  const toolCategory = (tool.category as string) || (claim?.category as string) || null;
  let categoryAvgScore: number | null = null;
  let categoryToolCount = 0;
  if (toolCategory) {
    const catResult = await env.DB.prepare(
      `SELECT AVG(score) as avg_score, COUNT(*) as cnt FROM tools WHERE category = ? AND is_archived = 0`
    ).bind(toolCategory).first() as { avg_score: number | null; cnt: number } | null;
    categoryAvgScore = catResult?.avg_score ? Math.round(catResult.avg_score * 10) / 10 : null;
    categoryToolCount = catResult?.cnt ?? 0;
  }

  // Score signals
  const stars = (tool.stars as number) || 0;
  const openIssues = (tool.open_issues as number) || 0;
  const closedIssues = (tool.closed_issues as number) || 0;
  const contributors = (tool.contributors as number) || 0;
  const dependents = (tool.dependents as number) || 0;
  const lastCommitAt = tool.last_commit_at as string | null;

  const starsScore = Math.min(1, Math.log10(Math.max(1, stars)) / 4);
  const totalIssues = openIssues + closedIssues;
  const issueHealth = totalIssues > 0 ? closedIssues / totalIssues : 0.5;
  const contributorsScore = Math.min(1, Math.log10(Math.max(1, contributors)) / 2);
  const dependentsScore = Math.min(1, Math.log10(Math.max(1, dependents)) / 3);

  let freshnessScore = 0;
  if (lastCommitAt) {
    const daysSince = (Date.now() - new Date(lastCommitAt).getTime()) / (1000 * 60 * 60 * 24);
    freshnessScore = Math.max(0, 1 - daysSince / 180);
  }

  const claimedToolsList = claimedTools.map((c) => ({
    full_name: c.tool_full_name,
    slug: c.tool_full_name.replace('/', '--'),
  }));

  return json({
    githubUsername,
    claimedTools: claimedToolsList,
    currentTool: {
      full_name: tool.full_name,
      slug: currentSlug,
      url: tool.url,
      description: tool.description,
      rank: tool.rank,
      score: tool.score,
      stars,
      last_commit_at: lastCommitAt,
      open_issues: openIssues,
      closed_issues: closedIssues,
      contributors,
      dependents,
      language: tool.language,
      category: toolCategory,
      tagline: claim?.tagline ?? null,
      logo_url: claim?.logo_url ?? null,
      is_deprecated: claim?.is_deprecated === 1,
    },
    stats: {
      view_count_7d: view7dResult?.count ?? 0,
      view_count_30d: view30dResult?.count ?? 0,
      total_tools: totalResult?.count ?? 0,
      rank_change_7d: rankChange,
      score_change_7d: scoreChange,
    },
    signals: {
      stars: parseFloat(starsScore.toFixed(2)),
      freshness: parseFloat(freshnessScore.toFixed(2)),
      issue_health: parseFloat(issueHealth.toFixed(2)),
      contributors: parseFloat(contributorsScore.toFixed(2)),
      dependents: parseFloat(dependentsScore.toFixed(2)),
    },
    history,
    top_referrers: topReferrers,
    category_comparison: categoryAvgScore !== null ? {
      category: toolCategory,
      tool_score: Math.round((tool.score as number) || 0),
      avg_score: categoryAvgScore,
      tool_count: categoryToolCount,
    } : null,
    isPro: false,
  });
};
