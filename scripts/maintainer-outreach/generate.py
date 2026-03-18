#!/usr/bin/env python3
"""
Generate maintainer outreach templates for top-50 AgentRank tools.
Outputs:
  - github-issues.md  (all 50 GitHub issue drafts)
  - tweets.md         (tweet templates for all 50)
"""

import math
from datetime import datetime, timezone

# Current date (as of this generation run)
NOW = datetime(2026, 3, 18, tzinfo=timezone.utc)

# Top 50 tools from DB (rank, full_name, url, score, stars, open_issues, closed_issues, contributors, dependents, language, last_commit_at)
TOOLS = [
    (1, "PrefectHQ/fastmcp", "https://github.com/PrefectHQ/fastmcp", 90.74, 23659, 235, 1153, 208, 7718, "Python", "2026-03-14T01:05:31Z"),
    (2, "mark3labs/mcp-go", "https://github.com/mark3labs/mcp-go", 88.43, 8353, 27, 239, 170, 2938, "Go", "2026-03-11T01:48:38Z"),
    (3, "laravel/boost", "https://github.com/laravel/boost", 84.34, 3333, 21, 266, 76, 1032, "PHP", "2026-03-13T09:56:18Z"),
    (4, "modelcontextprotocol/go-sdk", "https://github.com/modelcontextprotocol/go-sdk", 80.92, 4120, 45, 290, 96, 1009, "Go", "2026-03-13T11:04:50Z"),
    (5, "punkpeye/mcp-proxy", "https://github.com/punkpeye/mcp-proxy", 78.50, 241, 4, 21, 21, 1280, "TypeScript", "2026-03-13T23:43:53Z"),
    (6, "mcp-use/mcp-use", "https://github.com/mcp-use/mcp-use", 77.83, 9434, 73, 231, 36, 377, "TypeScript", "2026-03-13T13:34:31Z"),
    (7, "punkpeye/fastmcp", "https://github.com/punkpeye/fastmcp", 76.44, 2993, 38, 87, 56, 1296, "TypeScript", "2026-03-06T09:21:40Z"),
    (8, "modelcontextprotocol/ruby-sdk", "https://github.com/modelcontextprotocol/ruby-sdk", 76.36, 751, 12, 35, 41, 1570, "Ruby", "2026-03-12T03:26:40Z"),
    (9, "modelcontextprotocol/inspector", "https://github.com/modelcontextprotocol/inspector", 75.26, 9041, 196, 400, 137, 912, "TypeScript", "2026-03-11T15:29:11Z"),
    (10, "kreuzberg-dev/kreuzberg", "https://github.com/kreuzberg-dev/kreuzberg", 74.69, 6698, 34, 187, 26, 40, "Rust", "2026-03-13T19:53:03Z"),
    (11, "NVIDIA/NeMo-Agent-Toolkit", "https://github.com/NVIDIA/NeMo-Agent-Toolkit", 74.06, 1917, 41, 299, 74, 42, "Python", "2026-03-14T01:34:07Z"),
    (12, "nickclyde/duckduckgo-mcp-server", "https://github.com/nickclyde/duckduckgo-mcp-server", 70.77, 884, 1, 16, 8, 14, "Python", "2026-03-09T00:05:55Z"),
    (13, "rust-mcp-stack/rust-mcp-sdk", "https://github.com/rust-mcp-stack/rust-mcp-sdk", 70.36, 159, 2, 21, 8, 56, "Rust", "2026-03-13T19:33:50Z"),
    (14, "mongodb-js/mongodb-mcp-server", "https://github.com/mongodb-js/mongodb-mcp-server", 70.14, 959, 31, 156, 25, 31, "TypeScript", "2026-03-14T00:15:50Z"),
    (15, "logiscape/mcp-sdk-php", "https://github.com/logiscape/mcp-sdk-php", 69.74, 363, 0, 20, 14, 24, "PHP", "2026-03-13T03:12:26Z"),
    (16, "gts360/django-mcp-server", "https://github.com/gts360/django-mcp-server", 68.72, 286, 8, 34, 11, 30, "Python", "2026-03-10T10:38:28Z"),
    (17, "TanStack/cli", "https://github.com/TanStack/cli", 68.63, 1212, 15, 127, 89, 5, "TypeScript", "2026-03-07T05:45:43Z"),
    (18, "getsentry/XcodeBuildMCP", "https://github.com/getsentry/XcodeBuildMCP", 68.50, 4720, 12, 98, 32, 4, "TypeScript", "2026-03-12T08:55:48Z"),
    (19, "brightdata/brightdata-mcp", "https://github.com/brightdata/brightdata-mcp", 68.15, 2202, 9, 37, 15, 17, "JavaScript", "2026-03-11T06:49:30Z"),
    (20, "CoplayDev/unity-mcp", "https://github.com/CoplayDev/unity-mcp", 68.04, 7003, 16, 353, 43, 0, "C#", "2026-03-12T05:55:17Z"),
    (21, "duriantaco/skylos", "https://github.com/duriantaco/skylos", 67.85, 332, 3, 51, 2, 11, "Python", "2026-03-11T00:35:42Z"),
    (22, "antvis/mcp-server-chart", "https://github.com/antvis/mcp-server-chart", 67.82, 3809, 6, 153, 21, 7, "TypeScript", "2026-02-25T14:04:08Z"),
    (23, "bytebase/dbhub", "https://github.com/bytebase/dbhub", 67.61, 2302, 5, 124, 22, 2, "TypeScript", "2026-03-12T18:21:05Z"),
    (24, "modelcontextprotocol/rust-sdk", "https://github.com/modelcontextprotocol/rust-sdk", 66.87, 3165, 19, 223, 143, 2, "Rust", "2026-03-13T20:04:33Z"),
    (25, "microsoft/playwright-mcp", "https://github.com/microsoft/playwright-mcp", 66.84, 28849, 22, 743, 62, 0, "TypeScript", "2026-03-14T01:23:11Z"),
    (26, "oraios/serena", "https://github.com/oraios/serena", 66.62, 21474, 86, 497, 134, 0, "Python", "2026-03-13T12:14:09Z"),
    (27, "Flux159/mcp-server-kubernetes", "https://github.com/Flux159/mcp-server-kubernetes", 66.07, 1348, 10, 83, 40, 11, "TypeScript", "2026-03-01T18:50:21Z"),
    (28, "bgauryy/octocode-mcp", "https://github.com/bgauryy/octocode-mcp", 65.62, 750, 3, 20, 6, 4, "TypeScript", "2026-03-13T10:00:22Z"),
    (29, "Pimzino/spec-workflow-mcp", "https://github.com/Pimzino/spec-workflow-mcp", 65.57, 3999, 3, 130, 21, 0, "TypeScript", "2026-03-07T00:05:39Z"),
    (30, "tavily-ai/tavily-mcp", "https://github.com/tavily-ai/tavily-mcp", 65.46, 1380, 13, 26, 14, 27, "JavaScript", "2026-03-13T19:29:53Z"),
    (31, "microsoft/mcp-for-beginners", "https://github.com/microsoft/mcp-for-beginners", 65.30, 15374, 15, 58, 56, 0, "Jupyter Notebook", "2026-03-14T02:07:35Z"),
    (32, "microsoft/azure-devops-mcp", "https://github.com/microsoft/azure-devops-mcp", 65.17, 1406, 14, 425, 45, 0, "TypeScript", "2026-03-12T19:03:03Z"),
    (33, "maquina-app/rails-mcp-server", "https://github.com/maquina-app/rails-mcp-server", 64.95, 514, 4, 11, 9, 12, "Ruby", "2026-03-09T20:15:50Z"),
    (34, "mark3labs/mcphost", "https://github.com/mark3labs/mcphost", 64.89, 1575, 19, 61, 25, 18, "Go", "2026-02-26T13:42:27Z"),
    (35, "korotovsky/slack-mcp-server", "https://github.com/korotovsky/slack-mcp-server", 64.87, 1448, 54, 67, 40, 37, "Go", "2026-03-12T17:16:35Z"),
    (36, "zcaceres/markdownify-mcp", "https://github.com/zcaceres/markdownify-mcp", 64.63, 2449, 0, 25, 9, 0, "TypeScript", "2026-03-09T17:55:46Z"),
    (37, "apify/apify-mcp-server", "https://github.com/apify/apify-mcp-server", 64.36, 899, 45, 129, 25, 4, "TypeScript", "2026-03-13T23:52:38Z"),
    (38, "modelcontextprotocol/php-sdk", "https://github.com/modelcontextprotocol/php-sdk", 64.32, 1406, 27, 50, 32, 35, "PHP", "2026-03-13T13:39:13Z"),
    (39, "perplexityai/modelcontextprotocol", "https://github.com/perplexityai/modelcontextprotocol", 63.90, 2016, 1, 42, 13, 0, "TypeScript", "2026-03-06T17:52:59Z"),
    (40, "awslabs/mcp", "https://github.com/awslabs/mcp", 63.87, 8450, 213, 399, 243, 4, "Python", "2026-03-14T01:38:31Z"),
    (41, "IBM/mcp-context-forge", "https://github.com/IBM/mcp-context-forge", 63.87, 3408, 854, 1063, 139, 5, "Python", "2026-03-14T03:09:10Z"),
    (42, "googleapis/genai-toolbox", "https://github.com/googleapis/genai-toolbox", 63.78, 13411, 198, 356, 109, 2, "Go", "2026-03-14T00:00:50Z"),
    (43, "CoderGamester/mcp-unity", "https://github.com/CoderGamester/mcp-unity", 63.58, 1412, 4, 65, 20, 0, "C#", "2026-03-10T22:38:08Z"),
    (44, "microsoft/mcp", "https://github.com/microsoft/mcp", 63.41, 2773, 310, 527, 133, 4, "C#", "2026-03-14T01:28:33Z"),
    (45, "domdomegg/airtable-mcp-server", "https://github.com/domdomegg/airtable-mcp-server", 63.16, 428, 6, 26, 10, 5, "TypeScript", "2026-03-07T23:51:38Z"),
    (46, "cloudflare/mcp-server-cloudflare", "https://github.com/cloudflare/mcp-server-cloudflare", 62.92, 3527, 28, 73, 36, 10, "TypeScript", "2026-03-09T14:43:14Z"),
    (47, "vercel/mcp-handler", "https://github.com/vercel/mcp-handler", 62.91, 573, 25, 40, 24, 228, "TypeScript", "2026-02-20T18:23:54Z"),
    (48, "CodeGraphContext/CodeGraphContext", "https://github.com/CodeGraphContext/CodeGraphContext", 62.82, 2009, 132, 308, 84, 2, "Python", "2026-03-13T16:40:37Z"),
    (49, "ihor-sokoliuk/mcp-searxng", "https://github.com/ihor-sokoliuk/mcp-searxng", 62.76, 528, 5, 28, 15, 5, "TypeScript", "2026-03-11T22:48:56Z"),
    (50, "samanhappy/mcphub", "https://github.com/samanhappy/mcphub", 62.56, 1876, 31, 228, 23, 0, "TypeScript", "2026-03-13T22:54:27Z"),
]

