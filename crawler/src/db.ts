import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../data/agentrank.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
  }
  return _db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS repos (
      id INTEGER PRIMARY KEY,
      full_name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      description TEXT,
      stars INTEGER NOT NULL DEFAULT 0,
      forks INTEGER NOT NULL DEFAULT 0,
      open_issues INTEGER NOT NULL DEFAULT 0,
      closed_issues INTEGER NOT NULL DEFAULT 0,
      contributors INTEGER NOT NULL DEFAULT 0,
      language TEXT,
      license TEXT,
      last_commit_at TEXT,
      dependents INTEGER NOT NULL DEFAULT 0,
      first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_crawled_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_fork INTEGER NOT NULL DEFAULT 0,
      parent_stars INTEGER,
      matched_queries TEXT NOT NULL DEFAULT '[]',
      score REAL,
      rank INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_repos_score ON repos(score DESC);
    CREATE INDEX IF NOT EXISTS idx_repos_stars ON repos(stars DESC);
    CREATE INDEX IF NOT EXISTS idx_repos_full_name ON repos(full_name);
  `);

  // Add Glama columns to repos (safe if already exist)
  try {
    db.exec(`ALTER TABLE repos ADD COLUMN glama_weekly_downloads INTEGER DEFAULT 0`);
  } catch { /* column already exists */ }
  try {
    db.exec(`ALTER TABLE repos ADD COLUMN glama_tool_calls INTEGER DEFAULT 0`);
  } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE repos ADD COLUMN readme_excerpt TEXT`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE repos ADD COLUMN github_topics TEXT DEFAULT '[]'`); } catch { /* column already exists */ }

  // Skills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT,
      description TEXT,
      github_repo TEXT,
      source TEXT NOT NULL,
      installs INTEGER NOT NULL DEFAULT 0,
      trending_rank INTEGER,
      platforms TEXT NOT NULL DEFAULT '[]',
      author TEXT,
      first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_crawled_at TEXT NOT NULL DEFAULT (datetime('now')),
      score REAL,
      rank INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_skills_source ON skills(source);
    CREATE INDEX IF NOT EXISTS idx_skills_score ON skills(score DESC);
    CREATE INDEX IF NOT EXISTS idx_skills_rank ON skills(rank);
  `);

  // Add GitHub enrichment columns to skills (safe if already exist)
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_stars INTEGER`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_open_issues INTEGER`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_closed_issues INTEGER`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_contributors INTEGER`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_last_commit_at TEXT`); } catch { /* column already exists */ }
  try { db.exec(`ALTER TABLE skills ADD COLUMN gh_is_archived INTEGER DEFAULT 0`); } catch { /* column already exists */ }

  // Agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
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
  `);
}

export interface RepoRow {
  id: number;
  full_name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  closed_issues: number;
  contributors: number;
  language: string | null;
  license: string | null;
  last_commit_at: string | null;
  dependents: number;
  first_seen_at: string;
  last_crawled_at: string;
  is_archived: number;
  is_fork: number;
  parent_stars: number | null;
  matched_queries: string;
  score: number | null;
  rank: number | null;
  readme_excerpt: string | null;
  github_topics: string;
  glama_weekly_downloads: number;
  glama_tool_calls: number;
}

export function upsertRepo(repo: {
  id: number;
  full_name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  language: string | null;
  license: string | null;
  last_commit_at: string | null;
  is_archived: boolean;
  is_fork: boolean;
  parent_stars?: number | null;
  matched_query: string;
}): void {
  const db = getDb();

  const existing = db
    .prepare("SELECT matched_queries FROM repos WHERE id = ?")
    .get(repo.id) as { matched_queries: string } | undefined;

  let matchedQueries: string[];
  if (existing) {
    matchedQueries = JSON.parse(existing.matched_queries);
    if (!matchedQueries.includes(repo.matched_query)) {
      matchedQueries.push(repo.matched_query);
    }
  } else {
    matchedQueries = [repo.matched_query];
  }

  db.prepare(`
    INSERT INTO repos (id, full_name, url, description, stars, forks, open_issues,
      language, license, last_commit_at, is_archived, is_fork, parent_stars, matched_queries, last_crawled_at)
    VALUES (@id, @full_name, @url, @description, @stars, @forks, @open_issues,
      @language, @license, @last_commit_at, @is_archived, @is_fork, @parent_stars, @matched_queries, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      url = excluded.url,
      description = excluded.description,
      stars = excluded.stars,
      forks = excluded.forks,
      open_issues = excluded.open_issues,
      language = excluded.language,
      license = excluded.license,
      last_commit_at = excluded.last_commit_at,
      is_archived = excluded.is_archived,
      is_fork = excluded.is_fork,
      parent_stars = excluded.parent_stars,
      matched_queries = excluded.matched_queries,
      last_crawled_at = datetime('now')
  `).run({
    id: repo.id,
    full_name: repo.full_name,
    url: repo.url,
    description: repo.description,
    stars: repo.stars,
    forks: repo.forks,
    open_issues: repo.open_issues,
    language: repo.language,
    license: repo.license,
    last_commit_at: repo.last_commit_at,
    is_archived: repo.is_archived ? 1 : 0,
    is_fork: repo.is_fork ? 1 : 0,
    parent_stars: repo.parent_stars ?? null,
    matched_queries: JSON.stringify(matchedQueries),
  });
}

