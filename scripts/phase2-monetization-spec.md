# Phase 2 Monetization Spec
**AgentRank — Product Manager**
**Date:** March 18, 2026
**Status:** DRAFT — Requires Steve approval before implementation
**Trigger:** Phase 2 gate: 5K+ monthly API requests OR 500+ skill installs

---

## Overview

Three revenue streams launch simultaneously when Phase 2 gate is hit:

1. **Verified Publisher** — $29/mo (maintainer credibility + analytics)
2. **Pro API** — $49/mo (programmatic access for developers)
3. **Sponsored Listings** — $199–499/mo (featured placement for commercial tools)

This spec covers: pricing page layout, Stripe Checkout integration requirements, Verified Publisher upgrade flow, and tier value proposition copy.

---

## 1. Pricing Page Layout

**URL:** `/pricing`
**File:** `src/pages/pricing.astro`

### Page Structure

```
[Hero]
  Headline: Get Found by Developers Building with MCP
  Subheadline: Index your tool. Prove it works. Sponsor your category.

[Tier Grid — 3 columns]
  Col 1: Verified Publisher ($29/mo)
  Col 2: Pro API ($49/mo)
  Col 3: Sponsored Listing ($199–499/mo)

[Annual Toggle]
  Monthly / Annual (save 17%)

[FAQ Accordion]
  6 questions covering common objections

[CTA Section]
  Contact for Sponsored Listing inquiry
```

### Tier Card Anatomy (each card)

```
Badge/Label (e.g. "Most Popular")
Tier Name
Price (large) + /month
Annual savings note (e.g. "or $290/yr — 2 months free")
One-line best-for statement
---
Feature list (5–7 bullets, checkmarks)
---
CTA button
```

### Visual Hierarchy

- **Verified Publisher** — leftmost, lowest price, entry door
- **Pro API** — center, "most popular" badge, developer focus
- **Sponsored Listing** — rightmost, highest price, ranges shown, "contact us" CTA

### Responsive

- Desktop: 3-column grid
- Mobile: stacked cards, Sponsored last
- Annual toggle: defaults to Annual to show savings

---

## 2. Pricing Tiers — Full Specification

### Tier 1: Verified Publisher — $29/mo

**Annual:** $290/yr (save $58)
**Who it's for:** Open-source maintainers and indie tool builders who want to claim their listing and build trust with developers evaluating their tool.

**Feature list:**
- Verified Publisher badge on your listing
- Enhanced listing: logo, custom description, links (docs, npm, Discord)
- Monthly analytics: views, installs, referral sources
- Priority indexing: new commits reflected within 24 hours (vs. nightly for free)
- One featured category tag of your choice
- Email alerts when your AgentRank score changes by 10+ points

**CTA:** Claim your listing →
**Post-CTA flow:** Stripe Checkout → email verification → GitHub repo claim → listing live within 1 hour

**Value prop copy:**
> Your tool is already indexed. Make it yours. A Verified Publisher badge signals to developers that a real maintainer is behind it — not a dead project or a fork. Monthly analytics show you exactly who's finding you and from where.

---

### Tier 2: Pro API — $49/mo

**Annual:** $490/yr (save $98)
**Who it's for:** Developers building AI assistants, IDE plugins, agent orchestration layers, or any tool that surfaces MCP server recommendations programmatically.

**Feature list:**
- API key with 10,000 calls/month (vs. public rate limits on unauthenticated endpoints)
- 60 requests/minute rate limit
- All core endpoints: `/tools`, `/tools/:id`, `/search`, `/categories`, `/skills`
- JSON responses with full score breakdowns
- 30-day historical score data
- API dashboard: usage, call logs, error rates
- Email support (best effort)

**CTA:** Get API access →
**Post-CTA flow:** Stripe Checkout → API key issued instantly → dashboard link emailed

**Value prop copy:**
> Build on ranked data, not guesswork. The AgentRank Pro API gives your AI assistant a live, scored index of every MCP server and agent tool on GitHub. Your users get better tool recommendations. You get the data to power them.

---

### Tier 3: Sponsored Listing — $199–499/mo

**Annual:** 2 months free (invoiced annually)
**Who it's for:** Commercial MCP tools competing for developer mindshare in a specific category.

**Sub-tiers:**

| Sub-tier | Price | Placement |
|----------|-------|-----------|
| Category Sponsor | $199/mo | Top of one category page |
| Featured Sponsor | $299/mo | Top of category + homepage sidebar |
| Premium Sponsor | $499/mo | Top of category + homepage banner + newsletter feature |

**Feature list (all sub-tiers):**
- Everything in Verified Publisher
- Featured placement with "Sponsored" label (transparent, prominent)
- Full analytics: views, click-throughs, comparison events (vs. what)
- Slack channel for listing updates and data questions

**Additional by sub-tier:**
- Featured ($299+): Homepage sidebar placement, category exclusivity option
- Premium ($499): Homepage banner, newsletter feature (once/quarter), co-marketing social posts, multi-category placement (up to 3)

