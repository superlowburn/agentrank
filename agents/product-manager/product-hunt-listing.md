# AgentRank — Product Hunt Listing

**Status: Draft — needs Steve's approval before submission**

---

## 1. Tagline (45 chars — max 60)

```
Google PageRank for AI agents and MCP servers
```

**Alternatives:**
- "Ranked index of 25K+ MCP servers and agent tools" (50 chars)
- "Find the best MCP servers. Ranked by real signals." (51 chars)

---

## 2. Short Description (260 chars max — for PH header)

AgentRank indexes 25,000+ MCP servers and AI agent tools, scoring each 0-100 from real GitHub signals: stars, freshness, issue health, contributors, and dependents. Updated nightly. Free API, TypeScript SDK, and MCP server — your AI automatically finds the right tool.

*(255 chars)*

---

## 3. Full Description (2-3 paragraphs — for PH listing body)

The AI agent ecosystem has 25,000+ tools on GitHub and it's doubling every few months. But there's no way to know which MCP servers are maintained, which ones are dead, or which ones developers have actually validated. GitHub stars tell you what was popular two years ago — not what's alive today.

AgentRank crawls GitHub nightly and scores every MCP server and agent tool 0-100 using five signals: **stars** (15%), **freshness** (25% — days since last commit, hard decay after 90 days), **issue health** (25% — closed/total issues, measures maintainer responsiveness), **contributors** (10%), and **inbound dependents** (25% — how many other repos actually depend on this). The score is opinionated and documented. A tool that's getting commits, has responsive maintainers, and other projects depending on it is worth more than a trending README with 2,000 stars and no commits in eight months.

Everything is free: the leaderboard, the API (100 req/min, no key needed), the TypeScript SDK, and the MCP server you can install directly into Claude Code or any agent runtime. Install once and your AI automatically queries AgentRank to pick the right tool for each task — no manual research required.

---

## 4. Category + Topics

**Category:** Developer Tools

**Topics (up to 3):**
1. Artificial Intelligence
2. Open Source
3. Developer Tools

---

## 5. Maker Comment (Steve posts this)

Hey PH! I built AgentRank because I kept asking the same question every week: which MCP server should I actually use?

The AI agent ecosystem has exploded. There are 25,000+ MCP servers and agent tools on GitHub right now — and the number doubles every few months. But there was no way to know which ones were maintained, which ones were dead, or which ones the broader community had actually validated. GitHub stars tell you what was popular two years ago. They don't tell you what's alive today.

So I built the thing I wanted to use.

**How it works:** AgentRank crawls GitHub nightly, finds every MCP server and agent tool, and scores each one 0-100 using five signals:
- **Stars** (15%) — raw popularity signal
- **Freshness** (25%) — days since last commit; anything over 90 days decays hard
- **Issue health** (25%) — closed issues / total issues; more responsive maintainers score higher
- **Contributors** (10%) — more contributors = lower bus factor
- **Dependents** (25%) — how many other repos depend on this; the strongest signal for real-world adoption

The score is opinionated. That's intentional. A tool that's still getting commits, has responsive maintainers, and other projects depending on it is worth more than a trending README with 2,000 stars and no commits in eight months.

**What's free:** Everything. The leaderboard, the API (100 req/min, no key needed), the TypeScript SDK, the MCP server you can plug into Claude or any agent. Install once and your AI uses the index to automatically pick the right tool for each task.

I'm a solo builder and this is a weekend project that got out of hand in the best way. Would love feedback from the PH community — especially from MCP server maintainers. If your tool is ranked unfairly, I want to know why and I want to fix it.

Claim your tool at agentrank-ai.com/claim — free, no account needed.

---

## 6. Screenshots

Screenshots saved to `site/public/og/product-hunt/`:

| File | Page | Description |
|------|------|-------------|
| `01-homepage.png` | agentrank-ai.com | Hero shot — "Find the best MCP servers and AI agent tools", install CTA for Claude Code/Cursor/Windsurf, social proof stats (25K+ tools, crawled nightly), latest ecosystem news feed |
| `02-tool-detail.png` | agentrank-ai.com/skill/glama-awslabs--mcp/ | Skill detail — AWS Nova Canvas (#2 of 1766, score 83), SIGNAL BREAKDOWN with progress bars for Installs, Freshness, Issue Health, Stars, Platform Breadth, Contributors, Description |
| `03-news.png` | agentrank-ai.com/news | Ecosystem News page — "Releases, movers, new tools, and trending activity sourced from GitHub signals" with filter tabs (All, Releases, Trending, New Tools, Movers, Deprecated) |
| `04-compare.png` | agentrank-ai.com/compare/mcp-use--mcp-use-vs-punkpeye--fastmcp/ | Head-to-head: mcp-use (94.2, Rank #11) vs fastmcp (89.7, Rank #41) — full comparison table with Stars, Forks, Last Commit, Freshness, Issue Health scores |
| `05-tool-detail.png` | agentrank-ai.com/tool/kianwoon--cc-update-all/ | Tool detail — kianwoon/cc-update-all (Score: 64.5, Rank #1 of 104 tools), overview, ecosystem tags, SCORE BREAKDOWN section |

---

## 7. Additional Assets

- **Logo:** use existing site favicon/logo at appropriate PH dimensions (240×240)
- **Gallery images:** 1270×952 (PH standard for gallery)
- **Thumbnail:** 400×300

---

## Reply Templates

### "How does the scoring work?"
The score is a composite of 5 GitHub signals: stars (15%), freshness/days since last commit (25%), issue health/closed÷total issues (25%), contributor count (10%), and inbound dependents/how many repos use it (25%). Weighted toward freshness and dependents because a popular-but-dead tool is a liability. Full methodology at agentrank-ai.com/methodology.

### "Can I add my tool / claim my listing?"
If it's on GitHub and matches a query for MCP server or agent tool, it's probably already indexed — search for it at agentrank-ai.com. To add context, fix metadata, or claim ownership: agentrank-ai.com/claim. Free, no account required.

### "Is there an API?"
Yes, fully open. No key needed for the free tier (100 req/min). Quick start: `GET https://agentrank-ai.com/api/search?q=<tool-name>`. Full docs at agentrank-ai.com/docs. There's also a TypeScript SDK (`@agentrank/sdk`) and an MCP server you can plug directly into Claude or any agent runtime.

### "What's the business model?"
Right now it's free for everything. Infra cost is basically zero (Cloudflare Workers + D1 + nightly GitHub crawl). Long term: API Pro tier for high-volume users, sponsored listings for verified maintainers, and eventually an agent-to-agent transaction layer as the ecosystem matures. But the index stays free.

### "How is this different from Glama / MCP.so / other directories?"
Directories list things. AgentRank ranks them. The key difference is the daily-updated composite score that reflects real-world health, not just "did someone submit this." Dead tools score low automatically — no manual curation required. The score is transparent and documented, so you can disagree with the weighting and that conversation is worth having.
