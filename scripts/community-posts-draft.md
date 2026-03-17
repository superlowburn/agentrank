# AgentRank Community Launch Drafts

Updated: 2026-03-17
Revision: 2 — revised per CEO guidance: authentic first-person, lead with why you built it, not stats

---

## 1. r/mcp (POST FIRST — most targeted, lower stakes)

**Title:** I got tired of MCP server recommendations that were dead on arrival, so I built a live index

**Body:**

My AI kept recommending MCP servers that hadn't been touched in 6 months. I'd install something, hit a bug, open the issues, and find 30 unresolved reports with no maintainer activity. The repo looked legit at a glance — decent stars, good README — but it was basically abandoned.

The core problem: LLMs recommend tools from training data, not from what's actually being maintained right now.

So I built AgentRank. It's a GitHub crawler that indexes MCP servers nightly and scores them on maintenance signals: how recently it was committed to, what percentage of issues get closed, how many contributors it has, and how many other projects depend on it.

There are now 25,000+ repos in the index. Not a curated list — everything, scored and ranked.

You can browse it at agentrank-ai.com, or you can give your AI direct access to the live rankings:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

The scoring is opinionated. I weight freshness and issue health at 25% each because those are the signals I actually care about when choosing a dependency. Stars are only 15% — a 2,000-star repo that committed last week beats a 20,000-star repo that hasn't moved in a year, in my scoring.

Curious what signals others use when evaluating an MCP server before building on it.

---

## 2. r/LocalLLaMA (POST SECOND — day after r/mcp)

**Title:** Built an MCP server that gives agents live access to a ranked index of 25k+ MCP tools — so they stop recommending dead repos

**Body:**

I got frustrated with a specific failure mode: when I asked my local LLM setup to find an MCP server for something, it would confidently recommend repos that had been unmaintained for months. Training data doesn't know what got abandoned last quarter.

My fix was a nightly crawler that indexes everything MCP-related on GitHub, scores each repo on maintenance signals, and wraps the rankings in an MCP server your agent can query at runtime.

When your agent needs to find a tool, it can now check current scores instead of guessing from training data.

The meta-layer of an AI using a tool-ranking MCP server to find other MCP servers is admittedly a little recursive. But it works — the first time I watched Claude use it to find and recommend a tool I hadn't heard of, that had solid maintenance signals and exactly fit what I needed, it felt like something clicked.

agentrank-ai.com — browser access or install the MCP server:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

The index now covers 25,000+ repos. Scores update nightly. Free, no signup.

Happy to talk methodology — the five-signal scoring formula is intentionally opinionated and I'm sure there are edge cases where it breaks.

---

## 3. Hacker News — Show HN (POST LAST — 1-2 days after Reddit)

**Title:** Show HN: AgentRank – Live-scored index of 25k+ MCP servers and agent tools

**Body:**

I built a GitHub crawler that indexes MCP servers and agent tools nightly and scores them on five maintenance signals. The problem I was trying to solve: AI tool recommendations are frozen at training time, but the MCP ecosystem churns fast.

The scoring weights:
- Freshness: 25% (days since last commit)
- Issue health: 25% (closed/total ratio — how responsive is the maintainer?)
- Downstream dependents: 25% (who actually relies on this?)
- Stars: 15% (popularity, but popularity lags quality)
- Contributors: 10% (bus factor)

Browse the index: agentrank-ai.com

There's also an MCP server that gives agents direct query access to the live rankings, for the recursive use case of an agent finding tools with a tool.

A few things I found surprising after indexing 25k repos: 97% are solo projects (one contributor), and about 54% haven't had a commit in 91-365 days. The ecosystem is wide but thin — the actually maintained core is much smaller than the raw count suggests.

The weights and formula are opinionated. I'd be curious what signals HN would weight differently.

---

## Posting order

1. **r/mcp** — post from Steve's personal account, framing it as "I built this because I was frustrated"
2. **r/LocalLLaMA** — next day, different angle (recursive MCP-on-MCP use case)
3. **Show HN** — 1-2 days after Reddit; HN rewards technical honesty and concrete numbers
4. If any post gets traction: engage genuinely in comments, answer methodology questions
5. Do NOT cross-post the same text — each post is a different angle for a different audience
6. Twitter supports this as slow-burn amplification after Reddit/HN have run

---

## Status: BLOCKED — Steve needs to post these from personal accounts

I can't post to Reddit or HN. These are ready to copy-paste from agentrank-ai.com issue [AUT-28](/AUT/issues/AUT-28).
