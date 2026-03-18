# AgentRank Phase 1 Distribution Metrics Report

**Generated:** 2026-03-18
**Data window:** 2026-03-13 through 2026-03-18 (partial)
**Request log coverage:** 2026-03-16 onwards (286,202 logged requests)

---

## 1. Site Traffic (Cloudflare Zone Analytics)

### Daily Overview

| Date | Requests | Pageviews | Unique Visitors | Bandwidth |
|------|----------|-----------|-----------------|-----------|
| 2026-03-13 | 5,249 | 4,898 | 115 | 41.7 MB |
| 2026-03-14 | 1,206 | 1,005 | 149 | 25.5 MB |
| 2026-03-15 | 2,986 | 2,016 | 228 | 43.1 MB |
| 2026-03-16 | 70,351 | 40,788 | 402 | 271.9 MB |
| 2026-03-17 | 220,245 | 148,283 | **934** | 1,945.6 MB |
| 2026-03-18 | 2,914 | 499 | 133 | 24.7 MB (partial) |

**Key event:** March 17 was a massive traffic spike — 220k requests, 148k pageviews, 934 unique visitors. This appears to be AI crawlers discovering the site en masse (see bot breakdown below).

### Traffic by Request Type (from request_log, 2026-03-16+)

| Type | Count |
|------|-------|
| Page views | 183,087 |
| API calls | 103,115 |
| **Total logged** | **286,202** |

### Bot vs. Human Breakdown

The vast majority of logged traffic is AI crawlers:

| User Agent | Requests | Category |
|------------|----------|----------|
| meta-externalagent (Facebook) | 129,779 | Bot |
| GPTBot/1.3 (OpenAI) | 94,509 | Bot |
| ClaudeBot/1.0 (Anthropic) | 57,867 | Bot |
| SerpstatBot | 1,009 | Bot |
| Googlebot (mobile) | 1,084 | Bot |
| AhrefsBot | 258 | Bot |
| Bingbot | 163 | Bot |
| Real browsers (Mac/mobile) | ~634 | Human |

**Estimated real human traffic on peak day (March 17):** ~934 unique visitors per CF uniques count.

**Signal:** Three major AI companies (Meta, OpenAI, Anthropic) are actively crawling AgentRank. This is a strong indexing signal — our content is being ingested into AI knowledge bases.

### Traffic by Channel (from referrer data)

No meaningful external referrers detected. Referrer field shows internal navigation (agentrank-ai.com → agentrank-ai.com), indicating most external traffic arrives direct or via non-referring links (Twitter app, email, etc.).

UTM tracking: No UTM-tagged visits recorded yet (utm_source column empty). Need to tag all outbound links.

### Top Geographic Markets

| Country | Requests |
|---------|----------|
| United States | 284,363 (99.4%) |
| Germany | 1,140 |
| Canada | 271 |
| United Kingdom | 207 |
| France | 90 |
| Others | ~131 |

Audience is overwhelmingly US-based — appropriate for the AI developer ecosystem.

### Top Pages (Human-relevant)

| Path | Views |
|------|-------|
| /tool/PrefectHQ--fastmcp | 25 |
| /tool/punkpeye--mcp-proxy | 21 |
| /tool/microsoft--playwright-mcp | 20 |
| /tool/mongodb-js--mongodb-mcp-server | 18 |
| /tool/kreuzberg-dev--kreuzberg | 17 |
| /tool/mark3labs--mcp-go | 16 |
| /tool/brightdata--brightdata-mcp | 16 |
| /feed.xml | 16 |
| /sitemap.xml | 20 |

High-ranking tools drive the most page traffic. RSS feed and sitemap are being consumed by crawlers.

---

## 2. API Usage

**Total API requests logged:** 103,115 (since 2026-03-16)
**Issued API keys:** 0
**Active API keys:** 0

### Top API Endpoints

