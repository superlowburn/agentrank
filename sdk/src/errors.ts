export class AgentRankError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AgentRankError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitError extends AgentRankError {
  constructor(
    message: string,
    public readonly retryAfter?: string
  ) {
    super(message, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends AgentRankError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class AuthError extends AgentRankError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthError';
  }
}
