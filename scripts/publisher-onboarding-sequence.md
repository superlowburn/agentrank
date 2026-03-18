# Verified Publisher Onboarding Email Sequence
**AgentRank — Product Manager**
**Date:** March 18, 2026
**Status:** DRAFT — Requires Steve approval before implementation

---

## Overview

Five-email drip sequence for new Verified Publisher subscribers. Goal: activate publishers fast (get their listing customized and their badge live), then educate them on analytics and score optimization so they see value and stay subscribed.

**Sending platform:** Transactional email (Resend or Postmark recommended)
**Trigger:** `checkout.session.completed` Stripe webhook event
**From:** noreply@agentrank-ai.com (or hello@agentrank-ai.com for warmer tone)
**Reply-to:** steve@agentrank-ai.com until support is staffed

---

## Email 1 — Welcome (Send: Immediately after Stripe checkout)

**Subject:** Your Verified Publisher badge is ready — here's what to do first

**Preview:** 3 steps to get your listing live in the next 15 minutes.

---

Hi {{first_name}},

You're now a Verified Publisher on AgentRank. Your badge is pending — it goes live the moment you claim your listing.

Here are the three things to do right now:

**1. Claim your listing (5 minutes)**
Go to your tool's listing page and click "Claim this listing." You'll verify ownership via GitHub OAuth. Once confirmed, you own the listing and the badge appears automatically.

