# AgentRank Newsletter #3 — Draft

> **STATUS: DRAFT — Do NOT send. Steve must approve before sending.**

Generated: 2026-03-19

---

## Subject Line Options

1. `The best MCP servers for database access, ranked`
2. `MongoDB MCP: 423k installs, rank #108. Here's why that gap matters.`
3. `AgentRank #3: Deep dive — database tools`

**Recommended:** Option 2 — leads with data tension that demands explanation.

---

## Preview Text

`9 database tools ranked. The gap between stars and actual installs tells a different story than you'd expect.`

---

## Body

---

**AgentRank** | Issue #3 | Week of March 19, 2026

---

### Deep dive: MCP servers for database access

This week we're looking at the database category — 49 tools indexed, spanning PostgreSQL optimization, MongoDB, Supabase, Neon, and Azure.

The rankings tell an interesting story about what "good" means when your AI agent needs to talk to a database.

---

### Top database tools, ranked

| # | Tool | Score | Stars | Installs | Source |
|---|------|-------|-------|----------|--------|
| 1 | [postgresql-optimization](https://agentrank-ai.com/tool/github/awesome-copilot/postgresql-optimization) | 77.6 | 25.8k | — | skills.sh |
| 2 | [postgresql-code-review](https://agentrank-ai.com/tool/github/awesome-copilot/postgresql-code-review) | 77.4 | 25.8k | — | skills.sh |
| 3 | [MongoDB MCP Server](https://agentrank-ai.com/tool/glama/mongodb-js/mongodb-mcp-server) | 77.3 | 965 | 422,883 | glama |
| 4 | [postgresql-table-design](https://agentrank-ai.com/tool/wshobson/agents/postgresql-table-design) | 76.9 | 31.6k | — | skills.sh |
| 5 | [azure-postgres](https://agentrank-ai.com/tool/microsoft/github-copilot-for-azure/azure-postgres) | 73.6 | 158 | — | skills.sh |
| 6 | [neon-postgres](https://agentrank-ai.com/tool/neondatabase/agent-skills/neon-postgres) | 63.1 | 40 | — | skills.sh |
| 7 | [supabase-postgres-best-practices](https://agentrank-ai.com/tool/supabase/agent-skills/supabase-postgres-best-practices) | 61.3 | 1.6k | — | skills.sh |
| 8 | [database-schema-design](https://agentrank-ai.com/tool/supercent-io/skills-template/database-schema-design) | 53.1 | 59 | — | skills.sh |
| 9 | [database-migration](https://agentrank-ai.com/tool/wshobson/agents/database-migration) | 44.0 | — | — | skills.sh |

---

### The install gap: what it reveals

MongoDB MCP Server has 965 GitHub stars but 422,883 installs through Glama. That 438× multiplier between stars and installs is the most important signal in this week's data.

Stars measure visibility. Installs measure actual use. A tool can be widely used without being widely starred — especially when distribution runs through a platform (Glama, in this case) rather than raw GitHub discovery.

The implication: our scoring currently weights GitHub signals heavily. Tools distributed through MCP registries may be systematically underrepresented. This is a known limitation we're tracking.

---

### The PostgreSQL cluster

Three PostgreSQL-focused skills from the `awesome-copilot` collection sit in the top 4 — `postgresql-optimization`, `postgresql-code-review`, and `postgresql-table-design`. They benefit from the parent repo's star count (25-31k) inflating their scores.

But look closer: these are skills, not servers. They give AI agents prompting intelligence for PostgreSQL work, not direct database connections. Different use case.

If you want AI-to-database connectivity, the MongoDB MCP Server and the Neon/Supabase entries are the real options. Both have active maintainers shipping regularly.

---

### New entry worth watching

**Neon PostgreSQL** (`neondatabase/agent-skills/neon-postgres`) at rank #350 with a 63.1 score. 40 stars, recent commits, and a growing install base. Neon is building first-party agent tooling — a strong signal of where serverless Postgres is headed.

---

### See all database tools

[agentrank-ai.com](https://agentrank-ai.com) → filter by category: database

---

### This week's leaderboard (top 5)

| # | Tool | Score |
|---|------|-------|
| 1 | CoplayDev/unity-mcp | 98.7 |
| 2 | microsoft/azure-devops-mcp | 97.2 |
| 3 | laravel/boost | 96.9 |
| 4 | CoderGamester/mcp-unity | 96.4 |
| 5 | mark3labs/mcp-go | 96.3 |

Full rankings: [agentrank-ai.com](https://agentrank-ai.com)

---

You're receiving this because you signed up for AgentRank updates.
[Unsubscribe](#) | [View in browser](#)

---

*AgentRank indexes 25,000+ MCP servers, AI skills, and agent tools. Scores update daily.*
