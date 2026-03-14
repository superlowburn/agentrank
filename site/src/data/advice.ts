import type { Tool } from './tools';

export interface Advice {
  signal: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export function getAdvice(tool: Tool): Advice[] {
  const items: Advice[] = [];

  // 1. No/short description (5% weight, 30 sec fix)
  const descLen = tool.description?.length ?? 0;
  if (descLen < 150) {
    items.push({
      signal: 'Description',
      message: descLen === 0
        ? 'Add a detailed description (150+ chars) to your repo to improve discoverability'
        : 'Expand your description to 150+ characters for better discoverability',
      impact: 'low',
    });
  }

  // 2. No license (6% weight, 2 min fix)
  if (!tool.license || tool.license === 'NOASSERTION') {
    items.push({
      signal: 'License',
      message: 'Add an MIT or Apache-2.0 license to signal trust and enable adoption',
      impact: 'low',
    });
  }

  // 3. Stale >30 days (22% weight, 1 commit fix)
  const daysSinceCommit = Math.floor(
    (Date.now() - new Date(tool.last_commit_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCommit > 30) {
    items.push({
      signal: 'Freshness',
      message: `Last commit was ${daysSinceCommit} days ago — a recent commit would boost your freshness score`,
      impact: 'high',
    });
  }

  // 4. Low issue health <0.5 (22% weight, moderate effort)
  const totalIssues = tool.open_issues + tool.closed_issues;
  const issueHealth = totalIssues > 0 ? tool.closed_issues / totalIssues : 0.5;
  if (issueHealth < 0.5 && totalIssues > 0) {
    items.push({
      signal: 'Issue Health',
      message: `You have ${tool.open_issues} open vs ${tool.closed_issues} closed issues — triaging stale issues improves health`,
      impact: 'high',
    });
  }

  // 5. Single contributor (8% weight, longer term)
  if (tool.contributors <= 1) {
    items.push({
      signal: 'Contributors',
      message: 'Single-contributor projects carry bus-factor risk — welcoming contributors boosts confidence',
      impact: 'medium',
    });
  }

  // 6. Zero dependents (22% weight, organic)
  if (tool.dependents === 0) {
    items.push({
      signal: 'Dependents',
      message: 'No downstream dependents detected yet — adoption by other projects is the strongest trust signal',
      impact: 'medium',
    });
  }

  return items.slice(0, 3);
}

export function getSkillAdvice(
  skill: { description: string | null; github_repo: string | null; platforms: string[] },
  repoData: {
    stars: number;
    last_commit_at: string;
    open_issues: number;
    closed_issues: number;
    contributors: number;
  } | null
): Advice[] {
  const items: Advice[] = [];

  // No GitHub repo linked — biggest unlock
  if (!skill.github_repo) {
    items.push({
      signal: 'GitHub',
      message: 'Link a GitHub repository to unlock richer scoring — freshness, issue health, contributors, and stars all factor in',
      impact: 'high',
    });
  }

  // Short/no description
  const descLen = skill.description?.length ?? 0;
  if (descLen < 150) {
    items.push({
      signal: 'Description',
      message: descLen === 0
        ? 'Add a detailed description (150+ chars) to improve discoverability'
        : 'Expand your description to 150+ characters for better discoverability',
      impact: 'low',
    });
  }

  // Few platforms
  if (skill.platforms.length < 3) {
    items.push({
      signal: 'Platforms',
      message: skill.platforms.length === 0
        ? 'Add platform support information to increase your platform breadth score'
        : `Only ${skill.platforms.length} platform${skill.platforms.length === 1 ? '' : 's'} listed — supporting more platforms improves your score`,
      impact: 'medium',
    });
  }

  // Repo-level advice if linked
  if (repoData) {
    const daysSinceCommit = Math.floor(
      (Date.now() - new Date(repoData.last_commit_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCommit > 30) {
      items.push({
        signal: 'Freshness',
        message: `Last commit was ${daysSinceCommit} days ago — a recent commit would boost your freshness score`,
        impact: 'high',
      });
    }

    const totalIssues = repoData.open_issues + repoData.closed_issues;
    const issueHealth = totalIssues > 0 ? repoData.closed_issues / totalIssues : 0.5;
    if (issueHealth < 0.5 && totalIssues > 0) {
      items.push({
        signal: 'Issue Health',
        message: `You have ${repoData.open_issues} open vs ${repoData.closed_issues} closed issues — triaging stale issues improves health`,
        impact: 'high',
      });
    }
  }

  return items.slice(0, 3);
}
