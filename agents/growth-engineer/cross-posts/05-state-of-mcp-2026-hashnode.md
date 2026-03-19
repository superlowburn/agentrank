---
title: "The State of MCP Servers & Agent Tools in 2026"
subtitle: "We indexed 25,632 MCP repositories. Here's what the data actually shows — no opinions, just signals."
slug: state-of-mcp-servers-agent-tools-2026
tags:
  - name: MCP
    slug: mcp
  - name: AI
    slug: ai
  - name: Data
    slug: data
  - name: Open Source
    slug: open-source
canonical: https://agentrank-ai.com/blog/state-of-mcp-2026/
coverImage: https://agentrank-ai.com/og/state-of-mcp-2026.png
---

*Originally published at [agentrank-ai.com](https://agentrank-ai.com/blog/state-of-mcp-2026/)*

We crawled GitHub and indexed **25,632 MCP server repositories** and **3,124 agent skills**. Total stars across the ecosystem: **1.2 million**. Here's what the data shows.

## Ecosystem at a glance

| Metric | Value |
|--------|-------|
| GitHub repositories indexed | 25,632 |
| Skills from registries | 3,124 |
| Total stars across all repos | 1.2M |
| Average AgentRank score (0–100) | 23.4 |
| Archived / abandoned | 1,271 (4.96%) |

96.8% are MCP servers. 3.2% (733 repos) are A2A (agent-to-agent) tools. The MCP ecosystem is enormous compared to A2A right now.

## Language breakdown

| Language | Repos | Share |
|----------|-------|-------|
| Python | 9,230 | 36.0% |
| TypeScript | 7,625 | 29.8% |
| JavaScript | 2,845 | 11.1% |
| Go | 1,231 | 4.8% |
| Rust | 667 | 2.6% |
| Java | 512 | 2.0% |
| Other | 3,522 | 13.7% |

Python + TypeScript cover 65.8%. Go punches above its weight at 4.8%, driven by mark3labs/mcp-go. Rust implementations (2.6%) disproportionately appear in the high-score tier — they tend to be performance-focused and high quality.

## Freshness distribution

| Last commit | Repos | Share |
|-------------|-------|-------|
| Last 30 days | 6,252 | 24.4% |
| 31–90 days | 5,451 | 21.3% |
| 91–365 days | 13,918 | 54.3% |

54.3% haven't been touched in 91–365 days — experiments left standing, not necessarily abandoned. 24.4% (6,252 projects) are actively being worked on right now. 38.7% of repos have 2026 commits.

## Score distribution

AgentRank score = composite of stars (15%), freshness (25%), issue health (25%), contributors (10%), inbound dependents (25%).

| Score tier | Count | Share |
|------------|-------|-------|
| Elite (80–100) | 152 | 0.6% |
| High (60–79) | 821 | 3.2% |
| Medium (40–59) | 6,383 | 24.9% |
| Low (20–39) | 11,203 | 43.7% |
| Basement (0–19) | 7,073 | 27.6% |

Only 152 tools reach Elite tier. The Medium tier (24.9%) is the most interesting: tools that are genuinely useful but underexposed.

## Top 10 by AgentRank score

| # | Repository | Score | Stars | Lang |
|---|-----------|-------|-------|------|
| 1 | CoplayDev/unity-mcp | 98.67 | 7,003 | TypeScript |
| 2 | microsoft/azure-devops-mcp | 97.17 | 1,423 | TypeScript |
| 3 | laravel/boost | 96.94 | 4,208 | PHP |
| 4 | Pimzino/spec-workflow-mcp | 96.02 | 3,999 | TypeScript |
| 5 | zcaceres/markdownify-mcp | 94.73 | 2,449 | TypeScript |
| 6 | samanhappy/mcphub | 94.47 | 3,241 | Go |
| 7 | perplexityai/modelcontextprotocol | 94.27 | 2,016 | TypeScript |
| 8 | microsoft/playwright-mcp | 94.26 | 28,849 | TypeScript |
| 9 | oraios/serena | 93.61 | 21,474 | Python |
| 10 | mcp-use/mcp-use | 93.10 | 9,434 | TypeScript |

**microsoft/playwright-mcp** (#8) has 28,849 stars and 1.77M Glama installs but ranks #8 because CoplayDev/unity-mcp has superior issue health and freshness. Stars don't determine rank.

**PHP gets a top-3 entry** via laravel/boost. 1,032 dependent repos — real adoption that compounds the score.

## Stars vs. score: the gap matters

punkpeye/awesome-mcp-servers has 83,027 stars but scores 71.48 — it's a curated list, not a tool. github/github-mcp-server has 27,865 stars and scores 85.44 because it's actively maintained. **Sort by AgentRank score, not star count**, when choosing what to depend on in production.

## The solo-builder problem

**78.2% of repositories have a single contributor.** This is the biggest risk factor in the ecosystem. One person's burnout or life change and the project goes dark.

The top-scoring tools largely avoid this. Eight of the top 10 have 10+ contributors. The two that don't — markdownify-mcp and spec-workflow-mcp — compensate with extremely high issue close rates (100% and 97.7%).

## Key takeaways

1. **MCP has won.** 25,632 repos in under 18 months is ecosystem-level adoption.

2. **Quality is concentrated.** 0.6% of tools reach Elite tier. The top 100 account for a disproportionate share of actual usage.

3. **Stars are a lagging indicator.** Sort by score, not stars.

4. **Official vendor involvement is the strongest quality signal** — but a disciplined solo maintainer with a 100% close rate can outscore a corporate project with a neglected issue queue.

5. **8.2% of repos have no license.** Check licenses before depending on any MCP server for commercial production work.

---

Data from the [AgentRank index](https://agentrank-ai.com) — 25,000+ MCP servers ranked by real signals, updated nightly.

- [Browse the full leaderboard](https://agentrank-ai.com/tools/)
- [Top 10 deep dives](https://agentrank-ai.com/blog/top-mcp-servers-2026/)
- [API docs](https://agentrank-ai.com/docs/api/) — query the index programmatically (free)
- [Scoring methodology](https://agentrank-ai.com/methodology/)
