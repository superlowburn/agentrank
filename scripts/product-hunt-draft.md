# AgentRank — Product Hunt Launch Draft

> **STATUS: DRAFT — Do NOT submit. Steve must review and post.**
> Last updated: 2026-03-17 by Vibe Coder. Screenshots captured and saved to `scripts/ph-screenshots/`.

---

## 1. Listing Copy

### Product Name
AgentRank

### Tagline (60 chars max)
`Google PageRank for AI agents. 25,000+ tools ranked daily.`
(50 chars)

**Alternates:**
- `Live rankings for 25,000+ MCP servers and agent tools` (54 chars)
- `Your AI recommends outdated tools. AgentRank fixes that.` (56 chars)

### Short Description (~260 chars)
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.

### Full Description (Markdown supported)

Your AI assistant recommends tools from frozen training data. It can't tell you if something was abandoned last week, or that something better shipped yesterday. **AgentRank fixes that.**

We crawl GitHub nightly for every MCP server and agent tool in the ecosystem — and pull in skills from Glama and skills.sh. Each one gets an AgentRank score (0–100) based on eight real signals:

- **Freshness** (20%) — days since last commit (anything over 90 days starts decaying hard)
- **Issue health** (20%) — closed/total ratio (responsive maintainer = healthy tool)
- **Stars** — raw popularity
- **Contributors** — bus factor risk
- **Dependents** — how many other repos rely on this
- **Registry downloads** — npm/PyPI install counts when available
- **Platform breadth** — how many AI platforms support this tool
- **Description quality** — is it documented enough to know what it does?

All weights and formulas are public at agentrank-ai.com/methodology — no black boxes, no pay-to-play.

The result: a live, daily-updating ranked index of 25,000+ tools and 500 top skills. Browse it at agentrank-ai.com or install the MCP server and let your AI use it automatically.

**One-line install:**
```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

After that, whenever your AI needs an MCP server or agent tool, it queries the live index and gets current, scored results — not a guess from months-old training data.

**What's indexed:**
- MCP servers (the Model Context Protocol ecosystem)
- AI skills (Claude Code skills, agent capabilities)
- Agent tools (GitHub Actions, automation tools, A2A agents)

**What's free:**
- The full leaderboard — always
- The API — always
- The MCP server — always

AgentRank is open source: github.com/superlowburn/agentrank

---

## 2. Screenshots

> **Screenshots captured 2026-03-17. Files in `scripts/ph-screenshots/` at 1440×900px (2x retina via Chrome headless).**
> PH recommends 1270×760px — consider resizing before upload, or crop to show the best portion.

| File | Page | What it shows |
|------|------|---------------|
| `homepage.png` | agentrank-ai.com | Skills leaderboard — hero CTA, install command, ranked table with scores & platform badges |
| `skill-detail.png` | /skill/glama-microsoft--playwright-mcp/ | Skill detail — signal breakdown bars, "How to Improve" section, badge embed code |
| `tool-detail-radar.png` | /tool/CoplayDev--unity-mcp/ | Tool detail — radar chart + ecosystem tags + per-signal breakdown with weights |
| `category.png` | /category/mcp-server/ | Category page — tools filtered by MCP Server category |
| `api-docs.png` | /api-docs/ | REST API docs — endpoints, parameters, example responses |

**Suggested PH upload order:** homepage → tool-detail-radar → skill-detail → category → api-docs
(homepage first = it becomes the social card image when the listing is shared)

**Still needed (manual capture recommended):**
- `ph-mcp-install.png` — terminal showing `claude mcp add agentrank -- npx -y agentrank-mcp-server` followed by an AI using it. This is the killer screenshot for a developer audience.

---

## 3. Logo / Thumbnail

### Logo
- **Use:** `assets/ar-avatar.png` (400×400px PNG, meets PH minimum of 240×240)
- No changes needed — upload as-is

### Gallery Thumbnail (first screenshot)
- Screenshot 1 (leaderboard) should be the first image — it's the most visually clear
- PH uses the first screenshot as the social card when the listing gets shared

---

## 4. Maker Comment (First Comment — First-Person from Steve)

> Post this immediately after the listing goes live. First comment from the maker drives engagement.

---

Hey PH 👋 Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen and there's no way for the AI to know what's actually alive right now.

So I built the index I wanted to exist.

AgentRank crawls GitHub every night for every MCP server, AI skill, and agent tool it can find — currently 25,000+. Each one gets a score based on real signals: stars, freshness, issue health, contributor count, and how many other repos depend on it. The score is opinionated. That's intentional. A tool that shipped last week and has five contributors scores higher than a more-starred tool that's been dormant for four months.

The MCP server is the part I'm most excited about. Install it once and your AI automatically queries the live index when it needs a tool. No prompting, no config. It just works.

A few things I'd love your feedback on:

1. **The scoring weights** — Freshness 20%, Issue Health 20%, Stars, Contributors, Dependents, Registry Downloads, Platform Breadth, Description Quality. The weights are opinionated by design — does the ordering feel right to you? What signal am I missing?
2. **The claim flow** — Maintainers can claim their listing and add context. Is this valuable or noise?
3. **Categories** — Right now it's one big ranked list with filters. Worth splitting into dedicated category leaderboards?

Happy to answer any questions. Thanks for checking it out.

— Steve (@comforteagle)

---

## 5. Social Share Images for Twitter Amplification

> These are copy-ready tweets to fire during the PH launch day. Post from @comforteagle.
> All tweets need Steve's approval before posting.

### Tweet A — Launch announcement (post at go-live)
```
Just launched on Product Hunt.

