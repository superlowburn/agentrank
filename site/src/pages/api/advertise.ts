import type { APIRoute } from 'astro';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  let name: string | undefined;
  let email: string | undefined;
  let tool_url: string | undefined;
  let tier: string | undefined;
  let honeypot: string = '';

  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const data = await request.json();
      name = data.name?.trim();
      email = data.email?.trim();
      tool_url = data.tool_url?.trim();
      tier = data.tier?.trim();
      honeypot = data._hp?.trim() || '';
    } else {
      const fd = await request.formData();
      name = (fd.get('name') as string | null)?.trim();
      email = (fd.get('email') as string | null)?.trim();
      tool_url = (fd.get('tool_url') as string | null)?.trim();
      tier = (fd.get('tier') as string | null)?.trim();
      honeypot = ((fd.get('_hp') as string | null)?.trim()) || '';
    }
  } catch {
    return json({ success: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot
  if (honeypot) {
    return json({ success: true }, 200);
  }

  if (!email) return json({ success: false, error: 'Email is required.' }, 400);
  if (!emailRegex.test(email)) return json({ success: false, error: 'Invalid email address.' }, 400);
  if (!name?.trim()) return json({ success: false, error: 'Name is required.' }, 400);

  const validTiers = ['starter', 'growth', 'featured'];
  if (!tier || !validTiers.includes(tier)) tier = 'growth';

  const ipHash = await hashIP(getClientIP(request));

  try {
    await env.DB.prepare(`
      INSERT INTO sponsor_interest (name, email, tool_url, tier, ip_hash)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      name,
      email.toLowerCase(),
      tool_url || null,
      tier,
      ipHash,
    ).run();

    return json({ success: true }, 201);
  } catch (err: any) {
    return json({ success: false, error: 'Submission failed. Please try again.' }, 500);
  }
};
