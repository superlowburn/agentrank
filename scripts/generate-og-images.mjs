/**
 * Generate Open Graph images for all blog posts and key pages.
 * Uses Playwright to screenshot HTML templates.
 * Output: site/public/og/{slug}.png at 1200x630
 *
 * Usage: node scripts/generate-og-images.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../site/public/og');
const COMPARE_OUT_DIR = join(__dirname, '../site/public/og/compare');
const ALTERNATIVES_OUT_DIR = join(__dirname, '../site/public/og/alternatives');

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(COMPARE_OUT_DIR, { recursive: true });
mkdirSync(ALTERNATIVES_OUT_DIR, { recursive: true });

// ── Data helpers (mirrors ranked.ts / tools.ts / content-gen.ts) ──────────────

const rankedData = JSON.parse(readFileSync(join(__dirname, '../data/ranked.json'), 'utf-8'));

function toSlug(fullName) {
  return fullName.replace('/', '--');
}

function classifyTool(tool) {
  const text = [
    tool.description || '',
    (tool.github_topics || []).join(' '),
    tool.full_name,
  ].join(' ').toLowerCase();
  const queries = (tool.matched_queries || []).join(' ').toLowerCase();

  if (/\b(multi[- ]?agent|orchestrat|workflow)\b/.test(text) || /a2a/.test(queries) ||
      /\b(sdk|framework|library|toolkit)\b.*\b(mcp|agent|llm)\b|\b(mcp|agent|llm)\b.*\b(sdk|framework|library|toolkit)\b/.test(text))
    return 'agent-framework';
  if (/\b(playwright|puppeteer|selenium|headless.*browser|browser.*automat|web.*scrape|scraping)\b/.test(text))
    return 'browser-automation';
  if (/\b(postgres|postgresql|mysql|sqlite|mongodb|redis|cassandra|supabase|neon|planetscale|cockroach|turso|libsql|database.*server|sql.*server)\b/.test(text))
    return 'database';
  if (/\b(filesystem|file.*system|local.*file|file.*access|file.*manager|directory.*list|read.*write.*file|file.*server)\b/.test(text))
    return 'filesystem';
  if (/\b(vector.*store|vector.*db|embedding.*search|semantic.*search|rag\b|retrieval.*augment|pinecone|weaviate|qdrant|chroma|milvus|opensearch|elasticsearch)\b/.test(text))
    return 'search';
  if (/\b(prometheus|grafana|datadog|sentry|opentelemetry|otel|observability|telemetry|tracing)\b/.test(text))
    return 'monitoring';
  if (/\b(slack|discord|telegram|twilio|sendgrid|mailgun|smtp|email.*send|send.*email|webhook.*notif)\b/.test(text))
    return 'communication';
  if (/\b(litellm|llm.*gateway|llm.*proxy|llm.*router|ai.*gateway|openai.*compat|model.*router)\b/.test(text))
    return 'llm-client';
  if (/\b(ollama|llama\.cpp|lm.?studio|hugging.?face.*model|mistral.*api|openai.*api|anthropic.*api|gemini.*api|model.*inference|inference.*server|local.*llm|run.*model)\b/.test(text))
    return 'ai-models';
  if (/\b(docker|kubernetes|k8s\b|helm\b|terraform|ansible|github.*actions|gitlab.*ci|ci.*cd|infrastructure.*as.*code|container.*deploy|cloud.*deploy)\b/.test(text))
    return 'deployment';
  if (/\b(code.*gen|generat.*code|scaffold|boilerplate|code.*synthesis|codegen|generate.*function|generate.*test)\b/.test(text))
    return 'code-generation';
  if (/\b(rest.*api|graphql.*api|openapi|swagger|webhook.*integr|api.*integr|zapier|n8n\b|make\.com|api.*connect)\b/.test(text))
    return 'api-integration';
  if (/\b(apache.*kafka|apache.*spark|apache.*airflow|dbt\b|etl\b|data.*pipeline|data.*ingestion|data.*transform)\b/.test(text))
    return 'data-processing';
  if (/mcp|model.*context.*protocol/.test(queries))
    return 'mcp-server';
  return 'ai-tool';
}

function getComparisonPairs(minScore = 50) {
  const topTools = rankedData.map(t => ({ ...t, category: classifyTool(t) })).filter(t => (t.score ?? 0) >= minScore);
  const byCategory = {};
  for (const t of topTools) {
    const cat = t.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }
  const pairs = [];
  for (const cats of Object.values(byCategory)) {
    const top = cats.slice(0, 10);
    if (top.length < 2) continue;
    for (let i = 0; i < top.length - 1; i++) {
      for (let j = i + 1; j < top.length; j++) {
        pairs.push({ a: top[i], b: top[j] });
      }
    }
  }
  pairs.sort((x, y) => (y.a.score + y.b.score) - (x.a.score + x.b.score));
  return pairs.slice(0, 60);
}

// ── Compare pages ─────────────────────────────────────────────────────────────

const COMPARE_PAGES = getComparisonPairs().map(({ a, b }) => {
  const nameA = a.full_name.split('/')[1] || a.full_name;
  const nameB = b.full_name.split('/')[1] || b.full_name;
  return {
    slug: `${toSlug(a.full_name)}-vs-${toSlug(b.full_name)}`,
    title: `${nameA} vs ${nameB}`,
    subtitle: 'AgentRank Score Comparison',
    label: 'agentrank-ai.com/compare',
    type: 'compare',
  };
});

// ── Alternatives pages ────────────────────────────────────────────────────────

const ALTERNATIVES_PAGES = rankedData.slice(0, 100).map(tool => {
  const shortName = tool.full_name.split('/')[1] || tool.full_name;
  return {
    slug: toSlug(tool.full_name),
    title: `Best Alternatives to ${shortName}`,
    subtitle: 'Ranked by AgentRank',
    label: 'agentrank-ai.com/alternatives',
    type: 'alternatives',
  };
});

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
    slug: 'agentrank-claude-code-integration-guide',
    title: 'AgentRank in Claude Code',
    subtitle: 'Install once, get live MCP rankings in every project',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
  {
    slug: 'agentrank-cursor-integration-guide',
    title: 'AgentRank in Cursor',
    subtitle: 'Live tool rankings in Chat and Agent mode',
    label: 'agentrank-ai.com/blog',
    type: 'blog',
  },
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
  const isCompare = page.type === 'compare';
  const isAlternatives = page.type === 'alternatives';

  const labelText = isBlog ? 'AgentRank Blog'
    : isCompare ? 'AgentRank Compare'
    : isAlternatives ? 'AgentRank Alternatives'
    : 'AgentRank';

  const titleSize = page.title.length > 40 ? '44px' : page.title.length > 28 ? '52px' : '64px';

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
    margin-bottom: ${isBlog || isCompare || isAlternatives ? '28px' : '20px'};
    opacity: 0.9;
  }

  .title {
    font-size: ${titleSize};
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
  <div class="label">${labelText}</div>
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

  // ── Standard pages ──────────────────────────────────────────────────────────
  for (const item of PAGES) {
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    const outPath = join(OUT_DIR, `${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  generated: og/${item.slug}.png`);
    count++;
  }

  // ── Compare pages ───────────────────────────────────────────────────────────
  console.log(`\nGenerating ${COMPARE_PAGES.length} compare OG images...`);
  for (const item of COMPARE_PAGES) {
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    const outPath = join(COMPARE_OUT_DIR, `${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  generated: og/compare/${item.slug}.png`);
    count++;
  }

  // ── Alternatives pages ──────────────────────────────────────────────────────
  console.log(`\nGenerating ${ALTERNATIVES_PAGES.length} alternatives OG images...`);
  for (const item of ALTERNATIVES_PAGES) {
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    const outPath = join(ALTERNATIVES_OUT_DIR, `${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  generated: og/alternatives/${item.slug}.png`);
    count++;
  }

  await browser.close();
  console.log(`\nDone. Generated ${count} OG images total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
