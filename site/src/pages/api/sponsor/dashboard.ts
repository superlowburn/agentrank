import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/sponsor/dashboard?session_id=<stripe_session_id>
// Returns sponsor's tool info + analytics for last 7 and 30 days
export const GET: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return json({ error: 'session_id required' }, 400);
  }

  // Look up subscription by session (stored in subscriptions table after webhook)
  let toolFullName: string | null = null;
  let userEmail: string | null = null;
  let tier: string | null = null;
  let periodEnd: number | null = null;

  try {
    const sub = await env.DB.prepare(
      `SELECT tool_full_name, user_email, tier, current_period_end
       FROM subscriptions
       WHERE stripe_customer_id IN (
         SELECT stripe_customer_id FROM subscriptions
         WHERE status = 'active' AND tool_full_name IS NOT NULL
         LIMIT 1
       ) AND status = 'active' AND tool_full_name IS NOT NULL
       LIMIT 1`
    ).first() as { tool_full_name: string; user_email: string; tier: string; current_period_end: number } | null;

    if (!sub) {
      // Fall back to Stripe lookup if we have the key
      const stripeKey = env.STRIPE_SECRET_KEY;
      if (!stripeKey) return json({ error: 'Subscription not found' }, 404);

      const resp = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=customer_details`,
        { headers: { Authorization: `Bearer ${stripeKey}` } }
      );
      if (!resp.ok) return json({ error: 'Session not found' }, 404);

      const session = await resp.json() as {
        metadata?: { tool_full_name?: string; tier?: string };
        customer_details?: { email?: string };
        customer_email?: string;
      };

      toolFullName = session.metadata?.tool_full_name ?? null;
      userEmail = session.customer_details?.email ?? session.customer_email ?? null;
      tier = session.metadata?.tier ?? null;
    } else {
      toolFullName = sub.tool_full_name;
      userEmail = sub.user_email;
      tier = sub.tier;
      periodEnd = sub.current_period_end;
    }
  } catch {
    return json({ error: 'Failed to look up subscription' }, 500);
  }

  if (!toolFullName) {
    return json({ error: 'No sponsored tool found for this session' }, 404);
  }

  // Get tool info
  let tool: Record<string, unknown> | null = null;
  try {
    tool = await env.DB.prepare(
      `SELECT full_name, description, score, category, rank,
              sponsor_description, sponsor_cta_text, sponsor_cta_url
       FROM tools WHERE full_name = ? AND sponsored = 1`
    ).bind(toolFullName).first() as Record<string, unknown> | null;
  } catch {
    // Non-fatal
  }

  // Get analytics: last 7 days and last 30 days
  const nowSec = Math.floor(Date.now() / 1000);
  const day7 = nowSec - 7 * 86400;
  const day30 = nowSec - 30 * 86400;

  let stats7: { impressions: number; clicks: number; cta_clicks: number } = { impressions: 0, clicks: 0, cta_clicks: 0 };
  let stats30: { impressions: number; clicks: number; cta_clicks: number } = { impressions: 0, clicks: 0, cta_clicks: 0 };

  try {
    const rows7 = await env.DB.prepare(
      `SELECT event_type, COUNT(*) as cnt FROM sponsor_events
       WHERE tool_full_name = ? AND created_at >= ? GROUP BY event_type`
    ).bind(toolFullName, day7).all() as { results: Array<{ event_type: string; cnt: number }> };

    const rows30 = await env.DB.prepare(
      `SELECT event_type, COUNT(*) as cnt FROM sponsor_events
       WHERE tool_full_name = ? AND created_at >= ? GROUP BY event_type`
    ).bind(toolFullName, day30).all() as { results: Array<{ event_type: string; cnt: number }> };

    for (const r of rows7.results ?? []) {
      if (r.event_type === 'impression') stats7.impressions = r.cnt;
      else if (r.event_type === 'click') stats7.clicks = r.cnt;
      else if (r.event_type === 'cta_click') stats7.cta_clicks = r.cnt;
    }
    for (const r of rows30.results ?? []) {
      if (r.event_type === 'impression') stats30.impressions = r.cnt;
      else if (r.event_type === 'click') stats30.clicks = r.cnt;
      else if (r.event_type === 'cta_click') stats30.cta_clicks = r.cnt;
    }
  } catch {
    // Non-fatal — return zeros
  }

  return json({
    tool,
    email: userEmail,
    tier,
    period_end: periodEnd,
    stats: { last_7_days: stats7, last_30_days: stats30 },
  });
};
