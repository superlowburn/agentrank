# Verified Publisher Dashboard Spec
**AgentRank — Product Manager**
**Date:** March 18, 2026
**Status:** DRAFT — Requires Steve approval before implementation
**References:** Stripe Checkout (AUT-160), Onboarding Emails (AUT-164), Phase 2 Monetization Spec

---

## Overview

This spec covers the complete post-claim experience for tool maintainers on AgentRank:

1. **Post-claim success page** — what the maintainer sees immediately after GitHub OAuth verification
2. **Publisher dashboard (free tier)** — basic stats, upgrade upsell, enhance listing CTA
3. **Publisher dashboard (Pro tier)** — full analytics, score trend, notification preferences
4. **Upgrade to Verified Publisher Pro flow** — from free claimed → $29/mo subscriber
5. **Email notification preferences panel**

---

## Architecture: Two Tiers for Maintainers

There are two distinct publisher states, with a clear upsell line between them.

| State | Cost | How You Get Here | What You Get |
|-------|------|-----------------|--------------|
| **Claimed (free)** | $0 | GitHub OAuth on `/claim/[slug]` | Listing ownership, basic score + rank visibility, ability to edit tagline/category/logo |
| **Verified Publisher Pro** | $29/mo | Stripe Checkout from dashboard | Full analytics, score trend chart, referral sources, score change alerts, priority indexing, badge embed, email notification prefs |

**Key design principle:** The claim itself is free and always will be. Charging for the claim would kill the funnel. We charge for the analytics and the badge — the "why should anyone pay attention to you" signals. The free claim gets maintainers into the system. The analytics are what keep them subscribed.

---

## 1. Post-Claim Success Page

**URL:** `/claim/[slug]?verified=1` (existing param, extend the existing page)
**Trigger:** GitHub OAuth verification succeeds, `claims` table row inserted with `verified=1`
**File:** `site/src/pages/claim/[slug].astro` (already renders when `justVerified === true`)

### Current State
The page already has a `justVerified` flag. Currently shows a generic confirmation. Extend this into a proper success state.

### Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  ✓  Listing claimed                                      │
│                                                          │
│  You now own the AgentRank listing for                  │
│  your-org/your-tool                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Your listing is live                            │   │
│  │  agentrank-ai.com/tool/your-org--your-tool/      │   │
│  │  [View listing →]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  What to do now                                          │
│  ─────────────────────────────────────────────────────  │
│  ○  ① Add a logo and description   [Edit listing →]   │
│  ○  ② Go to your publisher dashboard                   │
│  ○  ③ Upgrade to Verified Publisher Pro for analytics  │
│                                                          │
│  [Go to my dashboard →]  [Upgrade for $29/mo →]        │
└─────────────────────────────────────────────────────────┘
```

### Notes
- Logo: green checkmark icon, consistent with checkout success page style
- "View listing" links to the tool detail page
- "Edit listing" links to the same page in edit mode (already exists via the form)
- "Go to my dashboard" links to `/dashboard/publisher/`
- "Upgrade for $29/mo" links to `/dashboard/publisher/?upgrade=1` which auto-opens the upgrade modal

---

## 2. Publisher Dashboard — Free Tier (Claimed, No Subscription)

**URL:** `/dashboard/publisher/`
**Auth:** `claim_session` cookie (set during GitHub OAuth claim, format: `slug:github_username`)
**Redirect if no session:** `/pricing/` with `?ref=dashboard_noauth`

### Page Layout Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│  AgentRank Publisher Dashboard                                          │
│                                                                         │
│  your-org/your-tool    [View listing]  [Edit listing]  [Switch tool ▼] │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  AgentRank   │  │  Global Rank │  │ Views (7d)   │                 │
│  │  Score       │  │              │  │              │                 │
│  │  ██  74      │  │  #312        │  │  128         │                 │
│  │  of 100      │  │  of 25,000+  │  │  last 7 days │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  ✦  Unlock publisher analytics                                   │  │
│  │                                                                   │  │
│  │  See score trend over time, referral sources, comparison events,  │  │
│  │  install attribution, and set score-change email alerts.          │  │
│  │                                                                   │  │
│  │  [██████░░░░░░░░░░░░░░]  [░░░░░░░░░░░░░░░░░░░░░░]  ← blurred   │  │
│  │     Score trend (30d)      Referral sources                       │  │
│  │                                                                   │  │
│  │  [Upgrade to Verified Publisher Pro — $29/mo →]                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Score breakdown                                                        │
│  ─────────────────────────────────────────────────────────────────────  │
│  Stars          ████████░░  0.82                                       │
│  Freshness      ██████████  1.00   Last commit: 2 days ago             │
│  Issue health   ███░░░░░░░  0.34   47 open, 27 closed ← needs work    │
│  Contributors   ████░░░░░░  0.44   3 contributors                      │
│  Dependents     ████████░░  0.80   18 dependent repos                  │
│  Downloads      ██████░░░░  0.61   npm: 4.2k/wk                       │
│                                                                         │
│  [How to improve your score →]                                         │
│                                                                         │
│  Listing status                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  ✓  Claimed by @your-github-username                                    │
│  ✗  Logo                         [Add logo →]                          │
│  ✓  Tagline                      "Fast MCP server for file I/O"        │
│  ✓  Category                     MCP Server                            │
│  ✗  Docs / npm / Discord links   [Add links →]                        │
│  ✗  Verified Publisher badge     [Upgrade to add badge →]              │
│                                                                         │
│  [Edit listing →]                                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Free Tier: What's Shown vs. Locked

| Element | Free | Pro |
|---------|------|-----|
| Current score | Yes | Yes |
| Global rank | Yes | Yes |
| Views (last 7 days, single number) | Yes | Yes |
| Score breakdown by signal | Yes | Yes |
| Score improvement guide link | Yes | Yes |
| Listing status / completeness checklist | Yes | Yes |
| Edit listing (logo, description, links) | Yes | Yes |
| Score trend chart (30 days) | Blurred teaser | Full |
| Views chart (daily, 30 days) | Locked | Full |
| Referral sources (top 5) | Locked | Full |
| Comparison events count | Locked | Full |
| Install event attribution | Locked | Full |
| Score change email alerts | Locked | Full |
| Email notification preferences | Locked | Full |
| Verified Publisher badge | Locked | Full |
| Badge embed code for README | Locked | Full |
| Priority indexing (24h vs nightly) | No | Yes |

### Blurred Analytics Teaser
Show two placeholder chart containers with CSS blur + overlay text. Do not render real data inside the blurred divs — use static gradient shapes that look like chart outlines. This avoids exposing real data via DOM inspection.

```html
<!-- Blurred chart placeholder pattern -->
<div class="locked-chart">
  <div class="chart-blur-overlay">
    <div class="chart-fake-bars">...</div>  <!-- decorative only -->
  </div>
  <div class="chart-lock-label">
    <svg><!-- lock icon --></svg>
    Score trend — Verified Publisher Pro
  </div>
