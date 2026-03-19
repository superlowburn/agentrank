import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// PATCH /api/sponsor/listing
// Body: { session_id, sponsor_description?, sponsor_cta_text?, sponsor_cta_url? }
// Updates sponsor-configurable fields on their tool
export const PATCH: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  let body: {
    session_id?: string;
    sponsor_description?: string;
    sponsor_cta_text?: string;
    sponsor_cta_url?: string;
  };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { session_id: sessionId, sponsor_description, sponsor_cta_text, sponsor_cta_url } = body;

  if (!sessionId) {
    return json({ error: 'session_id required' }, 400);
  }

  // Validate inputs
  if (sponsor_description !== undefined && sponsor_description.length > 200) {
    return json({ error: 'sponsor_description max 200 chars' }, 400);
  }
  if (sponsor_cta_text !== undefined && sponsor_cta_text.length > 50) {
    return json({ error: 'sponsor_cta_text max 50 chars' }, 400);
  }
  if (sponsor_cta_url !== undefined) {
    try {
      const u = new URL(sponsor_cta_url);
      if (!['https:', 'http:'].includes(u.protocol)) throw new Error('bad protocol');
    } catch {
      return json({ error: 'sponsor_cta_url must be a valid https URL' }, 400);
    }
  }

  // Verify ownership via Stripe session → subscriptions table
  let toolFullName: string | null = null;

  try {
    // Check subscriptions table first
    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) return json({ error: 'Payment processing not configured' }, 503);

    const resp = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=customer_details`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    if (!resp.ok) return json({ error: 'Invalid session' }, 403);

    const session = await resp.json() as {
      metadata?: { tool_full_name?: string };
      payment_status?: string;
    };

    if (session.payment_status !== 'paid') {
      return json({ error: 'Payment not completed' }, 403);
    }

    toolFullName = session.metadata?.tool_full_name ?? null;
  } catch {
    return json({ error: 'Failed to verify session' }, 500);
  }

  if (!toolFullName) {
    return json({ error: 'No tool associated with this session' }, 404);
  }

  // Build update
  const updates: string[] = [];
  const bindings: (string | null)[] = [];

  if (sponsor_description !== undefined) {
    updates.push('sponsor_description = ?');
    bindings.push(sponsor_description || null);
  }
  if (sponsor_cta_text !== undefined) {
    updates.push('sponsor_cta_text = ?');
    bindings.push(sponsor_cta_text || null);
  }
  if (sponsor_cta_url !== undefined) {
    updates.push('sponsor_cta_url = ?');
    bindings.push(sponsor_cta_url || null);
  }

  if (updates.length === 0) {
    return json({ error: 'No fields to update' }, 400);
  }

  bindings.push(toolFullName);

  try {
    await env.DB.prepare(
      `UPDATE tools SET ${updates.join(', ')} WHERE full_name = ? AND sponsored = 1`
    ).bind(...bindings).run();
  } catch (err) {
    console.error('[sponsor/listing] DB error:', err);
    return json({ error: 'Failed to update listing' }, 500);
  }

  return json({ ok: true });
};
