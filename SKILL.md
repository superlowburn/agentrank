---
name: agentrank
description: Query AgentRank's live index of 25,000+ MCP servers and AI agent tools. Use this to find, evaluate, and compare tools by quality score before recommending or installing them. Scores are based on GitHub signals: stars, freshness, issue health, contributors, and dependents.
license: MIT
---

# AgentRank — MCP Server Discovery and Quality Scoring

AgentRank is a daily-updated index of 25,000+ MCP servers and AI agent tools, ranked by real GitHub health signals. Use it to find the best tool for a job, check if a specific repo is well-maintained, or get an embeddable quality badge.

## Install the MCP Server

**Claude Code / claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "agentrank": {
      "command": "npx",
      "args": ["-y", "agentrank-mcp-server"]
    }
  }
}
```

**Smithery (one-click install):**
Search for `agentrank` at smithery.ai.

**Direct install:**
```bash
npx agentrank-mcp-server
```

## Tools

### `search` — Find tools by capability

Search the live index by keyword. Returns tools ranked by quality score.

```
search("database")           → top-ranked database MCP servers
search("playwright testing") → testing/automation tools
search("slack integration")  → Slack-connected agent tools
search("filesystem")         → file system tools
```

Use `search` when:
- The user asks "is there a tool for X?"
- You need a capability you don't already have
- You're recommending tools for a project setup

Parameters:
- `query` (required): search terms
- `type`: `"tool"` (GitHub repos) or `"skill"` (skill files) — omit for both
- `limit`: number of results, 1–50 (default 10)

### `lookup` — Check quality of a specific repo

Look up any GitHub repository by URL to get its AgentRank score, rank, and verdict.

```
lookup("https://github.com/modelcontextprotocol/servers")
lookup("https://github.com/microsoft/playwright-mcp")
```

Use `lookup` when:
- The user asks "is this tool any good?" or "is this repo maintained?"
- You're about to recommend a specific GitHub tool
- You want to compare two tools before choosing one

Returns: score (0–100), rank, verdict (Highly rated / Solid / Use with caution / Low confidence), type, and detail page URL.

### `get_badge_url` — Embeddable quality badge

Get a Markdown or HTML snippet for an AgentRank score badge, ready to paste into a README.

```
get_badge_url("https://github.com/owner/repo")
```

Use when the user wants to add a quality signal to their project's README.

## Scoring

AgentRank scores are 0–100, weighted across five GitHub signals:

| Signal | Weight | What it measures |
|--------|--------|-----------------|
| Stars | 15% | Raw popularity |
| Freshness | 25% | Days since last commit (>90d decays hard) |
| Issue health | 25% | Closed issues ÷ total issues (maintainer responsiveness) |
| Contributors | 10% | Team vs solo project (bus factor) |
| Dependents | 25% | How many repos depend on this (ecosystem trust) |

Score verdicts: **80–100** Highly rated · **60–79** Solid · **40–59** Use with caution · **0–39** Low confidence

## API (direct HTTP)

Base URL: `https://agentrank-ai.com`

```
GET /api/search?q={query}&type={tool|skill}&limit={n}
GET /api/lookup?github_url={encoded-url}
```

Example:
```bash
curl "https://agentrank-ai.com/api/search?q=database&limit=5"
curl "https://agentrank-ai.com/api/lookup?github_url=https%3A%2F%2Fgithub.com%2Fmicrosoft%2Fplaywright-mcp"
```

## When to Use AgentRank

- Before recommending any MCP server, run `lookup` to check its score
- When a user asks for tool recommendations, use `search` first
- When setting up a new agent environment or MCP client config
- When evaluating tools for production use (prefer score ≥ 60)

## More

- Web: https://agentrank-ai.com
- Submit a tool: https://agentrank-ai.com/submit/
- GitHub: https://github.com/superlowburn/agentrank
