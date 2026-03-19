#!/usr/bin/env npx tsx
/**
 * AgentRank News Ingestion Pipeline
 *
 * Monitors @AgentRank_ai mentions on Twitter and ingests them as news items
 * via POST /api/v1/news. All ingested items start as 'draft'.
 *
 * Read-only on Twitter — does NOT reply, like, or retweet.
 * Respects Tier 1 contact filter (same as twitter-monitor.ts).
 *
 * Usage:
 *   npx tsx scripts/news-ingestion.ts                # run one cycle
 *   npx tsx scripts/news-ingestion.ts --dry-run       # preview without posting to API
 *   npx tsx scripts/news-ingestion.ts --refresh        # re-extract cookies first
 *   npx tsx scripts/news-ingestion.ts --max-items=20   # override per-run limit
 *   npx tsx scripts/news-ingestion.ts --local          # use local API (for dev)
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium, type Page, type BrowserContext } from "playwright";
import { isTier1 } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const HISTORY_FILE = resolve(__dirname, "../.news-ingestion-history.json");

// --- Config ---

const DEFAULT_MAX_ITEMS_PER_RUN = 20;
const MAX_TWEET_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours — go further back than monitor
const MAX_HISTORY_ITEMS = 2000;

// Search queries for @AgentRank_ai mentions
const SEARCH_QUERIES = [
  "@AgentRank_ai -from:AgentRank_ai",
  "@AgentRank_ai lang:en -from:AgentRank_ai",
];

// Category detection keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  launch: [
    "just released", "launching", "launched", "announcing", "new tool",
    "new mcp", "introducing", "just shipped", "released", "v1.0", "open source",
    "just open sourced", "check out my", "built a", "made a",
  ],
  update: [
    "update", "v2", "v3", "new version", "changelog", "breaking change",
    "migration", "upgraded", "bumped", "patch", "fix release", "now supports",
  ],
  analysis: [
    "compared", "comparison", "vs ", "versus", "review", "benchmark",
    "analysis", "thoughts on", "opinion", "ranking", "best", "top",
    "deep dive", "breakdown",
  ],
  trending: [
    "viral", "trending", "everyone", "everyone is", "blown up",
    "going viral", "popular", "taking off",
  ],
  community: [], // fallback
};

// Tool name extraction: common MCP/agent tool indicators
const TOOL_INDICATORS = [
  /mcp[-\s]?server/gi,
  /agent[-\s]?tool/gi,
  /model context protocol/gi,
  /@[\w-]+\/[\w-]+/g, // @owner/repo format
  /github\.com\/[\w-]+\/[\w-]+/gi,
];

// --- Types ---

interface ScrapedTweet {
  tweetId: string;
  authorHandle: string;
  text: string;
  tweetUrl: string;
  timestamp: string;
  engagementScore: number; // likes + retweets + replies
}

interface ThreadContext {
  parentTweet?: {
    tweetId: string;
    authorHandle: string;
    text: string;
    tweetUrl: string;
  };
  replies: Array<{
    tweetId: string;
    authorHandle: string;
    text: string;
  }>;
}

interface IngestionRecord {
  tweetId: string;
  authorHandle: string;
  tweetUrl: string;
  ingestedAt: string;
}

interface IngestionHistory {
  items: IngestionRecord[];
}

interface NewsPayload {
  title: string;
  summary: string;
  source_url: string;
  source: "twitter";
  category: "launch" | "update" | "community" | "analysis" | "trending";
  related_tool_slugs: string;
  author: string;
  author_handle: string;
  thread_context: string;
}

// --- Cookies ---

function loadCookies(): { auth_token: string; ct0: string; twid: string } {
  if (!existsSync(COOKIES_FILE)) {
    console.error(
      "No cookies file. Run with --refresh or: npx tsx scripts/extract-chrome-cookies.ts"
    );
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(COOKIES_FILE, "utf-8"));
  if (!data.auth_token || !data.ct0) {
    console.error("Invalid cookies file. Run with --refresh");
    process.exit(1);
  }
  return data;
}

function refreshCookies() {
  console.log("Refreshing cookies from Chrome...");
  execSync(
    `python3 -c "
from pycookiecheat import chrome_cookies
import json
cookies = chrome_cookies('https://x.com')
with open('${COOKIES_FILE}', 'w') as f:
    json.dump({'auth_token': cookies.get('auth_token',''), 'ct0': cookies.get('ct0',''), 'twid': cookies.get('twid','')}, f)
"`,
    { stdio: "inherit" }
  );
}

// --- History ---

function loadHistory(): IngestionHistory {
  if (!existsSync(HISTORY_FILE)) {
    return { items: [] };
  }
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return { items: [] };
  }
}

function saveHistory(history: IngestionHistory) {
  if (history.items.length > MAX_HISTORY_ITEMS) {
    history.items = history.items.slice(-MAX_HISTORY_ITEMS);
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function alreadyIngested(history: IngestionHistory, tweetId: string): boolean {
  return history.items.some((r) => r.tweetId === tweetId);
}

// --- Browser Setup ---

async function createBrowserContext(): Promise<{
  context: BrowserContext;
  closeBrowser: () => Promise<void>;
}> {
  const cookies = loadCookies();

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });

  // Remove automation indicators
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // @ts-ignore
    delete navigator.__proto__.webdriver;
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({
            state: Notification.permission,
          } as PermissionStatus)
        : originalQuery(parameters);
  });

  // Inject X auth cookies
  await context.addCookies([
    {
      name: "auth_token",
      value: cookies.auth_token,
      domain: ".x.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    },
    {
      name: "ct0",
      value: cookies.ct0,
      domain: ".x.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    },
    {
      name: "twid",
      value: cookies.twid || "",
      domain: ".x.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "None",
    },
  ]);

  return {
    context,
    closeBrowser: () => browser.close(),
  };
}

// --- Search Scraper ---

async function searchMentions(page: Page, query: string): Promise<ScrapedTweet[]> {
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`;

  console.log(`Searching: ${query}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000 + Math.random() * 2000);

  try {
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 });
  } catch {
    console.log("No tweets found.");
    return [];
  }

  // Scroll to load more
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(1200 + Math.random() * 800);
  }

  const tweets = await page.evaluate(() => {
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    const results: Array<{
      tweetId: string;
      authorHandle: string;
      text: string;
      tweetUrl: string;
      timestamp: string;
      engagementScore: number;
    }> = [];

    articles.forEach((article) => {
      try {
        const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
        const text = tweetTextEl?.textContent?.trim() || "";

        // Author handle
        const userLinks = article.querySelectorAll('a[href^="/"]');
        let authorHandle = "";
        for (const link of userLinks) {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/x\.com\/([^/]+)$/);
          if (
            match &&
            !["home", "explore", "search", "notifications", "messages", "i"].includes(match[1])
          ) {
            authorHandle = match[1];
            break;
          }
        }

        // Tweet URL + ID
        let tweetUrl = "";
        let tweetId = "";
        const statusLinks = article.querySelectorAll('a[href*="/status/"]');
        for (const link of statusLinks) {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/\/status\/(\d+)/);
          if (match) {
            tweetId = match[1];
            tweetUrl = href;
            break;
          }
        }

        // Timestamp
        const timeEl = article.querySelector("time");
        const timestamp = timeEl?.getAttribute("datetime") || "";

        // Engagement score: sum likes + retweets + replies from aria-labels
        let engagementScore = 0;
        const engagementEls = article.querySelectorAll(
          '[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]'
        );
        engagementEls.forEach((el) => {
          const label = el.getAttribute("aria-label") || "";
          const match = label.match(/(\d[\d,]*)/);
          if (match) {
            engagementScore += parseInt(match[1].replace(/,/g, ""), 10);
          }
        });

        if (tweetId && authorHandle && text) {
          results.push({
            tweetId,
            authorHandle,
            text: text.substring(0, 1000),
            tweetUrl,
            timestamp,
            engagementScore,
          });
        }
      } catch {
        // Skip malformed
      }
    });

    return results;
  });

  console.log(`Found ${tweets.length} mentions.`);
  return tweets;
}

// --- Thread Scraper ---

async function scrapeThread(page: Page, tweetUrl: string): Promise<ThreadContext> {
  const context: ThreadContext = { replies: [] };

  try {
    await page.goto(tweetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500 + Math.random() * 1500);

    try {
      await page.waitForSelector('article[data-testid="tweet"]', { timeout: 8000 });
    } catch {
      return context;
    }

    const threadData = await page.evaluate(() => {
      const articles = document.querySelectorAll('article[data-testid="tweet"]');
      const tweets: Array<{
        tweetId: string;
        authorHandle: string;
        text: string;
        tweetUrl: string;
        isMain: boolean;
      }> = [];

      articles.forEach((article, index) => {
        try {
          const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
          const text = tweetTextEl?.textContent?.trim() || "";

          const userLinks = article.querySelectorAll('a[href^="/"]');
          let authorHandle = "";
          for (const link of userLinks) {
            const href = (link as HTMLAnchorElement).href;
            const match = href.match(/x\.com\/([^/]+)$/);
            if (
              match &&
              !["home", "explore", "search", "notifications", "messages", "i"].includes(match[1])
            ) {
              authorHandle = match[1];
              break;
            }
          }

          let tweetUrl = "";
          let tweetId = "";
          const statusLinks = article.querySelectorAll('a[href*="/status/"]');
          for (const link of statusLinks) {
            const href = (link as HTMLAnchorElement).href;
            const match = href.match(/\/status\/(\d+)/);
            if (match) {
              tweetId = match[1];
              tweetUrl = href;
              break;
            }
          }

          if (text && authorHandle) {
            tweets.push({
              tweetId,
              authorHandle,
              text: text.substring(0, 500),
              tweetUrl,
              isMain: index === 0,
            });
          }
        } catch {
          // Skip
        }
      });

      return tweets;
    });

    if (threadData.length === 0) return context;

    // First article is the main tweet — check if it's a parent (reply to something earlier)
    // Articles after index 0 are replies to the main tweet
    const [main, ...replies] = threadData;

    // If the main tweet is itself a reply, try to scrape the parent
    const mainUrl = page.url();
    const parentMatch = mainUrl.match(/\/status\/(\d+)$/);
    if (parentMatch) {
      // Check if main tweet shows "Replying to" indicator
      const isReply = await page.evaluate(() => {
        const replyingTo = document.querySelector('[data-testid="reply"]');
        // Look for "Replying to @handle" text in the first article
        const firstArticle = document.querySelector('article[data-testid="tweet"]');
        if (!firstArticle) return false;
        const text = firstArticle.textContent || "";
        return text.includes("Replying to");
      });

      if (isReply && main) {
        context.parentTweet = {
          tweetId: main.tweetId,
          authorHandle: main.authorHandle,
          text: main.text,
          tweetUrl: main.tweetUrl,
        };
      }
    }

    // Add up to 5 replies for context
    context.replies = replies.slice(0, 5).map((r) => ({
      tweetId: r.tweetId,
      authorHandle: r.authorHandle,
      text: r.text,
    }));
  } catch (err) {
    console.log(`  Thread scrape failed: ${err}`);
  }

  return context;
}

// --- Content Analysis ---

function detectCategory(
  text: string
): "launch" | "update" | "community" | "analysis" | "trending" {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "community") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as "launch" | "update" | "analysis" | "trending";
    }
  }

  return "community";
}

function extractToolSlugs(text: string): string[] {
  const slugs: string[] = [];

  // Look for @owner/repo patterns
  const atMatches = text.matchAll(/@([\w-]+)\/([\w-]+)/g);
  for (const match of atMatches) {
    slugs.push(`${match[1]}/${match[2]}`);
  }

  // Look for github.com/owner/repo
  const ghMatches = text.matchAll(/github\.com\/([\w-]+)\/([\w-]+)/gi);
  for (const match of ghMatches) {
    slugs.push(`${match[1]}/${match[2]}`);
  }

  return [...new Set(slugs)].slice(0, 10);
}

function generateTitle(tweet: ScrapedTweet, category: string): string {
  const handle = `@${tweet.authorHandle}`;
  const text = tweet.text.substring(0, 100).replace(/\n/g, " ").trim();

  // Category-specific title prefixes
  const prefixes: Record<string, string> = {
    launch: `${handle} launches`,
    update: `${handle} releases update`,
    analysis: `${handle} analyzes`,
    trending: `Trending:`,
    community: `${handle} on AgentRank`,
  };

  const prefix = prefixes[category] || handle;

  // Try to extract a meaningful snippet after @AgentRank_ai mention
  const afterMention = tweet.text
    .replace(/@AgentRank_ai/gi, "")
    .replace(/^[\s:,-]+/, "")
    .trim();

  if (afterMention.length > 20) {
    const snippet = afterMention.substring(0, 80).replace(/\n/g, " ").trim();
    return `${prefix}: ${snippet}${snippet.length >= 80 ? "..." : ""}`;
  }

  return `${prefix}: ${text}${text.length >= 100 ? "..." : ""}`;
}

function generateSummary(
  tweet: ScrapedTweet,
  thread: ThreadContext,
  toolSlugs: string[]
): string {
  const parts: string[] = [];

  // Main tweet content
  const mainText = tweet.text.substring(0, 280).replace(/\n+/g, " ").trim();
  parts.push(mainText);

  // Parent context if available
  if (thread.parentTweet) {
    const parentPreview = thread.parentTweet.text.substring(0, 100).replace(/\n/g, " ").trim();
    parts.push(`In reply to @${thread.parentTweet.authorHandle}: "${parentPreview}..."`);
  }

  // Notable replies
  if (thread.replies.length > 0) {
    const firstReply = thread.replies[0];
    const replyPreview = firstReply.text.substring(0, 80).replace(/\n/g, " ").trim();
    parts.push(`Reply from @${firstReply.authorHandle}: "${replyPreview}..."`);
  }

  // Mentioned tools
  if (toolSlugs.length > 0) {
    parts.push(`Tools mentioned: ${toolSlugs.join(", ")}`);
  }

  return parts.join("\n\n").substring(0, 1000);
}

// --- API ---

async function postNewsItem(
  payload: NewsPayload,
  apiBase: string
): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase}/api/v1/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      // Duplicate source_url — API enforces dedup
      console.log("  Skipped (duplicate source_url per API).");
      return true; // treat as success for history purposes
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`  API error ${res.status}: ${body.substring(0, 200)}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`  POST /api/v1/news failed: ${err}`);
    return false;
  }
}

function isTweetInAgeRange(timestamp: string): boolean {
  if (!timestamp) return true; // allow if no timestamp
  const age = Date.now() - new Date(timestamp).getTime();
  return age <= MAX_TWEET_AGE_MS;
}

// --- CLI Args ---

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const refresh = args.includes("--refresh");
  const useLocal = args.includes("--local");

  let maxItems = DEFAULT_MAX_ITEMS_PER_RUN;
  const maxArg = args.find((a) => a.startsWith("--max-items="));
  if (maxArg) maxItems = parseInt(maxArg.split("=")[1], 10) || DEFAULT_MAX_ITEMS_PER_RUN;

  const apiBase = useLocal ? "http://localhost:4321" : "https://agentrank-ai.com";

  return { dryRun, refresh, maxItems, apiBase };
}

// --- Main ---

async function main() {
  const { dryRun, refresh, maxItems, apiBase } = parseArgs();

  if (refresh) {
    refreshCookies();
  }

  const history = loadHistory();

  console.log(`\n=== AgentRank News Ingestion ===`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`API: ${apiBase}`);
  console.log(`Max items this run: ${maxItems}`);
  console.log(`Already ingested: ${history.items.length}\n`);

  const { context, closeBrowser } = await createBrowserContext();
  const page = await context.newPage();

  let ingestedThisRun = 0;

  try {
    // Collect mentions from all search queries (deduplicated by tweetId)
    const seenIds = new Set<string>();
    const allMentions: ScrapedTweet[] = [];

    for (const query of SEARCH_QUERIES) {
      if (ingestedThisRun >= maxItems) break;
      const mentions = await searchMentions(page, query);
      for (const tweet of mentions) {
        if (!seenIds.has(tweet.tweetId)) {
          seenIds.add(tweet.tweetId);
          allMentions.push(tweet);
        }
      }
      // Brief pause between searches
      await page.waitForTimeout(2000 + Math.random() * 1500);
    }

    console.log(`\nTotal unique mentions: ${allMentions.length}\n`);

    // Sort by engagement descending — ingest most-discussed first
    allMentions.sort((a, b) => b.engagementScore - a.engagementScore);

    for (const tweet of allMentions) {
      if (ingestedThisRun >= maxItems) {
        console.log(`Hit per-run limit (${maxItems}). Stopping.`);
        break;
      }

      console.log(`\n--- @${tweet.authorHandle}: "${tweet.text.substring(0, 80)}..." ---`);
      console.log(`  URL: ${tweet.tweetUrl} | Engagement: ${tweet.engagementScore}`);

      // Filter: Tier 1 (no interaction, not even ingestion with their handle prominently)
      if (isTier1(tweet.authorHandle)) {
        console.log(`  SKIP: Tier 1 contact`);
        continue;
      }

      // Filter: own account
      if (tweet.authorHandle.toLowerCase() === "agentrank_ai") {
        console.log(`  SKIP: own tweet`);
        continue;
      }

      // Filter: already ingested
      if (alreadyIngested(history, tweet.tweetId)) {
        console.log(`  SKIP: already ingested`);
        continue;
      }

      // Filter: age
      if (!isTweetInAgeRange(tweet.timestamp)) {
        console.log(`  SKIP: too old`);
        continue;
      }

      // Analyze content
      const category = detectCategory(tweet.text);
      const toolSlugs = extractToolSlugs(tweet.text);
      const title = generateTitle(tweet, category);

      console.log(`  Category: ${category}`);
      console.log(`  Tools: ${toolSlugs.join(", ") || "(none)"}`);
      console.log(`  Title: ${title}`);

      // Scrape thread context
      console.log(`  Scraping thread...`);
      const thread = await scrapeThread(page, tweet.tweetUrl);
      console.log(`  Thread: ${thread.replies.length} replies, parent: ${thread.parentTweet ? "yes" : "no"}`);

      // Generate summary
      const summary = generateSummary(tweet, thread, toolSlugs);

      const payload: NewsPayload = {
        title,
        summary,
        source_url: tweet.tweetUrl,
        source: "twitter",
        category,
        related_tool_slugs: toolSlugs.join(","),
        author: tweet.authorHandle,
        author_handle: tweet.authorHandle,
        thread_context: JSON.stringify({
          mainTweet: { tweetId: tweet.tweetId, text: tweet.text, timestamp: tweet.timestamp },
          parentTweet: thread.parentTweet || null,
          replies: thread.replies,
          engagementScore: tweet.engagementScore,
        }),
      };

      if (dryRun) {
        console.log(`  [DRY RUN] Would POST to ${apiBase}/api/v1/news:`);
        console.log(`    title: ${payload.title}`);
        console.log(`    category: ${payload.category}`);
        console.log(`    summary: ${payload.summary.substring(0, 100)}...`);
        ingestedThisRun++;

        // Still record in history to prevent re-processing in dry-run loops
        history.items.push({
          tweetId: tweet.tweetId,
          authorHandle: tweet.authorHandle,
          tweetUrl: tweet.tweetUrl,
          ingestedAt: new Date().toISOString(),
        });
        continue;
      }

      console.log(`  Posting to API...`);
      const success = await postNewsItem(payload, apiBase);

      if (success) {
        history.items.push({
          tweetId: tweet.tweetId,
          authorHandle: tweet.authorHandle,
          tweetUrl: tweet.tweetUrl,
          ingestedAt: new Date().toISOString(),
        });
        ingestedThisRun++;
        console.log(`  Ingested ${ingestedThisRun}/${maxItems}.`);
      } else {
        console.log(`  Failed to ingest. Continuing...`);
      }

      // Small pause between items to avoid hammering Twitter
      await page.waitForTimeout(1500 + Math.random() * 1500);
    }
  } catch (err) {
    console.error("Error during ingestion:", err);
  } finally {
    await closeBrowser();
    saveHistory(history);
    console.log(`\n=== Done. Ingested this run: ${ingestedThisRun} ===\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
