# AgentRank — Product Hunt Launch Playbook

> **STATUS: DRAFT — Steve must review and approve all content before submitting.**
> Research by Market Researcher. Copy synthesized from Growth Engineer + Vibe Coder drafts.
> Last updated: 2026-03-18

---

## TL;DR

- **Launch day:** Wednesday (or Tuesday) at 12:01 AM PT
- **Critical gate:** Get 100 upvotes before 4 AM PT — this is the strongest predictor of Top 10
- **Required step:** Must get **Featured** status (only ~10% of launches get it — plan for this)
- **Pre-launch:** Start Product Hunt "Ship" campaign 4-6 weeks before launch day
- **Parallel launch:** Post "Show HN" on Hacker News same day
- **Unique angle:** Notify top-ranked MCP maintainers they're featured — they become your amplifiers

---

## 1. Launch Timing

### Day
**Wednesday is the recommendation.** High developer traffic, competitive but not as saturated as Tuesday. Weekend launches are easier to win POTD (200-300 upvotes vs. 500+ on weekday) but at the cost of lower absolute reach. For a developer tool targeting a technical audience, weekday traffic is better.

### Time
**Launch at exactly 12:01 AM PT.** The 24-hour voting window starts and resets at midnight Pacific Time. Every hour counts. The first 4 hours determine your final rank — launches crossing 100 upvotes before 4 AM PT finish in Top 10 ~82% of the time.

### Sequencing
Launch AgentRank on PH **after** the Reddit/HN community posts are live. Use those as social proof in your launch day outreach: "We just launched on PH — here's the HN thread for background."

---

## 2. The Featured Status Problem

**The most important thing most PH launch guides don't mention:** Since September 2024, Product Hunt manually curates which products appear on the homepage ("Featured"). Only ~10% of launched products get Featured. If you're not Featured, you don't appear in the main feed or mobile app — you're invisible.

Featured is decided by PH staff based on four criteria: Useful, Novel, High Craft, Creative. You don't need all four. Spike hard on one or two.

**For AgentRank, lead with:**
- **Useful** — This solves a real problem (AI recommending dead tools) for a large and growing audience
- **Novel** — A ranked index of MCP tools with a transparent scoring methodology hasn't been done at scale

**To increase Featured odds:**
- Submit the listing draft to PH support 2-3 days before launch for feedback (they sometimes respond with guidance)
- Ensure the listing is polished: all screenshots uploaded, description complete, no placeholder copy
- Consider reaching out to PH's developer tools curator directly if you have any network connection there
- The Ship campaign pre-launch subscribers signal demand and increase Featured probability

---

## 3. Pre-Launch Campaign (4-6 Weeks Before Launch Day)

### Product Hunt Ship
Create an "Upcoming Product" page on PH using Ship. This is free and critical.

- Every subscriber gets their PH followers notified when you launch (viral notification chain)
- Products using Ship average 3x more launch day engagement
- Run for at least 4 weeks minimum, 6 weeks is better
- Send a message to subscribers 24-48 hours before launch: "We're launching tomorrow at midnight PT"
- **Offer an incentive:** Early access, extended free tier, or a 1:1 onboarding call with Steve. The incentive drives Ship subscriptions.

### Build Your PH Following
Followers of your maker profile on PH get notified when you launch. Build this before launch day:
- Follow active PH users in AI/developer tools
- Engage with relevant launches (comments, upvotes) in the weeks before
- Ask your existing community (GitHub stars, email list, Twitter followers) to follow your PH profile

### The No-Prompt Pre-Announcement
One week before launch, tweet from @comforteagle: "Launching on Product Hunt next Wednesday. If you've ever gotten a bad MCP tool recommendation from an AI, this one's for you. [PH Ship page link]"

---

## 4. Competitive Landscape — Comparable PH Launches

### Most Relevant Comparable: mcpt (Mintlify)
mcpt was a curated MCP server registry launched by Mintlify on Product Hunt. It pulled 3,000+ visitors on day one. Mintlify shut it down five days later — it conflicted with their core product focus and they couldn't maintain it. This is the single most important data point for AgentRank's PH pitch: **the demand signal exists, the winner hasn't shipped yet.** Mintlify validated the market and exited it. AgentRank is the standalone project that can actually sustain it.

### Other MCP-Adjacent Launches (2025)
| Product | Description | Relevance |
|---------|-------------|-----------|
| MCP Playground | Test/inspect MCP servers in browser | Same ecosystem, different angle |
| xmcp | Framework for building MCP apps | Developer tooling for MCP builders |
| GitHub MCP Server | Official GitHub MCP server | Major ecosystem player validated on PH |
| Pipedream MCP | 2,500+ API integrations for AI | Shows scale appetite in the space |
| mcp-use | Open source SDK for MCP agents, 5k+ GitHub stars | Strong developer credibility, active community |

