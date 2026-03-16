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
  glama_tool_calls INTEGER NOT NULL DEFAULT 0
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
  gh_is_archived INTEGER DEFAULT 0
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
