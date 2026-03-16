#!/usr/bin/env npx tsx
/**
 * AgentRank Twitter Monitor & Reply Bot
 *
 * Searches X for developers asking about MCP servers / agent tools,
 * filters out bots and Steve's personal contacts, queries the AgentRank
 * API for relevant results, and posts a helpful reply.
 *
 * Same Playwright + cookie injection pattern as tweet-bot.ts.
 *
 * Usage:
 *   npx tsx scripts/twitter-monitor.ts                 # run one cycle
 *   npx tsx scripts/twitter-monitor.ts --dry-run       # preview without posting
 *   npx tsx scripts/twitter-monitor.ts --refresh        # re-extract cookies first
 *   npx tsx scripts/twitter-monitor.ts --max-replies=5  # override per-run limit
 *   npx tsx scripts/twitter-monitor.ts --query=0        # force specific search query
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium, type Page, type BrowserContext } from "playwright";
import { isTier1 } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://agentrank-ai.com/api";
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const HISTORY_FILE = resolve(__dirname, "../.twitter-monitor-history.json");

// --- Rate Limits ---
const DEFAULT_MAX_REPLIES_PER_RUN = 3;
const MAX_REPLIES_PER_DAY = 10;
const MIN_TWEET_AGE_MS = 10 * 60 * 1000; // 10 minutes
const MAX_TWEET_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_REPLY_DELAY_MS = 60_000;
const MAX_REPLY_DELAY_MS = 120_000;
const MIN_AGENTRANK_SCORE = 50;
const MIN_RESULTS_REQUIRED = 2;
const PROFILE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORY_REPLIES = 500;

// --- Search Queries (rotate one per run) ---
const SEARCH_QUERIES = [
  '"MCP server" (looking OR recommend OR best OR which OR find) -from:AgentRank_ai',
  '"what MCP" OR "which MCP" OR "best MCP" -from:AgentRank_ai',
  '"model context protocol" (tool OR server OR recommend) -from:AgentRank_ai',
  '"MCP server" ("can\'t find" OR "looking for" OR "anyone know") -from:AgentRank_ai',
  '"agent tool" (recommend OR looking OR find OR best) -from:AgentRank_ai',
  '"MCP" "does anyone" (know OR recommend) -from:AgentRank_ai',
];

// --- Types ---

interface ScrapedTweet {
  tweetId: string;
  authorHandle: string;
  text: string;
  tweetUrl: string;
  timestamp: string; // ISO string or relative
}

interface ProfileInfo {
  followers: number;
  following: number;
  bio: string;
  isVerified: boolean;
  cachedAt: string;
}

interface ReplyRecord {
  tweetId: string;
  authorHandle: string;
  replyText: string;
  repliedAt: string;
  searchQuery: string;
}

interface MonitorHistory {
  lastQueryIndex: number;
  profileCache: Record<string, ProfileInfo>;
  replies: ReplyRecord[];
}

interface AgentRankResult {
  name: string;
  slug: string;
  score: number;
  description: string;
  type: string;
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

function loadHistory(): MonitorHistory {
  if (!existsSync(HISTORY_FILE)) {
    return { lastQueryIndex: -1, profileCache: {}, replies: [] };
  }
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return { lastQueryIndex: -1, profileCache: {}, replies: [] };
  }
}

function saveHistory(history: MonitorHistory) {
  // Cap replies at FIFO limit
  if (history.replies.length > MAX_HISTORY_REPLIES) {
    history.replies = history.replies.slice(-MAX_HISTORY_REPLIES);
  }
  // Prune expired profile cache entries
  const now = Date.now();
  for (const [handle, info] of Object.entries(history.profileCache)) {
    if (now - new Date(info.cachedAt).getTime() > PROFILE_CACHE_TTL_MS) {
      delete history.profileCache[handle];
    }
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function repliesToday(history: MonitorHistory): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return history.replies.filter(
    (r) => new Date(r.repliedAt) >= todayStart
  ).length;
}

function alreadyReplied(history: MonitorHistory, tweetId: string): boolean {
  return history.replies.some((r) => r.tweetId === tweetId);
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

async function searchTwitter(
  page: Page,
  query: string
): Promise<ScrapedTweet[]> {
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`;

  console.log(`Navigating to search: ${query}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for tweet articles to load
  await page.waitForTimeout(3000 + Math.random() * 2000);

  // Try to wait for tweet content
  try {
    await page.waitForSelector('article[data-testid="tweet"]', {
      timeout: 10000,
    });
  } catch {
    console.log("No tweets found for this query.");
    return [];
  }

  // Scroll down a bit to load more tweets
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1500 + Math.random() * 1000);

  // Scrape visible tweets
  const tweets = await page.evaluate(() => {
    const articles = document.querySelectorAll(
      'article[data-testid="tweet"]'
    );
    const results: Array<{
      tweetId: string;
      authorHandle: string;
      text: string;
      tweetUrl: string;
      timestamp: string;
    }> = [];

    articles.forEach((article) => {
      try {
        // Get the tweet text
        const tweetTextEl = article.querySelector(
          '[data-testid="tweetText"]'
        );
        const text = tweetTextEl?.textContent?.trim() || "";

        // Get author handle from the link
        const userLinks = article.querySelectorAll('a[href^="/"]');
        let authorHandle = "";
        for (const link of userLinks) {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/x\.com\/([^/]+)$/);
          if (match && !["home", "explore", "search", "notifications", "messages", "i"].includes(match[1])) {
            authorHandle = match[1];
            break;
          }
        }

        // Get tweet URL (contains the tweet ID)
        let tweetUrl = "";
        let tweetId = "";
        const statusLinks = article.querySelectorAll(
          'a[href*="/status/"]'
        );
        for (const link of statusLinks) {
          const href = (link as HTMLAnchorElement).href;
          const match = href.match(/\/status\/(\d+)/);
          if (match) {
            tweetId = match[1];
            tweetUrl = href;
            break;
          }
        }

        // Get timestamp
        const timeEl = article.querySelector("time");
        const timestamp = timeEl?.getAttribute("datetime") || "";

        if (tweetId && authorHandle && text) {
          results.push({
            tweetId,
            authorHandle,
            text: text.substring(0, 500),
            tweetUrl,
            timestamp,
          });
        }
      } catch {
        // Skip malformed tweets
      }
    });

    return results;
  });

  console.log(`Found ${tweets.length} tweets.`);
  return tweets;
}

// --- Profile Scraper ---

async function scrapeProfile(
  page: Page,
  handle: string,
  history: MonitorHistory
): Promise<ProfileInfo | null> {
  // Check cache first
  const cached = history.profileCache[handle.toLowerCase()];
  if (
    cached &&
    Date.now() - new Date(cached.cachedAt).getTime() < PROFILE_CACHE_TTL_MS
  ) {
    return cached;
  }

  try {
    await page.goto(`https://x.com/${handle}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(2000 + Math.random() * 1500);

    const profile = await page.evaluate(() => {
      // Get follower/following counts from the profile header links
      const followingLink = document.querySelector(
        'a[href$="/following"]'
      );
      const followersLink = document.querySelector(
        'a[href$="/verified_followers"]'
      ) || document.querySelector('a[href$="/followers"]');

      function parseCount(el: Element | null): number {
        if (!el) return 0;
        const text = el.textContent?.trim() || "0";
        // Handle "1.2K", "3.4M" etc
        const match = text.match(/([\d,.]+)\s*([KMB])?/i);
        if (!match) return 0;
        let num = parseFloat(match[1].replace(/,/g, ""));
        if (match[2]) {
          const multipliers: Record<string, number> = {
            K: 1000,
            M: 1_000_000,
            B: 1_000_000_000,
          };
          num *= multipliers[match[2].toUpperCase()] || 1;
        }
        return Math.round(num);
      }

      const followers = parseCount(followersLink);
      const following = parseCount(followingLink);

      // Get bio
      const bioEl = document.querySelector(
        '[data-testid="UserDescription"]'
      );
      const bio = bioEl?.textContent?.trim() || "";

      // Check verified badge
      const verifiedBadge = document.querySelector(
        '[data-testid="icon-verified"]'
      );
      const isVerified = !!verifiedBadge;

      return { followers, following, bio, isVerified };
    });

    const info: ProfileInfo = {
      ...profile,
      cachedAt: new Date().toISOString(),
    };

    // Cache it
    history.profileCache[handle.toLowerCase()] = info;

    return info;
  } catch (err) {
    console.log(`  Failed to scrape profile @${handle}: ${err}`);
    return null;
  }
}

// --- Bot / Corporate Detection ---

function isBot(profile: ProfileInfo, handle: string): { bot: boolean; reason: string } {
  // Follow-for-follow pattern
  if (profile.following > 0) {
    const ratio = profile.followers / profile.following;
    if (ratio > 0.8 && ratio < 1.2 && profile.followers > 100) {
      return { bot: true, reason: `follow-for-follow pattern (${profile.followers}/${profile.following})` };
    }
  }

  // Bot bio indicators
  if (/DM for collab|crypto|NFT|web3|follow back|giveaway/i.test(profile.bio)) {
    return { bot: true, reason: `bot bio keywords: "${profile.bio.substring(0, 60)}"` };
  }

  // Handle full of numbers
  if (/\d{5,}/.test(handle)) {
    return { bot: true, reason: `handle has 5+ consecutive digits` };
  }

  // Very new-looking account with no followers
  if (profile.followers === 0 && profile.following === 0) {
    return { bot: true, reason: `zero followers and following` };
  }

  return { bot: false, reason: "" };
}

function isCorporate(profile: ProfileInfo): { corp: boolean; reason: string } {
  if (profile.isVerified && profile.followers > 10000) {
    return { corp: true, reason: `verified + ${profile.followers} followers` };
  }
  if (/official account|brand|company/i.test(profile.bio)) {
    return { corp: true, reason: `corporate bio keywords` };
  }
  return { corp: false, reason: "" };
}

// --- Intent Extraction ---

const INTENT_KEYWORDS: Record<string, string[]> = {
  database: ["database", "postgres", "mysql", "sqlite", "sql", "db", "supabase", "mongo"],
  browser: ["browser", "puppeteer", "playwright", "selenium", "scraping", "web automation"],
  filesystem: ["file", "filesystem", "directory", "folder", "fs"],
  git: ["git", "github", "version control", "repository"],
  api: ["api", "rest", "graphql", "http", "endpoint"],
  search: ["search", "rag", "retrieval", "vector", "embedding"],
  code: ["code", "linter", "formatter", "analysis", "refactor"],
  email: ["email", "smtp", "mail", "inbox"],
  slack: ["slack", "discord", "chat", "messaging"],
  docker: ["docker", "container", "kubernetes", "k8s"],
  cloud: ["aws", "gcp", "azure", "cloud", "s3", "lambda"],
  ai: ["ai", "llm", "openai", "claude", "gpt", "model"],
  notion: ["notion", "notes", "wiki", "documentation"],
  calendar: ["calendar", "schedule", "event"],
  memory: ["memory", "context", "knowledge", "graph"],
};

function extractIntent(tweetText: string): string[] {
  const lower = tweetText.toLowerCase();
  const matches: string[] = [];

  for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matches.push(category);
    }
  }

  // Fallback: extract quoted terms or capitalized tool names
  const quotedTerms = tweetText.match(/"([^"]+)"/g);
  if (quotedTerms) {
    for (const term of quotedTerms) {
      const clean = term.replace(/"/g, "").trim().toLowerCase();
      if (clean.length > 2 && clean.length < 30 && !matches.includes(clean)) {
        matches.push(clean);
      }
    }
  }

  // If nothing matched, use "mcp" as a generic fallback
  if (matches.length === 0) {
    matches.push("mcp");
  }

  return matches;
}

// --- AgentRank API ---

async function queryAgentRank(
  searchTerms: string[]
): Promise<AgentRankResult[]> {
  const query = searchTerms.join(" ");
  try {
    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=10`
    );
    if (!res.ok) {
      console.log(`  AgentRank API returned ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { results: AgentRankResult[] };
    return (data.results || [])
      .filter((r) => r.type === "tool" && r.score >= MIN_AGENTRANK_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (err) {
    console.log(`  AgentRank API error: ${err}`);
    return [];
  }
}

// --- Reply Generation ---

function generateReply(
  results: AgentRankResult[],
  searchTerms: string[]
): string | null {
  if (results.length < MIN_RESULTS_REQUIRED) return null;

  const capability = searchTerms[0] || "mcp";
  const queryParam = encodeURIComponent(capability);

  // Try with top 3, then 2 if too long
  for (const count of [3, 2]) {
    const topResults = results.slice(0, count);
    const lines = topResults
      .map((r, i) => {
        const repoName = r.slug ? r.slug.split("/")[1] : r.name;
        return `${i + 1}. ${repoName} -- score ${r.score}`;
      })
      .join("\n");

    const reply = `Top ${topResults.length} on AgentRank for ${capability}:\n\n${lines}\n\nScored from live GitHub signals: agentrank-ai.com/search?q=${queryParam}`;

    if (reply.length <= 280) return reply;
  }

  // Absolute fallback: single result
  const r = results[0];
  const repoName = r.slug ? r.slug.split("/")[1] : r.name;
  const reply = `#1 on AgentRank for ${capability}: ${repoName} (score ${r.score})\n\nagentrank-ai.com/search?q=${queryParam}`;
  return reply.length <= 280 ? reply : null;
}

// --- Reply Poster ---

async function postReply(
  page: Page,
  tweetUrl: string,
  replyText: string
): Promise<boolean> {
  try {
    // Navigate to the tweet
    await page.goto(tweetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(2000 + Math.random() * 1500);

    // Monitor CreateTweet responses
    let tweetResponse: { ok: boolean; body: string } | null = null;
    page.on("response", async (response) => {
      if (response.url().includes("CreateTweet")) {
        try {
          const body = await response.text();
          tweetResponse = { ok: response.ok(), body };
        } catch {}
      }
    });

    // Click the reply box
    const replyBox = page.locator('[data-testid="tweetTextarea_0"]').first();
    await replyBox.waitFor({ state: "visible", timeout: 10000 });
    await replyBox.click();

    // Type the reply naturally
    await page.keyboard.type(replyText, {
      delay: 20 + Math.random() * 25,
    });

    // Small pause before posting
    await page.waitForTimeout(800 + Math.random() * 1200);

    // Click the Reply button
    const replyBtn = page.locator('[data-testid="tweetButtonInline"]');
    await replyBtn.waitFor({ state: "visible", timeout: 5000 });
    await replyBtn.click();

    // Wait for the response
    await page.waitForTimeout(5000);

    if (tweetResponse && tweetResponse.body.includes("rest_id")) {
      const match = tweetResponse.body.match(/"rest_id":"(\d+)"/);
      const replyId = match ? match[1] : "unknown";
      console.log(`  Reply posted: https://x.com/AgentRank_ai/status/${replyId}`);
      return true;
    }

    // Fallback check
    const url = page.url();
    if (!url.includes(tweetUrl.split("/status/")[1] || "___")) {
      console.log("  Reply appears to have posted (URL changed).");
      return true;
    }

    console.error("  No CreateTweet response captured — reply may not have posted.");
    return false;
  } catch (err) {
    console.error(`  Playwright error posting reply: ${err}`);
    return false;
  }
}

// --- Tweet Age Check ---

function isTweetInAgeRange(timestamp: string): { ok: boolean; reason: string } {
  if (!timestamp) return { ok: true, reason: "no timestamp, allowing" };

  const tweetTime = new Date(timestamp).getTime();
  const now = Date.now();
  const age = now - tweetTime;

  if (age < MIN_TWEET_AGE_MS) {
    return { ok: false, reason: `too recent (${Math.round(age / 60000)}m old, min ${MIN_TWEET_AGE_MS / 60000}m)` };
  }
  if (age > MAX_TWEET_AGE_MS) {
    return { ok: false, reason: `too old (${Math.round(age / 3600000)}h old, max ${MAX_TWEET_AGE_MS / 3600000}h)` };
  }
  return { ok: true, reason: "" };
}

// --- Delay Helper ---

function randomDelay(): number {
  return MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS);
}

// --- CLI Arg Parsing ---

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const refresh = args.includes("--refresh");

  let maxReplies = DEFAULT_MAX_REPLIES_PER_RUN;
  const maxArg = args.find((a) => a.startsWith("--max-replies="));
  if (maxArg) maxReplies = parseInt(maxArg.split("=")[1], 10) || DEFAULT_MAX_REPLIES_PER_RUN;

  let queryIndex: number | null = null;
  const queryArg = args.find((a) => a.startsWith("--query="));
  if (queryArg) queryIndex = parseInt(queryArg.split("=")[1], 10);

  return { dryRun, refresh, maxReplies, queryIndex };
}

// --- Main ---

async function main() {
  const { dryRun, refresh, maxReplies, queryIndex } = parseArgs();

  if (refresh) {
    refreshCookies();
  }

  const history = loadHistory();

  // Check daily rate limit
  const todayCount = repliesToday(history);
  if (todayCount >= MAX_REPLIES_PER_DAY && !dryRun) {
    console.log(`Daily limit reached (${todayCount}/${MAX_REPLIES_PER_DAY}). Exiting.`);
    return;
  }

  // Pick search query (rotate or force)
  let qIndex: number;
  if (queryIndex !== null && queryIndex >= 0 && queryIndex < SEARCH_QUERIES.length) {
    qIndex = queryIndex;
  } else {
    qIndex = (history.lastQueryIndex + 1) % SEARCH_QUERIES.length;
  }
  const searchQuery = SEARCH_QUERIES[qIndex];
  history.lastQueryIndex = qIndex;

  console.log(`\n=== AgentRank Twitter Monitor ===`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Query [${qIndex}]: ${searchQuery}`);
  console.log(`Replies today: ${todayCount}/${MAX_REPLIES_PER_DAY}`);
  console.log(`Max this run: ${maxReplies}\n`);

  // Launch browser
  const { context, closeBrowser } = await createBrowserContext();
  const page = await context.newPage();

  let repliesThisRun = 0;

  try {
    // Search
    const tweets = await searchTwitter(page, searchQuery);

    if (tweets.length === 0) {
      console.log("No tweets found. Try a different query.");
      saveHistory(history);
      return;
    }

    // Process each tweet
    for (const tweet of tweets) {
      if (repliesThisRun >= maxReplies) {
        console.log(`\nHit per-run limit (${maxReplies}). Stopping.`);
        break;
      }
      if (todayCount + repliesThisRun >= MAX_REPLIES_PER_DAY) {
        console.log(`\nHit daily limit (${MAX_REPLIES_PER_DAY}). Stopping.`);
        break;
      }

      console.log(`\n--- @${tweet.authorHandle}: "${tweet.text.substring(0, 80)}..." ---`);

      // Filter: Tier 1
      if (isTier1(tweet.authorHandle)) {
        console.log(`  SKIP: Tier 1 contact`);
        continue;
      }

      // Filter: already replied
      if (alreadyReplied(history, tweet.tweetId)) {
        console.log(`  SKIP: already replied to this tweet`);
        continue;
      }

      // Filter: tweet age
      const ageCheck = isTweetInAgeRange(tweet.timestamp);
      if (!ageCheck.ok) {
        console.log(`  SKIP: ${ageCheck.reason}`);
        continue;
      }

      // Filter: own tweets
      if (tweet.authorHandle.toLowerCase() === "agentrank_ai") {
        console.log(`  SKIP: own tweet`);
        continue;
      }

      // Scrape profile
      console.log(`  Checking profile @${tweet.authorHandle}...`);
      const profile = await scrapeProfile(page, tweet.authorHandle, history);

      if (!profile) {
        console.log(`  SKIP: could not load profile`);
        continue;
      }

      console.log(`  Profile: ${profile.followers} followers, ${profile.following} following, verified: ${profile.isVerified}`);

      // Filter: bot
      const botCheck = isBot(profile, tweet.authorHandle);
      if (botCheck.bot) {
        console.log(`  SKIP: bot (${botCheck.reason})`);
        continue;
      }

      // Filter: corporate
      const corpCheck = isCorporate(profile);
      if (corpCheck.corp) {
        console.log(`  SKIP: corporate (${corpCheck.reason})`);
        continue;
      }

      // Extract intent
      const intent = extractIntent(tweet.text);
      console.log(`  Intent: ${intent.join(", ")}`);

      // Query AgentRank
      console.log(`  Querying AgentRank API...`);
      const results = await queryAgentRank(intent);
      console.log(`  Results: ${results.length} tools with score >= ${MIN_AGENTRANK_SCORE}`);

      if (results.length < MIN_RESULTS_REQUIRED) {
        console.log(`  SKIP: insufficient results (need ${MIN_RESULTS_REQUIRED}+)`);
        continue;
      }

      // Generate reply
      const replyText = generateReply(results, intent);
      if (!replyText) {
        console.log(`  SKIP: could not generate reply within 280 chars`);
        continue;
      }

      console.log(`  Reply (${replyText.length} chars):`);
      console.log(`  ${replyText.replace(/\n/g, "\n  ")}`);

      if (dryRun) {
        console.log(`  [DRY RUN] Would reply to ${tweet.tweetUrl}`);
        repliesThisRun++;
        continue;
      }

      // Delay between replies (skip for first reply)
      if (repliesThisRun > 0) {
        const delay = randomDelay();
        console.log(`  Waiting ${Math.round(delay / 1000)}s before replying...`);
        await new Promise((r) => setTimeout(r, delay));
      }

      // Post reply
      console.log(`  Posting reply...`);
      const success = await postReply(page, tweet.tweetUrl, replyText);

      if (success) {
        history.replies.push({
          tweetId: tweet.tweetId,
          authorHandle: tweet.authorHandle,
          replyText,
          repliedAt: new Date().toISOString(),
          searchQuery: intent.join(", "),
        });
        repliesThisRun++;
        console.log(`  Reply ${repliesThisRun}/${maxReplies} posted.`);
      } else {
        console.log(`  Failed to post reply. Continuing...`);
      }
    }
  } catch (err) {
    console.error("Error during monitoring:", err);
  } finally {
    await closeBrowser();
    saveHistory(history);
    console.log(`\n=== Done. Replies this run: ${repliesThisRun} ===\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
