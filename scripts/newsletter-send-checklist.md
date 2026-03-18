# Newsletter #1 — Send Checklist

> **STATUS: AWAITING STEVE APPROVAL — Do NOT send until Steve reviews and approves.**
> See: [AUT-148](/AUT/issues/AUT-148)

---

## Pre-Send Checklist

### Content
- [ ] Steve has approved the final newsletter draft (`scripts/newsletter-001.html`)
- [ ] Subject line selected from A/B options (see below)
- [ ] Preview text set in email platform
- [ ] "New tools this week" section refreshed with live data from agentrank-ai.com (or removed if index has no new entries)
- [ ] All tool links checked — confirm agentrank-ai.com/tool/[slug] URLs resolve
- [ ] Install command verified: `claude mcp add agentrank -- npx -y agentrank-mcp-server`
- [ ] Unsubscribe link configured in email platform (required by CAN-SPAM/GDPR)
- [ ] Footer links (agentrank-ai.com, unsubscribe) are live

### Platform Setup
- [ ] Buttondown account created (buttondown.email) — or alternative confirmed
- [ ] Subscriber list imported/ready
- [ ] Welcome email / confirmation email drafted in platform
- [ ] From name: `AgentRank` | From address: a verified sending domain
- [ ] Reply-to address configured (Steve's or a monitored inbox)
- [ ] Plain-text version generated (Buttondown does this automatically)

### Final Checks
- [ ] Send a test email to yourself and view on mobile + desktop
- [ ] Images/layout render correctly in Gmail, Apple Mail, Outlook
- [ ] No broken links
- [ ] Verify subscriber count before sending (don't send to 0 subscribers)

---

## Subject Line Options (A/B Test)

Pick one, or split-test if your platform supports it.

### Option A — Curiosity + Data
```
25,632 tools ranked. Here's who's winning.
```
> Best for: high open rate. Direct, numbers-forward, creates immediate curiosity.

### Option B — Pain-point / Contrarian
```
GitHub stars are lying to you about MCP tools.
```
> Best for: developer audience engagement. Challenges a mental model. More emotional hook.

### Option C — Community / Ecosystem
```
The MCP ecosystem in numbers: what the data says this week
```
> Best for: readers who want signal over hype. Lower clickbait, higher trust.

**Recommendation:** Start with **Option A** for Issue #1. Option B for Issue #2 if open rate < 35%.

### Preview Text (paste into email platform)
```
Top 5 tools, biggest movers, and the install command for live rankings in your AI.
```

---

## Send Time

**Best time:** Tuesday or Wednesday, 9am–11am PT

Developer newsletters consistently see highest open rates mid-week, morning. Avoid Monday (inbox chaos) and Friday (ignored).

---

## Post-Send Checklist (within 24 hours)

- [ ] Screenshot open rate + click rate — log to `scripts/metrics-framework.md`
- [ ] Note which links got the most clicks (usually: top tool #1, full leaderboard link)
- [ ] Check replies — respond to every reply for Issue #1
- [ ] Post a "newsletter is out" tweet from @AgentRank_ai with the top stat hook
- [ ] Check if any top-5 tool maintainers opened/clicked (visible in Buttondown per-subscriber view)

---

## Email List Growth Tactics (5 Concrete Actions)

These go beyond waiting for site visitors to sign up organically.

### Tactic 1 — Tag Winners on Twitter, Point to Subscribe
Every weekly "top movers" tweet from @AgentRank_ai should include:
> "The full weekly digest with all 10 movers + ecosystem stats goes to email subscribers. Subscribe: agentrank-ai.com/subscribe"

Cost: 0. Channel: Twitter. Expected yield: 5–15 subscribers per tweet that gets traction.

### Tactic 2 — Reach Out to Top 10 Tool Maintainers Directly
DM or email the GitHub maintainers of the current top 10 ranked tools. Tell them they're ranked and offer to send them their tool's weekly score update via email. Most will subscribe.

> Template: "Your tool [X] ranked #[N] on AgentRank this week (score: [X]/100). I send a weekly digest to subscribers with score changes. Want me to add you? [link]"

Cost: 30 minutes of outreach. Expected yield: 5–10 high-quality subscribers with built-in viral potential (maintainers will share with their community).

### Tactic 3 — Add to npm Package Post-Install Message
Update the `agentrank-mcp-server` npm package to print a message after install:

```
AgentRank MCP server installed.
Get the weekly top-movers digest in your inbox: https://agentrank-ai.com/subscribe
```

Cost: 5 minutes of code. Every npm install is a captive audience. Expected yield: passive 2–5 subscribers/week as installs grow.

### Tactic 4 — Submit to Developer Newsletter Directories
Submit AgentRank newsletter to:
- [Console.dev](https://console.dev) (weekly dev tools newsletter) — ask for feature/mention
- [Changelog.com](https://changelog.com) — submit for coverage
- [Hacker Newsletter](https://hackernewsletter.com) — submit if any issue hits HN front page
- [TLDR Newsletter](https://tldr.tech) — submit via their community submissions

Cost: 1 hour of submission work. One feature = 50–500+ new subscribers. No ongoing effort after submission.

### Tactic 5 — Add a "Share this issue" Forward Link
In every newsletter, add a one-line forward prompt:
> "Know a developer who builds with MCP? Forward this — they can subscribe at agentrank-ai.com/subscribe"

Cost: one line of copy per issue. Word-of-mouth from technical readers is the highest-quality subscriber source. Developer newsletters routinely grow 10–20% of their list via forwarding.

---

*Created by Product Manager agent. Requires Steve approval before sending.*
