# Sponsored Listing Sales Pipeline — AgentRank

**Research date:** 2026-03-19
**Task:** AUT-303 — Build sponsored listing sales pipeline for $199–499/mo listings (Stripe checkout live per AUT-298)
**Methodology:** AgentRank DB query → commercial signal filtering → contact research → ranked by conversion likelihood
**Page view estimates:** Based on rank position and category traffic distribution (analytics not yet instrumented)

---

## Prospect Table (30 companies)

| # | Company | Tool (GitHub) | AR Score | AR Rank | Stars | Est. Monthly PVs | Contact | Pitch Angle |
|---|---------|--------------|----------|---------|-------|-----------------|---------|-------------|
| 1 | Qdrant | qdrant/mcp-server-qdrant | 58.46 | #672 | 1,285 | ~80/mo | qdrant.tech/contact-us | 4 DB competitors rank higher — fresh $50M Series B closes in March 2026 |
| 2 | Tavily AI | tavily-ai/tavily-mcp | 81.36 | #152 | 1,410 | ~200/mo | partnerships@tavily.com | MCP server is their #1 acquisition channel; Exa and SerpApi both rank in our index |
| 3 | Exa Labs | exa-labs/exa-mcp-server | 76.64 | #229 | 4,035 | ~130/mo | exa.ai/about | Tavily ranks #152 vs your #229 — NVIDIA-backed with fresh $85M Series B |
| 4 | Perplexity AI | perplexityai/modelcontextprotocol | 93.25 | #14 | 2,025 | ~2,000/mo | perplexity.ai/contact | Rank #14 globally — sponsored listing locks in visibility as competitors catch up |
| 5 | Manufact (mcp-use) | mcp-use/mcp-use | 94.20 | #11 | 9,450 | ~2,500/mo | founders@mcp-use.com | Rank #11, 9K stars, YC S25 — sponsoring the #1 MCP index owns your category |
| 6 | Stacklok | stacklok/toolhive | 91.31 | #27 | 1,658 | ~1,200/mo | hello@stacklok.com | MCP is your product — sponsored listing is in-category advertising on the top MCP index |
| 7 | MongoDB | mongodb-js/mongodb-mcp-server | 88.56 | #56 | 965 | ~500/mo | mongodb.com/developer | 3 vector DB competitors (Redis #53, Qdrant #672, Elastic #283) outpace you in our index |
| 8 | Grafana Labs | grafana/mcp-grafana | 67.36 | #398 | 2,575 | ~100/mo | grafana.com/about/contact | Pre-IPO DevRel investment; Prometheus MCP is gaining ground in your observability niche |
| 9 | Neo4j | neo4j-contrib/mcp-neo4j | 85.37 | #89 | 917 | ~450/mo | neo4j.com/developer | IPO-prep = max mindshare spend; graph DB is differentiated vs. Redis/MongoDB in our index |
| 10 | MotherDuck | motherduckdb/mcp-server-motherduck | 89.06 | #50 | 442 | ~600/mo | info@motherduck.com | Co-founder is ex-Neo4j DevRel — 38K PyPI downloads/mo deserves matching index visibility |
| 11 | Bright Data | brightdata/brightdata-mcp | 83.71 | #113 | 2,214 | ~280/mo | brightdata.com/contact | 2,214 stars but rank #113 — sponsored listing to dominate the web-data MCP category |
| 12 | Sentry | getsentry/sentry-mcp | 83.61 | #116 | 598 | ~260/mo | sentry.io/contact-sales | DevRel-led company; ranking visibility in AI agent tooling is on-brand for their dev GTM |
| 13 | Kagi Search | kagisearch/kagimcp | 83.75 | #112 | 325 | ~270/mo | vlad@kagi.com | 3 search competitors in our index (Tavily, Exa, SerpApi) — personal pitch to CEO Vladimir |
| 14 | 21st.dev | 21st-dev/magic-mcp | 59.97 | #591 | 4,469 | ~90/mo | @serafimcloud on X | 4th by stars globally but ranked #591 — clear gap a sponsored listing closes |
| 15 | SerpApi | serpapi/serpapi-mcp | 89.03 | #51 | 121 | ~580/mo | serpapi.com/faq | You sponsor OSS tools — "you're #51 despite 121 stars because your signals are strong; own it" |
| 16 | Snyk | snyk/agent-scan | 82.28 | #132 | 1,907 | ~230/mo | snyk.io/contact-us | Security MCP category has no named competitors yet — be first to own the ranking |
| 17 | Apollo GraphQL | apollographql/apollo-mcp-server | 85.70 | #85 | 272 | ~460/mo | apollographql.com/contact | GraphQL MCP is uncrowded in our index — early sponsorship = category ownership |
| 18 | Prefect (fastmcp) | PrefectHQ/fastmcp | 95.61 | #6 | 23,775 | ~4,500/mo | prefect.io/contact-us | Rank #6, 23K stars — lock in the top position before competitors use sponsored to displace you |
| 19 | Redis Ltd | redis/mcp-redis | 88.84 | #53 | 454 | ~570/mo | redis.io/partners | 43.9M PyPI downloads/mo; MongoDB, Qdrant, Elastic all visible in same category |
| 20 | Alpaca | alpacahq/alpaca-mcp-server | 78.87 | #186 | 551 | ~170/mo | alpaca.markets/about | Fresh $1.15B Series D; fintech trading MCP is a unique category — no competitors in index yet |
| 21 | Neon | neondatabase/mcp-server-neon | 78.58 | #195 | 564 | ~160/mo | neon.tech/contact | Serverless Postgres MCP in competitive data category (Snowflake #392, dbt #237, Motherduck #50) |
| 22 | Algolia | algolia/mcp-node | 44.18 | #5,210 | 82 | ~15/mo | partners.algolia.com | Ranked #5,210 while Elasticsearch is #283 and Exa is #229 — hardest pitch hook in our index |
| 23 | Elastic NV | elastic/mcp-server-elasticsearch | 73.27 | #283 | 625 | ~130/mo | elastic.co/partners | Public company DevRel budget; Redis #53 and MongoDB #56 both outrank you |
| 24 | Notion | makenotion/notion-mcp-server | 77.72 | #209 | 4,059 | ~150/mo | notion.so/about | 4K stars but rank #209 — official MCP with 200M+ users deserves top-category placement |
| 25 | Vercel | vercel/mcp-handler | 80.83 | #158 | 574 | ~190/mo | vercel.com/contact | Ecosystem sponsor by nature; developer discovery from AI builders choosing deployment platforms |
| 26 | LangChain (LangSmith) | langchain-ai/langsmith-mcp-server | 67.74 | #390 | 90 | ~100/mo | langchain.com/contact | LangSmith is their commercial product; observability MCP competes with Grafana and needs visibility |
| 27 | Snowflake | Snowflake-Labs/mcp | 67.71 | #392 | 256 | ~100/mo | snowflake.com/en/partners | 37.9M PyPI downloads but rank #392 — data signal vs. score gap is the pitch |
| 28 | dbt Labs | dbt-labs/dbt-mcp | 76.04 | #237 | 507 | ~140/mo | getdbt.com/community/partnerships | Strong data-team community culture; Snowflake and Neon competitors visible in same category |
| 29 | Cloudflare | cloudflare/mcp-server-cloudflare | 66.40 | #424 | 3,543 | ~90/mo | cloudflare.com/partners | 3.5K stars but rank #424 — Workers/AI ecosystem is growing and their MCP is underranked |
| 30 | DataForSEO | dataforseo/mcp-server-typescript | 80.68 | #159 | 159 | ~185/mo | dataforseo.com/contacts | Commercial SEO data API with no category competitors in index — own the data/SEO MCP niche |

