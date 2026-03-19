import type { APIRoute } from 'astro';
import { parseSessionCookie, verifySession } from '../../../lib/session';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
}

/** POST /api/developer/revoke — revoke an API key owned by the session user. */
export const POST: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;
  const secret = env.DASH_TOKEN || 'fallback-secret';

  const cookieValue = parseSessionCookie(request);
  if (!cookieValue) return json({ error: 'Not authenticated.' }, 401);

  const session = await verifySession(secret, cookieValue);
  if (!session) return json({ error: 'Session expired. Please sign in again.' }, 401);

  let body: { keyId?: string } = {};
  try { body = await request.json(); } catch { /* ok */ }

  const keyId = body.keyId?.trim();
  if (!keyId) return json({ error: 'keyId is required.' }, 400);

  try {
    // Verify the key belongs to this user before revoking
    const key = await env.DB.prepare(
      `SELECT id FROM api_keys WHERE id = ? AND github_user_id = ? AND is_active = 1`
    ).bind(keyId, session.userId).first<{ id: string }>();

    if (!key) return json({ error: 'Key not found or not owned by you.' }, 404);

    await env.DB.prepare(
      `UPDATE api_keys SET is_active = 0, revoked_at = datetime('now') WHERE id = ?`
    ).bind(keyId).run();

    return json({ ok: true });
  } catch (e: any) {
    return json({ error: 'Database error.', detail: e.message }, 500);
  }
};
