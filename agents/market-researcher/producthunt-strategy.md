# AgentRank Product Hunt Launch Strategy

**Context:** PH assets are ready (AUT-379). This is a strategy brief for when and how to launch.

*Last updated: March 2026 — incorporates 2025-2026 MCP tool and developer tool launch data.*

---

## 1. Optimal Launch Timing

### Best Day: Tuesday or Wednesday

Data from top developer tool launches and PH community analysis:
- **Tuesday and Wednesday** generate the most daily active users on Product Hunt
- Monday gets heavy competition from well-funded startups who prep all weekend
- Friday/weekend are dead for overall traffic but see a higher developer-to-visitor ratio — conversion can be stronger for dev tools specifically
- Thursday is acceptable but slightly weaker than Tue/Wed

**Recommendation: Launch on a Tuesday.** If the goal is maximum upvotes, Tue/Wed is optimal. If the goal is maximum developer-quality traffic, Saturday is a credible alternative with less competition.

### Best Time: 12:01 AM PST

Product Hunt's day resets at midnight PST. Launching at 12:01 AM PST gives the full 24-hour window for upvotes. This is the standard advice from every high-performing launcher.

If launching at midnight feels too risky (support coverage, real-time engagement), the next best window is **6–8 AM PST** — catches East Coast developers at their morning desk time and still gets most of the active day.

### The First 4 Hours Are the Algorithm

PH hides upvote counts for approximately the first 4 hours and sorts the homepage more loosely during this window to distribute early exposure. The objective in this phase: **build enough engagement to land in the Top 4 by hour 4.** Reaching 300+ upvotes in the first 2 hours has been cited as a game-changer for day-long visibility.

### Avoid These Dates
- Y Combinator Demo Days (typically March and September batches — heavy competition)
- Major AI conference dates (competing launches will dominate)
- US holidays or long weekends
- Golden Kitty Awards season — PH runs year-end award voting in November/December; launching then gets buried under award-campaign traffic

---

## 2. Required Assets

### Thumbnail
- **Format:** Square, 240×240px, under 3 MB
- **GIF or static:** GIF thumbnails stand out on the homepage — use one if possible, but keep it simple and fast-loading
- **What to show:** The AgentRank score/leaderboard concept at a glance. Not a logo-only thumbnail.

### Gallery Screenshots (4–6 images)
- **Format:** 1270×760px
- **Required shots:**
  1. The main leaderboard — top 10 MCP tools ranked with scores visible
  2. A tool detail page showing the 5-signal breakdown (stars, freshness, issue health, contributors, dependents)
  3. The score formula or methodology explained visually
  4. The search/filter UI
  5. Optional: API endpoint example (curl call → JSON response) for developer credibility
  6. Optional: "10,000+ tools indexed, updated nightly" stat card

### Tagline (under 60 characters)
Formula: Action Verb + Outcome. No hype language.

Candidates:
- `Ranked index of every MCP server on GitHub` (45 chars)
- `Find the best MCP tools — scored by real signals` (48 chars)
- `MCP servers ranked by quality, updated daily` (45 chars)

**Recommended:** `Ranked index of every MCP server on GitHub`

### Product Description
Lead with the problem: GitHub has 25,000+ MCP servers. There's no quality signal. Stars are gamed. Docs are sparse. You can't tell what's maintained.

Then explain the solution: AgentRank scores every tool on 5 signals — freshness, issue health, stars, contributors, and inbound dependents — and publishes a ranked leaderboard updated nightly.

Conclude with: who this is for (developers building AI agents who need to evaluate tools quickly) and what makes it different (data-driven, not curated, not a paid directory).

### First/Maker Comment (pre-written, post immediately at launch)
This is the most-read piece of content on any PH listing. Draft ahead of time.

Structure:
1. One sentence on the problem: "I built agents that needed MCP servers. Finding good ones was miserable — stars don't tell you if a project is abandoned."
2. How AgentRank solves it: 5-signal composite score, 25,000+ repos indexed, nightly updates.
3. Invite engagement: "Curious what signals you'd add or what categories you'd want to see broken out first."
4. Transparency: mention what's free, what's coming.

Length: 150–250 words. Conversational, not marketing copy.

---

## 3. Category Selection

Product Hunt has overhauled its category system in 2025–2026. The most relevant categories for AgentRank:

| Category | Fit | Competition Level | Notes |
|----------|-----|-------------------|-------|
| **AI Agents** | High | Medium | Broadest AI agent category; large audience |
| **Developer Tools** | High | High | Classic dev tool category; large and engaged audience |
| **AI Infrastructure** | Medium | Lower | Good for positioning as data layer for agent builders |
| **AI Agent Automation** | High | Low | Newer category, less competition |

