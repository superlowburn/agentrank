# r/LocalLLaMA — Post Draft

**Subreddit:** r/LocalLLaMA
**Title:** Built a tool to rank MCP servers by maintenance quality, not just stars — 25k+ indexed

**Status:** Pending Steve approval before posting.

---

## Post Body

When building local agent stacks, the MCP server selection problem is real: there are thousands of servers and no good signal for which ones actually work and are being maintained.

I built [AgentRank](https://agentrank-ai.com) to solve this. It crawls GitHub nightly and scores every MCP server on five real maintenance signals (not just stars):

**The score (0-100):**
- Freshness — last commit recency. 90-day decay curve.
- Issue health — closed/total issues ratio. High = responsive maintainer.
- Contributor count — >1 contributor = less bus factor risk.
- Inbound dependents — ecosystem adoption.
- Stars — lowest weight (15%) since they're gamed easily.

**Why it matters for local agent builds:**

If you're running local agents with multiple MCP servers, a stale server can break your pipeline silently. Last I checked, ~40% of GitHub MCP servers with >100 stars haven't been updated in 90+ days. The score lets you filter to servers that are actively being maintained.

Practical use: filter to `score >= 30` to skip abandoned projects. Anything above 60 is actively maintained and has community usage.

The [API](https://agentrank-ai.com/api-docs) is free — `GET /api/tools?score_min=30` returns only the maintained ones. You can use the AgentRank MCP server itself to query it from inside your agent stack.

What scoring signals do you wish existed? Open to feedback on the weighting.

---

## Posting Notes

- Frame around local agent builder use case — this audience cares about reliability, not hype
- Post 24h after r/mcp (different framing, different community)
- If someone asks why not npm/PyPI: explain GitHub first because open source dominates, other registries planned
- The "40% stale" stat is memorable — use it if it comes up
