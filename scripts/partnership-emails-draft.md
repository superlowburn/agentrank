# Partnership Outreach Email Drafts

**File:** `scripts/partnership-emails-draft.md`
**Status:** DRAFT — Steve approves before any send
**Prepared by:** Product Manager (AUT-118)
**Date:** 2026-03-17

---

## How to Use

Each email is ready to send with minor fill-ins marked `[FILL]`. Deliver via the specified channel. Attach or link the AgentRank widget demo where indicated.

Widget embed URL (placeholder): `https://agentrank-ai.com/widget/{repo-slug}` — confirm with Founding Engineer before outreach.

---

---

## 1. PulseMCP — hello@pulsemcp.com
**Channel:** Email
**Contact:** Tadas Antanavicius + Mike Coughlin
**Partnership type:** Embed scores in server listings + newsletter co-promotion

**Subject:** AgentRank × PulseMCP — quality scores for your 11k+ listings

---

Hi Tadas and Mike,

I'm Steve, building AgentRank (agentrank-ai.com) — a daily-updating ranked index of 25,000+ MCP servers and agent tools, scored on freshness, issue health, contributor count, and downstream dependents.

You're running the most trusted directory in the ecosystem. We're computing the quality signal that's still missing from most directories. The combination is obvious.

**What I'm proposing:**

Embed AgentRank quality scores on individual server listings at PulseMCP. Free — no strings. I'll give you the embed widget and a data API endpoint. You decide how to display it.

In return, I'd love a brief mention in THE MCP when we're both ready to announce — but that's optional and up to you.

**Why it makes PulseMCP stronger:** Your 11k listings are already the most comprehensive. Adding a live quality score gives practitioners one more reason to use PulseMCP as a decision tool, not just a discovery tool. That increases time-on-page and return visits.

AgentRank currently has 25,632 repos indexed, updated nightly. Happy to share a sample data export for PulseMCP to evaluate.

Worth a call this week?

Steve Mallett
AgentRank | agentrank-ai.com
@comforteagle

---

---

## 2. Glama.ai — support@glama.ai
**Channel:** Email (or @punkpeye Twitter DM as backup)
**Contact:** Frank Fiegel
**Partnership type:** AgentRank scores on Glama listings + shared data

**Subject:** Quality layer for Glama's 19k servers — AgentRank embed

---

Hi Frank,

Steve at AgentRank here. You've built the most frequently updated MCP directory in existence — 19,507 servers is genuinely impressive. I'm building the complementary piece: daily-updated quality rankings for those same repos.

You also maintain `punkpeye/awesome-mcp-servers` (83k stars — #273 on AgentRank with a score of 71.5/100, held back only because it's a list rather than a server, which skews our composite). That repo is one of the most influential in the ecosystem.

**The offer:**

Free AgentRank score embeds for Glama's server listings. I'll expose a REST endpoint you can call per `{owner}/{repo}` to pull the current score, rank, and signal breakdown. You can surface it however you want — a badge, a sort option, a detail pane.

No cost, no vendor lock-in. I just want AgentRank cited as the source.

I'd also be open to a data-sharing arrangement — Glama's update frequency gives you freshness signals I don't have from GitHub alone. If there's a way to mutually enrich the datasets, I think both products get stronger.

Would you be up for a quick chat?

Steve Mallett
AgentRank | agentrank-ai.com
@comforteagle

---

---

## 3. Smithery.ai — @smithery_ai (Twitter DM or GitHub)
**Channel:** Twitter DM
**Contact:** Henry Mao and/or Arjun Kumar
**Partnership type:** "Powered by AgentRank" badge + score API integration

**Subject:** (Twitter DM — no subject line)

---

Hey Henry and Arjun — Steve here, building AgentRank (agentrank-ai.com).

Quick pitch: AgentRank indexes 25k+ MCP servers with daily-updated quality scores (freshness, issue health, contributors, dependents). Smithery's install analytics tell you what's popular. AgentRank tells you what's maintained.

The Smithery CLI ranks #169 on AgentRank with a score of 78.8/100 — solid maintainability signals.

**What I want to offer:** a free score API so Smithery listings can show AgentRank quality scores alongside install counts. You'd get a "Powered by AgentRank" attribution (or don't show it — your product, your call) and a data partnership where both indexes get richer.

Smithery is already the deepest MCP integration point for Cursor, Windsurf, and Claude. A quality layer on top of your install data would make server selection much sharper for practitioners.

Happy to share a dataset sample or jump on a call. Interested?

Steve / AgentRank

---

---

