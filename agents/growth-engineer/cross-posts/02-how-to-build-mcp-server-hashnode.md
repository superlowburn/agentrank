---
title: "How to Build an MCP Server in 2026"
subtitle: "From zero to a working server in one sitting — Python, TypeScript, and FastMCP with real code"
slug: how-to-build-an-mcp-server-2026
tags:
  - name: MCP
    slug: mcp
  - name: Python
    slug: python
  - name: TypeScript
    slug: typescript
  - name: Tutorial
    slug: tutorial
canonical: https://agentrank-ai.com/blog/how-to-build-an-mcp-server/
coverImage: https://agentrank-ai.com/og/how-to-build-an-mcp-server.png
---

*Originally published at [agentrank-ai.com](https://agentrank-ai.com/blog/how-to-build-an-mcp-server/)*

The Model Context Protocol lets any tool talk to any AI agent through a standardized interface. Building an MCP server means your API, database, or service becomes natively accessible to Claude, Cursor, Copilot, and every other MCP-compatible client. Here's how to do it — from zero to a working server in one sitting.

## What MCP actually is

MCP is a JSON-RPC-based protocol that defines how AI clients communicate with external tools and data sources. When you build an MCP server, you're exposing capabilities through three primitives:

- **Tools** — functions the AI can call (search a database, send an email, run a query)
- **Resources** — data sources the AI can read (files, API responses, database records)
- **Prompts** — reusable prompt templates the client can invoke

The protocol runs over stdio (for local servers) or HTTP+SSE (for remote servers). Claude Desktop, Cursor, VS Code Copilot, Cline, and dozens of other clients implement the protocol — so a server you build once works everywhere.

As of March 2026, the [AgentRank index](https://agentrank-ai.com) tracks **25,632 MCP-related repositories** on GitHub. The top-scoring ones follow the same patterns. This guide shows you those patterns.

## Framework options (ranked by AgentRank score)

| # | Framework | Score | Stars | Approach | Lang |
|---|-----------|-------|-------|----------|------|
| 1 | modelcontextprotocol/python-sdk | 92.14 | 4,821 | Low-level / Full control | Python |
| 2 | modelcontextprotocol/typescript-sdk | 91.88 | 5,102 | Low-level / Full control | TypeScript |
| 3 | jlowin/fastmcp | 89.44 | 6,734 | High-level / FastAPI-style | Python |
| 4 | wong2/litestar-mcp | 76.21 | 887 | Framework integration | Python |

**Rule of thumb:** Python + want to go fast → FastMCP. TypeScript or need full protocol control → official SDK.

## Quickstart: Python with FastMCP

```bash
pip install fastmcp
```

```python
from fastmcp import FastMCP

mcp = FastMCP("My Tool Server")

@mcp.tool()
def search_products(query: str, limit: int = 10) -> list[dict]:
    """Search the product catalog by keyword."""
    return [{"id": 1, "name": "Widget", "price": 9.99}]

@mcp.resource("catalog://products")
def get_all_products() -> str:
    """Full product catalog as JSON."""
    return '{"products": [...]}'

if __name__ == "__main__":
    mcp.run()  # stdio transport by default
```

That's a complete MCP server. The `@mcp.tool()` decorator registers a callable tool. The docstring becomes the tool's description that the AI uses to decide when to call it. Type hints become the parameter schema.

Connect to Claude Desktop by editing `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-tool-server": {
      "command": "python",
      "args": ["/path/to/server.py"]
    }
  }
}
```

## Quickstart: TypeScript SDK

```bash
npm install @modelcontextprotocol/sdk
```

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "My Tool Server",
  version: "1.0.0",
});

server.tool(
  "search_products",
  "Search the product catalog by keyword",
  { query: z.string(), limit: z.number().optional().default(10) },
  async ({ query, limit }) => {
    return {
      content: [{ type: "text", text: JSON.stringify([{ id: 1, name: "Widget" }]) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Core concepts

**Tools:** Functions the AI calls to take action or retrieve data. The description is critical — it's what the model reads to decide whether to call your tool. Be explicit about what it does and when to use it.

**Resources:** URIs that expose read-only data. Use for data the AI should pull into context without triggering an action: config files, documentation, data schemas.

**Prompts:** Named workflow templates. Implement when you have high-value workflows users run repeatedly.

**Transport:** Stdio for local servers (simple, works with Claude Desktop immediately). HTTP+SSE for remote multi-tenant servers.

## Production checklist

**Error handling — return structured errors, not exceptions:**
```python
# Bad
raise ValueError("No results found")

# Good — AI can retry with different params
return {"error": "No results found for query 'xyz'"}
```

**Schema quality:** Add description strings to every parameter. Poorly documented schemas mean the AI guesses — and guesses wrong.

**Testing:** Use the MCP Inspector CLI:
```bash
npx @modelcontextprotocol/inspector
```

**Publishing:** Once it works locally, publish to PyPI or npm. Inbound dependents carry 25% of the AgentRank score. Servers with packages score significantly higher than source-only repos.

## Getting indexed on AgentRank

The [AgentRank crawler](https://agentrank-ai.com) picks up new MCP repos automatically within 24 hours. To maximize your score:

- GitHub topics: `mcp`, `mcp-server`, `model-context-protocol`
- Write a description mentioning MCP or Model Context Protocol
- Respond to issues quickly — issue health weighted at 25%
- Keep committing — freshness decays hard after 90 days
- Get dependents — 25% weight, strongest signal

---

- [Browse 25,000+ MCP servers](https://agentrank-ai.com/tools/) — use top-ranked ones as implementation references
- [Submit your server](https://agentrank-ai.com/submit/) to verify it's indexed
- [FastMCP tutorial (20 min)](https://agentrank-ai.com/blog/fastmcp-tutorial-python-mcp-server/)
