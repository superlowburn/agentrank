/**
 * Glama.ai crawler
 *
 * Fetches MCP server data from Glama.ai — a registry indexing 19K+ MCP
 * servers with weekly downloads, quality grades, and tool metadata.
 *
 * Strategy:
 *   1. Fetch the sitemap at /sitemaps/mcp-servers.xml to discover all
 *      server detail page URLs.
 *   2. Fetch the listing page sorted by weekly-downloads to get a quick
 *      batch of the top 50 servers with structured JSON-LD data.
 *   3. For each server, fetch the individual detail page to extract:
 *      weekly downloads, tool count, quality grade, categories, GitHub URL.
 *   4. Cross-reference with existing repos by matching GitHub full_name.
 *      Call updateRepoGlama() for matches, upsertSkill() for all servers.
 *
 * The crawler uses only the built-in Node.js fetch API with 2-second delays
 * between page fetches.
 */

import { upsertSkill, updateRepoGlama } from "./db.js";

const USER_AGENT = "AgentRank/1.0 (https://agentrank-ai.com)";
const BASE_URL = "https://glama.ai";
const SITEMAP_URL = `${BASE_URL}/sitemaps/mcp-servers.xml`;
const LISTING_URL = `${BASE_URL}/mcp/servers?sort=weekly-downloads:desc`;
const DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GlamaServer {
  /** author/name slug from glama URL, e.g. "brave/brave-search-mcp-server" */
  slug: string;
  name: string | null;
  description: string | null;
  author: string | null;
  githubRepo: string | null;
  weeklyDownloads: number;
  toolCount: number;
  qualityGrade: string | null;
  categories: string[];
  glamaUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

async function fetchWithRetry(url: string, label: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchText(url);
    } catch (err) {
      console.warn(`[glama] ${label} attempt ${attempt}/${maxRetries} failed: ${(err as Error).message}`);
      if (attempt === maxRetries) throw err;
      await sleep(DELAY_MS * attempt);
    }
  }
  throw new Error("unreachable");
}

/**
 * Parse the sitemap XML to extract all MCP server URLs.
 * Each <loc> tag contains a URL like https://glama.ai/mcp/servers/author/name
 */
function parseSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const locPattern = /<loc>\s*(https:\/\/glama\.ai\/mcp\/servers\/[^<]+)\s*<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = locPattern.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

/**
 * Extract the author/name slug from a Glama server URL.
 * e.g. "https://glama.ai/mcp/servers/brave/brave-search-mcp-server" -> "brave/brave-search-mcp-server"
 */
