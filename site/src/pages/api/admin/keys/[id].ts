import type { APIRoute } from 'astro';

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

/** GET /api/admin/keys/[id] — get a single API key record */
export const GET: APIRoute = async ({ params, locals, request }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const keyId = params.id ?? '';
  if (!keyId) return json({ error: 'Missing key ID.' }, 400);

  try {
    const row = await env.DB.prepare(
      `SELECT id, key_prefix, name, tier, owner_email, is_active, created_at, revoked_at, last_used_at
       FROM api_keys WHERE id = ?`
    )
      .bind(keyId)
      .first();

    if (!row) return json({ error: 'API key not found.' }, 404);

    const today = new Date().toISOString().slice(0, 10);
    const usage = await env.DB.prepare(
      `SELECT date, SUM(request_count) AS total FROM api_usage
       WHERE api_key_id = ? AND endpoint = 'total'
       GROUP BY date ORDER BY date DESC LIMIT 30`
    )
      .bind(keyId)
      .all();

    return json({
      id: (row as any).id,
      keyPrefix: (row as any).key_prefix,
      name: (row as any).name,
      tier: (row as any).tier,
      ownerEmail: (row as any).owner_email,
      isActive: (row as any).is_active === 1,
      createdAt: (row as any).created_at,
      revokedAt: (row as any).revoked_at,
      lastUsedAt: (row as any).last_used_at,
      usageLast30Days: (usage.results ?? []).map((u: any) => ({
        date: u.date,
        requests: u.total,
      })),
    });
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};

/** DELETE /api/admin/keys/[id] — revoke an API key */
export const DELETE: APIRoute = async ({ params, locals, request }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const keyId = params.id ?? '';
  if (!keyId) return json({ error: 'Missing key ID.' }, 400);

  try {
    const existing = await env.DB.prepare('SELECT id, is_active FROM api_keys WHERE id = ?')
      .bind(keyId)
      .first();

    if (!existing) return json({ error: 'API key not found.' }, 404);
    if (!(existing as any).is_active) return json({ error: 'API key is already revoked.' }, 409);

    const revokedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE api_keys SET is_active = 0, revoked_at = ? WHERE id = ?'
    )
      .bind(revokedAt, keyId)
      .run();

    return json({ id: keyId, revoked: true, revokedAt });
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};

/** PATCH /api/admin/keys/[id] — update key name or owner_email */
export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const keyId = params.id ?? '';
  if (!keyId) return json({ error: 'Missing key ID.' }, 400);

  let body: { name?: string; ownerEmail?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  try {
    const existing = await env.DB.prepare('SELECT id FROM api_keys WHERE id = ?')
      .bind(keyId)
      .first();
    if (!existing) return json({ error: 'API key not found.' }, 404);

    if (body.name !== undefined) {
      await env.DB.prepare('UPDATE api_keys SET name = ? WHERE id = ?')
        .bind(body.name, keyId)
        .run();
    }
    if (body.ownerEmail !== undefined) {
      await env.DB.prepare('UPDATE api_keys SET owner_email = ? WHERE id = ?')
        .bind(body.ownerEmail, keyId)
        .run();
    }

    const updated = await env.DB.prepare(
      'SELECT id, key_prefix, name, tier, owner_email, is_active, created_at FROM api_keys WHERE id = ?'
    )
      .bind(keyId)
      .first();

    return json(updated);
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500);
  }
};
