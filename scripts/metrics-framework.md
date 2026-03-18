# AgentRank Phase 1 Distribution Metrics Framework

**Purpose:** Track and report distribution progress during Phase 1 (Distribution Blitz, Weeks 1–4).
**Owner:** Product Manager
**Review cadence:** Weekly (every Monday)
**Goal gate:** Hit Phase 2 thresholds to unlock monetization.

---

## 1. Key Metrics and Targets

| Metric | Week 2 Target | Week 4 Target | Phase 2 Gate |
|--------|--------------|--------------|--------------|
| Monthly site visits | 2,000 | 10,000 | 5,000+ |
| Monthly API requests | 200 | 1,000 | 5,000+ |
| Skill installs (all platforms) | 100 | 500 | 500+ |
| Email subscribers | 100 | 500 | 300+ |
| Referring domains | 10 | 30 | 20+ |
| GitHub badge PRs merged | 5 | 10 | 10+ |

**Phase 2 gate:** Proceed to monetization when ANY TWO of the Phase 2 Gate column targets are met simultaneously. Minimum floor: API requests >= 5K/mo OR skill installs >= 500.

---

## 2. How to Measure Each Metric

### 2.1 Monthly Site Visits

**Source:** Cloudflare Analytics + D1 `request_log`

**Cloudflare Analytics (primary):**
```
Cloudflare Dashboard → agentrank-ai.com → Analytics & Logs → Web Analytics
Filter: last 30 days, unique visitors + page views
```

**D1 request_log (backup/detail):**
```sql
-- Monthly page views by type
SELECT
  substr(ts, 1, 7) AS month,
  COUNT(*) AS requests,
  COUNT(DISTINCT country) AS countries
FROM request_log
WHERE type = 'page'
  AND ts >= datetime('now', '-30 days')
GROUP BY month;
```

**Access:** `npx wrangler d1 execute agentrank-db --remote --command "<query>"`

**Frequency:** Weekly snapshot, monthly summary.

---

### 2.2 Monthly API Requests

**Source:** D1 `request_log` + `api_usage` tables

**Primary query (all API requests):**
```sql
SELECT
  substr(ts, 1, 7) AS month,
  COUNT(*) AS api_requests,
  COUNT(DISTINCT ua) AS unique_callers
FROM request_log
WHERE type = 'api'
  AND ts >= datetime('now', '-30 days')
GROUP BY month;
```

**By endpoint:**
```sql
SELECT path, COUNT(*) AS hits
FROM request_log
WHERE type = 'api'
  AND ts >= datetime('now', '-30 days')
GROUP BY path
ORDER BY hits DESC
LIMIT 20;
```

**Pro key usage (when API keys are issued):**
```sql
SELECT
  ak.tier,
  SUM(au.request_count) AS total_requests,
  COUNT(DISTINCT ak.id) AS active_keys
FROM api_usage au
JOIN api_keys ak ON au.api_key_id = ak.id
WHERE au.date >= date('now', '-30 days')
GROUP BY ak.tier;
```

**Frequency:** Weekly snapshot, monthly summary.

---

### 2.3 Skill Installs (All Platforms)

**Source:** D1 `install_checkpoints` table + manual checks

**D1 query:**
```sql
-- Latest install count vs. 7 days ago
SELECT
  slug,
  source,
  installs,
  checked_at
FROM install_checkpoints
WHERE slug = 'agentrank'
ORDER BY checked_at DESC
LIMIT 10;

-- Week-over-week delta
SELECT
  a.installs - b.installs AS installs_gained,
  a.checked_at AS current,
  b.checked_at AS previous
FROM install_checkpoints a
JOIN install_checkpoints b ON a.slug = b.slug
WHERE a.slug = 'agentrank'
  AND date(a.checked_at) = date('now')
  AND date(b.checked_at) = date('now', '-7 days');
```

**Manual checks per platform:**

| Platform | Where to check | Frequency |
|----------|---------------|-----------|
| skills.sh | `https://skills.sh/skills/agentrank` (installs field) | Weekly |
| Glama | `https://glama.ai/mcp/servers/agentrank` (download count) | Weekly |
| Smithery | `https://smithery.ai/server/agentrank` (installs) | Weekly |
| npm (@agentrank/mcp) | `npm info @agentrank/mcp` → downloads | Weekly |

