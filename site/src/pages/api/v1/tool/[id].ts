import type { APIRoute } from 'astro';
import { checkRateLimit, rateLimitHeaders } from '../../../../lib/rate-limit';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const { env } = (locals as any).runtime;
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '0.0.0.0';

  const rl = await checkRateLimit(env.DB, ip);
  const rlHeaders = rateLimitHeaders(rl);

  if (!rl.allowed) {
    return json({ error: 'Rate limit exceeded. Max 100 requests per minute.' }, 429, rlHeaders);
  }

  const rawId = params.id ?? '';
  if (!rawId) {
    return json({ error: 'Missing tool ID.' }, 400, rlHeaders);
  }

  // ID uses -- for / (e.g. "owner--repo" → "owner/repo")
  const fullName = rawId.replace('--', '/');

  try {
    const row = await env.DB.prepare('SELECT * FROM tools WHERE full_name = ?').bind(fullName).first();

    if (!row) {
      // Also try looking up a skill by slug
      const skill = await env.DB.prepare('SELECT * FROM skills WHERE slug = ?').bind(rawId).first();
      if (skill) {
        return buildSkillResponse(skill, rawId, rlHeaders);
      }
      return json({ error: `Tool not found: ${rawId}` }, 404, rlHeaders);
    }

    return buildToolResponse(row, rawId, rlHeaders);
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500, rlHeaders);
  }
};

function buildToolResponse(row: any, id: string, rlHeaders: Record<string, string>) {
  const stars = row.stars as number;
  const forks = row.forks as number;
  const openIssues = row.open_issues as number;
  const closedIssues = row.closed_issues as number;
  const contributors = row.contributors as number;
  const dependents = row.dependents as number;
  const lastCommitAt = row.last_commit_at as string | null;
  const isArchived = (row.is_archived as number) === 1;
  const description = row.description as string | null;
  const license = row.license as string | null;

  const signals = computeToolSignals({
    stars, forks, openIssues, closedIssues, contributors, dependents,
    lastCommitAt, isArchived, description, license,
  });

  const score = row.score as number;
  const hasDependents = dependents > 0;
  const weights = hasDependents
    ? { stars: 0.12, freshness: 0.23, issueHealth: 0.24, contributors: 0.09, dependents: 0.24, descriptionQuality: 0.05, licenseHealth: 0.03 }
    : { stars: 0.16, freshness: 0.30, issueHealth: 0.32, contributors: 0.12, dependents: 0.00, descriptionQuality: 0.07, licenseHealth: 0.03 };

  const githubTopics: string[] = JSON.parse((row.github_topics as string) || '[]');
  const matchedQueries: string[] = JSON.parse((row.matched_queries as string) || '[]');

  return json(
    {
      type: 'tool',
      id,
      name: row.full_name as string,
      description,
      score: Math.round(score * 10) / 10,
      rank: row.rank as number,
      githubUrl: row.url as string,
      signals: {
        stars: round(signals.stars),
        freshness: round(signals.freshness),
        issueHealth: round(signals.issueHealth),
        contributors: round(signals.contributors),
        dependents: round(signals.dependents),
        descriptionQuality: round(signals.descriptionQuality),
        licenseHealth: round(signals.licenseHealth),
      },
      weights,
      raw: {
        stars,
        forks,
        contributors,
        openIssues,
        closedIssues,
        dependents,
        lastCommitAt,
        language: row.language as string | null,
        license,
        isArchived,
        topics: githubTopics,
        matchedQueries,
        glamaWeeklyDownloads: (row.glama_weekly_downloads as number) || 0,
        glamaToolCalls: (row.glama_tool_calls as number) || 0,
      },
    },
    200,
    { ...rlHeaders, 'Cache-Control': 'public, s-maxage=300, max-age=60' }
  );
}

function buildSkillResponse(row: any, id: string, rlHeaders: Record<string, string>) {
  return json(
    {
      type: 'skill',
      id,
      name: (row.name as string) || (row.slug as string),
      description: row.description as string | null,
      score: row.score != null ? Math.round((row.score as number) * 10) / 10 : null,
      rank: row.rank as number | null,
      githubUrl: row.github_repo ? `https://github.com/${row.github_repo}` : null,
      signals: null,
      weights: null,
      raw: {
        stars: row.gh_stars as number | null,
        openIssues: row.gh_open_issues as number | null,
        closedIssues: row.gh_closed_issues as number | null,
        contributors: row.gh_contributors as number | null,
        lastCommitAt: row.gh_last_commit_at as string | null,
        isArchived: (row.gh_is_archived as number) === 1,
        installs: row.installs as number,
        trendingRank: row.trending_rank as number | null,
        platforms: JSON.parse((row.platforms as string) || '[]'),
        source: row.source as string,
        author: row.author as string | null,
      },
    },
    200,
    { ...rlHeaders, 'Cache-Control': 'public, s-maxage=300, max-age=60' }
  );
}

interface ToolRaw {
  stars: number;
  forks: number;
  openIssues: number;
  closedIssues: number;
  contributors: number;
  dependents: number;
  lastCommitAt: string | null;
  isArchived: boolean;
  description: string | null;
  license: string | null;
}

interface Signals {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  descriptionQuality: number;
  licenseHealth: number;
}

function computeToolSignals(r: ToolRaw): Signals {
  const days = r.lastCommitAt
    ? Math.max(0, (Date.now() - new Date(r.lastCommitAt).getTime()) / 86_400_000)
    : 365;

  let freshness: number;
  if (r.isArchived) {
    freshness = 0;
  } else if (days <= 7) {
    freshness = 1.0;
  } else if (days <= 90) {
    freshness = 1.0 - (days - 7) / (90 - 7);
  } else {
    freshness = Math.max(0, Math.exp(-(days - 90) / 90) * 0.1);
  }
  const isEstablished = r.stars >= 200 || r.dependents >= 5;
  if (isEstablished && freshness < 0.3) freshness = 0.3;

  const totalIssues = r.openIssues + r.closedIssues;
  const issueHealth = totalIssues === 0 ? 0.5 : r.closedIssues / totalIssues;

  // Stars: log-normalized against ~5000-star ceiling
  const starsRaw = Math.log1p(r.stars) / Math.log1p(5000);
  const stars = Math.min(1, starsRaw);

  // Contributors: log-normalized against ~50
  const contributorsRaw = Math.log1p(r.contributors) / Math.log1p(50);
  const contributors = Math.min(1, contributorsRaw);

  // Dependents: log-normalized against ~100
  const dependentsRaw = Math.log1p(r.dependents) / Math.log1p(100);
  const dependents = Math.min(1, dependentsRaw);

  // Description quality
  const descLen = r.description?.length ?? 0;
  const descriptionQuality = !r.description ? 0 : descLen < 50 ? 0.3 : descLen < 150 ? 0.7 : 1.0;

  // License health
  const goodLicenses = ['mit', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', 'isc', 'mpl-2.0'];
  const licenseKey = (r.license ?? '').toLowerCase();
  const licenseHealth = goodLicenses.some(l => licenseKey.includes(l)) ? 1.0 : r.license ? 0.5 : 0.0;

  return { stars, freshness, issueHealth, contributors, dependents, descriptionQuality, licenseHealth };
}

function round(n: number, decimals = 3) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

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
