# This Week in MCP — March 19, 2026

*AgentRank's weekly data-driven roundup of the MCP server ecosystem.*

---

## The Big Movers

Five tools made significant jumps in the rankings this week:

**1. jparkerweb/mcp-sqlite** — jumped from #15,576 to #265 (+52.6 points)
A comprehensive SQLite interaction server for AI assistants. Went from obscurity to the top 300 essentially overnight. Stars are still low (90), so this is a freshness/activity-driven surge, not a virality spike — someone is actively developing.

**2. agent-sh/agnix** — jumped from #1,196 to #37 (+35.4 points, now score 89.9)
A linter and LSP for AI coding assistants — validates CLAUDE.md, AGENTS.md, SKILL.md, hooks, MCP configs. Written in Rust. The use case is obvious for anyone managing agent infrastructure at scale. Quietly one of the most interesting tools in the index right now.

**3. imbenrabi/Financial-Modeling-Prep-MCP-Server** — jumped to #101 (score 84.8)
MCP integration for Financial Modeling Prep, giving AI assistants access to financial data and analysis tools. Finance meets agents — a vertical that's been underserved.

**4. qhdrl12/mcp-server-gemini-image-generator** — jumped to #535 (+39.2 points)
Wraps Google's Gemini Flash image models as an MCP tool. Text-to-image generation directly in your agent workflow.

**5. kludgeworks/mcp-server-rdf** — jumped to #3,318 (+39.7 points)
Queries RDF datastores via MCP. Niche, but if you're in semantic web / knowledge graph territory, this is probably your only option.

---

## Notable New Entries

Fresh additions to the index this week that scored well out of the gate:

- **sirkirby/unifi-mcp** — score 78.8, rank #190. MCP server for Ubiquiti UniFi network management. Strong initial score suggests active development and engaged maintainer.
- **cyanheads/mcp-ts-core** — score 66.9, rank #411. Core TypeScript utilities for MCP server development. Meta-tooling.
- **jimprosser/obsidian-web-mcp** — score 59.4, rank #621. Bridges Obsidian notes with web content via MCP. Personal knowledge management + AI.

---

## Spotlight: CoplayDev/unity-mcp

**AgentRank score: 98.7 — #1 overall**

Unity MCP is the current top-ranked tool in the index, and it earns it. What it does: bridges AI assistants (Claude, Cursor, etc.) directly to the Unity Editor — manage assets, control scenes, edit scripts, and automate tasks without leaving your AI interface.

The numbers: 7,003 stars, 843 forks, 43 contributors, last commit March 12. Not a solo project — actively maintained by a real team. Game development is a massive market and the Unity editor is notoriously complex. Giving AI assistants direct programmatic access to it is a high-leverage idea. The community agrees.

If you're building in Unity, integrate this.

→ [Full breakdown on AgentRank](https://agentrank-ai.com/tools/CoplayDev/unity-mcp)

---

## By the Numbers

- **25,750** MCP servers and agent tools indexed
- **24.3%** have committed code in the last 30 days
- **41.4%** active in the last 90 days
- Average time since last commit: **155 days** (most of the long tail is dormant)
- Top languages: Python (9,919), TypeScript (7,047), JavaScript (3,104), Go (1,230), Rust (673)

The 24% active-in-30-days figure is worth noting: three quarters of the index is stale. The rankings surface the live 25% — which is exactly the point.

---

If you found this useful, forward it to someone building with agents.

The full index lives at [agentrank-ai.com](https://agentrank-ai.com). Rankings update daily.

---

*AgentRank tracks 25,750+ MCP servers and agent tools. Scores computed from freshness, issue health, stars, contributors, and dependents.*
