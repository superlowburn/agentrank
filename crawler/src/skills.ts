/**
 * skills.sh crawler
 *
 * Fetches skill data from skills.sh — a registry tracking skill installs
 * across 21+ AI coding platforms (Claude Code, Cursor, Copilot, etc.).
 *
 * Strategy:
 *   1. Fetch the main leaderboard page and extract the initialSkills array
 *      from the Next.js RSC streaming data (source, skillId, name, installs).
 *   2. Fetch the /hot page for trending data (installsYesterday, change).
 *   3. For each skill, fetch the individual detail page to get description,
 *      platform breakdown, and author. Throttled with a 2s delay.
 *   4. Upsert each skill into the database.
 */

import { upsertSkill } from "./db.js";

const USER_AGENT = "AgentRank/1.0 (https://agentrank-ai.com)";
const BASE_URL = "https://skills.sh";
const DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaderboardSkill {
  source: string;   // e.g. "vercel-labs/skills"
  skillId: string;  // e.g. "find-skills"
  name: string;
  installs: number;
}

interface HotSkill extends LeaderboardSkill {
  installsYesterday?: number;
  change?: number;
}

interface SkillDetail {
  description: string | null;
  platforms: string[];
  author: string | null;
  githubRepo: string | null;
}

interface RetryItem {
  skill: LeaderboardSkill;
  slug: string;
  trendingRank: number | null;
  attempts: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

async function fetchWithRetry(url: string, label: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchPage(url);
    } catch (err) {
      console.warn(`[skills.sh] ${label} attempt ${attempt}/${maxRetries} failed: ${(err as Error).message}`);
      if (attempt === maxRetries) throw err;
      await sleep(DELAY_MS * attempt);
    }
  }
  throw new Error("unreachable");
}

/**
 * Extract a JSON array of skill objects from the Next.js RSC streaming payload.
 * The data is embedded in script tags as self.__next_f.push() calls containing
 * serialised component props with "initialSkills":[...] or similar patterns.
 *
 * NOTE: The JSON is inside JS string literals, so quotes are escaped as \"
 * We first try to unescape the data, then parse with standard patterns.
 */
function extractSkillsArray(html: string): LeaderboardSkill[] {
  // The RSC payload has escaped JSON inside JS strings. Unescape \" to " first.
  // This is safe because we're only looking for specific patterns.
  const unescaped = html.replace(/\\"/g, '"');

  // Pattern 1: "initialSkills":[{...}]
  const p1 = /"initialSkills"\s*:\s*(\[[\s\S]*?\])(?=\s*[,}])/;
  // Pattern 2: skills array inside RSC chunk — array of {source,skillId,name,installs}
  const p2 = /(\[\{"source":"[^"]+","skillId":"[^"]+","name":"[^"]+","installs":\d+\}(?:,\{"source":"[^"]+","skillId":"[^"]+","name":"[^"]+","installs":\d+\})*\])/;

  for (const pattern of [p1, p2]) {
    const match = unescaped.match(pattern);
    if (match?.[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].skillId) {
          return parsed as LeaderboardSkill[];
        }
      } catch {
        // Try next pattern
      }
    }
  }

  // Pattern 3: more lenient — find all individual skill objects and collect them
  const objPattern = /\{"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":(\d+)\}/g;
  const skills: LeaderboardSkill[] = [];
  let m: RegExpExecArray | null;
  while ((m = objPattern.exec(unescaped)) !== null) {
    skills.push({
      source: m[1],
      skillId: m[2],
      name: m[3],
      installs: parseInt(m[4], 10),
    });
  }

  return skills;
}

/**
 * Extract skill objects from the /hot page which includes additional fields.
 */
