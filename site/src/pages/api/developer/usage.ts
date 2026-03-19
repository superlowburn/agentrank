import type { APIRoute } from 'astro';
import { authenticateApiKey, extractBearerKey, authHeaders } from '../../../lib/api-auth';

export const prerender = false;

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

/** GET /api/developer/usage — return usage stats for the authenticated API key. */
export const GET: APIRoute = async ({ locals, request }) => {
  const { env } = (locals as any).runtime;

  const rawKey = extractBearerKey(request);
  if (!rawKey) {
    return json({ error: 'Missing Authorization header. Use: Authorization: Bearer <api-key>' }, 401);
  }

  const auth = await authenticateApiKey(env.DB, rawKey);
  const headers = authHeaders(auth);

  if (!auth.allowed && auth.status !== 429) {
    // 401 (invalid/revoked key) — reject
    return json({ error: auth.error }, auth.status ?? 401, headers);
  }

  // Key is valid (may be rate-limited, but still show usage)
  if (!auth.keyRecord) {
    return json({ error: 'Key not found.' }, 404);
  }

  const keyId = auth.keyRecord.id;
  const today = new Date().toISOString().slice(0, 10);

  try {
    // Today's usage by endpoint
    const todayRows = await env.DB.prepare(
      `SELECT endpoint, request_count FROM api_usage
       WHERE api_key_id = ? AND date = ?
       ORDER BY request_count DESC`
    )
      .bind(keyId, today)
      .all();

    const todayUsage: Record<string, number> = {};
    for (const row of todayRows.results ?? []) {
      todayUsage[(row as any).endpoint] = (row as any).request_count;
    }
    const todayTotal = todayUsage['total'] ?? 0;

    // Last 30 days daily totals
    const historyRows = await env.DB.prepare(
      `SELECT date, SUM(request_count) AS total
       FROM api_usage
       WHERE api_key_id = ? AND endpoint = 'total'
         AND date >= date(?, '-30 days')
       GROUP BY date
       ORDER BY date ASC`
    )
      .bind(keyId, today)
      .all();

    const history = (historyRows.results ?? []).map((r: any) => ({
      date: r.date as string,
      requests: r.total as number,
    }));

    // Top endpoints (excluding 'total') over last 30 days
    const endpointRows = await env.DB.prepare(
      `SELECT endpoint, SUM(request_count) AS total
       FROM api_usage
       WHERE api_key_id = ? AND endpoint != 'total'
         AND date >= date(?, '-30 days')
       GROUP BY endpoint
       ORDER BY total DESC
       LIMIT 10`
    )
      .bind(keyId, today)
      .all();

    const topEndpoints = (endpointRows.results ?? []).map((r: any) => ({
      endpoint: r.endpoint as string,
      requests: r.total as number,
    }));

    const dailyLimit = auth.limit === -1 ? null : auth.limit;
    const remaining = auth.remaining === -1 ? null : auth.remaining;

    return json(
      {
        key: {
          prefix: auth.keyRecord.key_prefix,
          tier: auth.keyRecord.tier,
          name: auth.keyRecord.name,
          ownerEmail: auth.keyRecord.owner_email,
          createdAt: null, // not exposed (not in ApiKeyRecord)
          lastUsedAt: auth.keyRecord.last_used_at,
        },
        quota: {
          dailyLimit,
          usedToday: todayTotal,
          remaining,
          resetAt: new Date().toISOString().slice(0, 10) + 'T23:59:59.999Z',
        },
        todayByEndpoint: todayUsage,
        topEndpoints,
        history,
      },
      200,
      { ...headers, 'Cache-Control': 'private, no-store' }
    );
  } catch (e: any) {
    return json({ error: 'Database error.', detail: e.message }, 500, headers);
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    },
  });
};