**CTA:** Contact us → [Tally form or email]
**Post-CTA flow:** Manual qualification call (or async Tally) → invoice sent → listing live within 1 business day

**Value prop copy:**
> Developers use AgentRank to decide what they build with. Sponsored placement puts your tool at the top of the category they're searching. We show real traffic data before you commit — if the numbers don't justify the spend, we'll tell you.

---

## 3. Stripe Checkout Integration Requirements

**Scope:** Design only. Do NOT implement until Phase 2 gate is hit.

### Products to Create in Stripe

| Product | Price | Billing |
|---------|-------|---------|
| Verified Publisher Monthly | $29/mo | `recurring`, `monthly` |
| Verified Publisher Annual | $290/yr | `recurring`, `yearly` |
| Pro API Monthly | $49/mo | `recurring`, `monthly` |
| Pro API Annual | $490/yr | `recurring`, `yearly` |
| Category Sponsor Monthly | $199/mo | `recurring`, `monthly` |
| Category Sponsor Annual | $1,990/yr | `recurring`, `yearly` |
| Featured Sponsor Monthly | $299/mo | `recurring`, `monthly` |
| Featured Sponsor Annual | $2,990/yr | `recurring`, `yearly` |
| Premium Sponsor Monthly | $499/mo | `recurring`, `monthly` |
| Premium Sponsor Annual | $4,990/yr | `recurring`, `yearly` |

### Required Endpoints (Cloudflare Workers)

```
POST /api/checkout/create-session
  Body: { tier: "verified_publisher" | "pro_api", billing: "monthly" | "annual" }
  Auth: none (pre-auth, user completes checkout with Stripe)
  Returns: { checkoutUrl: string }

GET /api/checkout/success
  Query: ?session_id=<stripe_session_id>
  Auth: none
  Action: provision user (create API key or set publisher_verified=true)
  Redirects to: /dashboard or /listing/:id

POST /api/webhooks/stripe
  Auth: Stripe-Signature header verification (webhook secret)
  Events to handle:
    - checkout.session.completed → provision subscription
    - customer.subscription.deleted → deprovision access
    - invoice.payment_failed → send grace period email, lock after 3 days
    - invoice.payment_succeeded → renew access, reset API limits
```

### Database Changes Required (D1)

```sql
-- New table: subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'verified_publisher' | 'pro_api' | 'sponsor_category' | 'sponsor_featured' | 'sponsor_premium'
  status TEXT NOT NULL, -- 'active' | 'past_due' | 'cancelled'
  billing TEXT NOT NULL, -- 'monthly' | 'annual'
  current_period_end INTEGER NOT NULL, -- unix timestamp
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- New table: api_keys
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- store hash, not plaintext
  tier TEXT NOT NULL,
  calls_this_month INTEGER DEFAULT 0,
  calls_limit INTEGER NOT NULL, -- 10000 for Pro API
  last_reset_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  revoked_at INTEGER
);

-- Modify: tools table
ALTER TABLE tools ADD COLUMN publisher_verified INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN sponsor_tier TEXT; -- null | 'category' | 'featured' | 'premium'
ALTER TABLE tools ADD COLUMN sponsor_category TEXT; -- category slug for sponsored placement
ALTER TABLE tools ADD COLUMN sponsor_expires_at INTEGER; -- unix timestamp
```

### API Key Provisioning Flow

1. `checkout.session.completed` fires
2. Worker creates row in `subscriptions` table
3. For Pro API: generate random 32-byte key, hash it (SHA-256), store hash in `api_keys`, email plaintext key to customer
4. For Verified Publisher: look up tool repo URL from session metadata, set `publisher_verified=1` on matching tool row
5. Send confirmation email with: key (for API), dashboard link, cancellation instructions

### Rate Limiting Implementation

Use Cloudflare Workers + D1:
- On each API request: check `api_keys` table for hash of provided key
- Increment `calls_this_month`; if over limit, return `429`
- Monthly reset: cron job first of each month sets `calls_this_month=0` for all active keys

---

## 4. Verified Publisher Upgrade Flow

### Entry Points

1. **Organic:** Maintainer finds their tool on AgentRank, sees "Claim this listing" CTA on the detail page
2. **Outreach-driven:** We tag maintainer on Twitter or email them (automated or manual per Phase 1 strategy)
3. **Pricing page:** Maintainer discovers pricing page via SEO or referral

### Step-by-Step Flow

**Step 1 — Claim initiation**
- User clicks "Claim your listing" on a tool detail page or pricing page
- Modal opens: "Is this your tool?" with GitHub repo URL pre-filled
- CTA: "Verify ownership" → redirects to GitHub OAuth

**Step 2 — GitHub OAuth verification**
- OAuth scope: `read:user` + `repo` (to verify ownership)
- Check: authenticated GitHub user must be a contributor (or in the org) of the claimed repo
- On success: session created, user proceeds to enhancement

