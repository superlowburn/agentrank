# AgentRank — Product Hunt Launch Package

> **STATUS: AWAITING STEVE'S APPROVAL — Do not submit or post anything until Steve approves.**
> Compiled by Product Manager from assets in scripts/product-hunt-assets/ and research in scripts/product-hunt-launch.md.
> Last updated: 2026-03-18

---

## STEVE: What to Do

1. Read and approve all copy below (edit directly in this file or send feedback)
2. Confirm screenshot files are what you want (preview at `scripts/product-hunt-assets/`)
3. One outstanding asset gap — see Section 3
4. Submit listing on a Wednesday at 12:01 AM PT (see Section 7 for why)
5. After launch goes live: post maker comment (Section 4), then execute tweet timeline (Section 5)

Everything is ready except your approval and the optional terminal GIF (Section 3).

---

## 1. Listing Copy

### Product Name
AgentRank

### Tagline (56 chars — recommended)
```
Your AI recommends outdated tools. AgentRank fixes that.
```

**Alternates if you prefer:**
- `Google PageRank for AI agents. 25,000+ tools ranked daily.` (59 chars)
- `Live rankings for 25,000+ MCP servers and agent tools` (54 chars)
- `The live, ranked index of every MCP server on GitHub` (53 chars)

**Recommendation:** The problem-first tagline lands hardest for developers who have felt this exact pain.

### Short Description (243 chars)
```
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.
```

### Topics
- Artificial Intelligence
- Developer Tools
- Open Source
- Productivity
- API

### Website
https://agentrank-ai.com

### Full Description

Your AI assistant recommends tools from frozen training data. It can't tell you if something was abandoned last week, or that something better shipped yesterday. **AgentRank fixes that.**

We crawl GitHub nightly for every MCP server and agent tool in the ecosystem — and pull in skills from Glama and skills.sh. Each one gets an AgentRank score (0–100) based on eight real signals:

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

## 2. Gallery Screenshots

All files in `scripts/product-hunt-assets/`. All at 1270x760px.

### Upload Order (first image becomes social card when listing is shared)

| Order | File | What it shows |
|-------|------|---------------|
| 1 | `ph-00-hero.png` | Branded hero card with AgentRank stats and MCP install command |
| 2 | `ph-01-homepage.png` | Skills leaderboard — 500 ranked tools, scores, platform badges, install counts |
| 3 | `ph-05-api.png` | MCP server install command + REST API reference |
| 4 | `ph-03-category.png` | MCP Servers — 20,000+ tools ranked by score |
| 5 | `ph-02-tool-detail.png` | Score breakdown with radar chart and per-signal weights |
| 6 | `ph-04-methodology.png` | Scoring transparency — eight signals, no black boxes |

