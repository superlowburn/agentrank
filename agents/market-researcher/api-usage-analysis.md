# AgentRank API & Traffic Usage Analysis

**Analyzed:** 2026-03-19
**Data window:** 2026-03-16 to 2026-03-19 (3+ days)
**Total logged requests:** 309,797
**Database:** agentrank-db (D1), `request_log` table

---

## Executive Summary

AgentRank has three distinct audiences generating very different traffic profiles:

1. **AI training crawlers** — 97.6% of all requests. Meta, OpenAI, and Anthropic are hammering the site, signaling strong perceived authority.
2. **Search engine / SEO bots** — misclassified as `is_bot=0` (bug). GoogleOther, Applebot, OAI-SearchBot, serpstatbot.
3. **Actual humans** — ~900–1,500 true human sessions over 3 days. Small but engaged: maintainers arriving from GitHub badge PRs, developers searching for specific tools.

The search API and badge system are the two most-used features among real users. Both deserve immediate investment.

---

## Traffic Composition

| Segment | Requests | % of Total |
|---------|----------|-----------|
| Bots (is_bot=1) — pages | 188,320 | 60.8% |
| Bots (is_bot=1) — API | 113,995 | 36.8% |
| "Human" (is_bot=0) — pages | 7,166 | 2.3% |
| "Human" (is_bot=0) — API | 316 | 0.1% |

**Note:** The `is_bot=0` bucket contains ~6,550 additional bot requests not caught by the current detection logic (see Bug section). True human traffic is ~900–1,500 requests/3 days.

### Daily Trend (is_bot=0 requests)
| Date | Requests |
|------|----------|
| 2026-03-16 | 1,951 |
| 2026-03-17 | 1,195 |
| 2026-03-18 | 4,050 |
| 2026-03-19 | 288 (partial) |

March 18 spike (~3.4x) likely driven by a specific referral event or PR badge going viral on GitHub.

---

## Top Human API Endpoints

| Endpoint | Requests | Notes |
|----------|----------|-------|
| /api/search | 71 | Primary search (legacy path) |
| /api/v1/search | 24 | Versioned search |
| /api/dash | 22 | Internal dashboard calls |
| /api/badge/tool/PrefectHQ--fastmcp | 10 | Badge served from GitHub PR |
| /api/badge/tool/CoplayDev--unity-mcp | 9 | Badge PR traffic |
| /api/badge/skill/glama-playwright-mcp-server | 8 | |
| /api/v1/new-tools | 7 | New tools feed |
| /api/v1/news | 6 | News feed |
| /api/status | 6 | Health check |
| /api/badge/tool/microsoft--azure-devops-mcp | 6 | |

**Search (`/api/search` + `/api/v1/search`) = 95 calls** — the top API use case by far. Users are actively searching for tools, not just browsing.

---

## Top Search Queries

All queries (3-day window, low total volume confirms early-stage traffic):

| Query | Count |
|-------|-------|
| mcp | 40 |
| playwright | 3 |
| filesystem | 3 |
| youtube | 2 |
| mcp server | 2 |
| model context protocol | 1 |
| linear mcp issue tracking | 1 |
| github mcp | 1 |
| gitlab mcp server | 1 |
| typescript | 1 |
| supabase | 1 |
| sqlite | 1 |
| shadcn | 1 |
| tailwind | 1 |
| security | 1 |

**Key insight:** "mcp" dominates (40x). Users want generic category search, not specific tool lookups. The search box needs good autocomplete / suggested queries for "mcp" hits. Also: 1 user searched a full GitHub URL (`https://github.com/laravel/boost`) — the `/api/lookup` endpoint is being used correctly for direct lookups.

---

## Top Tool & Skill Pages (Human Traffic)

