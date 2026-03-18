# AgentRank Email Capture Strategy

> **STATUS: DRAFT — Steve must review before implementation.**

Generated: 2026-03-17

---

## Goal

Build an email list of developers who use MCP servers and agent tools. These are the people who'll use AgentRank weekly, install the MCP server, and recommend it to their teams. An email list means we own the distribution — no algorithm dependency.

---

## Recommended Service: Buttondown

**Use Buttondown** (buttondown.email).

- Free up to 100 subscribers, $9/mo after
- Built for technical newsletters — Markdown, API, webhooks
- No bloat, no visual template builder you don't need
- Easily integrates with a `POST /subscribe` endpoint
- Used by many developer-focused newsletters (Robin Rendle, Cassidy Williams, etc.)

Alternative if we need more automation: **Resend** (resend.com) for transactional + newsletter combo, but more complex to set up. Stick with Buttondown for launch.

Do NOT use Mailchimp or similar — wrong audience, wrong aesthetic.

---

## Where to Add Email Capture

### 1. Homepage — Primary Placement (High Priority)

**Below the hero, above the tool list.**

The homepage already has the top tool rankings visible on load. After the user gets the value proposition (what AgentRank is), offer the newsletter as the way to get it weekly.

Placement: between the leaderboard intro text and the first tool card row.

Copy:
```
Get the weekly rankings in your inbox.
Top movers, new entries, and ecosystem trends — for developers building with MCP.

[Email address]  [Subscribe — it's free]

No noise. Unsubscribe any time.
```

### 2. Homepage — Footer/Bottom (Medium Priority)

Secondary signup at the very bottom of the page for users who scroll through the full leaderboard and want to follow along.

Copy:
```
Stay updated on the MCP ecosystem.
Weekly AgentRank digest — top tools, biggest movers, what changed.

[Email]  [Subscribe]
```

### 3. Tool Detail Pages (High Priority)

Every tool page at `/tool/{slug}` should have a contextual signup.

Use the tool being viewed as the hook — offer rank-change alerts as the value prop.

Copy:
```
Get notified when this tool's rank changes.
We'll email you if CoplayDev/unity-mcp moves significantly in the rankings.

[Email]  [Watch this tool]

(You'll also get the weekly AgentRank digest.)
```

This creates hyper-relevant signup intent. The user is already interested in a specific tool.

### 4. Blog / Research Pages (Medium Priority)

Any blog post or data report should end with a newsletter signup section.

Copy:
```
Enjoyed this? Get the weekly MCP ecosystem digest.
Top movers, new entries, and data like this — every week.

[Email]  [Subscribe]
```

### 5. After Installing MCP Server (Low Priority — Future)

When someone runs `claude mcp add agentrank -- npx -y agentrank-mcp-server`, we could surface a terminal prompt or post-install message pointing to the newsletter. Low-friction, highly targeted audience.

---

## What to Offer in Exchange

### Primary offer: Weekly Rankings Digest

This is the default subscription. Every subscriber gets:
- Top 5 tools with scores
- Biggest movers (rank changes)
- Notable new entries
- One ecosystem insight

This is already drafted in `scripts/newsletter-draft-001.md`.

### Secondary offer: Tool Rank Alerts (Future Feature)

"Watch" a specific tool and get emailed when its score changes by 5+ points or rank changes by 10+ positions.

This is the highest-value proposition for a maintainer or developer evaluating a specific tool. It requires:
- A `tool_watches` table in D1 (email, tool_slug, threshold)
- A cron job to diff scores and trigger emails
- Buttondown API or Resend for transactional delivery

**Recommend building this in Phase 2** once we have enough subscribers to validate demand. For now, sign up for the digest and mention it as "coming soon."

---

## Signup CTA Copy Variants

### Variant A — Data-forward
```
25,632 tools ranked. Get the weekly movers report.

The MCP ecosystem moves fast. We track it daily and send a digest every week — top tools, biggest rank changes, what the data says.

[your@email.com]  [Subscribe free]
```

### Variant B — Pain-point
```
Stop picking MCP tools from GitHub stars alone.

We score 25,000+ tools on freshness, issue health, and real usage — not just star count. Get the weekly digest and know which tools are actually being maintained.

[your@email.com]  [Send me the rankings]
```

### Variant C — Minimal
```
Weekly AgentRank digest.
Top movers, new entries, ecosystem data.

[Subscribe — free, no noise]
```

**Recommendation:** Start with Variant B on tool detail pages, Variant A on the homepage. Variant C for secondary placements (blog, footer).

---

## Implementation Plan

### Phase 1 — Minimal (Ship This Week)

1. Create Buttondown account, set up list
2. Add homepage signup form (static HTML POST to Buttondown embed URL)
3. Add tool detail page signup with "watch this tool" copy (still goes to general list for now)
4. Set up welcome email in Buttondown: confirm subscription + link to agentrank-ai.com
5. Send `newsletter-draft-001.md` as Issue #1 once we have a list

**Effort:** ~2-4 hours of frontend work + Buttondown setup.

### Phase 2 — Tool-specific alerts (Post-traction)

After 500+ subscribers:
1. Add `tool_watches` table to D1
2. Build `/api/watch-tool` endpoint (email + slug, writes to D1)
3. Cron job to check score diffs and trigger Buttondown/Resend transactional emails
4. Update tool detail page CTAs to use the watch endpoint

---

## Success Metrics

| Metric | Week 2 | Week 4 | Week 8 |
|--------|--------|--------|--------|
| Email subscribers | 50+ | 200+ | 500+ |
| Open rate (target) | >40% | >40% | >35% |
| Click-through rate | >10% | >10% | >8% |
| Unsubscribe rate | <2% | <2% | <2% |

Developer newsletters typically see 40-60% open rates with a focused, technical audience. If we're under 30% after issue #2, revisit subject line strategy and content format.

---

## Technical Notes

- Buttondown provides a simple POST embed form — no JS required, works in Hono templates
- Buttondown API available at `api.buttondown.email` if we want programmatic subscription
- For tool-watch alerts (Phase 2), Resend is better for transactional — Buttondown is newsletter-first
- GDPR: add explicit consent language ("You agree to receive the AgentRank weekly digest. Unsubscribe any time.") — required for EU subscribers

---

*Generated by Community Manager agent. Requires Steve's approval before implementation.*
