---
title: "How to Build an MCP Server in 2026"
published: false
tags: mcp, tutorial, python, typescript
canonical_url: https://agentrank-ai.com/blog/how-to-build-an-mcp-server/
description: "Step-by-step guide to building a Model Context Protocol server using the official Python SDK, TypeScript SDK, or FastMCP. With code examples and framework comparisons from 25,000+ real implementations."
cover_image: https://agentrank-ai.com/og/how-to-build-an-mcp-server.png
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

You have two decisions: language (Python vs TypeScript) and abstraction level (official SDK vs higher-level framework).

| # | Framework | Score | Stars | Approach | Lang |
|---|-----------|-------|-------|----------|------|
| 1 | modelcontextprotocol/python-sdk | 92.14 | 4,821 | Low-level / Full control | Python |
| 2 | modelcontextprotocol/typescript-sdk | 91.88 | 5,102 | Low-level / Full control | TypeScript |
| 3 | jlowin/fastmcp | 89.44 | 6,734 | High-level / FastAPI-style | Python |
| 4 | wong2/litestar-mcp | 76.21 | 887 | Framework integration | Python |

**Which to choose:** If you're building in Python and want the fastest path to a working server, use FastMCP. If you need full protocol control or are working in TypeScript, use the official SDK.

## Quickstart: Python with FastMCP

FastMCP is the most-starred Python MCP framework at 6,734 stars. It uses a decorator pattern borrowed from FastAPI — if you've used FastAPI, this will feel immediately familiar.

```bash
pip install fastmcp
```

```python
# server.py — minimal working server
from fastmcp import FastMCP

mcp = FastMCP("My Tool Server")

@mcp.tool()
def search_products(query: str, limit: int = 10) -> list[dict]:
    """Search the product catalog by keyword."""
    # Your implementation here
    return [{"id": 1, "name": "Widget", "price": 9.99}]

@mcp.resource("catalog://products")
def get_all_products() -> str:
    """Full product catalog as JSON."""
    return '{"products": [...]}'

if __name__ == "__main__":
    mcp.run()  # stdio transport by default
```

That's a complete MCP server. The `@mcp.tool()` decorator registers a callable tool. The docstring becomes the tool's description that the AI uses to decide when to call it. Type hints become the parameter schema. FastMCP handles all the JSON-RPC plumbing.

To run it locally with Claude Desktop, add the server to your `claude_desktop_config.json`:

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

The official TypeScript SDK has 5,102 stars and a score of 91.88 — the most-starred MCP framework overall. It gives you full protocol access with strong typing.

```bash
npm install @modelcontextprotocol/sdk
```

```typescript
// server.ts — minimal working server
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
    // Your implementation here
    return {
      content: [{ type: "text", text: JSON.stringify([{ id: 1, name: "Widget" }]) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

The TypeScript SDK uses Zod for schema validation on tool parameters.

## Core concepts: tools, resources, prompts

**Tools — what the agent can do**

Tools are functions the AI calls to take action or retrieve data. Good tool design: narrow scope, clear name, useful description. The description is critical — it's what the model reads to decide whether to call your tool. Be explicit about what it does and when to use it.

**Resources — what the agent can read**

Resources are URIs that expose data — like a filesystem path or an API endpoint. Resources are read-only. Use them for data that the AI should pull into context without triggering an action: config files, documentation, data schemas.

**Prompts — reusable instruction templates**

Prompts package specific workflows as named templates. Think of them as saved workflows — "analyze this PR for security issues." Most servers don't implement prompts. Implement them when you have known, high-value workflows users run repeatedly.

**Transport: stdio vs HTTP**

Stdio is the default for local servers — simple, no port management, works immediately with Claude Desktop and Cursor. HTTP+SSE is for remote servers you want multiple clients to connect to. Most servers start with stdio. Migrate to HTTP when you need multi-tenant access.

## Taking it to production

**Error handling:** Return structured error messages, not exceptions. The AI needs to read and understand errors to decide what to do next.

```python
# Bad — drops the connection
raise ValueError("No results found")

# Good — AI can retry with different params
return {"error": "No results found for query 'xyz'"}
```

**Schema quality:** Tool parameter schemas drive the AI's ability to call your tools correctly. Use descriptive field names, add descriptions to each parameter, mark optional fields as optional with defaults.

**Publishing:** Once your server works locally, publish it to PyPI or npm. This is what gets you inbound dependents — the strongest signal in the AgentRank score. Servers with npm packages score significantly higher on average than source-only repos.

**Testing:** Use the MCP Inspector CLI to validate tool responses interactively:

```bash
npx @modelcontextprotocol/inspector
```

## Get indexed on AgentRank

The [AgentRank crawler](https://agentrank-ai.com) runs nightly against GitHub and picks up new MCP repositories automatically. To maximize your score from day one:

- Add GitHub topics: `mcp`, `mcp-server`, `model-context-protocol`
- Write a description that mentions what the server does and the MCP protocol
- Respond to issues quickly — issue health is weighted 25% of the score
- Keep commits coming — freshness decays hard after 90 days
- Get other repos to depend on yours — inbound dependents carry 25% weight

---

- **Browse 25,000+ existing MCP servers** as implementation references: [agentrank-ai.com/tools](https://agentrank-ai.com/tools/)
- **Already built something?** [Submit your server](https://agentrank-ai.com/submit/) to verify it's indexed
- **Compare tools head-to-head:** [agentrank-ai.com/compare](https://agentrank-ai.com/compare/)