function extractHotSkills(html: string): HotSkill[] {
  // Unescape \" from RSC payload (same as extractSkillsArray)
  const unescaped = html.replace(/\\"/g, '"');
  // Hot page skills may include installsYesterday and change fields
  const objPattern = /\{"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":(\d+)(?:,"installsYesterday":(\d+))?(?:,"change":(-?\d+))?\}/g;
  const skills: HotSkill[] = [];
  let m: RegExpExecArray | null;
  while ((m = objPattern.exec(unescaped)) !== null) {
    skills.push({
      source: m[1],
      skillId: m[2],
      name: m[3],
      installs: parseInt(m[4], 10),
      installsYesterday: m[5] ? parseInt(m[5], 10) : undefined,
      change: m[6] ? parseInt(m[6], 10) : undefined,
    });
  }
  return skills;
}

/**
 * Parse an individual skill detail page for description, platforms, and author.
 */
function parseDetailPage(html: string, source: string): SkillDetail {
  let description: string | null = null;
  let author: string | null = null;
  let githubRepo: string | null = null;
  const platforms: string[] = [];

  // Extract description from meta tags or page content
  // og:description or meta description
  const ogDesc = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]*?)"/i);
  if (ogDesc?.[1]) {
    description = ogDesc[1].trim();
    // Clean up common prefixes
    if (description.startsWith("Install ") && description.includes(" on ")) {
      // This is likely the auto-generated meta, try to find the real description
      description = null;
    }
  }

  // Try to find description in the page body — usually in a paragraph after the skill name
  // The RSC data may contain it in a different format
  if (!description) {
    // Look for description in RSC streaming data
    const descPatterns = [
      /"description"\s*:\s*"((?:[^"\\]|\\.)*)"/,
      /This skill[^.]*\./,
    ];
    for (const pat of descPatterns) {
      const dm = html.match(pat);
      if (dm?.[1] || dm?.[0]) {
        const val = dm[1] ?? dm[0];
        if (val && val.length > 10 && val.length < 500) {
          description = val.replace(/\\"/g, '"').replace(/\\n/g, " ").trim();
          break;
        }
      }
    }
  }

  // Extract GitHub repo from install command or link
  // Pattern: github.com/{owner}/{repo}
  const ghMatch = html.match(/github\.com\/([\w-]+\/[\w.-]+)/);
  if (ghMatch?.[1]) {
    githubRepo = ghMatch[1].replace(/\.git$/, "");
  }

  // Extract author — the source field is "{owner}/{repo}", the owner is the author
  author = source.split("/")[0] || null;

  // Extract platforms from the detail page
  // Platform names appear near install counts in the breakdown
  const platformPatterns = [
    /\b(claude[- ]code|cursor|github[- ]copilot|cline|vs\s*code|windsurf|opencode|gemini(?:[- ]cli)?|codex|amp|roo|goose|trae|kilo|kimi[- ]cli|kiro[- ]cli|droid|antigravity|clawdbot)\b/gi,
  ];
  const seenPlatforms = new Set<string>();
  for (const pat of platformPatterns) {
    let pm: RegExpExecArray | null;
    while ((pm = pat.exec(html)) !== null) {
      const normalized = normalizePlatform(pm[1]);
      if (normalized) seenPlatforms.add(normalized);
    }
  }

  // Also look for platform names in structured data
  const platformNameMap: Record<string, string> = {
    "claude-code": "Claude Code",
    "cursor": "Cursor",
    "github-copilot": "GitHub Copilot",
    "cline": "Cline",
    "vscode": "VS Code",
    "windsurf": "Windsurf",
    "opencode": "OpenCode",
    "gemini": "Gemini",
    "gemini-cli": "Gemini",
    "codex": "Codex",
    "amp": "AMP",
    "roo": "Roo",
    "goose": "Goose",
    "trae": "Trae",
    "kilo": "Kilo",
    "kimi-cli": "Kimi CLI",
    "kiro-cli": "Kiro CLI",
    "droid": "Droid",
    "antigravity": "Antigravity",
    "clawdbot": "ClawdBot",
  };

  for (const [key, displayName] of Object.entries(platformNameMap)) {
    // Look for the slug form in the HTML (used in the platform breakdown section)
    if (html.includes(`"${key}"`) || html.includes(`>${key}<`) || html.includes(`/${key}`)) {
      seenPlatforms.add(displayName);
    }
  }

  platforms.push(...seenPlatforms);

  return { description, platforms, author, githubRepo };
}

