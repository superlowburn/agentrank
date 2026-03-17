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

/** GET /api/admin/subscribers — list all subscribers with count summary */
export const GET: APIRoute = async ({ locals, request, url }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 1000);
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  const [countRow, rows] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS total FROM email_subscribers').first() as Promise<{ total: number } | null>,
    env.DB.prepare(
      `SELECT id, email, source, subscribed_at, confirmed
       FROM email_subscribers
       ORDER BY subscribed_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all(),
  ]);

  const total = countRow?.total ?? 0;
  const subscribers = (rows.results ?? []).map((r: any) => ({
    id: r.id,
    email: r.email,
    source: r.source,
    subscribedAt: r.subscribed_at,
    confirmed: r.confirmed === 1,
  }));

  return json({ total, count: subscribers.length, offset, subscribers });
};
