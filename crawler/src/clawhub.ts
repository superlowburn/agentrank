import { upsertSkill } from "./db.js";

const API_BASE = "https://clawhub.ai/api/v1/skills";
const USER_AGENT = "AgentRank/1.0 (https://agentrank-ai.com)";
const DELAY_MS = 2000;

interface ClawHubStats {
  comments: number;
  downloads: number;
  installsAllTime: number;
  installsCurrent: number;
  stars: number;
  versions: number;
}

interface ClawHubSkill {
  slug: string;
  displayName: string;
  summary: string;
  tags: Record<string, string>;
  stats: ClawHubStats;
  createdAt: number;
  updatedAt: number;
  latestVersion: {
    version: string;
    createdAt: number;
    changelog: string;
    license: string | null;
  } | null;
  metadata: {
    os: string | null;
    systems: string | null;
  } | null;
}

interface ClawHubResponse {
  items: ClawHubSkill[];
  nextCursor: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(cursor?: string): Promise<ClawHubResponse> {
  const url = cursor ? `${API_BASE}?cursor=${encodeURIComponent(cursor)}` : API_BASE;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ClawHub API returned ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as ClawHubResponse;
}

function derivePlatforms(skill: ClawHubSkill): string[] {
  const platforms: string[] = ["openclaw"];

  if (skill.metadata?.os) {
    const os = skill.metadata.os.toLowerCase();
    if (os.includes("mac") || os.includes("darwin")) platforms.push("macos");
    if (os.includes("linux")) platforms.push("linux");
    if (os.includes("win")) platforms.push("windows");
  }

  return platforms;
}

export async function crawlClawHub(): Promise<number> {
  console.log("=== ClawHub Crawler ===");
  console.log(`Fetching skills from ${API_BASE}`);

  let processed = 0;
  let cursor: string | undefined;
  let pageNum = 0;

  try {
    // Fetch first page to verify API is accessible
    const firstPage = await fetchPage();
    pageNum++;

    if (!firstPage.items || !Array.isArray(firstPage.items)) {
      console.log("ClawHub API returned unexpected format. Skipping.");
      return 0;
    }

    console.log(`  Page ${pageNum}: ${firstPage.items.length} skills`);

    for (const skill of firstPage.items) {
      upsertSkill({
        slug: `clawhub:${skill.slug}`,
        name: skill.displayName || skill.slug,
        description: skill.summary || null,
        github_repo: null,
        source: "clawhub",
        installs: skill.stats?.installsAllTime ?? 0,
        trending_rank: null,
        platforms: derivePlatforms(skill),
        author: null,
      });
      processed++;
    }

    cursor = firstPage.nextCursor ?? undefined;

    // Paginate through remaining pages
    while (cursor) {
      await sleep(DELAY_MS);

      const page = await fetchPage(cursor);
      pageNum++;

      if (!page.items || page.items.length === 0) {
        console.log(`  Page ${pageNum}: empty, stopping pagination`);
        break;
      }

      console.log(`  Page ${pageNum}: ${page.items.length} skills`);

      for (const skill of page.items) {
        upsertSkill({
          slug: `clawhub:${skill.slug}`,
          name: skill.displayName || skill.slug,
          description: skill.summary || null,
          github_repo: null,
          source: "clawhub",
          installs: skill.stats?.installsAllTime ?? 0,
          trending_rank: null,
          platforms: derivePlatforms(skill),
          author: null,
        });
        processed++;
      }

      cursor = page.nextCursor ?? undefined;
    }

    console.log(`ClawHub crawl complete: ${processed} skills processed across ${pageNum} pages`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("404") || message.includes("ENOTFOUND") || message.includes("fetch failed")) {
      console.log(`ClawHub API not reachable (${message}). ${processed} skills processed before failure.`);
    } else {
      console.error(`ClawHub crawler error: ${message}`);
      console.log(`${processed} skills processed before error.`);
    }
  }

  return processed;
}
