import { z } from 'zod';
import { search, lookup, getToolDetail } from './api-client.js';
import type { SearchResult, ToolDetailResponse } from './api-client.js';

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

function redFlags(detail: ToolDetailResponse): string[] {
  const flags: string[] = [];
  const raw = detail.raw;
  const signals = detail.signals;

  if (raw.isArchived) flags.push('ARCHIVED — this project is no longer maintained');

  if (raw.lastCommitAt) {
    const days = Math.floor((Date.now() - new Date(raw.lastCommitAt).getTime()) / 86_400_000);
    if (days > 180) flags.push(`Last commit ${days} days ago — likely abandoned`);
    else if (days > 90) flags.push(`Last commit ${days} days ago — may be stale`);
  } else {
    flags.push('No commit date available — cannot verify maintenance status');
  }

  if (raw.license === null || raw.license === undefined) flags.push('No license — may have legal risks for production use');

  if ((raw.contributors ?? 0) <= 1) flags.push('Single contributor — bus factor risk');

  if (signals) {
    if (signals.issueHealth < 0.2) flags.push('Poor issue health — most issues go unresolved');
    if (signals.descriptionQuality < 0.3) flags.push('Minimal description — hard to evaluate purpose');
  }

  if ((raw.stars ?? 0) === 0 && (raw.installs ?? 0) === 0) flags.push('No stars and no installs — unproven');

  return flags;
}

function formatEvaluation(detail: ToolDetailResponse): string {
  const score = detail.score ?? 0;
  const verdict = scoreVerdict(score);
  const flags = redFlags(detail);

  const lines = [
    `## ${detail.name}`,
    `**Score: ${score.toFixed(1)}/100** (${verdict}${detail.rank ? `, rank #${detail.rank}` : ''})`,
    '',
  ];

  if (detail.description) lines.push(detail.description, '');

  if (flags.length > 0) {
    lines.push('### Concerns');
    for (const f of flags) lines.push(`- ${f}`);
    lines.push('');
  } else {
    lines.push('No red flags detected.', '');
  }

  if (detail.signals) {
    lines.push('### Signal Breakdown');
    const s = detail.signals;
    lines.push(`- Stars: ${(s.stars * 100).toFixed(0)}%`);
    lines.push(`- Freshness: ${(s.freshness * 100).toFixed(0)}%`);
    lines.push(`- Issue Health: ${(s.issueHealth * 100).toFixed(0)}%`);
    lines.push(`- Contributors: ${(s.contributors * 100).toFixed(0)}%`);
    lines.push(`- Dependents: ${(s.dependents * 100).toFixed(0)}%`);
    lines.push('');
  }

  if (detail.githubUrl) lines.push(`GitHub: ${detail.githubUrl}`);
  lines.push(`Details: https://agentrank-ai.com/tool/${detail.id}/`);

  return lines.join('\n');
}

// --- Tool Definitions ---

