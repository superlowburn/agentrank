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
  query TEXT  -- search term (q=) or lookup URL (url=) for API requests
);
CREATE INDEX IF NOT EXISTS idx_reqlog_ts ON request_log(ts);
CREATE INDEX IF NOT EXISTS idx_reqlog_type ON request_log(type);
CREATE INDEX IF NOT EXISTS idx_reqlog_path ON request_log(path);
-- Migration (run once on existing D1):
-- ALTER TABLE request_log ADD COLUMN query TEXT;
-- ALTER TABLE request_log ADD COLUMN referrer TEXT;

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
  source TEXT NOT NULL DEFAULT 'homepage',  -- 'homepage', 'tool', 'skill'
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);
-- Migration (run once on existing D1):
-- CREATE TABLE IF NOT EXISTS email_subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'homepage', subscribed_at TEXT NOT NULL DEFAULT (datetime('now')));
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
-- CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);

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