**Primary recommendation: Developer Tools.** This is AgentRank's home. The audience is exactly right — developers evaluating and selecting tools. Competition is higher but the fit is unambiguous.

**Secondary/topic tags to add:** AI Agents, Open Source, APIs, Productivity

Real comps from 2025 MCP tool launches:
- AutoMCP (158 upvotes) — launched under Developer Tools
- Brainfork (161 upvotes) — AI Agents category
- Stripe Testing Tools MCP Server (125 upvotes) — Developer Tools
- TestSprite 2.1 (450 upvotes) — Developer Tools; integrated MCP server prominently

The 450-upvote TestSprite launch is the ceiling to aim for. They had a well-established user base, but the MCP angle was central to the launch story and resonated strongly with the developer audience.

---

## 4. Pre-Launch (2 Weeks Before)

### Warm the Audience
- Tweet from @AgentRank_ai: "We're launching on Product Hunt on [date]. Follow us there to support."
- @comforteagle should post the same from their personal account (personal accounts carry more weight for community trust)
- Tag 5–10 top-ranked MCP maintainers — they have personal incentive to engage because a high ranking on AgentRank means exposure for them
- Add "Launching on Product Hunt [date]" banner to site homepage

### Build the PH Profile
- Ensure Steve has a complete, active Product Hunt profile before launch (PH profiles with history carry authority — upvotes from established accounts count more)
- Follow relevant makers and engage with a few PH posts in the week before launch (organic engagement, not a sprint)

### Email the Existing List
- If there are subscribers by launch day, send a "we're launching" email the morning of
- Direct link to the PH listing, single CTA: upvote
- Subject line: "We're on Product Hunt today — [quick link]"

### Hunter Decision
- Self-hunting is fine for credibility and control
- If a well-known PH hunter with 10K+ followers is available, the distribution is worth it
- Do not pay for hunting; do not use hunters with no real audience

---

## 5. Launch Day Playbook

### Pre-12:01 AM (Night Before)
- All assets uploaded and listing in draft state
- Maker comment written and saved externally (paste it within 2 minutes of going live)
- All tweets drafted and saved in a scheduling tool
- Confirm someone is awake for the first 4 hours (or at least the first 2)

### First 4 Hours (Critical Window)
1. Listing goes live at 12:01 AM PST
2. Maker comment posted within 2 minutes — pre-written, paste immediately
3. @AgentRank_ai tweets the launch link
4. Steve posts personal tweet from @comforteagle: direct, not "please upvote" — "we launched today"
5. Tag 3–5 MCP maintainers who are active on PH/Twitter — framed as a heads-up, not a solicitation
6. Share in any Discord/Slack communities where you're an established member (not a new join)

**Do not** post in communities where you've never contributed. PH's algorithm flags coordinated voting patterns from new accounts. Quality > volume.

### During the Day (Hours 4–24)
- Respond to every single PH comment, even short ones
- If someone asks a question, answer with data — link to a specific tool ranking, show the methodology
- Share interesting data points as comments: "fun fact: 62% of MCP servers on GitHub haven't had a commit in 90+ days"
- Post 1–2 follow-up tweets from @AgentRank_ai during the afternoon (peak US East Coast hours: 1–3 PM EST)
- Avoid any language like "please upvote" — PH penalizes direct solicitation

### Messaging Framework for Launch Day
Lead with the data, not the product:
- "We indexed 25,000+ MCP servers and agent tools. Here's what the data says is actually worth using."
- "Most MCP directories are just link lists. We score every tool on 5 signals: freshness, issue health, stars, contributors, dependents."
- "Turns out 62% of MCP servers on GitHub haven't had a commit in 90+ days. We built a filter for that."

Each of these is a tweet that drives curiosity and clicks.

---

## 6. Post-Launch: First 24 Hours

### Hour 0–2: Engagement Blitz (see above)

### Hour 2–8: Sustain
- Check PH comments every 30–60 minutes; respond immediately
- If a comment gets traction (replies from other users), pin or engage with it — threads stay surfaced longer
- Monitor rank — if slipping out of Top 5, push another tweet or community share

### Hour 8–16: Daytime Push
- 1–2 p.m. PST is peak US traffic; a tweet or community mention here can extend the day
- If anyone notable engages (maker of a top MCP tool, known dev influencer), amplify immediately