→ [Claim {{repo_name}} on AgentRank](https://agentrank-ai.com/tool/{{tool_slug}}/)

**2. Add your logo and description (5 minutes)**
After claiming, you can set a custom logo URL, description (up to 500 characters), and links to your docs, npm page, Discord, or website. This is what turns a raw GitHub listing into something that converts.

**3. Share your badge (2 minutes)**
Once live, add the Verified Publisher badge to your README. We'll send you the embed code after you claim.

**What you get as a Verified Publisher:**
- Verified badge on your listing (visible to every developer who searches your tool)
- Enhanced listing with custom logo, description, and links
- Monthly analytics: views, referral sources, comparison events
- Priority indexing: score updates within 24 hours instead of nightly
- Score change alerts when your AgentRank score moves 10+ points
- One featured category tag of your choice

Any questions? Reply to this email.

— Steve, AgentRank

---

## Email 2 — Day 1 (Send: 24 hours after checkout)

**Subject:** How to customize your {{repo_name}} listing

**Preview:** Logo, description, links — here's what makes the difference.

---

Hi {{first_name}},

If you haven't claimed your listing yet, now's the time. Takes five minutes: [Claim your listing →](https://agentrank-ai.com/tool/{{tool_slug}}/)

If you've already claimed it — great. Here's how to make it count.

**The three listing fields that drive clicks:**

**1. Logo**
Developers scan listings fast. A recognizable logo (your project logo or org logo) creates visual anchoring and signals that a real team or person is behind the tool. Upload a square image — 512×512px or larger recommended.

Field: Logo URL (link to any publicly accessible image)

**2. Description**
The GitHub repo description is your floor. Your custom description is your ceiling.

The AgentRank description field lets you write up to 500 characters. Use it to explain:
- What your tool does (one sentence, specific)
- Who it's for (Claude Desktop users? IDE plugin builders? Agent orchestrators?)
- What makes it different (not "powerful MCP server" — every listing says that)

Example of a weak description:
> "A powerful MCP server for file operations."

Example of a strong description:
> "filesystem-mcp gives Claude Desktop read/write/move access to your local files. 50K weekly downloads, supports macOS/Windows/Linux, zero config. Maintained by @yourgithub."

**3. Links**
Add whatever helps a developer decide to install your tool:
- Docs URL (if you have a dedicated docs site)
- npm or PyPI URL (direct install link)
- Discord or Slack (shows community health)
- Website (for commercial tools)

The more signals a developer has that your tool is real and maintained, the more likely they are to install it over the alternative.

**Your listing right now:** [agentrank-ai.com/tool/{{tool_slug}}/](https://agentrank-ai.com/tool/{{tool_slug}}/)

— Steve, AgentRank

---

## Email 3 — Day 3 (Send: 72 hours after checkout)

**Subject:** Your first analytics report is in

**Preview:** Here's who's been looking at {{repo_name}}.

---

Hi {{first_name}},

Your analytics dashboard is live. Here's what it shows:

[View your publisher dashboard →](https://agentrank-ai.com/dashboard/publisher/)

**What you're looking at:**

**Views** — How many developers have seen your listing page in the last 30 days. This is the top of your funnel. If this number is low, it usually means either (a) your AgentRank score needs improving (you rank lower so fewer people scroll to you) or (b) developers aren't searching the terms that describe your tool.

**Referral sources** — Where your views are coming from. Direct agentrank-ai.com searches vs. inbound links from GitHub, Reddit, Hacker News, newsletters, or other tools that reference yours. Referral sources tell you which distribution channels are working.

**Score trend** — Your AgentRank score over the last 30 days. A rising score means you're climbing the index — more visibility, more clicks. A flat or falling score means there's something to fix (we'll cover that in tomorrow's email).

**Comparison events** — How many times a developer opened your listing alongside another tool to compare them. This is a high-intent signal: these are developers actively evaluating tools in your category.

**Install events** — Referral-tracked installs where we can attribute a session to an install action. Less comprehensive than npm/PyPI download counts, but directional.

**One thing to check first:** Your referral sources. If GitHub is your only source, you're relying entirely on organic AgentRank discovery. Adding a link to your AgentRank listing from your README can meaningfully increase this.

Reply if anything looks off or you have questions about what you're seeing.

— Steve, AgentRank

---

## Email 4 — Day 7 (Send: 7 days after checkout)

**Subject:** 6 ways to improve your AgentRank score for {{repo_name}}

**Preview:** Real advice from the scoring methodology — not vague tips.

---

Hi {{first_name}},

Your AgentRank score is built from eight signals. Here's what moves the needle — ranked by impact.

**1. Freshness (20% of your score) — biggest lever**

Freshness is the #1 signal. A repo with its last commit within 7 days scores 1.0. Beyond that, the score decays — linearly to day 90, then fast.

What this means practically: you don't need to ship features daily. A README update, a dependency bump, or a response to an issue all count as commits. If you're maintaining your tool but not actively developing it, consider a lightweight "maintenance mode" commit schedule — even monthly is better than nothing.

If your tool is stable and complete: add a note in your README and description that says so. Stable-and-intentional is different from abandoned.

**2. Issue Health (20%) — respond to open issues**

Score formula: `closed_issues / (open + closed)`. A 90%+ ratio is excellent. Below 50% starts hurting your score.

Quick wins:
- Close issues that are already fixed, duplicate, or out of scope (leave a comment explaining why)
- Answer the questions sitting open that you never got to
- Add a CONTRIBUTING.md that sets expectations about issue response time

Even closing 10 stale issues can meaningfully improve your ratio.

**3. Dependents (22%) — the strongest long-term signal**

Dependents are the hardest to game and the most valuable. When other GitHub repos import your package, it counts.

What actually builds dependents over time:
- Publish to npm or PyPI if you haven't (this enables GitHub's dependency graph to detect dependents)
- Write a tutorial or blog post that includes a working example that gets forked
- Respond to people who say they're using your tool — they often link back
- Get listed in awesome-MCP lists and documentation roundups that get forked

**4. Downloads (13%) — publish to registries**

If your tool isn't on npm or PyPI, this signal is missing entirely (and the weight gets redistributed, which is neutral, not a penalty). But if your tool could reasonably be published as a package, it's worth doing — it also builds the dependents signal over time.

**5. Contributors (8%) — accept PRs, add maintainers**

Going from 1 contributor to 2+ makes a difference. Going from 2 to 10 adds more. Ceiling is 20.

Ways to add contributors:
- Label issues as "good first issue" to attract first-time contributors
- Accept doc PRs and minor fixes — these count
- Add a co-maintainer if someone is actively using and improving your tool

**6. Description Quality (4%) — write 150+ characters**

Your GitHub repo description (not the listing description — the one in GitHub's About section) affects this signal.

A description over 150 characters scores 1.0. Under 50 characters scores 0.3. Log into GitHub, edit your repo's About section, and write a proper description. Takes 2 minutes.

**Quick audit of {{repo_name}} right now:**

Your current score: **{{current_score}}**
Breakdown: [agentrank-ai.com/tool/{{tool_slug}}/](https://agentrank-ai.com/tool/{{tool_slug}}/)

The score breakdown page shows exactly which signals are dragging your score. Start with the lowest-scoring signal that's also easiest to fix.

— Steve, AgentRank

---

## Email 5 — Day 14 (Send: 14 days after checkout)

**Subject:** How other maintainers are using their Verified Publisher badge

**Preview:** A few patterns that work — and one that really doesn't.

---

Hi {{first_name}},

Two weeks in. A few things we've seen work well for Verified Publishers:

**The README badge embed**

Adding the AgentRank badge to your README (score + verified status) creates a credibility signal for developers who discover you on GitHub before they find you on AgentRank. Maintainers who add the badge consistently see higher click-through rates from GitHub to their listing.

Badge embed code: [your dashboard has this under "Badge" → copy the markdown snippet]

**The Twitter/X moment**

When you claim your listing, your tool's verified status is public. Some maintainers post something like:

> "{{repo_name}} just hit [score] on AgentRank — verified publisher, [n] weekly downloads. Building for Claude Desktop users. [link]"

This performs well because it surfaces your score as social proof. Tag @AgentRank_ai and we'll repost it.

**Linking from your docs**

If you have a docs site, a "trusted by" or "where to find us" section that links to your AgentRank listing helps referral traffic and signals legitimacy to developers evaluating your tool.

**What doesn't work: waiting for organic traffic**

If you're only relying on developers finding you in the index, growth is slow. The maintainers getting the most value from Verified Publisher are actively pointing traffic to their listing — README, docs, social, conversations in Discord or Slack communities.

Your listing is a landing page for your tool. Treat it like one.

---

**Your stats since subscribing:**
Views: {{views_since_subscription}}
Score change: {{score_change_since_subscription}} points ({{score_direction}})

[View full dashboard →](https://agentrank-ai.com/dashboard/publisher/)

Any questions or feedback on your first two weeks? Reply here.

— Steve, AgentRank

---

## Activation Checklist

Tracks what percent of publishers complete each setup step. These metrics should be measured in the analytics dashboard and reviewed monthly.

| Step | Target Completion Rate | Notes |
|------|----------------------|-------|
| Email verified | 100% | Required to unlock badge |
| GitHub OAuth claim completed | 85% | Drop here = friction in claim flow |
| Custom logo added | 60% | Indicates listing investment |
| Custom description written | 65% | Indicator of engaged publisher |
| At least one additional link added (docs, npm, Discord) | 50% | |
| README badge embed added | 35% | Softer signal — requires README edit |
| Dashboard visited at least once | 70% | If below 70%, Day 3 email timing/subject may need adjustment |
| Score improvement actioned (score change within 30 days) | 30% | Stretch goal — requires Day 7 email to land |

**Tracking method:** Cloudflare Workers Analytics Engine events on each action. Events to instrument:
- `publisher.claim_completed`
- `publisher.logo_updated`
- `publisher.description_updated`
- `publisher.link_added`
- `publisher.badge_copied`
- `publisher.dashboard_visit`

---

## Churn Risk Signals

Monitor these to identify at-risk subscribers before they cancel.

**High risk (act immediately):**
- Dashboard not visited in 14+ days
- Listing not claimed within 7 days of subscription start
- Score declined 15+ points in the last 30 days with no activity on the listing
- Open support reply pending > 3 days

**Medium risk (monitor):**
- No listing customization (no logo, no custom description) after 14 days
- No dashboard visit in 7 days
- Score stagnant for 30+ days (may indicate tool is inactive)
- Subscription started but README badge never added after 21 days

**Low risk (informational):**
- No additional links added (docs, npm, Discord) after 14 days
- Less than 100 views/month (may indicate category is low-traffic, not publisher dissatisfaction)

**Churn intervention:**
For high-risk signals, trigger a manual outreach email from Steve (not automated). The goal is to understand what's not working, not to save the subscription at any cost. If the tool is abandoned or the publisher isn't actively maintaining it, cancellation is the right outcome — churn of non-engaged publishers keeps the Verified Publisher signal credible.

---

## Win-Back Email

**Trigger:** `customer.subscription.deleted` Stripe webhook + subscription was active for at least 30 days
**Send timing:** 3 days after cancellation (give them space)

**Subject:** Your {{repo_name}} Verified Publisher subscription ended — quick question

---

Hi {{first_name}},

Your Verified Publisher subscription for {{repo_name}} was cancelled. Your badge has been removed and your enhanced listing has reverted to the standard indexed version.

Quick question: was there a specific reason?

[ ] Price wasn't worth it for the traffic I was getting
[ ] Didn't use the analytics dashboard enough
[ ] Tool is no longer actively maintained
[ ] Found a different way to promote it
[ ] Other (reply to this email)

One click answers help us build a better product. No pressure to resubscribe.

If circumstances change — you ship a major update, your tool takes off, you want the badge back — you can resubscribe anytime at [agentrank-ai.com/pricing](https://agentrank-ai.com/pricing).

Thanks for being an early Verified Publisher.

— Steve, AgentRank

---

*Sequence authored by Product Manager agent. Requires Steve approval before sending to real subscribers. Email template variables ({{repo_name}}, {{tool_slug}}, etc.) are populated from the subscriptions table at send time.*
