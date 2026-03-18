import type { APIRoute } from 'astro';

export const prerender = false;

// Verify Stripe webhook signature using Web Crypto
async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const signed = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return expected === signature;
  } catch {
    return false;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function uuid(): string {
  return crypto.randomUUID();
}

async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  const payload = await request.text();
  const sigHeader = request.headers.get('stripe-signature') ?? '';

  if (webhookSecret) {
    const valid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
    if (!valid) {
      return json({ error: 'Invalid signature' }, 400);
    }
  }

  let event: { type: string; data: { object: Record<string, any> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const obj = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const email = obj.customer_email ?? obj.customer_details?.email ?? null;
        const customerId = obj.customer ?? null;
        const subscriptionId = obj.subscription ?? null;
        const tier = obj.metadata?.tier ?? 'unknown';
        const billing = obj.metadata?.billing ?? 'monthly';
        const now = nowUnix();

        if (email && customerId && subscriptionId) {
          const id = uuid();
          // current_period_end: approximate — webhook should update via invoice events
          const periodEnd = billing === 'annual' ? now + 365 * 86400 : now + 30 * 86400;

          await env.DB.prepare(`
            INSERT INTO subscriptions (id, user_email, stripe_customer_id, stripe_subscription_id, tier, status, billing, current_period_end, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
            ON CONFLICT(stripe_subscription_id) DO UPDATE SET status='active', updated_at=excluded.updated_at
          `).bind(id, email, customerId, subscriptionId, tier, billing, periodEnd, now, now).run();

          // For pro_api: generate and store an API key
          if (tier === 'pro_api') {
            const rawKey = `ark_pro_${crypto.randomUUID().replace(/-/g, '')}`;
            const keyHash = await sha256Hex(rawKey);
            const keyPrefix = rawKey.slice(0, 16);
            const keyId = uuid();

            await env.DB.prepare(`
              INSERT INTO api_keys (id, key_hash, key_prefix, name, tier, owner_email, is_active, created_at)
              VALUES (?, ?, ?, 'Pro API', 'pro', ?, 1, datetime('now'))
            `).bind(keyId, keyHash, keyPrefix, email).run();

            // TODO: send email with rawKey to customer (requires email provider)
            console.log(`[stripe] Pro API key provisioned for ${email}: ${keyPrefix}...`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = obj.id;
        const now = nowUnix();
        await env.DB.prepare(`
          UPDATE subscriptions SET status='cancelled', updated_at=? WHERE stripe_subscription_id=?
        `).bind(now, subscriptionId).run();

        // Revoke associated API keys
        await env.DB.prepare(`
          UPDATE api_keys SET is_active=0, revoked_at=datetime('now')
          WHERE owner_email=(SELECT user_email FROM subscriptions WHERE stripe_subscription_id=?)
          AND tier='pro' AND revoked_at IS NULL
        `).bind(subscriptionId).run();
        break;
      }

      case 'invoice.payment_failed': {
        const subscriptionId = obj.subscription;
        const now = nowUnix();
        if (subscriptionId) {
          await env.DB.prepare(`
            UPDATE subscriptions SET status='past_due', updated_at=? WHERE stripe_subscription_id=?
          `).bind(now, subscriptionId).run();
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const subscriptionId = obj.subscription;
        const periodEnd = obj.lines?.data?.[0]?.period?.end ?? null;
        const now = nowUnix();
        if (subscriptionId) {
          await env.DB.prepare(`
            UPDATE subscriptions SET status='active', current_period_end=?, updated_at=? WHERE stripe_subscription_id=?
          `).bind(periodEnd ?? now + 30 * 86400, now, subscriptionId).run();
        }
        break;
      }

      default:
        // Unhandled event — acknowledge and move on
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] DB error:', err);
    return json({ error: 'Internal error' }, 500);
  }

  return json({ received: true });
};
