# @agentrank/mcp-server

MCP server for querying the [AgentRank](https://agentrank-ai.com) index — a daily-updated, quality-scored directory of every MCP server, agent tool, and AI skill on GitHub.

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

## How It Works

This is a thin MCP wrapper over the [AgentRank API](https://agentrank-ai.com/api-docs/). It proxies requests to the live API, so results always reflect the latest nightly crawl. No local database or configuration needed.

## Links

- [AgentRank](https://agentrank-ai.com) — Browse the index
- [API Docs](https://agentrank-ai.com/api-docs/) — Use the API directly
- [GitHub](https://github.com/superlowburn/agentrank) — Source code
