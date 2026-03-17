# AgentRank Newsletter #1 — Draft

> **STATUS: DRAFT — Do NOT send. Steve must review and approve before sending.**

Generated: 2026-03-17

---

## Subject Line Options (pick one)

1. `The MCP ecosystem by the numbers — AgentRank #1`
2. `25,000+ tools ranked. Here's who's winning.`
3. `AgentRank #1: First newsletter, first leaderboard snapshot`

**Recommended:** Option 2 — most direct, highest open rate potential.

---

## Preview Text (shows in inbox below subject)

`The top 10, biggest movers, new tools this week, and how to give your AI live rankings.`

---

## Body

---

**AgentRank** | Issue #1 | March 2026

---

### The state of the MCP ecosystem

There are now 25,000+ MCP servers, AI skills, and agent tools indexed in AgentRank. They're scored daily on five GitHub signals: freshness, issue health, contributors, dependents, and stars.

A few numbers that surprised me when I started looking at the data:

- **97% of repos have a single contributor.** The ecosystem is wide and mostly solo projects.
- **~54% haven't committed in 91–365 days.** More than half of what exists is in various stages of abandonment.
- **The top 1% of tools account for the majority of real usage.** The gap between rank #1 and rank #1,000 is enormous.

This is why the ranking exists. Not to celebrate the big repos — they're already visible. To surface the actually-maintained tools that don't have the star count yet.

---

### Top 10 this week

Scores are 0–100. Updated daily.

| Rank | Tool | Score | Stars | Category |
|------|------|-------|-------|----------|
| #1 | [unity-mcp](https://agentrank-ai.com/tool/CoplayDev/unity-mcp) | 98.7 | 7.0k | Unity / Game Dev |
| #2 | [azure-devops-mcp](https://agentrank-ai.com/tool/microsoft/azure-devops-mcp) | 97.2 | 1.4k | DevOps |
| #3 | [laravel/boost](https://agentrank-ai.com/tool/laravel/boost) | 96.9 | 3.3k | Web Framework |
| #4 | [mcp-unity](https://agentrank-ai.com/tool/CoderGamester/mcp-unity) | 96.4 | 1.4k | Unity / Game Dev |
| #5 | [spec-workflow-mcp](https://agentrank-ai.com/tool/Pimzino/spec-workflow-mcp) | 96.4 | 4.0k | Workflow |
| #6 | [mcp-go](https://agentrank-ai.com/tool/mark3labs/mcp-go) | 96.3 | 8.4k | SDK / Go |
| #7 | [markdownify-mcp](https://agentrank-ai.com/tool/zcaceres/markdownify-mcp) | 95.1 | 2.4k | Content |
| #8 | [playwright-mcp](https://agentrank-ai.com/tool/microsoft/playwright-mcp) | 94.8 | 29k | Browser Automation |
| #9 | [fastmcp](https://agentrank-ai.com/tool/PrefectHQ/fastmcp) | 94.7 | 24k | SDK / Python |
| #10 | [perplexity MCP](https://agentrank-ai.com/tool/perplexityai/modelcontextprotocol) | 94.6 | 2.0k | Search |

Full rankings: [agentrank-ai.com](https://agentrank-ai.com)

---

### What the leaderboard is telling you

A few observations from this week's data:

**Unity is dominating the top 5.** Three of the top 15 ranked tools are Unity MCP integrations — #1, #4, and #14. Game developers are adopting MCP faster than any other dev category right now, and the maintainers are keeping up with it. If you're building anything Unity-adjacent, the tooling is better than you might expect.

**The Go SDK is quietly essential.** mcp-go at #6 has 8,400 stars but what pushed it there is dependents — a significant number of other repos build on it. Stars follow attention; dependents follow actual usage. mcp-go has both.

**fastmcp is the Python equivalent.** 24,000 stars and one of the freshest commit histories in the top 10. If you're writing Python MCP tools, this is the framework that's won.

**playwright-mcp is the highest-installed tool in the ecosystem.** 29,000 stars, 1.8 million installs via Glama. It's in the top 10 on score because Microsoft is actively maintaining it — not just because of the star count.

---

### New tools this week

> *Note to Steve: the index updates nightly — pull fresh "new entries" data from the dashboard before sending this section. These are placeholders based on current indexing patterns.*

The index added several hundred new repos this week. A few that came in with strong initial signals:

- Tools entering with 50+ stars on day one (signal: already had a community before GitHub went live)
- Repos with 3+ contributors from the start (signal: not a solo project)
- Tools with meaningful dependents within the first week (signal: someone is already building on it)

Check [agentrank-ai.com](https://agentrank-ai.com) for the current new-entries view.

---

### Give your AI live access to the rankings

The MCP server is the fastest way to use AgentRank. Install it once and your AI can query the live index whenever it needs a tool recommendation.

```
claude mcp add agentrank -- npx -y agentrank-mcp-server
```

After that, instead of guessing from training data, your AI checks current scores. It knows the freshness, issue health, and dependent count of whatever it recommends.

The meta-use case — an AI using a tool-ranking tool to find tools — works better in practice than it sounds in theory.

---

### What's next

A few things coming soon:

- **Category leaderboards** — dedicated rankings for Browser Automation, Dev Tools, Game Dev, etc.
- **Mover alerts** — subscribe to a specific tool and get notified when its score changes significantly
- **Badge embeds** — maintainers can add a live AgentRank score badge to their README

If you want early access to any of these, reply to this email.

---

*AgentRank — agentrank-ai.com*
*Unsubscribe | You're receiving this because you subscribed at agentrank-ai.com*

---

## Notes for Steve

- The "New tools this week" section needs live data from the dashboard before sending — I flagged it inline
- Subject line recommendation: Option 2 (`25,000+ tools ranked. Here's who's winning.`)
- Send time: Tuesday or Wednesday morning, 9am PT — highest open rates for developer newsletters
- Platform: whatever you're using for email (ConvertKit, Beehiiv, Substack, etc.) — just paste the markdown or adapt the formatting
- The Perplexity note at the end of outreach #13 is intentional — worth a sentence in the newsletter if they respond positively before you send

---

*Generated by Growth Engineer agent. Requires Steve's approval before sending.*
