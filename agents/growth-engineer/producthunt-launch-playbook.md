# AgentRank — Product Hunt Launch Day Playbook

*Based on AUT-414 PH research. Execution guide for launch day.*

---

## Recommended Launch Date

**Tuesday, March 31, 2026 at 12:01 AM PST**

Why March 31:
- Tuesday = maximum daily active users on PH
- Gives time to finish listing copy (AUT-416) and get Steve approval this week
- Avoids overlapping with YC batch timing (next batch is late March/April; check exact demo day date closer to launch)
- Not a US holiday or long weekend

Backup: Tuesday, April 7 if AUT-416 slips.

**If 12:01 AM is not feasible** (no late-night coverage), launch at **7:00 AM PST** instead. Slightly fewer hours but still catches the full US workday.

---

## Pre-Launch Checklist (Complete by March 28)

- [ ] AUT-416 listing copy approved by Steve
- [ ] Thumbnail (240×240px GIF or PNG) ready
- [ ] Screenshots (4–6 at 1270×760px) ready
- [ ] Maker comment written and saved offline — ready to paste at launch
- [ ] Steve has an active Product Hunt profile (age matters for upvote weight)
- [ ] @AgentRank_ai Twitter account warmed up (recent activity)
- [ ] Email signup CTA live and tested on agentrank-ai.com
- [ ] Tweet pre-written for @comforteagle personal account
- [ ] Notify list of top-ranked maintainers to DM on launch day (from AUT-294 if ready)

---

## Launch Day Timeline

### 11:45 PM (Night Before) — Staging

- [ ] Draft listing finalized and sitting in PH draft mode
- [ ] Maker comment copied into a note app (not in browser — prevent session timeout)
- [ ] Twitter draft queued in TweetDeck or similar
- [ ] AgentHive post drafted offline
- [ ] Steve awake or available to co-monitor first 2 hours

### 12:01 AM PST — Go Live

- [ ] Publish the listing
- [ ] **Immediately** post the maker comment (first comment wins prime visibility)
- [ ] Tweet from @AgentRank_ai:

  > We just launched on Product Hunt 🚀 AgentRank ranks 25,000+ MCP servers by real GitHub signals — freshness, issue health, contributors, dependents. If you're evaluating AI tools, this is the fastest way to tell what's actually maintained. → [PH link]

- [ ] **Steve posts from @comforteagle:**

  > Built @AgentRank_ai to solve a problem I kept hitting — too many MCP servers, no signal on which ones actually work. Launched on Product Hunt today. Would love your feedback → [PH link]

### 12:01–1:00 AM PST — First Hour

Priority: Get to Top 5 by hour 4. These actions drive early velocity.

- [ ] Steve shares PH link in any Slack/Discord communities where he's an active member (not cold channels — only places where he has history)
- [ ] DM personal contacts who are active PH users (genuine request: "launched today, would love your feedback")
- [ ] Post to AgentHive from @agentrank account (see AgentHive post template below)
- [ ] Check PH comments every 15 minutes and reply to every comment
- [ ] If a top-ranked MCP tool maintainer engages, reply publicly and amplify

### 1:00–4:00 AM PST — Early Watch

- [ ] Check rank on PH every 30 minutes
- [ ] Reply to new comments within 15 minutes
- [ ] If rank is slipping, post one more tweet from @AgentRank_ai with a specific data hook (e.g., "tool X gained 200 stars this week, currently ranked #3 on AgentRank")
- [ ] No upvote solicitation in PH comments — violates guidelines

### 6:00 AM PST — Morning Push

US East Coast is awake. Peak individual-developer traffic.

- [ ] Tweet thread from @comforteagle: "We launched AgentRank on Product Hunt this morning. Here's the problem it solves and what we built [link]" (3–4 tweet thread)
- [ ] Post in relevant Discord/Slack dev tool channels (Steve only — known member)
- [ ] Notify top-ranked MCP maintainers via GitHub issues or Twitter DM with personalized note (drafts at AUT-294)

### 1:00 PM PST — Afternoon Boost

US lunch / peak traffic window.

- [ ] Second tweet from @AgentRank_ai with a data-driven hook:

  > Mid-day update: [current rank] on @ProductHunt today. Some surprising data from today's index — [interesting finding]. If you're building agents, the full leaderboard is at agentrank-ai.com.

- [ ] Reply to any PH comment that's gaining traction

### 5:00 PM PST — End of Day Push

- [ ] Tweet from @comforteagle: "Launch day almost done. AgentRank is [rank] on Product Hunt — thanks everyone who checked it out today. [link]"
- [ ] No final hard push; let it close naturally

### 11:59 PM PST — Wrap

- [ ] Record final rank and upvote count
- [ ] Export PH comment thread (screenshot or copy text)
- [ ] Thank anyone who engaged on PH, Twitter, or AgentHive

---

## Social Post Templates

### @AgentRank_ai — Launch tweet
```
We just launched on Product Hunt 🚀

AgentRank ranks 25,000+ MCP servers by real GitHub signals — freshness, issue health, contributors, and more.

If you're building with AI agents and need to know which tools are actually maintained, this is it.

→ [PH link]
```

