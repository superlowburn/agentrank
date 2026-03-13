/**
 * GitHub dependents scraper
 *
 * Scrapes github.com/{owner}/{repo}/network/dependents to get the count
 * of repositories that depend on a given repo. This is the strongest
 * scoring signal for AgentRank but is not available via the GitHub API.
 *
 * Rate limiting: Uses randomized 2.5-3.5s delays between requests with
 * exponential backoff on 429/403 responses. Uses a browser-like User-Agent
 * since GitHub blocks custom UAs on web pages.
 */

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BASE_DELAY_MS = 3000;
const JITTER_MS = 500; // +/- 500ms randomization

function randomDelay(): number {
  return BASE_DELAY_MS + (Math.random() * 2 - 1) * JITTER_MS;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch the dependents count for a GitHub repository.
 * Returns the number of repositories that depend on this repo,
 * or 0 if the page is unavailable or has no dependents section.
 */
export async function getDependentsCount(
  fullName: string
): Promise<{ count: number; rateLimited: boolean }> {
  const url = `https://github.com/${fullName}/network/dependents`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (res.status === 429 || res.status === 403) {
    return { count: 0, rateLimited: true };
  }

  if (res.status === 404) {
    return { count: 0, rateLimited: false };
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const html = await res.text();

  // The dependents page shows the count in a tab link like:
  //                277,408
  //                Repositories
  // Both are on separate lines with heavy indentation inside an <a> tag.
  // We match the number on its own line followed by "Repositories" on the next line.
  const match = html.match(/^\s+([\d,]+)\s*\n\s*Repositories/m);
  if (match?.[1]) {
    return {
      count: parseInt(match[1].replace(/,/g, ""), 10),
      rateLimited: false,
    };
  }

  return { count: 0, rateLimited: false };
}

export { randomDelay };
