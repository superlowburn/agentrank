# @AgentRank_ai Twitter Engagement Playbook
**Status:** DRAFT — Steve approval required before any posts go live
**Author:** Community Manager Agent
**Date:** March 18, 2026
**Account:** @AgentRank_ai

---

## Critical Rules

- **All replies need Steve's approval before posting.** This is a drafting-only document.
- **@AgentRank_ai must NEVER reply to @comforteagle or Tier 1 contacts.** These are Steve's personal network — keep the accounts completely separated.
- **Max 5 replies/day.** Quality over volume. One good reply beats five mediocre ones.
- **Only reply when genuinely adding value.** If the data doesn't add something specific and useful, don't reply.
- **Never quote-tweet to argue.** Only engage positively or to share relevant data.
- **Never make up data.** Every stat cited must come from the AgentRank database or public sources linked in the ecosystem research.

---

## When to Reply (Decision Filter)

Before drafting a reply, ask:

1. Is the tweet asking a question we have real data to answer?
2. Is the tweet making a claim our data can confirm or nuance with numbers?
3. Is the tweet from someone building in the MCP/agent space who would find the ranking genuinely useful?
4. Would a developer reading this reply learn something or be able to use it?

If **yes to any** of the above — reply. If no — skip.

---

## Part 1: Accounts to Monitor

### Tier A — High-volume MCP/agent conversation (check daily)

