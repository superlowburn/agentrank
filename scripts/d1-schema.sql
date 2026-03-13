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
  matched_queries TEXT NOT NULL DEFAULT '[]'
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
  rank INTEGER
);

CREATE INDEX idx_skills_rank ON skills(rank);
CREATE INDEX idx_skills_score ON skills(score DESC);

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
