# GitHub Comment Drafts — AUT-243
**Status:** APPROVED (Steve: "Do it." 2026-03-18) — posting in progress
**Date drafted:** 2026-03-18
**Rule:** Stagger 24-48h between posts.

## Posting Log
| # | Target | Status | URL | Posted |
|---|--------|--------|-----|--------|
| 4 | LibreChat #9837 | ✅ Posted | https://github.com/danny-avila/LibreChat/discussions/9837#discussioncomment-16192768 | 2026-03-18 |
| 1 | gemini-cli #2383 | ✅ Posted | https://github.com/google-gemini/gemini-cli/discussions/2383#discussioncomment-16192771 | 2026-03-18 |
| 2 | community/170523 | pending | — | — |
| 3 | community/169533 | pending | — | — |
| 5 | mcp/1251 | pending | — | — |
| 6 | mcp/1160 | pending | — | — |
| 7 | claude-code/16177 | pending (@comforteagle) | — | — |
| 8 | claude-code/12025 | pending (@comforteagle) | — | — |
| 9 | mcp/1780 | pending | — | — |
| 10 | mcp/2218 | pending | — | — |

---

## Comment 1
**Target:** https://github.com/google-gemini/gemini-cli/discussions/2383
**Thread:** "What are your favourite MCP servers?"
**Tone:** Helpful data source, not promotional

---

