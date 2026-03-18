# Ecosystem Analysis — Sprint 14
**Date:** 2026-03-18
**Analyst:** Market Researcher
**Source data:** 25,632 indexed repos in ranked.json + 32 live blog posts

---

## Summary

AgentRank indexes 25,632 MCP/agent tools. 41.4% are active (last commit ≤90 days). The fastest-growing verticals — game dev, design tooling, iOS/Xcode, finance, and home automation — have zero blog coverage. Glama is the dominant content competitor with 150+ posts; we have 32. Our differentiation is data-driven rankings and real signals; their differentiation is volume. The gap to close isn't quantity, it's high-traffic vertical coverage.

---

## 1. Fastest-Growing Categories

Ranked by combination of 30-day active tool count and category freshness rate.

| Category | Tools Indexed | Fresh (30d) | Fresh Rate | Top Tool (Stars) |
|---|---|---|---|---|
| Game Dev / Unity | 264 | 96 | 36.1% | unity-mcp (7,003) |
| Memory / Knowledge | 173 | 65 | 37.6% | codebase-memory-mcp (649) |
| Finance / Trading | 437 | 89 | 20.4% | alpaca-mcp-server (551) |
| Observability | 138 | 48 | 34.8% | prometheus-mcp-server (379) |
| Kubernetes / Cloud | 133 | 39 | 29.3% | k8s-mcp-server (149) |
| Healthcare / Medical | 105 | 34 | 32.4% | biomcp (460) |
| Home Automation / IoT | 130 | 30 | 23.1% | ha-mcp (1,190) |
| Design / Figma | 75 | 21 | 28.0% | Figma-Context-MCP (13,663) |
| iOS / Xcode | 56 | 14 | 25.0% | XcodeBuildMCP (4,720) |

**Key insight:** Game Dev is #1 by active development AND has the highest-scoring tool in the entire index (unity-mcp at rank 1, score 98.67). Three separate Unity MCP servers rank in the top 10 overall. This is a category breakout moment.

**Key insight:** Finance/Trading has the most absolute tools (437) of any uncovered vertical, but lower freshness rate — suggests an established but fragmented category rather than a single dominant player.

---

## 2. Content Gap Analysis

### What we cover (32 blog posts)
- Best MCP Servers: web-browser, code-generation, database, devops, productivity, security, data-science, ai-ml, communication, api-integration
- Evergreen guides: what-is-mcp, how-to-build, how-to-choose, setup guide (Claude/Cursor/Windsurf)
- Comparisons: directory comparison, top-10, MCP vs REST, A2A vs MCP
- Ecosystem: state-of-mcp, landscape Q1, monthly index
- Tutorials: fastmcp Python, Python MCP libraries, integrate-agentrank
- Weekly: this-week-in-mcp series

### Critical gaps (high-traffic potential, no coverage)

**Tier 1 — Immediate priority (>1K stars in top tool, no blog post):**

| Gap | Top Tool | Stars | Why It Matters |
|---|---|---|---|
| Game Dev / Unity MCP | unity-mcp | 7,003 | #1 ranked tool in our entire index. No blog. This is the single biggest content gap. |
| Design / Figma MCP | Figma-Context-MCP | 13,663 | 13K+ stars. Our "Best MCP Servers for X" format is a direct fit. |
| iOS / Xcode MCP | XcodeBuildMCP | 4,720 | 4.7K stars, Sentry-backed, rapidly growing. Apple dev community is large. |
| MCP Frameworks & SDKs | fastmcp | 23,659 | We have "best-python-mcp-libraries" but no standalone framework/SDK guide. |

**Tier 2 — Strong opportunity (growing fast, targeted audience):**

| Gap | Top Tool | Stars | Why It Matters |
|---|---|---|---|
| Home Automation / IoT | ha-mcp | 1,190 | Home Assistant has a massive, passionate community. |
| Memory / Knowledge MCP | codebase-memory-mcp | 649 | Fastest freshness rate of any category. Persistent memory is a hot topic. |
| Finance / Trading MCP | alpaca-mcp-server | 551 | 437 tools indexed — biggest unaddressed vertical by volume. |
| MCP Observability | prometheus-mcp-server | 379 | Enterprise-adjacent. Glama has heavy coverage here — this is contested ground. |
| Agent Orchestration | Agent-MCP | 1,193 | Multi-agent patterns are the next MCP frontier. No overview post from us. |

**Tier 3 — Future coverage:**
- Healthcare / Medical MCP (biomcp 460 stars, niche but high-value audience)
- Flutter / Mobile MCP (marionette_mcp — growing Flutter community)
- Kubernetes/Cloud MCP management (k8s-mcp-server — DevOps audience)

---

## 3. Emerging Trends

### Trend A: Multi-language SDK proliferation (HIGH)
Official SDKs now exist for Python (22K stars), TypeScript (11K), Go (4K, official), Ruby (751). Community SDKs for Rust (159, 56 dependents), PHP (363, 24 dependents). The MCP SDK landscape is mature. **Content opportunity:** "Best MCP SDKs by language" or "Which MCP SDK should you use?"

### Trend B: Multi-platform agent deployment frameworks (HIGH)
mcp-use (9,434 stars, active) and fastmcp TypeScript (2,993 stars) are emerging as opinionated frameworks that abstract over raw MCP. These aren't just servers — they're full app deployment layers. **Content opportunity:** "How to build multi-platform MCP agents."

