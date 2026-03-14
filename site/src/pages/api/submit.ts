import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  let data: Record<string, string>;
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await request.json();
  } else {
    const fd = await request.formData();
    data = Object.fromEntries(fd.entries()) as Record<string, string>;
  }

  // Validate email
  if (!data.contact_email?.trim()) {
    return json({ success: false, error: 'Email is required' }, 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.contact_email.trim())) {
    return json({ success: false, error: 'Invalid email address' }, 400);
  }

  // Need at least one identifier
  if (!data.github_url?.trim() && !data.registry_url?.trim() && !data.name?.trim()) {
    return json({ success: false, error: 'Provide a GitHub URL, registry URL, or project name' }, 400);
  }

  // Parse github_repo from URL
  const ghMatch = data.github_url?.match(/github\.com\/([^/]+\/[^/]+)/);
  const github_repo = ghMatch ? ghMatch[1].replace(/\.git$/, '') : null;

  // Determine type
  const type = data.existing_slug ? 'claim' : 'new';

  // Check for duplicates
  if (github_repo) {
    const dup = await env.DB.prepare(
      'SELECT id FROM submissions WHERE github_repo = ? AND status != ?'
    ).bind(github_repo, 'rejected').first();
    if (dup) {
      return json({ success: false, error: 'This project has already been submitted' }, 409);
    }
  }

  try {
    await env.DB.prepare(`
      INSERT INTO submissions (type, github_url, github_repo, registry_url, name, description,
        contact_email, owner_name, owner_url, existing_slug, existing_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      type,
      data.github_url?.trim() || null,
      github_repo,
      data.registry_url?.trim() || null,
      data.name?.trim() || null,
      data.description?.trim() || null,
      data.contact_email.trim(),
      data.owner_name?.trim() || null,
      data.owner_url?.trim() || null,
      data.existing_slug?.trim() || null,
      data.existing_type?.trim() || null,
    ).run();

    return json({ success: true, type }, 201);
  } catch (err: any) {
    return json({ success: false, error: 'Submission failed. Please try again.' }, 500);
  }
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
