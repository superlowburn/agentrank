import type { APIRoute } from 'astro';
import { checkRateLimit, rateLimitHeaders } from '../../../lib/rate-limit';

export const prerender = false;

// Returns autocomplete suggestions for the search box.
// Matches tool/skill names by prefix (then substring), ranked by score.
// ?q=mcp&limit=8&type=tool|skill|all

export const GET: APIRoute = async ({ url, locals, request }) => {
  const { env } = (locals as any).runtime;
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '0.0.0.0';

  const rl = await checkRateLimit(env.DB, ip);
  const rlHeaders = rateLimitHeaders(rl);

  if (!rl.allowed) {
    return json({ error: 'Rate limit exceeded.' }, 429, rlHeaders);
  }

  const q = (url.searchParams.get('q') || '').trim();
  const type = (url.searchParams.get('type') || '').toLowerCase();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '8', 10) || 8, 1), 20);

  if (!q || q.length < 2) {
    return json({ query: q, suggestions: [] }, 200, rlHeaders);
  }

  const prefixPattern = `${q}%`;
  const containsPattern = `%${q}%`;
  const suggestions: Suggestion[] = [];

  try {
    if (!type || type === 'tool') {
      // Prefix matches first, then contains matches, ranked by score
      const tools = await env.DB.prepare(
        `SELECT full_name, description, score, category,
                CASE WHEN full_name LIKE ?1 THEN 1 ELSE 2 END AS match_priority
         FROM tools
         WHERE full_name LIKE ?2 AND score IS NOT NULL
         ORDER BY match_priority ASC, score DESC
         LIMIT ?3`
      )
        .bind(prefixPattern, containsPattern, limit)
        .all();

      for (const t of tools.results || []) {
        suggestions.push({
          type: 'tool',
          label: t.full_name as string,
          description: t.description as string | null,
          category: t.category as string | null,
          score: Math.round((t.score as number) * 10) / 10,
          url: `https://agentrank-ai.com/tool/${(t.full_name as string).replace('/', '--')}/`,
        });
      }
    }

    if (!type || type === 'skill') {
      const skills = await env.DB.prepare(
        `SELECT slug, name, description, score, category,
                CASE WHEN name LIKE ?1 OR slug LIKE ?1 THEN 1 ELSE 2 END AS match_priority
         FROM skills
         WHERE (name LIKE ?2 OR slug LIKE ?2) AND score IS NOT NULL
         ORDER BY match_priority ASC, score DESC
         LIMIT ?3`
      )
        .bind(prefixPattern, containsPattern, limit)
        .all();

      for (const s of skills.results || []) {
        const urlSlug = (s.slug as string).replace(/\//g, '--').replace(/:/g, '-');
        suggestions.push({
          type: 'skill',
          label: (s.name as string) || (s.slug as string),
          description: s.description as string | null,
          category: s.category as string | null,
          score: s.score != null ? Math.round((s.score as number) * 10) / 10 : null,
          url: `https://agentrank-ai.com/skill/${urlSlug}/`,
        });
      }
    }
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500, rlHeaders);
  }

  // Blend tools and skills: sort by score desc, prefix matches already prioritized per-type
  suggestions.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const trimmed = suggestions.slice(0, limit);

  return json(
    { query: q, suggestions: trimmed },
    200,
    { ...rlHeaders, 'Cache-Control': 'public, s-maxage=120, max-age=60' }
  );
};

interface Suggestion {
  type: 'tool' | 'skill';
  label: string;
  description: string | null;
  category: string | null;
  score: number | null;
  url: string;
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
