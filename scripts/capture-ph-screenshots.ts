import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://agentrank-ai.com';
const OUT_DIR = path.join(process.cwd(), 'site/public/ph');
const WIDTH = 1270;
const HEIGHT = 760;

const PAGES = [
  {
    name: 'ph-01-homepage.png',
    url: `${BASE_URL}/`,
    waitFor: 'table, .skills-table, [class*="leaderboard"], tr',
    description: 'Homepage with leaderboard',
    scrollTo: 400,
  },
  {
    name: 'ph-02-tool-detail.png',
    url: `${BASE_URL}/tool/microsoft--azure-devops-mcp/`,
    waitFor: 'svg.radar-chart, .radar-wrapper',
    description: 'Tool detail with radar chart',
    scrollTo: 500,
  },
  {
    name: 'ph-03-category.png',
    url: `${BASE_URL}/category/mcp-server/`,
    waitFor: 'table, tr, [class*="tool"], [class*="skill"]',
    description: 'Category page',
    scrollTo: 700,
  },
  {
    name: 'ph-04-methodology.png',
    url: `${BASE_URL}/methodology/`,
    waitFor: 'h1, h2, main',
    description: 'Methodology / scoring transparency',
    scrollTo: 0,
  },
  {
    name: 'ph-05-api.png',
    url: `${BASE_URL}/api-docs/`,
    waitFor: 'pre, code, h1, main',
    description: 'API docs / MCP server integration',
    scrollTo: 0,
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
  });
  const page = await context.newPage();

  for (const p of PAGES) {
    console.log(`Capturing: ${p.description} → ${p.name}`);
    try {
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Try to wait for content
      try {
        await page.waitForSelector(p.waitFor, { timeout: 5000 });
      } catch {
        // Selector not found — continue anyway
      }
      // Small delay for any JS rendering
      await page.waitForTimeout(1500);
      if (p.scrollTo) {
        await page.evaluate((y) => window.scrollTo(0, y), p.scrollTo);
        await page.waitForTimeout(500);
      }
      const outPath = path.join(OUT_DIR, p.name);
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      console.log(`  Saved: ${outPath}`);
    } catch (err) {
      console.error(`  ERROR for ${p.name}:`, err);
    }
  }

  await browser.close();
  console.log('\nDone. Screenshots in site/public/ph/');
}

main().catch(console.error);