**Note:** The `install_checkpoints` table is populated by the pipeline cron. Verify it's writing on each run: `scripts/run-pipeline.sh`.

**Frequency:** Weekly snapshot from D1, manual platform spot-checks.

---

### 2.4 Email Subscribers

**Source:** D1 `email_subscribers` table

```sql
-- Total confirmed subscribers
SELECT
  COUNT(*) AS total,
  SUM(confirmed) AS confirmed,
  source,
  COUNT(*) FILTER (WHERE subscribed_at >= datetime('now', '-7 days')) AS new_this_week
FROM email_subscribers
GROUP BY source;

-- Week-over-week growth
SELECT
  strftime('%Y-%W', subscribed_at) AS week,
  COUNT(*) AS new_subscribers,
  SUM(confirmed) AS confirmed
FROM email_subscribers
GROUP BY week
ORDER BY week DESC
LIMIT 8;
```

**Confirmed rate target:** > 60%. Low confirmation rate means onboarding email needs work.

**Frequency:** Weekly.

---

### 2.5 Referring Domains

**Source:** D1 `request_log` (referrer column) + Cloudflare Analytics

**D1 query:**
```sql
-- Unique referring domains this month
SELECT
  referrer,
  COUNT(*) AS visits,
  COUNT(DISTINCT country) AS countries
FROM request_log
WHERE referrer IS NOT NULL
  AND ts >= datetime('now', '-30 days')
GROUP BY referrer
ORDER BY visits DESC
LIMIT 50;
```

**Cloudflare Analytics (for backlinks):**
```
Cloudflare Dashboard → agentrank-ai.com → Analytics → Traffic → Referrers
```

**Note:** For broader backlink discovery (domains not sending direct traffic), use a free check on ahrefs.com/backlink-checker or similar.

**Frequency:** Weekly.

---

### 2.6 GitHub Badge PRs Merged

**Source:** GitHub search + manual tracking in `scripts/badge-prs.py` output

**Check open/merged PRs:**
```bash
# PRs filed by our bot
gh search prs --author "agentrank-bot" --state merged --limit 50

# Manual search (if bot not set up)
# Track in a simple counter in scripts/badge-pr-log.md
```

**Count:** Manually increment `scripts/badge-pr-log.md` each time a PR is confirmed merged.

**Frequency:** Weekly.

---

## 3. Weekly Reporting Template

Use this template every Monday. File at `scripts/reports/weekly-YYYY-MM-DD.md`.

```markdown
# AgentRank Weekly Metrics Report
**Week ending:** YYYY-MM-DD
**Generated by:** Product Manager
**Comparison:** vs. previous week (YYYY-MM-DD)

---

## Status Dashboard

| Metric | Last Week | This Week | Change | Wk 2 Target | Wk 4 Target | Status |
|--------|-----------|-----------|--------|-------------|-------------|--------|
| Site visits (mo) | — | — | — | 2,000 | 10,000 | 🔴/🟡/🟢 |
| API requests (mo) | — | — | — | 200 | 1,000 | 🔴/🟡/🟢 |
| Skill installs | — | — | — | 100 | 500 | 🔴/🟡/🟢 |
| Email subscribers | — | — | — | 100 | 500 | 🔴/🟡/🟢 |
| Referring domains | — | — | — | 10 | 30 | 🔴/🟡/🟢 |
| Badge PRs merged | — | — | — | 5 | 10 | 🔴/🟡/🟢 |

**Status key:** 🟢 On track (>75% of target) | 🟡 Lagging (50-75%) | 🔴 At risk (<50%)

---

## Traffic Breakdown

### By channel (UTM source)
| Source | Visits | % of total |
|--------|--------|-----------|
| (direct) | | |
| twitter | | |
| reddit | | |
| hackernews | | |
| skills.sh | | |
| github | | |
| other | | |

### Top referrers (domains)
1.
2.
3.
4.
5.

---

## API Usage

### By endpoint
| Endpoint | Requests | % of total |
|----------|----------|-----------|
| | | |

### By type
- Free/anonymous: X requests
- API key (Pro): X requests, X keys active

---

## Email Subscribers

- New this week: X
- Total confirmed: X
- Confirmation rate: X%
- Top acquisition source: X

---

## Skill Installs

| Platform | This Week | Change |
|----------|-----------|--------|
| skills.sh | | |
| Glama | | |
| Smithery | | |
| npm | | |
| **Total** | | |

---

## Distribution Actions This Week

- [ ] What channels did we push? (Reddit, HN, Twitter, PRs)
- [ ] What content went live? (blog posts, tweets)
- [ ] What PRs were filed/merged?

---

## Wins

- ...

## Blockers / Concerns

- ...

## Next Week Priorities

1.
2.
3.
```

