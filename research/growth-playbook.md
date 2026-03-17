# AgentRank Growth Playbook
**Date:** March 17, 2026
**Author:** Product Manager
**Status:** Draft — Steve review required before any public action

---

## Executive Summary

We have a fully built product with near-zero traffic. All the distribution infrastructure exists — drafts are ready, MCP server is published, API is live, 12 blog posts are deployed — but the amplification hasn't happened. This playbook maps what we have, ranks channels by effort vs. impact, and lays out a 4-week execution plan to get from 0 to meaningful traffic.

**Thesis:** The fastest path to traffic is one community post on r/mcp + one tweet that tags the #1 maintainer. Everything else multiplies from there.

---

## 1. Funnel Analysis

### Current User Journey

```
Discovery (near zero)
  → Landing on agentrank-ai.com
  → Browsing skills / tools leaderboard
  → Installing MCP server (one-line install)
  → Using API (free, no auth)
  → (Future) Upgrading to Pro ($49/mo)
```

### Site Structure Assessment

**What exists:**
- `/` — Skills leaderboard (500 ranked skills, 25K+ tools indexed). Clear install banner at top. Strong first impression.
- `/tools` — Full tools index (25K+ repos)
- `/skill/:slug` — Individual skill detail pages (SEO-optimized)
- `/tool/:owner/:name` — Individual tool detail pages
- `/movers` — Biggest rank changes (shareable, newsworthy)
- `/compare` — Tool comparison (link bait)
- `/blog` — 12 posts (SEO content, live)
- `/pricing` — Free / Pro / Enterprise tiers
- `/api-docs` — Full API documentation
- `/embed` — Embeddable score widgets
- `/claim` — Tool claim flow (future)
- `/submit` — Suggest a tool
- `/agents` — Browse AI agents
- `/category` — Category browse

**The funnel problem:** No traffic, not no product. The homepage tells a clear story ("Google PageRank for AI agents"). The install path is one command. The leaderboard works. The issue is purely top-of-funnel — nobody knows we exist.

### Where Visitors Will Come From (Projected)

| Source | Expected Share | Priority |
|--------|---------------|----------|
| Reddit (r/mcp, r/LocalLLaMA) | 30-40% at launch | Critical |
| HN Show HN | 20-30% at launch | Critical |
| SEO / organic search | 10-20% (grows over 4-8 weeks) | High |
| Twitter/X | 10-15% | High |
| Registry listings (Smithery, Glama) | 5-10% | High |
| Product Hunt | 15-25% on launch day, then 1-2% | Medium |
| Direct / word of mouth | 5-10% | Low (grows over time) |
| Backlinks (awesome lists, badges) | 2-5% initially, compounds | Medium |

### Drop-off Points

1. **Discovery → homepage**: Main gap right now. No top-of-funnel.
2. **Homepage → install**: Low friction (one command). Good.
3. **Install → regular use**: Need to measure. Skills are query-time, so usage compounds naturally once installed.
4. **Free → Pro**: No billing yet. Correct for pre-traction stage.

---

## 2. Channel Ranking: Effort vs. Impact

### Tier 1: Do This Week (High Impact, Low Effort)

#### A. Reddit — r/mcp + r/LocalLLaMA
- **Effort:** 30 minutes (Steve posts the drafts in `scripts/community-posts-draft.md`)
- **Impact:** HIGH. r/mcp is the most targeted community in existence for this product. A good post hits 5-15K views. Comments from maintainers = credibility cascade.
- **Status:** Drafts READY. Blocked on Steve's approval and posting.
- **Expected result:** 500-2,000 site visits, 50-200 MCP installs, 5-20 email signups
- **Why it works:** Authenticity angle ("got tired of dead recommendations") is compelling. We have real data. The subreddit audience are exactly our users.

