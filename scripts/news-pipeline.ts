#!/usr/bin/env npx tsx
/**
 * AgentRank News Pipeline
 *
 * Identifies newsworthy MCP/agent ecosystem developments from Twitter
 * conversations and surfaces them as content opportunities.
 *
 * Sources:
 *   1. @comforteagle's timeline (via .comforteagle-monitor-history.json)
 *   2. Broader MCP/agent ecosystem Twitter searches (Playwright)
 *
 * Generates structured news briefs and writes them to .news-queue.json
 * for consumption by tweet-bot.ts --type news and the blog content pipeline.
 *
 * Usage:
 *   npx tsx scripts/news-pipeline.ts              # full pipeline
 *   npx tsx scripts/news-pipeline.ts --dry-run    # preview without writes
 *   npx tsx scripts/news-pipeline.ts --refresh    # re-extract cookies first
 *   npx tsx scripts/news-pipeline.ts --no-scan    # skip Twitter search, history only
 *   npx tsx scripts/news-pipeline.ts --max=20     # max new items per run (default: 20)
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium, type Page } from "playwright";
import { isTier1 } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const COMFORTEAGLE_HISTORY_FILE = resolve(
  __dirname,
  "../.comforteagle-monitor-history.json"
);
export const NEWS_QUEUE_FILE = resolve(__dirname, "../.news-queue.json");

const MAX_TWEET_AGE_MS = 72 * 60 * 60 * 1000; // 72h
const MAX_QUEUE_ITEMS = 500;
const DEFAULT_MAX_NEW_ITEMS = 20;

// --- Types ---

export type NewsType =
  | "launch"
  | "update"
  | "funding"
  | "deprecation"
  | "milestone"
  | "discussion";

export interface NewsQueueItem {
  id: string;
  createdAt: string;
  source: "comforteagle" | "ecosystem_search";
  newsType: NewsType;
  headline: string;
  sourceTweetUrl: string;
  sourceTweetText: string;
  sourceAuthor: string;
  agentRankAngle: string; // how this relates to AgentRank
  contentAngle: string; // suggested framing/hook
  tweetDraft: string; // ready-to-post tweet from @AgentRank_ai
  status: "pending" | "posted" | "skipped";
  postedAt?: string;
}

export interface NewsQueue {
  lastUpdated: string;
  items: NewsQueueItem[];
}

// comforteagle-monitor NewsItem format (mirrors what that script saves)
interface ComforteagleNewsItem {
  id: string;
  capturedAt: string;
  sourceTweetId: string;
  sourceTweetUrl: string;
  sourceText: string;
  newsType: string;
  headline: string;
  contentOpportunities: string[];
}

interface ScrapedTweet {
  tweetId: string;
  authorHandle: string;
  text: string;
  tweetUrl: string;
  timestamp: string;
  engagementScore: number;
}

// --- Ecosystem search queries ---
const ECOSYSTEM_QUERIES = [
  '"mcp server" (launched OR released OR shipped) -from:AgentRank_ai min_faves:5',
  '"model context protocol" (launching OR announcing OR "open source") -from:AgentRank_ai min_faves:3',
  "mcp (funding OR raised) -from:AgentRank_ai min_faves:10",
  'mcp (deprecated OR sunset OR abandoned OR "shutting down") -from:AgentRank_ai min_faves:5',
];

// News classification patterns for scraped tweets
const NEWS_CLASSIFIERS: Array<{ pattern: RegExp; type: NewsType }> = [
  {
    pattern: /just (launched|released|shipped|published|open sourced)/i,
    type: "launch",
  },
  { pattern: /new (mcp|agent|tool|server|version)/i, type: "launch" },
  {
    pattern: /v\d+\.\d+|changelog|breaking change|major update/i,
    type: "update",
  },
  {
    pattern: /funding|raised|series [abc]|million|seed round/i,
    type: "funding",
  },
  {
    pattern: /deprecat|sunset|shutting down|end of life|abandoned/i,
    type: "deprecation",
  },
  {
    pattern: /milestone|\d+k\s*(users|stars|downloads|installs)/i,
    type: "milestone",
  },
];

// --- Queue I/O ---

export function loadQueue(): NewsQueue {
  if (!existsSync(NEWS_QUEUE_FILE)) {
    return { lastUpdated: new Date(0).toISOString(), items: [] };
  }
  try {
    return JSON.parse(readFileSync(NEWS_QUEUE_FILE, "utf-8"));
  } catch {
    return { lastUpdated: new Date(0).toISOString(), items: [] };
  }
}

export function saveQueue(queue: NewsQueue): void {
  if (queue.items.length > MAX_QUEUE_ITEMS) {
    // Keep all pending items + trim old done/skipped
    const pending = queue.items.filter((i) => i.status === "pending");
    const done = queue.items.filter((i) => i.status !== "pending");
    queue.items = [
      ...pending,
      ...done.slice(-Math.max(0, MAX_QUEUE_ITEMS - pending.length)),
    ];
  }
  queue.lastUpdated = new Date().toISOString();
  writeFileSync(NEWS_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function isAlreadyQueued(queue: NewsQueue, tweetId: string): boolean {
  return queue.items.some(
    (i) => i.id.includes(tweetId) || i.sourceTweetUrl.includes(tweetId)
  );
}

// --- Content Generation ---

function mapNewsType(rawType: string): NewsType {
  const map: Record<string, NewsType> = {
    launch: "launch",
    update: "update",
    funding: "funding",
    partnership: "discussion",
    deprecation: "deprecation",
    "breaking-news": "discussion",
    milestone: "milestone",
    discussion: "discussion",
  };
  return map[rawType] ?? "discussion";
}

function generateAgentRankAngle(newsType: NewsType): string {
  const angles: Record<NewsType, string> = {
    launch:
      "New entrant to the MCP ecosystem — AgentRank scores it from day one using real GitHub signals.",
    update:
      "Active development signals freshness — a first-class signal in AgentRank scoring.",
    funding:
      "Funding announcements often precede rapid development — we track GitHub velocity, not press.",
    deprecation:
      "Sunset/deprecation is a critical signal — AgentRank's freshness scoring captures this early.",
    milestone:
      "Community traction is visible in stars and dependents — both factor into the score.",
    discussion:
      "Ecosystem debate shapes developer awareness — AgentRank provides objective data.",
  };
  return angles[newsType];
}

function generateContentAngle(newsType: NewsType): string {
  const angles: Record<NewsType, string> = {
    launch:
      "Surface it in the AgentRank index and tweet the score once it accumulates GitHub signals.",
    update:
      "Consider a 'tools gaining momentum' tweet featuring this alongside others with recent commits.",
    funding:
      "Contrast funded-but-low-rank vs unfunded-but-high-rank to show scoring independence.",
    deprecation:
      "Explain how freshness scoring protects users from dead tools — use this as a concrete example.",
    milestone:
      "Feature in next 'rising stars' or 'most gained this week' tweet thread.",
    discussion:
      "Position AgentRank as the neutral data source in the debate.",
  };
  return angles[newsType];
}

function generateTweetDraft(
  newsType: NewsType,
  headline: string,
  sourceAuthor: string
): string {
  const cleanHeadline = headline
    .replace(new RegExp(`@${sourceAuthor}`, "gi"), "")
    .replace(/^[:\s,-]+/, "")
    .trim()
    .substring(0, 80);

  const templates: Record<NewsType, string[]> = {
    launch: [
      `${cleanHeadline}\n\nWe track this from day one — real GitHub signals, not hype.\n\nagentrank-ai.com`,
      `New in the MCP ecosystem: ${cleanHeadline}\n\nScore updates nightly from real GitHub data.\n\nagentrank-ai.com`,
    ],
    update: [
      `${cleanHeadline}\n\nActive development is a first-class signal in AgentRank scoring.\n\nagentrank-ai.com`,
      `${cleanHeadline}\n\nFreshness score just improved. Rankings update nightly.\n\nagentrank-ai.com`,
    ],
    funding: [
      `${cleanHeadline}\n\nFunded tools don't always rank highest. We score GitHub signals, not press releases.\n\nagentrank-ai.com`,
      `${cleanHeadline}\n\nFunding ≠ rank. Watch how the real signals evolve.\n\nagentrank-ai.com`,
    ],
    deprecation: [
      `${cleanHeadline}\n\nThis is why freshness is a first-class signal. AgentRank's score will reflect this.\n\nagentrank-ai.com`,
      `${cleanHeadline}\n\nDead tools still show up in AI recommendations. AgentRank's freshness scoring catches this early.\n\nagentrank-ai.com`,
    ],
    milestone: [
      `${cleanHeadline}\n\nCommunity traction. Stars and dependents both factor into the AgentRank score.\n\nagentrank-ai.com`,
    ],
    discussion: [
      `${cleanHeadline}\n\nObjective data cuts through the debate. 25k+ tools ranked by real signals.\n\nagentrank-ai.com`,
    ],
  };

  const options = templates[newsType];
  const draft = options[Math.floor(Math.random() * options.length)];

  if (draft.length <= 280) return draft;

  // Fallback: shorter headline
  const short = cleanHeadline.substring(0, 50);
  const fallback = `${short}...\n\n${options[0].split("\n").slice(1).join("\n")}`;
  return fallback.substring(0, 280);
}

function classifyTweet(text: string): NewsType {
  for (const classifier of NEWS_CLASSIFIERS) {
    if (classifier.pattern.test(text)) return classifier.type;
  }
  return "discussion";
}

// --- Source 1: Comforteagle Monitor History ---

function readComforteagleNewsItems(
  queue: NewsQueue,
  maxItems: number
): { items: NewsQueueItem[]; count: number } {
  if (!existsSync(COMFORTEAGLE_HISTORY_FILE)) {
    console.log("  No comforteagle-monitor history found.");
    return { items: [], count: 0 };
  }

  let history: { newsItems?: ComforteagleNewsItem[] };
  try {
    history = JSON.parse(readFileSync(COMFORTEAGLE_HISTORY_FILE, "utf-8"));
  } catch {
    console.log("  Failed to parse comforteagle-monitor history.");
    return { items: [], count: 0 };
  }

  const newsItems = history.newsItems ?? [];
  console.log(`  Found ${newsItems.length} items in comforteagle history.`);

  const result: NewsQueueItem[] = [];

  for (const item of newsItems) {
    if (result.length >= maxItems) break;
    if (isAlreadyQueued(queue, item.sourceTweetId)) continue;

    if (item.capturedAt) {
      const age = Date.now() - new Date(item.capturedAt).getTime();
      if (age > MAX_TWEET_AGE_MS) continue;
    }

    const newsType = mapNewsType(item.newsType);

    result.push({
      id: `comforteagle-${item.sourceTweetId}`,
      createdAt: new Date().toISOString(),
      source: "comforteagle",
      newsType,
      headline: item.headline,
      sourceTweetUrl: item.sourceTweetUrl,
      sourceTweetText: item.sourceText,
      sourceAuthor: "comforteagle",
      agentRankAngle: generateAgentRankAngle(newsType),
      contentAngle: generateContentAngle(newsType),
      tweetDraft: generateTweetDraft(newsType, item.headline, "comforteagle"),
      status: "pending",
    });
  }

  return { items: result, count: result.length };
}

// --- Source 2: Ecosystem Twitter Search ---

function loadCookies(): { auth_token: string; ct0: string; twid: string } {
  if (!existsSync(COOKIES_FILE)) {
    throw new Error(
      "No cookies file. Run --refresh or: npx tsx scripts/extract-chrome-cookies.ts"
    );
  }
  const data = JSON.parse(readFileSync(COOKIES_FILE, "utf-8"));
  if (!data.auth_token || !data.ct0) {
    throw new Error("Invalid cookies file. Run --refresh.");
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

async function createBrowserContext() {
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

  return { context, closeBrowser: () => browser.close() };
}

async function searchTweets(
  page: Page,
  query: string
): Promise<ScrapedTweet[]> {
  const url = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
  console.log(`  Searching: ${query.substring(0, 70)}...`);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000 + Math.random() * 2000);

  try {
    await page.waitForSelector('article[data-testid="tweet"]', {
      timeout: 10000,
    });
  } catch {
    console.log("  No tweets found.");
    return [];
  }

  for (let i = 0; i < 2; i++) {
    await page.mouse.wheel(0, 600);
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
        const text =
          article
            .querySelector('[data-testid="tweetText"]')
            ?.textContent?.trim() || "";

        const userLinks = article.querySelectorAll('a[href^="/"]');
        let authorHandle = "";
        for (const link of userLinks) {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/x\.com\/([^/]+)$/);
          if (
            match &&
            ![
              "home",
              "explore",
              "search",
              "notifications",
              "messages",
              "i",
            ].includes(match[1])
          ) {
            authorHandle = match[1];
            break;
          }
        }

        let tweetId = "";
        let tweetUrl = "";
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

        const timestamp =
          article.querySelector("time")?.getAttribute("datetime") || "";

        let engagementScore = 0;
        article
          .querySelectorAll(
            '[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]'
          )
          .forEach((el) => {
            const m = (el.getAttribute("aria-label") || "").match(
              /(\d[\d,]*)/
            );
            if (m) engagementScore += parseInt(m[1].replace(/,/g, ""), 10);
          });

        if (tweetId && authorHandle && text) {
          results.push({
            tweetId,
            authorHandle,
            text: text.substring(0, 600),
            tweetUrl,
            timestamp,
            engagementScore,
          });
        }
      } catch {
        // skip malformed
      }
    });

    return results;
  });

  console.log(`  Found ${tweets.length} tweets.`);
  return tweets;
}

async function scanEcosystemNews(
  queue: NewsQueue,
  maxItems: number
): Promise<{ items: NewsQueueItem[]; count: number }> {
  const { context, closeBrowser } = await createBrowserContext();
  const page = await context.newPage();
  const result: NewsQueueItem[] = [];

  try {
    const seenIds = new Set<string>();
    const allTweets: ScrapedTweet[] = [];

    for (const query of ECOSYSTEM_QUERIES) {
      if (result.length >= maxItems) break;
      const tweets = await searchTweets(page, query);
      for (const tweet of tweets) {
        if (!seenIds.has(tweet.tweetId)) {
          seenIds.add(tweet.tweetId);
          allTweets.push(tweet);
        }
      }
      await page.waitForTimeout(2000 + Math.random() * 1500);
    }

    // Sort by engagement descending
    allTweets.sort((a, b) => b.engagementScore - a.engagementScore);

    for (const tweet of allTweets) {
      if (result.length >= maxItems) break;

      if (isTier1(tweet.authorHandle)) continue;
      if (tweet.authorHandle.toLowerCase() === "agentrank_ai") continue;
      if (isAlreadyQueued(queue, tweet.tweetId)) continue;

      if (tweet.timestamp) {
        const age = Date.now() - new Date(tweet.timestamp).getTime();
        if (age > MAX_TWEET_AGE_MS) continue;
      }

      const newsType = classifyTweet(tweet.text);
      const headline = tweet.text
        .split(/[.!?\n]/)[0]
        .substring(0, 120)
        .trim();

      result.push({
        id: `ecosystem-${tweet.tweetId}`,
        createdAt: new Date().toISOString(),
        source: "ecosystem_search",
        newsType,
        headline,
        sourceTweetUrl: tweet.tweetUrl,
        sourceTweetText: tweet.text,
        sourceAuthor: tweet.authorHandle,
        agentRankAngle: generateAgentRankAngle(newsType),
        contentAngle: generateContentAngle(newsType),
        tweetDraft: generateTweetDraft(newsType, headline, tweet.authorHandle),
        status: "pending",
      });
    }
  } finally {
    await closeBrowser();
  }

  return { items: result, count: result.length };
}

// --- CLI ---

function parseArgs() {
  const args = process.argv.slice(2);
  const maxArg = args.find((a) => a.startsWith("--max="));
  return {
    dryRun: args.includes("--dry-run"),
    refresh: args.includes("--refresh"),
    noScan: args.includes("--no-scan"),
    maxItems: maxArg
      ? parseInt(maxArg.split("=")[1], 10) || DEFAULT_MAX_NEW_ITEMS
      : DEFAULT_MAX_NEW_ITEMS,
  };
}

// --- Main ---

async function main() {
  const { dryRun, refresh, noScan, maxItems } = parseArgs();

  if (refresh) refreshCookies();

  console.log(`\n=== AgentRank News Pipeline ===`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(
    `Sources: comforteagle-monitor history${noScan ? "" : " + ecosystem Twitter search"}`
  );
  console.log(`Max new items: ${maxItems}\n`);

  const queue = loadQueue();
  const pendingBefore = queue.items.filter((i) => i.status === "pending").length;
  console.log(
    `Current queue: ${queue.items.length} items (${pendingBefore} pending)\n`
  );

  let totalAdded = 0;

  // --- Source 1: @comforteagle monitor history ---
  console.log("--- Source 1: @comforteagle monitor history ---");
  const { items: comforteagleItems } = readComforteagleNewsItems(
    queue,
    Math.ceil(maxItems / 2)
  );
  console.log(`  New items: ${comforteagleItems.length}`);

  if (dryRun) {
    for (const item of comforteagleItems) {
      console.log(
        `  [DRY RUN] [${item.newsType}] ${item.headline.substring(0, 80)}`
      );
      console.log(`    tweet: ${item.tweetDraft.substring(0, 100)}...`);
    }
  } else {
    queue.items.push(...comforteagleItems);
  }
  totalAdded += comforteagleItems.length;

  // --- Source 2: Ecosystem Twitter search ---
  if (!noScan) {
    console.log("\n--- Source 2: Ecosystem Twitter search ---");
    try {
      const remaining = maxItems - totalAdded;
      if (remaining > 0) {
        const { items: ecosystemItems } = await scanEcosystemNews(
          queue,
          remaining
        );
        console.log(`  New items: ${ecosystemItems.length}`);

        if (dryRun) {
          for (const item of ecosystemItems) {
            console.log(
              `  [DRY RUN] [${item.newsType}] ${item.headline.substring(0, 80)}`
            );
            console.log(`    tweet: ${item.tweetDraft.substring(0, 100)}...`);
          }
        } else {
          queue.items.push(...ecosystemItems);
        }
        totalAdded += ecosystemItems.length;
      }
    } catch (err) {
      console.error(`  Ecosystem scan failed: ${err}`);
      console.log("  Continuing with comforteagle history only.");
    }
  }

  if (!dryRun) {
    saveQueue(queue);
    const pendingAfter = queue.items.filter(
      (i) => i.status === "pending"
    ).length;
    console.log(`\nQueue saved to: ${NEWS_QUEUE_FILE}`);
    console.log(
      `Total items: ${queue.items.length} (${pendingAfter} pending, +${totalAdded} this run)`
    );
  } else {
    console.log(`\n[DRY RUN] Would add ${totalAdded} items. Queue not written.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
