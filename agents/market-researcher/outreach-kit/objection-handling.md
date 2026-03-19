# Objection Handling — AgentRank Sponsored Listings

**Status:** DRAFT — needs Steve approval before use
**For:** Sales conversations and follow-up exchanges

---

## Objection 1: "We don't have budget for this"

**Most likely from:** Bootstrapped companies (Kagi, SerpApi), early-stage startups (21st.dev)

**Response:**
> "Understood. The two price points that don't require a budget approval are $199/mo (Sponsored Listing, low-volume) and $29/mo (Verified Publisher — badge + enhanced listing, no placement). The $29 plan still gives you analytics and priority indexing. Want to start there and revisit when budget opens up?"

**Fallback:** If even $29 is blocked, offer free Verified Publisher claim (no monthly fee, just claim the listing). Gets them in the funnel. When budget opens, upgrade path exists.

---

## Objection 2: "We haven't heard of AgentRank / your traffic is too low"

**Most likely from:** Grafana, MongoDB, Redis, Neo4j (larger companies requiring proof)

**Response:**
> "Fair. We're in early growth — I won't pretend otherwise. Here's what I can offer: we'll show you your tool's real current traffic before you commit. If the numbers don't justify $299/mo, we'll tell you ourselves. We've indexed 25,000+ tools and are adding 100+ per week; the audience is there, it's just early.
>
> The early-sponsor advantage is real though — first-come, first-served on category exclusivity. The companies that sponsor now own their category before this gets competitive."

**Alternative frame for high-credibility prospects:**
> "The developers already using AgentRank are the ones who read Hacker News, contribute to OSS, and make tooling decisions for their teams. It's a small audience right now, but it's the right audience."

---

## Objection 3: "We don't do advertising / it conflicts with our values"

**Most likely from:** Kagi Search (explicitly anti-advertising), Sentry (OSS-first culture), bootstrapped companies

**Response for Kagi specifically:**
> "Completely understand — and this isn't advertising in the traditional sense. AgentRank is a ranked directory, not a search ad network. Your sponsored listing appears above the organic list with a 'Sponsored' label, but your underlying organic AgentRank score is still displayed and unchanged. Developers can see both. Think of it as a directory feature, like a 'Featured Listing' on a trade directory, not a banner ad."

**General version:**
> "Sponsored listings on AgentRank are labeled transparently. The organic ranking is preserved and visible alongside the sponsored position. We built it that way deliberately — developers trust the index because it's honest, and that trust is what makes sponsored placement valuable. It's not pay-to-fake-rank; it's pay-to-be-seen-first."

---

## Objection 4: "We're already ranked highly, why do we need this?"

**Most likely from:** Manufact/mcp-use (#11), Stacklok (#27), Perplexity (#14), fastmcp (#6)

**Response:**
> "Because position isn't permanent. We index 100+ new tools per week. The tools that are climbing fastest are the ones with active OSS communities and growing dependency graphs. Your position today reflects your work up to now — a sponsored listing ensures that positioning stays visible as the index scales to 100,000 tools.
>
> The other thing a sponsored listing adds that organic rank doesn't: homepage banner visibility and multi-category placement. Even if you're #11 overall, there are developers searching specifically for 'MCP framework' or 'MCP orchestration' who won't scroll to see you. Sponsored placement puts you first in those category searches too."

---

## Objection 5: "Can you send me a deck / proposal?"

**Most likely from:** Grafana, MongoDB, Redis, Apollo, Neo4j (enterprise-culture companies)

**Response:**
> "I'll keep it simple — here's the one-pager with pricing and what you get: [attach one-pager.md as PDF]. I'd rather give you your tool's actual traffic numbers than a polished deck — they're more useful. Want me to pull those and send over?"

**Note for Steve:** The one-pager is designed to be PDF-exported and sent. Keep the email short and attach the PDF — don't paste the full document into the email body.

---

## Objection 6: "What happens if we cancel?"

**Response:**
> "Monthly billing cancels at end of cycle — no 30-day notice, no questions. Annual billing cancels but we don't refund unused months (standard). Your listing reverts to organic-only at end of the billing period. All your analytics data is yours to keep."

---

## Objection 7: "We already have high organic traffic from AgentRank — why pay?"

**Specific to:** fastmcp (#6, ~4,500 PV/mo), mcp-use (#11, ~2,500 PV/mo)

**Response:**
> "The organic traffic you're getting is already valuable — and it's yours for free. Sponsored placement adds things organic rank doesn't:
> - Homepage banner exposure (developers who land on AgentRank and don't search directly)
> - Multi-category placement (you show up in searches for adjacent categories, not just your primary one)
> - Newsletter feature (when the AgentRank newsletter launches — early sponsors get featured slots)
> - Co-marketing: mentions in AgentRank social posts
>
> Think of organic rank as earned media. Sponsored listing is paid distribution on top of that same audience. Both work together."

---

## Objection 8: "How do we know your rankings are legitimate?"

**Response:**
> "The five signals are fully documented: GitHub stars (normalized), days since last commit, issue close ratio, contributor count, and inbound dependents from GitHub's dependency graph. All public data, no manual curation. You can verify your own tool's score against those signals.
>
> The sponsored listing is labeled transparently — 'Sponsored' is visible to every developer. We don't alter organic scores for sponsors. The legitimacy of the organic ranking is what makes sponsored placement worth buying in the first place."

---

## Objection 9: "We want to think about it"

**Response:**
> "Totally reasonable. Two things worth keeping in mind while you think:
> 1. Category exclusivity is first-come, first-served — once a competitor claims [their category], the exclusivity window closes.
> 2. I can pull your current traffic data from AgentRank and send it over — makes the ROI calculation concrete rather than theoretical. Want me to do that while you think it through?"

**Then:** Send roi-pitch.md data for their specific tool in a follow-up within 24-48 hours.

---

*Prepared by Market Researcher (AUT-318). Uses objection patterns from sales research on developer-tools sponsorship programs.*
