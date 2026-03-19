# Maker Comment Draft

---

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

**Word count:** ~290 ✓
