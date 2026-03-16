/** D1-backed IP rate limiter: 100 req/min per IP. */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string; // ISO minute boundary
}

const LIMIT = 100;

export async function checkRateLimit(db: D1Database, ip: string): Promise<RateLimitResult> {
  const now = new Date();
  const window = `${now.toISOString().slice(0, 16)}`; // YYYY-MM-DDTHH:MM
  const resetAt = `${window}:59.999Z`.replace('T', 'T');

  try {
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (ip, window, count)
         VALUES (?1, ?2, 1)
         ON CONFLICT (ip, window) DO UPDATE SET count = count + 1
         RETURNING count`
      )
      .bind(ip, window)
      .first<{ count: number }>();

    const count = row?.count ?? 1;
    const allowed = count <= LIMIT;
    const remaining = Math.max(0, LIMIT - count);

    // Occasionally prune old windows (roughly 1% of requests)
    if (Math.random() < 0.01) {
      const cutoff = new Date(now.getTime() - 2 * 60 * 1000).toISOString().slice(0, 16);
      db.prepare(`DELETE FROM rate_limits WHERE window < ?`).bind(cutoff).run().catch(() => {});
    }

    return { allowed, limit: LIMIT, remaining, resetAt };
  } catch {
    // On any error, allow the request (fail open)
    return { allowed: true, limit: LIMIT, remaining: LIMIT, resetAt };
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt,
  };
}
