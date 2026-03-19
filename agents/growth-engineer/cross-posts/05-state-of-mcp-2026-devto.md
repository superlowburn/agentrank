---
title: "The State of MCP Servers & Agent Tools in 2026"
published: false
tags: mcp, ai, opensource, agenttools
canonical_url: https://agentrank-ai.com/blog/state-of-mcp-2026/
description: "We indexed 25,632 MCP server repositories. Here's what the data actually shows — language breakdown, freshness distribution, score tiers, and the top 10 by real signals."
cover_image: https://agentrank-ai.com/og/state-of-mcp-2026.png
---

*Originally published at [agentrank-ai.com](https://agentrank-ai.com/blog/state-of-mcp-2026/)*

We crawled GitHub and indexed **25,632 MCP server repositories** and **3,124 agent skills**. Total stars across the ecosystem: **1.2 million**. Here is what the data actually shows — not opinions, not vibes.

## Ecosystem overview

The Model Context Protocol was announced by Anthropic in late 2024. As of March 2026:

| Metric | Value |
|--------|-------|
| GitHub repositories indexed | 25,632 |
| Skills from registries | 3,124 |
| Total stars across all repos | 1.2M |
| Average AgentRank score (0–100) | 23.4 |

Of those 25,632 repositories, **96.8% are MCP servers** or server-adjacent tools. The remaining **3.2% (733 repos) are A2A (agent-to-agent) tools**. The MCP ecosystem dwarfs A2A right now. That gap will close as A2A matures.

**1,271 repositories (4.96%) are archived** — abandoned, deprecated, or superseded. This is a low churn rate for a young ecosystem. Our scoring penalizes archived repos heavily.

## Language breakdown

Python and TypeScript together cover **65.8%** of the ecosystem. Both have strong LLM/AI communities and Anthropic published official SDKs for both. Go is punching above its weight at 4.8%, driven largely by mark3labs/mcp-go (#4 overall).

| Language | Repos | Share |
|----------|-------|-------|
| Python | 9,230 | 36.0% |
| TypeScript | 7,625 | 29.8% |
| JavaScript | 2,845 | 11.1% |
| Go | 1,231 | 4.8% |
| Rust | 667 | 2.6% |
| Java | 512 | 2.0% |
| Other | 3,522 | 13.7% |

Rust's 2.6% share is notable. Rust MCP implementations are typically high-quality and performance-focused — they disproportionately appear in the high-score tier.

## Freshness & activity

One of the five AgentRank signals is *freshness* — days since the last commit.

| Last commit | Repos | Share |
|-------------|-------|-------|
| Last 30 days | 6,252 | 24.4% |
| 31–90 days | 5,451 | 21.3% |
| 91–365 days | 13,918 | 54.3% |

**54.3% of repos haven't been touched in 91–365 days.** This is the long tail of experiments that were started and left standing — not abandoned, just stable or stalled.

**24.4% of repos saw commits in the last 30 days.** That's roughly 6,252 projects being actively worked on. In an ecosystem this young, that's a healthy active-project ratio.

Year-over-year: **38.7% of repos have 2026 commits**, meaning nearly 2 in 5 projects are in active development this year.

## Score distribution

The AgentRank score is a composite of five signals: stars (15%), freshness (25%), issue health (25%), contributor count (10%), and inbound dependents (25%). Scores run 0–100.

| Score tier | Count | Share |
|------------|-------|-------|
| Elite (80–100) | 152 | 0.6% |
| High (60–79) | 821 | 3.2% |
| Medium (40–59) | 6,383 | 24.9% |
| Low (20–39) | 11,203 | 43.7% |
| Basement (0–19) | 7,073 | 27.6% |

**Only 152 tools (0.6%) reach the Elite tier (80+).** These are the tools with strong community adoption, active maintenance, responsive issue management, and meaningful dependents.

The **Medium tier (40–59) holds 24.9%** — tools that have found some users and are maintained but haven't hit critical mass. This is the most interesting cohort: tools that are genuinely useful but underexposed.

## Top 10 by AgentRank score

Stars don't determine rank — freshness, issue health, and dependents matter equally or more.

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

Notable: **microsoft/playwright-mcp (#8, score 94.26)** is the most-installed MCP tool by far at 1.77 million Glama installs — but ranks #8 because CoplayDev/unity-mcp has superior issue health and freshness signals. Stars and installs alone don't win the index.

**PHP gets a top-3 entry** via laravel/boost. The Laravel community adopted MCP fast and the official team's involvement gives it strong maintenance signals.

## Stars vs. score: the gap

| Repository | Stars | Score | Note |
|-----------|-------|-------|------|
| punkpeye/awesome-mcp-servers | 83,027 | 71.48 | Curated list, not an active tool |
| github/github-mcp-server | 27,865 | 85.44 | Actively maintained by GitHub |
| microsoft/playwright-mcp | 28,849 | 94.26 | Official, elite tier |

punkpeye/awesome-mcp-servers has 83,027 stars but scores only 71.48 — it's a curated list, not a tool. Use the AgentRank score, not star count, when choosing a tool to depend on.

## The solo-builder problem

**78.2% of repositories have a single contributor.** This is the single most important risk factor in the ecosystem. Solo projects are inherently higher risk: one person's burnout, one life change, and the project goes dark.

The top-scoring tools largely avoid this problem. Eight of the top 10 have 10+ contributors. The two that don't — zcaceres/markdownify-mcp and Pimzino/spec-workflow-mcp — compensate with extremely high issue close rates, signaling a highly disciplined solo maintainer.

**Counterpoint:** Solo projects dominate the Medium tier (40–59) because many are focused, high-quality tools for narrow use cases. The bus factor risk is real but manageable when the tool is simple and well-documented enough that forks are viable.

## License breakdown

| License | Count | Share |
|---------|-------|-------|
| MIT | 16,438 | 64.1% |
| Apache 2.0 | 4,320 | 16.9% |
| GPL variants | 1,845 | 7.2% |
| Unlicensed | 2,103 | 8.2% |
| Other | 926 | 3.6% |

**8.2% of repos have no license** — meaning legally you can't use them in commercial projects. Check licenses before depending on any MCP server for production work.

## Trends & takeaways

1. **MCP has won.** 25,632 repos in under 18 months is ecosystem-level adoption. For comparison, Docker had ~5,000 public images at 18 months.

2. **Quality is concentrated.** 0.6% of tools reach the Elite tier. The top 100 tools account for a disproportionate share of actual usage.

3. **Stars are a lagging indicator.** The #1 ranked tool (unity-mcp) has 7,003 stars. The most-starred tool (punkpeye/awesome-mcp-servers) has 83,027 but scores 71.48. Sort by AgentRank score, not stars.

4. **Official vendor involvement is the strongest quality signal.** Microsoft (2 tools), Laravel/Pimzino, Perplexity — corporate backing correlates with high maintenance signals. But it's not sufficient: a solo project with a 100% close rate can outscore a corporate project with a neglected issue queue.

5. **The ecosystem is young and the distribution is right-skewed.** 71.3% of tools score below 40. There's enormous room for quality to compound. The tools building real dependents today are positioning for outsized scores over the next 12 months.

---

Data from the [AgentRank index](https://agentrank-ai.com) — 25,000+ MCP servers ranked by real quality signals, updated nightly.

- [Browse the full leaderboard](https://agentrank-ai.com/tools/)
- [Scoring methodology](https://agentrank-ai.com/methodology/)
- [API docs](https://agentrank-ai.com/docs/api/) — query the index programmatically (free)
- [Top 10 deep dives](https://agentrank-ai.com/blog/top-mcp-servers-2026/)
- Follow ecosystem updates: [@AgentRank_ai](https://x.com/AgentRank_ai)
