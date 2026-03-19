DROP TABLE IF EXISTS tools;

CREATE TABLE tools (
  rank INTEGER NOT NULL,
  full_name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  description TEXT,
  score REAL NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  open_issues INTEGER NOT NULL DEFAULT 0,
  closed_issues INTEGER NOT NULL DEFAULT 0,
  contributors INTEGER NOT NULL DEFAULT 0,
  dependents INTEGER NOT NULL DEFAULT 0,
  language TEXT,
  license TEXT,
  last_commit_at TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  matched_queries TEXT NOT NULL DEFAULT '[]',
  readme_excerpt TEXT,
  github_topics TEXT NOT NULL DEFAULT '[]',
  glama_weekly_downloads INTEGER NOT NULL DEFAULT 0,
  glama_tool_calls INTEGER NOT NULL DEFAULT 0,
  npm_weekly_downloads INTEGER NOT NULL DEFAULT 0,
  npm_package TEXT,
  pypi_weekly_downloads INTEGER NOT NULL DEFAULT 0,
  pypi_package TEXT,
  category TEXT,
  sponsored INTEGER NOT NULL DEFAULT 0,
  sponsor_tier TEXT,
  sponsor_description TEXT,
  sponsor_cta_text TEXT,
  sponsor_cta_url TEXT
);

CREATE INDEX idx_tools_full_name ON tools(full_name);
CREATE INDEX idx_tools_rank ON tools(rank);
CREATE INDEX idx_tools_score ON tools(score DESC);
CREATE INDEX idx_tools_sponsored ON tools(sponsored) WHERE sponsored = 1;
-- Migration (run once on existing D1 if pipeline hasn't rebuilt the table):
-- ALTER TABLE tools ADD COLUMN category TEXT;
-- ALTER TABLE tools ADD COLUMN sponsored INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE tools ADD COLUMN sponsor_tier TEXT;
-- CREATE INDEX IF NOT EXISTS idx_tools_sponsored ON tools(sponsored) WHERE sponsored = 1;
-- ALTER TABLE tools ADD COLUMN npm_weekly_downloads INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE tools ADD COLUMN npm_package TEXT;
-- ALTER TABLE tools ADD COLUMN pypi_weekly_downloads INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE tools ADD COLUMN pypi_package TEXT;

DROP TABLE IF EXISTS skills;

CREATE TABLE skills (
  slug TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  github_repo TEXT,
  source TEXT NOT NULL,
  installs INTEGER NOT NULL DEFAULT 0,
  trending_rank INTEGER,
  platforms TEXT NOT NULL DEFAULT '[]',
  author TEXT,
  score REAL,
  rank INTEGER,
  gh_stars INTEGER,
  gh_open_issues INTEGER,
  gh_closed_issues INTEGER,
  gh_contributors INTEGER,
  gh_last_commit_at TEXT,
  gh_is_archived INTEGER DEFAULT 0,
  category TEXT
);

CREATE INDEX idx_skills_rank ON skills(rank);
CREATE INDEX idx_skills_score ON skills(score DESC);
CREATE INDEX idx_skills_slug ON skills(slug);
-- Migration (run once on existing D1 if pipeline hasn't rebuilt the table):
-- ALTER TABLE skills ADD COLUMN category TEXT;

DROP TABLE IF EXISTS agents;

CREATE TABLE agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_name TEXT,
  owner_url TEXT,
  capabilities TEXT NOT NULL DEFAULT '[]',
  endpoint_url TEXT,
  contact_email TEXT,
  registered_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Request log — survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS request_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  type TEXT NOT NULL,
  status INTEGER,
  ua TEXT,
  country TEXT,
  duration_ms INTEGER,
  query TEXT,       -- search term (q=) or lookup URL (url=) for API requests
  referrer TEXT,    -- origin+path of HTTP Referer header (no query/fragment)
  utm_source TEXT,  -- utm_source param from page request URL (distribution channel)
  is_bot INTEGER NOT NULL DEFAULT 0  -- 1 = known bot UA, 0 = human/unknown
);
CREATE INDEX IF NOT EXISTS idx_reqlog_ts ON request_log(ts);
CREATE INDEX IF NOT EXISTS idx_reqlog_type ON request_log(type);
CREATE INDEX IF NOT EXISTS idx_reqlog_path ON request_log(path);
CREATE INDEX IF NOT EXISTS idx_reqlog_utm ON request_log(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reqlog_bot ON request_log(is_bot);
-- Migration (run once on existing D1):
-- ALTER TABLE request_log ADD COLUMN query TEXT;
-- ALTER TABLE request_log ADD COLUMN referrer TEXT;
-- ALTER TABLE request_log ADD COLUMN utm_source TEXT;
-- CREATE INDEX IF NOT EXISTS idx_reqlog_utm ON request_log(utm_source) WHERE utm_source IS NOT NULL;
-- ALTER TABLE request_log ADD COLUMN is_bot INTEGER NOT NULL DEFAULT 0;
-- CREATE INDEX IF NOT EXISTS idx_reqlog_bot ON request_log(is_bot);

-- Rate limits table — survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT NOT NULL,
  window TEXT NOT NULL,  -- YYYY-MM-DDTHH:MM
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, window)
);
CREATE INDEX IF NOT EXISTS idx_ratelimits_window ON rate_limits(window);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS rate_limits (ip TEXT NOT NULL, window TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (ip, window));
-- CREATE INDEX IF NOT EXISTS idx_ratelimits_window ON rate_limits(window);

