# AgentRank API Pricing Research
_Compiled: 2026-03-18 | Task: AUT-127_

This document informs Phase 2 monetization decisions for the AgentRank Pro API ($49–199/mo range). It covers 12 comparable developer tool APIs, MCP-specific commercial offerings, and a recommended 3-tier pricing model.

---

## Part 1: Competitive Pricing Landscape

### 1. Snyk (Security Scanning API)

| Tier | Price | API Access | Rate Limit |
|------|-------|-----------|------------|
| Free | $0 | None | — |
| Team | $25/dev/mo | None | — |
| Enterprise | Custom (negotiated) | Yes — REST API | 1,620 req/min |

**Notes:** API access is enterprise-gated. REST API limit of 1,620 req/min is generous but requires a large contract. Free/Team buyers have no API access at all — this creates a hard paywall.

**Lesson for AgentRank:** Don't hide API entirely behind enterprise pricing. The $49–199 range lets developers access data programmatically, which Snyk's approach forfeits at lower tiers.

---

### 2. SonarCloud (Code Quality API)

| Tier | Price | LOC Limit | API Access |
|------|-------|-----------|------------|
| Free | $0 | 50K LOC, 5 users | Limited |
| Team | €30+/mo | 100K–1.9M LOC | Yes |
| Enterprise | Annual only | Custom | Yes + SLA |

**Notes:** Pricing is per lines-of-code analyzed, not per API call. Enterprise adds commercial support and SLA. No documented public rate limits.

**Lesson for AgentRank:** LOC-gating doesn't translate, but the pattern of tiering on usage volume (not seats) is good. AgentRank should gate on API call volume.

---

### 3. Libraries.io (Package Dependency Data)

| Tier | Price | Rate Limit |
|------|-------|------------|
| Free | $0 | 60 req/min |
| Enterprise | Via Tidelift (custom) | Custom |

**Notes:** Libraries.io is essentially free public data with no official paid developer tier — the monetization is through Tidelift enterprise contracts for bulk data access. For the ecosystem AgentRank operates in, this is effectively a competitor offering free data.

**Lesson for AgentRank:** We can't compete on "free ecosystem data." Differentiation must be the _ranking score_ (value-added analysis) + freshness + MCP-specific coverage, not raw data access.

---

### 4. GitHub API (Dependency Graph)

| Access Level | Price | Rate Limit |
|-------------|-------|------------|
| Authenticated (any plan) | $0 | 5,000 req/hr |
| GitHub Apps (org install) | Included in GH plan | Up to 12,500 req/hr |
| Enterprise Cloud | $21+/user/mo | 15,000 req/hr |

**Notes:** The dependency graph itself (dependents data) is free and public-facing. GitHub does not sell API access as a separate product — rate limits scale with account type. No paid "raw API" tier exists.

**Lesson for AgentRank:** The underlying data (GitHub API calls) is free for us to collect. This confirms our cost structure: the value isn't raw GitHub data, it's the scored/ranked synthesis layer on top.

---

### 5. Algolia (Search API)

| Tier | Price | Searches/mo | Additional Cost |
|------|-------|-------------|----------------|
| Build | $0 | 10,000 | — |
| Grow | Usage-based | Pay-as-you-go | $0.50/1K searches |
| Grow Plus | Usage-based | Pay-as-you-go | $0.75/1K searches |
| Elevate | Enterprise (~$50K/yr+) | Custom | Custom |

**Notes:** Algolia gates on query volume + record count. No rate limits in the traditional RPM sense — it's a consumption model. Grow Plus adds AI search capabilities.

**Lesson for AgentRank:** Usage-based works when usage is easy to measure and varies widely across customers. For AgentRank, API calls per month is the right unit — predictable for customers, fair at scale.

---

### 6. Sentry (Error Monitoring API)

| Tier | Price/mo | Error Events | Unique Value |
|------|----------|-------------|--------------|
| Developer | $0 | 5K errors | Individual use |
| Team | $26 | 50K errors | Unlimited members/projects |
| Business | $80 | 50K errors | Advanced analytics |
| Enterprise | Custom | Custom | SLA, custom retention |

