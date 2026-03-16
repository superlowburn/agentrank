import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = async () => {
  const text = `# AgentRank
> The reputation layer for AI skills, tools & agents

AgentRank is a daily-updated ranked index of every MCP server, agent tool, and AI skill on GitHub. Each entry is scored 0-100 using real signals: stars, freshness, issue health, contributors, and dependents.

## Website
https://agentrank-ai.com

## API

### Search
GET https://agentrank-ai.com/api/search?q={query}&type={tool|skill}&limit={1-50}

Returns JSON with ranked results:
- type: "tool" or "skill"
- name, description, score (0-100), rank
- url: link to detail page with full signal breakdown

### Lookup
GET https://agentrank-ai.com/api/lookup?url={github_url}

Check if a specific GitHub repository is indexed. Returns score and rank if found.

### Badges
GET https://agentrank-ai.com/api/badge/tool/{owner}/{repo}
GET https://agentrank-ai.com/api/badge/skill/{slug}

Returns an SVG badge showing the AgentRank score. Embeddable in READMEs.

## Score interpretation
- 80+: Highly rated — actively maintained, strong community signals
- 60-79: Solid — usable, some signals could be stronger
- 40-59: Use with caution — may have maintenance or adoption concerns
- Below 40: Low confidence — limited signals, verify before relying on it

## MCP Server
Install the AgentRank MCP server for native tool access:
npx -y @agentrank/mcp-server

## Coverage
25,000+ tools and 3,000+ skills indexed from GitHub, updated nightly.
`;

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
