# AgentRank — The 80/20 Brief

## Domain: agentrank-ai.com

## Date: March 12, 2026

## Purpose: What's the smallest thing we can build that captures most of the value?

---

## The 20% That Matters

Three things generate 80% of the value. Everything else can wait.

### 1. The Crawler (Weekend #1)

A script that finds every MCP server and agent tool on GitHub. That's it.

GitHub search API. Query for "mcp server", "mcp-server", "model context protocol", "agent tool", "a2a agent". Grab every repo that matches. Store the basics: repo name, URL, description, stars, forks, last commit date, open issues, closed issues, contributors, language, license.

Run it nightly. New repos get added automatically. Dead repos get flagged automatically. The crawler doesn't need to be smart. It needs to be thorough and consistent.

Start with GitHub only. npm, PyPI, Docker Hub, social signals — all of that is phase two. GitHub alone covers the vast majority of the ecosystem right now because almost everything is open source and living on GitHub.

**The output is a JSON file or a Postgres table with one row per tool.**

### 2. The Score (Weekend #2)

A simple composite score from five signals. Not fifteen. Five.

- **Stars.** Normalized. Raw popularity.
- **Freshness.** Days since last commit. Anything over 90 days starts decaying hard.
- **Issue health.** Closed issues divided by total issues. Higher ratio = more responsive maintainer.
- **Contributors.** More than one = less bus factor risk.
- **Inbound dependents.** How many other repos depend on this? This is the strongest signal and the hardest to get, but GitHub's dependency graph API exposes it. Start with what's available, improve later.

Weight them. Stars 15%, freshness 25%, issue health 25%, contributors 10%, dependents 25%. These weights are your taste. They're opinionated. They're what makes AgentRank different from a raw GitHub search sorted by stars.

**The output is a single number per tool. Call it the AgentRank score. Scale it 0-100.**

### 3. The Leaderboard (Weekend #3)

A static website that displays the rankings. This can literally be a single HTML page generated from the scored data.

One page: a table. Columns: rank, tool name, score, stars, last commit, category. Sortable. Searchable. Links to the GitHub repo. Links to a detail page with the full signal breakdown.

Regenerated daily when the crawler runs. Deploy to Cloudflare Pages or Vercel or whatever. Zero infrastructure cost. Zero maintenance.

**The output is a URL you can share on Twitter.**

---

## That's It. That's the MVP.

Crawler + score + leaderboard = a live, daily-updating ranked index of every agent tool in the ecosystem. Built in three weekends. Possibly less.

Everything else from the full brief — the API, the notifications, the badges, the claim flow, the social signals, the registry registration — all of that amplifies the value. But the core value is the ranked list itself. If the rankings are good and the data is fresh, people will find it and share it.

---

## The 80/20 Launch

You don't need a launch strategy. You need one tweet.

"I built a ranked index of every MCP server and agent tool on GitHub. Scored by real signals, updated daily. Here's who's winning: [link]"

Tag the top-ranked maintainers. They'll engage because you just told them they're winning. Their engagement is your distribution.

Follow-up tweets write themselves from the data. "Biggest movers this week." "10 new tools entered the index." "This tool dropped 20 spots — here's why." Each tweet is a micro-advertisement that costs nothing to produce because the data generates the content.

---

## What You're Deferring (And That's Fine)

These are all valuable. None of them are necessary for v1.

- **The API.** Build it when agents need it. Humans use the website first.
- **Notifications to maintainers.** Automate later. For now, just tag people on Twitter manually when you launch. The vanity loop works the same way whether it's automated or manual.
- **The badge system.** Build it when maintainers ask for it. They will.
- **The claim flow.** Build it when maintainers want to add context to their listings. They will.
- **npm/PyPI/Docker signals.** Add them when GitHub signals alone aren't enough differentiation.
- **Social signal scraping.** Nice to have. The five GitHub signals carry the score fine without it.
- **Registry registration (MCP, A2A, Entra).** Do this early but it doesn't block launch.
- **Agent-to-agent transaction logging.** This is the long game. It can't happen until the ecosystem matures. The index positions you to capture it when it does.
- **Categories and taxonomy.** Start with one flat list. Let the data tell you where the natural categories are. Don't over-organize before you understand the landscape.

---

## The Build Order

**Week 1:** Crawler. Get every agent tool repo on GitHub into a database. Run it, verify the data looks right, fix edge cases.

**Week 2:** Scoring engine. Compute the five-signal composite score for every tool. Sanity check the rankings. Do the top 10 look right? Do obviously dead projects score low? Tune the weights until the output matches your gut.

**Week 3:** Leaderboard website. Static site generated from the scored data. Deploy it. Buy the domain. Point DNS.

**Week 3, Friday night:** Tweet it. Tag the winners. Watch what happens.

---

## Success Criteria for V1

Not revenue. Not signups. Not API calls. Just these:

- **The index exists and is live.** A URL anyone can visit that shows ranked agent tools.
- **It updates daily.** The scores reflect what's happening now, not last month.
- **It's credible.** When someone looks at the top 10, they nod and say "yeah, that's about right." The rankings pass the smell test.
- **People share it.** At least one person who isn't you links to it or tweets about it unprompted.

If those four things are true after week three, everything else follows.

---

## The Point of the 80/20

The full brief describes a company. This brief describes a weekend project that becomes a company. The difference is important.

You don't need to build the whole thing to start collecting the data. You don't need the API to start building authority. You don't need automated notifications to start the vanity loop. You need a ranked list on a website and a Twitter account. Everything else is iteration on a foundation that already exists and is already generating value.

Ship the index. The rest follows.

---

*The best version of AgentRank is the one that exists next week, not the perfect one that exists never.*
