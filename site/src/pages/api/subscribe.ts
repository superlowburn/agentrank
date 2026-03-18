import type { APIRoute } from 'astro';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ORIGINS = ['https://agentrank-ai.com', 'https://www.agentrank-ai.com'];
const RATE_LIMIT_PER_HOUR = 5;

function json(data: unknown, status = 200, corsOrigin?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (corsOrigin) {
    headers['Access-Control-Allow-Origin'] = corsOrigin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function isBlockedOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin') ?? '';
  if (!origin) return false; // no origin = same-site request, allow
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return false;
  return !ALLOWED_ORIGINS.includes(origin);
}

function getAllowedCorsOrigin(request: Request): string | undefined {
  const origin = request.headers.get('Origin') ?? '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : undefined;
}

async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// Returns current hour window as "YYYY-MM-DDTHH"
function hourWindow(): string {
  return new Date().toISOString().slice(0, 13);
}

async function checkRateLimit(db: any, ip: string): Promise<boolean> {
  if (ip === 'unknown') return false;
  const window = hourWindow();
  const row = await db.prepare(
    'SELECT count FROM rate_limits WHERE ip = ? AND window = ?'
  ).bind(ip, window).first() as { count: number } | null;

  if (row && row.count >= RATE_LIMIT_PER_HOUR) return true; // rate limited

  if (row) {
    await db.prepare(
      'UPDATE rate_limits SET count = count + 1 WHERE ip = ? AND window = ?'
    ).bind(ip, window).run();
  } else {
    await db.prepare(
      'INSERT INTO rate_limits (ip, window, count) VALUES (?, ?, 1)'
    ).bind(ip, window).run();
  }
  return false;
}

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  if (isBlockedOrigin(request)) {
    return json({ success: false, error: 'Forbidden' }, 403);
  }
  const corsOrigin = getAllowedCorsOrigin(request);

  let email: string | undefined;
  let source: string = 'homepage';
  let honeypot: string = '';
  let utmParams: Record<string, string> | null = null;

  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const data = await request.json();
      email = data.email?.trim();
      source = data.source?.trim() || 'homepage';
      honeypot = data._hp?.trim() || '';
      if (data.utm_params && typeof data.utm_params === 'object') {
        const filtered = Object.fromEntries(
          Object.entries(data.utm_params as Record<string, unknown>)
            .filter(([k, v]) => typeof v === 'string' && v.length > 0 && v.length <= 200
              && /^utm_(source|medium|campaign|content|term)$/.test(k))
            .map(([k, v]) => [k, (v as string).slice(0, 200)])
        );
        if (Object.keys(filtered).length > 0) utmParams = filtered;
      }
    } else {
      const fd = await request.formData();
      email = (fd.get('email') as string | null)?.trim();
      source = (fd.get('source') as string | null)?.trim() || 'homepage';
      honeypot = ((fd.get('_hp') as string | null)?.trim()) || '';
    }
  } catch {
    return json({ success: false, error: 'Invalid request body.' }, 400, corsOrigin);
  }

  // Honeypot: bots fill hidden fields, humans don't
  if (honeypot) {
    return json({ success: true }, 200, corsOrigin);
  }

  if (!email) {
    return json({ success: false, error: 'Email is required.' }, 400, corsOrigin);
  }
  if (!emailRegex.test(email)) {
    return json({ success: false, error: 'Invalid email address.' }, 400, corsOrigin);
  }

  const validSources = ['homepage', 'footer', 'blog', 'blog-index', 'embed', 'subscribe-page'];
  if (!validSources.includes(source)) source = 'homepage';

  const clientIP = getClientIP(request);
  try {
    const limited = await checkRateLimit(env.DB, clientIP);
    if (limited) {
      return json({ success: false, error: 'Too many requests. Please try again later.' }, 429, corsOrigin);
    }
  } catch {
    // Rate limit check failure shouldn't block subscriptions
  }

  const ipHash = await hashIP(clientIP);

  try {
    await env.DB.prepare(
      'INSERT INTO email_subscribers (email, source, ip_hash, utm_params) VALUES (?, ?, ?, ?)'
    ).bind(email.toLowerCase(), source, ipHash, utmParams ? JSON.stringify(utmParams) : null).run();

    return json({ success: true }, 201, corsOrigin);
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE') || err?.cause?.message?.includes('UNIQUE')) {
      return json({ success: true, already: true }, 200, corsOrigin);
    }
    return json({ success: false, error: 'Subscription failed. Please try again.' }, 500, corsOrigin);
  }
};