function slugFromUrl(url: string): string | null {
  const match = url.match(/\/mcp\/servers\/([^/?#]+\/[^/?#]+)/);
  return match ? match[1] : null;
}

/**
 * Extract GitHub full_name from a server detail page.
 * Looks for links to github.com/{owner}/{repo}.
 */
function extractGitHubRepo(html: string): string | null {
  // Match github.com links that look like repo URLs (not just github.com/owner)
  // Prioritize explicit repo links, not just any github reference
  const patterns = [
    // Direct repo link: github.com/owner/repo (not github.com/owner/repo/something)
    /https?:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?(?:["'\s<,;)}\]#?]|$)/g,
  ];

  const candidates = new Set<string>();
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      const fullName = match[1]
        .replace(/\.git$/, "")
        .replace(/\/+$/, "");
      // Filter out common non-repo github paths
      if (
        !fullName.includes("/issues") &&
        !fullName.includes("/pull") &&
        !fullName.includes("/blob") &&
        !fullName.includes("/tree") &&
        !fullName.includes("/commit") &&
        !fullName.includes("/releases") &&
        !fullName.includes("/actions") &&
        !fullName.includes("/wiki") &&
        !fullName.includes("/settings") &&
        !fullName.includes("/stargazers") &&
        !fullName.includes("/network") &&
        !fullName.includes("/graphs") &&
        fullName.split("/").length === 2
      ) {
        candidates.add(fullName);
      }
    }
  }

  if (candidates.size === 0) return null;

  // If there's only one candidate, use it
  if (candidates.size === 1) return candidates.values().next().value!;

  // If multiple, prefer one that matches the slug pattern (author matches)
  return candidates.values().next().value!;
}

/**
 * Extract weekly downloads count from a server detail page.
 * Looks for patterns like "7,160" near "Weekly Downloads" or "NPM Weekly Downloads".
 */
function extractWeeklyDownloads(html: string): number {
  // Pattern: number near "weekly download" text
  // The page shows "Weekly Downloads" or "NPM Weekly Downloads" followed by a number
  const patterns = [
    /(?:weekly[- ]downloads?|npm[- ]weekly[- ]downloads?)[^0-9]*?([\d,]+)/i,
    /([\d,]+)\s*(?:weekly[- ]downloads?)/i,
    // JSON-LD or structured data pattern
    /"weeklyDownloads"\s*:\s*(\d+)/i,
    /"weekly_downloads"\s*:\s*(\d+)/i,
    // Also try finding it in meta or data attributes
    /downloads[^0-9]{0,30}([\d,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const num = parseInt(match[1].replace(/,/g, ""), 10);
      // Sanity cap: no MCP server has >10M weekly downloads. If higher, it's a false positive.
      if (!isNaN(num) && num >= 0 && num < 10_000_000) return num;
    }
  }

  return 0;
}

/**
 * Extract tool count from a server detail page.
 * Looks for the number of tools listed.
 */
function extractToolCount(html: string): number {
  const patterns = [
    // "6 tools" or "19 tools"
    /(\d+)\s+tools?\b/i,
    // JSON data pattern
    /"toolCount"\s*:\s*(\d+)/i,
    /"tool_count"\s*:\s*(\d+)/i,
    // Count tool entries in tools section
    /"tools"\s*:\s*\[/i,
  ];

  for (let i = 0; i < patterns.length - 1; i++) {
    const match = html.match(patterns[i]);
    if (match?.[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  // Fallback: count tool name occurrences in a tools array/section
  // Look for tool objects in serialized data
  const toolObjects = html.match(/"inputSchema"\s*:/g);
  if (toolObjects) return toolObjects.length;

  return 0;
}

/**
 * Extract quality grade from a server detail page.
 * The page shows grades like "A", "B+", "C" etc.
 */
function extractQualityGrade(html: string): string | null {
  const patterns = [
    // Direct quality grade pattern in data
    /(?:quality[_ -]grade|qualityGrade)[^A-Za-z]{0,20}([A-F][+-]?)\b/i,
    // Look for grade in structured form: "Quality" ... "A"
    /quality[^A-F]{0,50}(?:grade[^A-F]{0,20})?["':>\s]+([A-F][+-]?)\b/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Extract categories from a server detail page.
 */
function extractCategories(html: string): string[] {
  const categories: string[] = [];

  // Look for category links or labels
  // Pattern: category names appear in links like /mcp/servers?query=category:xyz
  const catPattern = /category:([\w\s&-]+?)(?:["'<\s]|$)/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((match = catPattern.exec(html)) !== null) {
    const cat = match[1].trim();
    if (cat && !seen.has(cat.toLowerCase())) {
      seen.add(cat.toLowerCase());
      categories.push(cat);
    }
  }

  // Also look for categories in JSON-LD or structured data
  const jsonLdCatPattern = /"applicationSubCategory"\s*:\s*"([^"]+)"/g;
  while ((match = jsonLdCatPattern.exec(html)) !== null) {
    const cat = match[1].trim();
    if (cat && !seen.has(cat.toLowerCase())) {
      seen.add(cat.toLowerCase());
      categories.push(cat);
    }
  }

  return categories;
}

/**
 * Extract server name from detail page.
 */
function extractName(html: string): string | null {
  // og:title usually has the name
  const ogTitle = html.match(/<meta\s+(?:property="og:title"|name="title")\s+content="([^"]*?)"/i);
  if (ogTitle?.[1]) {
    // Clean up — often in format "Name | Glama" or "Name - MCP Server | Glama"
    let name = ogTitle[1].replace(/\s*\|\s*Glama\s*$/i, "").trim();
    if (name) return name;
  }

  // Look for displayName in data
  const displayName = html.match(/"displayName"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (displayName?.[1]) {
    return displayName[1].replace(/\\"/g, '"').trim();
  }

  // Title tag
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (title?.[1]) {
    let name = title[1].replace(/\s*\|\s*Glama\s*$/i, "").trim();
    if (name) return name;
  }

  return null;
}

/**
 * Extract description from detail page.
 */
function extractDescription(html: string): string | null {
  // og:description
  const ogDesc = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]*?)"/i);
  if (ogDesc?.[1]) {
    const desc = ogDesc[1].trim();
    if (desc.length > 10) return desc;
  }

  // description in data
  const dataDesc = html.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (dataDesc?.[1]) {
    const desc = dataDesc[1].replace(/\\"/g, '"').replace(/\\n/g, " ").trim();
    if (desc.length > 10 && desc.length < 1000) return desc;
  }

  return null;
}

/**
 * Extract author name from detail page.
 */
function extractAuthor(html: string): string | null {
  // Author in JSON-LD or structured data
  const patterns = [
    /"author"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/,
    /"namespace"\s*:\s*"([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

/**
 * Parse a server detail page to extract all relevant data.
 */
function parseDetailPage(html: string, slug: string): GlamaServer {
  const author = extractAuthor(html) || slug.split("/")[0] || null;

  return {
    slug,
    name: extractName(html),
    description: extractDescription(html),
    author,
    githubRepo: extractGitHubRepo(html),
    weeklyDownloads: extractWeeklyDownloads(html),
    toolCount: extractToolCount(html),
    qualityGrade: extractQualityGrade(html),
    categories: extractCategories(html),
    glamaUrl: `${BASE_URL}/mcp/servers/${slug}`,
  };
}

/**
 * Parse the JSON-LD structured data from the listing page to get basic info
 * for the top servers (by weekly downloads).
 * Returns an array of partial server data with slug, name, description, author.
 */
function parseListingJsonLd(html: string): Array<{
  slug: string;
  name: string;
  description: string;
  author: string;
  url: string;
}> {
  const servers: Array<{
    slug: string;
    name: string;
    description: string;
    author: string;
    url: string;
  }> = [];

  // Extract JSON-LD blocks
  const jsonLdPattern = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(blockMatch[1]);
      if (data["@type"] === "SearchResultsPage" && data.mainEntity?.itemListElement) {
        for (const item of data.mainEntity.itemListElement) {
          const serverItem = item.item || item;
          const url = serverItem.url || "";
          const slug = slugFromUrl(url);
          if (!slug) continue;

          servers.push({
            slug,
            name: serverItem.name || "",
            description: serverItem.description || "",
            author: serverItem.author?.name || slug.split("/")[0] || "",
            url,
          });
        }
      }
    } catch {
      // Not valid JSON or wrong structure, skip
    }
  }

  return servers;
}

// ---------------------------------------------------------------------------
// Main crawl function
// ---------------------------------------------------------------------------

export async function crawlGlama(): Promise<{ matched: number; total: number }> {
  console.log("[glama] Starting Glama.ai crawl...");
  let total = 0;
  let matched = 0;

  // -------------------------------------------------------------------------
  // Step 1: Fetch the sitemap to discover all server URLs
  // -------------------------------------------------------------------------
  console.log("[glama] Fetching sitemap...");
  let serverUrls: string[] = [];
  try {
    const sitemapXml = await fetchWithRetry(SITEMAP_URL, "Sitemap fetch");
    serverUrls = parseSitemapUrls(sitemapXml);
    console.log(`[glama] Found ${serverUrls.length} server URLs in sitemap`);
  } catch (err) {
    console.error("[glama] Failed to fetch sitemap after 3 attempts:", (err as Error).message);
    // Fall back to listing page only
  }

  await sleep(DELAY_MS);

  // -------------------------------------------------------------------------
  // Step 2: Fetch the listing page sorted by weekly downloads to get the
  //         most popular servers with their structured data
  // -------------------------------------------------------------------------
  console.log("[glama] Fetching listing page (sorted by weekly downloads)...");
  let listingServers: Array<{
    slug: string;
    name: string;
    description: string;
    author: string;
    url: string;
  }> = [];

  try {
    const listingHtml = await fetchWithRetry(LISTING_URL, "Listing page fetch");
    listingServers = parseListingJsonLd(listingHtml);
    console.log(`[glama] Extracted ${listingServers.length} servers from listing JSON-LD`);
  } catch (err) {
    console.error("[glama] Failed to fetch listing page after 3 attempts:", (err as Error).message);
  }

  await sleep(DELAY_MS);

  // -------------------------------------------------------------------------
  // Step 3: Build the combined set of server slugs to crawl.
  //
  // Priority order:
  //   1. Servers from the listing page (top by downloads — most valuable)
  //   2. Remaining servers from the sitemap
  //
  // To avoid crawling 19K detail pages every run (which would take 10+ hours
  // at 2s delay), we limit to a practical batch size. The listing page gives
  // us the 50 most-downloaded servers. We supplement with sitemap servers up
  // to a configurable limit.
  // -------------------------------------------------------------------------
  const MAX_DETAIL_PAGES = parseInt(process.env.GLAMA_MAX_PAGES || "500", 10);

  const slugSet = new Set<string>();
  const orderedSlugs: string[] = [];

  // Add listing page servers first (highest priority — most downloaded)
  for (const s of listingServers) {
    if (!slugSet.has(s.slug)) {
      slugSet.add(s.slug);
      orderedSlugs.push(s.slug);
    }
  }

  // Add sitemap servers
  for (const url of serverUrls) {
    const slug = slugFromUrl(url);
    if (slug && !slugSet.has(slug)) {
      slugSet.add(slug);
      orderedSlugs.push(slug);
    }
  }

  console.log(`[glama] ${orderedSlugs.length} unique servers discovered`);
  const slugsToProcess = orderedSlugs.slice(0, MAX_DETAIL_PAGES);
  console.log(`[glama] Will process ${slugsToProcess.length} server detail pages (limit: ${MAX_DETAIL_PAGES})`);

  // Build a quick lookup from slug to listing data for fallback
  const listingLookup = new Map(listingServers.map((s) => [s.slug, s]));

  // -------------------------------------------------------------------------
  // Step 4: Fetch each detail page, extract data, cross-reference with repos
  // -------------------------------------------------------------------------
  interface RetryItem {
    slug: string;
    attempts: number;
  }
  const retryQueue: RetryItem[] = [];

  for (let i = 0; i < slugsToProcess.length; i++) {
    const slug = slugsToProcess[i];
    const detailUrl = `${BASE_URL}/mcp/servers/${slug}`;

    // Progress logging every 25 servers
    if (i % 25 === 0) {
      console.log(
        `[glama] Processing ${i + 1}/${slugsToProcess.length}: ${slug}` +
          ` (matched: ${matched}, total: ${total})`
      );
    }

    let server: GlamaServer;

    try {
      const html = await fetchText(detailUrl);
      server = parseDetailPage(html, slug);
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes("404")) {
        // Server page genuinely gone, skip
        continue;
      }
      console.warn(`[glama] Detail fetch failed for ${slug} (attempt 1/3): ${message}`);
      retryQueue.push({ slug, attempts: 1 });
      if (i < slugsToProcess.length - 1) await sleep(DELAY_MS);
      continue;
    }

    total++;

    // Upsert into skills table
    try {
      upsertSkill({
        slug: `glama:${slug}`,
        name: server.name,
        description: server.description,
        github_repo: server.githubRepo ? `https://github.com/${server.githubRepo}` : null,
        source: "glama",
        installs: server.weeklyDownloads,
        trending_rank: null,
        platforms: ["MCP"],
        author: server.author,
      });
    } catch (err) {
      console.error(`[glama] Failed to upsert skill for ${slug}:`, (err as Error).message);
    }

    // Cross-reference with repos table by GitHub full_name
    if (server.githubRepo) {
      try {
        updateRepoGlama(server.githubRepo, {
          weekly_downloads: server.weeklyDownloads,
          tool_calls: server.toolCount,
        });
        matched++;
      } catch (err) {
        // updateRepoGlama silently does nothing if the repo isn't in the table,
        // but catch any unexpected errors
        console.error(
          `[glama] Failed to update repo ${server.githubRepo}:`,
          (err as Error).message
        );
      }
    }

    // Delay between fetches
    if (i < slugsToProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Step 5: Process retry queue — each failed item gets up to 2 more attempts
  // -------------------------------------------------------------------------
  if (retryQueue.length > 0) {
    console.log(`[glama] Processing ${retryQueue.length} retries...`);
    let queue = [...retryQueue];
    while (queue.length > 0) {
      const nextQueue: RetryItem[] = [];
      for (const entry of queue) {
        const attempt = entry.attempts + 1;
        const detailUrl = `${BASE_URL}/mcp/servers/${entry.slug}`;
        try {
          await sleep(DELAY_MS * attempt);
          const html = await fetchText(detailUrl);
          const server = parseDetailPage(html, entry.slug);
          total++;

          upsertSkill({
            slug: `glama:${entry.slug}`,
            name: server.name,
            description: server.description,
            github_repo: server.githubRepo ? `https://github.com/${server.githubRepo}` : null,
            source: "glama",
            installs: server.weeklyDownloads,
            trending_rank: null,
            platforms: ["MCP"],
            author: server.author,
          });

          if (server.githubRepo) {
            try {
              updateRepoGlama(server.githubRepo, {
                weekly_downloads: server.weeklyDownloads,
                tool_calls: server.toolCount,
              });
              matched++;
            } catch {}
          }

          console.log(`[glama] Retry succeeded for ${entry.slug} on attempt ${attempt}/3`);
        } catch (err) {
          if (attempt >= 3) {
            console.error(`[glama] FAILED after 3 attempts: ${entry.slug} — ${(err as Error).message}`);
          } else {
            nextQueue.push({ ...entry, attempts: attempt });
          }
        }
      }
      queue = nextQueue;
    }
  }

  console.log(`[glama] Crawl complete.`);
  console.log(`[glama]   Total servers processed: ${total}`);
  console.log(`[glama]   Matched to existing repos: ${matched}`);
  console.log(`[glama]   Servers from sitemap: ${serverUrls.length}`);
  console.log(`[glama]   Servers from listing: ${listingServers.length}`);

  return { matched, total };
}