---

## AgentRank Tool URLs

All tool pages follow: `https://agentrank-ai.com/tools/[owner]/[repo]`

| Tool | AgentRank URL |
|------|--------------|
| qdrant/mcp-server-qdrant | agentrank-ai.com/tools/qdrant/mcp-server-qdrant |
| tavily-ai/tavily-mcp | agentrank-ai.com/tools/tavily-ai/tavily-mcp |
| exa-labs/exa-mcp-server | agentrank-ai.com/tools/exa-labs/exa-mcp-server |
| perplexityai/modelcontextprotocol | agentrank-ai.com/tools/perplexityai/modelcontextprotocol |
| mcp-use/mcp-use | agentrank-ai.com/tools/mcp-use/mcp-use |
| stacklok/toolhive | agentrank-ai.com/tools/stacklok/toolhive |
| mongodb-js/mongodb-mcp-server | agentrank-ai.com/tools/mongodb-js/mongodb-mcp-server |
| grafana/mcp-grafana | agentrank-ai.com/tools/grafana/mcp-grafana |
| neo4j-contrib/mcp-neo4j | agentrank-ai.com/tools/neo4j-contrib/mcp-neo4j |
| motherduckdb/mcp-server-motherduck | agentrank-ai.com/tools/motherduckdb/mcp-server-motherduck |
| brightdata/brightdata-mcp | agentrank-ai.com/tools/brightdata/brightdata-mcp |
| getsentry/sentry-mcp | agentrank-ai.com/tools/getsentry/sentry-mcp |
| kagisearch/kagimcp | agentrank-ai.com/tools/kagisearch/kagimcp |
| 21st-dev/magic-mcp | agentrank-ai.com/tools/21st-dev/magic-mcp |
| serpapi/serpapi-mcp | agentrank-ai.com/tools/serpapi/serpapi-mcp |
| snyk/agent-scan | agentrank-ai.com/tools/snyk/agent-scan |
| apollographql/apollo-mcp-server | agentrank-ai.com/tools/apollographql/apollo-mcp-server |
| PrefectHQ/fastmcp | agentrank-ai.com/tools/PrefectHQ/fastmcp |
| redis/mcp-redis | agentrank-ai.com/tools/redis/mcp-redis |
| alpacahq/alpaca-mcp-server | agentrank-ai.com/tools/alpacahq/alpaca-mcp-server |
| neondatabase/mcp-server-neon | agentrank-ai.com/tools/neondatabase/mcp-server-neon |
| algolia/mcp-node | agentrank-ai.com/tools/algolia/mcp-node |
| elastic/mcp-server-elasticsearch | agentrank-ai.com/tools/elastic/mcp-server-elasticsearch |
| makenotion/notion-mcp-server | agentrank-ai.com/tools/makenotion/notion-mcp-server |
| vercel/mcp-handler | agentrank-ai.com/tools/vercel/mcp-handler |
| langchain-ai/langsmith-mcp-server | agentrank-ai.com/tools/langchain-ai/langsmith-mcp-server |
| Snowflake-Labs/mcp | agentrank-ai.com/tools/Snowflake-Labs/mcp |
| dbt-labs/dbt-mcp | agentrank-ai.com/tools/dbt-labs/dbt-mcp |
| cloudflare/mcp-server-cloudflare | agentrank-ai.com/tools/cloudflare/mcp-server-cloudflare |
| dataforseo/mcp-server-typescript | agentrank-ai.com/tools/dataforseo/mcp-server-typescript |

