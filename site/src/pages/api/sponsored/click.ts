import type { APIRoute } from 'astro';

export const prerender = false;

// Tracks a sponsor click event and redirects to tool page (or CTA URL)
// GET /api/sponsored/click?tool=owner/repo&type=detail|cta
export const GET: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  const url = new URL(request.url);
  const toolFullName = url.searchParams.get('tool');
  const type = url.searchParams.get('type') ?? 'detail';
  const page = url.searchParams.get('page') ?? 'unknown';

  if (!toolFullName) {
    return new Response('Missing tool parameter', { status: 400 });
  }

  // Log event (fire-and-forget)
  const eventType = type === 'cta' ? 'cta_click' : 'click';
  try {
    env.DB.prepare(
      'INSERT INTO sponsor_events (tool_full_name, event_type, page_type) VALUES (?, ?, ?)'
    ).bind(toolFullName, eventType, page).run();
  } catch {
    // Non-fatal
  }

  // Determine redirect target
  let redirectUrl: string | null = null;

  if (type === 'cta') {
    try {
      const row = await env.DB.prepare(
        'SELECT sponsor_cta_url FROM tools WHERE full_name = ? AND sponsored = 1'
      ).bind(toolFullName).first() as { sponsor_cta_url: string | null } | null;
      redirectUrl = row?.sponsor_cta_url ?? null;
    } catch {
      // fall through
    }
  }

  if (!redirectUrl) {
    // Default: tool detail page
    const slug = toolFullName.replace('/', '--');
    redirectUrl = `/tool/${slug}/`;
  }

  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
};