AGENTRANK_BASE = "https://agentrank-ai.com/tool"
AGENTRANK_HOME = "https://agentrank-ai.com"
UTM_GITHUB = "?utm_source=github_issue&utm_medium=outreach&utm_campaign=maintainer_notify"


def days_since(date_str):
    dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    return (NOW - dt).days


def freshness_label(days):
    if days <= 7:
        return "active (committed within 7 days)"
    elif days <= 30:
        return f"active (last commit {days} days ago)"
    elif days <= 90:
        return f"moderate (last commit {days} days ago)"
    else:
        return f"stale (last commit {days} days ago — worth bumping)"


def issue_health_label(open_issues, closed_issues):
    total = open_issues + closed_issues
    if total == 0:
        return "n/a (no issues filed)"
    ratio = closed_issues / total
    pct = round(ratio * 100)
    if ratio >= 0.80:
        return f"excellent ({pct}% of issues resolved)"
    elif ratio >= 0.60:
        return f"good ({pct}% of issues resolved)"
    elif ratio >= 0.40:
        return f"fair ({pct}% of issues resolved)"
    else:
        return f"room to improve ({pct}% of issues resolved — {open_issues} open)"


def contributors_label(n):
    if n >= 100:
        return f"thriving ({n} contributors)"
    elif n >= 20:
        return f"healthy ({n} contributors)"
    elif n >= 5:
        return f"small team ({n} contributors)"
    else:
        return f"solo/micro ({n} contributors)"


