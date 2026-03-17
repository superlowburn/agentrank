# Competitive Landscape Analysis: MCP Directories, Agent Tool Indexes & Developer Tool Marketplaces

**Date:** March 17, 2026
**Author:** Market Researcher Agent
**Purpose:** Inform AgentRank monetization strategy and positioning

---

## Summary

The MCP directory space is crowded but shallow. Ten+ directories exist, yet none provides a credible **composite quality/health score**. Most rank by stars, recency, or manual curation. The market has fragmented into two camps: big-catalog raw dumps (mcp.so, Glama) and curated-with-traffic-data plays (PulseMCP). AgentRank's opportunity is the unclaimed middle: a scored, freshness-weighted index that tells you *which tools are actually worth using*, not just which ones exist.

---

## Competitor Profiles

### 1. mcp.so

| Dimension | Data |
|-----------|------|
| Catalog size | 18,653 servers |
| Ranking method | Manual curation tabs: Featured / Latest / Hosted / Official |
| API | None found |
| Monetization | Sponsored listings (AlphaVantage, ShipAny, CopyWeb, HeyBeauty, Deepsite) |
| GitHub | Not public |
| Built with | ShipAny (template site) |

**Does better than AgentRank:** Sheer catalog size; already indexed 18K+ servers; has sponsorship revenue flowing.
**Does worse:** Zero quality signal. "Featured" is manual/paid curation. No freshness. No health score. No API. Looks like a link farm.

---

### 2. mcpservers.org

| Dimension | Data |
|-----------|------|
| Catalog size | Appears small (23 featured/latest shown); total unclear |
| Ranking method | Featured + Latest tabs; A-Z / Newest sort |
| API | None |
| Monetization | Sponsored listings (Bright Data, Scout Monitoring, Alpha Vantage); "Premium Submit" with dofollow link |
| GitHub | Not public |

**Does better:** Category filters; clean UI.
**Does worse:** Small catalog; no quality scores; monetization is basic link selling.

---

### 3. PulseMCP

| Dimension | Data |
|-----------|------|
| Catalog size | 11,172 servers |
| Ranking method | "Recommended" (default), Last Updated, Alphabetical, Recently Released, + popularity filters |
| API | Yes — **partner-only**, contact hello@pulsemcp.com; implements Generic MCP Registry API spec with enriched metadata |
| Monetization | "Work With Us" / editorial partnerships; weekly newsletter |
| Traffic signal | Shows "Est Visitors (Week)" per server — proprietary blend of SEO + web presence signals |
| Notable | Tracks ecosystem-wide stats (total downloads, estimated visitors) at /statistics |

**Does better than AgentRank:** Estimated visitor data per server is genuinely useful signal. Weekly newsletter = distribution. API spec compliance. Cleaner discovery filters.
**Does worse:** No composite quality/health score. API is walled (partner-only, not developer-friendly). No scoring transparency. Manual corrections to metadata.

---

### 4. mcpserverfinder.com

| Dimension | Data |
|-----------|------|
| Catalog size | 1,934 servers |
| Ranking method | Category browse + search; ranking methodology unclear |
| API | None |
| Monetization | None visible |
| Positioning | "Largest collection" (factually wrong at 1,934) |

**Does better:** Step-by-step implementation guides and compatibility info per server.
**Does worse:** Smallest catalog of the group; no scoring; no traction signals; no monetization.

---

### 5. Smithery

| Dimension | Data |
|-----------|------|
| Catalog size | ~3,000–7,300 servers (sources vary; some count individual tools within servers) |
| Ranking method | Usage-based (install/run counts); "Sequential Thinking" example: 5,550+ uses |
| API | Not confirmed; bot-protected (Vercel security checkpoint) |
| Monetization | Primarily a **hosting platform** — hosts and runs MCP servers on-demand |
| Positioning | "The platform for agentic AI" — leans into hosting, not just directory |

**Does better than AgentRank:** Hosted execution is a moat. You don't just find a server — you run it directly from Smithery. Usage-count ranking is real behavior data.
**Does worse:** Heavily bot-protected = black box; catalog smaller than Glama/mcp.so; usage data not exportable; no composite health score.

---

### 6. Glama

