# @agentrank/sdk

TypeScript client for the [AgentRank API](https://agentrank-ai.com) — the ranked index of MCP servers, AI agent tools, and skills.

## Installation

```bash
npm install @agentrank/sdk
```

## Quick Start

```typescript
import { AgentRank } from "@agentrank/sdk";

// Free tier — no API key required, rate-limited
const ar = new AgentRank();

// Pro tier — higher rate limits + extended data (rank history, more fields)
const ar = new AgentRank({ apiKey: "ar_..." });
```

## Methods

### `search(query, options?)`

Search tools, skills, and agents across the AgentRank index.

```typescript
// Basic search
const results = await ar.search("database");

// Filtered search
const tools = await ar.search("filesystem", {
  category: "tool",   // "all" | "tool" | "skill" | "agent"
  sort: "score",      // "score" | "rank" | "stars" | "freshness"
  limit: 10,
  offset: 0,
});

console.log(results.results[0].name);  // e.g. "modelcontextprotocol/servers"
console.log(results.meta.total);       // total matching results
```

### `getTool(id)`

Get detailed information about a specific tool by its GitHub identifier.

```typescript
const tool = await ar.getTool("modelcontextprotocol/servers");

console.log(tool.score);           // 0–100 composite score
console.log(tool.rank);            // current rank in the index
console.log(tool.signals.stars);   // individual signal values
console.log(tool.raw.stars);       // raw GitHub star count

// Pro tier only: rank trend over the last 30 days
tool.rankHistory?.forEach(entry => {
  console.log(entry.date, entry.rank, entry.score);
});
```

### `getMovers(options?)`

Get tools and skills with the largest rank changes recently.

```typescript
const { movers, meta } = await ar.getMovers({ days: 7, limit: 20 });

movers.forEach(m => {
  console.log(`${m.fullName}: ${m.rankDelta > 0 ? "+" : ""}${m.rankDelta} positions`);
});
```

### `getNewTools(options?)`

Get tools and skills newly added to the index.

```typescript
const { tools, meta } = await ar.getNewTools({ days: 14, limit: 25 });

tools.forEach(t => {
  console.log(`${t.fullName} — first seen ${t.firstSeen}`);
});
```

## Error Handling

The SDK throws typed errors for all failure cases:

```typescript
import { AgentRank, NotFoundError, RateLimitError, AuthError, AgentRankError } from "@agentrank/sdk";

try {
  const tool = await ar.getTool("owner/repo");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error("Tool not found");
  } else if (err instanceof RateLimitError) {
    console.error("Rate limited. Retry after:", err.retryAfter);
  } else if (err instanceof AuthError) {
    console.error("Invalid API key");
  } else if (err instanceof AgentRankError) {
    console.error(`API error ${err.status}: ${err.message}`);
  }
}
```

## API Tiers

| | Free (v1) | Pro (v2) |
|---|---|---|
| API key required | No | Yes |
| Rate limit | 100 req/min | 10,000 req/day |
| Rank history | No | 30 days |
| Extended tool data | No | Yes |
| Batch endpoint | No | Yes (up to 50) |

Get a Pro API key at [agentrank-ai.com](https://agentrank-ai.com).

## Links

- [AgentRank](https://agentrank-ai.com) — Live rankings
- [API docs](https://agentrank-ai.com/api-docs) — Full API reference
- [GitHub](https://github.com/superlowburn/agentrank) — Source code
