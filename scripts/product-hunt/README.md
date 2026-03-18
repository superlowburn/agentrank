# AgentRank — Product Hunt Launch Package

> **STATUS: READY FOR STEVE'S REVIEW**
> Steve must approve all content and submit. Do NOT publish anything from this package.
> Last updated: 2026-03-18

---

## Checklist

### Gallery Assets (ready)
- [x] `ph-00-hero.png` — Hero card (1270x760) — upload first, becomes the social card
- [x] `ph-01-homepage.png` — Skills leaderboard (1270x760)
- [x] `ph-02-tool-detail.png` — Tool detail with score breakdown (1270x760)
- [x] `ph-03-category.png` — MCP Servers category view (1270x760)
- [x] `ph-04-methodology.png` — Scoring methodology (1270x760)
- [x] `ph-05-api.png` — API docs + MCP install (1270x760)

### Logo
- [x] `logo-400x400.png` — Full-size logo for PH thumbnail (400x400, exceeds 240x240 minimum)
- [x] `logo-240x240.png` — PH minimum size (240x240)

### Copy
- [x] Tagline (see below)
- [x] Short description (see below)
- [x] Full description (see below)
- [x] Maker comment (see below)
- [x] Categories selected (see below)

### Steve Must Do Before Submitting
- [ ] Review and approve all copy below
- [ ] Log into producthunt.com with your account
- [ ] Upload gallery images in order listed above
- [ ] Set product logo to `logo-400x400.png`
- [ ] Paste tagline, short description, full description from this file
- [ ] Connect your website (agentrank-ai.com) for maker verification badge
- [ ] Preview listing on mobile before publishing
- [ ] Select launch day (Tuesday or Wednesday, 12:01 AM PT recommended)
- [ ] Post maker comment immediately after listing goes live

---

## Copy

### Product Name
```
AgentRank
```

### Tagline (56 chars — PH max is 60)
```
Your AI recommends outdated tools. AgentRank fixes that.
```

**Alternates:**
```
Google PageRank for AI agents. 25,000+ tools ranked daily.
```
```
The live, ranked index of every MCP server on GitHub
```

### Short Description (243 chars — PH max is 260)
```
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.
```

### Topics / Categories
- Developer Tools
- Artificial Intelligence
- Open Source
- Productivity
- API

### Website
```
https://agentrank-ai.com
```

---

## Full Description

```
Your AI assistant recommends tools from frozen training data. It can't tell you if something was abandoned last week, or that something better shipped yesterday. AgentRank fixes that.

We crawl GitHub nightly for every MCP server and agent tool in the ecosystem — plus skills from Glama and skills.sh. Each one gets an AgentRank score (0–100) based on eight real signals:

- Freshness (20%) — days since last commit; anything over 90 days starts decaying hard
- Issue health (20%) — closed/total issue ratio; responsive maintainer = healthy tool
- Stars — raw popularity signal
- Contributors — lower bus factor risk
- Dependents — how many other repos rely on this
- Registry downloads — npm/PyPI install counts when available
- Platform breadth — how many AI platforms officially support this tool
- Description quality — is it documented enough to actually use?

All weights and formulas are public at agentrank-ai.com/methodology. No black boxes. No pay-to-play.

The result: a live, daily-updating ranked index of 25,000+ tools. Browse it at agentrank-ai.com or install the MCP server and let your AI use it automatically:

  claude mcp add agentrank -- npx -y agentrank-mcp-server

After that, whenever your AI needs an MCP server or agent tool, it queries the live index and gets current, scored results — not a guess from months-old training data.

What's indexed:
- MCP servers (the full Model Context Protocol ecosystem)
- AI skills (Claude Code skills, agent capabilities)
- Agent tools (GitHub Actions, automation tools, A2A agents)

Everything is free: The leaderboard, the API, the MCP server. Always. Open source: github.com/superlowburn/agentrank
```

---

## Maker Comment (post immediately after launch — from Steve's PH account)

```
Hey PH — Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen. There's no way for the AI to know what's actually alive.

So I built the index I wanted to exist.

AgentRank crawls GitHub nightly for every MCP server and agent tool. Each one gets scored on eight signals — freshness, issue health, stars, contributors, dependents, registry downloads, platform breadth, documentation quality. The score runs 0–100. The weights are public. No black boxes.

The part I'm most proud of: install one MCP server and your AI automatically queries the live index whenever it needs a tool. No more stale training data recommendations.

A few things I'd love feedback on:

1. Scoring weights — Freshness and issue health carry 20% each. Does this feel right? What signal am I missing?
2. Claim flow — Maintainers can claim their listing and add context. Worth building out further?
3. Categories vs. flat list — Right now it's one ranked list with filters. Worth dedicated category leaderboards?

Everything is free and open source. Happy to answer questions.

— Steve
```

---

## Gallery Upload Order

Upload in this exact order — PH uses the first image as the social sharing card:

| # | File | What it shows |
|---|------|---------------|
| 1 | `ph-00-hero.png` | Branded hero card — the social card |
| 2 | `ph-01-homepage.png` | Skills leaderboard with real scores |
| 3 | `ph-05-api.png` | MCP install command + API docs |
| 4 | `ph-03-category.png` | 20,000+ MCP servers ranked |
| 5 | `ph-02-tool-detail.png` | Score breakdown with radar chart |
| 6 | `ph-04-methodology.png` | 8 signals, transparent weights |

---

## Launch Day Tweets (from @comforteagle — all require Steve's approval before posting)

### Tweet A — Go-live announcement
```
Just launched on @ProductHunt.

AgentRank: Google PageRank for AI agents.

Install one MCP server and your AI automatically searches 25,000+ live-ranked tools whenever it needs one.

No stale training data. No abandoned tools.

[Product Hunt link]
```

### Tweet B — Tag the top 5 (post ~2h after launch, fill in from live data)
```
AgentRank just launched on @ProductHunt.

Current top 5 MCP servers by score:

1. [tool] — [score]
2. [tool] — [score]
3. [tool] — [score]
4. [tool] — [score]
5. [tool] — [score]

Full rankings: agentrank-ai.com

[tag each maintainer's @handle]
```

### Tweet C — The problem hook (~4h)
```
Asked Claude to recommend an MCP server.

It suggested one that hasn't been updated in 6 months, has 47 open issues, and one contributor.

This is a training data problem. AgentRank fixes it.

agentrank-ai.com
```

### Tweet D — How scoring works (~6h)
```
How AgentRank scores 25,000+ tools:

- Freshness (20%) — days since last commit
- Issue health (20%) — closed/total ratio
- Dependents (25%) — who relies on this
- Stars (15%) — raw popularity
- Contributors (10%) — bus factor

Updated nightly. agentrank-ai.com
```

---

## Post-Launch
- [ ] Add PH badge to GitHub README
- [ ] Save PH listing URL for marketing materials
- [ ] Document final upvote count, rank, and traffic spike

---

*Screenshots captured: 2026-03-18. Re-run `npx tsx scripts/capture-ph-screenshots.ts` to refresh.*