---

## Outreach Priority Order

**Tier 1 — Fastest close (VC-backed, MCP-native, DevRel culture):**

| Priority | Company | Contact | Price Point | Reason |
|----------|---------|---------|-------------|--------|
| 1 | **Qdrant** | qdrant.tech/contact-us | $499/mo | Fresh $50M Series B (March 2026) = maximum budget |
| 2 | **Tavily AI** | partnerships@tavily.com | $499/mo | MCP is their acquisition channel; $25M Series A |
| 3 | **Exa Labs** | exa.ai/about | $499/mo | NVIDIA-backed, $111M raised, developer-first |
| 4 | **Manufact** | founders@mcp-use.com | $399/mo | YC S25, MCP is their product |
| 5 | **Stacklok** | hello@stacklok.com | $399/mo | MCP management IS their product |
| 6 | **Perplexity AI** | perplexity.ai/contact | $499/mo | $1B+ valuation, rank #14, fast decisions |

**Tier 2 — Strong candidates (established companies, DevRel budgets):**

| Priority | Company | Contact | Price Point | Reason |
|----------|---------|---------|-------------|--------|
| 7 | **21st.dev** | @serafimcloud on X | $199/mo | Founder-led YC, fast decisions, star/rank gap |
| 8 | **Kagi Search** | vlad@kagi.com | $199/mo | Personal pitch to CEO, search competitors in index |
| 9 | **Grafana Labs** | grafana.com/about/contact | $499/mo | Pre-IPO DevRel budget |
| 10 | **MotherDuck** | info@motherduck.com | $399/mo | DevRel DNA (Ryan Boyd), $133M raised |
| 11 | **Bright Data** | brightdata.com/contact | $399/mo | 2,214 stars, commercial data API |
| 12 | **Sentry** | sentry.io/contact-sales | $299/mo | DevRel-led, security tooling GTM |

