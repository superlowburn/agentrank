#!/usr/bin/env tsx
/**
 * generate-outreach.ts
 *
 * Reads top-100-maintainers.json + Template A from email-templates.md,
 * generates one personalized .md file per maintainer in
 * agents/founding-engineer/outreach/generated-emails/
 * and writes a summary index file.
 *
 * Does NOT send any emails.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const MAINTAINERS_FILE = path.join(
  ROOT,
  "agents/founding-engineer/outreach/top-100-maintainers.json"
);
const OUTPUT_DIR = path.join(
  ROOT,
  "agents/founding-engineer/outreach/generated-emails"
);
const SUMMARY_FILE = path.join(OUTPUT_DIR, "_summary.md");

const TOTAL_INDEXED = 25000;

interface Maintainer {
  rank: number;
  tool_name: string;
  full_name: string;
  github_username: string;
  github_url: string;
  description: string;
  score: number;
  stars: number;
  last_commit: string;
  days_since_last_commit: number;
  language: string;
  license: string;
  contributors: number;
  open_issues: number;
  closed_issues: number;
  dependents: number;
  npm_downloads: number;
  pypi_downloads: number;
  category: string;
  public_email: string | null;
}

function generateSubject(m: Maintainer): string {
  return `${m.tool_name} is ranked #${m.rank} on AgentRank`;
}

function generateBody(m: Maintainer): string {
  const score = m.score.toFixed(2);
  // Derive repo name slug for the tool URL (owner/repo → last segment)
  const repoSlug = m.tool_name;
  const toolUrl = `https://agentrank-ai.com/tools/${m.github_username}/${repoSlug}`;

  return `Hi ${m.github_username},

I built AgentRank — a live, daily-updated ranking of every MCP server and agent tool on GitHub. Your project ${m.tool_name} just earned the #${m.rank} spot out of ${TOTAL_INDEXED.toLocaleString()} tools in the index.

The score is based on five signals: stars, freshness (days since last commit), issue health (closed/total ratio), contributor count, and inbound dependents. ${m.tool_name} scored ${score}/100 — genuinely strong.

You can see the full breakdown here: ${toolUrl}

If anything looks wrong or you'd like to add context to your listing, reply here and I'll sort it out.

Keep shipping,
Steve
AgentRank — https://agentrank-ai.com`;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}

function main() {
  if (!fs.existsSync(MAINTAINERS_FILE)) {
    console.error(`Not found: ${MAINTAINERS_FILE}`);
    process.exit(1);
  }

  const maintainers: Maintainer[] = JSON.parse(
    fs.readFileSync(MAINTAINERS_FILE, "utf-8")
  );

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const summaryLines: string[] = [
    "# Generated Outreach Emails — Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Template: A (cold outreach)`,
    `Total: ${maintainers.length}`,
    "",
    "| # | File | Rank | Tool | Score | Preview |",
    "|---|------|------|------|-------|---------|",
  ];

  for (const m of maintainers) {
    const subject = generateSubject(m);
    const body = generateBody(m);
    const filename = `${String(m.rank).padStart(3, "0")}_${safeFilename(m.github_username)}_${safeFilename(m.tool_name)}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const content = [
      `---`,
      `rank: ${m.rank}`,
      `tool_name: ${m.tool_name}`,
      `full_name: ${m.full_name}`,
      `github_username: ${m.github_username}`,
      `github_url: ${m.github_url}`,
      `score: ${m.score}`,
      `template: A`,
      `generated_at: ${new Date().toISOString()}`,
      `---`,
      ``,
      `## Subject`,
      ``,
      subject,
      ``,
      `## Body`,
      ``,
      body,
    ].join("\n");

    fs.writeFileSync(filepath, content, "utf-8");

    // One-line preview: first 80 chars of body after the greeting
    const preview = body.split("\n")[2]?.slice(0, 80) ?? "";
    summaryLines.push(
      `| ${m.rank} | ${filename} | #${m.rank} | ${m.tool_name} | ${m.score.toFixed(1)} | ${preview}... |`
    );
  }

  fs.writeFileSync(SUMMARY_FILE, summaryLines.join("\n") + "\n", "utf-8");

  console.log(`Generated ${maintainers.length} email drafts → ${OUTPUT_DIR}`);
  console.log(`Summary → ${SUMMARY_FILE}`);
}

main();
