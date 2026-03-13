# AgentRank v2 Design Spec

## Vision
AgentRank is the reputation and discovery layer for the AI agent ecosystem. Not just MCP servers — skills, tools, and agents.

## Architecture

### Three-Tab Site
- **Skills** (homepage `/`): Ranked by real adoption data from registries
- **Tools** (`/tools`): Existing MCP server leaderboard from GitHub signals
- **Agents** (`/agents`): Self-registration page for future agent-to-agent commerce

### Data Sources
| Source | Type | Signals |
|--------|------|---------|
| skills.sh | Skills registry | 88K+ installs, 21 platforms, trending/hot |
| Glama.ai | MCP registry | 19K servers, weekly downloads, quality grades |
| ClawHub | OpenClaw registry | Install counts via REST API |
| GitHub | Code hosting | Stars, freshness, issues, contributors, forks |

### Database
- **SQLite** (local): `repos`, `skills`, `agents` tables — used by crawler + scorer
- **Cloudflare D1** (remote): `tools`, `skills`, `agents` — read by site at runtime

### Skills Scoring (0-100)
With GitHub linked:
- Installs 30%, Freshness 20%, Issue Health 15%, Stars 10%, Platform Breadth 10%, Contributors 10%, Description 5%

Without GitHub:
- Installs 67%, Platform Breadth 22%, Description 11%

### Tools Scoring (unchanged from v1)
8 signals: Stars, Freshness, Issue Health, Contributors, Dependents, Forks, Description, License

### Pipeline
```
crawl (GitHub + skills.sh + Glama + ClawHub)
  → score (tools + skills)
  → seed D1
  → build + deploy site
```

### Agent Registration
- Form POST or JSON POST to `/api/register-agent`
- Writes to D1 `agents` table with `status: 'pending'`
- Manual review for v1, automated later
- Agents can self-register programmatically

## File Map
| File | Purpose |
|------|---------|
| `crawler/src/skills.ts` | skills.sh crawler |
| `crawler/src/glama.ts` | Glama.ai crawler |
| `crawler/src/clawhub.ts` | ClawHub crawler |
| `scorer/src/skills-scorer.ts` | Skills scoring engine |
| `site/src/pages/index.astro` | Skills leaderboard (homepage) |
| `site/src/pages/tools.astro` | Tools leaderboard |
| `site/src/pages/agents.astro` | Agent registration |
| `site/src/pages/skill/[slug].astro` | Skill detail page |
| `site/src/pages/api/register-agent.ts` | Agent registration API |
