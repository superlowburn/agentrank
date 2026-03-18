# agentrank-mcp-server

**Google PageRank for AI agents.**

Install once and your AI automatically searches 25,000+ MCP servers and agent tools whenever it needs one. Scored daily from real GitHub signals. No configuration, no prompting — it just works.

Your AI's training data is months old. It can't tell you if a tool was abandoned last week, or that something better shipped yesterday. AgentRank gives it a live, ranked index so every recommendation is current.

## Quick Start

### Claude Code

```bash
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

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

Or copy with curl:

```bash
mkdir -p .cursor && curl -o .cursor/mcp.json https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/cursor/mcp.json
```

### VS Code (1.99+)

Add to `.vscode/mcp.json` in your project:

```json
{
  "inputs": [],
  "servers": {
    "agentrank": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "agentrank-mcp-server"]
    }
  }
}
```

Or copy with curl:

```bash
mkdir -p .vscode && curl -o .vscode/mcp.json https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/vscode/mcp.json
```

### Cline

Open Cline in VS Code → **MCP Servers** → **Configure MCP Servers** and add:

```json
{
  "mcpServers": {
    "agentrank": {
      "command": "npx",
      "args": ["-y", "agentrank-mcp-server"],
      "disabled": false,
      "autoApprove": ["search", "lookup", "get_badge_url"]
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

### Windsurf / other MCP clients

```json
{
  "agentrank": {
    "command": "npx",
    "args": ["-y", "agentrank-mcp-server"]
  }
}
```

See [agentrank-ai.com/integrations](https://agentrank-ai.com/integrations/?utm_source=readme&utm_medium=npm&utm_campaign=mcp_server) for full platform guides including rules files for non-MCP editors.

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

Thin MCP wrapper over the [AgentRank API](https://agentrank-ai.com/api-docs/?utm_source=readme&utm_medium=npm&utm_campaign=mcp_server). Proxies requests to the live index, so results always reflect the latest nightly crawl. No local database, no configuration, no API key.

## Links

- [AgentRank](https://agentrank-ai.com/?utm_source=readme&utm_medium=npm&utm_campaign=mcp_server) — Browse the index
- [API Docs](https://agentrank-ai.com/api-docs/?utm_source=readme&utm_medium=npm&utm_campaign=mcp_server) — Use the API directly
- [GitHub](https://github.com/superlowburn/agentrank) — Source code
