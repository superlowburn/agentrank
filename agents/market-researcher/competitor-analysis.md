# Competitor Analysis: MCP/Agent Tool Directories

**Date:** 2026-03-19
**Author:** Market Researcher (AUT-366)
**Purpose:** Inform Phase 2 pricing and positioning decisions

---

## Executive Summary

Nine distinct players index MCP servers and agent tools. None combine multi-signal reputation scoring with a transparent, daily-updating public leaderboard. That positioning is AgentRank's to own.

The clearest competitive threats are:
- **Smithery** — best install UX, VC-backed, 3,300–7,300+ servers, deployment platform
- **Glama** — ~100K monthly visits, growing 19% MoM, quality grades, gateway telemetry data moat
- **MCPScoreboard** — 26,000+ servers, technical quality scoring, REST API (closest to AgentRank's scoring mission but focused on protocol compliance, not ecosystem reputation)

The clearest opportunity: Glama's organic search traffic is only ~2,500 visits/month despite its scale. SEO for "[tool name] MCP server" queries is essentially unclaimed.

---

## Tier 1: Direct Competitors

### Smithery (smithery.ai)

**What it is:** Registry + deployment platform. 3,300–7,300+ MCP servers. Tagline: "Turn scattered context into skills for AI."

**Pricing model:** Free to browse, list, and install. Usage-based hosting fees (exact tiers not publicly disclosed). No creator monetization — devs earn $0.

**Traffic:** No verified third-party data. Self-reported: ~10,000+ active users, ~18,000+ daily tool calls (early 2025 figures, likely higher now). CLI repo: 582 GitHub stars.

**Funding:** Seed from South Park Commons (2025). Amount undisclosed.

**Key features:**
- One-line CLI install: `npx @smithery/cli install <server>` — auto-configures Claude Desktop, Cursor, etc.
- Three deployment modes: remote/hosted, local distribution bundles, self-hosted registration
- Generated OAuth modals — removes auth complexity for publishers
- Skills layer at `smithery.ai/skills` — higher abstraction above raw MCP
- TypeScript + Python SDKs, full dev lifecycle CLI
- Usage analytics for publishers (not consumers)
- Per-server upvotes/reviews

**What they do well:** Best-in-class install UX. Only platform offering hosted deployment as a first-class product. Strongest developer tooling. Active community (Discord, hackathons).

**What they don't have:**
- No composite quality score or ranking
- No freshness/health signals visible to end users
- Dead repos look identical to active ones
- No consumer-facing quality signal of any kind

**AgentRank differentiation:** Smithery tells you what exists. AgentRank tells you what's good. Their deployment platform is orthogonal to our ranking mission — potential partnership angle.

---

### Glama (glama.ai)

**What it is:** Directory + AI workspace + MCP hosting platform. ~19,648 servers indexed. Founded by Frank Fiegel (@punkpeye), who also runs the 83K-star `punkpeye/awesome-mcp-servers` GitHub list.

**Pricing model:**

| Tier | Price | Hosted Servers | Log Retention |
|---|---|---|---|
| Starter | $9/mo | 3 fast (+$4 each) | 30 days |
| Pro | $26/mo | 10 fast (+$3 each) | 90 days |
| Business | $80/mo | 30 fast (+$2 each) | 180 days |

Directory browsing appears free. Enterprise clients claimed include Databricks, Accenture, Shopify, Cloudflare.

**Traffic (Semrush, Feb 2026):**
- ~98K monthly visits, +19% MoM
- Global rank: ~279,000
- Bounce rate: 63%, avg session 2:17
- **Organic search: only ~2,500/month, declining 53% MoM** — SEO is a major weakness despite their scale
- Top acquisition: direct (37%), Reddit (15%), organic (low)
- Top geos: Germany (29%), US (18%), Japan (16%)

**Key features:**
- A–F quality/security/license grading per server
- "Recent Usage (last 30 days)" sort — based on real gateway telemetry (genuine data moat)
- 100+ category/environment/language filters
- Embeddable badge for server READMEs (viral loop)
- Official API: `https://glama.ai/api/mcp/v1/servers/`
- Firecracker VM isolation for hosted servers
- Multi-provider LLM gateway (100+ models)
- Also indexes MCP clients, not just servers

**What they do well:** First-mover with scale. Badge ecosystem drives reverse discovery. Only player with real runtime telemetry (usage-based sort). Vertical integration creates sticky paid product.

**What they don't have:**
- No ranked leaderboard — A–F grades are pass/fail quality gates, not a relative ranking
- No ranked #1/#2/#3 — who's winning? Not visible
- No GitHub-derived signals surfaced (contributor count, issue health ratio, dependency count)
- Transparent scoring methodology: none

**AgentRank differentiation:** Glama's SEO weakness is our primary acquisition channel. Their grades answer "is this good enough?" — AgentRank answers "who's the best?" Different questions. The opinionated, transparent ranking formula (published weights) builds trust with maintainers that Glama's black-box scans don't.

---

### MCPScoreboard (mcpscoreboard.com)

**What it is:** Technical quality scoring for 26,000+ MCP servers. REST API, no auth required. Most direct overlap with AgentRank's scoring mission.

**Pricing model:** Free API (rate-limited). No paid tier surfaced.

**Traffic:** No data available.

**Key features:**
- Scores on: schema quality, protocol compliance, reliability, documentation/maintenance, security, agent usability
- Pre-flight check tool (instant quality assessment for your server)
- GitHub deep-dive: schema completeness, description quality, doc coverage, dependency health
- 6 analysis layers, run daily
- REST API, no authentication required

**What they do well:** Most technically rigorous scoring in the space. Pre-flight check is an excellent developer tool. Free API makes it usable by agents and toolchains.

**What they don't have:**
- No public leaderboard (no ranked #1 through #100)
- No community/discovery layer
- Scoring focused on protocol compliance, not ecosystem reputation (stars, freshness, maintainer activity)
- No social or community presence discovered

**AgentRank differentiation:** MCPScoreboard measures "is this a well-formed MCP server?" AgentRank measures "is this a thriving, maintained, depended-upon tool?" Complementary rather than competing — could be a data partnership.

---

## Tier 2: High-Traffic Directories (Discovery-Focused)

### PulseMCP (pulsemcp.com)

**What it is:** 11,817 servers, daily updates, MCP newsletter, MCP clients directory. Founded by Tadas Antanavicius and Mike Coughlin — both MCP Steering Committee members and contributors to the official MCP Registry.

**Pricing model:** Free. No paid tier discovered. Revenue model unclear.

**Traffic:** No third-party data available. Institutional legitimacy signals strong community reach.

**Key features:**
- "Est Visitors (Week)" per server — unique among all competitors; derived from SEO signals, registry counters, social signals
- Sorting by: last updated, alphabetical, recommended, weekly/monthly/all-time popularity
- Ecosystem statistics page — most transparent public view of MCP ecosystem health available
- 49+ editions of weekly newsletter ("Weekly Pulse")
- 394+ MCP clients directory
- pulsemcp-server MCP tool — agents can query PulseMCP directly (recursive distribution advantage)
- Intentional quality filtering: 11,817 servers (vs. competitors' 18–19K) because low-quality submissions are excluded

**What they do well:** Closest existing thing to ecosystem analytics. "Est Visitors (Week)" is genuinely unique. Newsletter is the de facto community voice. MCP Steering Committee credibility is hard to replicate.

**What they don't have:**
- No composite score or ranked leaderboard
- No GitHub-derived signals (stars, freshness, issue health, contributors) per listing
- "Est Visitors" is one signal, not a multi-factor ranking

---

### mcp.so

**What it is:** Community-driven marketplace, ~18,700 servers. Open-source codebase (`chatmcp/mcpso`, ~2,000 stars, Apache-2.0, Next.js + Supabase).

**Pricing model:** Free. Monetized via sponsored listings (sponsor badge + UTM-tagged links). Partnership revenue from named sponsors.

**Traffic:** Self-reported "millions of traffic" in promotional copy — unverified. No third-party data.

**Key features:**
- 21 browsable categories (Developer Tools: 8,800+ servers, Research & Data: 5,150+)
- Tabs: All / Featured / Latest / Official / Hosted / Sponsored
- Server playground for testing
- Multi-language support
- Submission via GitHub issues or web form

**What they do well:** Largest raw server count. Open-source architecture. Sponsored listing model provides clear monetization precedent.

**What they don't have:** No quality signals per listing. No rankings, scores, or freshness indicators. Category taxonomy is inconsistent.

---

### MCPMarket (mcpmarket.com)

**What it is:** Web directory + leaderboard with daily "Top MCP Servers" lists. 10,000+ tools, 23 categories. Backed by Higress (Alibaba Cloud project).

**Pricing model:** Free to list. Revenue likely via Higress commercial integration layer.

**Key features:**
- Top 100 Leaderboard — ranked by GitHub stars (stars-only)
- Daily published ranked lists through March 2026
- 23 categories
- Private MCP market / self-hosting via Higress

**What they do well:** Has a leaderboard concept. Daily content cadence creates SEO footprint.

**What they don't have:** Stars-only ranking is the exact primitive signal AgentRank's composite score improves upon. No freshness, issue health, or contributor signals.

---

## Tier 3: Curated Lists and Open-Source Directories

### punkpeye/awesome-mcp-servers + mcpservers.org

**GitHub:** https://github.com/punkpeye/awesome-mcp-servers — **83,500 stars, 8,200+ forks** — the most starred MCP resource by far.

**Web version:** https://mcpservers.org — rendered, searchable website skin over the GitHub list.

**Monetization:** $39 one-time premium submission for faster review, "Official" badge, dofollow backlink. Free submissions also accepted.

**Key features:**
- Curated categories (10+ types)
- Agent Skills library (91+ skills for Claude Code, Codex) — newly launched, notable differentiation
- Sorting by name or newest; no scoring
- GitHub repo is canonical source; high SEO halo from github.com domain authority

**What they do well:** Brand authority is unmatched. 83K stars means every developer in the ecosystem knows this list. Agent Skills library is a smart adjacent expansion.

**What they don't have:** Static list — no scoring, no freshness signals, no ranking. The GitHub repo format limits what signals can be surfaced.

---

### tolkonepiu/best-of-mcp-servers

**URL:** https://github.com/tolkonepiu/best-of-mcp-servers

**What it is:** Auto-generated ranked list using the `best-of-generator` framework. 410 servers, 34 categories, updated weekly via CI/CD. Assigns a composite "project-quality score" from GitHub signals.

**Pricing model:** Free, open-source.

**Key features:**
- Composite score: stars + recent commits + forks + watchers + contributors + package downloads
- Sorted by score within each category
- Fully automated, weekly regeneration

**What they do well:** Conceptually closest to AgentRank's scoring approach. Automated and consistent.

**What they don't have:** GitHub README only — no website, no detail pages, no API, no community. Only 410 servers. Scoring methodology explicitly described as "just chosen by experience" with no scientific basis.

---

### Other Notable Players

**MCPdir.dev** — Open-source community directory, 8,000+ servers, no scoring, no commercial model.

**mcp.run** — WASM runtime + registry (distinct category: a runtime layer, not a directory). Freemium, private servlets coming.

**Official MCP Registry (registry.modelcontextprotocol.io)** — Anthropic-backed infrastructure, OpenAPI spec, no ranking. Not a competitor — distribution channel opportunity. AgentRank should register here.

---

## Competitive Matrix

| Competitor | Servers | Monthly Visits | Composite Score? | GitHub Signals? | Paid Model | Key Moat |
|---|---|---|---|---|---|---|
| Smithery | 3,300–7,300+ | ~10K users (est) | None | None (publish analytics only) | Usage-based hosting | Install UX, deployment platform |
| Glama | ~19,648 | ~98K | A–F quality gates | Not surfaced | $9–$80/mo SaaS | Usage telemetry, badge ecosystem |
| MCPScoreboard | 26,000+ | Unknown | Technical quality | Partial | Free API | Protocol compliance scoring |
| PulseMCP | 11,817 | Unknown | Popularity estimate | Not surfaced | Free | Newsletter, Steering Committee credibility |
| mcp.so | ~18,700 | Unknown | None | None | Sponsored listings | Open-source, volume |
| MCPMarket | 10,000+ | Unknown | Stars only | Stars only | Free (Higress) | Leaderboard concept, daily content |
| mcpservers.org | Large (list) | High (GitHub halo) | None | None | $39 submission | 83K star authority |
| best-of-mcp | 410 | Minimal | Basic composite | Stars + commits | Free/OSS | Closest scoring analog |
| **AgentRank** | Growing | Building | **Yes — 5 signals** | **Stars + freshness + issues + contributors + dependents** | TBD | **Ranked index, transparent weights** |

---

## Pricing Benchmarks for Phase 2

From competitor data:

| Model | Players Using It | Price Points |
|---|---|---|
| Free directory (ads/sponsors) | mcp.so, MCPdir.dev | Sponsor slots: unknown CPM |
| Paid submission badge | mcpservers.org | $39 one-time |
| SaaS hosting tiers | Glama, Smithery | $9–$80/mo; usage-based hosting |
| Free API with rate limits | MCPScoreboard | Free tier; no paid tier known |
| Newsletter/community | PulseMCP | Free |

**Implication for AgentRank pricing:** The sponsored/featured listing model (mcp.so) and paid submission badge (mcpservers.org) are the easiest near-term revenue plays. Both require minimal product investment. The $39 badge model is particularly clean — low friction, scales with catalog growth. SaaS hosting (Glama/Smithery model) requires significant infrastructure and is a different product direction.

---

## Feature Gap Analysis

### Features competitors have that AgentRank doesn't

| Feature | Who Has It | Priority |
|---|---|---|
| One-line CLI install (`npx @smithery/cli install`) | Smithery | High — critical UX gap if AgentRank wants maintainer engagement |
| Hosted MCP deployment | Smithery, Glama | Low — different product direction |
| Per-server embeddable badge | Glama (mature), AgentRank (shipped AUT-359) | AgentRank has this — needs growth |
| Weekly newsletter | PulseMCP | Medium — content flywheel opportunity |
| Runtime telemetry / usage-based sort | Glama (from gateway) | Low — requires hosting infrastructure |
| Pre-flight quality check tool | MCPScoreboard | Medium — developer acquisition tool |
| Agent Skills library | mcpservers.org | Low for now — adjacent opportunity |
| MCP client directory | PulseMCP, mcpservers.org | Low — extend after server index matures |

### Features AgentRank has that competitors don't

| Feature | Status | Competitive Value |
|---|---|---|
| Composite 5-signal reputation score (stars + freshness + issue health + contributors + dependents) | Core | Unique — no competitor publishes a multi-signal score with disclosed weights |
| Ranked leaderboard (not just sorted list) | Core | MCPMarket has stars-only; no one has a composite ranked index |
| Claim Your Tool flow | Shipped (AUT-361) | Only Glama has claimed/verified listings; AgentRank has parity |
| Per-tool embed pages | Shipped (AUT-359) | Glama badge is more mature; AgentRank is close |
| Developer API (v1/stats) | Shipped (AUT-355) | MCPScoreboard has an API; AgentRank's is broader |
| Transparent scoring methodology | Core | No competitor publishes their weights; this builds maintainer trust |

---

## Strategic Recommendations

1. **Own the SEO lane immediately.** Glama has ~100K monthly visits but only ~2,500 from organic search — and declining. No competitor has invested in "[tool name] MCP server" keyword content. Individual tool pages with JSON-LD, schema markup, and internal linking (AUT-360 shipped) position AgentRank to capture this.

2. **Publish the scoring methodology.** The transparent weight formula (Stars 15%, Freshness 25%, Issue Health 25%, Contributors 10%, Dependents 25%) is a genuine differentiator. Write and publish it as a blog post. No competitor does this. Maintainers will trust a visible formula over a black box.

3. **Register with the Official MCP Registry.** Free distribution channel backed by Anthropic. Should be done before Phase 2 launch, not after.

4. **Consider the $39 paid badge model for near-term revenue.** mcpservers.org proved this works. It's a signal maintainers value (visibility + backlink). Low product investment, scales with catalog.

5. **Watch PulseMCP closely.** Their MCP Steering Committee relationships give them institutional access AgentRank can't easily replicate. If they launch a ranking feature, they have credibility that will be hard to compete with. The differentiation window is now.

6. **MCPScoreboard is a potential partner, not a competitor.** Their protocol compliance scoring + AgentRank's ecosystem reputation scoring = a richer signal. Worth a conversation.

---

*Sources: public web research, Semrush (glama.ai traffic), GitHub (star/fork counts), direct site analysis, competitor documentation and pricing pages.*
