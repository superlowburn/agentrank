import Database from 'better-sqlite3';
import { Octokit } from '@octokit/rest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'data', 'agentrank.db');

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const topArg = args.find(a => a.startsWith('--top='));
const topN = topArg ? parseInt(topArg.split('=')[1], 10) : 50;

interface RankedRepo {
  full_name: string;
  url: string;
  score: number;
  rank: number;
  stars: number;
  contributors: number;
  open_issues: number;
  closed_issues: number;
  dependents: number;
  last_commit_at: string | null;
}

function initOutreachLog(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS outreach_log (
      full_name TEXT PRIMARY KEY,
      issue_url TEXT NOT NULL,
      rank_at_outreach INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function computeSignalScores(repo: RankedRepo) {
  // Freshness
  let freshness: number;
  if (!repo.last_commit_at) {
    freshness = 0;
  } else {
    const days = Math.max(0, (Date.now() - new Date(repo.last_commit_at).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) freshness = 100;
    else if (days <= 90) freshness = Math.round((1.0 - (days - 7) / 83) * 100);
    else freshness = Math.round(Math.max(0, Math.exp(-(days - 90) / 90) * 10));
  }

  // Issue health
  const totalIssues = repo.open_issues + repo.closed_issues;
  const issueHealth = totalIssues === 0 ? 50 : Math.round((repo.closed_issues / totalIssues) * 100);

  // Stars (log-normalized against a reasonable max)
  const starsNorm = Math.round(Math.min(100, Math.log(1 + repo.stars) / Math.log(1 + 100000) * 100));

  // Contributors
  const contribNorm = Math.round(Math.min(100, Math.log(1 + repo.contributors) / Math.log(1 + 500) * 100));

  // Dependents
  const depsNorm = repo.dependents > 0 ? Math.round(Math.min(100, Math.log(1 + repo.dependents) / Math.log(1 + 10000) * 100)) : null;

  return { freshness, issueHealth, stars: starsNorm, contributors: contribNorm, dependents: depsNorm };
}

function buildIssueBody(repo: RankedRepo, totalTools: number): { title: string; body: string } {
  const signals = computeSignalScores(repo);

  const title = `Your project ranks #${repo.rank} on AgentRank`;

  const slug = repo.full_name.replace('/', '--');
  const profileUrl = `https://agentrank-ai.com/tool/${slug}`;

  // Build signal table rows — only include available signals
  const signalRows = [
    `| Freshness | ${signals.freshness}/100 |`,
    `| Issue Health | ${signals.issueHealth}/100 |`,
    signals.dependents !== null ? `| Dependents | ${signals.dependents}/100 |` : null,
    `| Stars | ${signals.stars}/100 |`,
    `| Contributors | ${signals.contributors}/100 |`,
  ].filter(Boolean).join('\n');

  const body = `Hey there — just wanted to let you know that **${repo.full_name}** currently ranks **#${repo.rank}** out of ${totalTools.toLocaleString('en-US')}+ MCP servers and agent tools indexed on [AgentRank](https://agentrank-ai.com).

### Your score: ${repo.score.toFixed(2)} / 100

| Signal | Score |
|--------|-------|
${signalRows}

[See your full profile on AgentRank →](${profileUrl})

---

**What is AgentRank?** The reputation layer for AI skills, tools & agents — scored by real adoption data, maintenance activity, and community health. Updated daily.

We're building this because developers and AI agents need a way to evaluate which tools are well-maintained and widely trusted. Your project scored well — that's worth knowing.

Questions or feedback? Reply here or email agentrank-ai@agentmail.to.`;

  return { title, body };
}

async function main(): Promise<void> {
  const db = new Database(DB_PATH, { readonly: dryRun });
  if (!dryRun) {
    db.pragma('journal_mode = WAL');
    initOutreachLog(db);
  }

  // Get ranked tools
  const repos = db.prepare(`
    SELECT full_name, url, score, rank, stars, contributors, open_issues, closed_issues, dependents, last_commit_at
    FROM repos
    WHERE rank IS NOT NULL
    ORDER BY rank ASC
    LIMIT ?
  `).all(topN) as RankedRepo[];

  const totalTools = (db.prepare('SELECT COUNT(*) as count FROM repos WHERE rank IS NOT NULL').get() as { count: number }).count;

  // Check outreach log for already-contacted repos
  let alreadyContacted: Set<string>;
  if (!dryRun) {
    const contacted = db.prepare('SELECT full_name FROM outreach_log').all() as { full_name: string }[];
    alreadyContacted = new Set(contacted.map(r => r.full_name));
  } else {
    // In dry-run, try to read the table but don't fail if it doesn't exist
    try {
      const contacted = db.prepare('SELECT full_name FROM outreach_log').all() as { full_name: string }[];
      alreadyContacted = new Set(contacted.map(r => r.full_name));
    } catch {
      alreadyContacted = new Set();
    }
  }

  const toContact = repos.filter(r => !alreadyContacted.has(r.full_name));

  console.log(`\nAgentRank Outreach${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`Total tools: ${totalTools.toLocaleString('en-US')}`);
  console.log(`Top ${topN} selected, ${alreadyContacted.size} already contacted, ${toContact.length} to contact\n`);

  if (toContact.length === 0) {
    console.log('Nothing to do.');
    db.close();
    return;
  }

  let octokit: Octokit | null = null;
  if (!dryRun) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN environment variable required for live mode');
      process.exit(1);
    }
    octokit = new Octokit({ auth: token });
  }

  const logInsert = !dryRun ? db.prepare(`
    INSERT INTO outreach_log (full_name, issue_url, rank_at_outreach) VALUES (?, ?, ?)
  `) : null;

  for (const repo of toContact) {
    const [owner, repoName] = repo.full_name.split('/');
    const { title, body } = buildIssueBody(repo, totalTools);

    if (dryRun) {
      console.log('─'.repeat(72));
      console.log(`REPO: ${repo.full_name} (rank #${repo.rank}, score ${repo.score.toFixed(2)})`);
      console.log(`TITLE: ${title}`);
      console.log(`\n${body}\n`);
    } else {
      try {
        const response = await octokit!.issues.create({
          owner,
          repo: repoName,
          title,
          body,
        });

        const issueUrl = response.data.html_url;
        logInsert!.run(repo.full_name, issueUrl, repo.rank);
        console.log(`#${repo.rank} ${repo.full_name} -> ${issueUrl}`);

        // Rate limit: 2-second pause between issues
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err: any) {
        console.error(`FAILED: ${repo.full_name} — ${err.message}`);
      }
    }
  }

  console.log(`\nDone. ${dryRun ? 'No issues created (dry run).' : `${toContact.length} issues created.`}`);
  db.close();
}

main().catch(console.error);
