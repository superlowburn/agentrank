import type { Octokit } from "octokit";
import {
  getSkillsNeedingGithubEnrichment,
  getSkillsNeedingDescriptionEnrichment,
  updateSkillGithubData,
  updateSkillDescription,
  updateSkillGithubRepo,
} from "./db.js";

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

/**
 * Enrich skill descriptions from GitHub repo data.
 *
 * For skills whose description is the generic skills.sh site-wide placeholder (or null),
 * fetch the GitHub repo description and use it instead. Also handles skills that lack a
 * github_repo by inferring it from the slug (source = owner/repo).
 */
export async function enrichSkillDescriptions(
  octokit: Octokit,
  maxSkills: number = 500
): Promise<number> {
  let enriched = 0;

  // Pass 1: skills that already have github_repo but need a real description
  const skillsWithRepo = getSkillsNeedingDescriptionEnrichment(maxSkills);
  console.log(`\nEnriching descriptions for ${skillsWithRepo.length} skills from GitHub`);

  for (const skill of skillsWithRepo) {
    const ownerRepo = parseOwnerRepo(skill.github_repo!);
    if (!ownerRepo) continue;
    const [owner, repo] = ownerRepo.split("/");

    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      if (repoData.description && repoData.description.length > 10) {
        updateSkillDescription(skill.slug, repoData.description);
        enriched++;
      }
    } catch (err) {
      if ((err as any)?.status !== 404) {
        console.warn(`[enrich-desc] ${skill.slug}: ${(err as Error).message}`);
      }
    }
  }

  // Pass 2: skills without github_repo — infer owner/repo from the slug's source prefix
  // slug format: "{owner}/{repo}/{skillId}", so the source is the first two path components
  const db = (await import("./db.js")).getDb();
  const skillsWithoutRepo = db
    .prepare(
      `SELECT * FROM skills
       WHERE github_repo IS NULL
         AND (description IS NULL OR description = 'Discover and install skills for AI agents.')
       ORDER BY installs DESC
       LIMIT ?`
    )
    .all(maxSkills) as (typeof skillsWithRepo)[number][];

  console.log(`Inferring github_repo for ${skillsWithoutRepo.length} skills from slug`);

  for (const skill of skillsWithoutRepo) {
    const parts = skill.slug.split("/");
    if (parts.length < 2) continue;
    const inferredRepo = `${parts[0]}/${parts[1]}`;

    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: parts[0],
        repo: parts[1],
      });
      updateSkillGithubRepo(skill.slug, inferredRepo);
      if (repoData.description && repoData.description.length > 10) {
        updateSkillDescription(skill.slug, repoData.description);
        enriched++;
      }
    } catch {
      // Inferred repo doesn't exist — skip silently
    }
  }

  console.log(`Skill description enrichment complete: ${enriched} updated`);
  return enriched;
}