-- Claims table — verified maintainer claims via GitHub OAuth
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_full_name TEXT NOT NULL,            -- "owner/repo" from tools.full_name
  tool_type TEXT NOT NULL DEFAULT 'tool',  -- 'tool' or 'skill'
  github_username TEXT NOT NULL,
  github_user_id INTEGER NOT NULL,
  tagline TEXT,                            -- short description/tagline (max 200 chars)
  category TEXT,                           -- primary category
  logo_url TEXT,                           -- https:// URL for logo/icon
  website_url TEXT,                        -- maintainer website / docs URL (https://)
  is_deprecated INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'removed'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tool_full_name, github_username)
);
CREATE INDEX IF NOT EXISTS idx_claims_tool ON claims(tool_full_name);
CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(github_username);
-- Migration (run once on existing D1):
-- ALTER TABLE claims ADD COLUMN website_url TEXT;

-- Rank history — daily snapshots for computing movers/new-tools
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS rank_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,           -- YYYY-MM-DD UTC
  tool_full_name TEXT NOT NULL,
  tool_type TEXT NOT NULL DEFAULT 'tool', -- 'tool' or 'skill'
  rank INTEGER NOT NULL,
  score REAL NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  UNIQUE(snapshot_date, tool_full_name, tool_type)
);
CREATE INDEX IF NOT EXISTS idx_rh_date ON rank_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_rh_tool ON rank_history(tool_full_name, tool_type);

-- Email subscribers — survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS email_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'homepage',  -- 'homepage', 'blog', 'embed', 'subscribe-page', etc.
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed INTEGER NOT NULL DEFAULT 0,     -- 0 = unconfirmed, 1 = confirmed
  ip_hash TEXT,                             -- SHA-256 of subscriber IP (not raw)
  utm_params TEXT,                          -- JSON blob of UTM params at subscribe time
  welcome_sent_at TEXT                      -- ISO timestamp when welcome email was sent; NULL = not yet sent
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);
-- Migration (run once on existing D1):
-- ALTER TABLE email_subscribers ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE email_subscribers ADD COLUMN ip_hash TEXT;
-- ALTER TABLE email_subscribers ADD COLUMN utm_params TEXT;
-- ALTER TABLE email_subscribers ADD COLUMN welcome_sent_at TEXT;

-- Install checkpoints — tracks our own skill install counts over time (from skills.sh)
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS install_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,                          -- skill slug, e.g. 'agentrank'
  source TEXT NOT NULL DEFAULT 'skills.sh',   -- where the count came from
  installs INTEGER NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ic_slug ON install_checkpoints(slug, checked_at);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS install_checkpoints (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'skills.sh', installs INTEGER NOT NULL, checked_at TEXT NOT NULL DEFAULT (datetime('now')));
-- CREATE INDEX IF NOT EXISTS idx_ic_slug ON install_checkpoints(slug, checked_at);

-- API keys table — Pro API infrastructure
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,                        -- UUID
  key_hash TEXT NOT NULL UNIQUE,              -- SHA-256 hex of the raw key
  key_prefix TEXT NOT NULL,                  -- first 16 chars for display (e.g. "ark_pro_a1b2c3d4")
  name TEXT,                                  -- user-friendly label
  tier TEXT NOT NULL DEFAULT 'free',         -- 'free' | 'pro' | 'enterprise'
  owner_email TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT,
  last_used_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_apikeys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_apikeys_active ON api_keys(is_active);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, key_hash TEXT NOT NULL UNIQUE, key_prefix TEXT NOT NULL, name TEXT, tier TEXT NOT NULL DEFAULT 'free', owner_email TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), revoked_at TEXT, last_used_at TEXT);
