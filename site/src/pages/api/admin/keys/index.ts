import type { APIRoute } from 'astro';
import { generateApiKey } from '../../../../lib/api-auth';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requireDashToken(request: Request, env: any): boolean {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  return token === env.DASH_TOKEN;
}

/** GET /api/admin/keys — list all API keys (no raw key values) */
export const GET: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  try {
    const rows = await env.DB.prepare(
      `SELECT id, key_prefix, name, tier, owner_email, is_active, created_at, revoked_at, last_used_at
       FROM api_keys ORDER BY created_at DESC`
    ).all();

    const today = new Date().toISOString().slice(0, 10);
    const usageRows = await env.DB.prepare(
      `SELECT api_key_id, SUM(request_count) AS total
       FROM api_usage WHERE date = ? AND endpoint = 'total'
       GROUP BY api_key_id`
    ).bind(today).all();

    const usageMap: Record<string, number> = {};
    for (const u of usageRows.results ?? []) {
      usageMap[(u as any).api_key_id] = (u as any).total;
    }

    const keys = (rows.results ?? []).map((r: any) => ({
      id: r.id,
      keyPrefix: r.key_prefix,
      name: r.name,
      tier: r.tier,
      ownerEmail: r.owner_email,
      isActive: r.is_active === 1,
      createdAt: r.created_at,
      revokedAt: r.revoked_at,
      lastUsedAt: r.last_used_at,
      usageToday: usageMap[r.id] ?? 0,
    }));

    return json({ keys });
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};

/** POST /api/admin/keys — create a new API key */
export const POST: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  let body: { name?: string; tier?: string; ownerEmail?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const tier = (body.tier ?? 'free').toLowerCase();
  if (!['free', 'pro', 'enterprise'].includes(tier)) {
    return json({ error: 'Invalid tier. Must be: free, pro, or enterprise.' }, 400);
  }

  try {
    const { id, rawKey, keyHash, keyPrefix } = await generateApiKey(tier);

    await env.DB.prepare(
      `INSERT INTO api_keys (id, key_hash, key_prefix, name, tier, owner_email, is_active)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1)`
    )
      .bind(id, keyHash, keyPrefix, body.name ?? null, tier, body.ownerEmail ?? null)
      .run();

    return json(
      {
        id,
        key: rawKey,      // Only returned once — store it securely
        keyPrefix,
        name: body.name ?? null,
        tier,
        ownerEmail: body.ownerEmail ?? null,
        createdAt: new Date().toISOString(),
        dailyLimit: tier === 'enterprise' ? 'unlimited' : tier === 'pro' ? 10_000 : 100,
      },
      201
    );
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};
