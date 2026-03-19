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

        const toolFullName = obj.metadata?.tool_full_name ?? null;
        const isSponsored = typeof tier === 'string' && tier.startsWith('sponsored_');
        // sponsor_tier is the short label: basic | pro | enterprise
        const sponsorTier = isSponsored ? tier.replace('sponsored_', '') : null;

        if (email && customerId && subscriptionId) {
          const id = uuid();
          // current_period_end: approximate — webhook should update via invoice events
          const periodEnd = billing === 'annual' ? now + 365 * 86400 : now + 30 * 86400;

          await env.DB.prepare(`
            INSERT INTO subscriptions (id, user_email, stripe_customer_id, stripe_subscription_id, tier, status, billing, current_period_end, created_at, updated_at, tool_full_name)
            VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
            ON CONFLICT(stripe_subscription_id) DO UPDATE SET status='active', updated_at=excluded.updated_at
          `).bind(id, email, customerId, subscriptionId, tier, billing, periodEnd, now, now, toolFullName ?? null).run();

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

          // For sponsored tiers: flag the tool in the tools table
          if (isSponsored && toolFullName) {
            await env.DB.prepare(`
              UPDATE tools SET sponsored=1, sponsor_tier=? WHERE full_name=?
            `).bind(sponsorTier, toolFullName).run();
            console.log(`[stripe] Sponsored listing activated for ${toolFullName} (tier: ${sponsorTier})`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = obj.id;
        const now = nowUnix();

        // Before cancelling, capture the tier and tool so we can clear sponsored flag
        const subRow = await env.DB.prepare(`
          SELECT tier, user_email, tool_full_name FROM subscriptions WHERE stripe_subscription_id=?
        `).bind(subscriptionId).first() as { tier: string; user_email: string; tool_full_name: string | null } | null;

        await env.DB.prepare(`
          UPDATE subscriptions SET status='cancelled', updated_at=? WHERE stripe_subscription_id=?
        `).bind(now, subscriptionId).run();

        // Revoke associated API keys
        await env.DB.prepare(`
          UPDATE api_keys SET is_active=0, revoked_at=datetime('now')
          WHERE owner_email=(SELECT user_email FROM subscriptions WHERE stripe_subscription_id=?)
          AND tier='pro' AND revoked_at IS NULL
        `).bind(subscriptionId).run();

        // Clear sponsored flag if this was a sponsored subscription
        if (subRow && typeof subRow.tier === 'string' && subRow.tier.startsWith('sponsored_') && subRow.tool_full_name) {
          // Only clear if no OTHER active sponsored subscription covers this tool
          const otherActive = await env.DB.prepare(`
            SELECT COUNT(*) as cnt FROM subscriptions
            WHERE tool_full_name=? AND tier LIKE 'sponsored_%' AND status='active'
              AND stripe_subscription_id != ?
          `).bind(subRow.tool_full_name, subscriptionId).first() as { cnt: number } | null;

          if (!otherActive || otherActive.cnt === 0) {
            await env.DB.prepare(`
              UPDATE tools SET sponsored=0, sponsor_tier=NULL WHERE full_name=?
            `).bind(subRow.tool_full_name).run();
            console.log(`[stripe] Sponsored listing cleared for ${subRow.tool_full_name}`);
          }
        }
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
