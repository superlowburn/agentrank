# MCP Directory Submission Drafts — AUT-313

*Prepared: 2026-03-19*
*Status: Awaiting Steve approval before any submission goes live*

**npm package:** `agentrank-mcp-server` (not `@anthropic/agentrank-mcp-server` — task description had wrong package name)
**Install command:** `npx agentrank-mcp-server`
**GitHub:** https://github.com/superlowburn/agentrank
**Website:** https://agentrank-ai.com

---

## 1. mcp.so

**Method:** Post a comment on the submission issue at github.com/chatmcp/mcp-directory/issues/1
**Status:** Ready to submit — pending Steve approval

### Comment draft:

```
**AgentRank** — Google PageRank for MCP servers

- **GitHub:** https://github.com/superlowburn/agentrank
- **npm:** `npx agentrank-mcp-server`
- **Website:** https://agentrank-ai.com

Daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub health signals (stars, freshness, issue health, contributors, dependents). Free API + MCP server. Scores update nightly.
```

**To submit:** `gh issue comment 1 --repo chatmcp/mcp-directory --body "..."` (with above content)

---

## 2. PulseMCP

**Method:** Web form at https://pulsemcp.com/submit
**Status:** Ready to draft — web form requires human/browser

### Form fields to fill:

- **GitHub URL:** https://github.com/superlowburn/agentrank
- **Name:** AgentRank
- **Description:** AgentRank ranks and scores 25,000+ MCP servers and AI agent tools using real GitHub health signals. Free API + MCP server.
- **Website:** https://agentrank-ai.com
- **npm package:** agentrank-mcp-server
- **Install:** `npx agentrank-mcp-server`
- **Category:** Developer Tools / AI Tools
- **Tags:** mcp, mcp-server, ranking, developer-tools, ai-agents

**Note:** PulseMCP submission at pulsemcp.com/submit is a web form requiring browser. Steve to complete directly or use browser automation.

---

## 3. mcpservers.org

**Method:** Web form at https://mcpservers.org/submit
**Status:** Ready to draft — web form requires human/browser

### Form fields to fill:

- **Name:** AgentRank
- **GitHub:** https://github.com/superlowburn/agentrank
- **Website:** https://agentrank-ai.com
- **Short Description:** Daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub signals.
- **Full Description:** AgentRank crawls GitHub nightly and ranks every MCP server and AI agent tool using five composite signals: stars, freshness (days since last commit), issue health, contributor count, and inbound dependents. Composite score 0–100, updated daily. Free public API + MCP server.
- **npm:** agentrank-mcp-server
- **Install:** `npx agentrank-mcp-server`
- **Category:** Developer Tools
- **Tags:** mcp, mcp-server, ranking, ai-agents, developer-tools

**Note:** Web form requires browser. Steve to complete or approve browser automation.

---

## 4. Cursor Directory

**Method:** Unclear — cursor.directory appears to auto-discover from npm or has a web form. No public GitHub repo for PR submissions found.
**Status:** Needs research + approval

### Investigation findings:
- cursor.directory lists MCP servers but I couldn't find a public GitHub repo for PR submissions
- Some tools (e.g. loganalyzer-mcp) link to cursor.directory in their GitHub homepage — may be auto-discovered from npm
- cursor.directory may have a "submit" form at cursor.directory/mcp or similar

### Draft description (for web form or PR if repo is found):

```
**Name:** AgentRank
**npm:** agentrank-mcp-server
**Install:** npx agentrank-mcp-server
**GitHub:** https://github.com/superlowburn/agentrank
**Description:** Google PageRank for AI agents. Daily-updated ranked index of 25,000+ MCP servers and AI agent tools, scored by real GitHub health signals. Search and query rankings from any MCP client.
**Category:** Developer Tools
**Tags:** mcp, ranking, ai-tools, agent-tools
```

**Action needed:** Visit cursor.directory to find the submission/contribute page.

---

## 5. AlternativeTo

**Method:** Register at alternativeto.net, then submit via "Add new application"
**Status:** BLOCKED — Cloudflare Turnstile CAPTCHA on signup requires human

From prior AUT-240 research:
- Site has CAPTCHA that blocks automation
- Free listing approved in 1–2 days after registration
- High value: DR 79, pages rank well for "[tool] alternatives" queries

### Draft listing (for Steve to submit):

See: `agents/growth-engineer/directory-submissions/alternativeto.md` (already prepared in AUT-240)

**Action needed:** Steve to create AlternativeTo account and submit using the draft in alternativeto.md.

---

## Submission Tracking

| Directory | Submission Method | Blocker | Status |
|-----------|------------------|---------|--------|
| mcp.so | GitHub issue comment (automated) | Steve approval | Pending approval |
| PulseMCP | Web form (pulsemcp.com/submit) | Steve approval + browser | Pending approval |
| mcpservers.org | Web form (mcpservers.org/submit) | Steve approval + browser | Pending approval |
| Cursor Directory | Unknown (web form or PR) | Research + Steve approval | Needs research |
| AlternativeTo | Web form (CAPTCHA) | Steve approval + CAPTCHA | Pending approval |

---

## Recommended Approval Action

Once Steve approves:
1. **mcp.so** — I can submit via GitHub API immediately
2. **PulseMCP + mcpservers.org + Cursor Directory** — Steve or web automation needed
3. **AlternativeTo** — Steve to create account + submit manually
