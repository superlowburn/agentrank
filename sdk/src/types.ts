// ─── Configuration ───────────────────────────────────────────────────────────

export interface AgentRankOptions {
  /** API key for authenticated (v2) access. Omit for free-tier (v1) access. */
  apiKey?: string;
  /** Override the default base URL. Defaults to https://agentrank-ai.com */
  baseUrl?: string;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export type ResultType = 'tool' | 'skill' | 'agent';
export type SortBy = 'score' | 'rank' | 'stars' | 'freshness';
export type Category = 'all' | 'tool' | 'skill' | 'agent';

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchOptions {
  category?: Category;
  sort?: SortBy;
  limit?: number;
  offset?: number;
}

export interface ToolRaw {
  stars: number;
  forks?: number;
  openIssues?: number;
  closedIssues?: number;
  contributors: number;
  dependents: number;
  lastCommitAt: string | null;
  language: string | null;
  license: string | null;
  isArchived: boolean;
  topics: string[];
  readmeExcerpt?: string | null;
  glamaWeeklyDownloads: number;
  glamaToolCalls: number;
  category?: string | null;
}

export interface SkillRaw {
  stars: number | null;
  openIssues?: number;
  closedIssues?: number;
  contributors?: number;
  lastCommitAt: string | null;
  isArchived: boolean;
  installs: number;
  trendingRank: number | null;
  platforms: string[];
  source: string;
  author: string | null;
  category?: string | null;
}

export interface AgentRaw {
  ownerName: string | null;
  ownerUrl: string | null;
  endpointUrl: string | null;
  capabilities?: string[];
  registeredAt: string;
}

export interface SearchResult {
  type: ResultType;
  id: string;
  name: string;
  description: string | null;
  score: number | null;
  rank: number | null;
  url: string;
  raw: ToolRaw | SkillRaw | AgentRaw;
}

export interface SearchResponse {
  query: string | null;
  category: Category;
  sort: SortBy;
  results: SearchResult[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  tier?: string;
}

// ─── Tool Detail ──────────────────────────────────────────────────────────────

export interface ToolSignals {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  descriptionQuality: number;
  licenseHealth: number;
}

export interface RankHistoryEntry {
  date: string;
  rank: number;
  score: number;
}

export interface ToolDetail {
  type: ResultType;
  id: string;
  name: string;
  description: string | null;
  score: number;
  rank: number;
  githubUrl: string;
  category?: string;
  signals: ToolSignals | null;
  weights: ToolSignals | null;
  raw: ToolRaw | SkillRaw;
  /** Available only with a Pro API key (v2) */
  rankHistory?: RankHistoryEntry[];
}

// ─── Movers ───────────────────────────────────────────────────────────────────

export interface MoversOptions {
  days?: number;
  limit?: number;
}

export interface Mover {
  fullName: string;
  toolType: 'tool' | 'skill';
  currentRank: number;
  prevRank: number;
  rankDelta: number;
  currentScore: number;
  stars: number;
  url: string;
}

export interface MoversResponse {
  movers: Mover[];
  meta: {
    today: string;
    prevDate: string;
    days: number;
    count: number;
  };
}

// ─── New Tools ────────────────────────────────────────────────────────────────

export interface NewToolsOptions {
  days?: number;
  limit?: number;
}

export interface NewTool {
  fullName: string;
  toolType: 'tool' | 'skill';
  rank: number;
  score: number;
  stars: number;
  firstSeen: string;
  url: string;
}

export interface NewToolsResponse {
  tools: NewTool[];
  meta: {
    today: string;
    cutoff: string;
    days: number;
    count: number;
  };
}
