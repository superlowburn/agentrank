import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function classifyTool(desc: string | null, matchedQueries: string, topics: string, fullName: string): string {
  const text = [(desc || ''), topics, fullName].join(' ').toLowerCase();
  const queries = (matchedQueries || '').toLowerCase();
  if (/\b(multi[- ]?agent|orchestrat|workflow)\b/.test(text) ||
      /a2a/.test(queries) ||
      /\b(sdk|framework|library|toolkit)\b.*\b(mcp|agent|llm)\b|\b(mcp|agent|llm)\b.*\b(sdk|framework|library|toolkit)\b/.test(text)) return 'agent-framework';
  if (/\b(playwright|puppeteer|selenium|headless.*browser|browser.*automat|web.*scrape|scraping)\b/.test(text)) return 'browser-automation';
  if (/\b(postgres|postgresql|mysql|sqlite|mongodb|redis|cassandra|supabase|neon|planetscale|cockroach|turso|libsql|database.*server|sql.*server)\b/.test(text)) return 'database';
  if (/\b(vector.*store|vector.*db|embedding.*search|semantic.*search|rag\b|retrieval.*augment|pinecone|weaviate|qdrant|chroma|milvus|opensearch|elasticsearch)\b/.test(text)) return 'search';
  if (/\b(prometheus|grafana|datadog|sentry|opentelemetry|otel|observability|telemetry|tracing)\b/.test(text)) return 'monitoring';
  if (/\b(slack|discord|telegram|twilio|sendgrid|mailgun|smtp|email.*send|send.*email|webhook.*notif)\b/.test(text)) return 'communication';
  if (/\b(litellm|llm.*gateway|llm.*proxy|llm.*router|ai.*gateway|openai.*compat|model.*router)\b/.test(text)) return 'llm-client';
  if (/\b(apache.*kafka|apache.*spark|apache.*airflow|dbt\b|etl\b|data.*pipeline|data.*ingestion|data.*transform)\b/.test(text)) return 'data-processing';
  if (/mcp|model.*context.*protocol/.test(queries)) return 'mcp-server';
  return 'ai-tool';
}

function classifySkill(desc: string | null, name: string | null, slug: string, source: string): string {
  const text = [(desc || ''), (name || ''), slug].join(' ').toLowerCase();
  if (/\b(playwright|puppeteer|selenium|browser.*use|browser.*automat|web.*scrape|headless)\b/.test(text)) return 'browser-automation';
  if (/\b(postgres|postgresql|mysql|sqlite|mongodb|redis|supabase|neon|database)\b/.test(text)) return 'database';
  if (/\b(vector.*store|vector.*db|semantic.*search|rag\b|embedding|pinecone|weaviate|qdrant|chroma)\b/.test(text)) return 'search';
  if (/\b(prometheus|grafana|datadog|sentry|opentelemetry|observability|telemetry|tracing)\b/.test(text)) return 'monitoring';
  if (/\b(slack|discord|telegram|twilio|sendgrid|email.*send|webhook)\b/.test(text)) return 'communication';
  if (/\b(framework|orchestrat|multi[- ]?agent|workflow.*agent|agent.*workflow)\b/.test(text)) return 'agent-framework';
  if (source === 'glama' || /\b(mcp|model.*context.*protocol)\b/.test(text)) return 'mcp-server';
  if (/\b(github|copilot|lint|linting|test.*run|ci.*cd|deploy|turborepo|eslint|prettier)\b/.test(text)) return 'code-assistant';
  return 'ai-tool';
}

const db = new Database(join(ROOT, 'data', 'agentrank.db'), { readonly: true });

const lines: string[] = [];
const CHUNK_SIZE = 10;

// Clear existing data before re-seeding
lines.push('DELETE FROM tools;');
lines.push('DELETE FROM skills;');

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
         npm_downloads, npm_package, pypi_downloads, pypi_package,
         score, rank
  FROM repos
  WHERE score IS NOT NULL AND rank IS NOT NULL
  ORDER BY rank ASC