</div>
```

---

## 3. Publisher Dashboard — Pro Tier (Verified Publisher, $29/mo Active)

**Same URL:** `/dashboard/publisher/`
**Auth:** `claim_session` cookie + `subscriptions` table row with `tier='verified_publisher'` and `status='active'`

### Full Dashboard Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│  AgentRank Publisher Dashboard  ✦ Verified Publisher                   │
│                                                                         │
│  your-org/your-tool    [View listing]  [Edit listing]  [Switch tool ▼] │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Score   │  │  Rank    │  │ Views    │  │Comparisons│  │ Score   │ │
│  │          │  │          │  │ (30d)    │  │  (30d)   │  │ Change  │ │
│  │  74      │  │  #312    │  │  1,847   │  │   43     │  │  +6     │ │
│  │  of 100  │  │ of 25k+  │  │          │  │          │  │ this mo │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                                         │
│  Score trend — last 30 days                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  80 ┤                                      ╭──╮                        │
│  75 ┤              ╭──╮              ╭─────╯  ╰──                     │
│  70 ┤  ─────╮  ╭───╯  ╰──────╮  ╭──╯                                 │
│  65 ┤       ╰──╯              ╰──╯                                     │
│      Mar 1                 Mar 10              Mar 18                  │
│                                                                         │
│  [Download CSV]                                                         │
│                                                                         │
│  Views — last 30 days                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  ▁▂▃▂▄▃▅▆▅▄▆▇▆▅▄▅▆▇▆▅▆▇▆▅▄▅▆▇ (sparkline chart)                     │
│                                                                         │
│  Referral sources                                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│  agentrank-ai.com (organic search)     ████████████████  62%           │
│  github.com                            ██████           24%            │
│  reddit.com                            ██               8%             │
│  Direct / unknown                      █                4%             │
│  news.ycombinator.com                  ▌                2%             │
│                                                                         │
│  Comparison events — what they compared against                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  vs. competitor-org/competitor-tool    ███████ 18 times                │
│  vs. another-org/another-tool          ████    11 times                │
│  vs. third-org/third-tool              ██       8 times                │
│                                                                         │
│  [View full comparison data →]                                         │
│                                                                         │
│  Score breakdown                          [How to improve →]           │
│  ─────────────────────────────────────────────────────────────────────  │
│  (same as free tier, with signal bars and values)                       │
│                                                                         │
│  Listing                                  Badge embed                  │
│  ─────────────────────────────────────────────────────────────────────  │
│  ✓  Claimed by @you          │  ┌─────────────────────────────────┐   │
│  ✓  Logo (png)               │  │  [![AgentRank Score](...)]       │   │
│  ✓  Tagline                  │  │  [Copy markdown] [Copy HTML]     │   │
│  ✓  Category                 │  └─────────────────────────────────┘   │
│  ✓  Docs link added          │                                         │
│  ✓  Badge in README          │                                         │
│  [Edit listing →]            │                                         │
│                                                                         │
│  Notification preferences     [Save]                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  ☑  Email me when my score changes by 10+ points                       │
│  ☑  Email me weekly summary (views, rank change, comparisons)          │
│  ☐  Email me when a new tool enters my category in the top 10          │
│  ☐  Email me when a developer leaves a public review                   │
│                                                                         │
│  Email: your@email.com  [Change]                                        │
│                                                                         │
│  Subscription                                                           │
│  ─────────────────────────────────────────────────────────────────────  │
│  Verified Publisher Pro — $29/month   Renews Apr 18, 2026              │
│  [Manage subscription (Stripe portal) →]                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Upgrade to Verified Publisher Pro — User Flow

### Entry Points

1. Dashboard upsell block (free tier) — "Upgrade to Verified Publisher Pro" CTA
2. Post-claim success page — "Upgrade for $29/mo" CTA
3. Tool detail page (claimed but not subscribed) — badge section shows "Upgrade to earn verified badge"
4. Score change email alert (sent to free claimers when score changes 15+) — "See your full trend"

### Flow Diagram

```
[Free Dashboard]
      │
      ▼
[Click "Upgrade to Verified Publisher Pro →"]
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Upgrade modal (in-page, no redirect)                    │
│                                                          │
│  Verified Publisher Pro                                  │
│  ─────────────────────────────────────────────────────  │
│  ◉ Monthly — $29/mo                                     │
│  ○ Annual — $290/yr  (2 months free)                    │
│                                                          │
│  What you get:                                           │
│  ✓ Full analytics dashboard (score trend, referrals,    │
│    comparisons, install attribution)                     │
│  ✓ Verified Publisher badge on your listing             │
│  ✓ Badge embed code for your README                     │
│  ✓ Score change email alerts                            │
│  ✓ Priority indexing (24h vs nightly)                   │
│                                                          │
│  [Continue to checkout →]        [Cancel]               │
└─────────────────────────────────────────────────────────┘
      │
      ▼ POST /api/checkout/create-session
        { tier: "verified_publisher", billing: "monthly"|"annual",
          metadata: { toolId, githubUsername, repoUrl } }
      │
      ▼
[Stripe Checkout (hosted)]
      │
  ┌───┴───┐
 paid   cancelled
  │         │
  ▼         ▼
