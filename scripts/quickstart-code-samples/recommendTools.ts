/**
 * AgentRank Quickstart — TypeScript
 * Recommend MCP tools for a given use case using the AgentRank v1 API.
 *
 * No API key required for basic search.
 * Get a free v2 API key at https://agentrank-ai.com/docs
 *
 * Usage:
 *   npx tsx recommendTools.ts
 *   npx tsx recommendTools.ts "query postgres database"
 *
 * Requires: Node.js 18+ (built-in fetch) or npx tsx for TypeScript execution
 */

const BASE_URL = "https://agentrank-ai.com/api/v1/search";

interface AgentRankResult {
  type: "tool" | "skill" | "agent";
  id: string;
  name: string;
  description: string | null;
  score: number;
  rank: number;
  url: string;
  raw: Record<string, unknown>;
}

interface SearchResponse {
  query: string | null;
  category: string;
  sort: string;
  results: AgentRankResult[];
  meta: { total: number; limit: number; offset: number };
}

/**
 * Search the AgentRank index.
 *
 * @param query - Keyword search, e.g. "database" or "browser automation"
 * @param category - "tool" (GitHub repos), "skill" (registry entries), or "" (all)
 * @param sort - "score" (default), "rank", "stars", or "freshness"
 * @param limit - Number of results (max 100)
 */
export async function searchTools(
  query: string,
  category: "tool" | "skill" | "agent" | "" = "tool",
  sort: "score" | "rank" | "stars" | "freshness" = "score",
  limit = 10
): Promise<AgentRankResult[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("q", query);
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("sort", sort);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status} ${res.statusText}`);
  const data: SearchResponse = await res.json();
  return data.results;
}

/**
 * Return top-ranked MCP tools for a given use case.
 *
 * @param useCase - Natural-language description, e.g. "scrape web pages"
 * @param topN - Number of recommendations (default 5)
 * @returns Formatted string suitable for including in an LLM prompt
 */
export async function recommendTools(useCase: string, topN = 5): Promise<string> {
  const results = await searchTools(useCase, "tool", "score", topN);

  if (!results.length) {
    return `No ranked tools found for '${useCase}'. Check agentrank-ai.com for the latest index.`;
  }

  const verdict = (score: number) =>
    score >= 80 ? "highly rated" : score >= 60 ? "solid" : "use with caution";

  const lines = [`Top ${results.length} MCP tools for '${useCase}' (ranked by AgentRank score):\n`];
  results.forEach((tool, i) => {
    lines.push(`${i + 1}. ${tool.name} — score ${tool.score.toFixed(1)} (${verdict(tool.score)}, #${tool.rank})`);
    if (tool.description) lines.push(`   ${tool.description}`);
    lines.push(`   ${tool.url}`);
  });
  return lines.join("\n");
}

/**
 * Fetch full score breakdown for a specific tool (requires v2 API key).
 *
 * @param githubFullName - e.g. "modelcontextprotocol/python-sdk"
 * @param apiKey - Your AgentRank API key (get free at agentrank-ai.com/docs)
 */
export async function getToolDetails(githubFullName: string, apiKey: string): Promise<unknown> {
  const toolId = githubFullName.replace("/", "--");
  const res = await fetch(`https://agentrank-ai.com/api/v2/tool/${toolId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json();
}

// Run standalone
const useCase = process.argv.slice(2).join(" ") || "scrape web pages";
console.log(await recommendTools(useCase));
console.log();
console.log(await recommendTools("query postgres database"));
