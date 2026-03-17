# AgentRank — Product Hunt Launch Assets

> **STATUS: READY FOR REVIEW — Steve must approve before submitting.**

---

## 1. Listing Copy

### Product Name
AgentRank

### Tagline (60 chars max)
`Google for AI agents. 25,000+ tools ranked daily.`
(50 chars)

**Alternates:**
- `Live rankings for 25,000+ MCP servers and agent tools` (54 chars)
- `Your AI recommends outdated tools. AgentRank fixes that.` (56 chars)

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

## 2. Gallery Screenshots

All 5 screenshots captured at 1270×760px. Files in `site/public/ph/`.

| File | Page | Description |
|------|------|-------------|
| `ph-01-homepage.png` | agentrank-ai.com | Skills leaderboard — 500 ranked tools with scores, install counts, platform badges |
| `ph-02-tool-detail.png` | /tool/microsoft--azure-devops-mcp/ | Score breakdown with radar chart + per-signal weights and driver text |
| `ph-03-category.png` | /category/mcp-server/ | MCP Servers category — 20,128 tools ranked by score |
| `ph-04-methodology.png` | /methodology/ | Scoring transparency — eight signals, no black boxes, no pay-to-play |
| `ph-05-api.png` | /api-docs/ | MCP server install + REST API reference |

**Upload order:** ph-01 first (used as social card when listing is shared), then ph-05 (MCP install), then ph-03, ph-02, ph-04.

---

## 3. Maker Comment (first comment after launch — post from Steve's PH account)

Hey PH 👋 Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen. There's no way for the AI to know what's actually alive.

So I built the index I wanted to exist.

AgentRank crawls GitHub every night for every MCP server, AI skill, and agent tool it can find — 25,000+ right now. Each gets a score (0–100) based on real signals: freshness, issue health, stars, contributors, and dependents. The score is opinionated on purpose. A tool that shipped last week and has five contributors beats a more-starred tool dormant for four months. That's the right call.

The MCP server is the part I'm most proud of. Install it once and your AI queries the live index automatically when it needs a tool. No prompting, no config:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

A few things I'd love your take on:

1. **Scoring weights** — Freshness 25%, Issue Health 25%, Dependents 25%, Stars 15%, Contributors 10%. Does this feel right? What signal am I missing?
2. **Claim flow** — Maintainers can claim their listing and add context. Worth building out further?
3. **Categories vs. flat list** — Right now it's one ranked list with filters. Worth dedicated category leaderboards?

Everything is free and open source. Happy to answer any questions.

— Steve

---

## 4. Launch Day Tweets (from @comforteagle — all need Steve's approval)

### Tweet A — Go-live announcement
```
Just launched on @ProductHunt.

AgentRank: Google for AI agents.

Install one MCP server → your AI automatically searches 25,000+ live-ranked tools whenever it needs one.

No stale training data. No abandoned tools.

👉 [Product Hunt link]
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

> Tag each maintainer's Twitter handle.
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

• Freshness (25%) — days since last commit
• Issue health (25%) — closed/total ratio
• Dependents (25%) — who relies on this
• Stars (15%) — raw popularity
• Contributors (10%) — bus factor

Updated nightly. agentrank-ai.com
```

---

## 5. Pre-submission Checklist

- [ ] Steve reviews all copy above
- [ ] Upload screenshots in order: ph-01, ph-05, ph-03, ph-02, ph-04
- [ ] Logo: use `assets/ar-avatar.png` (400×400px, meets PH 240×240 minimum)
- [ ] PH account connected to agentrank-ai.com (for maker verification badge)
- [ ] Preview listing on mobile before publishing
- [ ] Select launch day (Tuesday or Wednesday, 12:01am PT recommended)
- [ ] Post maker comment immediately after listing goes live
- [ ] @AgentRank_ai account ready to monitor PH comments (Steve approves all replies)
- [ ] Add PH badge to GitHub README after launch

---

*Assets prepared by Vibe Coder agent. All content requires Steve's approval before any public posting.*
