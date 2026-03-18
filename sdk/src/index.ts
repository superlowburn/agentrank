import { AgentRankError, AuthError, NotFoundError, RateLimitError } from './errors.js';
import type {
  AgentRankOptions,
  Category,
  Mover,
  MoversOptions,
  MoversResponse,
  NewTool,
  NewToolsOptions,
  NewToolsResponse,
  SearchOptions,
  SearchResponse,
  SortBy,
  ToolDetail,
} from './types.js';

export * from './types.js';
export * from './errors.js';

const DEFAULT_BASE_URL = 'https://agentrank-ai.com';

export class AgentRank {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options: AgentRankOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey;
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  private get version(): 'v1' | 'v2' {
    return this.apiKey ? 'v2' : 'v1';
  }

  private encodeToolId(id: string): string {
    // GitHub org/repo uses "/" — the API encodes these as "--"
    return id.replace(/\//g, '--');
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}/api/${this.version}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url, { headers });

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    const retryAfter = response.headers.get('Retry-After') ?? undefined;
    let message: string;
    try {
      const body = await response.json() as { error?: string; message?: string };
      message = body.error ?? body.message ?? response.statusText;
    } catch {
      message = response.statusText;
    }

    switch (response.status) {
      case 401:
        throw new AuthError(message);
      case 404:
        throw new NotFoundError(message);
      case 429:
        throw new RateLimitError(message, retryAfter);
      default:
        throw new AgentRankError(message, response.status, 'API_ERROR');
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Search for tools, skills, and agents in the AgentRank index.
   *
   * @example
   * const results = await ar.search("database");
   * const tools = await ar.search("filesystem", { category: "tool", limit: 10 });
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const url = this.buildUrl('/search', {
      q: query,
      category: options.category as string | undefined,
      sort: options.sort as string | undefined,
      limit: options.limit,
      offset: options.offset,
    });
    return this.request<SearchResponse>(url);
  }

  /**
   * Get detailed information about a specific tool by its GitHub identifier.
   *
   * @param id GitHub repository in "owner/repo" format, e.g. "modelcontextprotocol/servers"
   *
   * @example
   * const tool = await ar.getTool("modelcontextprotocol/servers");
   * console.log(tool.score, tool.rank, tool.signals);
   */
  async getTool(id: string): Promise<ToolDetail> {
    const encodedId = this.encodeToolId(id);
    const url = this.buildUrl(`/tool/${encodedId}`);
    return this.request<ToolDetail>(url);
  }

  /**
   * Get the tools and skills with the largest rank changes over the last N days.
   *
   * @example
   * const { movers } = await ar.getMovers({ days: 7, limit: 20 });
   * movers.forEach(m => console.log(m.fullName, m.rankDelta));
   */
  async getMovers(options: MoversOptions = {}): Promise<MoversResponse> {
    const url = this.buildUrl('/movers', {
      days: options.days,
      limit: options.limit,
    });

    // Normalize snake_case API response to camelCase
    const raw = await this.request<{
      movers: Array<{
        full_name: string;
        tool_type: 'tool' | 'skill';
        current_rank: number;
        prev_rank: number;
        rank_delta: number;
        current_score: number;
        stars: number;
        url: string;
      }>;
      meta: {
        today: string;
        prev_date: string;
        days: number;
        count: number;
      };
    }>(url);

    return {
      movers: raw.movers.map(
        (m): Mover => ({
          fullName: m.full_name,
          toolType: m.tool_type,
          currentRank: m.current_rank,
          prevRank: m.prev_rank,
          rankDelta: m.rank_delta,
          currentScore: m.current_score,
          stars: m.stars,
          url: m.url,
        })
      ),
      meta: {
        today: raw.meta.today,
        prevDate: raw.meta.prev_date,
        days: raw.meta.days,
        count: raw.meta.count,
      },
    };
  }

  /**
   * Get tools and skills newly added to the index in the last N days.
   *
   * @example
   * const { tools } = await ar.getNewTools({ days: 14 });
   * tools.forEach(t => console.log(t.fullName, t.firstSeen));
   */
  async getNewTools(options: NewToolsOptions = {}): Promise<NewToolsResponse> {
    const url = this.buildUrl('/new-tools', {
      days: options.days,
      limit: options.limit,
    });

    // Normalize snake_case API response to camelCase
    const raw = await this.request<{
      tools: Array<{
        full_name: string;
        tool_type: 'tool' | 'skill';
        rank: number;
        score: number;
        stars: number;
        first_seen: string;
        url: string;
      }>;
      meta: {
        today: string;
        cutoff: string;
        days: number;
        count: number;
      };
    }>(url);

    return {
      tools: raw.tools.map(
        (t): NewTool => ({
          fullName: t.full_name,
          toolType: t.tool_type,
          rank: t.rank,
          score: t.score,
          stars: t.stars,
          firstSeen: t.first_seen,
          url: t.url,
        })
      ),
      meta: {
        today: raw.meta.today,
        cutoff: raw.meta.cutoff,
        days: raw.meta.days,
        count: raw.meta.count,
      },
    };
  }
}
