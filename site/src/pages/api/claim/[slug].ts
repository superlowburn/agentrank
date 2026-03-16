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

// GET — return current active claim for this tool
export const GET: APIRoute = async ({ params, locals }) => {
  const { env } = (locals as any).runtime;
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');

  const claim = await env.DB.prepare(
    'SELECT github_username, tagline, category, logo_url, is_deprecated FROM claims WHERE tool_full_name = ? AND status = ? LIMIT 1'
  ).bind(fullName, 'active').first();

  return json({ claim: claim || null });
};

// POST — save enriched claim data (must have valid session)
export const POST: APIRoute = async ({ request, params, locals }) => {
  const { env } = (locals as any).runtime;
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');

  const cookies = parseCookies(request.headers.get('cookie') || '');
  const rawSession = cookies.claim_session ? decodeURIComponent(cookies.claim_session) : null;

  if (!rawSession) {
    return json({ success: false, error: 'Not authenticated' }, 401);
  }

  const colonIdx = rawSession.indexOf(':');
  const sessionSlug = rawSession.slice(0, colonIdx);
  const githubUsername = rawSession.slice(colonIdx + 1);

  if (sessionSlug !== slug || !githubUsername) {
    return json({ success: false, error: 'Session mismatch' }, 403);
  }

  // Confirm verified claim exists
  const existing = await env.DB.prepare(
    'SELECT id FROM claims WHERE tool_full_name = ? AND github_username = ? AND verified = 1'
  ).bind(fullName, githubUsername).first();

  if (!existing) {
    return json({ success: false, error: 'No verified claim found' }, 403);
  }

  const data = (await request.json()) as {
    tagline?: string;
    category?: string;
    logo_url?: string;
    is_deprecated?: boolean;
  };

  if (data.tagline && data.tagline.length > 200) {
    return json({ success: false, error: 'Tagline must be 200 characters or less' }, 400);
  }
  if (data.logo_url && !/^https:\/\/.+/.test(data.logo_url)) {
    return json({ success: false, error: 'Logo URL must start with https://' }, 400);
  }

  const VALID_CATEGORIES = [
    'mcp-server', 'agent-framework', 'ai-tool', 'llm-client', 'code-assistant',
    'data-processing', 'browser-automation', 'database', 'search', 'monitoring',
    'communication', 'other',
  ];
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    return json({ success: false, error: 'Invalid category' }, 400);
  }

  await env.DB.prepare(`
    UPDATE claims
    SET tagline = ?, category = ?, logo_url = ?, is_deprecated = ?, updated_at = datetime('now')
    WHERE tool_full_name = ? AND github_username = ?
  `).bind(
    data.tagline?.trim() || null,
    data.category?.trim() || null,
    data.logo_url?.trim() || null,
    data.is_deprecated ? 1 : 0,
    fullName,
    githubUsername,
  ).run();

  return json({ success: true });
};
