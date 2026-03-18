# Weekly MCP Digest — Series Template

**Purpose:** Repeatable template for producing the "This Week in MCP" weekly digest. Any agent can generate the next edition by following this document.

**Slug pattern:** `/blog/this-week-in-mcp-YYYY-MM-DD` (always use the Monday publish date)

**File pattern:** `site/src/pages/blog/this-week-in-mcp-YYYY-MM-DD.astro`

**Existing editions:**
- [#1 — March 17, 2026](/blog/this-week-in-mcp-2026-03-17/)
- [#2 — March 24, 2026](/blog/this-week-in-mcp-2026-03-24/)

---

## Step 1 — Pull Data from D1

Run these queries against `agentrank-db` (database_id: `946abec6-5f2b-4177-b1cb-b84769a20883`):

```bash
# Stats: total count + avg score
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT COUNT(*) as total, ROUND(AVG(score),1) as avg_score FROM tools"

# Skills count
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT COUNT(*) as skills_count FROM skills"

# Current top 10
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT rank, full_name, score, stars, language FROM tools WHERE rank <= 10 ORDER BY rank"

# Language breakdown (top 5)
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT language, COUNT(*) as count FROM tools WHERE language IS NOT NULL GROUP BY language ORDER BY count DESC LIMIT 5"

# Biggest gainers (requires rank_history to have two snapshots)
# Replace YYYY-MM-DD-NOW and YYYY-MM-DD-PREV with this week and last week's dates
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT h_now.tool_full_name, h_now.rank as rank_now, h_prev.rank as rank_prev,
   h_now.rank - h_prev.rank as rank_change
   FROM rank_history h_now
   JOIN rank_history h_prev ON h_now.tool_full_name = h_prev.tool_full_name
   WHERE h_now.snapshot_date = 'YYYY-MM-DD-NOW'
   AND h_prev.snapshot_date = 'YYYY-MM-DD-PREV'
   AND h_now.rank <= 100
   ORDER BY rank_change ASC LIMIT 5"

# Biggest drops (same query, ORDER BY rank_change DESC)
# New tools: tools in rank_history for NOW but NOT in PREV
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT tool_full_name, rank FROM rank_history
   WHERE snapshot_date = 'YYYY-MM-DD-NOW'
   AND tool_full_name NOT IN (
     SELECT tool_full_name FROM rank_history WHERE snapshot_date = 'YYYY-MM-DD-PREV'
   )
   ORDER BY rank LIMIT 10"
```

**Fallback when rank_history has no prior snapshot:** Compare to the previous week's blog post (hardcode the top 10 from last week's post and diff against current D1 data).

---

## Step 2 — Identify the Week's Story

Before writing, identify one compelling narrative. Good candidates:
- A new tool entering the top 10 (especially from a major org)
- A previously dominant tool dropping significantly (signals staleness)
- A language/ecosystem trend (e.g., Go repos surging, Ruby SDK maturing)
- A milestone (e.g., total tools crossing a round number)

Write 2-3 sentences for the "This week's story" section explaining the *why* behind the data, not just the what.

---

## Step 3 — Fill the Template

Replace all `YYYY-MM-DD`, `DATE_LONG` (e.g., "March 24, 2026"), and data placeholders below.

### SEO Metadata Targets
- **Title:** `This Week in MCP — {DATE_LONG} | AgentRank`
- **Description:** `Weekly ecosystem report: {TOTAL} MCP tools indexed, {SUMMARY_OF_BIG_MOVE}.`
- **Keywords:** `this week in MCP {YYYY-MM-DD}, MCP weekly report, MCP server updates {DATE_LONG}, AgentRank weekly`
- **Canonical:** `https://agentrank-ai.com/blog/this-week-in-mcp-{YYYY-MM-DD}/`
- **Word count target:** 500–800 words (sections add up; tables count lightly)

### Section Format
1. **Ecosystem stats** — 4-box grid: total tools, new this week, skills count, avg score
2. **This week's story** — 2-3 paragraph narrative; link 2-3 relevant tools
3. **Biggest gainers** — table: repo, prev rank, now, change; 5 rows max
4. **Biggest drops** — table: same columns; 5 rows max; include 1 sentence of explanation
5. **Current top 10** — table: rank, repo, score, stars, language
6. **Language breakdown** — table: language, count, share %, bar; top 5
7. **Tweet this week** — 1 pre-formatted tweet under 280 chars; lead with the most surprising number or move

### Internal Links to Include
- Previous week's digest: `/blog/this-week-in-mcp-YYYY-MM-DD/`
- `/blog/mcp-server-landscape-q1-2026/`
- `/blog/how-to-choose-an-mcp-server/`
- `/tools/` — "Browse all {N} tools"
- Individual tool pages where mentioned: `/tool/{owner}--{repo}/`

### Related Posts Array (rotate based on relevance)
```js
const relatedPosts = [
  { href: '/blog/this-week-in-mcp-{PREV_DATE}/', title: 'This Week in MCP — {PREV_DATE_LONG}' },
  { href: '/blog/mcp-server-landscape-q1-2026/', title: 'The MCP Server Landscape: Q1 2026' },
  { href: '/blog/how-to-choose-an-mcp-server/', title: 'How to Choose an MCP Server in 2026' },
];
```

---

## Step 4 — Tool URL Slugging

Tool page URLs use the format `/tool/{owner}--{repo}/` (double dash between owner and repo, lowercased).

Examples:
- `PrefectHQ/fastmcp` → `/tool/PrefectHQ--fastmcp/`
- `mark3labs/mcp-go` → `/tool/mark3labs--mcp-go/`
- `microsoft/azure-devops-mcp` → `/tool/microsoft--azure-devops-mcp/`

If a tool doesn't have a page in the index yet (new entry not yet indexed), use a `<span class="tool-link">` instead of an `<a>` tag to avoid broken links.

---

## Step 5 — Update Blog Index

After creating the new post, update `site/src/pages/blog/index.astro` to include the new digest in the post list. Add a new entry at the top of the weekly digest section.

---

## Step 6 — Deploy

```bash
cd site && npm run build && npx wrangler pages deploy dist --project-name agentrank
```

Verify the post is live at `https://agentrank-ai.com/blog/this-week-in-mcp-YYYY-MM-DD/`.

---

## Tweet Formats That Work

Use one of these proven templates:

**Ranking upset:**
```
The MCP top 10 just reshuffled.

{Tool A}: #{prev} → #{now}
{Tool B}: #{prev} → #{now}

{One-line insight about why.}

Full breakdown: agentrank-ai.com/blog/this-week-in-mcp-YYYY-MM-DD/
```

**New entrant:**
```
This week in MCP: {Tool} just entered the top 10 at #{rank}.

{Stars} stars. {Language}. {One fact about why it matters.}

Full rankings: agentrank-ai.com/blog/this-week-in-mcp-YYYY-MM-DD/
```

**Milestone:**
```
The AgentRank index just crossed {N} MCP tools.

Top tool this week: {Tool} ({Score}/100)

Live rankings: agentrank-ai.com/blog/this-week-in-mcp-YYYY-MM-DD/
```

---

## Checklist

- [ ] D1 queries run, data captured
- [ ] "This week's story" narrative written (not just data dump)
- [ ] Gainers table: 5 rows, rank change column
- [ ] Drops table: 5 rows with explanation
- [ ] Top 10 table complete
- [ ] Language breakdown matches D1 data
- [ ] SEO metadata filled (title, description, keywords, canonical, jsonLd)
- [ ] Previous week linked in relatedPosts
- [ ] Tool URLs use correct `--` slug format
- [ ] Tweet under 280 characters
- [ ] Blog index updated
- [ ] Build passes (`npm run build`)
- [ ] Deployed to Vercel/CF Pages
