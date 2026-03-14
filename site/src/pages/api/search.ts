import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;
  const q = (url.searchParams.get('q') || '').trim();
  const type = url.searchParams.get('type') || '';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 1), 50);

  if (!q) {
    return json({ results: [], error: 'Missing query parameter: q' }, 400);
  }

  const pattern = `%${q}%`;
  const results: SearchResult[] = [];

  // Search tools
  if (!type || type === 'tool') {
    const tools = await env.DB.prepare(
      `SELECT full_name, description, score, rank
       FROM tools
       WHERE (full_name LIKE ?1 OR description LIKE ?1)
         AND score IS NOT NULL
       ORDER BY score DESC
       LIMIT ?2`
    ).bind(pattern, limit).all();

    for (const t of tools.results || []) {
      results.push({
        type: 'tool',
        slug: t.full_name as string,
        name: t.full_name as string,
        description: t.description as string | null,
        score: t.score as number,
        rank: t.rank as number,
        url: `https://agentrank-ai.com/tool/${t.full_name}/`,
      });
    }
  }

  // Search skills
  if (!type || type === 'skill') {
    const skills = await env.DB.prepare(
      `SELECT slug, name, description, score, rank
       FROM skills
       WHERE (slug LIKE ?1 OR name LIKE ?1 OR description LIKE ?1)
         AND score IS NOT NULL
       ORDER BY score DESC
       LIMIT ?2`
    ).bind(pattern, limit).all();

    for (const s of skills.results || []) {
      const urlSlug = (s.slug as string).replace(/\//g, '--').replace(/:/g, '-');
      results.push({
        type: 'skill',
        slug: s.slug as string,
        name: (s.name as string) || (s.slug as string),
        description: s.description as string | null,
        score: s.score as number,
        rank: s.rank as number,
        url: `https://agentrank-ai.com/skill/${urlSlug}/`,
      });
    }
  }

  // Sort combined results by score descending, limit to requested count
  results.sort((a, b) => b.score - a.score);
  const trimmed = results.slice(0, limit);

  return json({ query: q, results: trimmed });
};

interface SearchResult {
  type: 'tool' | 'skill';
  slug: string;
  name: string;
  description: string | null;
  score: number;
  rank: number;
  url: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=300, max-age=60',
    },
  });
}