export interface SkillRow {
  id: number;
  slug: string;
  name: string | null;
  description: string | null;
  github_repo: string | null;
  source: string;
  installs: number;
  trending_rank: number | null;
  platforms: string;
  author: string | null;
  first_seen_at: string;
  last_crawled_at: string;
  score: number | null;
  rank: number | null;
  gh_stars: number | null;
  gh_open_issues: number | null;
  gh_closed_issues: number | null;
  gh_contributors: number | null;
  gh_last_commit_at: string | null;
  gh_is_archived: number;
}

export function upsertSkill(skill: {
  slug: string;
  name: string | null;
  description: string | null;
  github_repo: string | null;
  source: string;
  installs: number;
  trending_rank?: number | null;
  platforms: string[];
  author: string | null;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO skills (slug, name, description, github_repo, source, installs, trending_rank, platforms, author, last_crawled_at)
    VALUES (@slug, @name, @description, @github_repo, @source, @installs, @trending_rank, @platforms, @author, datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      github_repo = COALESCE(excluded.github_repo, skills.github_repo),
      installs = MAX(excluded.installs, skills.installs),
      trending_rank = excluded.trending_rank,
      platforms = excluded.platforms,
      author = COALESCE(excluded.author, skills.author),
      last_crawled_at = datetime('now')
  `).run({
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    github_repo: skill.github_repo?.replace(/^https?:\/\/github\.com\//, '') ?? null,
    source: skill.source,
    installs: skill.installs,
    trending_rank: skill.trending_rank ?? null,
    platforms: JSON.stringify(skill.platforms),
    author: skill.author,
  });
}

export function updateRepoGlama(
  fullName: string,
  data: { weekly_downloads: number; tool_calls: number }
): void {
  const db = getDb();
  db.prepare(
    `UPDATE repos SET glama_weekly_downloads = ?, glama_tool_calls = ? WHERE full_name = ?`
  ).run(data.weekly_downloads, data.tool_calls, fullName);
}

export function getSkillCount(): number {
  const db = getDb();
  return (db.prepare("SELECT COUNT(*) as count FROM skills").get() as { count: number }).count;
}

export function getStaleRepos(daysOld: number = 7): RepoRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM repos
       WHERE last_crawled_at < datetime('now', ? || ' days')
         OR contributors = 0
       ORDER BY stars DESC`
    )
    .all(`-${daysOld}`) as RepoRow[];
}

export function updateEnrichment(
  id: number,
  data: { closed_issues: number; contributors: number }
): void {
  const db = getDb();
  db.prepare(
    `UPDATE repos SET closed_issues = ?, contributors = ?, last_crawled_at = datetime('now')
     WHERE id = ?`
  ).run(data.closed_issues, data.contributors, id);
}

export function updateReadmeAndTopics(
  id: number,
  data: { readme_excerpt: string | null; github_topics: string[] }
): void {
  const db = getDb();
  db.prepare(
    `UPDATE repos SET readme_excerpt = ?, github_topics = ? WHERE id = ?`
  ).run(data.readme_excerpt, JSON.stringify(data.github_topics), id);
}

export function getReposNeedingContent(limit: number): RepoRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM repos
       WHERE readme_excerpt IS NULL
       ORDER BY stars DESC
       LIMIT ?`
    )
    .all(limit) as RepoRow[];
}

export function getRepoCount(): number {
  const db = getDb();
  return (db.prepare("SELECT COUNT(*) as count FROM repos").get() as { count: number }).count;
}

export function updateDependents(fullName: string, count: number): void {
  const db = getDb();
  db.prepare(
    `UPDATE repos SET dependents = ?, last_crawled_at = datetime('now') WHERE full_name = ?`
  ).run(count, fullName);
}

export function getReposForDependents(limit: number, offset: number, minStars: number): RepoRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM repos
       WHERE dependents = 0 AND stars >= ?
       ORDER BY stars DESC
       LIMIT ? OFFSET ?`
    )
    .all(minStars, limit, offset) as RepoRow[];
}

export function getTopReposForDependentsRefresh(limit: number): RepoRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM repos
       ORDER BY stars DESC
       LIMIT ?`
    )
    .all(limit) as RepoRow[];
}

export interface SkillGithubData {
  gh_stars: number;
  gh_open_issues: number;
  gh_closed_issues: number;
  gh_contributors: number;
  gh_last_commit_at: string | null;
  gh_is_archived: number;
}

export function getSkillsNeedingGithubEnrichment(limit: number): SkillRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM skills
       WHERE github_repo IS NOT NULL AND gh_stars IS NULL
       ORDER BY installs DESC
       LIMIT ?`
    )
    .all(limit) as SkillRow[];
}

export function updateSkillGithubData(slug: string, data: SkillGithubData): void {
  const db = getDb();
  db.prepare(
    `UPDATE skills SET
       gh_stars = ?, gh_open_issues = ?, gh_closed_issues = ?,
       gh_contributors = ?, gh_last_commit_at = ?, gh_is_archived = ?
     WHERE slug = ?`
  ).run(
    data.gh_stars, data.gh_open_issues, data.gh_closed_issues,
    data.gh_contributors, data.gh_last_commit_at, data.gh_is_archived,
    slug
  );
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