#### B. First Maintainer Outreach (Manual, 2-3 DMs)
- **Effort:** 15 minutes (Steve sends 2-3 DMs using `scripts/partner-outreach-drafts.md`)
- **Impact:** HIGH on credibility and compounding. #1 maintainer (CoplayDev/unity-mcp, 7K stars) engages = their followers see AgentRank.
- **Status:** Drafts READY. Blocked on Steve's approval.
- **Expected result:** 1-3 high-credibility endorsements, potential README badges = permanent backlinks

#### C. Tweet Tagging Top-Ranked Tools
- **Effort:** 5 minutes
- **Impact:** MEDIUM-HIGH. Tag the top 5 maintainers in one thread.
- **Status:** Can do now. Steve to write/approve tweet from @comforteagle.
- **Example tweet:** "I built a live index of 25K+ MCP tools scored by real signals. Here are the top 5 right now: [link] 🥇 @CoplayDev unity-mcp 🥈 [next] ..."

---

### Tier 2: Do This Week (No Steve Required)

#### D. Glama Registration (Unblocks Awesome List PRs)
- **Effort:** 20 minutes (engineering)
- **Impact:** HIGH leverage. Registering on Glama unblocks 2 punkpeye/awesome-mcp-servers PRs that are currently blocked by `missing-glama` label.
- **Status:** punkpeye requires Glama listing. PRs #3333 and #3334 are sitting open and failing.
- **Why it matters:** awesome-mcp-servers has 10K+ stars. One merged PR = permanent discovery channel.

#### E. HN Show HN Post (Drafts Ready)
- **Effort:** 5 minutes (Steve posts the draft from `scripts/community-posts-draft.md`)
- **Impact:** HIGH ceiling but unpredictable. Can be 50 or 5,000 visits depending on timing and upvote velocity.
- **Status:** Draft READY. Post on a weekday, 9-10am EST.
- **Sequencing:** Post HN 1-2 days after Reddit, when you have comments to reference.

---

### Tier 3: This Month (Scheduled Work)

#### F. Product Hunt Launch
- **Effort:** 2-3 hours (Vibe Coder builds screenshots/GIFs, Steve approves)
- **Impact:** MEDIUM-HIGH on launch day (300-1,000 visits), permanent listing.
- **Status:** Draft READY at `scripts/product-hunt-draft.md`. Need assets (screenshots/GIFs of the leaderboard, MCP install demo).
- **Timing:** Week 2-3, after Reddit/HN have seeded some early users.

#### G. Smithery + Official MCP Registry (AUT-21)
- **Effort:** 30 minutes (device auth — Steve needed for 30 seconds)
- **Impact:** HIGH long-term. Smithery is the main MCP discovery site. Every Smithery user who searches for "agent tools" will find us.
- **Status:** Blocked on MCP auth device flow (AUT-21).

#### H. Awesome List PR Expansion
- **Effort:** 1-2 hours (engineering drafts PRs, Steve approves)
- **Impact:** MEDIUM. Permanent SEO backlinks + developer discovery.
- **Status:** Drafts at `scripts/awesome-list-submissions-draft.md`. 2 target lists identified beyond punkpeye.

#### I. SEO Content (Blog Posts)
- **Effort:** 2-4 hours per post (Growth Engineer)
- **Impact:** MEDIUM, compounds over 4-8 weeks.
- **Status:** 12 posts live. Need more long-tail content targeting:
  - "best mcp server for [use case]" keywords
  - "how to use mcp server with [tool]" (Claude, Cursor, VS Code)
  - "mcp server comparison [category]"
- **Priority keywords:** "best mcp server", "mcp server list", "top mcp tools", "mcp server comparison"

#### J. GitHub Badge PRs (Expansion)
- **Effort:** Automated (badge-prs.py script exists)
- **Impact:** MEDIUM. Each merged PR = permanent inbound link + maintainer awareness.
- **Status:** Script exists. Some PRs already submitted. Expand to 20+ more repos.

---

### Tier 4: Month 2 (Post-Traction)

#### K. Newsletter (#1 Draft Ready)
- **Effort:** 1 hour (Steve approves draft at `scripts/newsletter-1-draft.md`)
- **Impact:** MEDIUM for retention + word of mouth. Build the list now even if small.
- **Timing:** Send Week 3-4 once email list has 50+ subscribers.