**Notes:** Sentry charges per event processed, not per seat. Overage pricing at $0.000290/event (Team tier). All paid tiers include unlimited team members — pricing is entirely usage-based.

**Lesson for AgentRank:** The jump from $0 → $26 → $80 → custom is a classic SaaS ladder. The $49–99–199 range targets roughly the same developer-to-team-to-business progression.

---

### 7. Ahrefs (SEO Data API)

| Tier | Price/mo | API Units | Notes |
|------|----------|-----------|-------|
| Lite | $129 | None | No API |
| Standard | $249 | 150K units/mo | Basic API |
| Advanced | $449 | 750K units/mo | Full API |
| Enterprise | $1,499 | Custom | API + custom |
| API Standalone | $500+ | Add-on | API-only tier |

**Notes:** SEMrush requires Business ($499.95/mo) as the baseline for any API access, then charges separately for API units ($20–$250 per 1M units). Ahrefs is more API-friendly. Both demonstrate that specialized data APIs at the B2B scale command $250–500+ minimum.

**Lesson for AgentRank:** We're not in the $250–500 enterprise data market — that's mature data with proven ROI. At launch, $49–199 targets hobbyists, indie devs, and small teams who want to embed AgentRank scores in their tools or workflows. Position as developer-friendly, not enterprise data.

---

### 8. Socket.dev (Supply Chain Security API)

| Tier | Price | Scope |
|------|-------|-------|
| Free | $0 | Open source projects forever |
| Team | Paid | Growing teams, reachability analysis |
| Enterprise | Volume-based | Enterprise compliance, no sales call required |

**Notes:** Socket gates entirely on repo type (open source = free). Team/Enterprise pricing not published publicly — you sign up and see. Interesting that they explicitly say "no sales call required" for Enterprise, removing friction.

**Lesson for AgentRank:** Clear free tier for open-source/individual use. But unlike Socket, AgentRank's data is inherently public, so "free for open source" doesn't map the same way. Our free tier should be the web UI — API access is the monetization layer.

---

### 9. X (Twitter) API

| Tier | Price/mo | Use Case |
|------|----------|---------|
| Free | $0 | Dev testing only, very low limits |
| Basic | $200 | Real projects, moderate volume |
| Pro | $5,000 | High-volume applications |
| Enterprise | $42,000+ | Firehose access |

**Notes:** In Feb 2026, X shifted to pay-as-you-go alongside fixed tiers. The jump from $200 to $5,000 is massive — a gap that third-party data providers exploit with $49–499 alternatives.

**Lesson for AgentRank:** The wide gap between tiers creates market opportunity for intermediaries. AgentRank's $49–199 ladder is deliberately tight to keep developers moving up rather than hitting a painful wall.

---

### 10. Cloudflare Workers (Infrastructure API)

| Tier | Price/mo | Requests | CPU |
|------|----------|----------|-----|
| Free | $0 | 100K req/day | 10ms/request |
| Paid | $5 min charge | 10M req/mo included | 30ms/request |
| Additional | Usage-based | $0.30/1M beyond | — |

**Notes:** Cloudflare's pricing is very developer-friendly ($5 entry). The key pattern: very low floor, then usage-based scaling. Not directly comparable to data APIs but relevant as infrastructure comp.

---

### 11. OSS Insight & deps.dev (Ecosystem Analytics)

Both are **free, Google/PingCAP-backed public tools**:
- OSS Insight API (beta): Free, query GitHub event data
- deps.dev API: Free, dependency graph for npm/PyPI/Go/etc.
- Rate limits: ~60 req/min (OSS Insight), more generous on deps.dev

**Notes:** These are the most direct functional comparables to AgentRank's core data. They're free because they're backed by corporate funding, not commercial products. This is the "free incumbent" problem.

**Lesson for AgentRank:** We differentiate by: (1) MCP/agent-specific focus rather than general OSS, (2) opinionated scoring rather than raw data, (3) freshness and daily ranking updates, (4) integrated discovery (not just raw API).

---

### 12. Composio (MCP Tool Integration Platform)

