# AgentRank Newsletter #5 — Draft

> **STATUS: DRAFT — Do NOT send. Steve must approve before sending.**

Generated: 2026-03-19

---

## Subject Line Options

1. `AWS, MongoDB, Dynatrace: the enterprise MCP servers are here`
2. `The MCP ecosystem now has 452 servers. Here's how to find the ones worth using.`
3. `AgentRank #5: Enterprise MCP servers, ranked`

**Recommended:** Option 1 — name recognition drives opens.

---

## Preview Text

`We track 452 MCP servers. AWS's suite has 81k stars. MongoDB's has 423k installs. Only one of those is a useful signal.`

---

## Body

---

**AgentRank** | Issue #5 | Week of April 2, 2026

---

### The enterprise MCP wave

A pattern we're watching: major software companies are now shipping first-party MCP servers. AWS, MongoDB, Dynatrace, and others have published official servers that let AI agents interact with their platforms directly.

The index now tracks 452 MCP servers. Here's how the enterprise entries stack up.

---

### Top MCP servers from enterprise publishers

| # | Tool | Score | Stars | Installs | Publisher |
|---|------|-------|-------|----------|-----------|
| 1 | [AWS Nova Canvas (awslabs/mcp)](https://agentrank-ai.com/tool/glama/awslabs/mcp) | 82.9 | 81,235 | 312,310 | Amazon Web Services |
| 2 | [Unity MCP (IvanMurzak/Unity-MCP)](https://agentrank-ai.com/tool/glama/IvanMurzak/Unity-MCP) | 76.8 | 1,339 | 372,374 | Community (Unity dev) |
| 3 | [MongoDB MCP Server](https://agentrank-ai.com/tool/glama/mongodb-js/mongodb-mcp-server) | 77.3 | 965 | 422,883 | MongoDB |
| 4 | [Repomix (yamadashy/repomix)](https://agentrank-ai.com/tool/glama/yamadashy/repomix) | 70.5 | 22,501 | — | Community |
| 5 | [Dynatrace MCP Server](https://agentrank-ai.com/tool/glama/dynatrace-oss/dynatrace-mcp) | 65.6 | 93 | — | Dynatrace |

---

### Stars vs. installs: the split that matters

The AWS entry (`awslabs/mcp`) has 81,235 GitHub stars and 312,310 Glama installs. The MongoDB MCP Server has 965 stars but 422,883 installs.

MongoDB's server gets installed 1.35× more than AWS's despite having 84× fewer stars.

Two explanations:
1. MongoDB has clearer utility for a single use case (connect AI to your database). AWS's repo hosts multiple servers — the star count is aggregated but the installs are split across specific tools.
2. Glama's install metric captures a different distribution channel than GitHub star discovery. Developers searching for "MongoDB MCP" on Glama find it and install it; the GitHub stars don't reflect that journey.

This is why we track both signals and don't treat stars as a proxy for usage.

---

### The Dynatrace entry

Dynatrace shipped `dynatrace-mcp` with 93 stars but a 65.6 score (rank #340). That score comes from strong issue health — they're closing issues faster than most open-source projects. Enterprise maintainers with full-time ownership close issues at a different rate than solo developers.

If you're using Dynatrace for observability, this is worth knowing about. It scored well enough on maintenance signals that it surfaces in this category despite minimal community visibility.

---

### What's coming

The enterprise MCP wave is early. AWS and MongoDB are here. Expect Stripe, Twilio, Datadog, and Snowflake to follow. When they ship official MCP servers, we'll have the data to tell you which ones are actually maintained versus which ones are announcement-ware.

The score doesn't care who published it. Only: is it maintained? Is the maintainer responsive?

---

### Spotlight tool: Repomix

`yamadashy/repomix` (rank #311, 70.5 score, 22.5k stars) packs an entire codebase into a single file for AI consumption. It's not technically a database tool or a cloud tool — it's infrastructure for giving AI agents better context about code. One of the most practically useful tools in the index for any developer workflow.

---

### This week's leaderboard (top 5)

| # | Tool | Score |
|---|------|-------|
| 1 | CoplayDev/unity-mcp | 98.7 |
| 2 | microsoft/azure-devops-mcp | 97.2 |
| 3 | laravel/boost | 96.9 |
| 4 | CoderGamester/mcp-unity | 96.4 |
| 5 | mark3labs/mcp-go | 96.3 |

Full rankings: [agentrank-ai.com](https://agentrank-ai.com)

---

You're receiving this because you signed up for AgentRank updates.
[Unsubscribe](#) | [View in browser](#)

---

*AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools. Scores update daily.*
