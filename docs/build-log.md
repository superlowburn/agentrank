# AgentRank Build Log

## 2026-03-13 — v2 Skills-First Redesign

### Milestone 1: Memory + Documentation
- Saved v2 pivot context to memory
- Created design spec and build log

### Milestone 2: Skills Crawlers + DB Schema
- Added `skills` and `agents` tables to SQLite schema
- Added `glama_weekly_downloads` and `glama_tool_calls` columns to `repos` table
- Created skills.sh crawler (`crawler/src/skills.ts`)
- Created Glama.ai crawler (`crawler/src/glama.ts`)
- Created ClawHub crawler (`crawler/src/clawhub.ts`)
- Integrated skills crawling into main pipeline

### Milestone 3: Skills Scoring
- Created skills scorer (`scorer/src/skills-scorer.ts`)
- Generates `data/ranked-skills.json`

### Milestone 4: Site Redesign
- Added tab navigation (Skills / Tools / Agents)
- Skills leaderboard replaces homepage
- Tools page moved to /tools
- Skill detail pages at /skill/[slug]
- Agents registration page with form + API
- Updated OG meta tags and branding

### Milestone 5: Deploy + Verify
- Updated D1 schema with skills + agents tables
- Updated seed script for skills data
- Updated outreach copy