def dependents_label(n):
    if n >= 1000:
        return f"highly adopted ({n:,} dependents)"
    elif n >= 100:
        return f"well adopted ({n:,} dependents)"
    elif n >= 10:
        return f"growing ({n} dependents)"
    elif n > 0:
        return f"early ({n} dependents)"
    else:
        return "not yet tracked by GitHub dependency graph"


def improvement_tips(rank, full_name, score, stars, open_issues, closed_issues, contributors, dependents, days):
    tips = []
    total_issues = open_issues + closed_issues
    issue_ratio = closed_issues / total_issues if total_issues > 0 else 0.3

    if days > 30:
        tips.append(f"**Freshness** — your last commit was {days} days ago. A recent release or changelog update would boost this signal.")
    if issue_ratio < 0.6 and total_issues > 5:
        tips.append(f"**Issue health** — {open_issues} open issues vs {closed_issues} closed. Closing or triaging stale issues would improve this score.")
    if contributors < 5:
        tips.append(f"**Contributors** — only {contributors} contributor(s) detected. Adding CONTRIBUTING.md or good-first-issue labels can attract collaborators.")
    if dependents == 0:
        tips.append("**Dependents** — no downstream dependents tracked yet. Publishing to a package registry (npm/PyPI/crates.io) helps this signal grow over time.")
    if not tips:
        tips.append("Your signals are already strong across the board. Keep shipping.")
    return tips


