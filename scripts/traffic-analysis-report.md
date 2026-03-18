# AgentRank Traffic Analysis: Top Pages & Content Gaps

**Generated:** 2026-03-18
**Data sources:** Cloudflare Analytics GraphQL API, D1 request_log (286K+ logged requests), Cloudflare zone stats
**Scope:** March 13–18, 2026 (5 days, peak on March 17)

---

## Methodology: Isolating Human Traffic

Bot traffic dominates raw metrics. To isolate real human visitors, all analysis below excludes these user agents from request_log and CF GraphQL results:

- AI crawlers: GPTBot/1.3 (OpenAI), ClaudeBot/1.0 (Anthropic), meta-externalagent (Facebook)
- Search bots: Googlebot, Bingbot, AhrefsBot, SerpstatBot, YandexBot
- Infrastructure: HeadlessChrome, nginx-ssl, zgrab, masscan, curl, wget
- WordPress scanners: any path containing `/wp-admin/setup-config.php`

**Human signal baseline:** ~634 unique human visitors over 5 days per CF uniques count (bot-adjusted estimate). D1 request_log records 1,741 human page requests since logging began March 16.

---

## 1. Top 10 Most-Visited Pages by Real Human Traffic

Combining D1 request_log data (human-filtered) with CF GraphQL, deduping canonical and trailing-slash variants:

| Rank | Page | Human Views | Category |
|------|------|-------------|----------|
| 1 | /tool/PrefectHQ--fastmcp | 28 | MCP Framework (Python) |
| 2 | /tool/punkpeye--mcp-proxy | 18 | MCP Proxy/Infrastructure |
| 3 | /tool/mcp-use--mcp-use | 14 | MCP Framework (multi) |
| 4 | /tool/laravel--boost | 13 | Dev Environment (PHP) |
| 5 | /tool/microsoft--playwright-mcp | 10 | Browser Automation |
| 6 | /tool/mongodb-js--mongodb-mcp-server | 9 | Database |
| 7 | /tool/mark3labs--mcp-go | 9 | MCP Framework (Go) |
| 8 | /tool/brightdata--brightdata-mcp | 9 | Web Scraping |
| 9 | /tool/bytebase--dbhub | 7 | Database |
| 10 | /tool/kreuzberg-dev--kreuzberg | 7 | Document Processing |

**Also in top 20 (human):**
- /tool/rust-mcp-stack--rust-mcp-sdk (7) — MCP Framework (Rust)
- /tool/tavily-ai--tavily-mcp (7) — Web Search/Scraping
- /tool/TanStack--cli (7) — Dev Tooling
- /tool/Flux159--mcp-server-kubernetes (6) — DevOps/Infra
- /tool/NVIDIA--NeMo-Agent-Toolkit (6) — AI/ML Agents
- /tool/getsentry--XcodeBuildMCP (6) — IDE/Dev (iOS/macOS)
- /tool/CoplayDev--unity-mcp (4) — Game Development

**Homepage:** ~98 human requests on March 17 (CF GraphQL, Chrome-filtered)

**Skills pages (strong human signal from D1):**
- /skill/microsoft--github-copilot-for-azure--entra-app-registration/ — 11 views
- /skill/glama-samefarrar--mcp-ankiconnect/ — 11 views
- /skill/microsoft--azure-skills--entra-app-registration/ — 10 views
- /skill/github--awesome-copilot--memory-merger/ — 5 views

**Key insight:** Skills pages are drawing significant human traffic despite being a newer addition to the index. Microsoft-sourced skills are over-represented — likely because Microsoft maintainers are finding them through GitHub.

---

## 2. Tool Category Pageview Breakdown

Manual categorization of top 20 human-accessed tools:

| Category | Human Views | % of Tool Traffic | Top Tool |
|----------|-------------|-------------------|----------|
| MCP Frameworks/SDKs | ~79 | 38% | fastmcp (Python) |
| Web Scraping/Browser | ~26 | 13% | playwright-mcp |
| Dev Environment/IDE | ~22 | 11% | laravel/boost |
| MCP Proxy/Infrastructure | ~18 | 9% | mcp-proxy |
| Database | ~16 | 8% | mongodb-mcp-server |
| DevOps/Cloud/K8s | ~12 | 6% | mcp-server-kubernetes |
| Document Processing | ~7 | 3% | kreuzberg |
| AI/ML Agents | ~6 | 3% | NeMo-Agent-Toolkit |
| Game Development | ~4 | 2% | unity-mcp |
| Blockchain/Finance | ~4 | 2% | evm-mcp-tools |
| Other | ~14 | 7% | — |