| Page | Views |
|------|-------|
| /tool/microsoft--playwright-mcp | 17 |
| /tool/PrefectHQ--fastmcp | 17 |
| /skill/glama-samefarrar--mcp-ankiconnect/ | 16 |
| /skill/microsoft--github-copilot-for-azure--entra-app-registration/ | 14 |
| /skill/glama-microsoft--playwright-mcp/ | 14 |
| /skill/microsoft--azure-skills--entra-app-registration/ | 13 |
| /skill/pbakaus--impeccable--extract/ | 12 |
| /tool/punkpeye--mcp-proxy | 11 |
| /tool/microsoft--azure-devops-mcp/ | 11 |
| /tool/CoplayDev--unity-mcp/ | 11 |
| /tool/win4r--openclaw-a2a-gateway/ | 8 |
| /tool/mongodb-js--mongodb-mcp-server | 8 |
| /tool/mcp-use--mcp-use/ | 8 |
| /tool/brightdata--brightdata-mcp | 7 |
| /tool/laravel--boost | 7 |

Mix of MCP tools (playwright, fastmcp, proxy, mongodb) and GitHub Copilot skills (Azure integrations). The Microsoft/Azure skill cluster shows enterprise developer interest.

---

## Traffic Sources & Referrers

### UTM Sources (human traffic)
| Source | Count |
|--------|-------|
| badge | 10 |

Only 10 tracked UTM sessions — the badge outreach campaign is generating trackable traffic, but most traffic is untracked direct/organic.

### Top Referrers (human)
| Referrer | Count | Type |
|----------|-------|------|
| agentrank-ai.com/ | 32 | Internal (homepage) |
| agentrank-ai.com/tools/ | 8 | Internal |
| agentrank-ai.com/api-docs/ | 8 | Internal (dev exploring API) |
| agentrank-ai.com/tool/CoplayDev--unity-mcp/ | 7 | Internal |
| agentrank-ai.com/methodology/ | 6 | Internal |
| github.com/microsoft/playwright-mcp/pull/1469 | 4 | **Badge PR** |
| github.com/apify/apify-mcp-server/pull/565 | 4 | **Badge PR** |
| github.com/rust-mcp-stack/rust-mcp-sdk/pull/139 | 3 | **Badge PR** |
| agentrank-ai.com/submit/ | 5 | Internal (submit flow) |
| agentrank-ai.com/dash/ | 3 | Internal (dashboard) |
| github.com/sooperset/mcp-atlassian/pull/1185 | 2 | **Badge PR** |
| github.com/Flux159/mcp-server-kubernetes/pull/290 | 2 | **Badge PR** |
| google.com/ | 2 | Organic search |
| github.com/mcp-use/mcp-use/pull/1211 | 1 | **Badge PR** |

**The badge PR campaign is working.** 7 distinct GitHub PRs generated direct maintainer traffic. These are high-intent visits — the maintainer clicked through to check their badge/ranking.

---

## Geographic Distribution (Human Traffic)

| Country | Requests | % |
|---------|----------|---|
| US | 5,723 | ~76% |
| DE | 1,167 | ~15% |
| CA | 323 | 4% |
| FR | 45 | 0.6% |
| IN | 29 | 0.4% |
| BR | 23 | 0.3% |
| KR | 21 | 0.3% |

US + Germany account for 91% of traffic. Note: these counts include undetected bots (GoogleOther, etc.) which likely skew US. True human geography probably more even, but US/Europe dominates.

---

## Peak Hours (UTC)

Traffic spikes at **09:00 UTC** (879 requests) — US East morning (5am ET) / Europe midday. Secondary spikes at 04:00 UTC (576) and 08:00 UTC (499).

This aligns with European developer hours more than US. Schedule any time-sensitive content/emails for 08:00–10:00 UTC.

---

## AI Training Crawler Interest (Bot Traffic)

This is the most strategically significant signal in the data:

