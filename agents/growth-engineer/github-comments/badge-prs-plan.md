# AgentRank Badge PRs — Draft Plan

**Status:** Pending Steve approval before opening any PRs.
**Account:** PRs will be opened from `superlowburn` (authenticated GitHub account).

All 10 PRs add a single badge line to the repo's existing badge section. Non-spammy: one per repo, professional tone, no modifications beyond adding the badge.

---

## PR Template

**Title:** `Add AgentRank score badge`

**Body:**
```markdown
Hi! I'm adding an [AgentRank](https://agentrank-ai.com) score badge to your README.

AgentRank is an independent index of 25,000+ MCP servers, ranked daily by real GitHub signals (freshness, issue health, contributors, dependents). **{REPO_NAME} is currently ranked #{RANK} out of 25,632 indexed servers** with a score of {SCORE}/100.

The badge updates daily and links to your AgentRank profile page where maintainers can also claim their listing.

[![AgentRank](https://agentrank-ai.com/api/badge/tool/{SLUG})](https://agentrank-ai.com/tool/{SLUG}/)

Happy to adjust placement if you have a preferred spot in the README. Feel free to close if not interested.
```

---

## The 10 PRs

### 1. CoplayDev/unity-mcp — Rank #1, Score 98.67

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/CoplayDev--unity-mcp)](https://agentrank-ai.com/tool/CoplayDev--unity-mcp/)
```

**Placement:** After the existing shield.io badge block (after `[![](https://img.shields.io/badge/License-MIT...`).

**Existing badge pattern in README:**
```
[![Discord](https://img.shields.io/badge/discord-join-red.svg...
[![](https://img.shields.io/badge/Website-Visit-purple...
[![](https://img.shields.io/badge/Unity-000000...
[![Unity Asset Store](https://img.shields.io/badge/Unity%20Asset%20Store...
[![python](https://img.shields.io/badge/Python...
[![](https://badge.mcpx.dev?status=on...
[![](https://img.shields.io/badge/License-MIT...   ← add after this line
```

---

### 2. microsoft/azure-devops-mcp — Rank #2, Score 97.17

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/microsoft--azure-devops-mcp)](https://agentrank-ai.com/tool/microsoft--azure-devops-mcp/)
```

**Placement:** After the VS Code install badges at the top.

**Note:** Microsoft repo — may be harder to get merged. Still worth opening for the backlink.

---

### 3. laravel/boost — Rank #3, Score 96.94

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/laravel--boost)](https://agentrank-ai.com/tool/laravel--boost/)
```

**Placement:** Inside the `<p align="center">` badge block, after the license badge:
```html
<a href="https://packagist.org/packages/laravel/boost"><img src="https://img.shields.io/packagist/l/laravel/boost?v=1" alt="License"></a>
<a href="https://agentrank-ai.com/tool/laravel--boost/"><img src="https://agentrank-ai.com/api/badge/tool/laravel--boost" alt="AgentRank"></a>   ← add this
```

---

### 4. CoderGamester/mcp-unity — Rank #4, Score 96.26

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/CoderGamester--mcp-unity)](https://agentrank-ai.com/tool/CoderGamester--mcp-unity/)
```

**Placement:** After the existing badge block (after the License badge line).

---

### 5. mark3labs/mcp-go — Rank #5, Score 96.24

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/mark3labs--mcp-go)](https://agentrank-ai.com/tool/mark3labs--mcp-go/)
```

**Placement:** After existing badges (Build, Go Report Card, GoDoc) inside `<div align="center">`.

---

### 6. Pimzino/spec-workflow-mcp — Rank #6, Score 95.89

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/Pimzino--spec-workflow-mcp)](https://agentrank-ai.com/tool/Pimzino--spec-workflow-mcp/)
```

**Placement:** After npm and VSCode badge block at top.

---

### 7. PrefectHQ/fastmcp — Rank #7, Score 94.95

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/PrefectHQ--fastmcp)](https://agentrank-ai.com/tool/PrefectHQ--fastmcp/)
```

**Placement:** After Docs and Discord badges inside the `<div align="center">`.

---

### 8. zcaceres/markdownify-mcp — Rank #8, Score 94.60

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/zcaceres--markdownify-mcp)](https://agentrank-ai.com/tool/zcaceres--markdownify-mcp/)
```

**Placement:** After the existing Glama badge (`<a href="https://glama.ai/mcp/servers/bn5q4b0ett">`). The README already has a Glama badge in similar format — add AgentRank badge right after it.

---

### 9. samanhappy/mcphub — Rank #9, Score 94.37

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/samanhappy--mcphub)](https://agentrank-ai.com/tool/samanhappy--mcphub/)
```

**Placement:** Add a badges line after the title/tagline, before the Live Demo section.

---

### 10. microsoft/playwright-mcp — Rank #10, Score 94.23

**Badge:**
```
[![AgentRank](https://agentrank-ai.com/api/badge/tool/microsoft--playwright-mcp)](https://agentrank-ai.com/tool/microsoft--playwright-mcp/)
```

**Placement:** After the `## Playwright MCP` heading and intro paragraph, before the comparison table.

**Note:** Microsoft repo — may be harder to get merged. Still creates a pending PR that shows up as a backlink signal.

---

## Tracking

Once PRs are opened, track in `badge-pr-tracking.md`:
- URL of PR
- Date opened
- Status (open / merged / closed)

Merged PRs = permanent backlinks to agentrank-ai.com.
