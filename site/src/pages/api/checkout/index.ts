import type { APIRoute } from 'astro';

export const prerender = false;

const TIER_PRICE_ENV_KEYS: Record<string, Record<string, string>> = {
  verified_publisher: {
    monthly: 'STRIPE_PRICE_VP_MONTHLY',
    annual: 'STRIPE_PRICE_VP_ANNUAL',
  },
  pro_api: {
    monthly: 'STRIPE_PRICE_PRO_MONTHLY',
    annual: 'STRIPE_PRICE_PRO_ANNUAL',
  },
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;

  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return json({ error: 'Payment processing not configured' }, 503);
  }

  let tier: string;
  let billing: string;

  try {
    const body = await request.json() as { tier?: string; billing?: string };
    tier = body.tier ?? '';
    billing = body.billing ?? '';
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  if (!TIER_PRICE_ENV_KEYS[tier]) {
    return json({ error: 'Invalid tier' }, 400);
  }
  if (!['monthly', 'annual'].includes(billing)) {
    return json({ error: 'Invalid billing period' }, 400);
  }

  const priceEnvKey = TIER_PRICE_ENV_KEYS[tier][billing];
  const priceId = env[priceEnvKey];
  if (!priceId) {
    return json({ error: 'Price not configured for this tier' }, 503);
  }

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/pricing/`;

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'metadata[tier]': tier,
    'metadata[billing]': billing,
  });

  let resp: Response;
  try {
    resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  } catch {
    return json({ error: 'Failed to reach payment provider' }, 502);
  }

  if (!resp.ok) {
    const err = await resp.json() as { error?: { message?: string } };
    console.error('Stripe error:', err);
    return json({ error: 'Failed to create checkout session' }, 502);
  }

  const session = await resp.json() as { url: string };
  return json({ url: session.url });
};