**Tier 3 — Follow-up wave (need internal champion):**

Apollo GraphQL, Snyk, Neon, MongoDB, Neo4j, SerpApi, Prefect, Redis, Alpaca, Notion, Cloudflare, DataForSEO

**Tier 4 — Enterprise process (longer cycle):**

Algolia, Elastic, Vercel, LangChain, Snowflake, dbt Labs

---

## Key Pitch Templates

### "Your competitor ranks higher"
Use for: Qdrant (#672 vs Redis #53), Exa (#229 vs Tavily #152), Algolia (#5,210 vs Elastic #283), Notion (#209 despite 4K stars)

> "We index every MCP tool on GitHub and rank them by real signals. Right now [Competitor X] ranks [N] spots ahead of you. A sponsored listing ensures your tool appears first in its category for developers making build-vs-buy decisions."

### "Lock in your position"
Use for: Manufact (#11), Stacklok (#27), Perplexity (#14), SerpApi (#51)

> "You're already in the top [N] on AgentRank. A sponsored listing locks that in — it's your category position in the index that every AI builder checks before choosing tools."

### "Fresh capital, developer reach"
Use for: Qdrant (Series B March 2026), Tavily (Series A Aug 2025), Alpaca (Series D Jan 2026), Exa (Series B Sep 2025)

> "You just closed [round]. The fastest way to turn that into developer mindshare is being visibly ranked on the index that AI builders check. $[X]/mo on AgentRank is DPO budget, not a marketing decision."

### "High downloads, underranked"
Use for: Snowflake (37.9M PyPI downloads, rank #392), MotherDuck (38K/mo, rank #50 but 442 stars), Notion (4K stars, rank #209)

> "Your tool has [X] downloads/month — more than most tools in your category. But your AgentRank position doesn't reflect that yet. A sponsored listing closes the gap between actual usage and discovered ranking."

---

## Page View Estimate Methodology

Estimates are based on rank position distribution and typical SaaS directory traffic patterns:
- Rank #1–10: ~2,000–5,000 monthly page views
- Rank #11–50: ~800–2,500 monthly page views
- Rank #51–100: ~300–600 monthly page views
- Rank #101–200: ~150–300 monthly page views
- Rank #201–500: ~80–200 monthly page views
- Rank #500+: ~30–100 monthly page views

*Note: These are estimates pending analytics instrumentation. As actual traffic data becomes available, update this table.*

---

*Researched by Market Researcher agent (AUT-303). Sources: AgentRank DB (agentrank.db), ranked.json, sponsored-listing-prospects.md (AUT-290). Builds on prior research from AUT-290 — 20 original prospects retained, 10 new additions: Perplexity AI, MongoDB, Bright Data, Sentry, Snyk, Apollo GraphQL, Neon, Notion, Cloudflare, DataForSEO.*
