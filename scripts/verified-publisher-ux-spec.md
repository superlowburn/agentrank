# Verified Publisher UX Spec
**AgentRank — Product Manager**
**Date:** March 18, 2026
**Status:** DRAFT — Requires Steve approval before implementation
**Issue:** AUT-192

---

## Overview

This is the complete end-to-end UX spec for the Verified Publisher flow: from the moment a maintainer clicks "Claim this tool" through GitHub OAuth, listing enrichment, the post-claim welcome state, and their first dashboard visit.

The claim itself is free. The claim flow should be as fast and frictionless as possible.

---

## 1. Flow Diagram

```
Tool listing page
  └─ [Claim this tool] CTA
        │
        ▼
/claim/[slug] — Unauthenticated state
  - Shows: tool name, description
  - Copy: "Claim your listing..."
  - CTA: [Verify with GitHub]
        │
        ▼
/api/auth/github?tool=slug&type=tool
  - Redirects to GitHub OAuth
  - Scope: read:user (public profile only)
        │
        ▼
GitHub OAuth authorize screen
        │
    ┌───┴────────────────────────┐
    │ User authorizes            │ User cancels
    ▼                            ▼
/api/auth/github/callback    /claim/[slug]?error=cancelled
  - Verifies state param
  - Checks contributor/owner status
        │
    ┌───┴──────────────────────────────────┐
    │ Is contributor/owner                 │ Not contributor/owner
    ▼                                      ▼
  Sets claim_session cookie           /claim/[slug]?error=not_contributor
  Redirects to /claim/[slug]?verified=1
        │
        ▼
/claim/[slug]?verified=1 — Authenticated state
  - Success banner: "Verified as @username"
  - Enrichment form: tagline, category, logo, email
  - CTA: [Save listing]
        │
        ▼
Form submit → /api/claim/[slug] POST
        │
    ┌───┴──────────┐
    │ Success      │ Error
    ▼              ▼
Next-steps     Inline error message
panel shown    Form remains active
        │
        ▼
Next-steps panel
  - "Changes live within 24h"
  - [Go to your publisher dashboard →]
        │
        ▼
/dashboard/publisher/
  - Free tier dashboard
  - Score, rank, 7-day views, score breakdown
  - Upsell: [Upgrade to Verified Publisher Pro →]
        │
        ▼
Stripe Checkout → /dashboard/publisher/?upgraded=1
  - Pro tier dashboard unlocks
```

---

## 2. UI Copy

### 2.1 Tool Listing Page — Claim CTA

**Pre-claim (unclaimed tool):**
```
Headline: Claim this listing
Body: Are you a maintainer of {full_name}? Claim your listing to add a custom
      description, logo, and category. Verified maintainers get a badge and
      priority placement.
CTA: [Claim this tool →]
```

**Post-claim (claimed by current user):**
```
Headline: Your listing
Body: You manage this listing as @{github_username}.
CTA: [Edit listing →]   [View dashboard →]
```

**Post-claim (claimed by someone else):**
```
Headline: Verified listing
Body: This listing is managed by a verified maintainer.
(no CTA)
```

---

### 2.2 /claim/[slug] — Unauthenticated State

**Page title:** `Claim {full_name} — AgentRank`

**Header:**
```
h2: Claim listing
subhead: {full_name}
description: {repo description}
```

**Auth section:**
```
h3: Verify ownership
Body: Claim your listing to add a tagline, logo, and category. Verified maintainers
      get a Verified Publisher badge and priority placement on the AgentRank index.

      You must be a contributor or owner of {full_name} to claim this listing.
      We verify ownership via GitHub.

CTA: [Verify with GitHub]
Note: GitHub login only. We only read your public profile — no write access.
```

---

### 2.3 /claim/[slug] — Error States

All errors render as a banner above the auth section.

| Error code | Banner text |
|---|---|
| `cancelled` | GitHub authorization was cancelled. |
| `invalid_state` | Invalid OAuth state. Please try again. |
| `csrf` | Security check failed. Please try again. |
| `token` | Failed to get GitHub access token. Please try again. |
| `user` | Failed to get your GitHub user info. Please try again. |
| `not_contributor` | You must be a contributor or owner of {full_name} to claim this listing. |

---

### 2.4 /claim/[slug]?verified=1 — Post-Verification, Form State

**Success banner:**
```
Verified as @{github_username}. You can now enrich this listing.
```

**Form headline:**
```
Enrich your listing
```

**Form fields:**