| Dimension | Data |
|-----------|------|
| Catalog size | 19,499 servers (as of 2026-03-17) |
| Ranking method | Multiple: Search Relevance, Recent Usage (30d), Date Added, Date Updated, Weekly Downloads, GitHub Stars, Recent GitHub Stars |
| API | Yes — `/mcp/api` with docs at `/gateway/reference` |
| Monetization | Freemium SaaS: Starter $9/mo, Pro $26/mo, Business $80/mo (AI chat + hosted MCP servers are the core value, not the directory) |
| Security grades | Yes — each server gets a quality/security report card |
| Notable | Real download tracking; 100+ category filters; community Discord |

**Does better than AgentRank:** Largest catalog; most sorting options; actual download metrics; security grades; real API; paying customers already.
**Does worse:** Business model is an AI platform (chat + hosted servers), not an index. Security grade ≠ health/maintenance score. No composite single number for "should I use this?" No freshness weighting. No contributor bus-factor signal.

---

### 7. awesome-mcp-servers (punkpeye/GitHub)

| Dimension | Data |
|-----------|------|
| Catalog size | Hundreds+ (exact count unclear, very large) |
| GitHub stars | **83,400** (massive authority signal) |
| Forks | 8,300 |
| Ranking method | Manual curation; no ranking — alphabetical within categories |
| API | None |
| Monetization | None; many entries link to Glama for quality scores |

**Does better than AgentRank:** Canonical reference list; massive SEO authority; developer trust is very high.
**Does worse:** Static curation, no scoring, no freshness, no automation. Already links to Glama for quality data — this is a gap AgentRank can fill.

---

### 8. MCPMarket

| Dimension | Data |
|-----------|------|
| Catalog size | 100+ (Top 100 leaderboard) |
| Ranking method | GitHub stars (single signal) |
| API | Unknown |
| Monetization | Unknown |
| Notable | Also has a Skills leaderboard; publishes daily "Top MCP Server List" posts |

**Does better:** Daily content publishing creates SEO surface area (e.g., "List of Top MCP Servers for March 3, 2026").
**Does worse:** Stars-only ranking is the simplest possible implementation; small catalog; no health/freshness weighting.

---

### 9. skills.sh (Agent Skills Directory)

| Dimension | Data |
|-----------|------|
| Catalog size | 89,100 skills |
| Ranking method | All-time install count; also Trending (24h) and Hot views |
| API | Not confirmed |
| Monetization | Free; Vercel-backed open standard |
| Platforms | 20+ AI agent tools (Claude Code, Copilot, Cursor, Codex, Goose, Windsurf, etc.) |
| Top skill | find-skills: 590,300+ installs |

**Context for AgentRank:** skills.sh is a **different category** — reusable procedural skills (like npm for Claude prompts), not MCP tool servers. Overlap exists but it's not a direct competitor. The install-count leaderboard is a useful model to study.

---

### 10. agentskill.sh

| Dimension | Data |
|-----------|------|
| Catalog size | 44,000+ skills |
| Notable | Two-layer security scanning; /learn installer |
| Relationship | Direct competitor to skills.sh in the agent skills space |

---

## Summary Comparison Table

| Competitor | Catalog Size | Ranking Signal | API | Composite Score | Freshness Weight | Monetization |
|---|---|---|---|---|---|---|
| mcp.so | 18,653 | Manual curation | None | No | No | Sponsored listings |
| mcpservers.org | ~23 featured | Featured/Newest | None | No | No | Sponsored listings |
| PulseMCP | 11,172 | Est. visitors | Partner-only | No | Partial | Newsletter/partnerships |
| mcpserverfinder.com | 1,934 | Category browse | None | No | No | None |
| Smithery | ~3,000–7,300 | Usage count | Unknown | No | No | Hosted execution |
| Glama | 19,499 | Downloads + stars + recency | Yes (freemium) | Security grade only | Yes (recent usage) | SaaS ($9–$80/mo) |
| awesome-mcp-servers | Hundreds+ | Manual/alphabetical | None | No | No | None |
| MCPMarket | 100 (leaderboard) | GitHub stars only | Unknown | No | No | Unknown |
| skills.sh | 89,100 | Install count | Unknown | No | No | Free (Vercel) |
| **AgentRank (planned)** | **All GitHub** | **5-signal composite** | **Planned** | **Yes** | **Yes (25% weight)** | **TBD** |

---

## Top 3 Differentiation Opportunities

### Opportunity 1: Own "The Quality Score"

**The gap:** No competitor publishes a single composite health/quality score for MCP servers. Glama has security grades. MCPMarket uses raw stars. PulseMCP shows estimated visitors. Nobody synthesizes these into one credible number that answers: *"Is this tool maintained and worth depending on?"*

