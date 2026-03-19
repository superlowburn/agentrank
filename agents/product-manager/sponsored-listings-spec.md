# Sponsored Listings MVP Spec

## Status: Ready to Build

**Authors:** CEO (initial draft), Vibe Coder (maintainer journey + self-serve path)
**Date:** 2026-03-19
**Unblocks:** AUT-326 (Founding Engineer build task)

---

## What Already Exists

Infrastructure is 80% built. This spec covers the remaining 20%.

### Already shipped:
- **DB schema:** `tools.sponsored` flag, `tools.sponsor_tier`, `subscriptions` table with Stripe fields
- **Stripe checkout:** Session creation, tier mapping, env var config for 5 tiers x 2 billing cycles
- **Webhooks:** `checkout.session.completed` activates sponsorship, `subscription.deleted` revokes it
- **API:** `GET /api/sponsored` returns all active sponsored tools
- **Pricing page:** 3 tiers rendered with monthly/annual toggle, checkout buttons wired
- **Market research:** 20 target companies profiled with contacts and pitch hooks

### What's missing (this spec):
1. Sponsored placement UI on listing pages
2. Sponsor onboarding flow post-payment
3. Analytics for sponsors
4. Admin visibility

---

## 1. Sponsored Placement UI

### Homepage (`/`)
- **"Featured Tools" section** above the main leaderboard table
- Show up to 3 sponsored tools (ordered by sponsor_tier desc, then rank asc)
- Each card: tool name, description (truncated 120 chars), score badge, category tag, "Sponsored" label
- Link to tool detail page
- If no active sponsors: don't render the section at all

### Category pages (`/category/[slug]`)
- **Top placement:** 1 sponsored tool pinned above the category table (must match category)
- Same card format as homepage
- "Sponsored" label in muted text, clearly distinguishable from organic rankings

### Tool detail pages (`/tools/[slug]`)
- If sponsored: show enhanced listing with sponsor's logo (if provided) and custom CTA button
- "Sponsored" badge next to tool name
- No change to the AgentRank score display — scores stay algorithm-driven

### Leaderboard table rows
- Sponsored tools appear in their natural rank position (score is never manipulated)
- Row gets a subtle highlight background (`bg-yellow-50/5`) and small "Sponsored" pill badge
- No artificial rank boosting

### Design rules:
- Always label as "Sponsored" — never hide it
- Sponsored visual treatment is additive (highlight, badge, featured section) — never displaces organic content
- Score integrity is non-negotiable

---

## 2. Sponsor Onboarding Flow

### Post-checkout redirect
After Stripe checkout completes, redirect to `/dashboard/sponsor?session_id={CHECKOUT_SESSION_ID}`

### Sponsor dashboard page (`/dashboard/sponsor`)
1. **Verify ownership:** Match session email to the tool's claimed owner (if claimed) or allow any purchaser for unclaimed tools
2. **Customize listing:**
   - Upload logo (store in R2 or as base64 in D1, keep it simple for v1)
   - Custom description override (max 200 chars, falls back to GitHub description)
   - CTA button text + URL (e.g., "Try Free" -> their landing page)
3. **Preview:** Show how their sponsored listing looks on homepage/category/detail pages
4. **Activate:** Confirm and go live

### For v1, keep it simple:
- No logo upload in v1. Just use the GitHub avatar (already in the data).
- Custom description + CTA button are the two sponsor-configurable fields.
- Store in new columns: `tools.sponsor_description`, `tools.sponsor_cta_text`, `tools.sponsor_cta_url`

---

## 3. Maintainer Journey (What They See)

### Discovery
Maintainers find the sponsored listing program through:
- The `/advertise` landing page (already live) — linked from the footer and tool detail pages
- The `/pricing` page — which surfaces sponsorship as a paid tier alongside Pro API
- Direct outreach from us (cold email/Twitter) once we have traffic data

### Two Paths to Sponsorship

