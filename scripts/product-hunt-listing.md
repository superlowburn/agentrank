# AgentRank — Product Hunt Submission Package

> **STATUS: READY FOR STEVE'S REVIEW — Steve must approve all content before submitting.**
> Assets prepared by Product Manager agent. All copy requires Steve's approval before any public posting.
> Last updated: 2026-03-18

---

## 1. Listing Copy

### Product Name
AgentRank

### Tagline (60 chars max — recommended)
`Your AI recommends outdated tools. AgentRank fixes that.`
(56 chars)

**Alternates:**
- `Google PageRank for AI agents. 25,000+ tools ranked daily.` (59 chars)
- `Live rankings for 25,000+ MCP servers and agent tools` (54 chars)
- `The live, ranked index of every MCP server on GitHub` (53 chars)

### Short Description (260 chars max)
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.

(243 chars)

### Topics
- Artificial Intelligence
- Developer Tools
- Open Source
- Productivity
- API

### Website
https://agentrank-ai.com

---

## 2. Full Description (markdown)

Your AI assistant recommends tools from frozen training data. It can't tell you if something was abandoned last week, or that something better shipped yesterday. **AgentRank fixes that.**

We crawl GitHub nightly for every MCP server and agent tool in the ecosystem — plus skills from Glama and skills.sh. Each one gets an AgentRank score (0–100) based on eight real signals:

- **Freshness (20%)** — days since last commit; anything over 90 days starts decaying hard
- **Issue health (20%)** — closed/total issue ratio; responsive maintainer = healthy tool
- **Stars** — raw popularity signal
- **Contributors** — lower bus factor risk
- **Dependents** — how many other repos rely on this
- **Registry downloads** — npm/PyPI install counts when available
- **Platform breadth** — how many AI platforms officially support this tool
- **Description quality** — is it documented enough to actually use?

All weights and formulas are public at agentrank-ai.com/methodology. No black boxes. No pay-to-play.

The result: a live, daily-updating ranked index of 25,000+ tools. Browse it at agentrank-ai.com or install the MCP server and let your AI use it automatically:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

After that, whenever your AI needs an MCP server or agent tool, it queries the live index and gets current, scored results — not a guess from months-old training data.

**What's indexed:**
- MCP servers (the full Model Context Protocol ecosystem)
- AI skills (Claude Code skills, agent capabilities)
- Agent tools (GitHub Actions, automation tools, A2A agents)

**Everything is free:** The leaderboard, the API, the MCP server. Always. Open source: github.com/superlowburn/agentrank

---

## 3. Gallery Assets

All files are in `scripts/product-hunt-assets/`. All screenshots at 1270x760px.

### Upload Order (PH gallery — first image becomes social card)

| Order | File | Page | Description |
|-------|------|------|-------------|
| 1 | `ph-00-hero.png` | — | Hero card with branding, stats, MCP install command |
| 2 | `ph-01-homepage.png` | agentrank-ai.com | Skills leaderboard — 500 ranked tools, scores, platform badges, install counts |
| 3 | `ph-05-api.png` | /api-docs/ | MCP server install + REST API reference — the developer hook |
| 4 | `ph-03-category.png` | /category/mcp-server/ | MCP Servers — 20,000+ tools ranked by score |
| 5 | `ph-02-tool-detail.png` | /tool/microsoft--azure-devops-mcp/ | Score breakdown with radar chart + per-signal weights |
| 6 | `ph-04-methodology.png` | /methodology/ | Scoring transparency — eight signals, no black boxes |

### Logo
Use `assets/ar-avatar.png` (400x400px, meets PH 240x240 minimum)

---

## 4. Maker's First Comment (post immediately after launch — from Steve's PH account)

Hey PH Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen. There's no way for the AI to know what's actually alive.

So I built the index I wanted to exist.

AgentRank crawls GitHub every night for every MCP server, AI skill, and agent tool it can find — 25,000+ right now. Each gets a score (0–100) based on real signals: freshness, issue health, stars, contributors, and dependents. The score is opinionated on purpose. A tool that shipped last week and has five contributors beats a more-starred tool dormant for four months. That's the right call.

The MCP server is the part I'm most excited about. Install it once and your AI queries the live index automatically when it needs a tool. No prompting, no config:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

A few things I'd love your take on:

1. **Scoring weights** — Freshness and issue health carry 20% each. Does this feel right? What signal am I missing?
2. **Claim flow** — Maintainers can claim their listing and add context. Worth building out further?
3. **Categories vs. flat list** — Right now it's one ranked list with filters. Worth dedicated category leaderboards?

Everything is free and open source. Happy to answer questions.

— Steve

---

## 5. Launch Day Tweets (from @comforteagle — all require Steve's approval)

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

### Tweet C — The problem hook (post ~4h)
```
Asked Claude to recommend an MCP server.

It suggested one that hasn't been updated in 6 months, has 47 open issues, and one contributor.

This is a training data problem. AgentRank fixes it.

agentrank-ai.com
```

### Tweet D — How scoring works (post ~6h)
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

## 6. Pre-Submission Checklist

### Assets (all ready in scripts/product-hunt-assets/)
- [x] Hero image: `ph-00-hero.png` (1270x760px)
- [x] Homepage screenshot: `ph-01-homepage.png` (1270x760px)
- [x] Tool detail screenshot: `ph-02-tool-detail.png` (1270x760px)
- [x] Category screenshot: `ph-03-category.png` (1270x760px)
- [x] Methodology screenshot: `ph-04-methodology.png` (1270x760px)
- [x] API docs screenshot: `ph-05-api.png` (1270x760px)
- [x] Tagline written (56 chars)
- [x] Short description written (243 chars)
- [x] Full description written
- [x] Maker comment written

### Steve Must Do Before Submitting
- [ ] Review and approve all copy above
- [ ] Upload gallery images in order listed in Section 3
- [ ] Set logo to `assets/ar-avatar.png`
- [ ] Connect PH account to agentrank-ai.com (maker verification badge)
- [ ] Preview listing on mobile before publishing
- [ ] Select launch day (Tuesday or Wednesday, 12:01 AM PT)
- [ ] Post maker comment immediately after listing goes live

### Post-Launch
- [ ] Add PH badge to GitHub README
- [ ] Save the PH listing URL for future marketing materials
- [ ] Document upvote count, final rank, and traffic spike

---

*Refer to `scripts/product-hunt-launch.md` for the full launch playbook: upvote strategy, timing, outreach tiers, and the 4-hour rule.*