def tool_slug(full_name):
    return full_name.replace("/", "--").lower()


def github_issue(rank, full_name, url, score, stars, open_issues, closed_issues, contributors, dependents, language, last_commit_at):
    name = full_name.split("/")[1]
    org = full_name.split("/")[0]
    days = days_since(last_commit_at)
    slug = tool_slug(full_name)
    agentrank_url = f"{AGENTRANK_BASE}/{slug}/{UTM_GITHUB}"
    claim_url = f"{AGENTRANK_HOME}/claim/{UTM_GITHUB}"

    tips = improvement_tips(rank, full_name, score, stars, open_issues, closed_issues, contributors, dependents, days)
    tips_md = "\n".join(f"- {t}" for t in tips)

    return f"""---
## Repo: {full_name}
**GitHub issue URL:** {url}/issues/new
**Title:** Your tool is ranked #{rank} on AgentRank

---

**Body:**

Hi @{org} team,

I wanted to let you know that **{name}** is ranked **#{rank}** on [AgentRank]({AGENTRANK_HOME}{UTM_GITHUB}) with a score of **{score}/100**.

AgentRank is an open ranking of every MCP server and agent tool on GitHub — scored daily across five signals: stars, freshness, issue health, contributors, and dependents. We index 25,000+ tools.

### Your score breakdown

| Signal | Status |
|--------|--------|
| Stars | {stars:,} |
| Freshness | {freshness_label(days)} |
| Issue health | {issue_health_label(open_issues, closed_issues)} |
| Contributors | {contributors_label(contributors)} |
| Dependents | {dependents_label(dependents)} |

**Full listing:** {agentrank_url}

### What could improve your score

{tips_md}

### Claim your listing

You can claim your tool listing at [{AGENTRANK_HOME}/claim]({claim_url}) to add a description, logo, and links. It's free — we just verify repo ownership.

Thanks for building in the MCP ecosystem.

— The AgentRank team

---
"""


UTM_TWITTER = "?utm_source=twitter&utm_medium=social&utm_campaign=maintainer_tag"


def tweet(rank, full_name, url, score, stars, open_issues, closed_issues, contributors, dependents, language, last_commit_at):
    name = full_name.split("/")[1]
    org = full_name.split("/")[0]
    slug = tool_slug(full_name)
    agentrank_url = f"{AGENTRANK_BASE}/{slug}/{UTM_TWITTER}"

    # Short punchy tweet under 280 chars
    # Format: "#{rank} on AgentRank: [name] ({score}/100) — {quick_fact} {url}"
    days = days_since(last_commit_at)

    if dependents >= 1000:
        fact = f"{dependents:,} downstream dependents"
    elif dependents >= 100:
        fact = f"{dependents} dependents"
    elif stars >= 10000:
        fact = f"{stars:,} stars"
    elif contributors >= 50:
        fact = f"{contributors} contributors"
    else:
        fact = f"{stars:,} stars"

    return f"""#{rank} | @{org} — {name}
Score: {score}/100 | {language} | {fact}
{agentrank_url}
"""


# --- Generate files ---

github_issues_content = "# Maintainer GitHub Issue Drafts — Top 50 AgentRank Tools\n\n"
github_issues_content += "> **DRAFT — DO NOT POST WITHOUT STEVE APPROVAL**\n"
github_issues_content += f"> Generated: {NOW.strftime('%Y-%m-%d')}\n\n"
github_issues_content += "---\n\n"

tweets_content = "# Maintainer Tweet Templates — Top 50 AgentRank Tools\n\n"
tweets_content += "> **DRAFT — DO NOT POST WITHOUT STEVE APPROVAL**\n"
tweets_content += f"> Generated: {NOW.strftime('%Y-%m-%d')}\n"
tweets_content += "> Post as @AgentRank_ai. Tag org handle where possible.\n\n"
tweets_content += "---\n\n"

for tool in TOOLS:
    rank, full_name, url, score, stars, open_issues, closed_issues, contributors, dependents, language, last_commit_at = tool
    github_issues_content += github_issue(*tool)
    tweets_content += tweet(*tool) + "\n"

with open("/Users/mallett/claude/AgentRank/scripts/maintainer-outreach/github-issues.md", "w") as f:
    f.write(github_issues_content)

with open("/Users/mallett/claude/AgentRank/scripts/maintainer-outreach/tweets.md", "w") as f:
    f.write(tweets_content)

print("Done. Generated:")
print("  scripts/maintainer-outreach/github-issues.md")
print("  scripts/maintainer-outreach/tweets.md")
