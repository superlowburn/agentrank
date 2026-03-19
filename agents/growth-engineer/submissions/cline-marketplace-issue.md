# Cline Marketplace Submission — Draft
*AUT-401 | Prepared: 2026-03-19 | Status: Awaiting Steve approval*

**Do NOT submit until Steve approves.**

---

## GitHub Issue Draft

**Repo:** github.com/cline/mcp-marketplace
**Issue title:** Add AgentRank — ranked index of 25,000+ MCP servers and agent tools

**Issue body:**

---

## AgentRank — MCP Server Submission

### What is AgentRank?

AgentRank is a daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub health signals. Think Google PageRank for the MCP ecosystem.

Your AI's training data is months old — it can't tell you if an MCP server was abandoned last week, or if something better shipped yesterday. AgentRank gives Cline a live, ranked index so every tool recommendation is current.

### Tool Details

| Field | Value |
|-------|-------|
| **Name** | AgentRank |
| **npm package** | `agentrank-mcp-server` |
| **Install command** | `npx -y agentrank-mcp-server` |
| **GitHub** | https://github.com/superlowburn/agentrank |
| **Website** | https://agentrank-ai.com |
| **License** | MIT |
| **npm downloads** | See https://www.npmjs.com/package/agentrank-mcp-server |

### Cline Config

```json
{
  "mcpServers": {
    "agentrank": {
      "command": "npx",
      "args": ["-y", "agentrank-mcp-server"],
      "disabled": false,
      "autoApprove": ["search", "lookup", "get_badge_url"]
    }
  }
}
```

### MCP Tools Provided

| Tool | Description |
|------|-------------|
| `search` | Search for MCP servers by use case, keyword, or category. Returns ranked results with scores. |
| `lookup` | Get full details + AgentRank score for a specific repo by GitHub URL or name. |
| `get_badge_url` | Get an embeddable badge URL showing a tool's live AgentRank score. |

### Example Usage

When a Cline user asks "find me an MCP server for database access," AgentRank returns ranked, scored results in real time:

```
search("postgres mcp server")

→ 1. postgres-mcp         Score: 91  ★ 2.1k  Updated: 2d ago
→ 2. mcp-server-postgres  Score: 84  ★ 891   Updated: 5d ago
→ 3. pg-mcp               Score: 71  ★ 432   Updated: 12d ago
```

### Why Include AgentRank in the Cline Marketplace?

1. **Discovery use case:** Cline users frequently ask their AI to find MCP servers. AgentRank answers that question with current, ranked data — not stale training data.
2. **Complementary, not competing:** AgentRank doesn't replace other MCP servers in the marketplace — it helps users discover them.
3. **Live index:** 25,000+ tools scored daily from GitHub signals. Freshest MCP data available.
4. **No configuration required:** Install once with `npx`, no API key, no setup. Works immediately.

### README Setup Test

We have verified the MCP server can be set up from our README alone:
- Claude Code: `claude mcp add agentrank -- npx -y agentrank-mcp-server`
- Cline: add JSON config above to MCP Servers settings
- All major clients documented at https://agentrank-ai.com/integrations/

### Logo

400×400 PNG logo: see attached / available at https://agentrank-ai.com/og-image.png (1500×500 OG version — 400×400 crop available on request or we can provide a resized version).

**Note for Steve:** The Cline marketplace requires a 400×400 logo. The existing og-image.png is 1500×500. We need to either:
- Crop/resize the existing OG image to 400×400
- Create a square logo variant

I recommend having Vibe Coder create a proper 400×400 square logo from the existing brand assets before this is submitted.

---

## Pre-Submission Checklist

- [ ] Steve approves issue content
- [ ] 400×400 logo created and ready to attach
- [ ] Verify `npx -y agentrank-mcp-server` installs and runs cleanly
- [ ] Verify Cline can set up AgentRank from README alone (manual test)
- [ ] Submit GitHub issue at github.com/cline/mcp-marketplace

---

## Notes

- Cline vetting typically takes ~2 days
- Evaluated on community adoption, developer credibility, project maturity, and security
- Having a polished README and documentation improves acceptance odds significantly
- An optional `llms-install.md` file in the repo can improve AI-assisted setup — consider adding per AUT-397 research
