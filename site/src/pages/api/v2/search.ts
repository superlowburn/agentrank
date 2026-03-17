import type { APIRoute } from 'astro';
import { authenticateApiKey, extractBearerKey, authHeaders, trackEndpointUsage } from '../../../lib/api-auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, request }) => {
  const { env } = (locals as any).runtime;

  const rawKey = extractBearerKey(request);
  if (!rawKey) {
    return json({ error: 'Missing Authorization header. Use: Authorization: Bearer <api-key>' }, 401);
  }

  const auth = await authenticateApiKey(env.DB, rawKey);
  const headers = authHeaders(auth);

  if (!auth.allowed) {
    return json({ error: auth.error }, auth.status ?? 401, headers);
  }

  if (auth.keyRecord) {
    trackEndpointUsage(env.DB, auth.keyRecord.id, '/api/v2/search');
  }

  const q = (url.searchParams.get('q') || '').trim();
  const category = (url.searchParams.get('category') || '').toLowerCase();
  const sort = url.searchParams.get('sort') || 'score';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
  const includeHistory = url.searchParams.get('history') === '1';

  const validCategories = ['', 'tool', 'skill', 'agent'];
  if (!validCategories.includes(category)) {
    return json({ error: 'Invalid category. Must be: tool, skill, or agent.' }, 400, headers);
  }

  const validSorts = ['score', 'rank', 'stars', 'freshness'];
  const sortField = validSorts.includes(sort) ? sort : 'score';

  const results: ApiResult[] = [];

  try {
    if (!category || category === 'tool') {
      const tools = await queryTools(env.DB, q, sortField, limit + offset);
      results.push(...tools);
    }
    if (!category || category === 'skill') {
      const skills = await querySkills(env.DB, q, sortField, limit + offset);
      results.push(...skills);
    }
    if (!category || category === 'agent') {
      const agents = await queryAgents(env.DB, q, limit + offset);
      results.push(...agents);
    }
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500, headers);
  }

  if (sortField === 'rank') {
    results.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  } else if (sortField === 'stars') {
    results.sort((a, b) => ((b.raw?.stars as number) ?? 0) - ((a.raw?.stars as number) ?? 0));
  } else {
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const page = results.slice(offset, offset + limit);

  // Optionally hydrate rank history for tool results
  if (includeHistory) {
    const toolIds = page.filter(r => r.type === 'tool').map(r => r.name);
    if (toolIds.length > 0) {
      const placeholders = toolIds.map((_, i) => `?${i + 1}`).join(',');
      const histRows = await env.DB.prepare(
        `SELECT tool_full_name, snapshot_date, rank, score
         FROM rank_history
         WHERE tool_full_name IN (${placeholders}) AND tool_type = 'tool'
         ORDER BY snapshot_date DESC`
      )
        .bind(...toolIds)
        .all();

      const histMap: Record<string, Array<{ date: string; rank: number; score: number }>> = {};
      for (const h of histRows.results ?? []) {
        const fn = (h as any).tool_full_name;
        if (!histMap[fn]) histMap[fn] = [];
        histMap[fn].push({
          date: (h as any).snapshot_date,
          rank: (h as any).rank,
          score: Math.round((h as any).score * 10) / 10,
        });
      }

      for (const r of page) {
        if (r.type === 'tool') {
          (r as any).rankHistory = histMap[r.name] ?? [];
        }
      }
    }
  }

  return json(
    {
      query: q || null,
      category: category || 'all',
      sort: sortField,
      results: page,
      meta: { total: results.length, limit, offset },
      tier: auth.keyRecord?.tier ?? 'unknown',
    },
    200,
    { ...headers, 'Cache-Control': 'private, no-store' }
  );
};

async function queryTools(db: D1Database, q: string, sort: string, limit: number): Promise<ApiResult[]> {
  let orderBy = 'score DESC';
  if (sort === 'rank') orderBy = 'rank ASC';
  else if (sort === 'stars') orderBy = 'stars DESC';

  let stmt;
  if (q) {
    const pattern = `%${q}%`;
    stmt = await db
      .prepare(
        `SELECT full_name, description, score, rank, stars, forks, open_issues, closed_issues,
                contributors, dependents, last_commit_at, language, license, is_archived,
                github_topics, readme_excerpt, glama_weekly_downloads, glama_tool_calls, category
         FROM tools
         WHERE (full_name LIKE ?1 OR description LIKE ?1)
           AND score IS NOT NULL
         ORDER BY ${orderBy}
         LIMIT ?2`
      )
      .bind(pattern, limit)
      .all();
  } else {
    stmt = await db
      .prepare(
        `SELECT full_name, description, score, rank, stars, forks, open_issues, closed_issues,
                contributors, dependents, last_commit_at, language, license, is_archived,
                github_topics, readme_excerpt, glama_weekly_downloads, glama_tool_calls, category
         FROM tools
         WHERE score IS NOT NULL
         ORDER BY ${orderBy}
         LIMIT ?1`
      )
      .bind(limit)
      .all();
  }

  return (stmt.results || []).map((t: any) => ({
    type: 'tool' as const,
    id: (t.full_name as string).replace('/', '--'),
    name: t.full_name as string,
    description: t.description as string | null,
    score: Math.round((t.score as number) * 10) / 10,
    rank: t.rank as number,
    url: `https://agentrank-ai.com/tool/${(t.full_name as string).replace('/', '--')}/`,
    raw: {
      stars: t.stars as number,
      forks: t.forks as number,
      openIssues: t.open_issues as number,
      closedIssues: t.closed_issues as number,
      contributors: t.contributors as number,
      dependents: t.dependents as number,
      lastCommitAt: t.last_commit_at as string | null,
      language: t.language as string | null,
      license: t.license as string | null,
      isArchived: (t.is_archived as number) === 1,
      topics: JSON.parse((t.github_topics as string) || '[]'),
      readmeExcerpt: t.readme_excerpt as string | null,
      glamaWeeklyDownloads: (t.glama_weekly_downloads as number) || 0,
      glamaToolCalls: (t.glama_tool_calls as number) || 0,
      category: t.category as string | null,
    },
  }));
}

