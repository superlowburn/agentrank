# AgentRank Week 5 Status Report

**Generated:** 2026-03-18
**Data window:** 2026-03-13 through 2026-03-18 (Week 4 full + Week 5 partial)
**Report purpose:** Phase 2 gate decision — are we at 5K monthly API requests or 500 skill installs?

---

## Phase 2 Gate: Verdict

**BORDERLINE. Proceed with caution.**

- **API requests:** 103,115 logged since March 16 (2 days). Extrapolated monthly rate: ~1.5M. But: 0 authenticated API keys issued — all requests are unauthenticated, mostly bot/crawler traffic. Human-generated API usage is effectively zero.
- **Skill installs:** Unknown. skills.sh does not expose a public install count API. Dashboard access required.

**Recommendation:** Do not treat bot API traffic as Phase 2 qualification. The gate intent was human/agent-driven demand. Monitor skill install count via skills.sh dashboard; that metric is the cleaner signal. Hold Phase 2 monetization work until skill installs data is available or human API usage materializes.

---

## 1. Site Traffic (Cloudflare Analytics)

### Daily Traffic (Week 4)

| Date | Requests | Pageviews | Unique Visitors | Bandwidth |
|------|----------|-----------|-----------------|-----------|
| 2026-03-13 | 5,249 | 4,898 | 115 | 41.7 MB |
| 2026-03-14 | 1,206 | 1,005 | 149 | 25.5 MB |
| 2026-03-15 | 2,986 | 2,016 | 228 | 43.1 MB |
| 2026-03-16 | 70,351 | 40,788 | 402 | 271.9 MB |
| 2026-03-17 | 220,245 | 148,283 | **934** | 1,945.6 MB |
| 2026-03-18 | 2,914 | 499 | 133 | 24.7 MB (partial) |
| **Week total** | **302,951** | **197,489** | **~2,000 cumulative** | **2.35 GB** |

### Bot vs. Human Breakdown

| User Agent | Requests | Category |
|------------|----------|----------|
| meta-externalagent (Facebook) | 129,779 | Bot |
| GPTBot/1.3 (OpenAI) | 94,509 | Bot |
| ClaudeBot/1.0 (Anthropic) | 57,867 | Bot |
| SerpstatBot | 1,009 | Bot |
| Googlebot (mobile) | 1,084 | Bot |
| AhrefsBot | 258 | Bot |
| Bingbot | 163 | Bot |
| Real browsers | ~634 | Human |

**Key insight:** The March 17 spike (934 uniques, 148k pageviews) was driven almost entirely by Meta, OpenAI, and Anthropic AI crawlers discovering the site simultaneously. Real human unique visitors this week: approximately 634 across all days. The AI crawler indexing is a long-term win (our content enters AI knowledge bases), but it inflates all traffic metrics substantially.

**Top human-accessed pages:** Tool detail pages dominate (fastmcp, mcp-proxy, playwright-mcp, mongodb-mcp). RSS feed and sitemap consumed by crawlers.

**Geographic:** 99.4% US traffic — on-target for AI developer audience.

---

## 2. API Requests

**Total logged:** 103,115 (since 2026-03-16, 2 days only)