### Comparable Developer Tool Launches (2025)
| Product | Result | Key Tactic |
|---------|--------|------------|
| Appwrite Sites | #1 POTD, #1 Dev Tool of Week/Month | Open source community mobilization |
| Lingo.dev | #2 POTD, #1 Dev Tool of Week/Month | Cross-posting with developer community support |
| Permit.io | Product of the Day | Featured other dev tools → they amplified in exchange |
| Kilo Code | Top 5 twice in 2025 | Launched twice for major updates |
| Lovable | 3,420 upvotes | Tapped Figma's Slack community specifically |
| Frontend AI | 1,200+ organic upvotes, zero paid | Strong product-market fit did the work |

**Key tactic to steal from Permit.io:** Write a companion post or tweet featuring other tools in AgentRank's top 10. Reach out to those maintainers before launch. They have incentive to share because you've featured them. For a ranking product, this is cleaner than almost anything else.

---

## 5. Listing Copy

### Product Name
AgentRank

### Tagline Options (60 char max — pick one)
| Option | Chars | Notes |
|--------|-------|-------|
| `Google PageRank for AI agents. 25,000+ tools ranked daily.` | 59 | Strong, explains what it does |
| `Live rankings for 25,000+ MCP servers and agent tools` | 54 | Descriptive, clear |
| `Your AI recommends outdated tools. AgentRank fixes that.` | 56 | Problem-first, punchy |
| `The live, ranked index of every MCP server on GitHub` | 53 | Simple and specific |

**Recommendation:** "Your AI recommends outdated tools. AgentRank fixes that." — the problem-first framing creates immediate resonance with the target audience. The developer audience on PH has felt this pain.

### Short Description (260 chars max)
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.

*(243 chars)*

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

## 6. Maker's First Comment

Post immediately after listing goes live. This is the comment that starts the conversation. Write it in advance — do not improvise.

---

Hey PH 👋 Steve here, the builder.

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

*Target length: ~300-350 words. The open questions at the end invite technical discussion — exactly the engagement that drives the PH algorithm.*

---

## 7. Screenshots

### Captured (in `scripts/ph-screenshots/`, 1270×760px)

| Order | File | Page | What it shows |
|-------|------|------|---------------|
| 1 | `ph-01-homepage.png` | agentrank-ai.com | Skills leaderboard — ranked tools with scores, platform badges, install counts |
| 2 | `ph-02-tool-detail.png` | /tool/microsoft--azure-devops-mcp/ | Score breakdown with radar chart + per-signal weights |
| 3 | `ph-03-category.png` | /category/mcp-server/ | MCP Servers — 20,000+ tools ranked by score |
| 4 | `ph-04-methodology.png` | /methodology/ | Scoring transparency — eight signals, no black boxes |
| 5 | `ph-05-api.png` | /api-docs/ | MCP server install command + REST API reference |

**Upload order for PH:** ph-01 first (becomes social card when listing is shared), then ph-05 (MCP install — the hook for developer audience), then ph-03, ph-02, ph-04.

### Still Needed (ask Vibe Coder)
- **`ph-06-mcp-install.gif`** — terminal showing `claude mcp add agentrank -- npx -y agentrank-mcp-server` followed by Claude using the AgentRank MCP to find a tool. This is the killer asset for a developer audience. A GIF embedded in the maker comment dramatically increases engagement. Specs: ~800×500, 15-20 seconds, clear terminal font, no background noise.

---

## 8. @AgentRank_ai Launch Day Tweet

Post from the @AgentRank_ai brand account at 12:20 AM PT on launch day (after Steve posts maker comment, after Tweet A from @comforteagle).

```
We launched on @ProductHunt today.

AgentRank: a live, daily-ranked index of 25,000+ MCP servers and AI agent tools — scored from real GitHub signals, updated every night.

Your AI recommends tools from frozen training data. We show what's actually alive right now.

[Product Hunt link] #MCP #AI #buildinpublic
```

**Note:** This is a brand account announcement, not a personal one. Keep it factual and link-forward. Do not reply to @comforteagle contacts from this account.

**Requires Steve's approval before posting.**

---

## 9. Upvote Strategy

### The 4-Hour Rule
Get to 100 upvotes before 4 AM PT on launch day. This is the single most important execution target. Everything in this section is designed to hit that window.

### Who to Notify (launch day, ordered by expected impact)

**Tier 1: Personal network**
- Everyone on the Product Hunt Ship subscriber list — personal message, not a template blast
- Existing GitHub stargazers of the agentrank repo — one-time outreach
- Twitter followers (@comforteagle)

