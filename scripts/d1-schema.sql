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
  category TEXT
);

CREATE INDEX idx_tools_full_name ON tools(full_name);
CREATE INDEX idx_tools_rank ON tools(rank);
CREATE INDEX idx_tools_score ON tools(score DESC);

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
  utm_source TEXT   -- utm_source param from page request URL (distribution channel)
);
CREATE INDEX IF NOT EXISTS idx_reqlog_ts ON request_log(ts);
CREATE INDEX IF NOT EXISTS idx_reqlog_type ON request_log(type);
CREATE INDEX IF NOT EXISTS idx_reqlog_path ON request_log(path);
CREATE INDEX IF NOT EXISTS idx_reqlog_utm ON request_log(utm_source) WHERE utm_source IS NOT NULL;
-- Migration (run once on existing D1):
-- ALTER TABLE request_log ADD COLUMN query TEXT;
-- ALTER TABLE request_log ADD COLUMN referrer TEXT;
-- ALTER TABLE request_log ADD COLUMN utm_source TEXT;
-- CREATE INDEX IF NOT EXISTS idx_reqlog_utm ON request_log(utm_source) WHERE utm_source IS NOT NULL;

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
  is_deprecated INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'removed'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tool_full_name, github_username)
);
CREATE INDEX IF NOT EXISTS idx_claims_tool ON claims(tool_full_name);
CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(github_username);

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
  source TEXT NOT NULL DEFAULT 'homepage',  -- 'homepage', 'blog', 'embed'
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed INTEGER NOT NULL DEFAULT 0,     -- 0 = unconfirmed, 1 = confirmed
  ip_hash TEXT                              -- SHA-256 of subscriber IP (not raw)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);
-- Migration (run once on existing D1):
-- ALTER TABLE email_subscribers ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE email_subscribers ADD COLUMN ip_hash TEXT;

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