function normalizePlatform(raw: string): string | null {
  const lower = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const map: Record<string, string> = {
    "claude code": "Claude Code",
    "claude-code": "Claude Code",
    "cursor": "Cursor",
    "github copilot": "GitHub Copilot",
    "github-copilot": "GitHub Copilot",
    "cline": "Cline",
    "vscode": "VS Code",
    "vs code": "VS Code",
    "windsurf": "Windsurf",
    "opencode": "OpenCode",
    "gemini": "Gemini",
    "gemini cli": "Gemini",
    "gemini-cli": "Gemini",
    "codex": "Codex",
    "amp": "AMP",
    "roo": "Roo",
    "goose": "Goose",
    "trae": "Trae",
    "kilo": "Kilo",
    "kimi cli": "Kimi CLI",
    "kimi-cli": "Kimi CLI",
    "kiro cli": "Kiro CLI",
    "kiro-cli": "Kiro CLI",
    "droid": "Droid",
    "antigravity": "Antigravity",
    "clawdbot": "ClawdBot",
  };
  return map[lower] ?? null;
}

// ---------------------------------------------------------------------------
// Main crawl function
// ---------------------------------------------------------------------------

export async function crawlSkillsSh(): Promise<number> {
  console.log("[skills.sh] Starting crawl...");
  let processed = 0;

  // -------------------------------------------------------------------------
  // Step 1: Fetch the main leaderboard to get all skills with install counts
  // -------------------------------------------------------------------------
  console.log("[skills.sh] Fetching main leaderboard...");
  let leaderboardSkills: LeaderboardSkill[] = [];
  try {
    const html = await fetchWithRetry(BASE_URL, "leaderboard");
    leaderboardSkills = extractSkillsArray(html);
    console.log(`[skills.sh] Extracted ${leaderboardSkills.length} skills from leaderboard`);
  } catch (err) {
    console.error("[skills.sh] Failed to fetch leaderboard after 3 attempts:", err);
    return 0;
  }

  if (leaderboardSkills.length === 0) {
    console.warn("[skills.sh] No skills found on leaderboard page. The page format may have changed.");
    return 0;
  }

  await sleep(DELAY_MS);

  // -------------------------------------------------------------------------
  // Step 2: Fetch the /trending page for additional skills not on the main
  //         leaderboard (sometimes has different entries)
  // -------------------------------------------------------------------------
  console.log("[skills.sh] Fetching trending page...");
  try {
    const trendingHtml = await fetchWithRetry(`${BASE_URL}/trending`, "trending page");
    const trendingSkills = extractSkillsArray(trendingHtml);
    console.log(`[skills.sh] Extracted ${trendingSkills.length} skills from trending page`);

    // Merge any skills not already in the leaderboard
    const existingKeys = new Set(leaderboardSkills.map((s) => `${s.source}/${s.skillId}`));
    for (const skill of trendingSkills) {
      const key = `${skill.source}/${skill.skillId}`;
      if (!existingKeys.has(key)) {
        leaderboardSkills.push(skill);
        existingKeys.add(key);
      }
    }
  } catch (err) {
    console.warn("[skills.sh] Failed to fetch trending page after 3 attempts (non-fatal):", err);
  }

  await sleep(DELAY_MS);

  // -------------------------------------------------------------------------
  // Step 3: Fetch the /hot page for hot/trending data
  // -------------------------------------------------------------------------
  let hotSkillsMap = new Map<string, HotSkill>();
  console.log("[skills.sh] Fetching hot page...");
  try {
    const hotHtml = await fetchWithRetry(`${BASE_URL}/hot`, "hot page");
    const hotSkills = extractHotSkills(hotHtml);
    console.log(`[skills.sh] Extracted ${hotSkills.length} skills from hot page`);
    for (const hs of hotSkills) {
      hotSkillsMap.set(`${hs.source}/${hs.skillId}`, hs);
    }

    // Also merge any skills not already in the leaderboard
    const existingKeys = new Set(leaderboardSkills.map((s) => `${s.source}/${s.skillId}`));
    for (const skill of hotSkills) {
      const key = `${skill.source}/${skill.skillId}`;
      if (!existingKeys.has(key)) {
        leaderboardSkills.push(skill);
        existingKeys.add(key);
      }
    }
  } catch (err) {
    console.warn("[skills.sh] Failed to fetch hot page after 3 attempts (non-fatal):", err);
  }

  await sleep(DELAY_MS);

  // -------------------------------------------------------------------------
  // Step 4: Pre-compute trending ranks from hot page data
  // -------------------------------------------------------------------------
  const trendingRanks = new Map<string, number>();
  if (hotSkillsMap.size > 0) {
    const sorted = Array.from(hotSkillsMap.entries())
      .sort(([, a], [, b]) => (b.change ?? 0) - (a.change ?? 0));
    for (let i = 0; i < sorted.length; i++) {
      trendingRanks.set(sorted[i][0], i + 1);
    }
  }

  // -------------------------------------------------------------------------
  // Step 5: Deduplicate — keep the entry with the highest install count
  // -------------------------------------------------------------------------
  const deduped = new Map<string, LeaderboardSkill>();
  for (const skill of leaderboardSkills) {
    const key = `${skill.source}/${skill.skillId}`;
    const existing = deduped.get(key);
    if (!existing || skill.installs > existing.installs) {
      deduped.set(key, skill);
    }
  }
  const allSkills = Array.from(deduped.values());
  console.log(`[skills.sh] ${allSkills.length} unique skills to process`);

  // -------------------------------------------------------------------------
  // Step 6: For each skill, fetch the detail page for description/platforms,
  //         then upsert into the database. Failed detail fetches go to retry queue.
  // -------------------------------------------------------------------------
  const retryQueue: RetryItem[] = [];

  for (let i = 0; i < allSkills.length; i++) {
    const skill = allSkills[i];
    const skillUrl = `${BASE_URL}/${skill.source}/${skill.skillId}`;
    const slug = `${skill.source}/${skill.skillId}`;

    // Progress logging every 10 skills
    if (i % 10 === 0) {
      console.log(`[skills.sh] Processing ${i + 1}/${allSkills.length}: ${slug}`);
    }

    // Look up pre-computed trending rank
    const trendingRank = trendingRanks.get(slug) ?? null;

    let detail: SkillDetail;
    try {
      const detailHtml = await fetchPage(skillUrl);
      detail = parseDetailPage(detailHtml, skill.source);
    } catch (err) {
      console.warn(`[skills.sh] Detail fetch failed for ${slug} (attempt 1/3): ${(err as Error).message}`);
      retryQueue.push({ skill, slug, trendingRank, attempts: 1 });
      if (i < allSkills.length - 1) await sleep(DELAY_MS);
      continue; // skip upsert — don't insert without detail data
    }

    try {
      upsertSkill({
        slug,
        name: skill.name,
        description: detail.description,
        github_repo: detail.githubRepo,
        source: "skills.sh",
        installs: skill.installs,
        trending_rank: trendingRank,
        platforms: detail.platforms,
        author: detail.author,
      });
      processed++;
    } catch (err) {
      console.error(`[skills.sh] Failed to upsert ${slug}:`, err);
    }

    // Delay between detail page fetches
    if (i < allSkills.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  // Step 7: Process retry queue — each failed item gets up to 2 more attempts
  // -------------------------------------------------------------------------
  if (retryQueue.length > 0) {
    console.log(`[skills.sh] Processing ${retryQueue.length} retries...`);
    let queue = [...retryQueue];
    while (queue.length > 0) {
      const nextQueue: RetryItem[] = [];
      for (const entry of queue) {
        const attempt = entry.attempts + 1;
        const skillUrl = `${BASE_URL}/${entry.slug}`;
        try {
          await sleep(DELAY_MS * attempt);
          const detailHtml = await fetchPage(skillUrl);
          const detail = parseDetailPage(detailHtml, entry.skill.source);
          upsertSkill({
            slug: entry.slug,
            name: entry.skill.name,
            description: detail.description,
            github_repo: detail.githubRepo,
            source: "skills.sh",
            installs: entry.skill.installs,
            trending_rank: entry.trendingRank,
            platforms: detail.platforms,
            author: detail.author,
          });
          processed++;
          console.log(`[skills.sh] Retry succeeded for ${entry.slug} on attempt ${attempt}/3`);
        } catch (err) {
          if (attempt >= 3) {
            console.error(`[skills.sh] FAILED after 3 attempts: ${entry.slug} — ${(err as Error).message}`);
          } else {
            nextQueue.push({ ...entry, attempts: attempt });
          }
        }
      }
      queue = nextQueue;
    }
  }

  console.log(`[skills.sh] Crawl complete. Processed ${processed}/${allSkills.length} skills.`);
  return processed;
}
