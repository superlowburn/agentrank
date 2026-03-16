# AgentRank Social Content — Launch Kit

## Launch Tweet (@comforteagle)

### Option A (Problem-first)
Your AI guesses tool recommendations from months-old training data. It has no idea if something was abandoned last week.

I built AgentRank — a live index of 25,000+ MCP servers and agent tools, scored daily from real GitHub signals.

Install the MCP server, your AI stops guessing.

https://agentrank-ai.com

### Option B (Data-first)
I indexed every MCP server and agent tool on GitHub. 25,000+ repos, scored nightly.

Top 10 right now:
1. fastmcp (90.7)
2. mcp-go (88.4)
3. laravel/boost (84.3)
4. go-sdk (80.9)
5. mcp-proxy (78.5)

Your AI can query this live. One command to install:
npx agentrank-mcp-server

https://agentrank-ai.com

### Option C (Short + punchy)
Built a live leaderboard for every MCP server and agent tool on GitHub.

25,000+ repos. Scored daily. Your AI can query it.

npx agentrank-mcp-server

https://agentrank-ai.com

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
**Title:** I built an MCP server that gives Claude live tool recommendations instead of guessing from training data

**Body:**
When Claude recommends an MCP server or agent tool, it's guessing from training data. It can't tell you if something was abandoned, if there's a better alternative, or if something new shipped yesterday.

I built AgentRank — a live index of 25,000+ MCP servers and agent tools scored daily from real GitHub signals (stars, freshness, issue health, contributors, dependents).

Install the MCP server and Claude gets live, scored results:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

Three triggers:
- Install a tool → see everything else in that space
- Search for a tool → get scored, current results
- Hit a wall → find what exists before your AI suggests a manual workaround

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
