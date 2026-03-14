import type { APIContext } from 'astro';
import { relativeTime } from '../../data/tools';

function ratingBar(value: number): string {
  const filled = Math.round(value / 10);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
}

export async function GET({ params, locals }: APIContext) {
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');

  const { env } = (locals as any).runtime;
  const row = await env.DB.prepare('SELECT * FROM tools WHERE full_name = ?').bind(fullName).first();

  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  const tool = {
    rank: row.rank as number,
    full_name: row.full_name as string,
    url: row.url as string,
    description: row.description as string | null,
    score: row.score as number,
    stars: row.stars as number,
    forks: row.forks as number,
    open_issues: row.open_issues as number,
    closed_issues: row.closed_issues as number,
    contributors: row.contributors as number,
    dependents: row.dependents as number,
    language: row.language as string | null,
    license: row.license as string | null,
    last_commit_at: row.last_commit_at as string,
    matched_queries: JSON.parse(row.matched_queries as string || '[]') as string[],
  };

  const readmeExcerpt = row.readme_excerpt as string | null;
  const githubTopics: string[] = JSON.parse(row.github_topics as string || '[]');
  const glamaDownloads = (row.glama_weekly_downloads as number) || 0;
  const glamaToolCalls = (row.glama_tool_calls as number) || 0;

  const totalTools = (await env.DB.prepare('SELECT COUNT(*) as count FROM tools').first())?.count as number || 0;
  const totalIssues = tool.open_issues + tool.closed_issues;
  const issueHealth = totalIssues > 0 ? (tool.closed_issues / totalIssues) : 0.5;

  // Freshness bar
  const days = Math.floor((Date.now() - new Date(tool.last_commit_at).getTime()) / (1000 * 60 * 60 * 24));
  let freshnessBar: number;
  if (days <= 7) freshnessBar = 100;
  else if (days <= 90) freshnessBar = 100 - ((days - 7) / 83) * 60;
  else freshnessBar = Math.max(0, 40 * Math.exp(-(days - 90) / 180));

  // Related tools
  const relatedRows = await env.DB.prepare(
    'SELECT full_name, score, rank FROM tools WHERE full_name != ? AND score IS NOT NULL ORDER BY score DESC LIMIT 5'
  ).bind(tool.full_name).all();
  const relatedTools = relatedRows.results || [];

  // Build markdown
  const lines: string[] = [];
  lines.push(`# ${tool.full_name}`);
  lines.push('');
  if (tool.description) {
    lines.push(`> ${tool.description}`);
    lines.push('');
  }
  lines.push(`**AgentRank Score:** ${tool.score.toFixed(1)}/100 | **Rank:** #${tool.rank} of ${totalTools}`);
  lines.push(`**Language:** ${tool.language || 'Unknown'} | **License:** ${tool.license || 'None'}`);
  lines.push('');

  // Overview
  const topPercent = Math.ceil((tool.rank / totalTools) * 100);
  lines.push('## Overview');
  lines.push('');
  lines.push(`Ranked #${tool.rank} out of ${totalTools} indexed tools.`);
  if (topPercent <= 10) {
    lines.push(`In the top ${topPercent}% of all indexed tools.`);
  }
  if (tool.stars >= 1000) {
    lines.push(`Has ${tool.stars.toLocaleString('en-US')} GitHub stars.`);
  }
  if (tool.dependents >= 10) {
    lines.push(`Used by ${tool.dependents.toLocaleString('en-US')} other projects.`);
  }
  lines.push('');

  // Signals table
  lines.push('## Signals');
  lines.push('');
  lines.push('| Signal | Value | Rating |');
  lines.push('|--------|-------|--------|');
  lines.push(`| Stars | ${tool.stars.toLocaleString('en-US')} | ${ratingBar(Math.min(100, Math.log(1 + tool.stars) / Math.log(1 + 200000) * 100))} |`);
  lines.push(`| Freshness | ${relativeTime(tool.last_commit_at)} | ${ratingBar(freshnessBar)} |`);
  lines.push(`| Issue Health | ${(issueHealth * 100).toFixed(0)}% | ${ratingBar(issueHealth * 100)} |`);
  lines.push(`| Contributors | ${tool.contributors} | ${ratingBar(Math.min(100, Math.log(1 + tool.contributors) / Math.log(1 + 500) * 100))} |`);
  lines.push(`| Dependents | ${tool.dependents.toLocaleString('en-US')} | ${ratingBar(Math.min(100, tool.dependents > 0 ? Math.log(1 + tool.dependents) / Math.log(1 + 100000) * 100 : 0))} |`);
  if (glamaDownloads > 0) {
    lines.push(`| Weekly Downloads | ${glamaDownloads.toLocaleString('en-US')} | |`);
  }
  if (glamaToolCalls > 0) {
    lines.push(`| Tool Calls | ${glamaToolCalls.toLocaleString('en-US')} | |`);
  }
  lines.push('');

  // README excerpt
  if (readmeExcerpt) {
    lines.push('## From the README');
    lines.push('');
    lines.push(readmeExcerpt);
    lines.push('');
    lines.push(`[Read full README on GitHub](${tool.url}#readme)`);
    lines.push('');
  }

  // Topics
  if (githubTopics.length > 0) {
    lines.push('## Topics');
    lines.push('');
    lines.push(githubTopics.join(', '));
    lines.push('');
  }

  // Related tools
  if (relatedTools.length > 0) {
    lines.push('## Top Ranked Tools');
    lines.push('');
    for (const r of relatedTools) {
      const rSlug = (r.full_name as string).replace('/', '--');
      lines.push(`- [${r.full_name as string}](/tool/${rSlug}.md) — Score: ${(r.score as number).toFixed(1)}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Data from [AgentRank](https://agentrank-ai.com/tool/${slug}/). Updated nightly.*`);

  const markdown = lines.join('\n');

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
