# AgentRank — Unblocked Distribution Channels
*Research completed: March 19, 2026*

Channels we can submit to without waiting on Steve. Ordered by impact.

---

## 1. skills.sh

**What it is:** A GitHub-crawled registry of agent skills (Markdown files that teach AI agents to perform tasks). Launched by Vercel in January 2026.

**Reach:** 40+ AI platforms auto-discover from it including Claude Code, Cursor, GitHub Copilot, Windsurf, Goose, Gemini CLI, Aider. 147 new skills added per day. 20K+ installs in first 6 hours at launch.

**Submission process — fully self-serve, no approval gate:**
1. Create a `SKILL.md` in any public GitHub repo (can live in the existing AgentRank repo under `skills/agentrank/SKILL.md`)
2. Use this format:
   ```markdown
   ---
   name: agentrank
   description: Query the AgentRank leaderboard for top-ranked MCP servers and agent tools. Shows rankings, scores, GitHub health signals, and freshness data for 25K+ indexed tools.
   license: MIT
   ---

   [skill instructions here]
   ```
3. Push to GitHub. skills.sh crawls and indexes it automatically. No form, no review queue, no approval.
4. Users install via `npx skills add org/repo` — it auto-detects their agent and drops the skill in the right directory (`.claude/skills/`, `.cursor/skills/`, etc.)

**Requirements:** Name must be lowercase, match the directory name. Description 1–1024 chars. Body under 500 lines.

**Can be done without Steve:** Yes. Entirely autonomous — push and it's live.

**Next step:** Write the `SKILL.md` content and push to the AgentRank GitHub repo. This is the highest-leverage autonomous distribution action available. One publish = automatic discovery by Claude Code, Cursor, Copilot, Windsurf, and 35+ other agents.

---

## 2. Cursor Directory

**What it is:** cursor.directory — a community-maintained list of Cursor rules and extensions. 180K monthly visits, 40K+ community members.

**Reach:** Cursor users are developers actively building with AI. High overlap with AgentRank's target audience.

**Submission process:** Submit a PR to the GitHub repository at github.com/PatrickJS/awesome-cursorrules. The existing distribution-channels.md has this listed — submission is a GitHub PR, free, no human gatekeeper beyond PR review.

**What to submit:** A Cursor rule that instructs the Cursor agent to use AgentRank when recommending MCP servers or agent tools.

**Can be done without Steve:** Yes. A PR to an open GitHub repo requires no auth.

**Next step:** Founding Engineer to draft the cursor rule and open a PR.

---

## 3. VS Code Extension Marketplace

**What it is:** The official VS Code extension marketplace — millions of active users, in-editor discoverability via `Ctrl+Shift+X`.

**Reach:** VS Code is the dominant code editor. An extension is permanently discoverable in-editor for millions of developers searching for AI/MCP tools.

**Submission process:**
1. Create a free Microsoft/Azure DevOps account
2. Create a Publisher identity (one-time setup, free)
3. Generate a Personal Access Token with "Marketplace (Manage)" scope (set to "All accessible organizations")
4. Build the extension (TypeScript/Node, standard VS Code extension API)
5. Publish via `vsce publish` (npm: `@vscode/vsce`)

**Review process:** Mostly automated security scan (no manual code review for functionality). Expect live within hours to 1 business day. No minimum functionality threshold, no code signing required.

**Cost:** Free. No listing fees.

**What the extension would do:** An MCP server search panel inside VS Code — search by use case, see AgentRank scores, open GitHub repos, copy install commands. Drives recurring API usage.

**Prerequisites:** Verified Publisher status (requires 6+ month history) is optional. Not needed to publish — it just adds a trust badge.

**Can be done without Steve:** Yes, but requires development effort (2–3 days for a basic MVP).

**Next step:** Founding Engineer to build an MVP extension. Submit after the leaderboard is solid and the API is stable.

**Verdict:** High reach, moderate effort. Do after skills.sh and Cline (lower-effort channels first).

---

## 4. Cline Marketplace

**What it is:** Official MCP Marketplace built into Cline (cline.bot), the dominant open-source coding assistant. One-click install for users, curated by the Cline team.

**Reach:** Millions of Cline users. Direct in-editor discovery — the highest-conversion distribution surface for MCP servers.

**Submission process:**
1. Open a GitHub issue at github.com/cline/mcp-marketplace
2. Include: GitHub repo URL, a 400×400 PNG logo, reason for addition, confirmation that you've tested Cline can set up your MCP server from your README alone
3. Optional but helpful: add an `llms-install.md` to the repo with additional setup guidance for AI agents

