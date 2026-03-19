# AgentRank — Product Hunt Launch Brief

> **STATUS: AWAITING STEVE'S APPROVAL — Do not submit or post anything until Steve approves.**
> Compiled by Community Manager from research in `product-hunt-launch.md` and `producthunt-launch-package.md`.
> Last updated: 2026-03-19

---

## 1. Tagline (56 chars — recommended)

```
Your AI recommends outdated tools. AgentRank fixes that.
```

**Alternates:**
- `Google PageRank for AI agents. 25,000+ tools ranked daily.` (59 chars)
- `Live rankings for 25,000+ MCP servers and agent tools` (54 chars)
- `The live, ranked index of every MCP server on GitHub` (53 chars)

The problem-first framing lands hardest for developers who have felt this exact pain.

---

## 2. Short Description (243 chars — within 260 char limit)

```
AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools — scored daily from real GitHub signals. Install the MCP server once and your AI automatically finds the best tool for any task. No prompting, no config, no stale training data.
```

---

## 3. Maker's First Comment

Post immediately after listing goes live. From Steve's PH account.

---

Hey PH, Steve here, the builder.

I made this because I kept getting burned. I'd ask Claude for an MCP server recommendation and it'd confidently suggest something abandoned six months ago — 47 open issues, one contributor, maintainer gone. The training data is frozen and there's no way for the AI to know what's actually alive right now.

So I built the index I wanted to exist.

AgentRank crawls GitHub every night for every MCP server, AI skill, and agent tool it can find — currently 25,000+. Each one gets a score based on real signals: stars, freshness, issue health, contributor count, and how many other repos depend on it. The score is opinionated. That's intentional. A tool that shipped last week and has five contributors scores higher than a more-starred tool dormant for four months.

The MCP server is the part I'm most excited about. Install it once and your AI automatically queries the live index when it needs a tool. No prompting, no config:

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

A few things I'd love your feedback on:

1. **Scoring weights** — Freshness 20%, Issue Health 20%, Stars, Contributors, Dependents, Registry Downloads, Platform Breadth, Description Quality. The weights are opinionated by design — does the ordering feel right? What signal am I missing?
2. **Claim flow** — Maintainers can claim their listing and add context. Worth building out further?
3. **Categories vs. flat list** — Right now it's one ranked list with filters. Worth dedicated category leaderboards?

Happy to answer any questions. Thanks for checking it out.

— Steve (@comforteagle)

---

## 4. Gallery Images Spec

All images at **1270x760px**. Files already exist in `scripts/product-hunt-assets/`.

### Upload Order (first image becomes social card when listing is shared)

| Order | File | What it shows |
|-------|------|---------------|
| 1 | `ph-00-hero.png` | Branded hero card — AgentRank stats, tagline, MCP install command. First impression and social card. |
| 2 | `ph-01-homepage.png` | Skills leaderboard — 500 ranked tools with AgentRank scores, platform badges, install counts. Shows the product at a glance. |
| 3 | `ph-05-api.png` | MCP server install command + REST API reference. The developer hook — shows how easy installation is. |
| 4 | `ph-03-category.png` | MCP Servers category — 20,000+ tools ranked by score. Shows scale of the index. |
| 5 | `ph-02-tool-detail.png` | Individual tool page with score breakdown and per-signal weights. Shows methodology transparency. |

**Note:** A 6th asset would be high-impact — a terminal demo GIF (~800x500, 15-20 seconds) showing the `claude mcp add` command followed by Claude using AgentRank to find a tool. This is optional but the single asset that would most differentiate the gallery for a developer audience.

### Logo
`assets/ar-avatar.png` (400x400px, meets PH 240x240 minimum)

---

## 5. Hunter Outreach List

**Context first:** 79% of featured PH posts in 2025 were self-hunted. Unless you personally know one of these hunters, self-hunting is the default recommendation. A well-known hunter only matters if they have 5k+ PH followers active in AI/dev tools and will actually engage on launch day. That said, if outreach is worth trying, here are 10 hunters who fit the brief.

**Verify all of these are still active on PH before reaching out** — follower counts and activity levels change. Profile format: `https://www.producthunt.com/@username`

| # | Name | PH Handle | Why They're a Good Fit |
|---|------|-----------|------------------------|
| 1 | Kevin William David | @kwdinc | One of PH's most prolific hunters — 1,500+ hunts, strong in developer tools and SaaS. Known by the PH team. A hunt from him carries weight. |
| 2 | Niv Dror | @nivo0o0 | Former PH community manager, deeply embedded in the network. Has a large following and strong credibility in the AI/productivity tool space. |
| 3 | Chris Messina | @chrismessina | Silicon Valley veteran (invented the hashtag), long-time PH participant. Well-connected with technical audience. |
| 4 | Andrew Ettinger | @andrewett | Former VP Marketing at Product Hunt, extremely well-connected with PH staff. A good relationship here helps with Featured status consideration. |
| 5 | Mubashar Iqbal | @mubashariqbal | PH Maker of the Year. Builds tools constantly, deeply engaged in the maker/developer community. Understands the "builders for builders" positioning. |
| 6 | Ben Tossell | @bentossell | Founder of Makerpad (acquired by Zapier), very active in low-code/developer tools space, has a substantial audience of technical builders. |
| 7 | Baptiste Jamin | @baptistejamin | Co-founder of Crisp, active PH hunter in B2B/developer tools. Technical credibility with the developer segment. |
| 8 | Josh Pigford | @shpigford | Founder of Baremetrics (acquired), active indie maker and developer tools builder. Known in the bootstrapped/indie developer community. |
| 9 | Lenny Rachitsky | @lennyrachitsky | Newsletter with 600k+ subscribers (product/growth), very active in developer and AI tools space. A hunt from Lenny would reach a wider professional audience. |
| 10 | Rohan Rajiv | @rohanrajiv | Active product person, regular PH participant, strong following in productivity and developer tools. Lower-key than others on this list but reliable engagement. |