| Bot | Requests | Company |
|-----|----------|---------|
| meta-externalagent | 143,517 | Meta (AI training) |
| GPTBot/1.3 | 96,018 | OpenAI (training) |
| ClaudeBot/1.0 | 59,738 | Anthropic |
| YandexBot | 702 | Yandex |
| AhrefsBot | 615 | Ahrefs SEO |
| SquirrelScan | 641 | squirrelscan.com |
| bingbot | 174 | Microsoft |
| facebookexternalhit | 71 | Meta (social) |
| Googlebot | 69 | Google |
| Twitterbot | 68 | X/Twitter |
| github-camo | 45 | GitHub (image proxy) |

**Meta + OpenAI + Anthropic = 299,273 requests.** These training crawlers are aggressively indexing AgentRank. This means:
1. AgentRank data is being ingested into major AI models
2. The site has strong perceived authority — AI crawlers prioritize high-quality structured data
3. Future users asking ChatGPT, Claude, or Meta AI about MCP tools may get AgentRank data in responses

The `github-camo` hits (45) confirm badge images are being rendered in GitHub READMEs — the badges are live in real repos.

---

## HTTP Status Codes (Human Traffic)

| Status | Count | Notes |
|--------|-------|-------|
| 200 | 3,936 | Success |
| 302 | 3,462 | Redirects |
| 404 | 71 | Not found |
| 401 | 6 | Unauthorized |
| 400 | 6 | Bad request |
| 503 | 1 | Service error |

High redirect rate (47% of non-bot responses) suggests URL normalization is working but creating extra roundtrips. 404 rate is ~1% — acceptable but worth auditing.

---

## Bugs Found

### 1. Bot Detection Misses (Medium Priority)
The following bot UAs are classified as `is_bot=0` and inflating human traffic metrics:
- `GoogleOther` — 4,694 requests
- `serpstatbot` — 1,009
- `OAI-SearchBot` — 500
- `Applebot` — 292
- `ChatGPT-User` — 29
- `trendictionbot` — 16
- `PerplexityBot` — 3

Fix: Add these UA patterns to the Worker's `is_bot` detection logic.

### 2. Duplicate Search Paths (Low Priority)
Both `/api/search` and `/api/v1/search` are receiving traffic. If `/api/search` is deprecated, add a redirect. If they're different endpoints, document the distinction.

---

## Recommendations for Phase 2 Feature Prioritization

Based on actual usage patterns:

### Build Now (High Signal)
1. **Improve search quality** — "mcp" returns 40 queries and is the #1 search term. Search result relevance and faceting (filter by category, type, stars) would directly serve the most active use case.
2. **Search analytics dashboard** — Track search queries over time. This dataset is gold for understanding ecosystem demand.
3. **Badge embedding** — github-camo hits confirm badges are in READMEs. Invest in badge design variants (size, style) and a badge embed guide for tool pages.

### Build Soon (Medium Signal)
4. **UTM tracking expansion** — Only "badge" is tagged. Add UTM params to all distribution channels (newsletter, Twitter, Product Hunt) to understand what drives quality traffic.
5. **Fix bot detection** — GoogleOther + serpstatbot false-positives are masking the true human traffic number. Accurate metrics enable better decisions.
6. **Redirect consolidation** — 3,462 redirects for 7,482 "human" requests (46%) suggests URL slug inconsistency. Tool pages with/without trailing slashes both appear in top paths. Canonicalize.

### Defer (Low Signal)
7. **Geographic targeting** — US + Germany is sufficient to localize for. Don't add i18n yet.
8. **Time-zone optimization** — Only 3 days of data; too early to optimize content scheduling by timezone.
9. **API key monetization** — `api_keys` and `api_usage` tables exist but show zero usage. No pro API customers yet. Build the demand first via the free tier.

---

## Conclusion

The data tells a clear story: AgentRank has strong bot/crawler traction (a good proxy for authority and relevance) but is still in early human traffic stages. The two highest-ROI investments are **search quality** (top human use case) and **badge ecosystem** (generating high-intent maintainer traffic from GitHub PRs). Everything else can wait until human traffic reaches a baseline worth optimizing for.
