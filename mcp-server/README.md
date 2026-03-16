# @agentrank/mcp-server

**Your AI's tool recommendations are only as good as its data.**

Right now, when your AI assistant recommends an MCP server or agent tool, it guesses from training data that's months old. It can't tell you if something was abandoned last week. It doesn't know about the tool that shipped yesterday. And it has no idea that the thing it's about to suggest has 47 open issues and one burned-out maintainer.

AgentRank fixes this. Install this MCP server and your AI gets live, quality-scored data on 25,000+ tools — updated nightly from real GitHub signals.

**The difference:**

- **Without AgentRank:** You ask for a database MCP server. Your AI recommends one from memory. It was abandoned 8 months ago.
- **With AgentRank:** Your AI queries the live index. It finds the tool you asked for — plus three related ones you didn't know existed. You start the project fully armed instead of flying blind.

## Quick Start

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agentrank": {
      "command": "npx",
      "args": ["-y", "@agentrank/mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add agentrank -- npx -y @agentrank/mcp-server
```

### Cursor / Windsurf

Add to your MCP configuration:

```json
{
  "agentrank": {
    "command": "npx",
    "args": ["-y", "@agentrank/mcp-server"]
  }
}
```

## Tools

### `search`

Search the index for MCP servers, tools, or skills by keyword.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | yes | Search terms |
| `type` | `"tool"` \| `"skill"` | no | Filter results |
| `limit` | number (1-50) | no | Max results (default 10) |

### `lookup`

Check if a specific GitHub repository is in the index.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `github_url` | string | yes | GitHub repo URL |

### `get_badge_url`

Get an embeddable badge for a tool or skill's AgentRank score.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Tool/skill slug |
| `type` | `"tool"` \| `"skill"` | yes | Entry type |

## Why It Gets Better

Every agent that queries AgentRank makes the index smarter. More queries surface which tools developers actually reach for, which sharpens the rankings for everyone. The more people who install this, the better every recommendation gets — for you and every other developer whose AI uses it.

## How It Works

Thin MCP wrapper over the [AgentRank API](https://agentrank-ai.com/api-docs/). Proxies requests to the live index, so results always reflect the latest nightly crawl. No local database, no configuration, no API key.

## Links

- [AgentRank](https://agentrank-ai.com) — Browse the index
- [API Docs](https://agentrank-ai.com/api-docs/) — Use the API directly
- [GitHub](https://github.com/superlowburn/agentrank) — Source code
