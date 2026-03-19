---
title: "Top 10 MCP Servers for AI Agents in 2026 (Ranked by Real Data)"
published: false
tags: mcp, ai, agenttools, tooling
canonical_url: https://agentrank-ai.com/blog/top-mcp-servers-2026/
description: "The 10 highest-scoring MCP servers from 25,000+ in the AgentRank index. Ranked by composite signal — stars, freshness, issue health, contributors, and dependents. Updated March 2026."
cover_image: https://agentrank-ai.com/og/top-mcp-servers-2026.png
---

*Originally published at [agentrank-ai.com](https://agentrank-ai.com/blog/top-mcp-servers-2026/)*

The [AgentRank index](https://agentrank-ai.com) now tracks **25,632 MCP servers and agent tools**. Average score across the entire ecosystem: **29.6 out of 100**. The tools below are the top 10 across the entire index — not sorted by GitHub stars, not by recent hype, but by a composite signal of five real quality indicators scored daily.

## How the score works

**Stars (15%)** — raw popularity signal
**Freshness (25%)** — days since last commit. Decays hard after 90 days
**Issue health (25%)** — closed issues / total issues. Measures maintainer responsiveness
**Contributors (10%)** — more than one = less bus factor risk
**Inbound dependents (25%)** — how many other repos depend on this. Strongest signal of real-world adoption

## The top 10 MCP servers (March 2026)

| # | Repository | Score | Stars | Close% | Category | Lang |
|---|-----------|-------|-------|--------|----------|------|
| 1 | CoplayDev/unity-mcp | 98.67 | 7,003 | 95.7% | Game Dev | TypeScript |
| 2 | microsoft/azure-devops-mcp | 97.17 | 1,423 | 96.8% | DevOps | TypeScript |
| 3 | laravel/boost | 96.94 | 4,208 | 91.3% | PHP/Web | PHP |
| 4 | Pimzino/spec-workflow-mcp | 96.02 | 3,999 | 97.7% | Dev Workflow | TypeScript |
| 5 | zcaceres/markdownify-mcp | 94.73 | 2,449 | 100.0% | Utilities | TypeScript |
| 6 | samanhappy/mcphub | 94.47 | 3,241 | 88.0% | Orchestration | Go |
| 7 | perplexityai/modelcontextprotocol | 94.27 | 2,016 | 97.7% | Search / AI | TypeScript |
| 8 | microsoft/playwright-mcp | 94.26 | 28,849 | 97.1% | Browser Automation | TypeScript |
| 9 | oraios/serena | 93.61 | 21,474 | 85.2% | Coding Agents | Python |
| 10 | mcp-use/mcp-use | 93.10 | 9,434 | 76.0% | Frameworks | TypeScript |

All data reflects the AgentRank crawler run from March 2026.

## Deep dives

### #1 — CoplayDev/unity-mcp (98.67)

The highest-scoring MCP server in the entire index. It bridges AI assistants — Claude, Cursor, Copilot — directly to the Unity Editor. An agent can manage assets, create and modify scenes, edit C# scripts, and automate game development tasks entirely through MCP calls.

7,003 stars, 43 contributors, last commit March 12. Issue close rate is 95.7% (353 closed, 16 open). That combination of recency, responsiveness, and adoption is what drives the top score. It's not just popular — it's actively maintained with a disciplined issue queue.

### #2 — microsoft/azure-devops-mcp (97.17)

The official Microsoft MCP server for Azure DevOps. It exposes work items, pull requests, pipelines, repositories, and test plans as MCP tools — an agent on Claude or Copilot can create issues, query build statuses, review PRs, and trigger deployments without leaving the conversation.

Exceptional issue health: 96.8% close rate (425 closed, 14 open). For a tool with 45 contributors and direct Microsoft backing, that responsiveness is consistent and predictable.

### #3 — laravel/boost (96.94)

The official Laravel MCP server for AI-augmented local development. It connects AI assistants to a Laravel project's artisan commands, routes, models, and database schema — giving agents context about the application structure otherwise locked inside the codebase.

What makes this stand out: **1,032 dependent repos**. In the AgentRank scoring model, inbound dependents carry 25% weight because they signal real-world adoption beyond starred interest.

### #4 — Pimzino/spec-workflow-mcp (96.02)

Scores 96.02 with the highest issue close rate in the top 10: 97.7% (130 closed, 3 open). Provides structured, spec-driven development workflow tools for AI-assisted software development — with a real-time web dashboard and VSCode extension to monitor agent progress.

The core workflow: an agent reads a spec, breaks it into tasks, executes them, and updates the dashboard. Humans monitor via the VSCode extension. 3,999 stars with essentially no open issues is a strong credibility signal for a single-maintainer project.

### #5 — zcaceres/markdownify-mcp (94.73)

Has a unique distinction: **100% issue close rate** across 25 issues. It converts almost anything to Markdown: URLs, PDFs, Word documents, HTML, plain text.

For AI agents, Markdown is the universal input format. Raw HTML and PDFs are noisy and token-heavy. Markdownify-mcp is the preprocessing layer that strips structure down to clean, agent-readable text.

### #6 — samanhappy/mcphub (94.47)

Solves a problem that grows proportionally with your MCP stack: orchestration. It's a unified hub that centrally manages multiple MCP servers and routes requests between them with flexible strategies — load balancing, failover, endpoint isolation.

As MCP adoption increases, most production agent deployments run several servers simultaneously: a GitHub server, a database server, a search server. Without an orchestration layer, each gets configured separately. MCPHub provides the central configuration plane.

### #7 — perplexityai/modelcontextprotocol (94.27)

The official Perplexity AI MCP server — giving any MCP-connected agent access to real-time web search. An agent that only has access to its training data is epistemically bounded. An agent with Perplexity access can answer questions about things that happened last week.

97.7% issue close rate (42 closed, 1 open) reflects direct Perplexity engineering ownership.

### #8 — microsoft/playwright-mcp (94.26)

The most-starred tool in this list at **28,849 stars**. The official Playwright MCP server from Microsoft — browser automation, UI testing, and web scraping exposed as MCP tools.

For agents that need to navigate the web, fill forms, screenshot pages, or run end-to-end tests, Playwright MCP is the standard. The 97.1% issue close rate (743/765) across 62 contributors makes it the most battle-tested browser automation server in the index.

It ranks #8 rather than #1 because dependents aren't tracked for TypeScript tool binaries the same way npm packages are, which suppresses the dependent signal despite actual widespread adoption.

### #9 — oraios/serena (93.61)

**134 contributors** — most in the top 10. A coding agent toolkit that provides semantic code retrieval and editing via MCP — not file reads, but language-server-level symbol navigation, definition jumps, and semantic search.

Agents using Serena can navigate large codebases efficiently without loading entire files into context, which compounds cost savings at scale.

### #10 — mcp-use/mcp-use (93.1)

The framework layer that connects any LLM — not just Claude — to any MCP server. **377 dependent repos** signal that developers are building on top of it, not just using it directly.

For teams building multi-model setups — running Claude for reasoning, a smaller model for classification — mcp-use is the connection layer that makes that work with MCP servers built for any specific model.

## What the top 10 have in common

1. **Issue close rate above 85% is table stakes.** Nine of ten have close rates above 85%. Issue health is the single most predictive signal for whether a tool will be usable in production six months from now.

2. **Most-starred ≠ highest-scoring.** Playwright MCP has 28,849 stars and ranks #8. unity-mcp has 7,003 stars and ranks #1. Stars lag real quality signals.

3. **Corporate backing accelerates maintenance signals.** Three Microsoft repos and one each from Perplexity, Laravel, and Pimzino appear in the top 10. Official backing correlates with high issue close rates.

4. **Dependents are the hardest signal to fake.** mcp-use and laravel/boost have 377 and 1,032 dependents respectively. These repos are embedded in other people's projects — real-world adoption that stars alone can't fake.

---

- [Browse the full live leaderboard](https://agentrank-ai.com/tools/) — 25,000+ tools, updated nightly
- [Read the scoring methodology](https://agentrank-ai.com/methodology/)
- [API docs](https://agentrank-ai.com/docs/api/) — query rankings programmatically (free)
- [The State of MCP in 2026](https://agentrank-ai.com/blog/state-of-mcp-2026/) — full ecosystem data