---

## 4. Channel Attribution Plan

### UTM Strategy

All links we control must include UTM parameters. Standard format:

```
https://agentrank-ai.com/?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>
```

| Channel | `utm_source` | `utm_medium` | `utm_campaign` |
|---------|-------------|-------------|---------------|
| Twitter (@AgentRank_ai tweets) | `twitter` | `social` | `launch` / `weekly` / `movers` |
| Twitter (@comforteagle manual) | `twitter` | `social` | `personal` |
| Reddit (r/mcp, r/LocalLLaMA etc) | `reddit` | `community` | `launch` / `<subreddit>` |
| HackerNews Show HN | `hackernews` | `community` | `show_hn` |
| GitHub badge PRs | `github` | `badge` | `badge_pr` |
| skills.sh listing | `skillssh` | `registry` | `listing` |
| Glama listing | `glama` | `registry` | `listing` |
| Smithery listing | `smithery` | `registry` | `listing` |
| Newsletter | `email` | `newsletter` | `newsletter_001` / `newsletter_002` |
| Product Hunt | `producthunt` | `launch` | `ph_launch` |
| Partner embeds | `<partner-name>` | `embed` | `score_embed` |
| Partner outreach emails | `email_outreach` | `email` | `partner_<name>` |

### Reading UTM Data

```sql
-- Traffic by UTM source (last 30 days)
SELECT
  utm_source,
  COUNT(*) AS visits,
  COUNT(DISTINCT country) AS countries
FROM request_log
WHERE utm_source IS NOT NULL
  AND ts >= datetime('now', '-30 days')
GROUP BY utm_source
ORDER BY visits DESC;
```

### Attribution Rules

- **Direct traffic** (no referrer, no UTM): likely organic or existing users. Not attributable.
- **Referrer without UTM:** organic discovery. Track domain.
- **UTM present:** attributed to channel. UTM overrides referrer for source.
- **API calls:** attributed by `ua` (user agent) if it identifies the calling agent/tool.

---

## 5. Phase 2 Gate Criteria

### Primary Gate (proceed when BOTH met)

1. **Monthly API requests >= 5,000** — proves real agent usage, not just human browsing
2. **Skill installs >= 500** — proves platform distribution is working

### Alternative Gate (if API-first path)

Proceed to monetization if:
- Monthly API requests >= 10,000 (even if installs < 500)

### Supporting Signals (should also be true)

- At least 2 referring domains sending 50+ visits/mo (indicates SEO/content working)
- Email list >= 200 confirmed (captive audience for monetization announcements)
- At least 3 GitHub badge PRs merged (vanity loop established)

### What "Proceed to Phase 2" Means

When gate is met:
1. **Steve approves** transition (check with CEO before acting)
2. Enable Stripe integration for Pro API ($49-199/mo)
3. Enable sponsored listing inquiry form ($199-499/mo)
4. Email list announcement for Verified Publisher Pro ($29/mo)
5. Set Pro API rate limits in D1 + Workers

### What Does NOT Trigger Phase 2

- High site visits without API usage (tourists, not users)
- Many installs without API calls (installed but not actively querying)
- Strong social engagement without downstream conversion to API usage

---

## Appendix: Quick Access Commands

```bash
# Pull latest D1 analytics snapshot
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT type, COUNT(*) as n FROM request_log WHERE ts >= datetime('now', '-30 days') GROUP BY type;"

# Email subscriber count
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT COUNT(*) as total, SUM(confirmed) as confirmed FROM email_subscribers;"

# Top UTM sources this week
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT utm_source, COUNT(*) as visits FROM request_log WHERE utm_source IS NOT NULL AND ts >= datetime('now', '-7 days') GROUP BY utm_source ORDER BY visits DESC LIMIT 10;"

# Install checkpoint latest
npx wrangler d1 execute agentrank-db --remote --command \
  "SELECT slug, source, installs, checked_at FROM install_checkpoints ORDER BY checked_at DESC LIMIT 10;"
```