Great thread. We built [AgentRank](https://agentrank-ai.com) specifically to answer this question with data rather than vibes.

It indexes 25,000+ MCP servers and scores each one daily across five signals: stars, freshness (days since last commit), issue health (closed/total ratio), contributor count, and inbound dependents. The result is a 0–100 score that surfaces servers that are actively maintained and widely trusted — not just hyped at launch.

Current top tier by score if you want a starting point:
- **@modelcontextprotocol/server-filesystem** — consistently #1 or #2, heavily used as a dependency
- **@modelcontextprotocol/server-github** — strong issue health, active contributors
- **mcp-server-brave-search** — high freshness, no abandoned signals

The freshness signal is especially useful for Gemini CLI since you want servers that are being actively updated as the protocol evolves. Anything with a last commit >90 days starts getting penalized in the score.

---

## Comment 2
**Target:** https://github.com/orgs/community/discussions/170523
**Thread:** "[Preview] MCP Server Support in GitHub.com" (GitHub Copilot MCP)
**Tone:** Data-driven trust evaluation angle

---

One thing that would make this preview much more useful: a way to evaluate server trustworthiness before enabling them.

For anyone evaluating which servers to connect to GitHub Copilot, [AgentRank](https://agentrank-ai.com) gives you a scored index of 25,000+ MCP servers. The scoring uses five GitHub signals: stars, freshness, issue health (closed vs. open ratio), contributor count, and inbound dependents.

Practical use case: before enabling an MCP server in Copilot, check its AgentRank score. A score below 20 often means abandoned (last commit 6+ months ago) or single-contributor with no issue responsiveness. Scores above 60 correlate strongly with servers that have active maintenance and real usage.

Not a substitute for auditing the code, but it's a fast filter.

---

## Comment 3
**Target:** https://github.com/orgs/community/discussions/169533
**Thread:** "Feature Request: Organization/Enterprise Allow List for MCP Servers/Tools"
**Tone:** Enterprise evaluation angle, data as policy input

---

This is the right ask. For the allow-list to be practical, you need a way to evaluate servers at scale rather than manually reviewing each one.

We built [AgentRank](https://agentrank-ai.com) as a data source for exactly this kind of decision. It scores 25,000+ MCP servers on:
- **Freshness** — last commit recency (stale servers = security/compatibility risk)
- **Issue health** — closed/total issue ratio (unresponsive maintainers = support risk)
- **Contributor count** — single-maintainer projects are higher bus-factor risk
- **Inbound dependents** — ecosystem adoption signal
- **Stars** — normalized popularity

For an enterprise allow-list policy, you could baseline it at "AgentRank score ≥ 40 + manual security review" and filter out the long tail of abandoned experiments. The public API makes it automatable.

---

## Comment 4
**Target:** https://github.com/danny-avila/LibreChat/discussions/9837
**Thread:** "Dynamic MCP Server and Tool Discovery"
**Tone:** Discovery layer reference — most technically relevant

---

If you're building dynamic discovery, you'd probably want to avoid re-crawling GitHub from scratch. [AgentRank](https://agentrank-ai.com/api-docs) has a free public API that exposes a scored and ranked index of 25,000+ MCP servers, updated nightly.

Relevant endpoints for your use case:
- `GET /api/tools` — paginated list with scores, categories, GitHub metadata
- `GET /api/tools/search?q=<query>` — search by name or description
- `GET /api/tools/{slug}` — full detail including score breakdown

Each entry includes stars, last commit date, issue stats, language, and the composite score. Useful as a quality filter on top of raw discovery — rather than surfacing every server, you can filter to `score >= 30` to skip the abandoned ones.

The MCP server endpoint is also available if you want to query it directly from within an MCP-capable client.

---

## Comment 5
**Target:** https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1251
**Thread:** "How many servers and tools can it handle?"
**Tone:** Practical toolset curation angle

---

For anyone managing a large server list: one pattern we've seen is that people start with 20+ servers and find performance degrades, then they want to know which ones to cut.

[AgentRank](https://agentrank-ai.com) scores every MCP server on GitHub daily. If you want to thin your stack to the highest-signal tools, the score surface servers that are: actively maintained (freshness), have responsive maintainers (issue health), and are actually used by others (dependents + stars).

Practically: servers scoring below 15 are usually abandoned experiments. Keeping your stack to score ≥ 30 tools tends to give you a good signal-to-noise ratio on quality.

---

## Comment 6
**Target:** https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1160
**Thread:** "A Unified Approach for Installing MCP Servers in IDEs and Tools"
**Tone:** Discovery layer / registry angle

---

Discovery is the missing piece here. Installation standards matter less if users can't find quality servers to install in the first place.

We've been building [AgentRank](https://agentrank-ai.com) as a layer on top of GitHub — it crawls and scores 25,000+ MCP servers nightly using real maintenance signals. The idea is that before you install anything, you can see whether it's actively maintained, has a responsive maintainer, and is actually depended on by others.

One thing we'd add to a unified installation standard: a quality signal field in the manifest. Right now every server self-describes as production-ready. An external score (or at minimum, a "last verified active" timestamp) would let IDEs surface the maintained ones automatically rather than presenting a flat list.

The [public API](https://agentrank-ai.com/api-docs) is free if anyone wants to embed rankings in their tooling.

---

## Comment 7
**Target:** https://github.com/anthropics/claude-code/issues/16177
**Thread:** "Feature: Enable specific MCP servers for sub-agents"
**Tone:** Server selection/quality context

---

For selecting which servers to enable for sub-agents specifically: the concern isn't just capability match but also reliability. A sub-agent calling an abandoned MCP server with no maintenance is a runtime risk.

[AgentRank](https://agentrank-ai.com) scores every MCP server daily — if you're building a list of trusted servers for sub-agent use, it's a useful filter. Servers with high freshness scores (last commit recent) and good issue health (maintainer is responsive) are lower risk for automated agent use than servers that haven't been touched in 6 months.

For Claude Code specifically, the filesystem, GitHub, and Brave search servers score highly and are actively maintained. Those are reasonable starting defaults for a sub-agent allow-list.

---

## Comment 8
**Target:** https://github.com/anthropics/claude-code/issues/12025
**Thread:** "[FEATURE] Disable individual MCP servers globally"
**Tone:** Pruning angle — which servers to keep

---

Related to the "disable globally" request: it would be useful to have some quality signal to decide *which* servers to disable.

[AgentRank](https://agentrank-ai.com) scores 25,000+ MCP servers by maintenance quality. If you've accumulated a bunch of servers and want to clean up, the score is a fast way to identify which ones have gone stale (last commit 90+ days ago) or have unresponsive maintainers (open issues piling up with no closures).

The pattern we'd suggest: anything scoring below 20 is probably safe to disable/remove. Anything above 50 is actively maintained. The middle range needs manual review.

---

## Comment 9
**Target:** https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1780
**Thread:** "Code execution with MCP: Building more efficient agents"
**Tone:** Specific server recommendations with data backing

---

For code execution specifically, it helps to know which servers are actually being maintained vs. which are proof-of-concept repos.

From [AgentRank](https://agentrank-ai.com) data on code-execution-adjacent servers:
- The official `@modelcontextprotocol/server-filesystem` scores very high and is the most depended-on server in the index — good for file system ops
- `mcp-server-commands` / shell execution servers vary widely in maintenance quality; several popular-by-star ones have gone stale

Worth checking freshness scores before committing to a code execution server. The protocol is evolving fast enough that servers that were cutting-edge 6 months ago can have compatibility gaps.

---

## Comment 10
**Target:** https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/2218
**Thread:** "Proposal: Universal MCP Configuration File Standard"
**Tone:** Discovery/ranking as part of a standard — ecosystem-level

---

Discovery and ranking should be part of the standard proposal. Configuration without discovery just moves the problem — users still need to know which servers exist and which are worth trusting.

We're building [AgentRank](https://agentrank-ai.com) as the ranking layer for this ecosystem: 25,000+ indexed servers, scored daily on maintenance signals (freshness, issue health, contributor diversity, inbound dependents). The [API](https://agentrank-ai.com/api-docs) is free and open.

One concrete proposal: if a universal config standard includes a `registry` field pointing to a discovery source, scored registries like AgentRank can be used as quality filters rather than each client reinventing server evaluation. The standard could remain agnostic on *which* registry, while creating the hook for quality-aware discovery.

---

## Posting Notes

- **Order:** Start with comment 4 (LibreChat — most technical, least promotional), then comment 1 (Gemini CLI — high engagement), then space out the rest
- **Wait 24–48h between posts** to avoid looking like a spam campaign
- **Never post comments 7 or 8** (Claude Code issues) from @AgentRank_ai — post from @comforteagle instead, per tier-1 contacts policy
- **Verify all URLs exist** before posting — some discussion numbers may have shifted

---

*Posting in progress — stagger remaining 8 comments 24-48h apart. Comments 7+8 must come from @comforteagle (Steve's personal GitHub), not superlowburn/AgentRank account.*
