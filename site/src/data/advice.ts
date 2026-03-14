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

  // Repo-level advice (from linked repo or skill-level GitHub enrichment)
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

    if (repoData.contributors <= 1) {
      items.push({
        signal: 'Contributors',
        message: 'Single-contributor projects carry bus-factor risk — welcoming contributors boosts confidence',
        impact: 'medium',
      });
    }

    if (repoData.stars < 50) {
      items.push({
        signal: 'Stars',
        message: 'Low star count — promote the project, write docs, and engage the community to drive adoption',
        impact: 'low',
      });
    }
  }

  // Few platforms
  if (skill.platforms.length < 3) {
    items.push({
      signal: 'Platforms',
      message: skill.platforms.length === 0
        ? 'Publish to more platforms (skills.sh, Glama, ClawHub) for broader reach'
        : `Only ${skill.platforms.length} platform${skill.platforms.length === 1 ? '' : 's'} listed — publishing to more platforms improves your score`,
      impact: 'medium',
    });
  }

  return items.slice(0, 3);
}
