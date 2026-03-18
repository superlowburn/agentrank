/**
 * Generate Open Graph images for all blog posts and key pages.
 * Uses Playwright to screenshot HTML templates.
 * Output: site/public/og/{slug}.png at 1200x630
 *
 * Usage: node scripts/generate-og-images.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../site/public/og');

mkdirSync(OUT_DIR, { recursive: true });

// Pages to generate OG images for
const PAGES = [
  // Key site pages
  {
    slug: 'home',
    title: 'AgentRank',
    subtitle: 'The reputation layer for AI skills, tools & agents',
    label: 'agentrank-ai.com',
    type: 'site',
  },
  {
    slug: 'tools',
    title: 'MCP Server Rankings',
    subtitle: '25,000+ tools scored daily from real signals',
    label: 'agentrank-ai.com/tools',
    type: 'site',
  },
  {
    slug: 'skills',
    title: 'AI Skills Directory',
    subtitle: 'Find and rank the best AI skills for Claude, Cursor & more',
    label: 'agentrank-ai.com/skills',
    type: 'site',
  },
  {
    slug: 'blog',
    title: 'AgentRank Blog',
    subtitle: 'MCP servers, agent tools, and the AI ecosystem',
    label: 'agentrank-ai.com/blog',
    type: 'site',
  },
  // Blog posts
  {
    slug: 'how-to-build-an-mcp-server',
    title: 'How to Build an MCP Server in 2026',
    subtitle: 'Step-by-step: Python SDK, TypeScript SDK, FastMCP, and getting indexed',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'mcp-server-vs-rest-api',
    title: 'MCP Server vs REST API',
    subtitle: 'When to use each — protocol design tradeoffs explained',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'how-to-choose-an-mcp-server',
    title: 'How to Choose an MCP Server in 2026',
    subtitle: 'A practical guide to evaluating quality, freshness, and fit',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'mcp-server-landscape-q1-2026',
    title: 'The MCP Server Landscape: Q1 2026',
    subtitle: 'A data-driven ecosystem report on 25,000+ servers',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'fastmcp-tutorial-python-mcp-server',
    title: 'FastMCP Tutorial',
    subtitle: 'Build a Python MCP Server in 20 Minutes',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-python-mcp-libraries',
    title: 'Best Python Libraries for MCP Servers',
    subtitle: 'Ranked and compared for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'mcp-server-comparison-top-10',
    title: 'MCP Server Comparison: Top 10 Head-to-Head',
    subtitle: 'Real data, real scores — who comes out on top?',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'mcp-server-directory-comparison',
    title: 'MCP Server Discovery Tools Compared',
    subtitle: 'Which directory should you use in 2026?',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'mcp-setup-guide-claude-cursor-windsurf',
    title: 'MCP Setup Guide',
    subtitle: 'Claude Desktop, Cursor, and Windsurf — step by step',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'what-is-mcp-model-context-protocol-explained',
    title: 'What is MCP?',
    subtitle: 'Model Context Protocol explained for developers',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'top-mcp-servers-2026',
    title: 'Top 10 MCP Servers for AI Agents in 2026',
    subtitle: 'Ranked by real data: stars, freshness, contributors, dependents',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'state-of-mcp-2026',
    title: 'The State of MCP Servers & Agent Tools in 2026',
    subtitle: 'Ecosystem trends, winners, and what comes next',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'this-week-in-mcp-2026-03-17',
    title: 'This Week in MCP',
    subtitle: 'March 17, 2026 — top movers, new tools, ecosystem news',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'this-week-in-mcp-2026-03-24',
    title: 'This Week in MCP',
    subtitle: 'March 24, 2026 — top movers, new tools, ecosystem news',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-ai-ml',
    title: 'Best MCP Servers for AI & Machine Learning',
    subtitle: 'Top-ranked servers for AI/ML workflows in 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-code-generation',
    title: 'Best MCP Servers for Code Generation',
    subtitle: 'Top-ranked coding tools for AI agents in 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-communication',
    title: 'Best MCP Servers for Communication',
    subtitle: 'Email, Slack, notifications — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-database',
    title: 'Best MCP Servers for Database Management',
    subtitle: 'SQL, NoSQL, and vector DBs — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-devops',
    title: 'Best MCP Servers for DevOps & Infrastructure',
    subtitle: 'CI/CD, containers, cloud — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-productivity',
    title: 'Best MCP Servers for Productivity',
    subtitle: 'Calendar, tasks, files — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-security',
    title: 'Best MCP Servers for Security',
    subtitle: 'Auth, scanning, secrets — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-web-browser',
    title: 'Best MCP Servers for Web Scraping & Browser Automation',
    subtitle: 'Playwright, Puppeteer, Firecrawl — ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-data-science',
    title: 'Best MCP Servers for Data Science',
    subtitle: 'Jupyter, DuckDB, dbt, Spark — top tools ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'best-mcp-servers-api-integration',
    title: 'Best MCP Servers for API Integration',
    subtitle: 'Slack, GitHub, Notion, Google Workspace — ranked for 2026',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
];

function buildHtml(page) {
  const isBlog = page.type === 'blog';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1200px;
    height: 630px;
    background: #0a0a0a;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: #e5e5e5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 64px 72px;
    overflow: hidden;
    position: relative;
  }

  /* Subtle grid background */
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(34, 197, 94, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 197, 94, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Green glow in corner */
  body::after {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .label {
    font-size: 16px;
    color: #22c55e;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: ${isBlog ? '28px' : '20px'};
    opacity: 0.9;
  }

  .title {
    font-size: ${page.title.length > 40 ? '48px' : page.title.length > 28 ? '56px' : '64px'};
    font-weight: 700;
    color: #22c55e;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    max-width: 960px;
  }

  .subtitle {
    font-size: 22px;
    color: #a1a1aa;
    line-height: 1.5;
    max-width: 840px;
    font-weight: 400;
  }

  .footer {
    position: absolute;
    bottom: 52px;
    left: 72px;
    right: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    font-size: 18px;
    color: #3f3f46;
    letter-spacing: 0.04em;
  }

  .url {
    font-size: 16px;
    color: #3f3f46;
  }

  .divider {
    position: absolute;
    bottom: 90px;
    left: 72px;
    right: 72px;
    height: 1px;
    background: linear-gradient(90deg, #22c55e30, transparent);
  }
</style>
</head>
<body>
  <div class="label">${isBlog ? 'AgentRank Blog' : 'AgentRank'}</div>
  <div class="title">${page.title}</div>
  <div class="subtitle">${page.subtitle}</div>
  <div class="divider"></div>
  <div class="footer">
    <span class="brand">agentrank-ai.com</span>
    <span class="url">${page.label}</span>
  </div>
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  let count = 0;
  for (const item of PAGES) {
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    // Brief wait for fonts if loaded
    await page.waitForTimeout(200);

    const outPath = join(OUT_DIR, `${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  generated: og/${item.slug}.png`);
    count++;
  }

  await browser.close();
  console.log(`\nDone. Generated ${count} OG images in site/public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