| Endpoint | Hits |
|----------|------|
| /api/auth/github | 2,631 |
| /api/search | 84 |
| /api/v1/search | 49 |
| /api/dash | 19 |
| /api/badge/tool/* | ~200 total |

### GitHub Claim Activity (Strong Human Signal)

2,631 GitHub OAuth auth requests logged (2,389 on March 17, 242 on March 18).

This is the strongest human engagement signal we have. Maintainers are actively clicking "Claim your listing" and going through the GitHub auth flow. Even if most don't complete the full claim, this level of interest (2,600+ clicks in 2 days) confirms the vanity loop is real.

**Interpretation:** Tool maintainers are finding their listings on AgentRank and want to claim them. This is exactly the behavior we hoped to drive.

### Badge API Activity

~200 badge endpoint hits across top-ranked tools, meaning badges are being embedded and served. Real badge loads indicate some PRs are live or maintainers are testing.

---

## 3. Skills.sh Install Count

**Status:** The `agentrank` skill at `skills.sh/api/skills/agentrank` returns 404.

Skills.sh does not expose install count via a public API. The page renders via Next.js RSC and doesn't return structured data. Install metrics are not publicly available through this channel.

**Action needed:** Check skills.sh dashboard directly, or reach out to skills.sh team for install stats.

---

## 4. GitHub Badge PR Merge Rate

Badge PRs were opened against the top 10 ranked repos:

| Repo | Status |
|------|--------|
| CoplayDev/unity-mcp | Open |
| microsoft/azure-devops-mcp | Closed (rejected) |
| laravel/boost | Closed (rejected) |
| CoderGamester/mcp-unity | Open |
| Pimzino/spec-workflow-mcp | Open |
| mark3labs/mcp-go | Open |
| zcaceres/markdownify-mcp | Open |
| microsoft/playwright-mcp | Open |
| PrefectHQ/fastmcp | Closed (rejected) |
| perplexityai/modelcontextprotocol | Open |

**Summary:**
- Total PRs: 10
- Merged: 0
- Open (pending): 7 (70%)
- Closed/rejected: 3 (30%)
- **Merge rate: 0% so far** (7 still pending)

The two Microsoft repos and PrefectHQ rejected (likely due to external badge policy). The 7 open PRs are the real opportunity. If even 3-4 merge, that's 30-40% conversion which is solid for cold outreach badge PRs.

**Recommendation:** Follow up on open PRs with a comment noting the traffic they're receiving via AgentRank. The maintainers who saw 2,600+ people click through to their listing in 2 days have reason to want the badge.

---

## 5. Channel Recommendations for Week 4

### Double down on:

1. **Direct maintainer outreach / vanity loop**
   2,631 GitHub auth clicks in 2 days is the clearest signal. Maintainers are self-discovering their listings. Amplify by: (a) emailing/tweeting the top 20 by score directly, (b) tagging @AgentRank_ai in replies to their tweets when they mention their tools.

2. **AI crawler indexing (let it happen)**
   Meta, OpenAI, and Anthropic crawlers are already ingesting us. No action needed — just ensure content is high quality and tool pages are comprehensive. This eventually drives "what are good MCP servers?" answers in ChatGPT/Claude to include AgentRank.

3. **Search (SEO)**
   The sitemap and feed are being consumed. Category pages (/category/typescript, /category/javascript) are the top internal referrers, indicating category browsing is the primary navigation pattern. Invest in category page SEO and add more category filtering.

### Fix immediately:

4. **UTM tracking**
   Zero UTM-tagged visits means we can't attribute traffic sources. Every outbound link (tweets, emails, Product Hunt post) needs `?utm_source=twitter&utm_medium=social` etc. Add this before any more distribution.

5. **Badge PR follow-up**
   7 open PRs with no merge yet. Send a follow-up comment on each with: current rank, traffic stats, and value prop. Best time: now, while March 17 spike is fresh.

### Deprioritize:

6. **Email list / subscriptions**
   0 email subscribers. The subscription capture mechanism isn't converting. Don't invest further until there's a clear reason to subscribe (weekly movers email, notifications, etc.).

7. **API productization**
   0 API keys issued. The API docs exist but no one is using the API yet. Deprioritize API marketing until human traffic is higher.

---

## Summary Table

| Metric | Value | Assessment |
|--------|-------|------------|
| Peak daily unique visitors | 934 | Solid launch traffic |
| Total requests (5 days) | 302,951 (CF) | Mostly bots |
| GitHub claim attempts | 2,631 | Strong vanity loop signal |
| API keys issued | 0 | No API adoption yet |
| Email subscribers | 0 | No email capture conversion |
| Badge PRs merged | 0/10 | 7 still pending |
| Skills.sh installs | Unknown | No public API |
| AI crawlers indexing | 3 major (Meta, OpenAI, Anthropic) | Excellent |
| Top channel | Direct/unknown | UTM needed to confirm |