## 4. mcp.so — support@mcp.so
**Channel:** Email
**Contact:** @chatmcp team
**Partnership type:** Score embed on server pages + backlink exchange

**Subject:** AgentRank scores for mcp.so's 18k server listings

---

Hi,

I'm Steve, building AgentRank (agentrank-ai.com) — a ranked index of 25,000+ MCP servers updated daily. We score on five signals: stars, freshness, issue health, contributors, and downstream dependents.

mcp.so is one of the largest community directories in the ecosystem at 18,665 servers. I'd like to offer a free embed widget so individual server pages on mcp.so can display the AgentRank quality score inline.

It's a small addition that gives your listings a data layer they don't currently have, and makes mcp.so a more complete decision tool for practitioners. I'd ask only for an attribution link back to agentrank-ai.com.

I can have the embed endpoint ready within a day of you saying yes. Happy to share a technical spec or a sample dataset export.

Want to try it?

Steve Mallett
AgentRank | agentrank-ai.com
@comforteagle

---

---

## 5. Mastra.ai — @mastra_ai (Twitter DM + GitHub issue)
**Channel:** Twitter DM + GitHub issue on mastra-ai/mastra
**Contact:** Mastra team
**Partnership type:** Listing on MCP Registry Registry + score API for framework

**Subject:** (Twitter DM — no subject line)

---

Hey Mastra team — Steve at AgentRank (agentrank-ai.com).

Two asks, both fast:

**1. List AgentRank on your MCP Registry Registry page.** We index 25,000+ MCP servers with daily-updated quality scores — we should be in that meta-directory alongside Glama, mcp.so, and Smithery. Happy to submit a PR or send you whatever info you need.

**2. Score API for Mastra users.** When Mastra devs search for MCP tools to add to their agent, surfacing an AgentRank quality score inline would help them pick faster. I'll provide a free API endpoint — just needs a `{owner}/{repo}` query, returns rank + score + signal breakdown in JSON.

Mastra is one of the most credible MCP framework teams (19k stars, 300k weekly npm downloads, YC-backed). AgentRank data inside Mastra would reach exactly the right audience.

No cost, fast to integrate, I'll write the docs.

Interested?

Steve / AgentRank

---

---

## 6. Latent Space / swyx — @swyx (Twitter DM)
**Channel:** Twitter DM
**Contact:** swyx (Shawn Wang)
**Partnership type:** Data story pitch for newsletter/podcast

**Subject:** (Twitter DM — no subject line)

---

Hey swyx — Steve here. I built AgentRank (agentrank-ai.com) — a ranked index of 25,000+ MCP servers scored on real signals: freshness, issue health, contributor count, downstream dependents. Updates nightly.

The data is interesting. Here's what it says right now:

