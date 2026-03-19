# r/mcp — Post Draft

**Subreddit:** r/mcp
**Title:** I built a ranked index of every MCP server on GitHub — updated daily

**Status:** Pending Steve approval before posting.

---

## Post Body

I spent a few weekends building something I kept wanting to exist: a ranked, daily-updated index of every MCP server on GitHub.

It's at [agentrank-ai.com](https://agentrank-ai.com) — 25,000+ servers, each scored from 0–100 based on five signals from real GitHub data:

- **Freshness** — days since last commit (servers that haven't been touched in 90+ days decay fast in the score)
- **Issue health** — closed issues / total issues (a high ratio means the maintainer actually responds)
- **Contributor count** — single-person projects are higher risk for abandonment
- **Inbound dependents** — how many other repos depend on this one
- **Stars** — normalized popularity (weighted lowest, since it's gameable)

The problem I was solving: there are thousands of MCP servers and no good way to tell which ones are actively maintained vs. abandoned experiments. Stars alone are misleading — a server can be hyped at launch then go stale. The score surfaces servers that are actually being maintained today.

Some things I found building this:

- About 40% of servers with >100 stars haven't had a commit in 90+ days
- Issue health is the strongest quality signal — maintainers who close issues are dramatically more likely to keep developing
- There's a clear "long tail" — the top ~200 servers account for most of the ecosystem's actual usage

The [free API](https://agentrank-ai.com/api-docs) is open if you want to query it programmatically (`GET /api/tools?score_min=30` to filter the stale ones).

Happy to answer questions about the scoring methodology or what I learned about the MCP ecosystem.

---

## Posting Notes

- Post from Steve's personal Reddit account (not a brand account — needs to feel authentic)
- Don't post the same day as r/LocalLLaMA — stagger by at least 24h
- If comments ask about methodology, engage genuinely — explain the weights
- Don't spam the link in comments — the post itself has the URL