**Dominant pattern:** Developers building MCP infrastructure (frameworks, SDKs, proxies) drive the most traffic — ~47% of tool views. These are builders, not tool consumers. This is the highest-value audience: if you're building an MCP server, you're a future AgentRank stakeholder.

---

## 3. Referral Sources Breakdown

**D1 data (human page visits since March 16):**

| Source | Visits | % | Notes |
|--------|--------|---|-------|
| Direct / no referrer | 1,631 | 99.4% | Twitter app, email, bookmarks — all appear as direct |
| GitHub (badge PRs) | 3 | 0.2% | Clicks from 3 open badge PRs in PR comment sections |
| Internal navigation | ~7 | 0.4% | /submit/, /tools/, homepage |

**Zero UTM-tagged traffic recorded.** UTM tags deployed (AUT-150) but no tagged links have generated clicks yet. Badge PRs haven't merged; newsletter hasn't sent.

**Attribution reality:** The March 17 spike of 934 unique visitors (CF count) arrived entirely without attribution. Most likely sources based on timing and context:
1. **Twitter** — @comforteagle tweet about AgentRank went out mid-week; Twitter app traffic shows as direct
2. **Hacker News** — Site structure and US-dominated traffic pattern consistent with HN referral (HN doesn't pass referrer)
3. **GitHub** — Badge PRs opened to 40+ repos; maintainers clicking through to their listing show as direct

**Actionable gap:** We cannot attribute the biggest traffic event in site history. UTM-tagged links need to be distributed NOW on next tweet/post.

---

## 4. Content Gap Analysis

### What AgentRank Has

Existing blog posts cover these topics:
- Best MCP servers by category: AI/ML, code generation, communication, database, devops, productivity, security, web browser
- How-to guides: how to build an MCP server, how to choose an MCP server
- Industry comparisons: MCP directory comparison, MCP vs REST API, top 10 MCP server comparison
- News/state of market: State of MCP 2026, Q1 2026 landscape, weekly recap (Mar 17)

### Competitor Coverage Gaps

Reviewing what competitors (Glama.ai, PulseMCP, Smithery, MCPMarket.com) cover that AgentRank does not:

**High-traffic keywords with zero AgentRank content:**

| Keyword / Topic | Competitor Ranking | Traffic Potential | AgentRank Coverage |
|-----------------|-------------------|-------------------|-------------------|
| "mcp proxy" / "mcp transport" | None dominating | Medium | None — despite mcp-proxy being our #2 most-visited tool |
| "python mcp server tutorial" / "fastmcp tutorial" | None dominating | High | None — fastmcp is our #1 most-visited tool |
| "mcp sdk comparison" (Python vs Go vs TypeScript vs Rust) | None dominating | High | None |
| "best mcp servers for game development" / "unity mcp" | None dominating | Medium | None — unity-mcp in top 20 traffic |
| "mcp for ios/xcode" / "xcode mcp" | None dominating | Medium | None |
| "mcp server php" / "laravel mcp" | None dominating | Medium | None — laravel/boost in top 10 |
| "kubernetes mcp" / "k8s mcp server" | None dominating | Medium | None |
| "mcp weekly" / "mcp news" | PulseMCP newsletter | High | "This Week in MCP" post exists but no recurring series |
| "what is mcp" / "model context protocol explained" | Mixed (Anthropic docs, various) | Very High | No beginner-oriented explainer |
| "mcp server list" / "all mcp servers" | Glama, PulseMCP | Very High | Tools page exists but not SEO-optimized for this query |

### Missed Category Pages

AgentRank has `/category/` pages but none for these high-traffic tool types:
- `/category/frameworks` or `/category/sdks` — 38% of human tool traffic
- `/category/proxy` — significant traffic (mcp-proxy alone = 18 human views)
- `/category/game-dev` or `/category/unity`
- `/category/ios` or `/category/xcode`
- `/category/kubernetes` or `/category/devops` (devops blog exists but no /category/ page)

---

## 5. Blog Post Recommendations (Ranked by Expected Traffic Impact)

### #1 — "Best Python Libraries for Building MCP Servers"
**Estimated impact: Very High**

fastmcp is the #1 most-visited tool on AgentRank. Developers building Python MCP servers are already finding us. A post comparing fastmcp, the official Python MCP SDK, and alternatives would:
- Capture "python mcp server" and "fastmcp tutorial" queries (no current competitor dominates these)
- Directly serve our highest-traffic audience segment (MCP framework builders)
- Natural internal linking to fastmcp tool page, mcp-use, and any Python-native tools

**Target keywords:** "python mcp server", "fastmcp", "best python mcp library", "build mcp server python"
**Content format:** Comparison table + code snippets + recommendation by use case

---

### #2 — "MCP SDK Comparison: Python vs TypeScript vs Go vs Rust"
**Estimated impact: High**

SDK/framework tools make up 38% of human tool traffic. Developers choose a language first, then a framework. This post directly serves that decision:
- Covers our 4 most-visited SDK tools in one article: fastmcp (Python), mcp-go (Go), rust-mcp-sdk (Rust), mcp-use (multi)
- High organic search potential — no competitor has written this definitive comparison
- Positions AgentRank as the authoritative technical resource, not just a directory

**Target keywords:** "mcp sdk comparison", "mcp server typescript vs python", "best language for mcp server"
**Content format:** Feature matrix, performance considerations, when-to-use-each section

---

### #3 — "What is an MCP Proxy? When You Need One and How to Choose"
**Estimated impact: High**

mcp-proxy is our #2 most-visited tool (18 views), but we have zero educational content about what an MCP proxy is or when you'd need one. This is a fundamentally confusing concept for developers new to the MCP ecosystem:
- MCP proxy enables HTTP/SSE transport for stdio-based servers — not obvious to newcomers
- "mcp proxy" has no dominant educational result
- Serves the maintainer of mcp-proxy (punkpeye) who is already engaged — potential for linking back

**Target keywords:** "mcp proxy", "mcp transport", "stdio vs http mcp", "mcp server remote access"
**Content format:** Explainer + architecture diagram (Excalidraw) + punkpeye/mcp-proxy recommendation

---

### #4 — "Best MCP Servers for Game Development (Unity, Unreal, Godot)"
**Estimated impact: Medium**

unity-mcp is in top 20 human traffic, and game dev is an underserved niche in MCP content. Glama and PulseMCP don't have category pages for this. Our badge PR to CoplayDev/unity-mcp is still open — merging it sends game dev maintainers to this page.
- Zero competition for "unity mcp server" queries
- Niche but highly engaged audience (game devs who use AI assistants actively seek tools)
- Covers Xcode/iOS (XcodeBuildMCP) in same article or companion piece

**Target keywords:** "unity mcp", "mcp server game development", "xcode mcp", "ios mcp server"
**Content format:** Category roundup with embedded tool cards

---

### #5 — "MCP Servers for Kubernetes and Cloud Infrastructure"
**Estimated impact: Medium**

mcp-server-kubernetes is in top 20 human traffic (6 views), and DevOps engineers represent a valuable, purchasing-power-rich audience. Our devops blog post exists but doesn't specifically target Kubernetes/cloud-native operators:
- "kubernetes mcp" has low competition from MCP-specific sites
- DevOps audience overlaps heavily with enterprise (sponsored listing opportunity)
- Natural tie-in to our existing devops blog post + devops category page

**Target keywords:** "kubernetes mcp server", "mcp for devops", "k8s mcp", "cloud infrastructure mcp"
**Content format:** Listicle (5-7 tools) with installation instructions per tool

---

## 6. Geographic Breakdown of Human Visitors

**Source:** D1 request_log (human-filtered, 1,741 page views since March 16)

| Country | Human Page Views | % | Notes |
|---------|-----------------|---|-------|
| United States | 1,304 | 74.9% | Primary market, on target |
| Germany | 109 | 6.3% | Strong EU engineering presence |
| Canada | 109 | 6.3% | Expected for AI dev community |
| France | 33 | 1.9% | Smaller but notable |
| Netherlands | 13 | 0.7% | Tech hub, consistent with AI devs |
| Korea | 11 | 0.6% | — |
| India | 11 | 0.6% | Growing AI dev market |
| Switzerland | 8 | 0.5% | — |
| Brazil | 8 | 0.5% | — |
| Belgium | 7 | 0.4% | — |
| Sweden | 6 | 0.3% | — |
| Singapore | 5 | 0.3% | APAC AI hub |
| Japan | 5 | 0.3% | — |
| Others | ~107 | 6.1% | 15+ countries |

**Cloudflare Analytics (March 17 peak day — all traffic including bots):**

| Country | Requests |
|---------|----------|
| United States | 284,363 (99.4%) |
| Germany | 1,140 (0.4%) |
| Canada | 271 (0.09%) |
| United Kingdom | 207 (0.07%) |
| France | 90 (0.03%) |

**Note:** The CF spike data is dominated by the Meta/OpenAI/Anthropic bot crawl from US-based infrastructure. D1 country data (human-only filter) is more meaningful. The US-skew in D1 is real: 75% of human visitors are US-based, consistent with the AI developer audience.

**Implications for content:**
- No need for localization or non-English content yet
- EU market (Germany + France + Netherlands = ~9%) is meaningful — EU-specific compliance content (GDPR, EU AI Act) could attract this segment
- Canada and India will grow as AI dev communities mature

---

## 4b. Competitor Content Landscape (Live Research)

### Who Actually Ranks for MCP Queries

The MCP directories do NOT dominate editorial SEO. Third-party developer tools blogs own the "best X for Y" SERPs:

| Query | Top-ranking Sites |
|-------|------------------|
| "best MCP servers for database" | builder.io, firecrawl.dev, fastmcp.me, dbvis.com |
| "best MCP servers for coding" | builder.io, firecrawl.dev, n8n.io, bannerbear.com |
| "MCP server tutorial" | modelcontextprotocol.io, towardsdatascience.com, Microsoft .NET blog |
| "model context protocol guide" | modelcontextprotocol.io, Wikipedia, buildmvpfast.com |
| "MCP server comparison" | mcpservers.org, mcpmarket.com, k2view.com, Docker blog |
| "best MCP servers web scraping" | mcpservers.org, aimultiple.com, proxyway.com, brightdata.com |

**Key insight:** Glama, PulseMCP, and Smithery are not yet ranking meaningfully for editorial queries. The category is wide open for any directory that publishes quality blog content. AgentRank's blog strategy (listicle format, `/blog/best-mcp-servers-[category]` URLs) is exactly right — we just need more posts and inbound links.

### Competitor Content Strategies

- **Glama** — Most content-heavy. Deep technical posts (AWS Lambda deploy, Docker/MongoDB, MCP Inspector), enterprise topics (zero-trust, Kubernetes operators, gateway), vertical case studies (Shopify, Bloomberg). Also publishes opinion pieces to build broader audience. URL pattern: `/blog/YYYY-MM-DD-slug`.
- **PulseMCP** — Weekly cadence newsletter + architecture guides. Has unique `/statistics` page with MCP download estimates. Has `/use-cases` section. Strong timeliness signal.
- **Smithery** — Thin blog (2-3 posts). Differentiated via `/skills` section — not a content competitor.
- **MCPMarket** — No blog. Runs pure category landing pages (`/categories/web-scraping-data-collection`) and a GitHub-stars leaderboard. Direct competitor to AgentRank's leaderboard.

### 5 Content Gaps Confirmed by Competitor Research

Combining D1 traffic data (Section 1-3 above) with live SERP analysis:

| Gap | SERP Status | Traffic Signal | AgentRank Coverage |
|-----|-------------|---------------|-------------------|
| **MCP server setup / install guide** (Claude Desktop, Cursor) | No clear winner (Clockwise, generect.com) | Very High | **None** — biggest missing piece |
| **Best MCP for finance / payments / e-commerce** | mintmcp.com, mcpserverfinder.com | High | **None** |
| **Best MCP for web scraping / data extraction** | proxyway.com, aimultiple.com | High | `/best-mcp-servers-web-browser` (different intent) |
| **MCP vs A2A / MCP vs LangChain comparison** | Glama owns this; others open | Medium-High | `/mcp-server-vs-rest-api` only |
| **MCP enterprise security / deployment** | Glama is investing here | Medium (growing) | `/best-mcp-servers-security` (listicle only) |

Plus from traffic data (Section 5):
- Python MCP library guide (fastmcp is #1 traffic tool, zero editorial content)
- MCP proxy explainer (mcp-proxy is #2 traffic tool, zero editorial content)
- MCP SDK language comparison

---

## Key Takeaways

1. **MCP builders are our core audience** — 47% of human tool traffic is for frameworks/SDKs/proxies. We are primarily serving people building MCP infrastructure, not consuming it. Content strategy should lean into builder/developer content.

2. **The homepage spike was unattributable** — We had 934 unique visitors on March 17 and can't trace a single one to a specific source. UTM infrastructure is deployed; the next distribution push must use it.

3. **Skills pages are punching above their weight** — /skill/ pages drove 27+ human views in a 2-day window with no promotion. This confirms the v2 skills pivot has organic demand.

4. **Five high-value content gaps exist with zero competition** — Python MCP SDK guide, MCP proxy explainer, SDK language comparison, game dev MCP roundup, and Kubernetes MCP guide. None of these have a clear winner in search results.

5. **GitHub badge PR clicks are a real traffic source** — 3 referrals from PR comment sections confirm the badge → tool page funnel works once PRs merge. 35+ open PRs represent significant latent traffic.

6. **EU is the #2 market** — Germany + France + Netherlands collectively represent ~9% of human traffic. Not enough for localization, but worth noting for community outreach (EU developer conferences, EU-based MCP projects).