**Tier 2: MCP maintainers you're already featuring**
- Day before launch: DM the top 10-15 maintainers in AgentRank's current rankings. Tell them they're in AgentRank's top 10 and that you're launching on PH tomorrow. Ask them to check it out. Don't ask for upvotes directly.
- This is the Permit.io tactic applied to a ranking product. It's clean, non-manipulative, and has high conversion because you've given them something (visibility).

**Tier 3: Reddit communities (post on launch day)**
- r/SideProject (205k members) — built for this
- r/LocalLLaMA — MCP/agent angle
- r/ChatGPTCoding — developer tools angle
- r/MachineLearning — scoring/data methodology angle
- r/ClaudeAI — direct audience overlap

**Tier 4: Slack/Discord communities**
- Anthropic's official Claude Discord (MCP channels)
- Any MCP-specific Slack workspaces you're in
- Indie Worldwide Slack
- Ramen Club Slack

**Tier 5: Hacker News**
- Post "Show HN: AgentRank — ranked index of every MCP server on GitHub" on the same day as the PH launch. HN and PH audiences overlap but aren't identical — both are worth hitting.
- HN drives credibility, PH drives upvotes.

### What NOT to Do
- Don't use upvote exchange services or groups — PH actively detects and penalizes these
- Don't ask for upvotes directly in posts (implied asks are fine, explicit "please upvote" is against the spirit and sometimes against community rules)
- Don't spam multiple comments in the same subreddit

---

## 10. Launch Day Timeline

| Time (PT) | Action |
|-----------|--------|
| 12:01 AM | Listing goes live |
| 12:05 AM | Steve posts maker comment (written in advance) |
| 12:15 AM | Tweet A from @comforteagle (launch announcement) |
| 12:30 AM | Personal outreach blast to Ship subscribers |
| 1:00 AM | DMs to top MCP maintainers |
| 2:00 AM | Show HN post |
| 3:00 AM | **Check upvote count — are we on track for 100 by 4 AM?** |
| 6:00 AM | Tweet B (tag top 5 maintainers with live data) |
| 8:00 AM | Reddit posts go live |
| 10:00 AM | Tweet C (the problem hook) |
| 2:00 PM | Tweet D (scoring methodology) |
| 6:00 PM | Check rank — if in top 5, post a thank-you tweet |
| 10:00 PM | Final push if needed |

---

## 11. Pre-Launch Checklist

### 4-6 Weeks Before
- [ ] Create Product Hunt Ship "Upcoming Product" page
- [ ] Set up Ship incentive (early access? 1:1 with Steve?)
- [ ] Start building PH maker profile following
- [ ] Post Ship link in existing channels (Twitter, GitHub README, newsletter)

### 1 Week Before
- [ ] Pre-announcement tweet from @comforteagle
- [ ] Identify top 10-15 MCP maintainers to contact on launch day (get Twitter handles)
- [ ] Write all launch day tweets in advance (don't improvise)
- [ ] Draft maker comment (from this file — refine but don't rewrite)
- [ ] Verify all screenshots are correct and PH-spec ready

### Day Before
- [ ] Send Ship subscriber message: "Launching tomorrow at midnight PT"
- [ ] Queue up all tweets
- [ ] DM prep list — who gets a personal DM tomorrow?

### Launch Day
- [ ] Steve reviews and approves listing one final time
- [ ] Confirm listing is Featured (check PH homepage — if not there, email PH support immediately)
- [ ] Set an alarm for 12:01 AM PT
- [ ] Have maker comment ready to paste
- [ ] Monitor PH comments and respond to every question same-day

### Post-Launch
- [ ] Add PH badge to GitHub README
- [ ] Save the PH listing URL for future marketing materials
- [ ] Document upvote count, final rank, and traffic spike in project notes
- [ ] Follow up with engaged commenters on PH (convert to users)

---

## 12. Key Notes for Steve

1. **Self-hunt.** 79% of featured posts in 2025 were self-hunted. You don't need a well-known Hunter unless you personally know someone with 5k+ PH followers active in AI/dev tools.

2. **Get Featured first.** Without Featured status, you don't appear on the homepage. This is the gating factor. If you don't get Featured, the launch traffic will be a fraction of what it should be. Focus your listing quality effort on earning this.

3. **The mcpt signal.** Mintlify built the same thing, got strong demand on day one, and shut it down. You can reference this: "Mintlify validated the demand. We're the one that stayed." That's a compelling narrative for a PH audience.

4. **100 upvotes before 4 AM PT.** This is your launch day KPI. If you're tracking under that pace at 2 AM, escalate personal outreach to Tier 2 contacts earlier than planned.

5. **All tweets and replies require Steve's approval** per memory file `feedback_public_approval.md`.

---

*All content requires Steve's approval before any public posting. Research: Market Researcher agent. Copy foundation: Growth Engineer + Vibe Coder agents.*