-- CREATE INDEX IF NOT EXISTS idx_apikeys_hash ON api_keys(key_hash);
-- CREATE INDEX IF NOT EXISTS idx_apikeys_active ON api_keys(is_active);
-- 2026-03-19: GitHub OAuth developer dashboard
-- ALTER TABLE api_keys ADD COLUMN github_user_id INTEGER;
-- ALTER TABLE api_keys ADD COLUMN github_username TEXT;
-- CREATE INDEX IF NOT EXISTS idx_apikeys_github ON api_keys(github_user_id) WHERE github_user_id IS NOT NULL;

-- API usage per key per day per endpoint
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS api_usage (
  api_key_id TEXT NOT NULL,
  date TEXT NOT NULL,                         -- YYYY-MM-DD UTC
  endpoint TEXT NOT NULL,                    -- 'total' or specific path
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, date, endpoint),
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);
CREATE INDEX IF NOT EXISTS idx_apiusage_key ON api_usage(api_key_id, date);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS api_usage (api_key_id TEXT NOT NULL, date TEXT NOT NULL, endpoint TEXT NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (api_key_id, date, endpoint), FOREIGN KEY (api_key_id) REFERENCES api_keys(id));
-- CREATE INDEX IF NOT EXISTS idx_apiusage_key ON api_usage(api_key_id, date);

-- Score history — daily component-level signal snapshots per tool
-- Used for sparklines and trend analysis on tool pages
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_slug TEXT NOT NULL,
  tool_type TEXT NOT NULL DEFAULT 'tool',
  score REAL NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  freshness_score REAL,
  issue_health REAL,
  contributors INTEGER NOT NULL DEFAULT 0,
  dependent_score REAL,
  recorded_at TEXT NOT NULL DEFAULT (date('now')),
  UNIQUE(tool_slug, tool_type, recorded_at)
);
CREATE INDEX IF NOT EXISTS idx_sh_slug ON score_history(tool_slug, tool_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_sh_date ON score_history(recorded_at);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS score_history (id INTEGER PRIMARY KEY AUTOINCREMENT, tool_slug TEXT NOT NULL, tool_type TEXT NOT NULL DEFAULT 'tool', score REAL NOT NULL, stars INTEGER NOT NULL DEFAULT 0, freshness_score REAL, issue_health REAL, contributors INTEGER NOT NULL DEFAULT 0, dependent_score REAL, recorded_at TEXT NOT NULL DEFAULT (date('now')), UNIQUE(tool_slug, tool_type, recorded_at));
-- CREATE INDEX IF NOT EXISTS idx_sh_slug ON score_history(tool_slug, tool_type, recorded_at);
-- CREATE INDEX IF NOT EXISTS idx_sh_date ON score_history(recorded_at);

-- Subscriptions table — paid tier subscriptions via Stripe
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,                              -- UUID
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,                               -- 'verified_publisher' | 'pro_api' | 'sponsored_basic' | 'sponsored_pro' | 'sponsored_enterprise'
  status TEXT NOT NULL DEFAULT 'active',            -- 'active' | 'past_due' | 'cancelled'
  billing TEXT NOT NULL DEFAULT 'monthly',          -- 'monthly' | 'annual'
  current_period_end INTEGER NOT NULL,              -- unix timestamp
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  tool_full_name TEXT                               -- for sponsored tiers: "owner/repo" of the sponsored tool
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tool ON subscriptions(tool_full_name) WHERE tool_full_name IS NOT NULL;
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, stripe_customer_id TEXT NOT NULL, stripe_subscription_id TEXT NOT NULL UNIQUE, tier TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', billing TEXT NOT NULL DEFAULT 'monthly', current_period_end INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
-- ALTER TABLE subscriptions ADD COLUMN tool_full_name TEXT;
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_tool ON subscriptions(tool_full_name) WHERE tool_full_name IS NOT NULL;

-- Skill pings table — tracks AgentRank skill loads/installs; survives pipeline cycles
CREATE TABLE IF NOT EXISTS skill_pings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL DEFAULT 'agentrank',    -- skill slug
  ip_hash TEXT,                               -- SHA-256 of IP for dedup (no PII stored)
  user_agent TEXT,                            -- first 200 chars of UA
  ts TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sp_slug_ts ON skill_pings(slug, ts);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS skill_pings (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL DEFAULT 'agentrank', ip_hash TEXT, user_agent TEXT, ts TEXT NOT NULL DEFAULT (datetime('now')));
-- CREATE INDEX IF NOT EXISTS idx_sp_slug_ts ON skill_pings(slug, ts);

-- News items table — AgentRank Newspaper; survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  source TEXT DEFAULT 'manual',
  category TEXT DEFAULT 'community',
  related_tool_slugs TEXT,
  author TEXT,
  author_handle TEXT,
  thread_context TEXT,
  engagement_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  published_at TEXT,
  ingested_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_at);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_items(source);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS news_items (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT, source_url TEXT, source TEXT DEFAULT 'manual', category TEXT DEFAULT 'community', related_tool_slugs TEXT, author TEXT, author_handle TEXT, thread_context TEXT, engagement_score INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', published_at TEXT, ingested_at TEXT DEFAULT (datetime('now')));
-- CREATE INDEX IF NOT EXISTS idx_news_status ON news_items(status);
-- CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_at);
-- CREATE INDEX IF NOT EXISTS idx_news_source ON news_items(source);

