# AgentRank Social Content — Launch Kit

## Launch Tweet (@comforteagle)

I built Google PageRank for AI agents.

Install one skill and your AI automatically searches 25,000+ MCP servers and agent tools whenever it needs one. Scored daily from real GitHub signals. No configuration, no prompting — it just works.

agentrank-ai.com

---

## Follow-up Tweets (data-driven, post over next week)

### Tweet 2: Tag the winners
Congrats to the current AgentRank top 5:

@PrefectIO fastmcp — 90.7
@mark3labs mcp-go — 88.4
@laaboratorio laravel/boost — 84.3
@anthropaborat go-sdk — 80.9
@punkpeye mcp-proxy — 78.5

Full rankings: https://agentrank-ai.com/tools

### Tweet 3: Skills leaderboard
500 AI skills ranked by real install data.

@anthropic's Playwright MCP server leads with 1.8M installs and a score of 85.0.

browser-use and turborepo round out the top 3.

See the full skills leaderboard: https://agentrank-ai.com

### Tweet 4: The problem
Asked Claude to recommend an MCP server for [X].

It suggested a repo that hasn't been updated in 6 months, has 47 open issues, and one contributor.

This is why I built AgentRank. Your AI shouldn't recommend abandoned tools.

### Tweet 5: How it works
How AgentRank scores 25,000+ tools:

- Stars (15%) — raw popularity
- Freshness (25%) — days since last commit
- Issue health (25%) — closed/total ratio
- Contributors (10%) — bus factor
- Dependents (25%) — who relies on this

Updated nightly. https://agentrank-ai.com

### Tweet 6: Network effect
Every AI that queries AgentRank makes the index smarter.

More queries = better signal on what developers actually reach for = sharper rankings for everyone.

Install it once, benefit forever: npx agentrank-mcp-server

---

## Reddit Posts

### r/ClaudeAI / r/ClaudeCode
**Title:** AgentRank: Google PageRank for AI agents — install once and your AI automatically searches 25,000+ scored MCP servers

**Body:**
I built Google PageRank for AI agents.

Install one skill and your AI automatically searches 25,000+ MCP servers and agent tools whenever it needs one. Scored daily from real GitHub signals (stars, freshness, issue health, contributors, dependents). No configuration, no prompting — it just works.

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

Open source: https://github.com/superlowburn/agentrank
Browse the index: https://agentrank-ai.com

---

## Dev.to Article Outline

**Title:** Why your AI assistant recommends abandoned tools (and how to fix it)

**Hook:** You ask Claude/GPT for an MCP server recommendation. It confidently suggests one. You install it. Three hours later you discover it was abandoned 4 months ago, has 47 open issues, and the maintainer hasn't responded to a PR since November.

**Sections:**
1. The training data problem — LLMs recommend from frozen snapshots
2. What "good" actually looks like for a tool — the 5 signals
3. Building a live index — how AgentRank crawls and scores 25k+ repos nightly
4. Making it useful — the MCP server that lets your AI query the index
5. The network effect — how usage data improves rankings
6. Try it — one-line install

**CTA:** Link to agentrank-ai.com + GitHub repo
