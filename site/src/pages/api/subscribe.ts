import type { APIRoute } from 'astro';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  let email: string | undefined;
  let source: string = 'homepage';

  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await request.json();
    email = data.email?.trim();
    source = data.source?.trim() || 'homepage';
  } else {
    const fd = await request.formData();
    email = (fd.get('email') as string | null)?.trim();
    source = (fd.get('source') as string | null)?.trim() || 'homepage';
  }

  if (!email) {
    return json({ success: false, error: 'Email is required' }, 400);
  }
  if (!emailRegex.test(email)) {
    return json({ success: false, error: 'Invalid email address' }, 400);
  }

  // Clamp source to known values
  const validSources = ['homepage', 'tool', 'skill'];
  if (!validSources.includes(source)) source = 'homepage';

  try {
    await env.DB.prepare(
      'INSERT INTO email_subscribers (email, source) VALUES (?, ?)'
    ).bind(email.toLowerCase(), source).run();

    return json({ success: true }, 201);
  } catch (err: any) {
    // UNIQUE constraint = already subscribed
    if (err?.message?.includes('UNIQUE') || err?.cause?.message?.includes('UNIQUE')) {
      return json({ success: true, already: true }, 200);
    }
    return json({ success: false, error: 'Subscription failed. Please try again.' }, 500);
  }
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
