# AgentRank Email List Growth Strategy

**Audience:** Developers evaluating, building with, and maintaining MCP servers and agent tools.
**Context:** Email signup backend is live (AUT-389). No list yet. Starting from zero.

---

## Lead Magnet Ideas (Ranked by Conversion Potential)

### 1. Weekly MCP Ecosystem Digest (Highest Value)
A weekly email of what changed in the MCP/agent tool rankings that week — new tools that entered the index, biggest movers, tools that got dropped due to inactivity. Developers building with MCP care deeply about which tools are actively maintained.

**Why it works:** Solves a real pain — there's no other source aggregating "what's new and what's dying in MCP tools" weekly. Direct relevance to the audience's job.

**How to produce it:** Automated from nightly pipeline data. Very low marginal effort once the email template is built.

### 2. Score Change Alerts (High Personalization)
Allow users to subscribe to alerts for specific tools. "Get an email when the AgentRank score for [tool] changes by more than 10 points." This turns the email list into a product feature, not just marketing.

**Why it works:** Highly specific opt-in signals strong intent. Maintainers will subscribe to track their own tools. Evaluators will subscribe to track tools they're considering.

**Implementation note:** Requires segmenting by tool subscription. Worth building once baseline list exists.

### 3. "New Tools This Week" Alert
Simple weekly list of all tools that entered the AgentRank index in the last 7 days. Early awareness for developers who want to stay ahead of the ecosystem.

**Why it works:** Simple to produce from pipeline data. Developers who care about the MCP ecosystem want to know about new entrants immediately.

### 4. Free Comparison Report
"Comparing the Top 10 MCP Servers for [Use Case]" — downloadable or linked from the email. Gated behind an email signup on the relevant category page.

**Why it works:** High-intent visitors researching specific use cases convert well on relevant comparisons. Classic content lead magnet that matches search intent.

---

## Signup Incentives for Developer Audience

Developers are skeptical of email lists. Frame every signup around data utility, not "news." Messaging that works:

- "Get ranked MCP data in your inbox, not noise."
- "Track the tools you depend on. Know before they go stale."
- "Weekly signal: what's rising, what's stalling, what's new."

Avoid: "Subscribe to our newsletter!" — too generic, zero developer appeal.

**Placement on site:**
- Exit intent popup on tool detail pages ("Track this tool's score")
- Inline opt-in after the top 10 leaderboard table
- Sticky bottom banner on high-traffic category pages
- Dedicated /newsletter page linked from footer and blog posts

---

## Newsletter Platform Recommendation

**Recommended: Beehiiv**

For AgentRank's growth stage, Beehiiv is the right choice over Substack or Buttondown:

- **Built-in Recommendations network:** Cross-promote with other tech/developer newsletters without cost. Beehiiv's Recommendations feature lets complementary newsletters recommend each other automatically.
- **Referral program tools:** Native "refer-a-friend" mechanics built in. Developers share tools they find genuinely useful — make it easy.
- **Analytics:** Subscriber-level open and click tracking for segmentation (maintainers vs. evaluators vs. builders).
- **API:** Developer-friendly API for integrating with our pipeline to auto-generate weekly digest content.

Buttondown is simpler and developer-focused but lacks the growth loop features we need at this stage. Substack has audience but no cross-promo tools and locks you into their ecosystem.

**Newsletter name:** "The MCP Index" or "AgentRank Weekly" — something that signals data, not marketing content.

---

## Cross-Promotion Targets

Developer newsletters with overlapping audiences to approach for Beehiiv Recommendations or direct cross-promos:

| Newsletter | Focus | Approach |
|-----------|-------|---------|
| TLDR AI | AI/ML daily | Beehiiv Recommendations swap |
| The Pragmatic Engineer | Dev tools, senior engineers | Sponsored mention or organic pitch |
| Console.dev | Dev tools weekly | Direct outreach — small, targeted audience |
| AI Tool Report | AI tools | Beehiiv Recommendations swap |
| Ben's Bites | AI news daily | Sponsored mention when budget allows |

**Pitch framing for cross-promos:** "AgentRank tracks every MCP server on GitHub — ranked by maintenance signals. Our readers are developers evaluating agent tools. Your readers are the same people." Make it about audience fit, not vanity metrics.

---

## Cold Outreach Templates: MCP Maintainers

Goal: Invite MCP server maintainers to subscribe for score updates on their own tool.

### Template 1: Direct Personal Outreach (GitHub Issues or README Contact)
```
Subject: Your tool is ranked on AgentRank

Hi [name],

Your MCP server [tool-name] is currently ranked #[rank] on AgentRank (agentrank-ai.com),
a live index of MCP servers scored by maintenance signals.

Thought you'd want to know your score and track how it changes as the ecosystem evolves.
If you subscribe at [signup URL], we'll email you when your tool's score changes significantly.

No spam, just your tool's signal.

— AgentRank
```

### Template 2: GitHub PR Comment (when submitting badge PR)
```
We've added an AgentRank score badge to this README. [tool-name] is currently
ranked #[rank] with a score of [score]/100.

Subscribe at agentrank-ai.com/alerts to get notified when your score changes.
```

### Template 3: Twitter/X DM (for maintainers active on social)
```
Hey — your MCP server [tool-name] just entered the AgentRank top [X].
Thought you'd want to track it: agentrank-ai.com/tools/[slug]

We send score change alerts by email if that's useful.
```

---

## Growth Targets and Milestones

| Milestone | Target | Trigger Action |
|-----------|--------|---------------|
| 50 subscribers | Validate opt-in copy | Review which pages/sources convert |
| 100 subscribers | Send first digest | Confirm pipeline auto-generation works |
| 250 subscribers | Launch cross-promo outreach | Approach first Beehiiv partner newsletter |
| 500 subscribers | Introduce referral program | Add "refer a developer" mechanics |
| 1,000 subscribers | Launch sponsor conversation | Pitch relevant MCP tool companies for sponsored placement |

---

## Quick Wins (Do This Week)

1. Add Beehiiv signup widget to homepage below the leaderboard
2. Create /newsletter page with the weekly digest value prop
3. Set up automated weekly digest template from pipeline data
4. Batch email 20-30 top-ranked MCP maintainers with Template 1 above

---

*Research date: March 2026*