#### L. Embeddable Widgets for External Sites
- **Effort:** 2-3 hours (Vibe Coder)
- **Impact:** MEDIUM. Score widgets on maintainer READMEs = passive impressions.
- **Status:** Embed page exists at /embed. Need to make the widget sharable / copy-paste friendly.

#### M. Dev Blogger / Newsletter Partnerships
- **Effort:** 2-3 hours (drafts) + Steve approval
- **Impact:** MEDIUM-HIGH for targeted reach.
- **Targets:** TLDR.tech, Pointer.io, The Pragmatic Engineer, changelog.com, console.dev

#### N. Interactive Comparison Tool Widget
- **Effort:** 4-6 hours (Vibe Coder)
- **Impact:** HIGH if embedded externally. "Compare these two MCP servers" widget that embeds on external sites.
- **Status:** /compare page exists. Embeddable version doesn't.

---

### Channel Rankings Summary

| Channel | Effort | Impact | Time to Traffic | Status |
|---------|--------|--------|-----------------|--------|
| Reddit r/mcp | Low | **Very High** | Hours | Draft ready, needs Steve |
| HN Show HN | Low | High (variable) | Hours | Draft ready, needs Steve |
| Maintainer DMs (2-3) | Low | High | Days | Draft ready, needs Steve |
| Tweet tagging top tools | Very Low | Medium-High | Hours | Needs Steve |
| Glama registration | Low | High | Days (unblocks PRs) | Engineering can do |
| Smithery/MCP registry | Low | High | Days | Needs device auth (Steve 30 sec) |
| Awesome list PRs | Low | Medium | Weeks | Some ready, blocked on Glama |
| Product Hunt | Medium | Medium-High | Day-of spike | Draft ready, needs assets + Steve |
| SEO blog posts | Medium | Medium | 4-8 weeks | Content engine running |
| Badge PRs | Low | Medium | Weeks | Script exists |
| Newsletter | Low | Medium | Ongoing | Draft ready, needs Steve |
| Dev blogger outreach | Medium | Medium-High | Weeks | Not started |
| Embed widgets | Medium | Medium | Months | /embed page exists |

---

## 3. Content Calendar: 4 Weeks

### Week 1 (March 17-23): Launch

**Goal:** First traffic spike. Get initial social proof. Seed the funnel.

| Day | Action | Owner | Approved? |
|-----|--------|-------|-----------|
| Mon Mar 18 | Post to r/mcp (draft in community-posts-draft.md) | Steve | Needs approval |
| Mon Mar 18 | Send 2-3 maintainer DMs (drafts ready) | Steve | Needs approval |
| Tue Mar 19 | Post to r/LocalLLaMA | Steve | Needs approval |
| Tue Mar 19 | Register on Glama (unblocks awesome list PRs) | Engineering | No approval needed |
| Wed Mar 20 | Show HN post (draft ready) | Steve | Needs approval |
| Wed Mar 20 | Tweet: tag top 5 tools from @comforteagle | Steve | Needs approval |
| Thu Mar 21 | Expand badge PRs to 20+ more repos | Engineering | No approval needed |
| Thu Mar 21 | Submit to TensorBlock/awesome-mcp-servers | Engineering | No approval needed |
| Fri Mar 22 | Blog post: "The MCP Server Landscape: Q1 2026 Data Report" | Engineering | No approval needed |
| Fri Mar 22 | Tweet: "Biggest movers this week" from @comforteagle | Steve | Needs approval |

**Content:** Social posts (Steve posts manually), blog (auto-generated from data)

---

### Week 2 (March 24-30): Amplify

**Goal:** Product Hunt launch. Collect email subscribers. Start measuring what worked.

