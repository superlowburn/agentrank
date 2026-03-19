import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}

const VALID_TIERS = ['starter', 'growth', 'featured', 'sponsored_basic', 'sponsored_pro', 'sponsored_enterprise'];

export const POST: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!env.DASH_TOKEN || token !== env.DASH_TOKEN) {
    return json({ error: 'Unauthorized' }, 403);
  }

  let body: {
    tool_full_name?: string;
    sponsored?: boolean;
    tier?: string;
    description?: string;
    cta_text?: string;
    cta_url?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { tool_full_name, sponsored, tier, description, cta_text, cta_url } = body;

  if (!tool_full_name || typeof tool_full_name !== 'string') {
    return json({ error: 'tool_full_name is required' }, 400);
  }

  if (!tool_full_name.includes('/')) {
    return json({ error: 'tool_full_name must be in owner/repo format' }, 400);
  }

  if (tier !== undefined && !VALID_TIERS.includes(tier)) {
    return json({ error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` }, 400);
  }

  if (description !== undefined && description.length > 200) {
    return json({ error: 'description must be 200 characters or fewer' }, 400);
  }

  if (cta_text !== undefined && cta_text.length > 50) {
    return json({ error: 'cta_text must be 50 characters or fewer' }, 400);
  }

  if (cta_url !== undefined && cta_url !== '' && !cta_url.startsWith('https://')) {
    return json({ error: 'cta_url must start with https://' }, 400);
  }

  const db = env.DB;

  // Check tool exists
  const existing = await db
    .prepare('SELECT full_name, sponsored FROM tools WHERE full_name = ?')
    .bind(tool_full_name)
    .first();

  if (!existing) {
    return json({ error: `Tool not found: ${tool_full_name}` }, 404);
  }

  const sponsoredVal = sponsored === false ? 0 : sponsored === true ? 1 : (existing.sponsored as number);

  // Build SET clause dynamically
  const sets: string[] = ['sponsored = ?', 'updated_at = datetime(\'now\')'];
  const params: unknown[] = [sponsoredVal];

  if (tier !== undefined) {
    sets.push('sponsor_tier = ?');
    params.push(tier || null);
  }

  if (description !== undefined) {
    sets.push('sponsor_description = ?');
    params.push(description || null);
  }

  if (cta_text !== undefined) {
    sets.push('sponsor_cta_text = ?');
    params.push(cta_text || null);
  }

  if (cta_url !== undefined) {
    sets.push('sponsor_cta_url = ?');
    params.push(cta_url || null);
  }

  params.push(tool_full_name);

  try {
    await db
      .prepare(`UPDATE tools SET ${sets.join(', ')} WHERE full_name = ?`)
      .bind(...params)
      .run();

    return json({
      ok: true,
      tool_full_name,
      sponsored: sponsoredVal === 1,
      tier: tier ?? undefined,
    });
  } catch (err: any) {
    console.error('[admin/sponsor] DB error:', err);
    return json({ error: 'Database error', details: err?.message }, 500);
  }
};
