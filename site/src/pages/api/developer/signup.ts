import type { APIRoute } from 'astro';
import { generateApiKey } from '../../../lib/api-auth';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/** POST /api/developer/signup — self-service free API key generation. */
export const POST: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'A valid email address is required.' }, 400);
  }

  try {
    // Check if an active key already exists for this email
    const existing = await env.DB.prepare(
      `SELECT id, key_prefix, tier, created_at FROM api_keys
       WHERE owner_email = ? AND is_active = 1
       ORDER BY created_at DESC LIMIT 1`
    )
      .bind(email)
      .first<{ id: string; key_prefix: string; tier: string; created_at: string }>();

    if (existing) {
      return json(
        {
          error: 'An active API key already exists for this email. Check your records or contact support to rotate your key.',
          keyPrefix: existing.key_prefix,
          tier: existing.tier,
          createdAt: existing.created_at,
        },
        409
      );
    }

    const { id, rawKey, keyHash, keyPrefix } = await generateApiKey('free');
    const name = (body.name ?? '').trim() || null;

    await env.DB.prepare(
      `INSERT INTO api_keys (id, key_hash, key_prefix, name, tier, owner_email, is_active)
       VALUES (?1, ?2, ?3, ?4, 'free', ?5, 1)`
    )
      .bind(id, keyHash, keyPrefix, name, email)
      .run();

    return json(
      {
        key: rawKey,          // Shown once — store it securely
        keyPrefix,
        id,
        tier: 'free',
        dailyLimit: 100,
        ownerEmail: email,
        createdAt: new Date().toISOString(),
        message: 'Your API key has been generated. Store it securely — it will not be shown again.',
      },
      201
    );
  } catch (e: any) {
    return json({ error: 'Database error.', detail: e.message }, 500);
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