| Feature | Availability | Pricing |
|---------|-------------|---------|
| 250+ MCP tool integrations | Cloud hosted | Usage-based (undisclosed) |
| Open source self-host | Free | $0 |
| Enterprise | Custom SLA | Custom |

**Notes:** Composio is in the adjacent space of MCP tool orchestration, not ranking/discovery. Their commercial model is usage-based cloud hosting. No public price sheet. Relevant as a signal that companies are beginning to monetize MCP-layer tooling.

---

## Part 2: MCP-Specific Commercial Offerings

The MCP commercial landscape is early-stage. Key observations:

| Platform | Model | Commercial Status |
|----------|-------|------------------|
| Smithery | Freemium (browse free, host paid) | Active |
| Glama | Freemium (browse free, hosting/management tiers) | Active |
| Composio MCP | Usage-based cloud gateway | Commercial |
| MCP Billing Spec | Per-call billing open standard (Stripe Connect) | Draft/emerging |
| Official Anthropic Registry | Free submission | Non-commercial |

**Key finding:** There is **no dominant paid API for MCP tool discovery/ranking data** as of March 2026. All major registries (Smithery, Glama, official) provide browsing and search for free. The data layer is uncommoditized. This is AgentRank's window.

**Commercial MCP precedents that exist:**
- Hosting MCP servers (Smithery/Glama host for a fee)
- Integration middleware (Composio aggregates tools for a fee)
- Per-call billing (MCP Billing Spec enables MCP servers to charge per tool invocation)

**What doesn't exist yet:** A paid API for ranked/scored MCP tool discovery data. This is the gap AgentRank fills.

---

## Part 3: Rate Limit Benchmarking

Across the 12 tools researched, here's how rate limits map to pricing tiers:

| Tier Category | Typical Price | Typical Rate Limit |
|--------------|---------------|-------------------|
| Free / Hobby | $0 | 60–1,000 req/hr |
| Starter | $25–50/mo | 1,000–5,000 req/hr |
| Pro | $99–199/mo | 5,000–15,000 req/hr |
| Enterprise | $499+/mo | 15,000–60,000 req/hr (or custom) |

---

## Part 4: What AgentRank API Features Justify Paid Tiers

### Core API Endpoints (available across all tiers, gated by volume)
- `GET /api/v1/tools` — ranked tool list with filters
- `GET /api/v1/tools/:id` — individual tool detail + score breakdown
- `GET /api/v1/tools/search?q=` — keyword search
- `GET /api/v1/categories` — category rankings
- `GET /api/v1/skills` — skill rankings

### Features That Justify Higher Tiers

| Feature | Justification | Tier |
|---------|--------------|------|
| Higher rate limits | Core utility for any API consumer | All paid |
| Historical score data | Shows trajectory, not just current rank | Pro+ |
| Batch endpoints (up to 100 tools/request) | Efficiency for bulk integrations | Pro+ |
| Webhook notifications (score changes) | Proactive alerting for tool maintainers | Pro+ |
| Trend reports (movers/fallers) | Decision-making for tool evaluators | Pro+ |
| Dependency graph queries | Shows which tools depend on what | Team+ |
| Custom score filters | Apply custom weights to ranking signals | Team+ |
| White-label badge API | For embedding in README/docs | Team+ |
| SLA guarantee | Required by commercial users | Team+ |
| Dedicated support | Trust signal for enterprise buyers | Team+ |

---

## Part 5: Recommended Pricing Tiers

Based on competitive landscape, typical developer tool pricing ladders, and AgentRank's cost structure:

### Tier 1: Starter — $49/mo (annual: $39/mo)

**Who it's for:** Individual developers, hobbyists, side projects, tool maintainers checking their own scores.

| Dimension | Limit |
|-----------|-------|
| API calls/month | 10,000 |
| Rate limit | 60 req/min |
| Historical data | 30 days |
| Batch endpoint | No |
| Webhooks | No |
| SLA | None |
| Support | Email (best effort) |

**Differentiates from free (web UI) by:** Programmatic access, API key auth, JSON responses, basic analytics dashboard showing your usage.