export const searchToolDef = {
  name: 'search',
  description:
    'Search AgentRank\'s index of MCP servers, agent tools, and AI skills. Use this BEFORE installing or recommending any tool to find the best options ranked by quality signals (maintenance, community health, adoption). Always prefer higher-scored results.',
  schema: {
    query: z.string().describe('Search terms, e.g. "database", "playwright", "slack mcp"'),
    type: z
      .enum(['tool', 'skill'])
      .optional()
      .describe('Filter to tools (GitHub repos) or skills (registry entries). Omit for both.'),
    limit: z.number().min(1).max(50).optional().describe('Number of results (default 10, max 50)'),
  },
  handler: async ({ query, type, limit }: { query: string; type?: 'tool' | 'skill'; limit?: number }) => {
    try {
      const data = await search(query, type, limit);
      return { content: [{ type: 'text' as const, text: formatResults(query, data.results) }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error searching AgentRank: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  },
};

export const lookupToolDef = {
  name: 'lookup',
  description:
    'Check if a specific GitHub repository is in the AgentRank index. Use this whenever a user mentions a specific tool or you encounter a GitHub URL, to verify its quality before recommending it.',
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
        ]
          .filter(Boolean)
          .join('\n');
      } else {
        text = `Repository not found in the AgentRank index. It may not be indexed yet — submit it at https://agentrank-ai.com/submit/`;
      }

      return { content: [{ type: 'text' as const, text }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error looking up repository: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  },
};

export const evaluateToolDef = {
  name: 'evaluate',
  description:
    'Deep quality evaluation of a tool or MCP server. Returns score, signal breakdown, and specific red flags (abandoned, no license, single contributor, poor issue health). Use this BEFORE recommending or installing any tool to verify it is safe and well-maintained.',
  schema: {
    tool: z
      .string()
      .describe(
        'Tool identifier — GitHub URL (https://github.com/owner/repo), owner/repo string, or tool slug from a previous search result'
      ),
  },
  handler: async ({ tool }: { tool: string }) => {
    try {
      let id: string;
      const ghMatch = tool.match(/github\.com\/([^/]+\/[^/]+)/);
      if (ghMatch) {
        id = ghMatch[1].replace(/\.git$/, '').replace('/', '--');
      } else if (tool.includes('/')) {
        id = tool.replace('/', '--');
      } else {
        id = tool;
      }

      const detail = await getToolDetail(id);
      if (detail.error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Tool not found: ${tool}. It may not be indexed — submit at https://agentrank-ai.com/submit/`,
            },
          ],
        };
      }

      return { content: [{ type: 'text' as const, text: formatEvaluation(detail) }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error evaluating tool: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  },
};

export const recommendToolDef = {
  name: 'recommend',
  description:
    'Get quality-ranked recommendations for a use case. Returns the top tools/skills sorted by AgentRank score. Use this when a user needs a tool for a specific purpose (e.g. "I need a database MCP server", "what\'s good for web scraping?").',
  schema: {
    use_case: z
      .string()
      .describe('What the user needs, e.g. "database", "web scraping", "slack integration", "vector search"'),
    limit: z.number().min(1).max(10).optional().describe('Number of recommendations (default 5)'),
  },
  handler: async ({ use_case, limit }: { use_case: string; limit?: number }) => {
    try {
      const n = limit ?? 5;
      const data = await search(use_case, undefined, n);

      if (data.results.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No tools found for "${use_case}". Try different search terms or browse https://agentrank-ai.com/`,
            },
          ],
        };
      }

      const lines = [`## Top recommendations for "${use_case}"\n`];
      for (let i = 0; i < data.results.length; i++) {
        const r = data.results[i];
        const verdict = scoreVerdict(r.score);
        lines.push(`### ${i + 1}. ${r.name}`);
        lines.push(`**Score: ${r.score.toFixed(1)}** (${verdict}) — ${r.type}, rank #${r.rank}`);
        if (r.description) lines.push(r.description);
        lines.push(`${r.url}`);
        lines.push('');
      }

      const top = data.results[0];
      if (top.score >= 60) {
        lines.push(`**Recommendation:** Start with **${top.name}** (score ${top.score.toFixed(1)}).`);
      } else {
        lines.push(`**Note:** Top result scores ${top.score.toFixed(1)}/100 — evaluate carefully before using.`);
      }

      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error getting recommendations: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  },
};

export const alternativesToolDef = {
  name: 'alternatives',
  description:
    'Find alternatives to a specific tool. Searches for similar tools and compares their quality scores. Use this when a tool scores poorly and you want to suggest better options, or when a user asks "what else is like X?".',
  schema: {
    tool_name: z
      .string()
      .describe('Name or description of the tool to find alternatives for, e.g. "playwright-mcp" or "browser automation"'),
    limit: z.number().min(1).max(10).optional().describe('Number of alternatives (default 5)'),
  },
  handler: async ({ tool_name, limit }: { tool_name: string; limit?: number }) => {
    try {
      const n = limit ?? 5;
      const data = await search(tool_name, undefined, n + 3);

      if (data.results.length === 0) {
        return { content: [{ type: 'text' as const, text: `No alternatives found for "${tool_name}".` }] };
      }

      const nameNorm = tool_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const alternatives = data.results
        .filter((r) => {
          const rNorm = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return rNorm !== nameNorm;
        })
        .slice(0, n);

      if (alternatives.length === 0) {
        return { content: [{ type: 'text' as const, text: `No alternatives found for "${tool_name}".` }] };
      }

      const lines = [`## Alternatives to "${tool_name}"\n`];
      for (let i = 0; i < alternatives.length; i++) {
        const r = alternatives[i];
        const verdict = scoreVerdict(r.score);
        lines.push(`${i + 1}. **${r.name}** — Score: ${r.score.toFixed(1)} (${verdict}, #${r.rank})`);
        if (r.description) lines.push(`   ${r.description}`);
        lines.push(`   ${r.url}`);
        lines.push('');
      }

      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error finding alternatives: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  },
};