### Hour 16–24: Finish the Day
- Final tweet from @comforteagle: "Launch wrapping up on PH today — [link] — thanks everyone who checked it out"
- No final push with direct upvote solicitation; let it close naturally

### Day 1–3 Post-Launch
- Export PH comment thread — every person who engaged is a potential subscriber/user
- Follow on Twitter/X anyone who upvoted and has a linked handle
- Post a "thank you" tweet with the final result (rank + upvote count), tag PH

---

## 7. Post-Launch: 30-Day Plan

### Week 1: Content From the Launch
- Write a blog post: "AgentRank launched on Product Hunt — here's what we learned" (ranks for "AgentRank" branded searches, often picked up by developer media)
- Share launch results transparently: rank, upvotes, traffic spike, signups. Developers respect transparency about metrics.
- Tweet thread: "we got X visitors on launch day, here's where they came from"

### Week 2–4: SEO and Backlinks
A Product Hunt listing is permanent. Domain Rating of producthunt.com is ~91.

To amplify the link:
1. Reach out to blogs and newsletters that cover PH launches and dev tools — "we just launched on PH, covering developer tools, worth a mention?"
2. Directories that auto-index PH launches will pick up the listing automatically
3. Write an "alternatives" page: "AgentRank vs. searching GitHub directly" — optimizes for comparison searches and earns additional links

**The PH launch blog post** tends to become one of the most-linked pages on a new site. Use it to internally link to the leaderboard, top tool categories, and MCP ecosystem blog posts.

### Long-term SEO Value
1. **DA-91 backlink** — permanent, passes significant authority to agentrank-ai.com
2. **Branded search coverage** — "AgentRank Product Hunt" searches will surface the listing
3. **Social proof credential** — "Featured on Product Hunt" badge on homepage and in outreach

---

## 8. Upvote Quality Rules (What PH Penalizes)

- Upvotes from newly created accounts are discounted or removed
- Coordinated voting patterns (same IP, same time, same geographic cluster) are flagged
- Purchased votes → listing gets unfeatured
- Mass DMs asking for upvotes → PH community reports it

**What works:** organic personal network, communities where you've actually participated, tagging people with a legitimate interest in the product (MCP maintainers, agent builders), and genuine maker engagement throughout the day.

---

## 9. Competitive Patterns From 2025–2026 MCP Tool Launches

| Product | Upvotes | Key Pattern |
|---------|---------|-------------|
| TestSprite 2.1 | 450 | MCP server angle + existing user base; launched in Developer Tools |
| Brainfork | 161 | "Personal MCP RAG server" — clear individual use case; AI Agents category |
| AutoMCP | 158 | Easy migration story ("convert your existing agents to MCP") |
| Stripe MCP Server | 125 | Brand halo (Stripe) + narrow specific use case |
| Dropstone | 114 | Broad feature set, weaker focus |

**Takeaways for AgentRank:**
- 150–200 upvotes is a realistic target for an unknown brand with no pre-existing PH audience
- 300+ is achievable with strong Twitter/community prep and MCP maintainer engagement (they have personal incentive)
- The narrow, specific value prop wins (TestSprite, AutoMCP) over the broad tool
- Lead with the data angle: "25,000 tools indexed" is a concrete credential that MCP-skeptical developers will notice

---

## 10. Success Criteria

| Outcome | Target | Notes |
|---------|--------|-------|
| Launch rank | Top 5 of the day | Top 3 = badge + extra exposure |
| Upvotes | 150–300 | 150 is realistic baseline; 300 requires strong community prep |
| Site traffic on launch day | 500–1,000 sessions | Single-day spike |
| Email signups from PH | 30–50 | Have signup CTA prominent on site |
| Media pickups within 7 days | 1+ | Reach out proactively |

---

## 11. Dependency Check

Before setting the launch date, confirm:
- [ ] agentrank-ai.com is stable and handles traffic spikes (Cloudflare Pages should be fine)
- [ ] PH listing fully prepared: tagline (under 60 chars), screenshots at 1270×760, GIF thumbnail at 240×240
- [ ] Maker comment written and saved externally (ready to paste at 12:01 AM)
- [ ] Steve has approved all launch copy (required per board approval policy)
- [ ] @AgentRank_ai Twitter is active with some followers
- [ ] Email signup is live and tested (AUT-389)
- [ ] Steve has an active PH profile (upvotes from established accounts carry more weight)

---

*Research date: March 2026. Sources: PH community discussions, Hackmamba developer marketing guide, hunted.space MCP tool launch data, Flowjam launch checklist, Permit.io Developer Tool case study.*
