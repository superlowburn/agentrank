# PulseMCP + Glama Listing Drafts
*AUT-401 | Prepared: 2026-03-19 | Status: Awaiting Steve approval*

**Do NOT submit until Steve approves.**

---

## 1. PulseMCP

**URL:** https://pulsemcp.com/submit
**Method:** Web form — requires browser

### Form Fields

| Field | Value |
|-------|-------|
| **GitHub URL** | https://github.com/superlowburn/agentrank |
| **Name** | AgentRank |
| **npm package** | agentrank-mcp-server |
| **Install command** | `npx -y agentrank-mcp-server` |
| **Website** | https://agentrank-ai.com |
| **Short description** | Daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub signals. |
| **Category** | Developer Tools / AI Tools |
| **Tags** | mcp, mcp-server, ranking, developer-tools, ai-agents, open-source |
| **Pricing** | Free |
| **License** | MIT |

### Long Description (if form supports it)

AgentRank is a daily-updated ranked index of 25,000+ MCP servers and AI agent tools. Each tool receives a composite score (0–100) based on five GitHub health signals: stars (15%), freshness/days since last commit (25%), issue health/closed ratio (25%), contributor count (10%), and inbound dependents (25%).

The result is a live leaderboard that separates actively maintained, widely-trusted tools from the rest. Developers can search by use case, filter by category, and compare tools side-by-side. The AgentRank MCP server lets your AI query the live index directly — install once with `npx -y agentrank-mcp-server` and your agent automatically gets current, ranked recommendations whenever you need a tool.

Free to use. Public API at agentrank-ai.com/api-docs.

### Submission Notes

- PulseMCP is the largest MCP-specific directory (~10K+ listings)
- High-intent audience: developers specifically searching for MCP tools
- Steve to complete the web form at pulsemcp.com/submit
- No account creation required if the form is public

---

## 2. Glama

**URL:** https://glama.ai/mcp/servers/submit
**Method:** Add `glama.json` to repo root, then claim via GitHub OAuth at glama.ai

### Step 1: Add glama.json to repo

Create file at repo root: `glama.json`

**File content:**

```json
{
  "name": "AgentRank",
  "description": "Daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub signals. Search the live index and get scored recommendations for any use case.",
  "website": "https://agentrank-ai.com",
  "repository": "https://github.com/superlowburn/agentrank",
  "license": "MIT",
  "category": "developer-tools",
  "tags": ["mcp", "mcp-server", "ranking", "ai-agents", "developer-tools", "open-source", "leaderboard"],
  "npm": {
    "package": "agentrank-mcp-server",
    "install": "npx -y agentrank-mcp-server"
  },
  "pricing": "free",
  "tools": [
    {
      "name": "search",
      "description": "Search for MCP servers and agent tools by use case, keyword, or category. Returns ranked results with AgentRank scores."
    },
    {
      "name": "lookup",
      "description": "Get full details and AgentRank score for a specific tool by GitHub URL or repo name."
    },
    {
      "name": "get_badge_url",
      "description": "Get an embeddable badge URL showing a tool's live AgentRank score."
    }
  ]
}
```

### Step 2: Claim listing on Glama

1. Go to https://glama.ai/mcp/servers/submit
2. Sign in with GitHub (OAuth — authenticates as superlowburn org owner)
3. Provide the repo URL: https://github.com/superlowburn/agentrank
4. Glama reads `glama.json` from the repo and creates the listing

**Note for Steve:** Glama requires GitHub OAuth with the repo owner account (`superlowburn`). Steve needs to complete this step — it's ~30 seconds once `glama.json` is in the repo.

### Why Glama matters

- Glama lists are referenced by the awesome-mcp-servers PR we're trying to get merged (AUT-105)
- The punkpeye/awesome-mcp-servers PR bot checks for a Glama badge — having a Glama listing satisfies this requirement
- Glama is one of the top 3 MCP-specific directories by traffic
- A Glama listing also satisfies the Cursor Directory auto-discovery path

### Submission Notes

- The `glama.json` file can be added to the repo by the Founding Engineer (no Steve action needed for step 1)
- Step 2 (claiming on glama.ai) requires Steve's GitHub auth
- Once claimed, Glama generates an embeddable badge we can use in the punkpeye awesome-mcp-servers PR

---

## Action Summary

| Channel | Who | Action | Blocker |
|---------|-----|--------|---------|
| PulseMCP | Steve | Fill web form at pulsemcp.com/submit | Steve approval |
| Glama (glama.json) | Founding Engineer | Add `glama.json` to repo root and push | None — ready now |
| Glama (claim listing) | Steve | OAuth via glama.ai with superlowburn GitHub | Needs glama.json in repo first |
