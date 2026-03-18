import type { APIRoute } from 'astro';

export const prerender = false;

// Lightweight SHA-256 hash of an IP address (no PII stored)
async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}

export const GET: APIRoute = async ({ locals, url, request }) => {
  const { env } = (locals as any).runtime;
  const db = env.DB;

  const slug = url.searchParams.get('slug') || 'agentrank';
  const ip = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0].trim()
    || 'unknown';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);

  try {
    const ipHash = await hashIP(ip);

    await db.prepare(
      `INSERT INTO skill_pings (slug, ip_hash, user_agent) VALUES (?, ?, ?)`
    ).bind(slug, ipHash, ua).run();

    const totalRow = await db.prepare(
      `SELECT COUNT(*) AS total, COUNT(DISTINCT ip_hash) AS unique_installs FROM skill_pings WHERE slug = ?`
    ).bind(slug).first();

    return json({ ok: true, slug, total_pings: totalRow?.total ?? 0, unique_installs: totalRow?.unique_installs ?? 0 });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
  });
};
