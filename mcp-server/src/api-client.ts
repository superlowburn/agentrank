const BASE_URL = 'https://agentrank-ai.com';

const HEADERS = { 'User-Agent': 'AgentRank-MCP/2.0' };
const TIMEOUT = 10_000;

export interface SearchResult {
  type: 'tool' | 'skill';
  slug: string;
  name: string;
  description: string | null;
  score: number;
  rank: number;
  category?: string | null;
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

export interface ToolSignals {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  descriptionQuality: number;
  licenseHealth: number;
}

export interface ToolDetailResponse {
  type: 'tool' | 'skill';
  id: string;
  name: string;
  description: string | null;
  score: number | null;
  rank: number | null;
  githubUrl: string | null;
  signals: ToolSignals | null;
  weights: Record<string, number> | null;
  raw: {
    stars?: number;
    forks?: number;
    contributors?: number;
    openIssues?: number;
    closedIssues?: number;
    dependents?: number;
    lastCommitAt?: string | null;
    language?: string | null;
    license?: string | null;
    isArchived?: boolean;
    topics?: string[];
    installs?: number;
    platforms?: string[];
    source?: string;
  };
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
    signal: AbortSignal.timeout(TIMEOUT),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json() as Promise<SearchResponse>;
}

export async function lookup(githubUrl: string): Promise<LookupResponse> {
  const params = new URLSearchParams({ url: githubUrl });
  const res = await fetch(`${BASE_URL}/api/lookup?${params}`, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json() as Promise<LookupResponse>;
}

export async function getToolDetail(id: string): Promise<ToolDetailResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/tool/${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`AgentRank API error: ${res.status}`);
  return res.json() as Promise<ToolDetailResponse>;
}
