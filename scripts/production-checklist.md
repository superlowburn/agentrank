# AgentRank Production Setup Checklist

## What's blocked and why

Three features are built but not live because env vars aren't set in Cloudflare Pages production:

| Feature | Blocked by |
|---------|-----------|
| Claim flow (GitHub OAuth) | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Stripe Checkout (Verified Publisher / Pro API) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, 4× price IDs |
| Subscriptions table | D1 migration needs to run once |

---

## Step 1 — Create GitHub OAuth App (5 min)

> Skip if you already have one. The callback URL must be exact.

1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Fill in:
   - Application name: `AgentRank`
   - Homepage URL: `https://agentrank-ai.com`
   - Authorization callback URL: `https://agentrank-ai.com/api/auth/github/callback`
3. Click **Register application**
4. Copy **Client ID** → this is `GITHUB_CLIENT_ID`
5. Click **Generate a new client secret** → copy it → this is `GITHUB_CLIENT_SECRET`

---

## Step 2 — Get Stripe Keys (2 min)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (`sk_live_...`) → this is `STRIPE_SECRET_KEY`
3. Go to https://dashboard.stripe.com/webhooks
4. Click your AgentRank webhook endpoint → copy **Signing secret** (`whsec_...`) → this is `STRIPE_WEBHOOK_SECRET`
   - If no webhook exists yet: **Add endpoint** → URL: `https://agentrank-ai.com/api/webhooks/stripe` → Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Step 3 — Get Stripe Price IDs (2 min)

1. Go to https://dashboard.stripe.com/products
2. Find your Verified Publisher product → click into each price → copy the Price ID (`price_...`)
   - Monthly price → `STRIPE_PRICE_VP_MONTHLY`
   - Annual price → `STRIPE_PRICE_VP_ANNUAL`
3. Find your Pro API product → same:
   - Monthly → `STRIPE_PRICE_PRO_MONTHLY`
   - Annual → `STRIPE_PRICE_PRO_ANNUAL`

---

## Step 4 — Set env vars in Cloudflare Pages (3 min)

Run from the `site/` directory (where `wrangler.toml` lives):

```bash
cd site

# GitHub OAuth
npx wrangler pages secret put GITHUB_CLIENT_ID --project-name agentrank-site
npx wrangler pages secret put GITHUB_CLIENT_SECRET --project-name agentrank-site

# Stripe
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name agentrank-site
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name agentrank-site
npx wrangler pages secret put STRIPE_PRICE_VP_MONTHLY --project-name agentrank-site
npx wrangler pages secret put STRIPE_PRICE_VP_ANNUAL --project-name agentrank-site
npx wrangler pages secret put STRIPE_PRICE_PRO_MONTHLY --project-name agentrank-site
npx wrangler pages secret put STRIPE_PRICE_PRO_ANNUAL --project-name agentrank-site
```

Each command will prompt you to paste the value. Values are encrypted at rest.

---

## Step 5 — Run D1 migrations (1 min)

The subscriptions table and other new tables need to be created once:

```bash
cd site
npx wrangler d1 execute agentrank-db --remote --command "
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  billing TEXT NOT NULL DEFAULT 'monthly',
  current_period_end INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
"
```

Or run the full schema file (safe — uses `IF NOT EXISTS` for everything except `tools`/`skills` which get rebuilt by the pipeline anyway):

```bash
cd site
npx wrangler d1 execute agentrank-db --remote --file="../scripts/d1-schema.sql"
```

---

## Step 6 — Verify (run the script)

```bash
cd AgentRank
bash scripts/setup-production.sh --verify-only
```

This checks that all env vars are set and all expected D1 tables exist.

---

## Env var summary

| Var | Source | Required for |
|-----|--------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App | Claim flow |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App | Claim flow |
| `STRIPE_SECRET_KEY` | Stripe dashboard → API keys | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks | Webhook validation |
| `STRIPE_PRICE_VP_MONTHLY` | Stripe dashboard → Products | VP monthly checkout |
| `STRIPE_PRICE_VP_ANNUAL` | Stripe dashboard → Products | VP annual checkout |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe dashboard → Products | Pro API monthly checkout |
| `STRIPE_PRICE_PRO_ANNUAL` | Stripe dashboard → Products | Pro API annual checkout |

All vars are set as **Cloudflare Pages secrets** (encrypted, not visible after entry).
