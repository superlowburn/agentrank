export interface RepoData {
  stars: number;
  forks: number;
  last_commit_at: string | null;
  open_issues: number;
  closed_issues: number;
  contributors: number;
  dependents: number;
  is_archived: number;
  description: string | null;
  license: string | null;
}

export interface Signals {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
  descriptionQuality: number;
  licenseHealth: number;
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 365;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
}

export function computeSignals(repo: RepoData): Signals {
  // Stars: raw value (normalized later)
  const stars = repo.stars;

  // Freshness: 1.0 for < 7 days, linear decay 7-90 days, exponential after 90
  const days = daysSince(repo.last_commit_at);
  let freshness: number;
  if (repo.is_archived) {
    freshness = 0;
  } else if (days <= 7) {
    freshness = 1.0;
  } else if (days <= 90) {
    freshness = 1.0 - (days - 7) / (90 - 7);
  } else {
    freshness = Math.max(0, Math.exp(-(days - 90) / 90) * 0.1);
  }

  // Freshness floor for established tools: prevent obliteration of stable, adopted projects
  const isEstablished = repo.stars >= 200 || repo.dependents >= 5;
  if (isEstablished && freshness < 0.3) {
    freshness = 0.3;
  }

  // Issue health: closed / (open + closed), default 0.3 if no issues
  // (0.3 rather than 0.5: repos with no issues haven't demonstrated maintainer responsiveness)
  const totalIssues = repo.open_issues + repo.closed_issues;
  const issueHealth = totalIssues === 0 ? 0.3 : repo.closed_issues / totalIssues;

  // Contributors: floor at 1 (every repo has at least the author), raw value (normalized later)
  // Note: 96%+ of crawled repos show 0 contributors due to GitHub API rate limits during crawl.
  // Treating as 1 is accurate — someone created the repo.
  const contributors = Math.max(repo.contributors, 1);

  // Dependents: raw value (normalized later)
  const dependents = repo.dependents;

  // Description quality: proxy for maintainer investment
  const desc = repo.description;
  let descriptionQuality: number;
  if (!desc) {
    descriptionQuality = 0;
  } else if (desc.length < 50) {
    descriptionQuality = 0.3;
  } else if (desc.length < 150) {
    descriptionQuality = 0.7;
  } else {
    descriptionQuality = 1.0;
  }

  // License health: permissive = more adoptable
  const PERMISSIVE = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense'];
  const lic = repo.license;
  let licenseHealth: number;
  if (!lic || lic === 'NOASSERTION') {
    licenseHealth = 0.2;
  } else if (PERMISSIVE.includes(lic)) {
    licenseHealth = 1.0;
  } else {
    licenseHealth = 0.6;
  }

  return { stars, freshness, issueHealth, contributors, dependents, descriptionQuality, licenseHealth };
}
