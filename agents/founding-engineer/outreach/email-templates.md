# AgentRank Maintainer Outreach Email Templates

Three templates for different outreach scenarios. Variables in `[brackets]`.
Do NOT send until Steve approves. These are drafts only.

---

## Template A — Cold Outreach: "Your tool is ranked #X"

**Subject:** [tool_name] is ranked #[rank] on AgentRank

Hi [github_username],

I built AgentRank — a live, daily-updated ranking of every MCP server and agent tool on GitHub. Your project [tool_name] just earned the #[rank] spot out of [total_indexed] tools in the index.

The score is based on five signals: stars, freshness (days since last commit), issue health (closed/total ratio), contributor count, and inbound dependents. [tool_name] scored [score]/100 — genuinely strong.

You can see the full breakdown here: https://agentrank-ai.com/tools/[github_username]/[tool_name]

If anything looks wrong or you'd like to add context to your listing, reply here and I'll sort it out.

Keep shipping,
Steve
AgentRank — https://agentrank-ai.com

---

## Template B — Claim Your Listing

**Subject:** Claim your [tool_name] listing on AgentRank

Hi [github_username],

AgentRank indexes MCP servers and agent tools from GitHub — your project [tool_name] is currently ranked #[rank] with a score of [score]/100.

Claiming your listing lets you:
- Add a custom description or website link
- Show a verified maintainer badge
- Get notified when your score changes significantly

It takes about 2 minutes and just requires a GitHub OAuth login: https://agentrank-ai.com/claim?repo=[full_name]

No spam, no cost. Just your project, better represented.

Steve
AgentRank — https://agentrank-ai.com

---

## Template C — Ongoing Engagement: Score Movement

**Subject:** [tool_name] moved [direction][delta] spots on AgentRank this week

Hi [github_username],

Quick update: [tool_name] [moved_up_or_down] [delta] spots on AgentRank this week, now sitting at #[new_rank] (was #[old_rank]).

[IF MOVED UP:]
The bump came from [top_signal] — your recent activity is paying off.

[IF MOVED DOWN:]
The slide is mostly [top_signal]. [tool_name] still scores [score]/100 overall — strong fundamentals.

Full breakdown: https://agentrank-ai.com/tools/[github_username]/[tool_name]

Steve
AgentRank — https://agentrank-ai.com

---

## Variable Reference

| Variable | Source | Notes |
|---|---|---|
| `[tool_name]` | `top-100-maintainers.json` → `tool_name` | Repo name only, not org/repo |
| `[rank]` | `top-100-maintainers.json` → `rank` | Current rank |
| `[github_username]` | `top-100-maintainers.json` → `github_username` | Org or user who owns the repo |
| `[full_name]` | `top-100-maintainers.json` → `full_name` | `owner/repo` format |
| `[score]` | `top-100-maintainers.json` → `score` | 0–100 composite score |
| `[total_indexed]` | Hardcode as ~25,000 | Total repos in the index |
| `[direction]` | Compare against prior week snapshot | `+` or `-` |
| `[delta]` | Absolute rank change | e.g. `+12` or `-5` |
| `[new_rank]` / `[old_rank]` | Current vs prior week rank | From `data/weekly/` snapshots |
| `[top_signal]` | Score breakdown | e.g. "freshness (6 days since last commit)" |

## Usage Notes

- Template A: first contact, cold. Best for top 50 where rank is genuinely impressive.
- Template B: for maintainers who visit the site but haven't claimed yet (use site analytics to trigger).
- Template C: weekly digest, best for maintainers who have already engaged or claimed.
- For org-owned repos (microsoft, laravel, PrefectHQ etc.), address to the individual contributor if identifiable, not the org handle.
- Always personalize the subject — do not blast identical emails.