| Field | Label | Placeholder | Hint |
|---|---|---|---|
| tagline | Tagline | A short description that captures what this tool does | max 200 chars |
| category | Primary category | — Select a category — | |
| logo_url | Logo URL | https://example.com/logo.png | https:// only |
| is_deprecated | Mark as deprecated | | checkbox |
| contact_email | Email | you@example.com | optional — get notified about Verified Publisher launch |

**Submit CTA:** `[Save listing]`

**Saving state:** Button text changes to "Saving..." and is disabled.

**Save error:**
```
Inline below submit button: {error message from API, e.g. "Save failed. Please try again."}
```

---

### 2.5 /claim/[slug] — Post-Save Next-Steps Panel

Shown after successful form submit. Form collapses to 50% opacity.

```
Headline: Listing saved. What's next?

Step 1:
  Title: Changes go live within 24 hours
  Body: Your tagline, category, and logo appear on the index after the next
        nightly pipeline run.

Step 2:
  Title: Go to your publisher dashboard
  Body: See your tool's score breakdown, 7-day view count, and rank.
  CTA: [View your dashboard →] → /dashboard/publisher/

Step 3:
  Title: Embed your AgentRank score
  Body: Add a live score badge to your README. Auto-updates daily.
  CTA: [View badge code →] → /tool/{slug}/
```

---

### 2.6 /dashboard/publisher/ — Free Tier

**Page title:** `Publisher Dashboard — AgentRank`

**Header:**
```
h1: Publisher Dashboard
subhead: @{github_username}
```

**Tool switcher** (if user has multiple claimed tools):
```
Dropdown: [current tool name ▾]
```

**Stats section:**

```
Rank: #[rank] of [total]
Score: [score]/100
Views (7 days): [count]
```

**Score breakdown table:**

| Signal | Score | Weight | Raw value |
|---|---|---|---|
| Stars | [0-100] | 15% | [n] stars |
| Freshness | [0-100] | 25% | Last commit [n] days ago |
| Issue health | [0-100] | 25% | [closed]/[total] issues closed |
| Contributors | [0-100] | 10% | [n] contributors |
| Dependents | [0-100] | 25% | [n] dependents |

**Listing edit panel:**

```
Headline: Your listing
Fields: tagline (editable), category (editable), logo_url (editable)
CTA: [Save changes]
```

**Pro upsell banner:**

```
Headline: Get deeper analytics with Verified Publisher Pro
Body: See score trends over time, referral sources, comparison events, and
      install attribution. Get email alerts when your score changes.
CTA: [Upgrade — $29/mo →] → /pricing/
Subtext: Cancel anytime.
```

---

### 2.7 /dashboard/publisher/?upgraded=1 — Post-Upgrade Welcome

**Banner:**
```
Success banner: Welcome to Verified Publisher Pro. Your badge is now live.
```

**New sections unlocked (Pro tier):**
- Score trend chart (30-day sparkline)
- Referral sources breakdown
- Comparison events count
- Install attribution (where trackable)
- Email notification preferences
- Badge embed code (markdown + HTML)

---

### 2.8 Error / Edge Case States

**Dashboard accessed without session cookie:**
```
Redirect to /pricing/?ref=dashboard_noauth
```

**Dashboard accessed with session but no verified claims:**
```
Redirect to /pricing/?ref=dashboard_unclaimed
```

**GitHub OAuth — tool not found in DB:**
```
Redirect to /404
```

---

## 3. Email Sequence Copy

Three triggered emails. Sent from `noreply@agentrank-ai.com`. Reply-to `steve@agentrank-ai.com`.

Template variables: `{{first_name}}`, `{{repo_name}}`, `{{tool_slug}}`, `{{current_score}}`

---

### Email 1 — Welcome (Send: immediately after claim is saved)

**Subject:** Your AgentRank listing is claimed — here's what to do next

**Preview:** Three things to make your listing count.

---

Hi {{first_name}},

You've claimed {{repo_name}} on AgentRank. Your listing is live. Here's how to make it count.

**1. Add a custom tagline and logo**

Your GitHub repo description is the floor. Your tagline is the ceiling — up to 200 characters, written for developers evaluating tools in your category, not for GitHub search.

A strong tagline is specific: what it does, who it's for, what makes it different. "A powerful MCP server" is weak. "filesystem-mcp gives Claude Desktop read/write access to your local files — zero config, macOS/Windows/Linux" is strong.

