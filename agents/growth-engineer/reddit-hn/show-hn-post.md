# Hacker News — Show HN Draft

**Title:** Show HN: AgentRank – Ranked index of 25k+ MCP servers, scored daily from GitHub signals

**Status:** Pending Steve approval before posting.
**Timing:** Post 1-2 days after Reddit. HN is higher stakes — more durable traffic if it lands.

---

## Post Title

```
Show HN: AgentRank – Ranked index of 25k+ MCP servers, scored daily from GitHub signals
```

(HN title limit: 80 chars. This is 79.)

---

## Post Body / Comment (to post as first comment immediately after submitting)

I built this because I kept needing it and it didn't exist.

AgentRank is a daily-updated ranked index of every MCP (Model Context Protocol) server on GitHub — currently 25,632 indexed. Each gets a 0–100 score from five GitHub signals:

- **Freshness**: days since last commit. Exponential decay past 90 days.
- **Issue health**: closed / total issues. Captures maintainer responsiveness.
- **Contributors**: >1 means less single-point-of-failure risk.
- **Inbound dependents**: how many other repos depend on this.
- **Stars**: 15% weight only. Stars are easiest to game and least predictive of maintenance quality.

The weights are opinionated. I wanted a score that answers "would I trust this server in production?" rather than "is it popular?"

**What I found:**
- ~40% of MCP servers with >100 stars haven't had a commit in 90 days
- Issue health is the strongest single predictor of continued maintenance
- The top 200 repos account for the majority of inbound dependencies in the whole ecosystem

The crawler runs nightly via a Cloudflare Worker. Scores update every 24h. Stack is Astro + Cloudflare D1 + Workers.

Free API if you want to query it programmatically: https://agentrank-ai.com/api-docs

Would be interested in feedback on the scoring methodology — especially from people who maintain MCP servers.

---

## Posting Notes

- Post on a weekday morning (US Eastern, ~9am) for best HN visibility
- The first comment should be the longer explanation above — HN convention for Show HN
- If it lands on front page, engage in every thread genuinely — this audience will probe methodology
- Anticipated pushback: "why GitHub only, not npm/PyPI" → answer: GitHub covers 90%+ of the open-source MCP ecosystem today; other registries are roadmap
- Anticipated pushback: "scores seem arbitrary" → explain the five signals and invite feedback on weights
- Do NOT post same day as Reddit posts
- Steve posts from personal HN account (not a brand account)
