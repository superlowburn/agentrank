import type { APIContext } from 'astro';
import { formatInstalls, sourceLabel } from '../../data/skills';
import { relativeTime } from '../../data/tools';

function ratingBar(value: number): string {
  const filled = Math.round(value / 10);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
}

export async function GET({ params, locals }: APIContext) {
  const slug = params.slug!;
  const decoded = slug.replace(/--/g, '/').replace(/^(skills\.sh|glama|clawhub)-/, '$1:');

  const { env } = (locals as any).runtime;

  let row = await env.DB.prepare('SELECT * FROM skills WHERE slug = ?').bind(decoded).first();
  if (!row) {
    row = await env.DB.prepare('SELECT * FROM skills WHERE slug = ?').bind(slug).first();
  }

  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  const skill = {
    rank: row.rank as number,
    slug: row.slug as string,
    name: (row.name as string | null) || row.slug as string,
    description: row.description as string | null,
    score: row.score as number,
    installs: row.installs as number,
    platforms: JSON.parse(row.platforms as string || '[]') as string[],
    source: row.source as string,
    github_repo: row.github_repo as string | null,
    author: row.author as string | null,
    trending_rank: row.trending_rank as number | null,
  };

  // Look up linked GitHub repo data
  let repoData: { stars: number; last_commit_at: string; contributors: number; open_issues: number; closed_issues: number } | null = null;
  let readmeExcerpt: string | null = null;
  if (skill.github_repo) {
    const repoRow = await env.DB.prepare('SELECT stars, last_commit_at, contributors, open_issues, closed_issues, readme_excerpt FROM tools WHERE full_name = ?')
      .bind(skill.github_repo).first();
    if (repoRow) {
      repoData = {
        stars: repoRow.stars as number,
        last_commit_at: repoRow.last_commit_at as string,
        contributors: repoRow.contributors as number,
        open_issues: repoRow.open_issues as number,
        closed_issues: repoRow.closed_issues as number,
      };
      readmeExcerpt = repoRow.readme_excerpt as string | null;
    }
  }

  const totalSkills = (await env.DB.prepare('SELECT COUNT(*) as count FROM skills').first())?.count as number || 0;

  // Related skills
  const relatedRows = await env.DB.prepare(
    'SELECT slug, name, score, rank FROM skills WHERE slug != ? AND score IS NOT NULL ORDER BY score DESC LIMIT 5'
  ).bind(skill.slug).all();
  const relatedSkills = relatedRows.results || [];

  // Build markdown
  const lines: string[] = [];
  lines.push(`# ${skill.name}`);
  lines.push('');
  if (skill.description) {
    lines.push(`> ${skill.description}`);
    lines.push('');
  }
  lines.push(`**AgentRank Score:** ${skill.score.toFixed(1)}/100 | **Rank:** #${skill.rank} of ${totalSkills}`);
  lines.push(`**Source:** ${sourceLabel(skill.source)}${skill.author ? ` | **Author:** ${skill.author}` : ''}`);
  lines.push('');

  // Overview
  const topPercent = Math.ceil((skill.rank / totalSkills) * 100);
  lines.push('## Overview');
  lines.push('');
  lines.push(`Ranked #${skill.rank} out of ${totalSkills} indexed skills.`);
  if (topPercent <= 10) {
    lines.push(`In the top ${topPercent}% of all indexed skills.`);
  }
  if (skill.installs > 0) {
    lines.push(`${formatInstalls(skill.installs)} installs.`);
  }
  lines.push('');

  // Signals table
  lines.push('## Signals');
  lines.push('');
  lines.push('| Signal | Value | Rating |');
  lines.push('|--------|-------|--------|');
  lines.push(`| Installs | ${formatInstalls(skill.installs)} | ${ratingBar(Math.min(100, Math.log(1 + skill.installs) / Math.log(1 + 200000) * 100))} |`);
  if (repoData) {
    const days = Math.floor((Date.now() - new Date(repoData.last_commit_at).getTime()) / (1000 * 60 * 60 * 24));
    let freshBar: number;
    if (days <= 7) freshBar = 100;
    else if (days <= 90) freshBar = 100 - ((days - 7) / 83) * 60;
    else freshBar = Math.max(0, 40 * Math.exp(-(days - 90) / 180));
    lines.push(`| Freshness | ${relativeTime(repoData.last_commit_at)} | ${ratingBar(freshBar)} |`);
    const totalIssues = repoData.open_issues + repoData.closed_issues;
    const ih = totalIssues > 0 ? repoData.closed_issues / totalIssues : 0.5;
    lines.push(`| Issue Health | ${(ih * 100).toFixed(0)}% | ${ratingBar(ih * 100)} |`);
    lines.push(`| Stars | ${repoData.stars.toLocaleString('en-US')} | ${ratingBar(Math.min(100, Math.log(1 + repoData.stars) / Math.log(1 + 200000) * 100))} |`);
    lines.push(`| Contributors | ${repoData.contributors} | ${ratingBar(Math.min(100, Math.log(1 + repoData.contributors) / Math.log(1 + 500) * 100))} |`);
  }
  lines.push(`| Platforms | ${skill.platforms.length} | ${ratingBar(Math.min(100, skill.platforms.length / 21 * 100))} |`);
  lines.push('');

  // Platforms
  if (skill.platforms.length > 0) {
    lines.push('## Platforms');
    lines.push('');
    lines.push(skill.platforms.join(', '));
    lines.push('');
  }

  // README excerpt
  if (readmeExcerpt) {
    lines.push('## From the README');
    lines.push('');
    lines.push(readmeExcerpt);
    lines.push('');
    if (skill.github_repo) {
      lines.push(`[Read full README on GitHub](https://github.com/${skill.github_repo}#readme)`);
      lines.push('');
    }
  }

  // Related skills
  if (relatedSkills.length > 0) {
    lines.push('## Top Ranked Skills');
    lines.push('');
    for (const r of relatedSkills) {
      const rSlug = (r.slug as string).replace(/\//g, '--').replace(/:/g, '-');
      lines.push(`- [${(r.name as string) || (r.slug as string)}](/skill/${rSlug}.md) — Score: ${(r.score as number).toFixed(1)}`);
    }
    lines.push('');
  }

  // Links
  lines.push('## Links');
  lines.push('');
  if (skill.github_repo) {
    lines.push(`- [GitHub](https://github.com/${skill.github_repo})`);
  }
  if (skill.source === 'skills.sh') {
    lines.push(`- [skills.sh](https://skills.sh/${skill.slug})`);
  } else if (skill.source === 'glama') {
    lines.push(`- [Glama](https://glama.ai/mcp/servers/${skill.slug})`);
  }
  lines.push('');

  lines.push('---');
  lines.push(`*Data from [AgentRank](https://agentrank-ai.com/skill/${slug}/). Updated nightly.*`);

  const markdown = lines.join('\n');

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