AgentRank: Google PageRank for AI agents.

Install one skill → your AI automatically searches 25,000+ live-ranked MCP servers whenever it needs one.

No stale training data. No abandoned tools.

👉 [Product Hunt link]
```

### Tweet B — Tag the current top 5 (post ~2h after launch)
```
AgentRank launched today on @ProductHunt.

Current top 5 MCP servers:

#1 [tool-name] — [score]
#2 [tool-name] — [score]
#3 [tool-name] — [score]
#4 [tool-name] — [score]
#5 [tool-name] — [score]

Full rankings: agentrank-ai.com

> FILL IN from live data at launch time. Tag each maintainer's Twitter handle.
```

### Tweet C — The problem hook (post ~4h after launch)
```
Asked Claude to recommend an MCP server.

It suggested one that hasn't been updated in 6 months, has 47 open issues, and one contributor.

This is a training data problem. AgentRank fixes it.

agentrank-ai.com
```

### Tweet D — How it works (post ~6h after launch)
```
How AgentRank scores 25,000+ tools:

• Freshness (20%) — days since last commit
• Issue health (20%) — closed/total ratio
• Dependents — who relies on this
• Stars — raw popularity
• Contributors — bus factor
• Registry downloads — npm/PyPI installs
• Platform breadth — how many AI platforms support it

8 signals, transparent weights, updated nightly.
agentrank-ai.com/methodology
```

### Tweet E — Ask for upvotes (post at ~8h mark if momentum needs a push)
```
If you've ever gotten a bad tool recommendation from an AI, AgentRank is for you.

Would appreciate an upvote if you find it useful 🙏

[Product Hunt link]
```

---

## 6. Checklist Before Submission

- [ ] Steve reviews all copy above
- [ ] 6 screenshots captured and uploaded
- [ ] Logo confirmed (assets/ar-avatar.png)
- [ ] Product Hunt account connected to agentrank-ai.com domain (for maker verification)
- [ ] Listing preview checked on mobile (PH is heavily mobile)
- [ ] PH launch day selected (Steve decides — after Reddit/HN for max momentum)
- [ ] @AgentRank_ai Twitter account ready to reply to PH comments (with Steve's approval on each reply)
- [ ] GitHub repo README has PH badge after launch

---

## 7. Timing Notes

- **Best PH launch day:** Tuesday or Wednesday, 12:01am PT
- **Launch after:** Reddit (r/ClaudeAI, r/MachineLearning) and Hacker News posts — use those for pre-launch social proof screenshots
- **Target:** "Product of the Day" — achievable for a developer tool in the AI category on a non-peak week

---

*Generated by Growth Engineer agent. All content requires Steve's approval before any public posting.*