[/checkout/success?session_id=xxx]  →  back to /dashboard/publisher/
      │
      ▼
[Webhook: checkout.session.completed]
      │ sets subscriptions row
      │ sets tools.publisher_verified=1
      │ triggers Welcome Email (Email 1 from AUT-164 sequence)
      │
      ▼
[Dashboard reloads — now shows Pro tier view]
```

### Checkout Session Metadata
The create-session call must include:
```json
{
  "tier": "verified_publisher",
  "billing": "monthly",
  "metadata": {
    "toolId": "<tool row id from DB>",
    "toolSlug": "your-org--your-tool",
    "githubUsername": "your-github-username",
    "repoUrl": "https://github.com/your-org/your-tool"
  }
}
```
This metadata is passed back on the `checkout.session.completed` webhook so the Worker can provision the subscription without requiring re-authentication.

---

## 5. Email Notification Preferences

**Location:** Publisher dashboard Pro tier, "Notification preferences" panel
**Auth required:** Active Verified Publisher Pro subscription
**Storage:** New `publisher_prefs` table in D1

### Schema

```sql
CREATE TABLE publisher_prefs (
  tool_full_name TEXT NOT NULL,
  github_username TEXT NOT NULL,
  email TEXT NOT NULL,
  notify_score_change INTEGER DEFAULT 1,  -- email on 10+ point change
  notify_weekly_summary INTEGER DEFAULT 1,
  notify_category_movers INTEGER DEFAULT 0,
  notify_new_reviews INTEGER DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (tool_full_name, github_username)
);
```

### Preferences Panel Wireframe

```
Notification preferences                              [Save preferences]
────────────────────────────────────────────────────────────────────────
☑  Score change alert — email me when my score changes by 10+ points
☑  Weekly summary — views, rank change, comparisons (every Monday)
☐  Category movers — when a new tool enters my category top 10
☐  Review notifications — when a developer leaves a public review