async function querySkills(db: D1Database, q: string, sort: string, limit: number): Promise<ApiResult[]> {
  let orderBy = 'score DESC';
  if (sort === 'rank') orderBy = 'rank ASC';
  else if (sort === 'stars') orderBy = 'gh_stars DESC';

  let stmt;
  if (q) {
    const pattern = `%${q}%`;
    stmt = await db
      .prepare(
        `SELECT slug, name, description, score, rank, gh_stars, gh_open_issues, gh_closed_issues,
                gh_contributors, gh_last_commit_at, gh_is_archived, installs, trending_rank,
                platforms, author, source, category
         FROM skills
         WHERE (slug LIKE ?1 OR name LIKE ?1 OR description LIKE ?1)
           AND score IS NOT NULL
         ORDER BY ${orderBy}
         LIMIT ?2`
      )
      .bind(pattern, limit)
      .all();
  } else {
    stmt = await db
      .prepare(
        `SELECT slug, name, description, score, rank, gh_stars, gh_open_issues, gh_closed_issues,
                gh_contributors, gh_last_commit_at, gh_is_archived, installs, trending_rank,
                platforms, author, source, category
         FROM skills
         WHERE score IS NOT NULL
         ORDER BY ${orderBy}
         LIMIT ?1`
      )
      .bind(limit)
      .all();
  }

  return (stmt.results || []).map((s: any) => {
    const urlSlug = (s.slug as string).replace(/\//g, '--').replace(/:/g, '-');
    return {
      type: 'skill' as const,
      id: s.slug as string,
      name: (s.name as string) || (s.slug as string),
      description: s.description as string | null,
      score: s.score != null ? Math.round((s.score as number) * 10) / 10 : null,
      rank: s.rank as number | null,
      url: `https://agentrank-ai.com/skill/${urlSlug}/`,
      raw: {
        stars: s.gh_stars as number | null,
        openIssues: s.gh_open_issues as number | null,
        closedIssues: s.gh_closed_issues as number | null,
        contributors: s.gh_contributors as number | null,
        lastCommitAt: s.gh_last_commit_at as string | null,
        isArchived: (s.gh_is_archived as number) === 1,
        installs: s.installs as number,
        trendingRank: s.trending_rank as number | null,
        platforms: JSON.parse((s.platforms as string) || '[]'),
        author: s.author as string | null,
        source: s.source as string,
        category: s.category as string | null,
      },
    };
  });
}

async function queryAgents(db: D1Database, q: string, limit: number): Promise<ApiResult[]> {
  let stmt;
  if (q) {
    const pattern = `%${q}%`;
    stmt = await db
      .prepare(
        `SELECT slug, name, description, owner_name, owner_url, endpoint_url, capabilities, registered_at
         FROM agents
         WHERE (name LIKE ?1 OR description LIKE ?1 OR slug LIKE ?1)
           AND status = 'active'
         ORDER BY registered_at DESC
         LIMIT ?2`
      )
      .bind(pattern, limit)
      .all();
  } else {
    stmt = await db
      .prepare(
        `SELECT slug, name, description, owner_name, owner_url, endpoint_url, capabilities, registered_at
         FROM agents WHERE status = 'active'
         ORDER BY registered_at DESC
         LIMIT ?1`
      )
      .bind(limit)
      .all();
  }

  return (stmt.results || []).map((a: any) => ({
    type: 'agent' as const,
    id: a.slug as string,
    name: a.name as string,
    description: a.description as string | null,
    score: null,
    rank: null,
    url: `https://agentrank-ai.com/agents/`,
    raw: {
      ownerName: a.owner_name as string | null,
      ownerUrl: a.owner_url as string | null,
      endpointUrl: a.endpoint_url as string | null,
      capabilities: JSON.parse((a.capabilities as string) || '[]'),
      registeredAt: a.registered_at as string,
    },
  }));
}

interface ApiResult {
  type: 'tool' | 'skill' | 'agent';
  id: string;
  name: string;
  description: string | null;
  score: number | null;
  rank: number | null;
  url: string;
  raw: Record<string, unknown>;
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