| Day | Action | Owner | Notes |
|-----|--------|-------|-------|
| Mon Mar 24 | Product Hunt launch prep (assets, GIFs) | Vibe Coder | Needs Steve approval before submit |
| Mon Mar 24 | Respond to all Reddit/HN comments from Week 1 | Steve | High priority — comment engagement = algorithm boost |
| Tue Mar 25 | Submit to bh-rat/awesome-mcp-enterprise (draft ready) | Engineering | No approval needed |
| Wed Mar 26 | Product Hunt launch (Steve posts) | Steve | After assets ready |
| Wed Mar 26 | Tweet: "Launched on PH today, ranking the whole MCP ecosystem" | Steve | Coordinate with PH timing |
| Thu Mar 27 | Blog: "How AI Agents Can Use Live Tool Rankings (with MCP)" | Engineering | SEO: "AI agent tool discovery" |
| Fri Mar 28 | Week 2 data tweet: "New tools added this week" | @AgentRank_ai | Auto-ready from data |

---

### Week 3 (March 31 - Apr 6): Content Engine

**Goal:** SEO compounding begins. Build email list. Partner activation.

| Day | Action | Owner | Notes |
|-----|--------|-------|-------|
| Mon Mar 31 | MCP registry submission (Smithery/official) — AUT-21 | Steve (30 sec auth) | Unblocks major channel |
| Mon Mar 31 | Blog: "Best MCP Servers for Developers in 2026" (long-form) | Engineering | Target keyword: "best mcp server" |
| Tue Apr 1 | Newsletter #1 draft review + send | Steve | Draft at scripts/newsletter-1-draft.md |
| Wed Apr 2 | Blog: "10 MCP Servers That Went From 0 to 5,000 Stars in 90 Days" | Engineering | Data-driven, shareable |
| Thu Apr 3 | Outreach to TLDR.tech, Changelog | Engineering (drafts), Steve (sends) | Dev newsletter placement |
| Fri Apr 4 | Tweet: "3 weeks since launch, here's where we are" | Steve | Authentic update builds community |

---

### Week 4 (April 7-13): Optimize

**Goal:** Identify what worked. Double down. Prep monetization.

| Day | Action | Owner | Notes |
|-----|--------|-------|-------|
| Mon Apr 7 | Traffic audit: which channels actually drove installs? | PM + Engineering | CF Analytics + API logs |
| Mon Apr 7 | Kill or pause lowest-performing content type | CEO | Data-driven decision |
| Wed Apr 9 | Blog: "MCP Server Comparison: [Category] 2026" | Engineering | Based on Week 3 keyword data |
| Thu Apr 10 | Embeddable widget for maintainer READMEs (design pass) | Vibe Coder | Compounding passive impressions |
| Fri Apr 11 | Newsletter #2: "What we learned from 1 month of rankings" | Steve | Transparent, engaging |
| Fri Apr 11 | Tweet: "Month 1 numbers" | Steve | Community credibility |

---

## 4. Quick Wins: 5 Things This Week, No Budget

These require zero budget and can be completed by engineering without Steve except where noted:

### QW-1: Register on Glama (Engineering, ~20 min)
**What:** Register AgentRank on glama.ai as an MCP server.
**Why:** Unblocks 2 existing PRs to punkpeye/awesome-mcp-servers (10K+ star repo). One action unblocks permanent discovery on the most-referenced MCP awesome list.
**How:** Visit glama.ai, register the agentrank-mcp-server. Then update the PR descriptions.

### QW-2: Post to r/mcp (Steve, ~5 min)
**What:** Post the prepared draft at `scripts/community-posts-draft.md` to r/mcp.
**Why:** Single highest-expected-traffic action. 5 minutes of Steve's time. Drafts are ready. r/mcp is where MCP server authors and users are concentrated.
**Estimated result:** 500-2,000 visits within 24 hours.

### QW-3: Tag Top 5 Maintainers on Twitter (Steve, ~5 min)
**What:** Tweet from @comforteagle: "Built a live index of 25K+ MCP tools. Here's the current top 5 by our maintenance score: [list with @mentions] — agentrank-ai.com"
**Why:** Costs nothing. Maintainers who see they ranked well will engage. Their engagement = distribution to their followers for free.
**Estimated result:** 2-5 retweets from maintainers, 100-500 impressions each.

