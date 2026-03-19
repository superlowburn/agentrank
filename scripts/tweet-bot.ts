#!/usr/bin/env npx tsx
/**
 * AgentRank Tweet Bot
 *
 * Pulls top-ranked tools from the AgentRank API and posts a tweet
 * from @AgentRank_ai using Playwright with injected cookies.
 *
 * X's anti-bot detection blocks raw HTTP requests (error 226).
 * This bot uses a real browser so X's JavaScript handles request signing.
 * Cookies are extracted from Chrome via pycookiecheat.
 *
 * Usage:
 *   npx tsx scripts/tweet-bot.ts              # post a random template tweet
 *   npx tsx scripts/tweet-bot.ts --dry-run    # preview without posting
 *   npx tsx scripts/tweet-bot.ts --now        # post immediately (no variance delay)
 *   npx tsx scripts/tweet-bot.ts --refresh    # re-extract cookies from Chrome first
 *   npx tsx scripts/tweet-bot.ts --type movers      # biggest movers this week
 *   npx tsx scripts/tweet-bot.ts --type new-tools   # new tools in the index
 *   npx tsx scripts/tweet-bot.ts --type top10       # weekly top 10 snapshot
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium } from "playwright";
import { TIER1_CONTACTS, isTier1 } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://agentrank-ai.com/api";
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const HISTORY_FILE = resolve(__dirname, "../.tweet-bot-history.json");
const CAMPAIGN_FILE = resolve(__dirname, "maintainer-campaign.json");
const NEWS_QUEUE_FILE = resolve(__dirname, "../.news-queue.json");

// GitHub org/user -> Twitter handle mapping
const TWITTER_HANDLES: Record<string, string> = {
  PrefectHQ: "@PrefectIO",
  mark3labs: "@mark3labs",
  laravel: "@laravelphp",
  modelcontextprotocol: "@AnthropicAI",
  punkpeye: "@punkpeye",
  microsoft: "@microsoft",
  "browser-use": "@browser_use",
  vercel: "@vercel",
  supabase: "@supabase",
  cloudflare: "@Cloudflare",
};

interface Tool {
  type: string;
  slug: string;
  name: string;
  description: string;
  score: number;
  rank: number;
  url: string;
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

// --- API ---

async function fetchTopTools(limit = 5): Promise<Tool[]> {
  const res = await fetch(`${API_BASE}/search?q=mcp&limit=${limit * 3}`);
  const data = (await res.json()) as { results: Tool[] };
  return data.results
    .filter((r) => r.type === "tool")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);
}

// --- Post Tweet via Playwright ---

async function postTweetPlaywright(text: string): Promise<boolean> {
  console.log("Launching browser...");
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
    // Override plugins to look like real Chrome
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    // Remove Playwright-injected properties
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
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

  const page = await context.newPage();

  try {
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

    // Navigate to compose
    await page.goto("https://x.com/compose/post", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for the compose text area (use the one in the modal/primary column)
    const editor = page.locator('[data-testid="tweetTextarea_0"]').first();
    await editor.waitFor({ state: "visible", timeout: 15000 });

    // Type the tweet with small delays to look natural
    await editor.click();
    await page.keyboard.type(text, { delay: 25 + Math.random() * 20 });

    // Small pause before posting
    await page.waitForTimeout(800 + Math.random() * 1200);

    // Click the Post button
    const postBtn = page.locator('[data-testid="tweetButton"]');
    await postBtn.waitFor({ state: "visible", timeout: 5000 });
    await postBtn.click();

    // Wait for the CreateTweet response
    await page.waitForTimeout(5000);

    // Check the CreateTweet response
    if (tweetResponse) {
      if (tweetResponse.body.includes("rest_id")) {
        const match = tweetResponse.body.match(/"rest_id":"(\d+)"/);
        const tweetId = match ? match[1] : "unknown";
        console.log(`Posted: https://x.com/AgentRank_ai/status/${tweetId}`);
        return true;
      } else {
        console.error(
          "CreateTweet response:",
          tweetResponse.body.substring(0, 500)
        );
        return false;
      }
    }

    // Fallback: check URL
    const url = page.url();
    if (!url.includes("/compose/")) {
      console.log("Tweet appears to have posted (URL changed)");
      return true;
    }

    console.error("No CreateTweet response captured — tweet may not have posted");
    return false;
  } catch (err) {
    console.error("Playwright error:", err);
    return false;
  } finally {
    await browser.close();
  }
}

// --- Tweet Templates ---

function getTwitterHandle(slug: string): string {
  const org = slug.split("/")[0];
  return TWITTER_HANDLES[org] || org;
}

function getHistory(): string[] {
  if (!existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveHistory(tweets: string[]) {
  writeFileSync(HISTORY_FILE, JSON.stringify(tweets.slice(-50), null, 2));
}

type TweetGenerator = (tools: Tool[]) => string;

const templates: TweetGenerator[] = [
  // Individual maintainer spotlight (rotate through top 5)
  (tools) => {
    const history = getHistory();
    const tool =
      tools.find((t) => !history.some((h) => h.includes(t.slug))) || tools[0];
    const handle = getTwitterHandle(tool.slug);
    const repoName = tool.slug.split("/")[1];
    const desc = tool.description
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ""
      )
      .trim()
      .split(".")[0];
    return `${handle} — ${repoName} is ranked #${tool.rank} on AgentRank with a ${tool.score} score.

${desc}.

Full breakdown: agentrank-ai.com/tool/${tool.slug}`;
  },

  // Top 5 leaderboard
  (tools) => {
    const lines = tools
      .slice(0, 5)
      .map((t) => {
        const handle = getTwitterHandle(t.slug);
        const repo = t.slug.split("/")[1];
        return `${t.rank}. ${handle} ${repo} — ${t.score}`;
      })
      .join("\n");
    return `AgentRank top 5 MCP servers right now:

${lines}

Scored nightly from real GitHub signals. Full rankings: agentrank-ai.com/tools`;
  },

  // Problem angle
  () => {
    const problems = [
      "database access",
      "browser automation",
      "file management",
      "API integration",
      "code analysis",
    ];
    const problem = problems[Math.floor(Math.random() * problems.length)];
    return `Asked my AI to find an MCP server for ${problem}. It recommended a repo with no commits in 4 months.

Your AI's training data is frozen. It can't tell you what shipped yesterday or what got abandoned last week.

That's why AgentRank exists — live index, scored nightly, 25k+ tools.

agentrank-ai.com`;
  },

  // Network effect
  () =>
    `Every AI that queries AgentRank makes the rankings sharper for everyone.

More queries = better signal on what developers actually reach for.

One install, it works forever:
claude mcp add agentrank -- npx -y agentrank-mcp-server

agentrank-ai.com`,

  // How scoring works
  () =>
    `How AgentRank scores 25,000+ tools nightly:

Stars (15%) — popularity signal
Freshness (25%) — last commit date
Issue health (25%) — closed vs total ratio
Contributors (10%) — bus factor risk
Dependents (25%) — who relies on this

Opinionated weights. That's what makes it useful.

agentrank-ai.com`,
];

function pickTemplate(tools: Tool[]): string {
  const weights = [3, 2, 1, 1, 1];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  let templateIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      templateIdx = i;
      break;
    }
  }

  const tweet = templates[templateIdx](tools);
  const history = getHistory();
  history.push(tweet);
  saveHistory(history);

  return tweet;
}

// --- Scheduled content generators (read from live API) ---

interface MoverEntry {
  full_name: string;
  tool_type: string;
  current_rank: number;
  prev_rank: number;
  rank_delta: number;
  current_score: number;
  stars: number;
  url: string;
}

interface NewToolEntry {
  full_name: string;
  tool_type: string;
  rank: number;
  score: number;
  stars: number;
  first_seen: string;
  url: string;
}

async function fetchMovers(days = 7): Promise<MoverEntry[]> {
  const res = await fetch(`${API_BASE}/v1/movers?days=${days}&limit=10&type=tool`);
  if (!res.ok) return [];
  const data = (await res.json()) as { movers: MoverEntry[] };
  return data.movers || [];
}

async function fetchNewTools(days = 7): Promise<NewToolEntry[]> {
  const res = await fetch(`${API_BASE}/v1/new-tools?days=${days}&limit=20&type=tool`);
  if (!res.ok) return [];
  const data = (await res.json()) as { tools: NewToolEntry[] };
  return data.tools || [];
}

async function fetchTop10(): Promise<Tool[]> {
  const res = await fetch(`${API_BASE}/search?q=mcp&limit=30`);
  const data = (await res.json()) as { results: Tool[] };
  return (data.results || [])
    .filter((r) => r.type === "tool")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10);
}

function generateMoversTweet(movers: MoverEntry[]): string | null {
  const gainers = movers.filter((m) => m.rank_delta > 0).slice(0, 3);
  const losers = movers.filter((m) => m.rank_delta < 0).slice(0, 2);

  if (gainers.length === 0 && losers.length === 0) return null;

  const lines: string[] = [];
  for (const m of gainers) {
    const handle = getTwitterHandle(m.full_name);
    const repo = m.full_name.split("/")[1];
    lines.push(`+${m.rank_delta} ${handle}/${repo} (#${m.prev_rank} → #${m.current_rank})`);
  }
  for (const m of losers) {
    const handle = getTwitterHandle(m.full_name);
    const repo = m.full_name.split("/")[1];
    lines.push(`${m.rank_delta} ${handle}/${repo} (#${m.prev_rank} → #${m.current_rank})`);
  }

  return `Biggest movers this week on AgentRank:

${lines.join("\n")}

Rankings update nightly from GitHub signals. Full leaderboard: agentrank-ai.com/tools`;
}

function generateNewToolsTweet(tools: NewToolEntry[]): string | null {
  if (tools.length === 0) return null;

  const top = tools.slice(0, 3);
  const lines = top.map((t) => {
    const handle = getTwitterHandle(t.full_name);
    const repo = t.full_name.split("/")[1];
    return `- ${handle}/${repo} (score: ${Math.round(t.score)})`;
  });

  return `${tools.length} new tool${tools.length === 1 ? "" : "s"} entered the AgentRank index this week.

Top newcomers:
${lines.join("\n")}

Ranked from day one by real GitHub signals.

agentrank-ai.com/tools`;
}

function generateLaunchTweet(tools: Tool[]): string {
  const top3 = tools.slice(0, 3);
  const lines = top3.map((t) => {
    const handle = getTwitterHandle(t.slug);
    const repo = t.slug.split("/")[1];
    return `${t.rank}. ${handle} ${repo} (${t.score})`;
  });

  return `Indexed 25,000+ MCP servers and agent tools.

Scored by real signals, not vibes. Updated nightly.

Top ranked:
${lines.join("\n")}

cc @browser_use @microsoft

agentrank-ai.com/tools`;
}

function generateTop10Tweet(tools: Tool[]): string | null {
  if (tools.length === 0) return null;

  const lines = tools.map((t) => {
    const handle = getTwitterHandle(t.slug);
    const repo = t.slug.split("/")[1];
    return `${t.rank}. ${handle}/${repo} — ${t.score}`;
  });

  return `AgentRank top 10 MCP servers this week:

${lines.join("\n")}

Scored nightly. Full index: agentrank-ai.com/tools`;
}

// --- Maintainer Outreach Campaign ---

interface CampaignEntry {
  repo: string;
  rank: number;
  score: number;
  handle: string;
  tweet: string;
  status: "pending" | "done" | "skipped";
  posted_at: string | null;
}

function loadCampaign(): CampaignEntry[] {
  if (!existsSync(CAMPAIGN_FILE)) {
    console.error("No maintainer-campaign.json found");
    process.exit(1);
  }
  return JSON.parse(readFileSync(CAMPAIGN_FILE, "utf-8")) as CampaignEntry[];
}

function saveCampaign(entries: CampaignEntry[]): void {
  writeFileSync(CAMPAIGN_FILE, JSON.stringify(entries, null, 2));
}

function nextCampaignTweet(): { entry: CampaignEntry; index: number } | null {
  const entries = loadCampaign();
  const idx = entries.findIndex((e) => e.status === "pending");
  if (idx === -1) return null;
  return { entry: entries[idx], index: idx };
}

function markCampaignDone(index: number): void {
  const entries = loadCampaign();
  entries[index].status = "done";
  entries[index].posted_at = new Date().toISOString();
  saveCampaign(entries);
}

function campaignStatus(): void {
  const entries = loadCampaign();
  const done = entries.filter((e) => e.status === "done").length;
  const pending = entries.filter((e) => e.status === "pending").length;
  console.log(`Campaign: ${done} done, ${pending} pending of ${entries.length} total`);
  for (const e of entries) {
    const icon = e.status === "done" ? "✓" : e.status === "skipped" ? "–" : "·";
    console.log(`  ${icon} #${e.rank} ${e.repo} (${e.handle}) [${e.status}]${e.posted_at ? " @ " + e.posted_at : ""}`);
  }
}

// --- News Queue ---

interface NewsQueueItem {
  id: string;
  newsType: string;
  headline: string;
  tweetDraft: string;
  status: "pending" | "posted" | "skipped";
  postedAt?: string;
}

interface NewsQueue {
  lastUpdated: string;
  items: NewsQueueItem[];
}

function loadNewsQueue(): NewsQueue {
  if (!existsSync(NEWS_QUEUE_FILE)) {
    return { lastUpdated: new Date(0).toISOString(), items: [] };
  }
  try {
    return JSON.parse(readFileSync(NEWS_QUEUE_FILE, "utf-8"));
  } catch {
    return { lastUpdated: new Date(0).toISOString(), items: [] };
  }
}

function saveNewsQueue(queue: NewsQueue): void {
  writeFileSync(NEWS_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function nextNewsQueueItem(): { item: NewsQueueItem; index: number } | null {
  const queue = loadNewsQueue();
  const idx = queue.items.findIndex((i) => i.status === "pending");
  if (idx === -1) return null;
  return { item: queue.items[idx], index: idx };
}

function markNewsItemPosted(index: number): void {
  const queue = loadNewsQueue();
  queue.items[index].status = "posted";
  queue.items[index].postedAt = new Date().toISOString();
  saveNewsQueue(queue);
}

function newsQueueStatus(): void {
  const queue = loadNewsQueue();
  const pending = queue.items.filter((i) => i.status === "pending").length;
  const posted = queue.items.filter((i) => i.status === "posted").length;
  console.log(
    `News queue: ${pending} pending, ${posted} posted of ${queue.items.length} total`
  );
  for (const item of queue.items.slice(-10)) {
    const icon =
      item.status === "posted" ? "✓" : item.status === "skipped" ? "–" : "·";
    console.log(
      `  ${icon} [${item.newsType}] ${item.headline.substring(0, 60)}...`
    );
  }
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const typeArg = args.find((a) => a.startsWith("--type="))?.split("=")[1]
    ?? (args.indexOf("--type") !== -1 ? args[args.indexOf("--type") + 1] : null);

  if (args.includes("--refresh")) {
    refreshCookies();
  }

  // Random delay (1-5 min) unless --now or --dry-run
  if (!dryRun && !args.includes("--now")) {
    const delayMs = Math.floor(Math.random() * 5 * 60 * 1000);
    const delayMin = (delayMs / 60000).toFixed(1);
    console.log(`Waiting ${delayMin}m before posting (variance)...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  let tweet: string | null = null;

  if (typeArg === "movers") {
    console.log("Fetching biggest movers from AgentRank...");
    const movers = await fetchMovers(7);
    if (movers.length === 0) {
      console.error("No mover data available (rank_history may not be populated yet)");
      process.exit(1);
    }
    tweet = generateMoversTweet(movers);
    if (!tweet) {
      console.error("Not enough rank change data for a movers tweet");
      process.exit(1);
    }
  } else if (typeArg === "new-tools") {
    console.log("Fetching new tools from AgentRank...");
    const newTools = await fetchNewTools(7);
    if (newTools.length === 0) {
      console.error("No new tools this week (rank_history may not be populated yet)");
      process.exit(1);
    }
    tweet = generateNewToolsTweet(newTools);
    if (!tweet) {
      console.error("No new tools tweet generated");
      process.exit(1);
    }
  } else if (typeArg === "launch") {
    console.log("Fetching top tools for launch tweet...");
    const tools = await fetchTopTools(5);
    if (tools.length === 0) {
      console.error("No tools returned from API");
      process.exit(1);
    }
    tweet = generateLaunchTweet(tools);
  } else if (typeArg === "top10") {
    console.log("Fetching top 10 tools from AgentRank...");
    const top10 = await fetchTop10();
    if (top10.length === 0) {
      console.error("No tools returned from API");
      process.exit(1);
    }
    tweet = generateTop10Tweet(top10);
    if (!tweet) {
      console.error("No top10 tweet generated");
      process.exit(1);
    }
  } else if (typeArg === "maintainer-outreach") {
    if (args.includes("--status")) {
      campaignStatus();
      return;
    }
    const next = nextCampaignTweet();
    if (!next) {
      console.log("Maintainer outreach campaign complete — all entries done.");
      return;
    }
    const { entry, index } = next;
    // Safety: never tag tier1 contacts
    const handleClean = entry.handle.replace(/^@/, "").toLowerCase();
    if (isTier1(handleClean)) {
      console.error(`BLOCKED: ${entry.handle} is a tier-1 contact. Skipping.`);
      const entries = loadCampaign();
      entries[index].status = "skipped";
      saveCampaign(entries);
      return;
    }
    console.log(`Outreach #${entry.rank}: ${entry.repo} -> ${entry.handle}`);
    tweet = entry.tweet;
    if (dryRun) {
      console.log("=== DRY RUN ===");
      console.log(tweet);
      console.log(`\nCharacters: ${tweet.length}`);
      return;
    }
    const ok = await postTweetPlaywright(tweet);
    if (ok) {
      markCampaignDone(index);
      console.log(`Campaign entry ${index + 1}/${loadCampaign().length} marked done.`);
    } else {
      console.error("Failed to post outreach tweet.");
      process.exit(1);
    }
    return;
  } else if (typeArg === "news") {
    if (args.includes("--status")) {
      newsQueueStatus();
      return;
    }
    const next = nextNewsQueueItem();
    if (!next) {
      console.log(
        "No pending items in news queue. Run: npx tsx scripts/news-pipeline.ts"
      );
      return;
    }
    const { item, index } = next;
    console.log(`News item [${item.newsType}]: ${item.headline.substring(0, 60)}`);
    tweet = item.tweetDraft;
    if (dryRun) {
      console.log("=== DRY RUN ===");
      console.log(tweet);
      console.log(`\nCharacters: ${tweet.length}`);
      return;
    }
    const ok = await postTweetPlaywright(tweet);
    if (ok) {
      markNewsItemPosted(index);
      console.log(`News item marked posted.`);
    } else {
      console.error("Failed to post news tweet.");
      process.exit(1);
    }
    return;
  } else {
    // Default: random template from existing pool
    console.log("Fetching top tools from AgentRank...");
    const tools = await fetchTopTools(5);
    if (tools.length === 0) {
      console.error("No tools returned from API");
      process.exit(1);
    }
    tweet = pickTemplate(tools);
  }

  if (dryRun) {
    console.log("=== DRY RUN ===");
    console.log(tweet);
    console.log(`\nCharacters: ${tweet.length}`);
    return;
  }

  const ok = await postTweetPlaywright(tweet);
  if (!ok) {
    console.error("Failed to post tweet.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
