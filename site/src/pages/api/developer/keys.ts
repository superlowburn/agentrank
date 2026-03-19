import type { APIRoute } from 'astro';
import { parseSessionCookie, verifySession } from '../../../lib/session';
import { generateApiKey } from '../../../lib/api-auth';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
}

const MAX_KEYS_PER_USER = 5;

/** GET /api/developer/keys — list all active API keys for the authenticated session user. */
export const GET: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  const secret = env.DASH_TOKEN || 'fallback-secret';

  const cookieValue = parseSessionCookie(request);
  if (!cookieValue) return json({ error: 'Not authenticated.' }, 401);

  const session = await verifySession(secret, cookieValue);
  if (!session) return json({ error: 'Session expired. Please sign in again.' }, 401);

  try {
    const rows = await env.DB.prepare(
      `SELECT k.id, k.key_prefix, k.name, k.tier, k.is_active, k.created_at, k.last_used_at,
              COALESCE(SUM(u.request_count), 0) AS requests_today
       FROM api_keys k
       LEFT JOIN api_usage u ON u.api_key_id = k.id AND u.date = date('now') AND u.endpoint = 'total'
       WHERE k.github_user_id = ? AND k.is_active = 1
       GROUP BY k.id
       ORDER BY k.created_at ASC`
    ).bind(session.userId).all();

    const keys = (rows.results ?? []).map((r: any) => ({
      id: r.id,
      prefix: r.key_prefix,
      name: r.name,
      tier: r.tier,
      createdAt: r.created_at,
      lastUsedAt: r.last_used_at,
      requestsToday: r.requests_today ?? 0,
      dailyLimit: r.tier === 'pro' ? 10000 : r.tier === 'enterprise' ? null : 100,
    }));

    return json({ keys, username: session.username });
  } catch (e: any) {
    return json({ error: 'Database error.', detail: e.message }, 500);
  }
};

/** POST /api/developer/keys — create a new API key for the authenticated session user. */
export const POST: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  const secret = env.DASH_TOKEN || 'fallback-secret';

  const cookieValue = parseSessionCookie(request);
  if (!cookieValue) return json({ error: 'Not authenticated.' }, 401);

  const session = await verifySession(secret, cookieValue);
  if (!session) return json({ error: 'Session expired. Please sign in again.' }, 401);

  let body: { name?: string } = {};
  try { body = await request.json(); } catch { /* ok */ }

  try {
    // Enforce per-user key limit
    const countRow = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM api_keys WHERE github_user_id = ? AND is_active = 1`
    ).bind(session.userId).first<{ n: number }>();

    if ((countRow?.n ?? 0) >= MAX_KEYS_PER_USER) {
      return json({ error: `Maximum of ${MAX_KEYS_PER_USER} active API keys per account.` }, 409);
    }

    const { id, rawKey, keyHash, keyPrefix } = await generateApiKey('free');
    const name = (body.name ?? '').trim() || 'New key';

    await env.DB.prepare(
      `INSERT INTO api_keys (id, key_hash, key_prefix, name, tier, github_user_id, github_username, is_active)
       VALUES (?1, ?2, ?3, ?4, 'free', ?5, ?6, 1)`
    ).bind(id, keyHash, keyPrefix, name, session.userId, session.username).run();

    return json({
      key: rawKey,
      prefix: keyPrefix,
      id,
      tier: 'free',
      dailyLimit: 100,
      message: 'Store this key securely — it will not be shown again.',
    }, 201);
  } catch (e: any) {
    return json({ error: 'Database error.', detail: e.message }, 500);
  }
};
