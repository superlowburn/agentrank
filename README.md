# AgentRank

**Google PageRank for AI agents.** A live, daily-updated index of 25,000+ MCP servers and agent tools — scored by real GitHub signals, not just star counts.

[![npm version](https://img.shields.io/npm/v/agentrank-mcp-server?color=blue)](https://www.npmjs.com/package/agentrank-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/agentrank-mcp-server)](https://www.npmjs.com/package/agentrank-mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/superlowburn/agentrank?style=flat)](https://github.com/superlowburn/agentrank/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Last commit](https://img.shields.io/github/last-commit/superlowburn/agentrank)](https://github.com/superlowburn/agentrank/commits/main)

---

## Install in 3 Steps

**1. Add to your AI tool:**

```bash
# Claude Code
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

**2. Ask your AI to find a tool:**

> "Find me an MCP server for database access"

**3. Get ranked, current results — automatically.**

That's it. No API key, no config, no prompting. Your AI searches the live index whenever it needs a tool.

> [Cursor, VS Code, Cline, Claude Desktop, Windsurf →](https://agentrank-ai.com/integrations/?utm_source=github&utm_medium=readme)

---

## Why AgentRank?

- **Your AI's knowledge is stale.** Training data is months old — it can't know if a tool was abandoned last week or if something better shipped yesterday.
- **Stars lie.** A repo with 2,000 stars and no commits in 18 months isn't production-ready. AgentRank weighs freshness, issue health, and dependents — not just popularity.
- **25,000+ tools, scored daily.** The index crawls GitHub nightly. Every recommendation reflects what's happening now.
- **Gets smarter with use.** Every query surfaces which tools developers actually reach for, sharpening rankings for everyone.

---

## Demo

```
> search("postgres mcp server")

1. postgres-mcp          Score: 91  ★ 2.1k  Updated: 2d ago
2. mcp-server-postgres   Score: 84  ★ 891   Updated: 5d ago
3. pg-mcp                Score: 71  ★ 432   Updated: 12d ago
```

```
> lookup("github.com/modelcontextprotocol/servers")

{
  "name": "modelcontextprotocol/servers",
  "agentrank_score": 97,
  "stars": 14200,
  "last_commit": "1 day ago",
  "dependents": 1840,
  "issue_health": 0.91
}
```

---

## Links

- [agentrank-ai.com](https://agentrank-ai.com/?utm_source=github&utm_medium=readme) — Browse the full index
- [API Docs](https://agentrank-ai.com/api-docs/?utm_source=github&utm_medium=readme) — Use the REST API directly
- [Blog](https://agentrank-ai.com/blog/?utm_source=github&utm_medium=readme) — MCP server guides and comparisons
- [npm: agentrank-mcp-server](https://www.npmjs.com/package/agentrank-mcp-server) — The MCP server package

---

## Repo Structure

```
crawler/     GitHub crawler — finds and indexes repos nightly
scorer/      Scoring engine — 5-signal composite score (0-100)
mcp-server/  MCP server package published to npm
workers/     Cloudflare Workers API
site/        Astro frontend (agentrank-ai.com)
```

---

## How the Score Works

Five signals, weighted by signal quality:

| Signal | Weight | What it measures |
|--------|--------|-----------------|
| Freshness | 25% | Days since last commit — stale repos decay fast |
| Issue health | 25% | Closed / total issues — maintainer responsiveness |
| Dependents | 25% | Repos that depend on this — real-world adoption |
| Stars | 15% | Raw popularity signal |
| Contributors | 10% | Bus factor — solo projects score lower |

Scores are recomputed nightly from live GitHub data.

---

MIT License · Built by [@comforteagle](https://x.com/comforteagle)