**AgentRank's play:** The 5-signal composite score (stars 15%, freshness 25%, issue health 25%, contributors 10%, dependents 25%) is genuinely differentiated. Freshness and issue health are signals that favor *maintained* projects over just *popular* ones. A tool with 10k stars and no commits in 8 months should score lower than a tool with 500 stars and weekly releases. No one is doing this.

**How to win:** Make the score formula public. Transparency = trust = authority. awesome-mcp-servers already links to Glama for quality data — AgentRank can become the authoritative quality signal that gets embedded everywhere.

---

### Opportunity 2: The Developer API (Open, Not Partner-Walled)

**The gap:** PulseMCP's API requires contacting them at hello@pulsemcp.com and negotiating a partnership. Glama's API is designed for their AI chat platform, not for external developers building on top of the index. No competitor offers a clean, open, developer-first API to query scored MCP server data.

**AgentRank's play:** Ship a public REST API with the scored data. Even a simple `GET /api/servers?sort=score&limit=100` would be more accessible than anything in the market. Agents, IDEs, and developer tools want to programmatically discover and evaluate MCP servers — AgentRank can be the data source they all query.

**How to win:** Free tier (rate-limited), paid tier for higher volume. This is how you build a B2B revenue stream without building a SaaS product. The data is already being generated; the API is just an HTTP layer on top.

---

### Opportunity 3: The "Movers & Shakers" Content Engine

**The gap:** No competitor is publishing weekly trend content from their data. MCPMarket publishes daily "Top MCP Servers" lists (static) but they're just star counts. Nobody is doing "Biggest movers this week" or "Tools that just got their first 10 contributors" or "Dead tools: these 5 haven't been updated in 6 months."

**AgentRank's play:** The scoring data generates content automatically. Every week the deltas exist — which tools moved up/down, which are trending, which are decaying. This content is genuinely useful to developers and irresistible to maintainers who see themselves mentioned.

**How to win:** Weekly Twitter thread from @AgentRank_ai: "This week's biggest movers in the MCP ecosystem." Tag the maintainers of tools that moved up. They retweet because you told them they're winning. Their audience becomes your distribution. This flywheel costs $0 to run once the data pipeline exists.

---

## Additional Observations

**The ecosystem is growing fast.** Glama had 14,274 servers in January 2026 and now shows 19,499 — that's 36% growth in ~2 months. The window to establish authority is open but won't stay open. First-mover advantage in scoring methodology matters.

**Sponsored listings are viable but low-value.** mcp.so and mcpservers.org are running this model (AlphaVantage, Bright Data). It works but it's low-margin and creates trust issues ("are the rankings paid?"). AgentRank should defer sponsorships until the score is established as unimpeachable.

**Hosted execution is Smithery's moat.** AgentRank should not compete here. Smithery's value is running MCP servers on-demand — that's infrastructure. AgentRank's value is knowing which servers are worth running. These are complementary.

**awesome-mcp-servers is a distribution channel.** At 83k stars it's the most-linked resource in the MCP world. Getting AgentRank scores embedded as badges in that README (even via Glama's existing model) is a high-leverage goal. Reach out to punkpeye once the score is live.

**PulseMCP's newsletter is the closest thing to distribution.** They've built an audience. AgentRank should get featured in their newsletter as a data source, not compete against it.

---

## Sources

- mcp.so (direct fetch, 2026-03-17)
- mcpservers.org (direct fetch, 2026-03-17)
- pulsemcp.com/servers + /statistics + /api (direct fetch, 2026-03-17)
- mcpserverfinder.com (direct fetch, 2026-03-17)
- glama.ai/mcp/servers + /pricing (direct fetch, 2026-03-17)
- github.com/punkpeye/awesome-mcp-servers (direct fetch, 2026-03-17)
- skills.sh (direct fetch, 2026-03-17)
- Smithery.ai (behind bot protection; data from search synthesis)
- MCPMarket search results, March 2026
- Composio blog: [Best Smithery alternatives in 2026](https://composio.dev/blog/smithery-alternative)
- Descope blog: [Best MCP Server Directories for Developers](https://www.descope.com/blog/post/mcp-directories)
- DEV Community: [My Favorite MCP Directories](https://dev.to/techgirl1908/my-favorite-mcp-directories-573n)
- Apify: [MCP Server Directory Scraper](https://apify.com/lovely_sequoia/mcp-directory-scraper)
- MCPize: [Compare MCP Platforms](https://mcpize.com/alternatives)
