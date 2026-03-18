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

  // Parse session cookie
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

  // Get all verified claims for this user
  const claimsResult = await env.DB.prepare(
    'SELECT tool_full_name FROM claims WHERE github_username = ? AND verified = 1 AND status = ? ORDER BY created_at ASC'
  ).bind(githubUsername, 'active').all();

  const claimedTools = (claimsResult.results || []) as { tool_full_name: string }[];

  if (claimedTools.length === 0) {
    return json({ error: 'no_claims' }, 403);
  }

  // Determine which tool to show
  const urlParams = new URL(request.url).searchParams;
  const requestedSlug = urlParams.get('slug');
  const requestedFullName = requestedSlug ? requestedSlug.replace('--', '/') : null;

  let currentFullName: string;
  if (requestedFullName && claimedTools.some((c) => c.tool_full_name === requestedFullName)) {
    currentFullName = requestedFullName;
  } else {
    // Default: use the tool from cookie slug if still claimed, else first claimed
    const cookieFullName = sessionSlug.replace('--', '/');
    currentFullName = claimedTools.some((c) => c.tool_full_name === cookieFullName)
      ? cookieFullName
      : claimedTools[0].tool_full_name;
  }

  const currentSlug = currentFullName.replace('/', '--');

  // Load tool data
  const tool = await env.DB.prepare(
    `SELECT full_name, url, description, rank, score, stars, open_issues, closed_issues,
            contributors, dependents, last_commit_at, language, license
     FROM tools WHERE full_name = ?`
  ).bind(currentFullName).first() as Record<string, unknown> | null;

  if (!tool) {
    return json({ error: 'tool_not_found' }, 404);
  }

  // Load claim enrichment
  const claim = await env.DB.prepare(
    'SELECT tagline, category, logo_url, is_deprecated FROM claims WHERE tool_full_name = ? AND github_username = ? AND verified = 1'
  ).bind(currentFullName, githubUsername).first() as Record<string, unknown> | null;

  // Get 7-day page views from request_log
  const viewResult = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM request_log
     WHERE path LIKE ? AND type = 'page' AND ts >= datetime('now', '-7 days')`
  ).bind(`/tool/${currentSlug}%`).first() as { count: number } | null;

  const viewCount7d = viewResult?.count ?? 0;

  // Get total tools count for rank context
  const totalResult = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM tools WHERE is_archived = 0'
  ).first() as { count: number } | null;

  const totalTools = totalResult?.count ?? 0;

  // Check subscription status (for pro gate)
  const subscription = await env.DB.prepare(
    `SELECT id FROM subscriptions
     WHERE user_email IN (
       SELECT email FROM email_subscribers WHERE email IS NOT NULL
     )
     AND tier = 'verified_publisher' AND status = 'active'
     LIMIT 1`
  ).first();

  // For now: isPro = false (pro tier not built yet)
  const isPro = false;

  // Build score signals for breakdown display
  // Weights: stars 15%, freshness 25%, issue_health 25%, contributors 10%, dependents 25%
  const stars = (tool.stars as number) || 0;
  const openIssues = (tool.open_issues as number) || 0;
  const closedIssues = (tool.closed_issues as number) || 0;
  const contributors = (tool.contributors as number) || 0;
  const dependents = (tool.dependents as number) || 0;
  const lastCommitAt = tool.last_commit_at as string | null;

  // Normalized signal scores (0-1), same as scorer
  const starsScore = Math.min(1, Math.log10(Math.max(1, stars)) / 4); // 10k stars = 1.0
  const totalIssues = openIssues + closedIssues;
  const issueHealth = totalIssues > 0 ? closedIssues / totalIssues : 0.5;
  const contributorsScore = Math.min(1, Math.log10(Math.max(1, contributors)) / 2); // 100 = 1.0
  const dependentsScore = Math.min(1, Math.log10(Math.max(1, dependents)) / 3); // 1000 = 1.0

  let freshnessScore = 0;
  if (lastCommitAt) {
    const daysSince = (Date.now() - new Date(lastCommitAt).getTime()) / (1000 * 60 * 60 * 24);
    freshnessScore = Math.max(0, 1 - daysSince / 180); // 0 at 6 months
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
      tagline: claim?.tagline ?? null,
      category: claim?.category ?? null,
      logo_url: claim?.logo_url ?? null,
      is_deprecated: claim?.is_deprecated === 1,
      view_count_7d: viewCount7d,
      total_tools: totalTools,
    },
    signals: {
      stars: parseFloat(starsScore.toFixed(2)),
      freshness: parseFloat(freshnessScore.toFixed(2)),
      issue_health: parseFloat(issueHealth.toFixed(2)),
      contributors: parseFloat(contributorsScore.toFixed(2)),
      dependents: parseFloat(dependentsScore.toFixed(2)),
    },
    isPro,
  });
};