`).all() as Array<Record<string, unknown>>;

// Safety guard: refuse to seed if tool count is suspiciously low
const MIN_TOOLS = 500;
if (toolRows.length < MIN_TOOLS) {
  console.error(`ABORT: Only ${toolRows.length} tools found (minimum ${MIN_TOOLS}). DB may be corrupted or crawl incomplete.`);
  console.error('Refusing to seed D1 to prevent wiping good data with bad data.');
  db.close();
  process.exit(1);
}

for (let i = 0; i < toolRows.length; i += CHUNK_SIZE) {
  const chunk = toolRows.slice(i, i + CHUNK_SIZE);
  const values = chunk.map((r) => {
    const cat = classifyTool(r.description as string | null, r.matched_queries as string, r.github_topics as string, r.full_name as string);
    return `(${r.rank}, ${esc(r.full_name)}, ${esc(r.url)}, ${esc(r.description)}, ${r.score}, ${r.stars}, ${r.forks}, ${r.open_issues}, ${r.closed_issues}, ${r.contributors}, ${r.dependents ?? 0}, ${esc(r.language)}, ${esc(r.license)}, ${esc(r.last_commit_at)}, ${r.is_archived ? 1 : 0}, ${esc(r.matched_queries)}, ${esc(r.readme_excerpt, 1000)}, ${esc(r.github_topics)}, ${r.glama_weekly_downloads ?? 0}, ${r.glama_tool_calls ?? 0}, ${r.npm_downloads ?? 0}, ${esc(r.npm_package)}, ${r.pypi_downloads ?? 0}, ${esc(r.pypi_package)}, ${esc(cat)})`;
  });

  lines.push(
    `INSERT INTO tools (rank, full_name, url, description, score, stars, forks, open_issues, closed_issues, contributors, dependents, language, license, last_commit_at, is_archived, matched_queries, readme_excerpt, github_topics, glama_weekly_downloads, glama_tool_calls, npm_weekly_downloads, npm_package, pypi_weekly_downloads, pypi_package, category) VALUES\n${values.join(',\n')};`
  );
}

console.log(`Tools: ${toolRows.length} rows`);

// --- Skills ---
const skillRows = db.prepare(`
  SELECT slug, name, description, github_repo, source, installs, trending_rank, platforms, author, score, rank,
         gh_stars, gh_open_issues, gh_closed_issues, gh_contributors, gh_last_commit_at, gh_is_archived
  FROM skills
  WHERE score IS NOT NULL AND rank IS NOT NULL
  ORDER BY rank ASC
`).all() as Array<Record<string, unknown>>;

for (let i = 0; i < skillRows.length; i += CHUNK_SIZE) {
  const chunk = skillRows.slice(i, i + CHUNK_SIZE);
  const values = chunk.map((r) => {
    const cat = classifySkill(r.description as string | null, r.name as string | null, r.slug as string, r.source as string);
    return `(${esc(r.slug)}, ${esc(r.name)}, ${esc(r.description)}, ${esc(r.github_repo)}, ${esc(r.source)}, ${r.installs}, ${r.trending_rank ?? 'NULL'}, ${esc(r.platforms)}, ${esc(r.author)}, ${r.score}, ${r.rank}, ${r.gh_stars ?? 'NULL'}, ${r.gh_open_issues ?? 'NULL'}, ${r.gh_closed_issues ?? 'NULL'}, ${r.gh_contributors ?? 'NULL'}, ${esc(r.gh_last_commit_at)}, ${r.gh_is_archived ?? 0}, ${esc(cat)})`;
  });

  lines.push(
    `INSERT INTO skills (slug, name, description, github_repo, source, installs, trending_rank, platforms, author, score, rank, gh_stars, gh_open_issues, gh_closed_issues, gh_contributors, gh_last_commit_at, gh_is_archived, category) VALUES\n${values.join(',\n')};`
  );
}

console.log(`Skills: ${skillRows.length} rows`);

const outPath = join(ROOT, 'data', 'd1-seed.sql');
writeFileSync(outPath, lines.join('\n\n') + '\n');

console.log(`Wrote ${toolRows.length + skillRows.length} total rows to ${outPath} (${lines.length} INSERT statements)`);

db.close();
