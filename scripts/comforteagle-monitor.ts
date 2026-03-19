#!/usr/bin/env npx tsx
/**
 * @comforteagle Twitter Monitor
 *
 * Monitors Steve's (@comforteagle) timeline and replies for conversations
 * about MCP, agent tools, AI tooling, and rankings. Identifies opportunities
 * to organically mention @AgentRank_ai, generates draft replies for Steve's
 * approval, and extracts newsworthy items for the content pipeline.
 *
 * IMPORTANT: This script NEVER auto-posts. All handle drop drafts require
 * Steve's explicit approval before @AgentRank_ai posts anything.
 *
 * Usage:
 *   npx tsx scripts/comforteagle-monitor.ts               # run one cycle
 *   npx tsx scripts/comforteagle-monitor.ts --dry-run     # preview, no file writes
 *   npx tsx scripts/comforteagle-monitor.ts --refresh     # re-extract cookies first
 *   npx tsx scripts/comforteagle-monitor.ts --replies     # also scan replies tab
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium, type Page, type BrowserContext } from "playwright";
import { isTier1 } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const HISTORY_FILE = resolve(__dirname, "../.comforteagle-monitor-history.json");

const COMFORTEAGLE_HANDLE = "comforteagle";
const MAX_SEEN_IDS = 2000;

// --- MCP/agent relevance signals ---

const MCP_KEYWORDS = [
  "mcp", "model context protocol", "mcp server", "agent tool", "agent tools",
  "agentrank", "agent rank", "llm tools", "ai tools", "ai agents", "tool use",
  "function calling", "llm ecosystem", "mcp ecosystem", "open source ai",
  "context window", "retrieval", "rag", "ai stack", "developer ai",
  "anthropic", "openai tools", "cursor", "windsurf", "cline",
  "claude tools", "claude mcp", "smithery", "glama", "pulsemcp",
];

const MCP_CONTEXT_KEYWORDS = [
  "building with", "ship", "shipped", "just released", "new tool",
  "open source", "developer tools", "ai dev", "hackathon",
  "ranking", "leaderboard", "ecosystem", "integration",
];

// Topics where @AgentRank_ai adds clear value
const HANDLE_DROP_TRIGGERS = [
  { pattern: /best\s+(mcp|agent)\s+server/i, topic: "mcp-servers", weight: 10 },
  { pattern: /which\s+(mcp|agent)\s+(server|tool)/i, topic: "mcp-servers", weight: 10 },
  { pattern: /recommend.{0,30}(mcp|agent|tool)/i, topic: "mcp-servers", weight: 8 },
  { pattern: /looking for.{0,40}(mcp|agent|tool)/i, topic: "mcp-servers", weight: 8 },
  { pattern: /(mcp|agent).{0,20}ranking/i, topic: "rankings", weight: 9 },
  { pattern: /agentrank/i, topic: "brand-mention", weight: 10 },
  { pattern: /ranked.{0,30}(tool|server|agent)/i, topic: "rankings", weight: 7 },
  { pattern: /(top|best).{0,20}(tool|server|agent)/i, topic: "tool-recommendations", weight: 6 },
  { pattern: /mcp.{0,30}ecosystem/i, topic: "ecosystem", weight: 7 },
  { pattern: /awesome.{0,20}mcp/i, topic: "awesome-lists", weight: 8 },
];

// News-worthy signal patterns
const NEWS_SIGNALS = [
  { pattern: /just (launched|released|shipped|published)/i, type: "launch" as const },
  { pattern: /new (mcp|agent|tool|server)/i, type: "launch" as const },
  { pattern: /(acqui|partner|integrat).{0,30}(mcp|agent|ai)/i, type: "partnership" as const },
  { pattern: /deprecat|sunset|shutting down/i, type: "deprecation" as const },
  { pattern: /(funding|raised|series [abc])/i, type: "funding" as const },
  { pattern: /breaking.{0,30}(mcp|agent|ai)/i, type: "breaking-news" as const },
  { pattern: /(milestone|users|downloads).{0,20}(\d+[km]?)/i, type: "milestone" as const },
];

// --- Types ---

interface ScrapedTweet {
  tweetId: string;
  authorHandle: string;
  text: string;
  tweetUrl: string;
  timestamp: string;
  isReply: boolean;
  replyToHandle?: string;
}

interface HandleDropDraft {
  id: string;
  capturedAt: string;
  sourceTweetId: string;
  sourceTweetUrl: string;
  sourceText: string;
  sourceAuthor: string;
  topic: string;
  relevanceScore: number;
  relevanceReason: string;
  replyDraft: string;
  status: "pending_approval" | "approved" | "rejected" | "posted";
}

interface NewsItem {
  id: string;
  capturedAt: string;
  sourceTweetId: string;
  sourceTweetUrl: string;
  sourceText: string;
  newsType: "launch" | "partnership" | "deprecation" | "funding" | "breaking-news" | "milestone";
  headline: string;
  contentOpportunities: Array<"blog" | "tweet" | "newsletter">;
}

interface ComforteagleMonitorHistory {
  lastRunAt: string;
  seenTweetIds: string[];
  drafts: HandleDropDraft[];
  newsItems: NewsItem[];
  stats: {
    totalScanned: number;
    totalDrafted: number;
    totalNewsItems: number;
  };
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
    console.error("Invalid cookies file. Run with --refresh.");
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

function loadHistory(): ComforteagleMonitorHistory {
  if (!existsSync(HISTORY_FILE)) {
    return {
      lastRunAt: new Date(0).toISOString(),
      seenTweetIds: [],
      drafts: [],
      newsItems: [],
      stats: { totalScanned: 0, totalDrafted: 0, totalNewsItems: 0 },
    };
  }
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return {
      lastRunAt: new Date(0).toISOString(),
      seenTweetIds: [],
      drafts: [],
      newsItems: [],
      stats: { totalScanned: 0, totalDrafted: 0, totalNewsItems: 0 },
    };
  }
}

function saveHistory(history: ComforteagleMonitorHistory) {
  // Cap seen IDs at FIFO limit
  if (history.seenTweetIds.length > MAX_SEEN_IDS) {
    history.seenTweetIds = history.seenTweetIds.slice(-MAX_SEEN_IDS);
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// --- Browser ---

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
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
        : originalQuery(parameters);
  });

  // Inject X auth cookies (logged in as @AgentRank_ai - used for viewing public timeline)
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

// --- Timeline Scraper ---

async function scrapeTimeline(
  page: Page,
  tab: "tweets" | "with_replies" = "tweets"
): Promise<ScrapedTweet[]> {
  const url =
    tab === "with_replies"
      ? `https://x.com/${COMFORTEAGLE_HANDLE}/with_replies`
      : `https://x.com/${COMFORTEAGLE_HANDLE}`;

  console.log(`  Navigating to @${COMFORTEAGLE_HANDLE} ${tab} tab...`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000 + Math.random() * 2000);

  try {
    await page.waitForSelector('article[data-testid="tweet"]', { timeout: 12000 });
  } catch {
    console.log("  No tweets found on timeline.");
    return [];
  }

  // Scroll a bit to load more
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000 + Math.random() * 800);
  }

  const tweets = await page.evaluate((handle) => {
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    const results: Array<{
      tweetId: string;
      authorHandle: string;
      text: string;
      tweetUrl: string;
      timestamp: string;
      isReply: boolean;
      replyToHandle?: string;
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
          const match = href.match(/x\.com\/([^/?#]+)$/);
          if (
            match &&
            !["home", "explore", "search", "notifications", "messages", "i"].includes(
              match[1]
            )
          ) {
            authorHandle = match[1];
            break;
          }
        }

        // Tweet URL and ID
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

        // Is a reply? Check for "Replying to @..." text
        const socialContext = article.querySelector('[data-testid="socialContext"]');
        const replyingToEl = article.querySelector(
          '[data-testid="reply"] ~ div, div[class*="replyingTo"]'
        );
        // Simpler: check if the text node before the tweet mentions "Replying to"
        const articleText = article.textContent || "";
        const isReply = articleText.includes("Replying to @");

        let replyToHandle: string | undefined;
        if (isReply) {
          const replyMatch = articleText.match(/Replying to @(\w+)/);
          if (replyMatch) replyToHandle = replyMatch[1];
        }

        if (tweetId && text) {
          results.push({
            tweetId,
            authorHandle: authorHandle || handle,
            text: text.substring(0, 600),
            tweetUrl,
            timestamp,
            isReply,
            replyToHandle,
          });
        }
      } catch {
        // skip
      }
    });

    return results;
  }, COMFORTEAGLE_HANDLE);

  console.log(`  Scraped ${tweets.length} tweets from ${tab} tab.`);
  return tweets as ScrapedTweet[];
}

// --- Relevance Analysis ---

function scoreMcpRelevance(text: string): { score: number; reasons: string[] } {
  const lower = text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  for (const kw of MCP_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 3;
      reasons.push(`keyword: "${kw}"`);
    }
  }
  for (const kw of MCP_CONTEXT_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 1;
      reasons.push(`context: "${kw}"`);
    }
  }

  return { score, reasons };
}

interface HandleDropAnalysis {
  shouldDrop: boolean;
  topic: string;
  weight: number;
  trigger: string;
}

function analyzeForHandleDrop(text: string): HandleDropAnalysis {
  for (const trigger of HANDLE_DROP_TRIGGERS) {
    if (trigger.pattern.test(text)) {
      return {
        shouldDrop: true,
        topic: trigger.topic,
        weight: trigger.weight,
        trigger: trigger.pattern.toString(),
      };
    }
  }
  return { shouldDrop: false, topic: "", weight: 0, trigger: "" };
}

function detectNewsSignal(
  text: string
): { isNews: boolean; type: NewsItem["newsType"]; headline: string } | null {
  for (const signal of NEWS_SIGNALS) {
    if (signal.pattern.test(text)) {
      // Generate a brief headline
      const sentences = text.split(/[.!?]/);
      const headline = (sentences[0] || text).substring(0, 120).trim();
      return {
        isNews: true,
        type: signal.type,
        headline,
      };
    }
  }
  return null;
}

// --- Draft Generation ---

function generateHandleDropDraft(
  tweet: ScrapedTweet,
  topic: string,
  relevanceReason: string
): string {
  const topicMap: Record<string, string> = {
    "mcp-servers": "MCP servers",
    "rankings": "MCP server rankings",
    "tool-recommendations": "MCP tools",
    "ecosystem": "the MCP ecosystem",
    "awesome-lists": "MCP servers",
    "brand-mention": "AgentRank",
  };

  const subject = topicMap[topic] || "MCP tools";

  const templates = [
    `FYI we track ${subject} scored by real GitHub signals (freshness, issue health, stars, contributors). Might be useful here: agentrank-ai.com`,
    `@AgentRank_ai ranks ${subject} daily from live GitHub data — freshness, issue health, contributor activity. Worth a look: agentrank-ai.com`,
    `If you haven't seen it, @AgentRank_ai has a ranked index of ${subject} updated from GitHub signals daily: agentrank-ai.com`,
    `We built a daily-updated ranking of ${subject} from real GitHub signals. Could be relevant here: agentrank-ai.com`,
  ];

  // Pick template pseudo-randomly based on tweet ID to be consistent across runs
  const seed = parseInt(tweet.tweetId.slice(-4), 10) || 0;
  const draft = templates[seed % templates.length];

  // Keep it under 280 chars
  return draft.length <= 280 ? draft : templates[0];
}

function generateContentOpportunities(
  newsType: NewsItem["newsType"]
): Array<"blog" | "tweet" | "newsletter"> {
  const opMap: Record<NewsItem["newsType"], Array<"blog" | "tweet" | "newsletter">> = {
    "launch": ["tweet", "newsletter"],
    "partnership": ["tweet", "newsletter", "blog"],
    "deprecation": ["tweet", "newsletter"],
    "funding": ["tweet", "newsletter", "blog"],
    "breaking-news": ["tweet"],
    "milestone": ["tweet", "newsletter"],
  };
  return opMap[newsType] || ["tweet"];
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const refresh = args.includes("--refresh");
  const includeReplies = args.includes("--replies");

  if (refresh) refreshCookies();

  const history = loadHistory();
  let newDrafts = 0;
  let newNewsItems = 0;
  let scanned = 0;

  console.log(`\n=== @comforteagle Monitor ===`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Last run: ${history.lastRunAt}`);
  console.log(`Seen IDs: ${history.seenTweetIds.length}`);
  console.log(`Pending drafts: ${history.drafts.filter((d) => d.status === "pending_approval").length}\n`);

  const { context, closeBrowser } = await createBrowserContext();
  const page = await context.newPage();

  try {
    // Scrape main timeline
    const tweets = await scrapeTimeline(page, "tweets");

    // Optionally also scrape replies tab
    let replyTweets: ScrapedTweet[] = [];
    if (includeReplies) {
      await page.waitForTimeout(2000 + Math.random() * 1000);
      replyTweets = await scrapeTimeline(page, "with_replies");
    }

    const allTweets = [...tweets, ...replyTweets];
    // Deduplicate by tweetId
    const seen = new Set<string>();
    const uniqueTweets = allTweets.filter((t) => {
      if (seen.has(t.tweetId)) return false;
      seen.add(t.tweetId);
      return true;
    });

    console.log(`\nProcessing ${uniqueTweets.length} unique tweets...`);

    for (const tweet of uniqueTweets) {
      scanned++;

      // Skip already-seen tweets
      if (history.seenTweetIds.includes(tweet.tweetId)) {
        continue;
      }

      // Only process @comforteagle's own tweets (in case of retweets in scrape)
      if (tweet.authorHandle.toLowerCase() !== COMFORTEAGLE_HANDLE.toLowerCase()) {
        history.seenTweetIds.push(tweet.tweetId);
        continue;
      }

      const tweetShort = tweet.text.substring(0, 80);
      console.log(`\n  [${tweet.tweetId}] "${tweetShort}..."`);
      if (tweet.isReply && tweet.replyToHandle) {
        console.log(`    (reply to @${tweet.replyToHandle})`);
      }

      // --- Handle drop check ---
      const { score: relevanceScore, reasons } = scoreMcpRelevance(tweet.text);
      const dropAnalysis = analyzeForHandleDrop(tweet.text);

      const shouldDraft =
        (relevanceScore >= 3 && dropAnalysis.shouldDrop) ||
        dropAnalysis.weight >= 8;

      if (shouldDraft) {
        // Skip if replying to a Tier 1 contact (can't drop handle in those threads)
        if (tweet.replyToHandle && isTier1(tweet.replyToHandle)) {
          console.log(`    SKIP handle drop: @${tweet.replyToHandle} is Tier 1`);
        } else {
          const existingDraft = history.drafts.find(
            (d) => d.sourceTweetId === tweet.tweetId && d.status !== "rejected"
          );

          if (!existingDraft) {
            const replyDraft = generateHandleDropDraft(
              tweet,
              dropAnalysis.topic,
              reasons.join(", ")
            );

            const draft: HandleDropDraft = {
              id: `draft-${tweet.tweetId}`,
              capturedAt: new Date().toISOString(),
              sourceTweetId: tweet.tweetId,
              sourceTweetUrl: tweet.tweetUrl,
              sourceText: tweet.text,
              sourceAuthor: tweet.authorHandle,
              topic: dropAnalysis.topic,
              relevanceScore: relevanceScore + dropAnalysis.weight,
              relevanceReason: [
                `trigger: ${dropAnalysis.topic}`,
                ...reasons.slice(0, 3),
              ].join("; "),
              replyDraft,
              status: "pending_approval",
            };

            console.log(`    DRAFT handle drop (score ${draft.relevanceScore}):`);
            console.log(`      "${replyDraft}"`);

            if (!dryRun) {
              history.drafts.push(draft);
            }
            newDrafts++;
          } else {
            console.log(`    Already have draft for this tweet (${existingDraft.status})`);
          }
        }
      } else if (relevanceScore > 0) {
        console.log(`    MCP relevance: ${relevanceScore} (no handle drop trigger)`);
      }

      // --- News signal check ---
      if (relevanceScore >= 2) {
        const newsSignal = detectNewsSignal(tweet.text);
        if (newsSignal) {
          const existingNews = history.newsItems.find(
            (n) => n.sourceTweetId === tweet.tweetId
          );
          if (!existingNews) {
            const newsItem: NewsItem = {
              id: `news-${tweet.tweetId}`,
              capturedAt: new Date().toISOString(),
              sourceTweetId: tweet.tweetId,
              sourceTweetUrl: tweet.tweetUrl,
              sourceText: tweet.text,
              newsType: newsSignal.type,
              headline: newsSignal.headline,
              contentOpportunities: generateContentOpportunities(newsSignal.type),
            };

            console.log(`    NEWS [${newsSignal.type}]: "${newsSignal.headline}"`);
            console.log(`    Opportunities: ${newsItem.contentOpportunities.join(", ")}`);

            if (!dryRun) {
              history.newsItems.push(newsItem);
            }
            newNewsItems++;
          }
        }
      }

      // Mark as seen
      history.seenTweetIds.push(tweet.tweetId);
    }
  } catch (err) {
    console.error("Error during monitoring:", err);
  } finally {
    await closeBrowser();
  }

  // Update stats and save
  if (!dryRun) {
    history.lastRunAt = new Date().toISOString();
    history.stats.totalScanned += scanned;
    history.stats.totalDrafted += newDrafts;
    history.stats.totalNewsItems += newNewsItems;
    saveHistory(history);
  }

  // Summary
  console.log(`\n=== Summary ===`);
  console.log(`Scanned: ${scanned} tweets`);
  console.log(`New handle drop drafts: ${newDrafts}`);
  console.log(`New news items: ${newNewsItems}`);

  const pending = history.drafts.filter((d) => d.status === "pending_approval");
  if (pending.length > 0 && !dryRun) {
    console.log(`\n--- PENDING APPROVAL (${pending.length}) ---`);
    for (const draft of pending.slice(-5)) {
      console.log(`\n[${draft.id}] topic: ${draft.topic} | score: ${draft.relevanceScore}`);
      console.log(`  Source: ${draft.sourceTweetUrl}`);
      console.log(`  Tweet: "${draft.sourceText.substring(0, 100)}"`);
      console.log(`  Draft: "${draft.replyDraft}"`);
    }
    console.log(`\nApprove drafts by editing status in: ${HISTORY_FILE}`);
  }

  console.log(`\nHistory saved to: ${HISTORY_FILE}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
