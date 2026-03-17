import type { APIRoute } from 'astro';
import { authenticateApiKey, extractBearerKey, authHeaders, trackEndpointUsage } from '../../../lib/api-auth';

export const prerender = false;

/** POST /api/v2/batch — batch tool lookup. Pro and Enterprise only.
 *
 * Body: { ids: string[] }   (up to 50 tool IDs, same format as /api/v2/tool/[id])
 * Returns: { results: { [id]: tool | null } }
 */
export const POST: APIRoute = async ({ locals, request }) => {
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

  // Batch is Pro/Enterprise only
  if (auth.keyRecord && auth.keyRecord.tier === 'free') {
    return json(
      { error: 'Batch endpoint requires a Pro or Enterprise API key. Upgrade at agentrank-ai.com.' },
      403,
      headers
    );
  }

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, headers);
  }

  if (!Array.isArray(body.ids)) {
    return json({ error: 'Body must include an "ids" array.' }, 400, headers);
  }

  const ids: string[] = body.ids
    .filter((id: unknown) => typeof id === 'string' && id.trim())
    .slice(0, 50); // Max 50 per batch

  if (ids.length === 0) {
    return json({ error: 'No valid IDs provided. Max 50.' }, 400, headers);
  }

  if (auth.keyRecord) {
    trackEndpointUsage(env.DB, auth.keyRecord.id, '/api/v2/batch');
  }

  const results: Record<string, unknown> = {};

  try {
    // Batch fetch tools
    const fullNames = ids.map(id => id.replace('--', '/'));
    const placeholders = fullNames.map((_, i) => `?${i + 1}`).join(',');

    const toolRows = await env.DB.prepare(
      `SELECT full_name, description, score, rank, stars, forks, open_issues, closed_issues,
              contributors, dependents, last_commit_at, language, license, is_archived,
              github_topics, readme_excerpt, glama_weekly_downloads, glama_tool_calls, url, category
       FROM tools WHERE full_name IN (${placeholders})`
    )
      .bind(...fullNames)
      .all();

    const toolMap: Record<string, any> = {};
    for (const t of toolRows.results ?? []) {
      toolMap[(t as any).full_name] = t;
    }

    // Batch fetch skills for IDs not found as tools
    const missingAsTools = ids.filter(id => !toolMap[id.replace('--', '/')]);
    const skillMap: Record<string, any> = {};
    if (missingAsTools.length > 0) {
      const skillPlaceholders = missingAsTools.map((_, i) => `?${i + 1}`).join(',');
      const skillRows = await env.DB.prepare(
        `SELECT slug, name, description, score, rank, gh_stars, gh_open_issues, gh_closed_issues,
                gh_contributors, gh_last_commit_at, gh_is_archived, installs, trending_rank,
                platforms, author, source, category, github_repo
         FROM skills WHERE slug IN (${skillPlaceholders})`
      )
        .bind(...missingAsTools)
        .all();

      for (const s of skillRows.results ?? []) {
        skillMap[(s as any).slug] = s;
      }
    }

    for (const id of ids) {
      const fullName = id.replace('--', '/');
      const toolRow = toolMap[fullName];
      if (toolRow) {
        results[id] = formatTool(toolRow, id);
        continue;
      }
      const skillRow = skillMap[id];
      if (skillRow) {
        results[id] = formatSkill(skillRow, id);
        continue;
      }
      results[id] = null;
    }
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500, headers);
  }

  return json(
    { results, count: Object.values(results).filter(Boolean).length, requested: ids.length },
    200,
    { ...headers, 'Cache-Control': 'private, no-store' }
  );
};

function formatTool(t: any, id: string) {
  return {
    type: 'tool',
    id,
    name: t.full_name as string,
    description: t.description as string | null,
    score: Math.round((t.score as number) * 10) / 10,
    rank: t.rank as number,
    githubUrl: t.url as string,
    category: t.category as string | null,
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
    },
  };
}

function formatSkill(s: any, id: string) {
  return {
    type: 'skill',
    id,
    name: (s.name as string) || (s.slug as string),
    description: s.description as string | null,
    score: s.score != null ? Math.round((s.score as number) * 10) / 10 : null,
    rank: s.rank as number | null,
    githubUrl: s.github_repo ? `https://github.com/${s.github_repo}` : null,
    category: s.category as string | null,
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
    },
  };
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