**Review:** Vetting happens within ~2 days. Evaluated on community adoption, developer credibility, project maturity, and security. No star minimum, but mature projects with good documentation do better.

**Can be done without Steve:** Yes — it's a GitHub issue, not a form requiring account auth. The Founding Engineer can submit.

**Next step:** Open the issue at cline/mcp-marketplace. Make sure the AgentRank MCP server README is excellent before submitting. Create the 400×400 PNG logo asset.

---

## 5. Roo Code / Roo Cline

**What it is:** Roo Code (formerly Roo Cline) is a VS Code extension fork of Cline. No official marketplace — relies on config files and community registries.

**Reach:** Significant user base but smaller than Cline. Config-based installation.

**Submission process:** No central marketplace to submit to. Roo Code users discover MCP servers through:
- Smithery (submit at smithery.ai/new — already in progress per AUT-21)
- Official MCP Registry (registry.modelcontextprotocol.io — already in progress per AUT-21)
- awesome-mcp-servers (PR-based, already tracked)
- Project-level `.roo/mcp.json` config (users add manually)

**Can be done without Steve:** Yes, via the registries listed above (most already tracked).

**Next step:** No unique submission action required beyond existing registry submissions. Being in Smithery and the official MCP registry covers Roo Code users automatically.

---

## 6. Additional Self-Serve Channels (Quick Wins)

These can all be done without Steve in under 30 minutes each:

| Channel | Submission | Time | Priority |
|---------|------------|------|----------|
| **PulseMCP** (pulsemcp.com/submit) | Form — provide GitHub URL | 5 min | High |
| **Glama** (glama.ai/mcp) | Add `glama.json` to repo root, claim via GitHub auth | 10 min | High |
| **mcp.so** | GitHub issue at chatmcp/mcp-directory | 5 min | High |
| **mcpservers.org** | Submit form at mcpservers.org/submit | 5 min | Medium |
| **SaaSHub** (saashub.com) | Self-serve listing; good "alternatives" SEO | 15 min | Medium |
| **DevHunt** (devhunt.org) | Submit to start 6-week queue; or $49 to skip | 10 min | Medium |
| **Ben's Bites News** (news.bensbites.com) | Community submit form | 5 min | Medium |
| **mahseema/awesome-ai-tools** | Open PR to GitHub repo | 10 min | Medium |
| **public-apis/public-apis** (300K stars) | Open PR — after API docs are live | 10 min | Medium |
| **APIs.guru** | Submit OpenAPI spec — after API docs are live | 15 min | Medium |

---

## Prioritized Action List

Everything below requires no approval from Steve and can be completed by the engineering team autonomously:

### Immediate (this sprint)

1. **Write and push `SKILL.md` to AgentRank GitHub repo** — unlocks skills.sh auto-indexing across 40+ platforms. Founding Engineer. Highest-leverage autonomous action.
2. **Open Cline marketplace issue** — include a polished README and logo. 2-day review. High conversion channel.
3. **Submit to PulseMCP** — 5 minutes, form submit. Already tracked, do now.
4. **Add `glama.json` to repo** — 10 minutes, GitHub auth. Already tracked, do now.
5. **Submit GitHub issue to mcp.so** — 5 minutes. Already tracked, do now.

### This week

6. **Cursor rules directory PR** — draft a useful AgentRank cursor rule, submit PR.
7. **SaaSHub listing** — position as alternative to raw GitHub search and Smithery.
8. **DevHunt submission** — start the queue now; 6 weeks to feature.
9. **Ben's Bites community submit** — quick, free, decent reach.
10. **awesome-ai-tools PR** — mahseema/awesome-ai-tools on GitHub.

### After API docs are live

11. **public-apis/public-apis PR** — 300K GitHub stars; huge SEO value.
12. **APIs.guru** — requires valid OpenAPI spec.
13. **RapidAPI Hub** — self-serve, enables monetization.

### After skills.sh and Cline are live (VS Code extension)

14. **VS Code extension marketplace** — 2–3 days dev work for MVP search panel. Highest-effort item but permanent in-editor discoverability for millions of developers.

---

## What Remains Blocked on Steve

For reference — these are high-impact but require Steve:

- **Reddit/HN posts** (AUT-28) — drafts ready, just needs posting
- **Official MCP Registry device auth** (AUT-21) — 30 seconds of interaction
- **Smithery auth** (AUT-21) — same device auth flow
- **Product Hunt launch** — Steve needs to be author/maker
- **TAAFT (There's An AI For That)** — monthly X thread, Steve's account
