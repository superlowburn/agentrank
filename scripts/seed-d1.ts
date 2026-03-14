import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const db = new Database(join(ROOT, 'data', 'agentrank.db'), { readonly: true });

const lines: string[] = [];
const CHUNK_SIZE = 10;

const esc = (v: unknown, maxLen?: number): string => {
  if (v === null || v === undefined) return 'NULL';
  let s = String(v);
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
  s = s.replace(/'/g, "''");
  return `'${s}'`;
};

// --- Tools ---
const toolRows = db.prepare(`
  SELECT full_name, url, description, stars, forks, open_issues, closed_issues,
         contributors, dependents, language, license, last_commit_at, is_archived, matched_queries,
         readme_excerpt, github_topics, glama_weekly_downloads, glama_tool_calls,
         score, rank
  FROM repos
  WHERE score IS NOT NULL AND rank IS NOT NULL
  ORDER BY rank ASC
`).all() as Array<Record<string, unknown>>;

for (let i = 0; i < toolRows.length; i += CHUNK_SIZE) {
  const chunk = toolRows.slice(i, i + CHUNK_SIZE);
  const values = chunk.map((r) => {
    return `(${r.rank}, ${esc(r.full_name)}, ${esc(r.url)}, ${esc(r.description)}, ${r.score}, ${r.stars}, ${r.forks}, ${r.open_issues}, ${r.closed_issues}, ${r.contributors}, ${r.dependents ?? 0}, ${esc(r.language)}, ${esc(r.license)}, ${esc(r.last_commit_at)}, ${r.is_archived ? 1 : 0}, ${esc(r.matched_queries)}, ${esc(r.readme_excerpt, 1000)}, ${esc(r.github_topics)}, ${r.glama_weekly_downloads ?? 0}, ${r.glama_tool_calls ?? 0})`;
  });

  lines.push(
    `INSERT INTO tools (rank, full_name, url, description, score, stars, forks, open_issues, closed_issues, contributors, dependents, language, license, last_commit_at, is_archived, matched_queries, readme_excerpt, github_topics, glama_weekly_downloads, glama_tool_calls) VALUES\n${values.join(',\n')};`
  );
}

console.log(`Tools: ${toolRows.length} rows`);

// --- Skills ---
const skillRows = db.prepare(`
  SELECT slug, name, description, github_repo, source, installs, trending_rank, platforms, author, score, rank
  FROM skills
  WHERE score IS NOT NULL AND rank IS NOT NULL
  ORDER BY rank ASC
`).all() as Array<Record<string, unknown>>;

for (let i = 0; i < skillRows.length; i += CHUNK_SIZE) {
  const chunk = skillRows.slice(i, i + CHUNK_SIZE);
  const values = chunk.map((r) => {
    return `(${esc(r.slug)}, ${esc(r.name)}, ${esc(r.description)}, ${esc(r.github_repo)}, ${esc(r.source)}, ${r.installs}, ${r.trending_rank ?? 'NULL'}, ${esc(r.platforms)}, ${esc(r.author)}, ${r.score}, ${r.rank})`;
  });

  lines.push(
    `INSERT INTO skills (slug, name, description, github_repo, source, installs, trending_rank, platforms, author, score, rank) VALUES\n${values.join(',\n')};`
  );
}

console.log(`Skills: ${skillRows.length} rows`);

const outPath = join(ROOT, 'data', 'd1-seed.sql');
writeFileSync(outPath, lines.join('\n\n') + '\n');

console.log(`Wrote ${toolRows.length + skillRows.length} total rows to ${outPath} (${lines.length} INSERT statements)`);

db.close();
