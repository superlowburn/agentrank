# Outreach Email Template — Sponsored Listings

**File:** `scripts/outreach-email-template.md`
**Purpose:** Generic email template for sponsored listing outreach. Customize per prospect using data from `research/outreach-tracker.md` and `research/sponsored-listing-prospects.md`.

---

## Template A — Cold Email (Primary)

**Subject:** `[Company] on AgentRank — [X views/mo] → want top placement?`

*(Fallback subject if no traffic data yet: "Your MCP server on AgentRank — sponsored placement")*

---

Hi [Name / team],

Quick note from AgentRank (agentrank-ai.com/?utm_source=email&utm_medium=outreach&utm_campaign=sponsored_listing) — we're the ranked index that developers check when evaluating MCP servers and agent tools.

**[Company]'s MCP server currently [ranks #X / isn't indexed yet] on AgentRank** — [and gets approximately X views/month from developers actively evaluating tools in your category].

A sponsored listing gives you:
- **Featured placement** at the top of the [category] category
- **Verified Publisher badge** — signals the listing is official and actively maintained
- **Analytics dashboard** — see exactly how many developers are evaluating your tool

Pricing: $299/month. Annual option available (2 months free).

See your listing: https://agentrank-ai.com/tool/[tool-slug]/?utm_source=email&utm_medium=outreach&utm_campaign=sponsored_listing

If the timing is off, I'm happy to revisit — but given [recent funding / competitor activity], now is when the [category] category placement matters most.

Worth a quick call?

[Steve / @comforteagle]
AgentRank

---

## Template B — Twitter DM (Shorter)

Hey [name], quick note: [Company]'s MCP server is [ranked #X / not yet indexed] on AgentRank — we index 25K+ tools and developers use it to pick their stack. We're launching sponsored placements at $299/mo with a verified badge. Worth talking if you're investing in dev discovery right now?

---

## Personalization Variables

Fill these in per prospect before sending:

| Variable | Source | Notes |
|----------|--------|-------|
| `[Company]` | outreach-tracker.md | Company name |
| `[Name]` | outreach-tracker.md | Founder / marketing lead name |
| `[ranks #X]` | sponsored-listing-prospects.md | Current AgentRank rank |
| `[X views/mo]` | *(placeholder)* | Pull from analytics once live |
| `[category]` | sponsored-listing-prospects.md | Their primary MCP category |
| `[recent funding / competitor activity]` | sponsored-listing-prospects.md | Use the specific trigger per company |

---

## Personalization Notes by Company Type

### Fresh funding (Qdrant, Portkey, Mem0)
> "...given your Series [X] in [month], you're in active marketing deployment mode right now."

### Competitive framing (Tavily/Exa, Qdrant/Weaviate)
> "...and [Competitor] is [X ranks] away from you — a sponsored listing anchors your position before they invest in theirs."

### MCP-native companies (Mem0, Composio, Firecrawl)
> "...your product IS an MCP server, so AgentRank is the index where your target developers already shop."

### Companies not yet indexed (Portkey, Mintlify, Weaviate, CrewAI, LlamaIndex)
> "...we don't have [Company] indexed yet, which means you're invisible on the directory developers are already using. A sponsored listing fixes that with top placement from day one."

### Ran their own registry (Mintlify)
> "...you built mcpt.com, so you know exactly what developer MCP discovery is worth. AgentRank is where that intent now lives."

---

## Follow-up Cadence

1. **Day 0:** Send cold email or Twitter DM
2. **Day 5:** One follow-up if no response — single sentence: "Did this land in the wrong inbox?"
3. **Day 12:** If no response, move to `passed` for this cycle and revisit in 30 days

Do not send more than 2 follow-ups per prospect.

---

*Template created by Product Manager agent, March 17, 2026.*
*Update the traffic variable once Cloudflare analytics are live (see AUT analytics tasks).*