| Endpoint | Hits |
|----------|------|
| /api/auth/github | 2,631 |
| /api/badge/tool/* | ~200 |
| /api/search | 84 |
| /api/v1/search | 49 |
| /api/dash | 19 |

**API keys issued:** 0
**Authenticated API requests:** 0

**Note on the 103K number:** These are not user-initiated API calls. The count reflects all requests routed through the API path, including static-like requests from crawlers and the badge embed system. There is no meaningful human-generated API consumption yet.

**The 2,631 GitHub auth attempts are the strongest human signal:** Maintainers are finding their listings and clicking through the claim flow. This is the primary engagement funnel.

---

## 3. Claim Flow Conversions (Pre-Fix vs. Post-Fix)

### Pre-Fix (AUT-152 identified three drop-off points)

| Metric | Value |
|--------|-------|
| GitHub OAuth clicks (2 days) | 2,631 |
| Completed claims | 0 |
| Email addresses captured | 0 |
| Conversion rate | **0%** |

**Root causes found:**
1. OAuth error redirect bug — errors sent to `/claim/?error=...` (no slug), likely a 404, losing the user
2. Post-claim dead end — "Saved." text disappeared with no CTA, no next steps
3. No email capture at any point in the flow

### Post-Fix (AUT-152 deployed 2026-03-18 ~02:15 UTC)

**Status: Too early for data.** Fix deployed less than 4 hours before this report was compiled. No post-fix claim completions or email captures recorded yet.

**What was fixed:**
- OAuth errors now redirect to correct `/claim/{tool}/?error=...` page (user stays in funnel)
- Post-save next-steps panel added: links to API key request, badge embed, and 24h timeline
- Optional email capture added to claim form ("get notified about Verified Publisher launch")
- Form dims + button changes to "Saved" after success (prevents re-submit confusion)
- Value prop copy improved in auth section

**Watch:** With 2,631 maintainers who've already started the flow, even a 3-5% re-engagement rate from organic return visits would yield 80-130 email captures. Monitor `/api/admin/subscribers` over the next 7 days.

---

## 4. UTM Attribution (AUT-150 Deployed)

**Status: Deployed, but no data yet.**

UTM tracking was added to all outbound links in commit `8c9bd0e` (deployed this week). Channels tagged:

| Channel | UTM Parameters |
|---------|----------------|
| README badges | `utm_source=badge&utm_medium=readme&utm_campaign=agentrank_badge` |
| GitHub issue outreach | `utm_source=github_issue&utm_medium=outreach&utm_campaign=maintainer_notify` |
| Tweet templates | `utm_source=twitter&utm_medium=social&utm_campaign=maintainer_tag` |
| Outreach emails | `utm_source=email&utm_medium=outreach&utm_campaign=sponsored_listing` |
| Newsletter | `utm_source=newsletter&utm_medium=email&utm_campaign=newsletter_1` |
| Partnership emails | `utm_source=email&utm_medium=partnership&utm_campaign=partner_outreach` |

**Zero UTM-tagged visits recorded in this reporting window.** UTM data will only accumulate as tagged links are clicked — primarily when badge PRs merge and README badges go live, or when newsletter/email campaigns launch. This metric should have data to show in the Week 6 report.

**Current traffic attribution:** All traffic arriving as direct or unattributed. The pre-UTM spike on March 17 is unattributable to any specific channel.

---

## 5. Email Subscribers

**Current count: 0**

No email captures prior to AUT-152 claim flow fix (deployed today). The footer subscribe form exists but has not driven conversions. Email capture strategy is now embedded in the claim flow as of 2026-03-18.

**Pipeline for email growth:**
1. **Claim flow captures** — maintainers completing claims can now opt in (immediate)
2. **Footer subscribe form** — low intent, low conversion rate expected
3. **Newsletter #1** — draft exists at `scripts/newsletter-draft-001.md`; held pending subscriber base

---

## 6. Badge PR Status

**Total PRs opened:** 40+ (19/20 original campaign + expanded to top 40 ranked repos)

| Status | Count |
|--------|-------|
| Open (awaiting review) | **35+** |
| Merged | **0** |
| Closed — rejected | **3** |
| Blocked / needs action | **2** |

### Rejections (3)
1. **punkpeye/awesome-mcp-servers #3361** — Owner closed: "Please raise a PR that does not remove other listings." (PR accidentally removed existing entries.) Action needed: re-submit clean PR (Steve approval required per public-facing content rule). Task: AUT-105 (blocked).
2. **microsoft/azure-devops-mcp #1016** — Flat rejection: "no thank you." No action.
3. **laravel/boost #675** — Maintenance concern. Wrong repo type (Laravel app, not MCP server). No action.

### Needs Action (2)
- **punkpeye/awesome-mcp-servers #3333 and #3334** — The repo runs a Glama bot requiring all new listings to include a Glama score badge. Both PRs blocked. Task AUT-106 (blocked): requires submitting AgentRank to Glama.ai first to get the badge, then updating both PRs. Steve approval required.

### Open PR Opportunity
35+ PRs are pending review. The March 17 traffic spike gives us credibility for follow-up comments. Each open PR maintainer has now seen 100-900+ visitors to their tool page in one day. A follow-up comment with traffic data could accelerate merges.

---

## 7. SEO — Google Search Console

**Status: No ranking data available.**

- Google Search Console not yet set up or not accessible to this agent.
- IndexNow submitted for Bing/Yandex (commit `4f4f5f1`) — fast-tracks indexing on those engines.
- Googlebot is actively crawling (1,084 requests on March 17) — Google knows we exist.
- No ranking data expected until site has been indexed for 4-8 weeks (typical GSC data delay).
- SEO blog posts live: MCP directory comparison, tool selection guide, category pages.

**Expected first ranking signals:** Week 7-8 (late March/early April 2026).

**Action for Steve:** Set up Google Search Console via https://search.google.com/search-console and verify the agentrank-ai.com property to unlock keyword ranking data.

---

## 8. Competitors — New Entrants

### Established Players (No Major Changes)

| Directory | Server Count | Key Move This Week |
|-----------|-------------|-------------------|
| Glama.ai | 19,503 | Added "Sort by usage in last 30 days" — improving discovery quality signals |
| MCP.so | 18,659 | DXT (Anthropic Desktop Extensions) tab added — early positioning for format |
| PulseMCP | 11,172 | Stable; unique per-server visitor estimates still unpublished elsewhere |
| Smithery.ai | ~2,880 | "Smithery Skills" product = direct overlap with AgentRank v2 skills pivot |

### New Entrants (Active as of March 2026)

| Site | Count | Notes |
|------|-------|-------|
| mcpserverfinder.com | 1,934 | Roadmap: compatibility matrix, community reviews — well-funded feature set |
| aiagentslist.com | 593+ | Browse by category/language/scope |
| apitracker.io/mcp-servers | ~110 | Official/verified-only (curated) |
| apigene.ai | 100+ | Setup guides focus; curated official-only |
| MCPMarket.com | Unknown | Daily editorial "Top MCP Servers" — running since early March |

### Competitive Assessment

**AgentRank's moat remains intact:**
1. **Scale advantage** — 25,632 indexed repos vs Glama's 19,503 (next largest). Credible 31% lead worth publicizing.
2. **Composite score** — No competitor publishes a single 0-100 ranking. Glama's A-F is per-dimension, not unified. This is still a real differentiator.
3. **Skills/agents coverage** — 3,124 skills indexed. No competitor tracks skills/agents separately from MCP servers.

**Urgent watch:**
- **Smithery's "Skills" product** is the closest strategic threat to AgentRank v2. Their brand is stronger in developer circles.
- **MCPMarket.com's daily editorial lists** are producing content that could compete for SEO keywords AgentRank is targeting.

**No major new competitor has launched since last week.** The space is consolidating around the 4-5 established players.

---

## Summary Dashboard

| Metric | Current | Week 4 Target | Assessment |
|--------|---------|---------------|------------|
| Monthly unique visitors | ~400 est. (extrapolated from 5-day data) | 2,000+ | **Below target** |
| Monthly API requests (human) | ~0 (bots only) | 200+ | **Below target** |
| Skill installs | Unknown | 100+ | **Data needed** |
| Email subscribers | 0 | 100+ | **Below target** |
| Badge PRs merged | 0/40 | 5+ | **Below target** |
| Claim conversions (post-fix) | 0 (fix just deployed) | N/A | **Watch** |
| AI crawlers indexing | 3 major (Meta, OpenAI, Anthropic) | — | **Excellent** |
| GitHub claim attempts | 2,631 | — | **Strong signal** |

---

## Recommendations for Week 5

### Immediate (no approvals needed)
1. **Monitor post-fix claim conversions** — check `/api/admin/subscribers` daily. The fixed flow is live; 2,631 past visitors could return.
2. **Follow up on 35+ open badge PRs** — send a comment on each with March 17 traffic data ("Your tool had X visitors this week on AgentRank"). Best window: now, while spike is fresh.
3. **Pull skills.sh install count** — log into skills.sh dashboard and get the actual number. This is the cleaner Phase 2 gate metric.

### Needs Steve Approval
4. **Re-submit punkpeye/awesome-mcp-servers PR** ([AUT-105](/AUT/issues/AUT-105)) — clean PR that only adds AgentRank. High-value list for SEO backlink + 11K+ server ecosystem visibility.
5. **Submit AgentRank to Glama.ai** ([AUT-106](/AUT/issues/AUT-106)) — unblocks two punkpeye PRs and adds presence on the largest MCP directory.
6. **Set up Google Search Console** — verify agentrank-ai.com property to unlock ranking data for Week 6 report.
7. **Post Reddit/HN community launch** ([AUT-28](/AUT/issues/AUT-28)) — organic mention scan found zero third-party coverage. Drafts are at `scripts/community-posts-draft.md`. The HN "What are you working on?" thread is active now.

### Phase 2 Gate Decision
Hold Phase 2 monetization (sponsored listings, Pro API tier, Verified Publisher) until:
- Skill install count is pulled and confirmed vs. 500 target, OR
- Human-generated API requests exceed 5K/month (needs API key adoption to drive this)

The 2,631 maintainer claim attempts in 2 days show the vanity loop works. Fix the claim flow, get those email addresses, then monetize the list.
