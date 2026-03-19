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
  const prefixPattern = `${q}%`;
  const results: SearchResult[] = [];

  // Search tools — title prefix matches ranked higher than description-only matches
  if (!type || type === 'tool') {
    const tools = await env.DB.prepare(
      `SELECT full_name, description, score, rank, category,
              CASE WHEN full_name LIKE ?2 THEN score * 1.5
                   WHEN full_name LIKE ?1 THEN score * 1.2
                   ELSE score END AS relevance
       FROM tools
       WHERE (full_name LIKE ?1 OR description LIKE ?1)
         AND score IS NOT NULL
       ORDER BY relevance DESC
       LIMIT ?3`
    ).bind(pattern, prefixPattern, limit).all();

    for (const t of tools.results || []) {
      results.push({
        type: 'tool',
        slug: t.full_name as string,
        name: t.full_name as string,
        description: t.description as string | null,
        score: t.score as number,
        rank: t.rank as number,
        category: t.category as string | null,
        url: `https://agentrank-ai.com/tool/${t.full_name}/`,
      });
    }
  }

  // Search skills — name prefix matches ranked higher
  if (!type || type === 'skill') {
    const skills = await env.DB.prepare(
      `SELECT slug, name, description, score, rank, category,
              CASE WHEN name LIKE ?2 OR slug LIKE ?2 THEN score * 1.5
                   WHEN name LIKE ?1 OR slug LIKE ?1 THEN score * 1.2
                   ELSE score END AS relevance
       FROM skills
       WHERE (slug LIKE ?1 OR name LIKE ?1 OR description LIKE ?1)
         AND score IS NOT NULL
       ORDER BY relevance DESC
       LIMIT ?3`
    ).bind(pattern, prefixPattern, limit).all();

    for (const s of skills.results || []) {
      const urlSlug = (s.slug as string).replace(/\//g, '--').replace(/:/g, '-');
      results.push({
        type: 'skill',
        slug: s.slug as string,
        name: (s.name as string) || (s.slug as string),
        description: s.description as string | null,
        score: s.score as number,
        rank: s.rank as number,
        category: s.category as string | null,
        url: `https://agentrank-ai.com/skill/${urlSlug}/`,
      });
    }
  }

  // Sort combined results by score descending, limit to requested count
  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
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
  category: string | null;
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
