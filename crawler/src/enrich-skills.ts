import type { Octokit } from "octokit";
import { getSkillsNeedingGithubEnrichment, updateSkillGithubData } from "./db.js";

function parseOwnerRepo(githubRepo: string): string | null {
  // Handle full URL: https://github.com/owner/repo
  const urlMatch = githubRepo.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
  if (urlMatch) return urlMatch[1].replace(/\.git$/, "");

  // Handle bare owner/repo
  if (/^[\w.-]+\/[\w.-]+$/.test(githubRepo)) return githubRepo;

  return null;
}

async function getContributorCount(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const response = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 1,
      anon: "true",
    });

    const linkHeader = response.headers.link;
    if (!linkHeader) return response.data.length;

    const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) return parseInt(lastMatch[1], 10);

    return response.data.length;
  } catch {
    return 0;
  }
}

async function getClosedIssueCount(
  octokit: Octokit,
  fullName: string
): Promise<number> {
  try {
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${fullName} is:issue is:closed`,
      per_page: 1,
    });
    return response.data.total_count;
  } catch {
    return 0;
  }
}

export async function enrichSkillsGithub(
  octokit: Octokit,
  maxSkills: number = 500
): Promise<number> {
  const skills = getSkillsNeedingGithubEnrichment(maxSkills);
  console.log(`\nEnriching ${skills.length} skills with GitHub data`);

  if (skills.length === 0) return 0;

  let enriched = 0;
  let skipped = 0;

  for (const skill of skills) {
    const ownerRepo = parseOwnerRepo(skill.github_repo!);
    if (!ownerRepo) {
      skipped++;
      continue;
    }

    const [owner, repo] = ownerRepo.split("/");

    try {
      // Fetch repo metadata
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

      // Fetch closed issues and contributors in parallel
      const [closedIssues, contributors] = await Promise.all([
        getClosedIssueCount(octokit, ownerRepo),
        getContributorCount(octokit, owner, repo),
      ]);

      updateSkillGithubData(skill.slug, {
        gh_stars: repoData.stargazers_count,
        gh_open_issues: repoData.open_issues_count,
        gh_closed_issues: closedIssues,
        gh_contributors: contributors,
        gh_last_commit_at: repoData.pushed_at,
        gh_is_archived: repoData.archived ? 1 : 0,
      });

      enriched++;
      if (enriched % 50 === 0) {
        console.log(`  Enriched ${enriched}/${skills.length} (${skipped} skipped)`);
      }
    } catch (err) {
      skipped++;
      if ((err as any)?.status === 404) {
        // Repo doesn't exist, mark with zeros so we don't retry
        updateSkillGithubData(skill.slug, {
          gh_stars: 0,
          gh_open_issues: 0,
          gh_closed_issues: 0,
          gh_contributors: 0,
          gh_last_commit_at: null,
          gh_is_archived: 0,
        });
      }
    }
  }

  console.log(`Skills GitHub enrichment complete: ${enriched} enriched, ${skipped} skipped`);
  return enriched;
}