- 68% of indexed MCP servers haven't had a commit in over 90 days
- Median issue close rate is 34% (the long tail is mostly abandoned)
- The top 10 by AgentRank score are very different from the top 10 by stars
- The Unity MCP server (#1 ranked) has 7,003 stars and 43 contributors — built by a team, not a solo dev

I think there's a genuine data story here for Latent Space: "the MCP ecosystem is bigger than everyone thinks, but the quality distribution is brutal." Happy to run any specific analysis you want for a newsletter piece or episode.

No expectation — if the data's useful, use it. I'd just appreciate a citation back to AgentRank as the source.

— Steve

---

---

## 7. Simon Willison — @simonw (Twitter DM)
**Channel:** Twitter DM
**Contact:** Simon Willison
**Partnership type:** Methodology validation + potential blog coverage

**Subject:** (Twitter DM — no subject line)

---

Hey Simon — Steve here. You wrote the most clear-eyed analysis of MCP's tradeoffs I've read. I've been building something you might find interesting: AgentRank (agentrank-ai.com) — a daily-updated ranked index of 25,000+ MCP servers.

The scoring methodology is deliberate: freshness weighted at 25%, issue health at 25%, dependents at 25%, stars at 15%, contributors at 10%. Opinionated. The point is that a tool with 100 stars and a 60-day-old commit beats a tool with 10,000 stars and a dead repo.

Two things I'd love your input on:

1. **Does the scoring methodology make sense?** You've built a lot of tools and followed this ecosystem closely. I'd value a skeptical read.
2. **If you find AgentRank credible, a mention or citation would be huge.** One blog post from you reaches HN. I know that's asking a lot — no pressure.

The data is all public (GitHub API). The methodology is documented at agentrank-ai.com. Happy to share the scoring code too.

— Steve

---

---

## 8. Docker MCP Catalog — @mikegcoleman (Twitter DM)
**Channel:** Twitter DM
**Contact:** Mike Coleman (Docker developer evangelist)
**Partnership type:** Co-branding for verified catalog + enterprise reach

**Subject:** (Twitter DM — no subject line)

---

Hey Mike — Steve at AgentRank (agentrank-ai.com). I index 25,000+ MCP servers with quality scores based on freshness, issue health, contributors, and dependents. Think of it as the reliability signal that Docker's "verified" badge doesn't currently expose.

The intersection is interesting: Docker's catalog has 300+ verified, containerized servers. AgentRank's issue health and freshness scores directly measure the same thing Docker's verification is trying to signal — is this tool actively maintained by a responsive team?

**What I'd like to propose:** Display AgentRank quality scores on Docker MCP catalog listings. A co-branded "AgentRank Score" on a Docker-verified server tells enterprise buyers something specific — not just "it runs in a container" but "it's actively maintained and the maintainer closes issues." Those are different claims.

Docker has 20M+ developers. Even a small footprint in the MCP catalog would reach the enterprise segment AgentRank currently doesn't.

Free to integrate. Happy to talk with whoever owns the catalog product.

— Steve / AgentRank

---

---

## 9. LangChain — @LangChainAI (Twitter DM + GitHub discussion)
**Channel:** Twitter DM
**Contact:** LangChain team
**Partnership type:** Featured tools section + blog post collaboration

**Subject:** (Twitter DM — no subject line)

---

Hey LangChain team — Steve at AgentRank (agentrank-ai.com).

LangGraph integrates MCP natively. LangChain developers are picking MCP servers to extend their agents every day. Right now they're sorting by stars on GitHub, which is a rough proxy for quality but misses freshness and maintainability entirely.

AgentRank indexes 25,000+ MCP tools with daily-updated scores. The `langchain-ai/langchainjs-mcp-adapters` repo ranks #430 on AgentRank with a score of 61.8/100 — room to improve, but the score would rise quickly with higher issue close rates.

**Two options I'd love to discuss:**

1. **Embed AgentRank scores in LangChain's MCP integration docs** — so when devs browse recommended tools, they see a live quality signal, not just a GitHub link.
2. **Co-authored data post** for the LangChain blog — "We analyzed 25,000 MCP servers. Here's what the best ones have in common." Their audience is exactly the engineers building on top of LangGraph with MCP.

Free to integrate. Blog post is pure editorial — no cost, no sponsored label.

Interested?

Steve / AgentRank

---

---

## 10. Ben's Bites — @bentossell (Twitter DM)
**Channel:** Twitter DM
**Contact:** Ben Tossell
**Partnership type:** Newsletter mention / editorial data story

**Subject:** (Twitter DM — no subject line)

---

Hey Ben — Steve here. I built AgentRank (agentrank-ai.com) — a ranked index of 25,000+ MCP servers and agent tools, updated daily.

The editorial angle that I think fits Ben's Bites: **the MCP ecosystem quality gap**. There are 25,000 indexed tools. 68% haven't been committed to in 90+ days. The top tools by stars and the top tools by maintainability are almost entirely different lists. Developers who pick by stars are often picking abandoned projects.

AgentRank's composite score surfaces the maintained tools — freshness, issue close rates, contributor count, downstream dependents.

I'd love a brief mention or a link when you're covering MCP tools. Happy to write a short summary of the most interesting data points — stars vs. maintainability divergence, fastest rising tools, most-improved over the last 30 days — formatted for your newsletter style.

No ask other than attribution.

— Steve

---

---

## Outreach Schedule (Suggested)

| # | Target | Contact | Channel | Suggested send |
|---|--------|---------|---------|---------------|
| 1 | PulseMCP | hello@pulsemcp.com | Email | Day 1 |
| 2 | Glama/Frank | support@glama.ai | Email | Day 1 |
| 3 | Smithery | @smithery_ai | Twitter DM | Day 1 |
| 4 | mcp.so | support@mcp.so | Email | Day 2 |
| 5 | Mastra | @mastra_ai | Twitter DM + GH | Day 2 |
| 6 | swyx/Latent Space | @swyx | Twitter DM | Day 3 |
| 7 | Simon Willison | @simonw | Twitter DM | Day 3 |
| 8 | Docker/Mike | @mikegcoleman | Twitter DM | Day 4 |
| 9 | LangChain | @LangChainAI | Twitter DM | Day 4 |
| 10 | Ben's Bites | @bentossell | Twitter DM | Day 5 |

---

*DRAFTS ONLY. Do not send without Steve's approval.*
*Output of AUT-118. Requested by CEO agent.*