| Account | Why |
|---------|-----|
| @mcptools | Official MCP ecosystem news |
| @anthropic | Announces protocol updates; replies visible to relevant builders |
| @OpenAIDevs | Competitor with high developer mindshare; MCP conversation happens here |
| @glaama_ai | Glama MCP registry; core MCP discovery conversation |
| @smithery_ai | Smithery registry; where developers find MCP tools |
| @punkpeye | Maintainer of punkpeye/awesome-mcp-servers (10K+ stars); MCP curator |
| @playwrightdev | Microsoft Playwright-MCP (#1 TypeScript MCP by stars) |
| @CoplayDev | Maintainer of unity-mcp (7K+ stars); frequently discusses MCP ecosystem |
| @FastMCPDev | FastMCP Python library maintainer; DX-focused MCP conversation |
| @simonw | Simon Willison; prolific AI/developer tool blogger; MCP commentary |
| @swyx | AI/developer scene opinion leader; writes about agent tooling |
| @levelsio | Indie hackers building AI tools; shares what works |

### Tier B — Worth monitoring weekly

| Account | Why |
|---------|-----|
| @GergelyOrosz | Writes about developer tooling; MCP signal when he covers it |
| @dynamicwebpaige | AI developer advocate; MCP tool recommendations |
| @mhegazy | TypeScript/tooling engineer; MCP SDK contributions |
| @deno_land | Deno runtime; relevant when MCP JavaScript runtime discussion happens |
| @cloudflare | Remote MCP server infrastructure; hosted MCP announcements |
| @github | GitHub MCP server (28K stars); major ecosystem voice |
| @notionhq | Notion MCP server (enterprise hosted); useful for enterprise MCP discussion |
| @figma | Figma-Context-MCP (13K stars); design workflow agents |
| @SentryIO | Sentry MCP server; developer workflow integration |
| @karpathy | AI thought leader; when he mentions agent tooling, high signal |
| @antirez | Systems programmer; occasionally comments on tooling quality; useful contrast |
| @thorstenball | Editor tooling; MCP integration in editor context |

### Tier C — Monitor for trending topics

Searches to run daily (Twitter search):
- `MCP server` (filter: recent)
- `model context protocol`
- `@AgentRank_ai` (mentions)
- `"best MCP" OR "which MCP"`
- `"recommend MCP" OR "good MCP"`
- `agent tools recommendation`
- `mcp-server github`

---

## Part 2: Conversation Types We Engage

### Type 1: "What MCP server should I use for X?"

These are the highest-value replies. Someone has a specific need and is asking for a recommendation.

**When to engage:** Any tweet asking for a recommendation in a category where AgentRank has relevant top-ranked tools.

**Value we add:** Specific ranked data — "the top 3 by maintenance score in that category are..."

---

### Type 2: "I'm building an MCP server"

Builders who are building will want to know where they stack up. Reaching them early creates future loyalty.

**When to engage:** Tweet announcing a new MCP server, or asking about MCP development patterns.

**Value we add:** "You can track how it ranks once it's live on agentrank-ai.com" — future-oriented, not pushy.

---

### Type 3: "The MCP ecosystem is overwhelming / hard to navigate"

Frustration tweets. The user is experiencing the exact problem AgentRank solves.

**When to engage:** Complaints about too many MCP servers, can't tell which are maintained, don't know where to start.

**Value we add:** Direct link to the leaderboard with a one-sentence explanation of what it does.

---

### Type 4: Data questions / ecosystem claims

Someone states something about the MCP ecosystem that we can confirm or add context to with real data.

**When to engage:** Ecosystem statistics, growth claims, language comparisons, quality assessments.

**Value we add:** Concrete numbers from our index of 25K+ repos.

---

### Type 5: Security / quality discussions

Security findings and quality complaints are where our freshness score and security-awareness messaging fits naturally.

**When to engage:** Tweets about MCP security findings, abandoned tools, unreliable servers.

**Value we add:** "We track freshness and maintenance signals — here's how the scored category looks."

---

## Part 3: 10 Reply Templates

Use these as starting points. Customize with live data before drafting for Steve's review. Replace ALL bracketed fields with real data from agentrank-ai.com before submitting for approval.

---

### Template 1 — Direct recommendation (Type 1)

**Use when:** Someone asks "what's the best MCP server for [X]?"

```
For [use case], the top-ranked options in our index right now are:

1. [tool-name] (score: [X.X]) — [brief reason, e.g. "actively maintained, 2K+ stars"]
2. [tool-name] (score: [X.X])
3. [tool-name] (score: [X.X])

We score 25K+ MCP servers by freshness, stars, issue health + activity.
Full [category] rankings: agentrank-ai.com/tools?category=[slug]
```

**Why it works:** Concrete, ranked, directly answers the question. No fluff.

---

### Template 2 — Ecosystem quality problem (Type 3)

**Use when:** Tweet complains about how hard it is to find a good MCP server.

```
58% of the 25K+ MCP repos on GitHub haven't committed in 90+ days.
The quality pool is maybe 10K tools.

We built agentrank-ai.com to filter for that 10K — freshness + activity + maintenance scores updated daily.
```

**Why it works:** Validates the frustration with data, then presents the solution.

---

### Template 3 — Security discussion (Type 5)

**Use when:** Someone tweets about MCP security issues.

```
This tracks with what we see in our data. Of the 25K+ servers we index:
— 58% inactive 90+ days (maintenance risk)
— Enterprise-published servers (Playwright-MCP, github-mcp-server) score highest on our maintenance signals

Our freshness and activity scoring is a rough proxy — full security audit is a different tool.
Rankings at agentrank-ai.com
```

**Why it works:** Adds real data, honest about scope, adds value without overselling.

---

### Template 4 — New tool builder (Type 2)

**Use when:** Someone announces they're building or just shipped an MCP server.

```
Nice — once it's public on GitHub, it'll get indexed on agentrank-ai.com automatically.
We score 25K+ MCP tools daily by maintenance signals.

Good luck with it — the ecosystem needs more actively maintained tools.
```

**Why it works:** Encouraging, practical, plants the seed without pressure.

---

### Template 5 — Language/tech discussion (Type 4)

**Use when:** Someone discusses which language to use for MCP servers.

```
Interesting data point from our index (25K+ MCP repos):

Python: 39% of repos (raw volume leader)
TypeScript: 28% (enterprise tooling — Playwright-MCP, Figma-Context-MCP lead here)
Go: 5% (but github-mcp-server [28K⭐] and google/genai-toolbox [13K⭐] are Go)

Go is small but punching way above its weight in high-star tools.
```

**Why it works:** Adds a fresh data angle to a common debate.

---

### Template 6 — Movers/trending (proactive, weekly)

**Use when:** Posting a proactive data tweet about weekly rank changes (not a reply — a standalone post tagged in conversations).

```
Biggest movers this week in the AgentRank index:

↑ [tool-name]: +[X] spots — [brief reason, e.g. "major commit + issue cleanup"]
↑ [tool-name]: +[X] spots
↓ [tool-name]: -[X] spots — [brief reason, e.g. "90 days since last commit"]

Full movers list: agentrank-ai.com/movers
```

**Why it works:** Data-native, shareable, drives direct traffic to movers page.

---

### Template 7 — Enterprise adoption (Type 4)

**Use when:** Someone asks which major companies have official MCP servers, or discusses protocol legitimacy.

```
Every major platform now has an official MCP server in our index:

— Playwright-MCP (Microsoft): [N]K⭐
— github-mcp-server: [N]K⭐
— Figma-Context-MCP: [N]K⭐
— Notion, Cloudflare, Sentry, Google all official now too

These cluster at the top of our maintenance scores. Full rankings: agentrank-ai.com
```

**Why it works:** The credibility cascade works — if Microsoft and GitHub use MCP, the legitimacy question is settled.

---

### Template 8 — A2A / multi-agent (Type 4)

**Use when:** Someone asks about A2A vs MCP or multi-agent orchestration.

```
Data point: our crawler found 109 open-source A2A repos vs 25K+ MCP repos (March 2026).

A2A isn't competing with MCP — it's the coordination layer on top. MCP = tool access, A2A = agent delegation. Production systems will use both.

We track both at agentrank-ai.com — A2A is still small but watch it.
```

**Why it works:** Educated take, backs up opinion with data, positions AgentRank as covering the full space.

---

### Template 9 — Context window / too many tools (Type 3)

**Use when:** Someone complains about loading too many MCP tools and burning their context window.

```
Common problem — loading 50 MCP tools at cold start burns 100K+ tokens before you've said anything.

The score-based approach: install 5-10 highly-maintained tools instead of 50 random ones.
We rank 25K+ by freshness + activity — agentrank-ai.com makes that filter easier.
```

**Why it works:** Acknowledges a real, named problem. AgentRank as the cure, not the sales pitch.

---

### Template 10 — Comparison / "which is better" (Type 1)

**Use when:** Someone asks to compare two specific MCP tools.

```
Quick comparison from our data:

[Tool A]: score [X.X] — stars [N], last commit [X days ago], [N] contributors
[Tool B]: score [X.X] — stars [N], last commit [X days ago], [N] contributors

Full breakdown: agentrank-ai.com/compare?a=[tool-a]&b=[tool-b]
```

**Why it works:** Direct, structured, links to the compare page for deeper exploration.

---

## Part 4: What NOT to Do

- **Don't reply to the same thread twice** unless directly addressed.
- **Don't engage with negative or hostile tweets** — ignore completely.
- **Don't reply to @comforteagle or anyone Steve flags as a Tier 1 contact.**
- **Don't post ecosystem stats without checking they're current** — data goes stale. Always pull fresh numbers from agentrank-ai.com before using in a reply.
- **Don't promote AgentRank in a non-MCP thread** — the account should only appear in genuinely relevant conversations.
- **Don't quote-tweet to disagree.** If someone is wrong about something in the MCP space, either ignore it or reply with data — never argue.
- **Don't post when a competing product just launched** — it reads as defensive.
- **Don't over-explain AgentRank.** One-sentence max: "We score 25K+ MCP tools by freshness, stars, and activity." If they want more, they'll click.

---

## Part 5: Approval Workflow

1. Community Manager drafts 1-5 replies per day based on this playbook.
2. Drafts are posted as a comment on the active Paperclip issue for review.
3. Steve approves or edits via Paperclip or direct message.
4. After approval, Steve (or designated account operator) posts from @AgentRank_ai.
5. No draft goes live without explicit Steve sign-off.

**Submission format for Steve:**

```
DRAFT REPLY — needs approval before posting

Thread: [URL to the tweet]
Context: [1 sentence on what the original tweet said]
Reply:
---
[reply text]
---
Template used: #[N]
Data source: agentrank-ai.com (checked [date])
```

---

## Part 6: Research — Recent MCP/Agent Tweet Themes (March 2026)

Based on ecosystem research, these are the live conversation threads and topics where @AgentRank_ai should be engaging. This section should be refreshed weekly.

### Active conversation themes (week of March 17, 2026)

1. **MCP security vulnerabilities** — ongoing discussion after "8,000+ MCP Servers Exposed" Medium article (Feb 2026). Security practitioners discussing 66% exposure rate, CVEs in official MCP servers.

2. **Enterprise MCP server releases** — announcements from Microsoft (10 official servers), GitHub (github-mcp-server Go rewrite/update), Cloudflare managed MCP catalog.

3. **"Which MCP server for [use case]" recommendations** — high volume daily. Database, coding, browser automation are the most-asked-about categories.

4. **FastMCP framework discussions** — Python FastMCP (23K stars) has active community discussion about DX improvements.

5. **A2A vs MCP debate** — spikes after any Google developer blog post. Confusion about whether A2A "replaces" MCP.

6. **Context window overhead** — developers hitting the 100K+ token startup problem with large tool configs.

7. **MCP on Cursor/Claude Code** — how to configure MCP servers in IDE/agentic coding tools. High-volume practical questions.

8. **Tool quality / "95% garbage"** — recurring frustration about low-quality MCP repos. Organic entry point for AgentRank.

9. **awesome-mcp-servers contributions/PRs** — @punkpeye's repo gets PR discussions weekly.

10. **MCP auth and OAuth complexity** — frustration with the OAuth 2.1 implementation. Enterprise developers venting.

11. **New MCP server announcements** — "I built an MCP server for X" posts. Good entry point for Template 4.

12. **MCP registry (official + Smithery/Glama) updates** — registry news drives organic engagement.

13. **Agent orchestration discussions** — when to use MCP vs A2A vs custom protocols. Technical debates.

14. **GitHub Actions + MCP** — CI/CD integration with MCP servers; GitHub's official server makes this more active.

15. **playwright-mcp usage questions** — Microsoft's tool is popular enough that support questions show up publicly.

16. **"How many MCP servers should I load?"** — practical performance question, directly in our wheelhouse.

17. **Self-hosted vs hosted MCP servers** — privacy/control tradeoffs. Notion, Cloudflare going hosted triggers debate.

18. **MCP for data science / Jupyter** — Python-heavy audience; different from typical dev audience.

19. **MCP tool discovery** — meta-discussion about how to find good tools. This is us.

20. **Open source MCP server maintenance burnout** — maintainers venting about support load. Empathize, don't pitch.

---

*Last updated: March 18, 2026. Refresh weekly.*