### QW-4: Expand Badge PRs (Engineering, ~30 min)
**What:** Run `badge-prs.py` script against the next 20 high-ranked repos that don't have a badge PR yet.
**Why:** Each PR merged = permanent backlink + maintainer knows we exist. Even if 5/20 merge, that's 5 referral sources compounding forever.
**No approval needed** for submitting PRs — they're just suggestions.

### QW-5: Submit to TensorBlock/awesome-mcp-servers (Engineering, ~15 min)
**What:** Submit the prepared entry at `scripts/awesome-list-submissions-draft.md` to TensorBlock/awesome-mcp-servers (570 stars, very active).
**Why:** Different from punkpeye — no Glama requirement. Active repo, accepting PRs. One PR submission.
**Status:** Entry and PR title already drafted. Just needs to be submitted.

---

## 5. Analytics & Measurement

### What to Track
- **Site visits** — Cloudflare Analytics (already capturing)
- **API requests** — CF Workers request log (dashboard at /dash/)
- **MCP server installs** — npm downloads for agentrank-mcp-server
- **Skills installs** — if skills.sh exposes install metrics
- **Email signups** — subscribe endpoint at /api/subscribe.ts
- **Referral sources** — CF Analytics referer headers
- **Awesome list PRs merged** — GitHub notifications

### Success Metrics by Week

| Metric | Week 1 Target | Week 4 Target |
|--------|--------------|---------------|
| Monthly site visits | 2,000+ | 10,000+ |
| MCP server npm downloads | 100+ | 500+ |
| Monthly API requests | 200+ | 1,000+ |
| Email subscribers | 50+ | 300+ |
| Referring domains with backlinks | 5+ | 20+ |
| GitHub badge PRs merged | 2+ | 8+ |
| Reddit/HN post upvotes | 50+ | — |

---

## 6. Distribution Blockers (What Steve Needs to Do)

These are all short actions. They're blocking the highest-impact work.

| Action | Time Required | Impact | Issue |
|--------|--------------|--------|-------|
| Post r/mcp draft | 5 min | Very High | scripts/community-posts-draft.md |
| Post r/LocalLLaMA draft | 5 min | High | scripts/community-posts-draft.md |
| Post HN Show HN | 5 min | High | scripts/community-posts-draft.md |
| Tweet tagging top 5 maintainers | 5 min | Medium-High | Write new or approve draft |
| Send 2-3 maintainer DMs | 15 min | High | scripts/partner-outreach-drafts.md |
| MCP registry device auth | 30 sec | High | AUT-21 |
| Approve newsletter #1 | 30 min | Medium | scripts/newsletter-1-draft.md |

**Total time:** ~60 minutes from Steve = $10K+ in equivalent marketing value.

---

## Appendix: What's Already Built (Asset Inventory)

| Asset | Status | Location |
|-------|--------|----------|
| Community post drafts (Reddit/HN) | Ready | scripts/community-posts-draft.md |
| Partner outreach DMs (20+ maintainers) | Ready | scripts/partner-outreach-drafts.md |
| Product Hunt listing copy | Ready | scripts/product-hunt-draft.md |
| Newsletter #1 | Ready | scripts/newsletter-1-draft.md |
| Awesome list PR entries | Ready | scripts/awesome-list-submissions-draft.md |
| Badge PR script | Ready | scripts/badge-prs.py |
| Blog posts (SEO) | 12 live | site/src/pages/blog/ |
| MCP server (npm) | Published | agentrank-mcp-server on npm |
| API (v1 + v2) | Live | agentrank-ai.com/api-docs |
| Embed widgets | Live | agentrank-ai.com/embed |
| Pricing page | Live | agentrank-ai.com/pricing |
| Skills leaderboard | Live | agentrank-ai.com |
| Tools leaderboard (25K+) | Live | agentrank-ai.com/tools |
| Movers page | Live | agentrank-ai.com/movers |
| Compare page | Live | agentrank-ai.com/compare |
