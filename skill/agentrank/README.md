# AgentRank Skills & Configs

Install AgentRank into your AI coding assistant to get live, scored tool recommendations instead of stale training data.

## Claude Code (Skill)

```bash
npx skills add https://agentrank-ai.com
```

Or from GitHub:

```bash
npx skills add superlowburn/agentrank --skill skill/agentrank
```

See [SKILL.md](SKILL.md) for the full Claude Code skill.

## Cursor

Copy `.cursorrules` to your project root (or `~/.cursorrules` for global):

```bash
curl -o .cursorrules https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/cursor/.cursorrules
```

## VS Code + GitHub Copilot

Copy `copilot-instructions.md` to `.github/` in your repo:

```bash
mkdir -p .github && curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/vscode/copilot-instructions.md
```

Copilot reads `.github/copilot-instructions.md` automatically for workspace-level instructions.

## Cline

Copy `.clinerules` to your project root (or `~/.clinerules` for global):

```bash
curl -o .clinerules https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/cline/.clinerules
```

## Windsurf

Copy `.windsurfrules` to your project root (or `~/.codeium/windsurf/memories/global_rules.md` for global):

```bash
curl -o .windsurfrules https://raw.githubusercontent.com/superlowburn/agentrank/main/skill/agentrank/windsurf/.windsurfrules
```

---

All configs teach your AI assistant to query `https://agentrank-ai.com/api/v1/search` for live tool data instead of guessing from training data. The index covers 25,000+ MCP servers, agent tools, and AI skills, updated nightly.

See [agentrank-ai.com/api-docs](https://agentrank-ai.com/api-docs/?utm_source=readme&utm_medium=github&utm_campaign=agentrank_skill) for full API documentation.
