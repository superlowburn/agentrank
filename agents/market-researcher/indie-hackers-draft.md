# Indie Hackers Draft — AgentRank Product Launch Post

**Status:** DRAFT — Requires Steve's approval before publishing

---

## Post Title

**I built a ranked index of 25,000+ MCP servers and agent tools — updated daily, free to use**

---

## Post Body

Six months ago I couldn't find a reliable way to evaluate which MCP servers were actually worth using. GitHub search gives you a pile of repos sorted by stars, but stars tell you almost nothing about whether a tool is maintained, reliable, or has real adoption. I kept installing things that hadn't been touched in 8 months.

So I built AgentRank.

**What it is:** A daily-updated, scored index of every MCP server and agent tool I can find on GitHub. Right now that's 25,000+ tools ranked by a composite score built from five signals:

- **Stars** (raw popularity, 15% weight)
- **Freshness** — days since last commit (25% weight, heavy decay after 90 days)
- **Issue health** — closed/total ratio (25% weight, proxy for maintainer responsiveness)
- **Contributor count** (10% weight, bus factor risk)
- **Inbound dependents** — how many repos depend on this one (25% weight, strongest signal)

The weights are opinionated. That's the point. A tool with 2,000 stars and no commit in a year scores lower than a 200-star tool that shipped 3 updates this week. It's not just popularity — it's a quality signal.

**The tech stack is boring by design:** A Python crawler that runs nightly via cron, a PostgreSQL table with one row per tool, a scoring engine that runs after each crawl, and an Astro static site deployed to Cloudflare Pages. The whole thing costs ~$0/month to run at current scale.

**What I'm using it for:** Mostly answering the question "is this MCP server actually alive?" before I spend 20 minutes integrating it. But the data has also surfaced some interesting ecosystem patterns — which categories are getting new tools fast, which tools have surprise adoption vs. hype, where the bus factor risk is highest.

There's also a free API if you want to query rankings programmatically or pull the data into your own tooling. I use it via the AgentRank MCP server that I publish to npm — your AI assistant can query tool rankings directly in context.

**What's next:** Better categorization (right now it's a flat list), social signals from npm/PyPI download counts, and a claim flow so maintainers can add context to their listings.

Everything is at [agentrank-ai.com](https://agentrank-ai.com).

---

What MCP servers are you actually using day-to-day? Curious what's in the top 10 for builders vs. what the index currently ranks highest — I suspect there's a gap.

---

## Meta Notes (for Steve)

- Tone target: builder sharing a weekend project that grew, not product marketing
- Data points used: 25k+ tools, 5 signals, weights are public (builds trust)
- The question at the end is "What MCP servers are you using day-to-day?" — surfaces real usage data + drives comments
- No mentions of pricing/monetization (not relevant yet, would feel premature)
- CTA is soft: just the URL + the question
- Post goes in Indie Hackers "Products" section, not "Ask IH"

**Approval needed before posting.**