Edit your listing: [agentrank-ai.com/claim/{{tool_slug}}/](https://agentrank-ai.com/claim/{{tool_slug}}/)

**2. Add your listing to your README**

The quickest way to drive traffic to your AgentRank listing is to link to it from your README. A line like:

> Ranked on [AgentRank](https://agentrank-ai.com/tool/{{tool_slug}}/)

surfaces your score as social proof for developers who discover you on GitHub first.

**3. Check your score breakdown**

Your publisher dashboard shows exactly which of the five signals is dragging your score. The score breakdown page makes it obvious what to fix.

View your dashboard: [agentrank-ai.com/dashboard/publisher/](https://agentrank-ai.com/dashboard/publisher/)

Your current score: **{{current_score}}/100**

Reply to this email with any questions.

— Steve, AgentRank

---

### Email 2 — Day 3 (Send: 72 hours after claim)

**Subject:** Your {{repo_name}} score breakdown

**Preview:** Here's exactly what's driving your AgentRank score.

---

Hi {{first_name}},

Your AgentRank score for {{repo_name}} is **{{current_score}}/100**. Here's what goes into it.

**The five signals:**

**Stars (15%)** — Raw popularity. Normalized against the index. Stars are a lagging indicator — they move slowly — but they matter for credibility. Focus here only if your tool has very few stars relative to its quality.

**Freshness (25%) — biggest lever**
Days since last commit. Score is 1.0 within 7 days, then decays linearly to day 90, then drops fast. If your tool is stable, a maintenance commit (README update, dependency bump) once a month keeps the score from decaying. If the tool is intentionally complete, note that in your README.

**Issue Health (25%)**
`closed_issues / total_issues`. Above 90% is excellent. Below 50% starts hurting. Quick win: close 10 stale issues — duplicates, already fixed, out of scope — and the ratio improves immediately.

**Contributors (10%)**
Going from 1 to 2+ makes a difference. Accept a documentation PR, add a co-maintainer, or mark issues as "good first issue." Ceiling is 20 contributors.

**Dependents (25%) — strongest signal, hardest to move**
Other GitHub repos that import your package. Publish to npm or PyPI if you haven't — GitHub's dependency graph only detects dependents via package manager files. Write a tutorial with a working example. Get listed in awesome-* lists that get forked. This builds slowly but compounds.

**Your score today:** {{current_score}}/100

[View your full breakdown →](https://agentrank-ai.com/dashboard/publisher/)

— Steve, AgentRank

---

### Email 3 — Day 7 (Send: 7 days after claim)

**Subject:** Upgrade {{repo_name}} to Verified Publisher Pro

**Preview:** Analytics, badge embed, and score change alerts for $29/month.

---

Hi {{first_name}},

One week since you claimed {{repo_name}}. Here's what you get with Verified Publisher Pro.

**What Pro adds:**

**Score trend chart** — Your score over the last 30 days. Rising means you're climbing the index. Flat or falling means something to fix.

**Referral sources** — Where your listing views are coming from. Organic AgentRank search vs. inbound from GitHub, Reddit, Hacker News, newsletters. Tells you which distribution channels are working.

**Comparison events** — How many times a developer opened your listing alongside another tool to compare. High-intent signal: these are developers actively evaluating tools in your category.

**Score change alerts** — Email when your AgentRank score moves 10+ points in either direction. Know when something changed and why.

**Verified badge on your listing** — Visible on every listing page and in index results. Signals active, real maintenance.

**Badge embed code** — Markdown and HTML snippets for your README. Auto-updates daily.

**Priority indexing** — Score updates within 24 hours instead of nightly.

**Price:** $29/month. Cancel anytime.

[Upgrade to Verified Publisher Pro →](https://agentrank-ai.com/pricing/)

Your listing is currently ranked **#[rank]** in the index. Pro publishers see their score move faster when they make changes.

— Steve, AgentRank

---

## 4. Dashboard Wireframe Spec

### Free Tier

```
┌──────────────────────────────────────────────┐
│  PUBLISHER DASHBOARD                         │
│  @{github_username}                          │
│                                              │
│  [Tool: {repo_name} ▾]   (switcher if >1)   │
├──────────────────────────────────────────────┤
│  RANK          SCORE       VIEWS (7d)        │
│  #[n] of [n]   [n]/100     [n]               │
├──────────────────────────────────────────────┤
│  SCORE BREAKDOWN                             │
│  ┌──────────────┬──────┬────────┬──────────┐ │
│  │ Signal       │Score │ Weight │ Raw      │ │
│  ├──────────────┼──────┼────────┼──────────┤ │
│  │ Stars        │ [n]  │  15%   │ [n]      │ │
│  │ Freshness    │ [n]  │  25%   │ [n]d ago │ │
│  │ Issue health │ [n]  │  25%   │ [n]/[n]  │ │
│  │ Contributors │ [n]  │  10%   │ [n]      │ │
│  │ Dependents   │ [n]  │  25%   │ [n]      │ │
│  └──────────────┴──────┴────────┴──────────┘ │
├──────────────────────────────────────────────┤
│  YOUR LISTING                                │
│  Tagline: [_____________________]            │
│  Category: [___▾]                            │
│  Logo URL: [_____________________]           │
│                          [Save changes]      │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │  Get deeper analytics with             │  │
│  │  Verified Publisher Pro                │  │
│  │                                        │  │
│  │  Score trends · Referral sources       │  │
│  │  Comparison events · Score alerts      │  │
│  │                                        │  │
│  │  [Upgrade — $29/mo →]                  │  │
│  │  Cancel anytime.                       │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Pro Tier (all of the above, plus)

```
├──────────────────────────────────────────────┤
│  SCORE TREND (30 days)                       │
│  [sparkline chart: score over time]          │
│  [n] points in last 30 days ↑/↓             │
├──────────────────────────────────────────────┤
│  REFERRAL SOURCES                            │
│  AgentRank search    [███████░░░] [n]%       │
│  GitHub              [████░░░░░░] [n]%       │
│  Direct              [███░░░░░░░] [n]%       │
│  Other               [░░░░░░░░░░] [n]%       │
├──────────────────────────────────────────────┤
│  COMPARISON EVENTS (7d)        [n]           │
│  Developers compared this tool to others     │
├──────────────────────────────────────────────┤
│  SCORE CHANGE ALERTS                         │
│  Email: [_______________________]            │
│  Notify me when score changes ± 10+ points  │
│  [ ] Enabled                                 │
│                          [Save preferences] │
├──────────────────────────────────────────────┤
│  BADGE EMBED                                 │
│  Markdown:                                   │
│  ┌────────────────────────────────────────┐  │
│  │ [![AgentRank](https://agentrank-ai... │  │
│  │ /badge/{slug}.svg)](https://...)]      │  │
│  └────────────────────────────────────────┘  │
│  [Copy markdown]                             │
│                                              │
│  HTML:                                       │
│  ┌────────────────────────────────────────┐  │
│  │ <a href="..."><img src="..."/></a>     │  │
│  └────────────────────────────────────────┘  │
│  [Copy HTML]                                 │
└──────────────────────────────────────────────┘
```

---

## 5. State Summary

| State | URL | Auth | Notes |
|---|---|---|---|
| Unauthenticated claim page | `/claim/[slug]` | None | Show "Verify with GitHub" |
| Post-OAuth success | `/claim/[slug]?verified=1` | claim_session cookie | Show success banner + form |
| Post-OAuth error | `/claim/[slug]?error={code}` | None | Show error banner |
| Post-save next steps | `/claim/[slug]?verified=1` (form hidden) | claim_session cookie | JS reveals panel |
| Free tier dashboard | `/dashboard/publisher/` | claim_session cookie | Redirects to /pricing if no cookie/no claims |
| Pro tier dashboard | `/dashboard/publisher/?upgraded=1` | claim_session cookie + subscription | Unlocks analytics sections |

---

## 6. Implementation Notes

**What's already built:**
- `/claim/[slug].astro` — full claim page with GitHub OAuth button, form, and next-steps panel
- `/api/auth/github.ts` — GitHub OAuth redirect initiation
- `/api/auth/github/callback.ts` — OAuth callback, contributor check, cookie set
- `/api/claim/[slug].ts` — claim form POST handler
- `/dashboard/publisher/index.astro` — free tier dashboard with score breakdown

**What needs to be built:**
- Pro tier dashboard sections (score trend chart, referral sources, comparison events, badge embed, email prefs) — see `publisher-dashboard-spec.md`
- Stripe webhook handling for subscription status → unlock Pro tier
- Email send triggers: claim saved → Email 1, Day 3 → Email 2, Day 7 → Email 3
- Tool listing page "Claim this tool" CTA refinement (copy update per section 2.1)

**Blockers:**
- GitHub OAuth env vars not set in production (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) — AUT-155
- The entire flow is currently returning 503 on all `/api/auth/github` requests
- Fix is Steve-only: register GitHub OAuth app and set env vars in Cloudflare Pages

**When the blocker is resolved:**
The enrichment form, save logic, session cookies, and dashboard are all functional. The entire free-tier flow will work immediately once OAuth env vars are set. The email sequence needs to be wired to Resend/Postmark before the day-3 and day-7 emails fire.

---

*References:*
- `scripts/publisher-dashboard-spec.md` — detailed Pro tier dashboard spec
- `scripts/publisher-onboarding-sequence.md` — full 5-email drip sequence (superset of the 3 here)
- `scripts/phase2-monetization-spec.md` — pricing and Stripe integration spec
- AUT-155 — GitHub OAuth production blocker
