# Master Listing Content — AgentRank

Use this as the source of truth for all directory submissions. Adapt format as needed per directory.

---

## Core Fields

**Name:** AgentRank

**Tagline (short, ~10 words):**
Ranked index of 25,000+ MCP servers and AI agent tools

**Tagline (alternate):**
Daily-updated rankings for every MCP server on GitHub

**URL:** https://agentrank-ai.com

**GitHub:** https://github.com/superlowburn/agentrank

**Pricing:** Free

**License:** N/A (hosted service)

**Categories:**
- Developer Tools
- AI Tools
- MCP Servers
- Agent Tools
- Open Source Discovery

**Tags:** mcp, mcp-server, ai-agents, agent-tools, developer-tools, ai, ranking, leaderboard, model-context-protocol

---

## Descriptions

### One-liner (25 words or fewer)
AgentRank is a daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub signals.

### Short description (50–75 words)
AgentRank indexes every MCP server and AI agent tool on GitHub and ranks them daily using five real signals: stars, freshness, issue health, contributor count, and inbound dependents. The result is a live leaderboard that shows which agent tools are actively maintained and widely trusted — not just which ones got hyped. Free to browse, with a public API.

### Medium description (100–150 words)
AgentRank is the ranked index for MCP servers and AI agent tools. It crawls GitHub nightly, scoring 25,000+ tools across five signals: raw popularity (stars), maintenance freshness (days since last commit), issue responsiveness (closed vs. open ratio), contributor diversity, and inbound dependents. Each tool gets an AgentRank score from 0–100. The leaderboard updates daily.

The goal is signal over noise. GitHub has thousands of MCP servers — most are abandoned experiments. AgentRank separates the actively maintained, widely-trusted tools from the rest. Developers can search, filter by category, and compare tools side-by-side. Maintainers can claim their listing and add context. There's a free public API for embedding rankings in your own tools.

### Long description (200–300 words)
AgentRank is a daily-updated ranked index of 25,000+ MCP servers and AI agent tools built for developers who work with AI agents. It was built to solve a real problem: GitHub has thousands of MCP servers, but most of them are abandoned, unmaintained, or duplicates of each other. When you're building an AI agent system and need to choose a tool, there's no good way to tell which ones are worth using.

AgentRank fixes this with five composite signals:

- **Stars** — raw popularity signal, normalized across the index
- **Freshness** — days since last commit; anything over 90 days starts decaying
- **Issue health** — closed issues divided by total issues; higher = more responsive maintainer
- **Contributors** — more than one contributor = less single-point-of-failure risk
- **Inbound dependents** — how many other repos depend on this tool; the strongest signal

Each tool gets an AgentRank score from 0–100. The full index updates nightly. New repos are added automatically as they're created. Dead repos are flagged automatically as they go stale.

Features:
- 25,000+ MCP servers and agent tools indexed
- Daily score updates from live GitHub data
- Search and filter by category, language, stars
- Side-by-side tool comparison
- Free public API (13 endpoints, OpenAPI documented)
- MCP server — query the rankings directly from Claude, Cursor, Copilot, or any MCP-compatible client
- Maintainer claim flow — add context, link to docs, see analytics

Free to use. No account required to browse.

---

## Screenshots / Assets

- Homepage: https://agentrank-ai.com (leaderboard with scores, search, filter)
- API docs: https://agentrank-ai.com/api-docs
- Tool detail: https://agentrank-ai.com/tools/[tool-slug]
- Compare: https://agentrank-ai.com/compare

---

## Alternatives / Competitors

(For directories that require listing alternatives)

- mcp.so — MCP server registry, no ranking
- Smithery (smithery.ai) — MCP marketplace, no data-driven scoring
- awesome-mcp-servers (GitHub) — curated list, not scored or updated daily
- GitHub search — raw, no quality signal

AgentRank differentiator: the only directory that scores and ranks tools by real maintenance and adoption signals, updated daily.

---

## Social / Contact

- Twitter/X: @AgentRank_ai
- GitHub: https://github.com/superlowburn/agentrank
- API: https://agentrank-ai.com/api-docs