-- Weekly ecosystem reports — generated every Monday, one row per ISO week
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS weekly_reports (
  id TEXT PRIMARY KEY,               -- "week-YYYY-wNN" (e.g. "week-2026-w11")
  week_start TEXT NOT NULL,          -- YYYY-MM-DD (Monday)
  week_end TEXT NOT NULL,            -- YYYY-MM-DD (Sunday)
  week_number INTEGER NOT NULL,      -- ISO week number (1-53)
  year INTEGER NOT NULL,
  total_tools INTEGER NOT NULL DEFAULT 0,
  new_tools_count INTEGER NOT NULL DEFAULT 0,
  top_10 TEXT,                       -- JSON array of top 10 tools
  biggest_movers TEXT,               -- JSON array of biggest rank changes
  new_tools TEXT,                    -- JSON array of new tools this week
  notable_releases TEXT,             -- JSON array from news_items (category=release)
  category_stats TEXT,               -- JSON object of category counts
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wr_week_start ON weekly_reports(week_start DESC);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS weekly_reports (id TEXT PRIMARY KEY, week_start TEXT NOT NULL, week_end TEXT NOT NULL, week_number INTEGER NOT NULL, year INTEGER NOT NULL, total_tools INTEGER NOT NULL DEFAULT 0, new_tools_count INTEGER NOT NULL DEFAULT 0, top_10 TEXT, biggest_movers TEXT, new_tools TEXT, notable_releases TEXT, category_stats TEXT, generated_at TEXT NOT NULL DEFAULT (datetime('now')));
-- CREATE INDEX IF NOT EXISTS idx_wr_week_start ON weekly_reports(week_start DESC);

-- Sponsor events — click/impression tracking for sponsored listings
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS sponsor_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_full_name TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'impression' | 'click' | 'cta_click'
  page_type TEXT,            -- 'homepage' | 'category' | 'detail' | 'comparison'
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_tool ON sponsor_events(tool_full_name, created_at);
-- Migration (run once on existing D1):
-- ALTER TABLE tools ADD COLUMN sponsor_description TEXT;
-- ALTER TABLE tools ADD COLUMN sponsor_cta_text TEXT;
-- ALTER TABLE tools ADD COLUMN sponsor_cta_url TEXT;
-- CREATE TABLE IF NOT EXISTS sponsor_events (id INTEGER PRIMARY KEY AUTOINCREMENT, tool_full_name TEXT NOT NULL, event_type TEXT NOT NULL, page_type TEXT, created_at INTEGER NOT NULL DEFAULT (unixepoch()));
-- CREATE INDEX IF NOT EXISTS idx_sponsor_events_tool ON sponsor_events(tool_full_name, created_at);

-- Analytics events — detailed /check endpoint usage tracking
-- survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  event_type TEXT NOT NULL DEFAULT 'check',  -- 'check'
  repo TEXT,                                  -- GitHub owner/repo checked
  found INTEGER NOT NULL DEFAULT 0,           -- 1 = found in index, 0 = not found
  status_code INTEGER NOT NULL DEFAULT 200,
  ip_country TEXT,
  referrer TEXT                               -- HTTP Referer (origin+path only)
);
CREATE INDEX IF NOT EXISTS idx_ae_ts ON analytics_events(ts);
CREATE INDEX IF NOT EXISTS idx_ae_repo ON analytics_events(repo) WHERE repo IS NOT NULL;
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS analytics_events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (datetime('now')), event_type TEXT NOT NULL DEFAULT 'check', repo TEXT, found INTEGER NOT NULL DEFAULT 0, status_code INTEGER NOT NULL DEFAULT 200, ip_country TEXT, referrer TEXT);
-- CREATE INDEX IF NOT EXISTS idx_ae_ts ON analytics_events(ts);
-- CREATE INDEX IF NOT EXISTS idx_ae_repo ON analytics_events(repo) WHERE repo IS NOT NULL;

-- Submissions table — survives pipeline DROP/CREATE cycles
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  github_url TEXT,
  github_repo TEXT,
  registry_url TEXT,
  name TEXT,
  description TEXT,
  contact_email TEXT NOT NULL,
  owner_name TEXT,
  owner_url TEXT,
  existing_slug TEXT,
  existing_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
