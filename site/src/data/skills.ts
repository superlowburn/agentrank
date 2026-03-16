export interface Skill {
  rank: number;
  slug: string;
  name: string | null;
  description: string | null;
  score: number;
  installs: number;
  platforms: string[];
  source: string;
  github_repo: string | null;
  author: string | null;
  trending_rank: number | null;
  category?: string;
}

export function toSkillSlug(slug: string): string {
  // Convert slug to URL-safe format: replace / with --
  return slug.replace(/\//g, '--').replace(/:/g, '-');
}

export function formatInstalls(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toLocaleString('en-US');
}

export function platformBadges(platforms: string[]): string[] {
  return platforms.slice(0, 5); // Cap at 5 displayed platforms
}

export function scoreColor(score: number): string {
  if (score > 70) return '#22c55e';
  if (score > 40) return '#eab308';
  return '#ef4444';
}

export function sourceLabel(source: string): string {
  switch (source) {
    case 'skills.sh': return 'skills.sh';
    case 'glama': return 'Glama';
    case 'clawhub': return 'ClawHub';
    default: return source;
  }
}