Notification email: your@email.com  [Change email]
────────────────────────────────────────────────────────────────────────
Saved → (toast notification, 2s)
```

### Save Endpoint

```
POST /api/publisher/prefs
Auth: claim_session cookie + active subscription check
Body: {
  notifyScoreChange: boolean,
  notifyWeeklySummary: boolean,
  notifyCategoryMovers: boolean,
  notifyNewReviews: boolean,
  email: string
}
Returns: { ok: true }
```

---

## 6. Badge Embed

**Location:** Dashboard Pro tier, "Badge embed" panel
**Trigger:** Subscription active + `tools.publisher_verified=1`

### Badge Variants

**Markdown (for README.md):**
```markdown
[![AgentRank Score](https://agentrank-ai.com/badge/your-org--your-tool.svg)](https://agentrank-ai.com/tool/your-org--your-tool/)
```

**HTML (for websites):**
```html
<a href="https://agentrank-ai.com/tool/your-org--your-tool/">
  <img src="https://agentrank-ai.com/badge/your-org--your-tool.svg" alt="AgentRank Score" />
</a>
```

### Badge SVG Design
- Background: dark (`#0a0a0a`)
- Left section: "AgentRank" label in muted text
- Right section: score number in green (`#22c55e`)
- Optional: checkmark icon to indicate Verified Publisher status
- Generated dynamically by a Worker at `/badge/[slug].svg`
- Score refreshed daily (cached via `Cache-Control: max-age=86400`)

---

## 7. Dashboard Auth Flow

Publishers authenticate via the existing `claim_session` cookie. No new auth system needed.

```
User visits /dashboard/publisher/
        │
        ▼
Parse claim_session cookie (format: "slug:github_username")
        │
   No cookie?─────────────────────────────► Redirect /pricing/?ref=dashboard_noauth
        │
        ▼
Lookup claims table: WHERE github_username = ? AND verified = 1
        │
  No claim found?─────────────────────────► Redirect /pricing/?ref=dashboard_unclaimed
        │
        ▼
Check subscriptions table: WHERE user_email LIKE ? AND tier = 'verified_publisher' AND status = 'active'
        │
   No subscription?──────────────────────► Show free tier dashboard
        │
        ▼
Show Pro tier dashboard
```

**Multi-tool support:** A maintainer may own multiple claimed repos. The dashboard defaults to showing the first claimed tool and provides a "Switch tool" dropdown to toggle between them.

---

## 8. Dashboard URL: `/dashboard/publisher/`

**New page.** Does not conflict with existing `/dash/index.astro` (which is the internal admin dashboard, token-protected).

**Routing:**
- `site/src/pages/dashboard/publisher/index.astro` — main dashboard
- `site/src/pages/dashboard/publisher/upgrade.astro` — upgrade confirmation page (optional, may use modal instead)

---

## 9. Implementation Checklist (for Founding Engineer)

**Auth + data layer**
- [ ] `GET /api/publisher/dashboard?slug=<tool-slug>` — returns stats, subscription status, prefs
- [ ] `POST /api/publisher/prefs` — save notification preferences
- [ ] `publisher_prefs` D1 table migration
- [ ] Query `subscriptions` table to gate Pro features

**Dashboard page**
- [ ] `site/src/pages/dashboard/publisher/index.astro`
- [ ] Free tier: 3-stat header, score breakdown, listing status, locked analytics teaser, upgrade CTA
- [ ] Pro tier: full stats header, score trend chart (30-day), views chart, referral sources table, comparison events table, badge embed panel, notification prefs form
- [ ] Multi-tool switcher dropdown
- [ ] Redirect logic for unauthenticated / unclaimed states

**Upgrade modal**
- [ ] In-page modal triggered by upgrade CTA
- [ ] Monthly/annual toggle
- [ ] Calls existing `POST /api/checkout/create-session` with correct metadata
- [ ] Cancel returns to dashboard

**Post-claim success page**
- [ ] Extend `/claim/[slug].astro` when `justVerified === true` with proper success UX and next-steps checklist

**Badge system**
- [ ] `GET /badge/[slug].svg` Worker endpoint
- [ ] SVG template with dynamic score injection
- [ ] Cache-Control header set appropriately
- [ ] Shield.io-style design (dark bg, green score, checkmark for verified)

**Stripe webhook extension**
- [ ] On `checkout.session.completed` with `tier=verified_publisher`: set `tools.publisher_verified=1`, insert `subscriptions` row
- [ ] On `customer.subscription.deleted`: unset `publisher_verified`, delete/expire badge
- [ ] Store `toolSlug` in checkout metadata and use it in webhook handler

**Email triggers** (using email sequence from AUT-164)
- [ ] Fire Email 1 (Welcome) after `checkout.session.completed`
- [ ] Schedule Email 2 (Day 1), Email 3 (Day 3), Email 4 (Day 7), Email 5 (Day 14) via Workers cron or Resend/Postmark scheduled sends

---

## 10. Open Questions

1. **Analytics data source:** Dashboard shows views and referral sources. These need to come from somewhere. Cloudflare Workers Analytics Engine is already in-stack — need to confirm the right events are being tracked on tool detail page visits. If not, add tracking before building the dashboard.

2. **Score trend history:** Score trend requires historical snapshots. Does the D1 schema currently store daily score values, or only the current score? If only current, add a `score_history` table and backfill what we have before the dashboard is live.

3. **Multi-tool UX:** If a maintainer has claimed 5 tools, the "Switch tool" dropdown is fine. If they've claimed 50 (unlikely but possible for org accounts), we may want a list view instead. Design for the common case (1-3 tools) but don't hardcode a limit.

4. **Comparison events:** These are "how many times was this tool opened side-by-side with another" — requires that the compare feature at `/compare` is instrumented with analytics events. Confirm this is tracked before surfacing in the dashboard.

5. **Free tier score-change notifications:** The blurred chart teaser is for the score trend. But should we send score-change emails to free claimers (as a nudge to upgrade)? Recommend: yes, send one score-change email to free claimers when their score moves 15+ points, with a CTA to upgrade for the full trend. Only once per 30 days to avoid spam.

---

*Spec authored by Product Manager agent. All public-facing UI requires Steve approval before shipping. Stripe implementation references AUT-160 (done). Email sequence references AUT-164 (done).*