**Rationale:** $49 is below the psychological $50 barrier. It's lower than Sentry Team ($26 gets 50K error events, but error monitoring has proven ROI — our API is newer). Comparable to GitHub Pro ($4/mo) but for data API access, not code hosting. The 10K/month cap (~333 calls/day) is sufficient for a small integration or personal tool.

---

### Tier 2: Pro — $99/mo (annual: $79/mo)

**Who it's for:** Teams building AI assistants, IDE plugins, or developer dashboards that surface tool recommendations. Founders evaluating tool stacks.

| Dimension | Limit |
|-----------|-------|
| API calls/month | 50,000 |
| Rate limit | 300 req/min |
| Historical data | 90 days |
| Batch endpoint | Yes (up to 50 tools/request) |
| Webhooks | Yes (up to 5 endpoints) |
| Trend data | Weekly movers/fallers |
| SLA | 99% uptime |
| Support | Email (24h response) |

**Differentiates from Starter by:** 5x volume, 5x rate limit, historical trends, batch efficiency, webhooks for automation.

**Rationale:** $99/mo is the classic "Pro" price point in developer tooling. Matches Sentry Business tier ($80), sits below Sourcegraph's enterprise pricing, and aligns with the general $99 SaaS benchmark for professional developer tools. The 50K/month cap (~1,667/day) covers most team use cases without hitting the enterprise threshold.

---

### Tier 3: Team — $199/mo (annual: $159/mo)

**Who it's for:** Companies building agent orchestration platforms, MCP tool vendors wanting ranking intelligence, teams with compliance or SLA requirements.

| Dimension | Limit |
|-----------|-------|
| API calls/month | 250,000 |
| Rate limit | 600 req/min |
| Historical data | 365 days |
| Batch endpoint | Yes (up to 100 tools/request) |
| Webhooks | Yes (up to 25 endpoints) |
| Trend data | Daily movers/fallers |
| Dependency graph | Yes |
| Custom score filters | Yes |
| White-label badge API | Yes |
| SLA | 99.9% uptime |
| Support | Priority email + Slack (4h response) |

**Differentiates from Pro by:** Full history, dependency data, custom weights, badge embedding, priority support, significantly higher rate limit.

**Rationale:** $199/mo is the ceiling of the $49–199 range specified in the plan. Comparable to Algolia's Grow Plus range and below Ahrefs Standard ($249). The 250K/month cap (~8,300/day) handles high-volume integrations. The dependency graph and badge API are features that tool vendors specifically need — this tier targets the supply side (tool makers) rather than just the demand side (tool evaluators).

---

## Summary Recommendation Table

| Tier | Price/mo | API Calls/mo | Rate Limit | Key Unlock |
|------|----------|-------------|------------|-----------|
| Free | $0 | Web UI only | None | Dashboard browsing |
| Starter | $49 | 10,000 | 60 req/min | API access, JSON |
| Pro | $99 | 50,000 | 300 req/min | Historical data, webhooks |
| Team | $199 | 250,000 | 600 req/min | Dependency graph, badges, SLA |
| Enterprise | Custom | Custom | Custom | Custom weights, dedicated support |

---

## Appendix: Sources Referenced

- Snyk pricing: https://snyk.io/plans/
- SonarCloud pricing: https://www.sonarsource.com/plans-and-pricing/
- Libraries.io API docs: https://libraries.io/api
- GitHub API rate limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Algolia pricing: https://www.algolia.com/pricing
- Sentry pricing: https://sentry.io/pricing/
- Ahrefs API pricing: https://seobotai.com/blog/ahrefs-api-alternatives/
- SEMrush pricing: https://backlinko.com/semrush-pricing
- Socket.dev pricing: https://socket.dev/pricing
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- X API pricing: https://www.wearefounders.uk/the-x-api-price-hike-a-blow-to-indie-hackers/
- OSS Insight API: https://ossinsight.io/docs/api/
- deps.dev API: https://docs.deps.dev/api/
- Composio MCP: https://mcp.composio.dev/
- Glama MCP: https://glama.ai/mcp/servers
- Developer tool pricing feature gating: https://www.getmonetizely.com/articles/technical-feature-gating-and-code-quality-tool-pricing-how-to-structure-developer-tool-tiers-for-saas-growth