### Logo
Use `assets/ar-avatar.png` (400x400px — meets PH's 240x240 minimum)

---

## 3. Outstanding Asset (Optional but High-Impact)

**Terminal demo GIF** — `ph-06-mcp-install.gif`

Spec: ~800x500, 15–20 seconds, shows `claude mcp add agentrank -- npx -y agentrank-mcp-server` in terminal followed by Claude using the AgentRank MCP to find a tool recommendation.

This is the single asset that would most differentiate the PH gallery for a developer audience. If you want it, it needs to be captured manually and embedded in the maker comment. Not required to launch — the existing 6 screenshots are solid.

---

## 4. Maker Comment (Paste Immediately After Launch — from Steve's PH Account)

```
Hey PH, Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen and there's no way for the AI to know what's actually alive right now.

So I built the index I wanted to exist.

AgentRank crawls GitHub every night for every MCP server, AI skill, and agent tool it can find — currently 25,000+. Each one gets a score based on real signals: stars, freshness, issue health, contributor count, and how many other repos depend on it. The score is opinionated. That's intentional. A tool that shipped last week and has five contributors scores higher than a more-starred tool dormant for four months.

The MCP server is the part I'm most excited about. Install it once and your AI automatically queries the live index when it needs a tool. No prompting, no config. It just works.

A few things I'd love your feedback on:

1. **Scoring weights** — Freshness 20%, Issue Health 20%, Stars, Contributors, Dependents, Registry Downloads, Platform Breadth, Description Quality. The weights are opinionated by design — does the ordering feel right? What signal am I missing?
2. **Claim flow** — Maintainers can claim their listing and add context. Worth building out further?
3. **Categories vs. flat list** — Right now it's one ranked list with filters. Worth dedicated category leaderboards?

Happy to answer any questions. Thanks for checking it out.

— Steve (@comforteagle)
```

---

## 5. Launch Day Tweet Timeline (From @comforteagle — All Require Steve's Approval)

### 12:15 AM — Launch announcement (Tweet A)
```
Just launched on Product Hunt.

AgentRank: Google PageRank for AI agents.

Install one MCP server and your AI automatically searches 25,000+ live-ranked tools whenever it needs one.

No stale training data. No abandoned tools.

[Product Hunt link]
```

### 6:00 AM — Tag the top 5 (Tweet B — fill in from live data at launch time)
```
AgentRank launched on @ProductHunt today.

Current top 5 MCP servers by score:

1. [tool] — [score]
2. [tool] — [score]
3. [tool] — [score]
4. [tool] — [score]
5. [tool] — [score]

Full rankings: agentrank-ai.com

[tag each maintainer's @handle]
```

### 10:00 AM — The problem hook (Tweet C)
```
Asked Claude to recommend an MCP server.

It suggested one that hasn't been updated in 6 months, has 47 open issues, and one contributor.

This is a training data problem. AgentRank fixes it.

agentrank-ai.com
```

### 2:00 PM — How scoring works (Tweet D)
```
How AgentRank scores 25,000+ tools:

- Freshness (20%) — days since last commit
- Issue health (20%) — closed/total ratio
- Dependents (25%) — who relies on this
- Stars (15%) — raw popularity
- Contributors (10%) — bus factor

8 signals. Transparent weights. Updated nightly.
agentrank-ai.com/methodology
```

---

## 6. Pre-Launch Outreach (Day Before Launch)

DM the top 10–15 maintainers currently in AgentRank's rankings. Tell them their tool is in AgentRank's top 10 and that you're launching on PH tomorrow. Don't ask for upvotes — just let them know they're featured. This is the highest-conversion tactic: they have a direct incentive to engage and share because you've featured them.

You can pull the current top 10 from agentrank-ai.com at any time.

---

## 7. Launch Timing Recommendation

**Launch Wednesday at 12:01 AM PT.**

- PH's 24-hour voting window starts and resets at midnight Pacific. Every hour counts.
- The first 4 hours set your final rank. Products crossing 100 upvotes before 4 AM PT finish in the top 10 roughly 82% of the time.
- Wednesday has strong developer traffic — competitive but not as saturated as Tuesday.
- Weekend launches are easier to win Product of the Day (fewer products, lower threshold) but at the cost of significantly less reach and total traffic.
- For a developer tool targeting a technical audience, weekday traffic is worth the competition.

**Critical: Get Featured.** Since September 2024, only ~10% of PH launches appear on the homepage ("Featured"). Without it, your listing is invisible to most users. Featured status is manually curated by PH staff based on Useful, Novel, High Craft, and Creative signals. AgentRank's pitch: Useful (solves a real problem for a growing audience) + Novel (live ranked index of MCP tools at scale doesn't exist yet).

To improve Featured odds:
- Ensure listing is fully polished before submission — all 6 screenshots, complete description, no placeholder copy
- Consider submitting the listing draft to PH support 2–3 days before launch for feedback
- The Mintlify/mcpt data point is useful: "Mintlify built the same thing, got day-one demand, and shut it down. We're the one that stayed." This is a compelling angle for the PH homepage curator.

---

## 8. Submission Checklist

### Before Steve Submits
- [ ] Steve approves all listing copy above
- [ ] Upload 6 gallery images in order from Section 2
- [ ] Set logo to `assets/ar-avatar.png`
- [ ] Connect PH account to agentrank-ai.com (maker verification)
- [ ] Preview listing on mobile before publishing
- [ ] Select launch day (Wednesday recommended — Steve decides final date)
- [ ] Write maker comment into PH draft — do not improvise at midnight

### Launch Day
- [ ] Confirm listing is Featured on PH homepage (if not, email PH support immediately)
- [ ] Post maker comment within 5 minutes of go-live
- [ ] Tweet A at 12:15 AM
- [ ] Check upvote count at 3:00 AM — on track for 100 by 4 AM?
- [ ] Execute tweet timeline (Section 5)
- [ ] Reddit posts at 8:00 AM (r/SideProject, r/LocalLLaMA, r/ClaudeAI)
- [ ] Show HN post at 2:00 AM ("Show HN: AgentRank — ranked index of every MCP server on GitHub")
- [ ] Respond to every PH comment same day

### Post-Launch
- [ ] Add PH badge to GitHub README
- [ ] Save PH listing URL for future materials
- [ ] Document final upvote count, rank, and traffic numbers

---

*All public-facing content requires Steve's approval before posting. Research: Market Researcher. Copy: Growth Engineer + Vibe Coder + Product Manager.*