### @comforteagle — Personal launch tweet
```
Built @AgentRank_ai because I kept hitting this problem: 25,000 MCP servers on GitHub, no way to tell which ones are worth using.

AgentRank scores every tool on 5 signals and ranks them daily.

Launched today on Product Hunt — would appreciate your eyes on it → [PH link]
```

### @AgentRank_ai — Afternoon data hook
```
Halfway through launch day on @ProductHunt.

Quick data point from today's index: [X] new MCP servers added this week. [Y]% have at least 2 contributors. The ones scoring in the top 10% average [Z] days since last commit.

Freshness really is the signal. → agentrank-ai.com
```

### AgentHive post from @agentrank
```
just launched on product hunt today — https://agentrank-ai.com ranks 25k+ MCP servers by github signals. been running the index for a while, figured it was time to show it to more people. if you build with tools, curious what you'd want to see added 🔍
```

---

## PH Comment Response Templates

These go in the maker comment and as replies throughout the day.

### "What is this?"
> AgentRank is a ranked index of every MCP server and AI agent tool on GitHub — scored daily by 5 real signals: freshness (days since last commit), issue health (closed/total ratio), star count, contributor count, and inbound dependents. The goal is to give developers a fast way to see which tools are actively maintained vs. abandoned. Free to use, API available.

### "How does the scoring work?"
> Five signals, weighted: freshness (25%), issue health (25%), inbound dependents (25%), stars (15%), contributors (10%). Each tool gets a 0–100 score. The weights are opinionated — we think freshness and maintainer responsiveness matter more than raw popularity. Open to discussion on the weights, that's part of why we launched here.

### "Why not just sort GitHub by stars?"
> Stars are a terrible quality signal for MCP tools specifically. A lot of popular repos from 2024 have 1,000+ stars and haven't been touched in 6 months. AgentRank scores on freshness and issue health, so a project with 200 stars and an active maintainer scores higher than a stale 2,000-star project. That's the point.

### "Is this open source?"
> The crawler and scoring engine are open source on GitHub (github.com/superlowburn/agentrank). The website and API are free to use — no account required to browse or hit the API.

### "How do I get my tool listed?"
> If it's on GitHub with relevant keywords (MCP server, model context protocol, agent tool, etc.), the crawler will find it automatically and it'll appear within 24 hours of the next nightly run. No submission needed. If a specific tool is missing, open an issue on the GitHub repo.

### "What categories are you planning to add?"
> Right now it's a flat list by score — intentionally simple. Categories are next. The natural breakdown I see in the data: file/storage tools, web/browser tools, database connectors, code/dev tools, communication/messaging, data/analytics. Would love input on what groupings would be most useful.

### "I built a tool — how can I claim my listing?"
> Claim flow is coming soon (it's on the roadmap). For now, open a GitHub issue on superlowburn/agentrank with your tool's slug and contact info and I'll add you manually. The claim flow will let you add a description, social links, and see detailed analytics.

---

## Steve's Launch Day Action Items

These require Steve specifically — they can't be delegated.

1. **Publish the PH listing** (Steve must be the PH account that posts)
2. **Post the @comforteagle personal launch tweet** (Tier 1 contact reach, can't use @AgentRank_ai)
3. **Share in known communities** — Discord/Slack channels where Steve is a real member with history
4. **DM personal contacts** — 10–15 people Steve knows who are on PH and would genuinely find this useful
5. **Upvote the listing from Steve's PH account** (logged in, established account age)
6. **Monitor and engage in the first 4 hours** — being available to respond to PH comments in real time is the difference between landing in Top 5 vs. not

**What Steve does NOT need to do:**
- Manually post every tweet (Growth Engineer handles @AgentRank_ai posts)
- Draft response templates (already done above)
- Monitor overnight solo (Growth Engineer monitors @AgentRank_ai and AgentHive)

---

## Contingency Plans

### If ranked <10 by hour 4
- Steve posts one direct ask to his strongest network contacts
- Post a more aggressive data hook tweet from @AgentRank_ai with a compelling ranking insight
- Don't panic — some launches recover in the afternoon push

### If PH listing has an error post-launch
- Don't delete and repost (kills all upvotes and resets position)
- Edit in place via PH maker dashboard (description and screenshots can be updated)
- Tagline cannot be changed post-launch

### If a competitor launches the same day
- Check their launch time and upvote velocity
- If they launched before you and are far ahead: focus on developer quality engagement over raw upvotes; the audience overlap (MCP developers) is still valuable
- Differentiate in comments: position AgentRank as data-driven scoring vs. curation or directory

---

## Post-Launch (Days 1–3)

- [ ] Export all PH comments and engagers
- [ ] Follow on Twitter/X anyone who engaged and has a linked profile
- [ ] Post "launch results" tweet: rank, upvotes, traffic, sign-ups (transparency wins respect)
- [ ] Write a 300-word blog post: "AgentRank launched on Product Hunt — here's what happened" (permanent SEO content, often picked up by developer media)
- [ ] "Featured on Product Hunt" badge — add to agentrank-ai.com homepage

---

*Last updated: March 19, 2026. Approved by: [pending Steve review]*
