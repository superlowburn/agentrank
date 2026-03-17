/** API key authentication, generation, and per-key daily rate limiting. */

const DAILY_LIMITS: Record<string, number> = {
  free: 100,
  pro: 10_000,
  enterprise: Infinity,
};

export interface ApiKeyRecord {
  id: string;
  key_prefix: string;
  name: string | null;
  tier: string;
  owner_email: string | null;
  is_active: number;
  last_used_at: string | null;
}

export interface AuthResult {
  allowed: boolean;
  keyRecord: ApiKeyRecord | null;
  error?: string;
  status?: number;
  limit: number;       // -1 = unlimited (enterprise)
  remaining: number;   // -1 = unlimited
  resetAt: string;     // ISO day boundary UTC
}

async function hashKey(rawKey: string): Promise<string> {
  const encoded = new TextEncoder().encode(rawKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function authenticateApiKey(db: D1Database, rawKey: string): Promise<AuthResult> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const resetAt = `${today}T23:59:59.999Z`;

  try {
    const hash = await hashKey(rawKey);
    const row = await db
      .prepare(
        `SELECT id, key_prefix, name, tier, owner_email, is_active, last_used_at
         FROM api_keys WHERE key_hash = ?`
      )
      .bind(hash)
      .first<ApiKeyRecord>();

    if (!row) {
      return { allowed: false, keyRecord: null, error: 'Invalid API key.', status: 401, limit: 0, remaining: 0, resetAt };
    }
    if (!row.is_active) {
      return { allowed: false, keyRecord: row, error: 'API key has been revoked.', status: 401, limit: 0, remaining: 0, resetAt };
    }

    const dailyLimit = DAILY_LIMITS[row.tier] ?? 100;

    if (!isFinite(dailyLimit)) {
      // Enterprise: unlimited — just update last_used_at
      db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?')
        .bind(new Date().toISOString(), row.id)
        .run()
        .catch(() => {});
      return { allowed: true, keyRecord: row, limit: -1, remaining: -1, resetAt };
    }

    // Increment daily 'total' counter
    const usageRow = await db
      .prepare(
        `INSERT INTO api_usage (api_key_id, date, endpoint, request_count)
         VALUES (?1, ?2, 'total', 1)
         ON CONFLICT (api_key_id, date, endpoint) DO UPDATE SET request_count = request_count + 1
         RETURNING request_count`
      )
      .bind(row.id, today)
      .first<{ request_count: number }>();

    const count = usageRow?.request_count ?? 1;
    const allowed = count <= dailyLimit;
    const remaining = Math.max(0, dailyLimit - count);

    if (allowed) {
      db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?')
        .bind(new Date().toISOString(), row.id)
        .run()
        .catch(() => {});
    }

    return {
      allowed,
      keyRecord: row,
      error: allowed ? undefined : `Daily limit of ${dailyLimit.toLocaleString()} requests exceeded.`,
      status: allowed ? undefined : 429,
      limit: dailyLimit,
      remaining,
      resetAt,
    };
  } catch {
    // Fail open on DB errors
    return { allowed: true, keyRecord: null, limit: 0, remaining: 0, resetAt };
  }
}

/** Track per-endpoint usage in the background (fire-and-forget). */
export function trackEndpointUsage(db: D1Database, apiKeyId: string, endpoint: string): void {
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    `INSERT INTO api_usage (api_key_id, date, endpoint, request_count)
     VALUES (?1, ?2, ?3, 1)
     ON CONFLICT (api_key_id, date, endpoint) DO UPDATE SET request_count = request_count + 1`
  )
    .bind(apiKeyId, today, endpoint)
    .run()
    .catch(() => {});
}

export function extractBearerKey(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

export function authHeaders(result: AuthResult): Record<string, string> {
  if (result.limit === -1) return {}; // Enterprise: no rate limit headers
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt,
    'X-API-Key-Tier': result.keyRecord?.tier ?? 'unknown',
  };
}

/** Generate a new raw API key and its hash. The raw key is returned only once. */
export async function generateApiKey(tier: string): Promise<{
  id: string;
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
}> {
  const id = crypto.randomUUID();
  const rawBytes = new Uint8Array(24);
  crypto.getRandomValues(rawBytes);
  const rawHex = Array.from(rawBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const rawKey = `ark_${tier}_${rawHex}`;
  const keyHash = await hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 20); // "ark_free_a1b2c3d4e5f6"
  return { id, rawKey, keyHash, keyPrefix };
}