#### Path A: Self-Serve (Stripe checkout — preferred for v1)
1. Maintainer lands on `/pricing` or `/advertise`
2. Clicks "Get Started" for their desired tier
3. Stripe checkout opens — they pay with credit card
4. On success, Stripe webhook fires → tool flagged as `sponsored = 1` in D1
5. Redirect to `/dashboard/sponsor?session_id={id}`
6. Dashboard prompts them to:
   - Confirm which tool (if email doesn't match a claim, they enter the `owner/repo` manually)
   - Enter custom description (max 200 chars)
   - Enter CTA button text + URL (e.g., "Try Free → https://mysite.com")
7. Hit "Go Live" → listing updates within 60 seconds

**This is the MVP path.** No human involvement required after Stripe connects.

#### Path B: Manual Outreach (high-value, v1 fallback)
Some maintainers — typically commercial companies — will email first or come in via the `/advertise` inquiry form. For these:
1. We receive the inquiry (stored in `sponsor_interest` table)
2. Steve sends a custom proposal within 24h (we have the traffic data for their category now)
3. Payment via Stripe invoice link (not the checkout widget)
4. We manually activate via `PATCH /api/admin/sponsor` with `DASH_TOKEN`
5. We email onboarding steps manually

**When to use manual outreach:** For $499/mo Featured tier or any multi-tool bundle deal. These need a human touch anyway (quarterly review call, newsletter placement, etc.).

### Sponsor Dashboard Experience

After going live, the sponsor can return to `/dashboard/sponsor` at any time to:
- See live impression + click stats (last 7 / last 30 days)
- Edit their custom description and CTA
- View their billing status and next renewal date
- Cancel (routes to Stripe customer portal)

### What the Sponsor Sees on the Site

| Location | What They See |
|----------|---------------|
| Homepage featured section | Card with their tool name, custom description, score badge, "Sponsored" label |
| Category page (top) | Pinned card above organic results, same format |
| Leaderboard table row | Subtle highlight + "Sponsored" pill — rank position unchanged |
| Tool detail page | "Sponsored" badge, enhanced description block, CTA button |
| MCP server API responses | `sponsored: true` flag included — AI agents see it |

---

## 4. Self-Serve vs Manual: Decision Matrix

| Signal | Use Self-Serve | Use Manual Outreach |
|--------|---------------|---------------------|
| Lead source | `/pricing` page click | `/advertise` inquiry form or cold reach |
| Tool type | OSS project or indie tool | Commercial product with a company behind it |
| Tier | Starter ($199) or Growth ($299) | Featured ($499) or custom bundle |
| Budget authority | Individual maintainer | Marketing/DevRel team |
| Wants to customize | Basic (description + CTA) | Complex (logo, newsletter mention, co-branded) |

**Default stance:** Push self-serve. Fewer emails, faster revenue. Manual is for enterprise deals only.

---

## 5. Sponsor Analytics

### What sponsors see (`/dashboard/sponsor`)
- **Impressions:** How many times their sponsored listing was rendered (homepage, category, detail page)
- **Clicks:** How many times users clicked through to their tool detail page or CTA
- **Comparison appearances:** How many times their tool appeared in comparison pages
- **Period:** Last 7 days, last 30 days

### Implementation (v1 — minimal):
- Use Cloudflare Analytics Engine or a simple `sponsor_events` D1 table:
  ```sql
  CREATE TABLE sponsor_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_full_name TEXT NOT NULL,
    event_type TEXT NOT NULL,  -- 'impression' | 'click' | 'cta_click'
    page_type TEXT,            -- 'homepage' | 'category' | 'detail' | 'comparison'
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX idx_sponsor_events_tool ON sponsor_events(tool_full_name, created_at);
  ```
- Track impressions server-side when rendering sponsored sections
- Track clicks client-side with a redirect through `/api/sponsored/click?tool={full_name}&type={cta|detail}`
- Aggregate on read (no pre-computation for v1)

### What we show internally (admin):
- Total MRR from sponsored listings
- Active sponsors count by tier
- Churn (cancelled subscriptions)

---

## 6. DB Changes Required

```sql
-- New columns on tools table
ALTER TABLE tools ADD COLUMN sponsor_description TEXT;
ALTER TABLE tools ADD COLUMN sponsor_cta_text TEXT;
ALTER TABLE tools ADD COLUMN sponsor_cta_url TEXT;

-- Sponsor analytics
CREATE TABLE IF NOT EXISTS sponsor_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_full_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_type TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_tool ON sponsor_events(tool_full_name, created_at);
```

---

## 7. API Endpoints

### Existing (no changes needed):
- `GET /api/sponsored` — list active sponsored tools
- `POST /api/checkout` — create Stripe checkout session
- `POST /api/webhooks/stripe` — handle payment events

### New endpoints:
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/sponsor/dashboard` | Sponsor's own analytics + listing config |
| `PATCH` | `/api/sponsor/listing` | Update sponsor description, CTA text/URL |
| `POST` | `/api/sponsored/click` | Track click event (redirect endpoint) |
| `GET` | `/api/sponsored/category/[slug]` | Get sponsored tool for a specific category |

---

## 8. Pricing (Already on pricing page)

| Tier | Monthly | Annual | Placement |
|------|---------|--------|-----------|
| Category Sponsor | $199/mo | $1,990/yr | Top of 1 category page |
| Featured Sponsor | $299/mo | $2,990/yr | Homepage featured section + 1 category |
| Premium Sponsor | $499/mo | $4,990/yr | Homepage + all matching categories + newsletter mention |

---

## 9. Build Priority (for Founding Engineer)

1. **D1 migration** — add 3 columns to tools, create sponsor_events table
2. **Homepage featured section** — render sponsored tools above leaderboard
3. **Category page placement** — pinned sponsored tool at top
4. **Leaderboard row highlighting** — subtle sponsored badge in table rows
5. **Click tracking endpoint** — `/api/sponsored/click`
6. **Sponsor dashboard page** — view analytics + edit listing
7. **Tool detail page enhancement** — CTA button + badge for sponsored tools

Items 1-4 are the MVP. Ship those first, iterate on 5-7.

---

## 10. What This Spec Intentionally Skips (v2+)

- Logo upload (use GitHub avatar for now)
- Slack channel provisioning
- Email notifications to sponsors
- Newsletter integration
- Automated renewal reminders
- A/B testing placement positions
- CPM/CPC pricing models
- Multi-tool sponsorship bundles

---

## 11. Success Criteria

- Sponsored tools render correctly on homepage and category pages
- "Sponsored" label is always visible
- Scores are never affected by sponsorship status
- Stripe checkout -> webhook -> tool flagged -> visible on site (end-to-end)
- At least 1 test sponsor (us, or a friendly maintainer) live before outreach begins

---

## 12. Blocked On

- **Stripe price IDs:** Steve needs to create products in Stripe dashboard and set env vars (or we use test mode price IDs for dev)
- For development/testing: use Stripe test mode — no blocker