**Outreach approach:** Don't cold-ask for a hunt. The most effective approach is to send a genuine note: mention their work, explain what AgentRank does, and ask if they'd be interested in checking it out. If they love it, they'll offer to hunt it. Forcing a hunt from someone who isn't genuinely interested produces zero engagement.

**Timing:** Reach out 1-2 weeks before planned launch date. Give them time to review the product and decide.

---

## 6. Launch Day Plan

Launch at **12:01 AM PT on a Wednesday**. The 24-hour voting window resets at midnight PT. First 4 hours determine final rank — 100 upvotes before 4 AM PT = top 10 finish ~82% of the time.

| Time (PT) | Action |
|-----------|--------|
| 12:01 AM | Listing goes live — confirm it's live |
| 12:02 AM | **Verify listing is Featured on PH homepage.** If not visible there, email PH support immediately. Without Featured, you're invisible. |
| 12:05 AM | Steve posts maker comment (Section 3 — paste verbatim, don't improvise) |
| 12:15 AM | Tweet A from @comforteagle: launch announcement with PH link |
| 12:30 AM | Personal message blast to Product Hunt Ship subscriber list |
| 1:00 AM | DMs to top 10-15 MCP maintainers currently ranked on AgentRank (tell them they're featured, don't ask for upvotes) |
| 2:00 AM | Show HN post: "Show HN: AgentRank — ranked index of every MCP server on GitHub" |
| 3:00 AM | **Check upvote count. On pace for 100 by 4 AM?** If not: escalate personal outreach to Tier 2 contacts now, not at 4 AM. |
| 6:00 AM | Tweet B: tag top 5 MCP maintainers with live rankings from the site |
| 8:00 AM | Reddit posts: r/SideProject, r/LocalLLaMA, r/ClaudeAI, r/ChatGPTCoding |
| 10:00 AM | Tweet C: the problem hook ("Asked Claude for an MCP recommendation...") |
| 2:00 PM | Tweet D: scoring methodology breakdown |
| 6:00 PM | Check rank. If top 5, post a thank-you tweet. Respond to all PH comments that haven't been answered. |
| 10:00 PM | Final push if needed — check rank, respond to remaining comments |

### Pre-Launch Checklist (complete before launch day)

- [ ] Steve approves all listing copy in this brief
- [ ] Product Hunt Ship "Upcoming Product" page live (ideally 4-6 weeks before launch — if not, still worth doing now for day-of notification chain)
- [ ] Ship incentive set (early access, extended tier, or 1:1 with Steve)
- [ ] All 5 gallery images uploaded in order from Section 4
- [ ] Logo uploaded (`assets/ar-avatar.png`)
- [ ] PH account connected to agentrank-ai.com (maker verification badge)
- [ ] Maker comment drafted and saved locally (Section 3)
- [ ] All launch day tweets drafted in advance
- [ ] Pre-announcement tweet sent 1 week before: "Launching on Product Hunt next Wednesday. If you've ever gotten a bad MCP recommendation from an AI, this one's for you."
- [ ] Top 10-15 MCP maintainer handles identified for day-of DMs
- [ ] Ship subscriber message scheduled for 24h before launch: "Launching tomorrow at midnight PT"
- [ ] Listing preview checked on mobile

### Post-Launch

- [ ] Add PH badge to GitHub README
- [ ] Save PH listing URL for future materials
- [ ] Document final upvote count, rank, and traffic numbers
- [ ] Follow up with engaged PH commenters (convert to users)

---

## 7. Key Context for Steve

1. **Get Featured first.** Since September 2024, only ~10% of PH launches get Featured status (appear on homepage). Without it, most users won't see the listing. Featured is decided by PH staff on Useful + Novel + High Craft + Creative criteria. AgentRank's angle: **Useful** (solves a real problem for a large growing audience) + **Novel** (live ranked index of MCP tools at scale doesn't exist yet). Submit the listing draft to PH support 2-3 days before launch for feedback — they sometimes respond with guidance and it signals seriousness.

2. **The Mintlify signal.** Mintlify built the same thing (mcpt), got strong day-one demand on Product Hunt, and shut it down five days later. It conflicted with their core business. This is a compelling PH narrative: "Mintlify validated the demand. We're the one that stayed." Use this in the listing and in outreach.

3. **Hunter vs. self-hunt.** 79% of Featured posts in 2025 were self-hunted. Unless you personally know someone on the hunter list above who is active and enthusiastic, self-hunt is the right call. A reluctant hunt from a well-known hunter is worse than a self-hunt.

4. **100 upvotes by 4 AM PT.** This is the launch day KPI. Everything else is in service of hitting this window.

5. **All public tweets and posts require Steve's approval before publishing.**

---

*All content requires Steve's approval before any public posting. Research: Market Researcher agent. Strategy: Growth Engineer. Compiled: Community Manager.*
