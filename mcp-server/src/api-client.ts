const BASE_URL = 'https://agentrank-ai.com';

export interface SearchResult {
  type: 'tool' | 'skill';
  slug: string;
  name: string;
  description: string | null;
  score: number;
  rank: number;
  url: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  error?: string;
}

export interface LookupResponse {
  found: boolean;
  type?: 'tool' | 'skill';
  slug?: string;
  name?: string;
  description?: string;
  score?: number;
  rank?: number;
  error?: string;
}

export async function search(
  query: string,
  type?: 'tool' | 'skill',
  limit?: number,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (type) params.set('type', type);
  if (limit) params.set('limit', String(limit));

  const res = await fetch(`${BASE_URL}/api/search?${params}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'AgentRank-MCP/1.0' },
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json() as Promise<SearchResponse>;
}

export async function lookup(githubUrl: string): Promise<LookupResponse> {
  const params = new URLSearchParams({ url: githubUrl });
  const res = await fetch(`${BASE_URL}/api/lookup?${params}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'AgentRank-MCP/1.0' },
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json() as Promise<LookupResponse>;
}
