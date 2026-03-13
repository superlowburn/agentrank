import type { Octokit } from "octokit";
import { upsertRepo } from "./db.js";

const MAX_RESULTS = 1000;
const START_DATE = "2023-01-01";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function midpoint(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return formatDate(new Date(s + (e - s) / 2));
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return (e - s) / (1000 * 60 * 60 * 24);
}

async function searchRange(
  octokit: Octokit,
  query: string,
  start: string,
  end: string,
  depth: number = 0
): Promise<number> {
  const q = `${query} in:name,description stars:>=1 created:${start}..${end}`;
  console.log(`${"  ".repeat(depth)}Searching: ${query} [${start}..${end}]`);

  const firstPage = await octokit.rest.search.repos({
    q,
    per_page: 1,
    page: 1,
  });

  const totalCount = firstPage.data.total_count;
  console.log(`${"  ".repeat(depth)}  Found ${totalCount} results`);

  if (totalCount === 0) return 0;

  // If we hit the 1000 cap and the range is more than 1 day, split
  if (totalCount >= MAX_RESULTS && daysBetween(start, end) > 1) {
    const mid = midpoint(start, end);
    console.log(`${"  ".repeat(depth)}  Splitting at ${mid}`);
    const left = await searchRange(octokit, query, start, mid, depth + 1);
    const right = await searchRange(octokit, query, mid, end, depth + 1);
    return left + right;
  }

  // Paginate and collect results
  let collected = 0;
  const maxPages = Math.min(Math.ceil(totalCount / 100), 10); // 10 pages max = 1000 results

  for (let page = 1; page <= maxPages; page++) {
    const response = await octokit.rest.search.repos({
      q,
      per_page: 100,
      page,
      sort: "stars",
      order: "desc",
    });

    for (const repo of response.data.items) {
      upsertRepo({
        id: repo.id,
        full_name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        open_issues: repo.open_issues_count,
        language: repo.language,
        license: repo.license?.spdx_id ?? null,
        last_commit_at: repo.pushed_at,
        is_archived: repo.archived,
        is_fork: repo.fork,
        parent_stars: null,
        matched_query: query,
      });
      collected++;
    }

    if (response.data.items.length < 100) break;
  }

  return collected;
}

export async function runSearch(octokit: Octokit, query: string): Promise<number> {
  const today = formatDate(new Date());
  return searchRange(octokit, query, START_DATE, today);
}
