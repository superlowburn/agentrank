import type { APIRoute } from 'astro';
import { checkRateLimit, rateLimitHeaders } from '../../../lib/rate-limit';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals, request }) => {
  const { env } = (locals as any).runtime;
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '0.0.0.0';

  const rl = await checkRateLimit(env.DB, ip);
  const rlHeaders = rateLimitHeaders(rl);

  if (!rl.allowed) {
    return json({ error: 'Rate limit exceeded. Max 100 requests per minute.' }, 429, rlHeaders);
  }

  const q = (url.searchParams.get('q') || '').trim();
  const category = (url.searchParams.get('category') || '').toLowerCase();
  const sort = url.searchParams.get('sort') || 'score';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  // category must be one of: tool, skill, agent, or empty (all)
  const validCategories = ['', 'tool', 'skill', 'agent'];
  if (!validCategories.includes(category)) {
    return json({ error: 'Invalid category. Must be: tool, skill, or agent.' }, 400, rlHeaders);
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
    return json({ error: 'Database error', detail: e.message }, 500, rlHeaders);
  }

  // Sort combined results
  if (sortField === 'score' || sortField === 'rank') {
    if (sortField === 'rank') {
      results.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    } else {
      results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
  } else if (sortField === 'stars') {
    results.sort((a, b) => (b.raw?.stars ?? 0) - (a.raw?.stars ?? 0));
  }

  const page = results.slice(offset, offset + limit);

  return json(
    {
      query: q || null,
      category: category || 'all',
      sort: sortField,
      results: page,
      meta: { total: results.length, limit, offset },
    },
    200,
    { ...rlHeaders, 'Cache-Control': 'public, s-maxage=60, max-age=30' }
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
        `SELECT full_name, description, score, rank, stars, last_commit_at, language, license
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
        `SELECT full_name, description, score, rank, stars, last_commit_at, language, license
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
      lastCommitAt: t.last_commit_at as string | null,
      language: t.language as string | null,
      license: t.license as string | null,
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
        `SELECT slug, name, description, score, rank, gh_stars, gh_last_commit_at, installs, source
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
        `SELECT slug, name, description, score, rank, gh_stars, gh_last_commit_at, installs, source
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
        lastCommitAt: s.gh_last_commit_at as string | null,
        installs: s.installs as number,
        source: s.source as string,
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
        `SELECT slug, name, description, owner_name, owner_url, endpoint_url, registered_at
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
        `SELECT slug, name, description, owner_name, owner_url, endpoint_url, registered_at
         FROM agents
         WHERE status = 'active'
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
