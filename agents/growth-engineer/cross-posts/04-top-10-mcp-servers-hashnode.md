---
title: "Top 10 MCP Servers for AI Agents in 2026 (Ranked by Real Data)"
subtitle: "Not sorted by stars — ranked by composite signal: freshness, issue health, contributors, and dependents across 25,000+ indexed repos"
slug: top-10-mcp-servers-2026-ranked-real-data
tags:
  - name: MCP
    slug: mcp
  - name: AI
    slug: ai
  - name: Open Source
    slug: open-source
  - name: Developer Tools
    slug: developer-tools
canonical: https://agentrank-ai.com/blog/top-mcp-servers-2026/
coverImage: https://agentrank-ai.com/og/top-mcp-servers-2026.png
---

*Originally published at [agentrank-ai.com](https://agentrank-ai.com/blog/top-mcp-servers-2026/)*

The [AgentRank index](https://agentrank-ai.com) tracks **25,632 MCP servers and agent tools**. Average score across the ecosystem: **29.6 out of 100**. The tools below are the top 10 — not sorted by GitHub stars, not by recent hype, but by a composite signal of five real quality indicators scored daily.

## How AgentRank scoring works

- **Stars (15%)** — raw popularity
- **Freshness (25%)** — days since last commit; decays hard after 90 days
- **Issue health (25%)** — closed/total issues; measures maintainer responsiveness
- **Contributors (10%)** — more than one = less bus factor risk
- **Inbound dependents (25%)** — how many repos depend on this. Strongest signal of real adoption.

## The top 10 (March 2026)

| # | Repository | Score | Stars | Close% | Category |
|---|-----------|-------|-------|--------|----------|
| 1 | CoplayDev/unity-mcp | 98.67 | 7,003 | 95.7% | Game Dev |
| 2 | microsoft/azure-devops-mcp | 97.17 | 1,423 | 96.8% | DevOps |
| 3 | laravel/boost | 96.94 | 4,208 | 91.3% | PHP/Web |
| 4 | Pimzino/spec-workflow-mcp | 96.02 | 3,999 | 97.7% | Dev Workflow |
| 5 | zcaceres/markdownify-mcp | 94.73 | 2,449 | 100% | Utilities |
| 6 | samanhappy/mcphub | 94.47 | 3,241 | 88% | Orchestration |
| 7 | perplexityai/modelcontextprotocol | 94.27 | 2,016 | 97.7% | Search |
| 8 | microsoft/playwright-mcp | 94.26 | 28,849 | 97.1% | Browser |
| 9 | oraios/serena | 93.61 | 21,474 | 85.2% | Coding Agents |
| 10 | mcp-use/mcp-use | 93.10 | 9,434 | 76% | Frameworks |

## The deep dives

### #1 — CoplayDev/unity-mcp (98.67)

Bridges AI assistants directly to the Unity Editor. An agent can manage assets, create/modify scenes, edit C# scripts, and automate game development tasks entirely through MCP calls. 7,003 stars, 43 contributors, 95.7% issue close rate, committed March 12.

Not just popular — actively maintained with a disciplined issue queue. That's the combination that wins the index.

### #2 — microsoft/azure-devops-mcp (97.17)

Official Microsoft MCP server for Azure DevOps. Exposes work items, pull requests, pipelines, repositories, and test plans as MCP tools. An agent can create issues, query build statuses, review PRs, and trigger deployments without leaving the conversation.

96.8% issue close rate (425 closed, 14 open) with direct Microsoft backing. Predictable maintenance.

### #3 — laravel/boost (96.94)

Official Laravel MCP server. Connects AI assistants to artisan commands, routes, models, and database schema. **1,032 dependent repos** — the real-world adoption signal that pushes it to #3 despite more modest stars than other tools.

### #4 — Pimzino/spec-workflow-mcp (96.02)

Highest issue close rate in the top 10: 97.7% (130 closed, 3 open). Provides spec-driven development workflow tools — agent reads a spec, breaks it into tasks, executes them, updates a real-time dashboard visible in VSCode. 3,999 stars, essentially no open issues.

### #5 — zcaceres/markdownify-mcp (94.73)

**100% issue close rate** across 25 issues. Converts URLs, PDFs, Word docs, HTML, and plain text to Markdown. For AI agents, Markdown is the universal input format — this is the preprocessing layer that makes web content agent-readable.

### #6 — samanhappy/mcphub (94.47)

Orchestration layer for MCP. Centrally manages multiple MCP servers, routes requests with load balancing and failover. As agent deployments run 5–10 MCP servers simultaneously, this is the configuration plane that makes that manageable.

### #7 — perplexityai/modelcontextprotocol (94.27)

Official Perplexity AI MCP server — real-time web search for agents. An agent without this is epistemically bounded to its training data. An agent with this can answer questions about things that happened last week.

97.7% issue close rate, direct Perplexity engineering ownership.

### #8 — microsoft/playwright-mcp (94.26)

Most-starred tool in the list at **28,849 stars**. Official Microsoft Playwright server — browser automation, UI testing, web scraping as MCP tools. 97.1% issue close rate (743/765), 62 contributors, active weekly commits.

Ranks #8 not #1 because TypeScript tool binaries aren't tracked for npm dependents the same way packages are — suppresses the signal despite widespread actual adoption.

### #9 — oraios/serena (93.61)

**134 contributors** — most in the top 10. Semantic code retrieval and editing via MCP — language-server-level symbol navigation, not file reads. Agents using Serena navigate large codebases without loading entire files into context. Cost savings compound at scale.

### #10 — mcp-use/mcp-use (93.1)

Framework that connects any LLM to any MCP server. **377 dependent repos** — embedded in other people's tools, not just used directly. The connection layer for multi-model setups where you run different models for different tasks.

## What the top 10 tell you

1. **Issue close rate above 85% is table stakes.** Nine of ten meet this bar. A server with 200 open issues and no activity is a maintenance burden waiting to happen.

2. **Most-starred ≠ highest-scoring.** Playwright MCP: 28,849 stars, ranks #8. unity-mcp: 7,003 stars, ranks #1. Stars measure historical visibility. Score measures current quality.

3. **Dependents are the hardest signal to fake.** laravel/boost has 1,032. mcp-use has 377. These are repos embedded in real production projects.

---

- [Browse the full live leaderboard](https://agentrank-ai.com/tools/) — 25,000+ tools, updated nightly
- [Scoring methodology](https://agentrank-ai.com/methodology/)
- [API docs](https://agentrank-ai.com/docs/api/) — query rankings programmatically (free)
- [The State of MCP Ecosystem in 2026](https://agentrank-ai.com/blog/state-of-mcp-2026/)
