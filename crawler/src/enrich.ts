import type { Octokit } from "octokit";
import { getStaleRepos, updateEnrichment } from "./db.js";

async function getContributorCount(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  try {
    // Request 1 per page and read the Link header to get total
    const response = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 1,
      anon: "true",
    });

    // Parse Link header for last page number
    const linkHeader = response.headers.link;
    if (!linkHeader) {
      return response.data.length;
    }

    const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) {
      return parseInt(lastMatch[1], 10);
    }

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

export async function enrichRepos(
  octokit: Octokit,
  maxRepos: number = 300
): Promise<number> {
  const stale = getStaleRepos();
  const toEnrich = stale.slice(0, maxRepos);

  console.log(`\nEnriching ${toEnrich.length} repos (${stale.length} stale total)`);

  let enriched = 0;
  for (const repo of toEnrich) {
    const [owner, name] = repo.full_name.split("/");

    try {
      const [contributors, closedIssues] = await Promise.all([
        getContributorCount(octokit, owner, name),
        getClosedIssueCount(octokit, repo.full_name),
      ]);

      updateEnrichment(repo.id, {
        closed_issues: closedIssues,
        contributors,
      });

      enriched++;
      if (enriched % 50 === 0) {
        console.log(`  Enriched ${enriched}/${toEnrich.length}`);
      }
    } catch (err) {
      console.error(`  Failed to enrich ${repo.full_name}:`, err);
    }
  }

  console.log(`Enrichment complete: ${enriched}/${toEnrich.length}`);
  return enriched;
}
