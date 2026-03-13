import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  let data: Record<string, string>;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await request.json();
  } else {
    const formData = await request.formData();
    data = Object.fromEntries(formData.entries()) as Record<string, string>;
  }

  // Validate required fields
  const required = ['name', 'description', 'owner_name', 'owner_url', 'contact_email'];
  for (const field of required) {
    if (!data[field]?.trim()) {
      return new Response(JSON.stringify({ success: false, error: `Missing required field: ${field}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Generate slug
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Parse capabilities
  const capabilities = data.capabilities
    ? JSON.stringify(data.capabilities.split(',').map((c: string) => c.trim()).filter(Boolean))
    : '[]';

  try {
    await env.DB.prepare(`
      INSERT INTO agents (name, slug, description, owner_name, owner_url, capabilities, endpoint_url, contact_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name.trim(),
      slug,
      data.description.trim(),
      data.owner_name.trim(),
      data.owner_url.trim(),
      capabilities,
      data.endpoint_url?.trim() || null,
      data.contact_email.trim()
    ).run();

    return new Response(JSON.stringify({ success: true, slug, status: 'pending' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return new Response(JSON.stringify({ success: false, error: 'An agent with this name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: false, error: 'Registration failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
