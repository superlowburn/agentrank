import { z } from 'zod';
import { search, lookup } from './api-client.js';
import type { SearchResult } from './api-client.js';

function scoreVerdict(score: number): string {
  if (score >= 80) return 'Highly rated';
  if (score >= 60) return 'Solid';
  if (score >= 40) return 'Use with caution';
  return 'Low confidence';
}

function formatResults(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `No results found for "${query}". The tool may not be indexed yet — suggest submitting it at https://agentrank-ai.com/submit/`;
  }

  const lines = [`Found ${results.length} result${results.length > 1 ? 's' : ''} for "${query}":\n`];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const verdict = scoreVerdict(r.score);
    lines.push(`${i + 1}. **${r.name}** — Score: ${r.score.toFixed(1)} (${verdict}, #${r.rank})`);
    if (r.description) lines.push(`   ${r.description}`);
    lines.push(`   ${r.url}`);
    lines.push('');
  }
  return lines.join('\n');
}

export const searchToolDef = {
  name: 'search',
  description: 'Search the AgentRank index for MCP servers, agent tools, or AI skills. Returns quality-scored results ranked by real signals (stars, freshness, issue health, contributors, dependents).',
  schema: {
    query: z.string().describe('Search terms, e.g. "database", "playwright", "slack"'),
    type: z.enum(['tool', 'skill']).optional().describe('Filter to tools (GitHub repos) or skills (registry entries). Omit for both.'),
    limit: z.number().min(1).max(50).optional().describe('Number of results (default 10, max 50)'),
  },
  handler: async ({ query, type, limit }: { query: string; type?: 'tool' | 'skill'; limit?: number }) => {
    try {
      const data = await search(query, type, limit);
      return { content: [{ type: 'text' as const, text: formatResults(query, data.results) }] };
    } catch (err) {
      return { content: [{ type: 'text' as const, text: `Error searching AgentRank: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  },
};

export const lookupToolDef = {
  name: 'lookup',
  description: 'Look up a specific GitHub repository in the AgentRank index. Returns its score, rank, and listing details if found.',
  schema: {
    github_url: z.string().describe('GitHub repository URL, e.g. "https://github.com/owner/repo"'),
  },
  handler: async ({ github_url }: { github_url: string }) => {
    try {
      const data = await lookup(github_url);
      let text: string;

      if (data.found) {
        const verdict = scoreVerdict(data.score!);
        text = [
          `**${data.name}** — Score: ${data.score!.toFixed(1)} (${verdict}, #${data.rank})`,
          data.description ? `${data.description}` : '',
          `Type: ${data.type}`,
          `https://agentrank-ai.com/${data.type}/${data.slug}/`,
        ].filter(Boolean).join('\n');
      } else {
        text = `Repository not found in the AgentRank index. It may not be indexed yet — submit it at https://agentrank-ai.com/submit/`;
      }

      return { content: [{ type: 'text' as const, text }] };
    } catch (err) {
      return { content: [{ type: 'text' as const, text: `Error looking up repository: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  },
};

export const badgeToolDef = {
  name: 'get_badge_url',
  description: 'Get an embeddable AgentRank badge URL for a tool or skill. Returns markdown and HTML snippets for README embedding.',
  schema: {
    slug: z.string().describe('Tool or skill slug, e.g. "microsoft/playwright-mcp" or "glama-playwright-mcp-server"'),
    type: z.enum(['tool', 'skill']).describe('Whether this is a tool or skill'),
  },
  handler: async ({ slug, type }: { slug: string; type: 'tool' | 'skill' }) => {
    const badgeUrl = `https://agentrank-ai.com/api/badge/${type}/${slug}`;
    const pageUrl = `https://agentrank-ai.com/${type}/${slug}/`;

    const text = [
      `**AgentRank Badge for ${slug}**\n`,
      `Badge URL: ${badgeUrl}\n`,
      `Markdown:`,
      `\`\`\`markdown`,
      `[![AgentRank](${badgeUrl})](${pageUrl})`,
      `\`\`\`\n`,
      `HTML:`,
      `\`\`\`html`,
      `<a href="${pageUrl}"><img src="${badgeUrl}" alt="AgentRank"></a>`,
      `\`\`\``,
    ].join('\n');

    return { content: [{ type: 'text' as const, text }] };
  },
};
