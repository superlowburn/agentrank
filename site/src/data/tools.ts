export interface Tool {
  rank: number;
  full_name: string;
  url: string;
  description: string | null;
  score: number;
  stars: number;
  forks: number;
  open_issues: number;
  closed_issues: number;
  contributors: number;
  dependents: number;
  language: string | null;
  license: string | null;
  last_commit_at: string;
  is_archived: boolean;
  matched_queries: string[];
  category?: string;
}

export function toSlug(fullName: string): string {
  return fullName.replace('/', '--');
}

export function formatStars(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  }
  return n.toLocaleString('en-US');
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function scoreColor(score: number): string {
  if (score > 70) return '#22c55e';
  if (score > 40) return '#eab308';
  return '#ef4444';
}