### Trend C: Game engine and IDE integration (EXPLOSIVE)
Unity-mcp (#1 overall), mcp-unity (#4 overall), XcodeBuildMCP, KiCAD-MCP-Server, and spec-workflow-mcp all point to MCP expanding beyond chat assistants into direct IDE/toolchain integration. This is a new paradigm: AI agents operating inside creative and development environments. **Content opportunity:** "MCP in Game Dev" series.

### Trend D: Document intelligence tools
kreuzberg (6,698 stars) is a polyglot document processing framework with Rust core. markdownify-mcp (2,449 stars) converts everything to markdown. These signal a growing need for AI agents to work with unstructured documents. **Content opportunity:** "Best MCP servers for document processing."

### Trend E: Educational/getting-started resources
microsoft/mcp-for-beginners (15,374 stars) is the top educational MCP resource. This tool's rapid growth signals a large wave of developers entering the MCP ecosystem who need orientation. **Content opportunity:** Beginner-friendly "start here" content hub.

---

## 4. Competitor Content Analysis

### Smithery (smithery.ai/blog)
~6 posts total. Tutorial-focused: Google Sheets MCP, Spotify MCP, NBA API, MCP auth explainer. One strategic essay. **Not a serious content threat.**

### Glama (glama.ai/blog)
150+ posts. Dominant in:
- Protocol deep-dives (JSON-RPC, streamable HTTP, context bloat, elicitation)
- Security (9+ posts — the deepest coverage in the ecosystem)
- Enterprise case studies (Block, Bloomberg, Shopify, Render)
- AWS/cloud series
- IoT series
- Observability series
- Web3/blockchain
- "Chatbot memory" series (persistent state)

**Where Glama is weak:**
- No data-driven rankings or category leaderboards
- No "best of" format indexed to real scores
- No coverage of Game Dev / Unity MCP
- No coverage of iOS/Xcode MCP
- No coverage of Finance/Trading MCP
- No weekly/monthly ecosystem data reports (we have this)

### mcp.so
Zero editorial content. Pure directory.

### Our differentiation
AgentRank is the only content publisher with **actual scored, ranked data** behind every post. A "best MCP servers for game dev" post from us can cite: `unity-mcp: score 98.67, rank #1, 7003 stars, 43 contributors, 22 closed issues of 16 open` — no competitor can do this. This data provenance is the moat.

---

## 5. Sprint 14 Content Recommendations

Prioritized by: traffic potential × data advantage × competitor gap.

### Must-ship this sprint:

1. **`best-mcp-servers-game-dev.astro`** — Top Unity/Xcode/KiCAD MCP servers. Lead with unity-mcp at rank #1. Score: 10/10 priority. Our #1 ranked tool has no blog coverage.

2. **`best-mcp-servers-figma-design.astro`** — Figma-Context-MCP (13K stars), design workflow automation. Score: 9/10. The star count alone makes this high-traffic.

3. **`best-mcp-servers-ios-xcode.astro`** — XcodeBuildMCP (4.7K stars, Sentry-backed), mobile dev workflow. Score: 8/10. Apple dev audience is large and has money.

### Should-ship this sprint:

4. **`best-mcp-servers-memory.astro`** — Persistent memory, knowledge graphs, context management. High freshness rate signals current demand.

5. **`best-mcp-servers-home-automation.astro`** — ha-mcp (1,190 stars). Home Assistant community is vocal and shares content widely.

6. **`mcp-sdk-comparison.astro`** or **`best-mcp-frameworks.astro`** — fastmcp vs mcp-use vs TypeScript fastmcp vs raw SDK. High-value for developers choosing a stack.

### Backlog (sprint 15+):

7. `best-mcp-servers-finance-trading.astro` — Large category, fragmented tools
8. `best-mcp-servers-observability.astro` — Contested vs Glama, but our scored data adds value
9. `best-mcp-servers-agent-orchestration.astro` — Multi-agent patterns, emerging category
10. `what-is-mcp-for-beginners.astro` — Ride the microsoft/mcp-for-beginners wave with a conversion-focused entry point

---

## Appendix: Top Tools Without Blog Coverage

| Rank | Tool | Score | Stars | Category |
|---|---|---|---|---|
| 1 | CoplayDev/unity-mcp | 98.67 | 7,003 | Game Dev |
| 2 | laravel/boost | 97 | 3,333 | Laravel/PHP |
| 3 | microsoft/azure-devops-mcp | 97 | 1,406 | DevOps (Azure) |
| 4 | CoderGamester/mcp-unity | 96 | 1,412 | Game Dev |
| 5 | mark3labs/mcp-go | 96 | 8,353 | SDK (Go) |
| 6 | Pimzino/spec-workflow-mcp | 96 | 3,999 | Dev Workflow |
| 7 | GLips/Figma-Context-MCP | 90 | 13,663 | Design |
| 8 | getsentry/XcodeBuildMCP | 80 | 4,720 | iOS/Xcode |
| 9 | homeassistant-ai/ha-mcp | 93 | 1,190 | Home Auto |
| 10 | genomoncology/biomcp | 91 | 460 | Healthcare |
