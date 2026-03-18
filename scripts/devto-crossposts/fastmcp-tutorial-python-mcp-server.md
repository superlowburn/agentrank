---
title: "FastMCP Tutorial: Build a Python MCP Server in 20 Minutes"
published: false
description: "Step-by-step FastMCP 3.0 tutorial: build a working Python MCP server from scratch with tools, resources, prompts, MCP Inspector testing, and Cloudflare Workers deployment."
tags: python, mcp, tutorial, ai
canonical_url: https://agentrank-ai.com/blog/fastmcp-tutorial-python-mcp-server/
---

FastMCP is the fastest way to build a Python MCP server. It downloads **over 1 million times per day**, powers roughly 70% of all Python MCP servers in production, and reaches a working server in under 10 lines of code. FastMCP 3.0, released January 2026, added composability, OpenAPI mounting, and proxy mode. This tutorial builds a real, functional server from scratch — tools, resources, prompts, testing, and deployment included.

## Contents

1. [What is FastMCP?](#what-is-fastmcp)
2. [What we'll build](#what-well-build)
3. [Installation](#installation)
4. [Step 1 — Your first tool](#step-1--your-first-tool)
5. [Step 2 — Resources](#step-2--resources)
6. [Step 3 — Prompts](#step-3--prompts)
7. [Step 4 — Test with MCP Inspector](#step-4--test-with-mcp-inspector)
8. [Step 5 — Connect to Claude Desktop](#step-5--connect-to-claude-desktop)
9. [Step 6 — Deploy to Cloudflare Workers](#step-6--deploy-to-cloudflare-workers)
10. [FastMCP 3.0 features: composability, OpenAPI, proxy](#fastmcp-30-features)
11. [What's next](#whats-next)

---

## What is FastMCP?

FastMCP is a high-level Python framework for building MCP (Model Context Protocol) servers and clients. It wraps the official `modelcontextprotocol/python-sdk` with a FastAPI-inspired decorator API that eliminates the protocol boilerplate: no manual JSON schema definitions, no transport setup, no capability negotiation. You write Python functions; FastMCP builds the MCP server.

The `PrefectHQ/fastmcp` repository currently holds an **AgentRank score of 90.7** — the highest of any Python MCP library in the index. 23,659 stars, 208 contributors, 83% issue close rate. It is the library the Python MCP ecosystem converged on.

> **FastMCP version history:** The original `jlowin/fastmcp` (v1) introduced the decorator pattern. PrefectHQ acquired and rebuilt it as `PrefectHQ/fastmcp` (v2). FastMCP 3.0, released January 2026, is the current version — installed as `pip install fastmcp` or `uv add fastmcp`.

---

## What we'll build

We'll build an **AgentRank query server** — an MCP server that lets Claude (or any MCP client) query the AgentRank index for tool rankings and ecosystem stats. By the end of this tutorial the server will expose:

- **Tools** — `search_tools`, `get_tool_score`, `get_top_tools`
- **Resources** — `agentrank://stats` (live index statistics)
- **Prompts** — `find_best_tool` (guided tool recommendation prompt)

The server will run locally for development, connect to Claude Desktop for testing, and deploy to Cloudflare Workers via the Streamable HTTP transport for production.

---

## Installation

FastMCP requires Python 3.10+. The recommended install path uses [uv](https://docs.astral.sh/uv/), Astral's fast Python package manager. If you're not on uv yet, `pip install fastmcp` works identically.

```bash
# Create project with uv
uv init agentrank-mcp
cd agentrank-mcp
uv add fastmcp
```

```bash
# Or with pip
mkdir agentrank-mcp && cd agentrank-mcp
python -m venv .venv && source .venv/bin/activate
pip install fastmcp
```

Verify the install:

```bash
python -c "import fastmcp; print(fastmcp.__version__)"
# 3.x.x
```

---

## Step 1 — Your first tool

Create `server.py`. A FastMCP server starts with three lines: import, instantiate, run. Every tool you add uses the `@mcp.tool()` decorator.

```python
# server.py — minimal server
from fastmcp import FastMCP

mcp = FastMCP("agentrank")

@mcp.tool()
def get_top_tools(category: str = "all", limit: int = 10) -> list[dict]:
    """Get the top-ranked MCP tools from the AgentRank index.

    Args:
        category: Filter by category. Options: all, python, typescript, devops, ai-ml.
        limit: Number of results to return. Max 50.
    """
    # Replace with real DB query in production
    return [
        {"rank": 1, "name": "PrefectHQ/fastmcp", "score": 90.7, "category": "python"},
        {"rank": 2, "name": "oraios/serena", "score": 66.6, "category": "python"},
        {"rank": 3, "name": "modelcontextprotocol/python-sdk", "score": 62.3, "category": "python"},
    ][:limit]

if __name__ == "__main__":
    mcp.run()
```

Run it:

```bash
python server.py
```

The server starts over stdio — the default transport for local development and Claude Desktop. No output means it's waiting for MCP client connections. That's correct behavior.

### How FastMCP builds the schema

FastMCP reads your function signature and docstring and automatically generates the MCP tool definition — name, description, and JSON schema for the input arguments. The `category: str = "all"` annotation becomes a string property with a default. The `limit: int = 10` becomes an integer property with a default. You never write a JSON schema by hand.

Add a second tool — one that takes a required argument:

```python
# server.py — add get_tool_score
@mcp.tool()
def get_tool_score(repo: str) -> dict:
    """Get the AgentRank score and signals for a specific GitHub repository.

    Args:
        repo: GitHub repository in owner/name format. Example: PrefectHQ/fastmcp
    """
    # Stub — replace with real lookup
    scores = {
        "PrefectHQ/fastmcp": {"score": 90.7, "stars": 23659, "issue_close_pct": 83},
        "modelcontextprotocol/python-sdk": {"score": 62.3, "stars": 22124, "issue_close_pct": 65},
    }
    result = scores.get(repo)
    if not result:
        return {"error": f"{repo} not found in index"}
    return {"repo": repo, **result}
```

### Type annotations FastMCP understands

FastMCP maps Python types directly to JSON Schema:

| Python type | JSON Schema type | Notes |
|------------|-----------------|-------|
| `str` | string | |
| `int` | integer | |
| `float` | number | |
| `bool` | boolean | |
| `list[str]` | array of strings | |
| `dict` | object | |
| `Optional[str]` | string or null | Makes parameter optional |
| Pydantic model | object with properties | Full schema from model fields |

For complex inputs, use Pydantic models as argument types — FastMCP generates the full JSON schema from the model's field definitions and validators.

---

## Step 2 — Resources

Resources expose read-only data to MCP clients via URIs. They're not function calls — they're data sources the client can read at any time, like files or database views. The `@mcp.resource()` decorator maps a URI pattern to a Python function.

```python
# server.py — add resource
@mcp.resource("agentrank://stats")
def get_index_stats() -> dict:
    """Live statistics about the AgentRank index."""
    return {
        "total_tools": 25632,
        "updated_at": "2026-03-18T00:00:00Z",
        "top_language": "TypeScript",
        "python_repos": 9869,
        "avg_score": 31.4,
        "active_maintainers": 14721,
    }
```

Resources also support URI templates — dynamic URIs where part of the path becomes a function argument:

```python
# server.py — resource with URI template
@mcp.resource("agentrank://tool/{owner}/{repo}")
def get_tool_resource(owner: str, repo: str) -> dict:
    """Full profile for a specific tool in the AgentRank index.

    URI: agentrank://tool/PrefectHQ/fastmcp
    """
    return {
        "repo": f"{owner}/{repo}",
        "url": f"https://github.com/{owner}/{repo}",
        "indexed": True,
    }
```

When a client requests `agentrank://tool/PrefectHQ/fastmcp`, FastMCP extracts `owner="PrefectHQ"` and `repo="fastmcp"` from the URI and passes them to the function. This pattern is identical to path parameters in FastAPI or Flask.

### Resources vs tools: the distinction

Use a **resource** for data that already exists and can be read without side effects — a config value, a database record, a file. Use a **tool** for operations that take action, have side effects, or require dynamic parameters. Most MCP servers need both.

---

## Step 3 — Prompts

Prompts are reusable message templates that MCP clients expose to users as slash commands or suggested actions. They return a list of messages — typically a user turn followed by optional context. The `@mcp.prompt()` decorator defines them.

```python
# server.py — add prompt
from fastmcp.prompts import Message

@mcp.prompt()
def find_best_tool(use_case: str, language: str = "any") -> list[Message]:
    """Generate a prompt to find the best MCP tool for a use case.

    Args:
        use_case: What you want to accomplish. Example: web scraping, database queries.
        language: Preferred programming language. Default: any.
    """
    context = f"Language preference: {language}" if language != "any" else "No language preference."
    return [
        Message(
            role="user",
            content=f"""I need to find the best MCP server for: {use_case}

{context}

Search the AgentRank index using get_top_tools, then use get_tool_score to compare
the top candidates. Recommend the single best option with a brief explanation of why
it ranks highest for this use case."""
        )
    ]
```

In Claude Desktop, prompts appear in the slash command menu as `/find_best_tool`. The user fills in the arguments and Claude executes the prompt — which then calls your tools automatically.

---

## Step 4 — Test with MCP Inspector

MCP Inspector is the official debugging tool for MCP servers. It runs a local web UI that lets you call your server's tools and resources directly, without a full MCP client. It ships with FastMCP — no separate install needed.

```bash
fastmcp dev server.py
```

This starts your server in development mode and opens the MCP Inspector UI at `http://localhost:5173`. You'll see three tabs: **Tools**, **Resources**, and **Prompts**.

1. **Test a tool** — Click *Tools*, select `get_top_tools`, set `category: python`, and click *Execute*. You should see the stubbed response returned as JSON.
2. **Test a resource** — Click *Resources*, select `agentrank://stats`, and click *Read*. The index stats object should appear.
3. **Test a prompt** — Click *Prompts*, select `find_best_tool`, set `use_case: web scraping`, and click *Get Prompt*. The rendered message template appears.

If a tool call throws an exception, Inspector shows the full traceback. The most common errors at this stage: missing imports, JSON serialization failures (return a dict or list, not a custom class), and type mismatches.

### Running tests against your server

For automated testing, FastMCP ships a `Client` that connects to your server in-process. You can use it in pytest without starting a real subprocess:

```python
# test_server.py
import pytest
from fastmcp import Client
from server import mcp

@pytest.mark.anyio
async def test_get_top_tools():
    async with Client(mcp) as client:
        result = await client.call_tool("get_top_tools", {"limit": 2})
        assert len(result) == 2
        assert result[0]["rank"] == 1

@pytest.mark.anyio
async def test_get_index_stats():
    async with Client(mcp) as client:
        resource = await client.read_resource("agentrank://stats")
        assert resource["total_tools"] > 0
```

```bash
uv add pytest anyio pytest-anyio
pytest test_server.py -v
```

---

## Step 5 — Connect to Claude Desktop

Once the server passes Inspector testing, connect it to Claude Desktop. Install the server to make it runnable via the `fastmcp` CLI entry point:

```bash
fastmcp install server.py --name "AgentRank"
```

This writes the config entry automatically. If you prefer to do it manually, the `claude_desktop_config.json` path is:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentrank": {
      "command": "python",
      "args": ["/absolute/path/to/agentrank-mcp/server.py"],
      "env": {}
    }
  }
}
```

Restart Claude Desktop after saving the config. In a new conversation, you should see a hammer icon in the toolbar indicating MCP tools are available. Type `/find_best_tool` to test the prompt, or ask Claude to "get the top Python MCP tools from AgentRank" to trigger the tool call directly.

> **Common connection errors:**
> - **Server not appearing:** Restart Claude Desktop. The config is read on launch.
> - **Tool calls failing:** Check that the `python` command points to the right interpreter (use absolute path to the venv python if needed).
> - **stdout corruption:** Your server must not print anything to stdout during normal operation — stdout is the MCP transport channel. Use `sys.stderr` or Python's `logging` module for debug output.

---

## Step 6 — Deploy to Cloudflare Workers

For production, you want the server accessible over HTTP rather than running as a local subprocess. FastMCP 3.0 supports the Streamable HTTP transport, which runs the server as a standard ASGI application — deployable anywhere ASGI runs: Cloudflare Workers, Fly.io, Railway, or any container platform.

Switch the transport in `server.py`:

```python
if __name__ == "__main__":
    # stdio for local Claude Desktop
    # mcp.run()

    # HTTP for production deployment
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

Or run it directly with `fastmcp run`:

```bash
fastmcp run server.py --transport streamable-http --port 8000
```

For Cloudflare Workers, add a `wrangler.toml`:

```toml
name = "agentrank-mcp"
compatibility_date = "2026-01-01"
main = "server.py"

[build]
command = "pip install fastmcp -t ."
```

```bash
wrangler deploy
```

Once deployed, configure the URL in Claude Desktop or any MCP client that supports HTTP transport:

```json
{
  "mcpServers": {
    "agentrank-remote": {
      "url": "https://agentrank-mcp.your-subdomain.workers.dev/mcp"
    }
  }
}
```

---

## FastMCP 3.0 features

FastMCP 3.0, released January 2026, introduced three architectural features that go beyond the basic decorator pattern.

### Composability: mount servers together

Large MCP servers split into modules. FastMCP lets you build each module as an independent `FastMCP` instance and mount them into a parent server. Routes, tools, resources, and prompts are all scoped by prefix automatically.

```python
from fastmcp import FastMCP

# Module servers
tools_mcp = FastMCP("tools")
stats_mcp = FastMCP("stats")

@tools_mcp.tool()
def search_tools(query: str) -> list[dict]:
    """Search the AgentRank tool index."""
    return []

@stats_mcp.resource("stats://index")
def get_stats() -> dict:
    """Current index statistics."""
    return {"total": 25632}

# Parent server — mounts both
app = FastMCP("agentrank")
app.mount("tools", tools_mcp)
app.mount("stats", stats_mcp)

# Tools are now accessible as:
# - tools_search_tools (tool)
# - stats://index (resource, prefixed by mount key)
```

This pattern mirrors how Flask Blueprints or FastAPI routers work. Build and test each module independently; assemble them in the main application.

### OpenAPI mounting: turn any HTTP API into an MCP server

FastMCP 3.0 can read an OpenAPI spec and automatically generate MCP tools for every endpoint — one tool per operation. This is the fastest way to expose an existing REST API to MCP clients.

```python
from fastmcp import FastMCP
from fastmcp.contrib.openapi import mount_openapi

mcp = FastMCP("agentrank-api")

# Generates one MCP tool per OpenAPI operation
await mount_openapi(
    mcp,
    spec_url="https://api.agentrank-ai.com/openapi.json",
    base_url="https://api.agentrank-ai.com",
)
```

Each OpenAPI operation becomes an `@mcp.tool()` with the operation's summary as the description and the request body / query parameters as tool arguments. For APIs with dozens of endpoints, this can generate a complete MCP server in seconds with no manual tool definitions.

### Proxy mode: wrap any MCP server

FastMCP 3.0 proxy mode creates a FastMCP wrapper around any existing MCP server. This is useful for adding middleware (auth, logging, rate limiting) to a server you didn't build, or for aggregating multiple upstream servers behind a single endpoint.

```python
from fastmcp import FastMCP
from fastmcp.proxy import MCPProxy

# Proxy a server running at a remote URL
proxy = await MCPProxy.from_url("https://upstream.example.com/mcp")

# Or proxy a local stdio server
proxy = await MCPProxy.from_command(["python", "upstream_server.py"])

# Wrap it in FastMCP to add tools/middleware
mcp = FastMCP("my-proxy")
mcp.mount("upstream", proxy.as_fastmcp())

# Add your own tools on top
@mcp.tool()
def custom_tool() -> str:
    """A tool added on top of the proxied server."""
    return "custom response"
```

### OAuth 2.1 authentication

FastMCP 3.0 implements the MCP OAuth 2.1 spec that became mandatory for production servers in June 2025. For HTTP transport servers:

```python
from fastmcp import FastMCP
from fastmcp.auth import BearerAuthProvider

auth = BearerAuthProvider(
    jwks_url="https://your-auth-provider/.well-known/jwks.json",
    audience="agentrank-mcp",
    issuer="https://your-auth-provider",
)

mcp = FastMCP("agentrank", auth=auth)
```

### OpenTelemetry tracing

FastMCP 3.0 ships built-in OpenTelemetry instrumentation:

```python
import os
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4318"
os.environ["OTEL_SERVICE_NAME"] = "agentrank-mcp"

from fastmcp import FastMCP
mcp = FastMCP("agentrank", enable_otel=True)

# Every tool call now emits a span with:
# - tool name, arguments, result size
# - error status and exception details
# - latency histogram
```

---

## What's next

The server you've built covers the full FastMCP primitive set: tools, resources, prompts, testing, Claude Desktop integration, HTTP deployment, and FastMCP 3.0 architectural features. The stub implementations work — replace them with real database queries or API calls to get a production-ready server.

A few directions from here:

- **Compare Python vs TypeScript for your next server:** [MCP SDK comparison](https://agentrank-ai.com/compare/mcp-sdks/) covers Python, TypeScript, Go, and Rust side by side with a language decision framework.
- **Read the full Python MCP library landscape:** [Best Python MCP Libraries in 2026](https://agentrank-ai.com/blog/best-python-mcp-libraries/) covers FastMCP vs the official SDK vs mcp-agent.
- **Submit your server:** Once it's live, [submit it to AgentRank](https://agentrank-ai.com/submit/) to get indexed, scored, and listed alongside 25,000+ other MCP tools.
- **Browse all Python MCP tools:** [9,869 Python repos in the AgentRank index](https://agentrank-ai.com/tools/?language=python) — scored daily.

---

## About AgentRank

[AgentRank](https://agentrank-ai.com) is a live, daily-updating ranked index of every MCP server and agent tool on GitHub — 25,000+ tools scored by five real quality signals: stars, freshness, issue health, contributor count, and inbound dependents. Built something with FastMCP? [Tag @AgentRank_ai](https://x.com/AgentRank_ai) — we spotlight new tools on the leaderboard.

---

*Code examples are based on FastMCP 3.x (PrefectHQ/fastmcp, installed as `pip install fastmcp`). FastMCP 3.0 released January 2026. AgentRank scores cited are from the March 2026 index snapshot.*