**Step 3 — Listing enhancement**
- Form pre-filled with existing data (name, description from GitHub)
- Editable fields: logo URL, custom description (500 char max), website URL, docs URL, Discord/Slack URL
- Preview: live card preview on the right
- CTA: "Save + Subscribe" → Stripe Checkout for $29/mo

**Step 4 — Stripe Checkout**
- Plan: Verified Publisher Monthly or Annual (toggle shown)
- Customer email: pre-filled from GitHub email
- Metadata stored with session: `{ toolId, githubUserId, repoUrl }`
- On success: webhook handler sets `publisher_verified=1`, stores enhanced listing fields

**Step 5 — Post-subscribe confirmation**
- Redirect to `/listing/{tool-id}?verified=1`
- Page shows: badge live, analytics dashboard link, "Share your badge" prompt
- Email: confirmation with badge embed code (for README), dashboard link

### Analytics Dashboard (Verified Publisher)

**URL:** `/dashboard/publisher`
**Auth:** GitHub OAuth session check

**Metrics shown:**
- Views this month (chart: last 30 days)
- Referral sources (top 5 domains)
- Score trend (chart: AgentRank score over last 30 days)
- Install events (where trackable via referral)
- Comparison events (how many times tool was compared vs. others)

**Data source:** Cloudflare Workers Analytics Engine (already in stack)

---

## 5. Tier Value Proposition Copy (Final)

### Verified Publisher

**Headline:** Your tool, claimed and credible.

**Body:**
Developers trust verified listings. A Verified Publisher badge on your AgentRank listing signals active maintenance, a real maintainer, and a tool worth betting on. Plus monthly analytics so you can see exactly who's finding you — and from where.

**Single-line pitch:** Claim your listing, earn the badge, track your reach.

---

### Pro API

**Headline:** Build on ranked data, not guesswork.

**Body:**
The AgentRank Pro API gives your AI assistant, IDE plugin, or developer dashboard a live ranked index of every MCP server and agent tool on GitHub. Updated daily. Scored on five real signals. JSON responses. 10,000 calls/month.

**Single-line pitch:** Programmatic access to the only ranked MCP tool index.

---

### Sponsored Listing

**Headline:** Be the first tool developers see.

**Body:**
AgentRank is where developers go to evaluate MCP servers. A sponsored listing puts your tool at the top of your category — labeled honestly, placed prominently. We show you real traffic data before you commit. If the numbers don't justify the spend, we'll tell you.

**Single-line pitch:** Guaranteed placement in the category your customers search.

---

## 6. Implementation Checklist (for Founding Engineer at Phase 2 Gate)

- [ ] Create Stripe products and price IDs (all 10 listed above)
- [ ] Store Stripe price IDs in Cloudflare secrets (not hardcoded)
- [ ] Implement `POST /api/checkout/create-session` Worker endpoint
- [ ] Implement `GET /api/checkout/success` redirect handler
- [ ] Implement `POST /api/webhooks/stripe` with event handlers
- [ ] Run D1 migrations: `subscriptions`, `api_keys`, alter `tools` table
- [ ] Implement API key generation + hashing on checkout completion
- [ ] Implement rate limiting middleware on all `/api/v1/*` endpoints
- [ ] Implement monthly API limit reset cron
- [ ] Build GitHub OAuth flow for Verified Publisher claim
- [ ] Build listing enhancement form with live preview
- [ ] Build Publisher analytics dashboard (`/dashboard/publisher`)
- [ ] Build `/pricing` page from this spec
- [ ] Add "Claim this listing" CTA to tool detail pages
- [ ] Test end-to-end: checkout → provision → API call → rate limit → cancellation → deprovision
- [ ] Smoke test webhook event handling (use Stripe CLI `stripe listen`)

---

## 7. Open Questions (Resolve Before Implementation)

1. **Category exclusivity for Sponsored Listings:** Can we technically enforce one sponsor per category? Need to confirm D1 can handle this constraint and that we have clean category taxonomy before selling it.

2. **GitHub OAuth for publisher claim:** Do we want to use GitHub OAuth or just verify via a file-in-repo method (maintainer adds a `.agentrank.json` to their repo)? File method is lower friction, no OAuth implementation needed. Downside: can be faked by anyone with write access.

3. **Email infrastructure for confirmation/alerts:** Do we have a transactional email provider? Resend or Postmark recommended. Free tier sufficient for Phase 2 volume.

4. **Stripe test mode:** Keep in test mode until Phase 2 gate is confirmed hit. Don't expose live checkout to users until we're ready to support subscriptions.

5. **Sponsor contact flow:** Sponsored listings start with "contact us" (not self-serve Stripe) since we want to qualify sponsors before onboarding. At what point (revenue or time) do we add self-serve for Sponsored?

---

*Spec authored by Product Manager agent. All Stripe implementation deferred until Phase 2 gate (5K monthly API requests or 500 skill installs). All public-facing changes require Steve approval.*
