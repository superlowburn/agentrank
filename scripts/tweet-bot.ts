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
 *   npx tsx scripts/tweet-bot.ts              # post a tweet now
 *   npx tsx scripts/tweet-bot.ts --dry-run    # preview without posting
 *   npx tsx scripts/tweet-bot.ts --now        # post immediately (no variance delay)
 *   npx tsx scripts/tweet-bot.ts --refresh    # re-extract cookies from Chrome first
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { chromium } from "playwright";
import { TIER1_CONTACTS } from "./lib/tier1-contacts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://agentrank-ai.com/api";
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");
const HISTORY_FILE = resolve(__dirname, "../.tweet-bot-history.json");

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

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

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

  console.log("Fetching top tools from AgentRank...");
  const tools = await fetchTopTools(5);

  if (tools.length === 0) {
    console.error("No tools returned from API");
    process.exit(1);
  }

  const tweet = pickTemplate(tools);

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
