export const prerender = true;

const posts = [
  {
    slug: 'how-agentrank-scores-mcp-servers',
    title: 'How AgentRank Scores MCP Servers — The Quality Score Explained',
    description: 'Every MCP server in the AgentRank index has a quality score from 0 to 100. Here is exactly what goes into it — the five signals, their weights, and real before/after examples from the index.',
    date: '2026-03-19',
  },
  {
    slug: 'mcp-server-growth-report-march-2026',
    title: 'MCP Server Growth Report — March 2026',
    description: 'Velocity rankings for the MCP ecosystem. Top 10 fastest-growing tools by stars per week, category momentum, first-time top-100 entries, and maintenance health from 25,750+ indexed repositories.',
    date: '2026-03-19',
  },
  {
    slug: 'fastmcp-tutorial-python-mcp-server',
    title: 'FastMCP Tutorial: Build a Python MCP Server in 20 Minutes',
    description: 'Step-by-step FastMCP 3.0 tutorial: tools, resources, prompts, MCP Inspector testing, Claude Desktop setup, and Cloudflare Workers deployment. Covers composability, OpenAPI mounting, proxy mode, OAuth, and OpenTelemetry.',
    date: '2026-03-18',
  },
  {
    slug: 'mcp-setup-guide-claude-cursor-windsurf',
    title: 'How to Set Up MCP Servers in Claude Desktop, Cursor, and Windsurf',
    description: 'Step-by-step setup guide for every major AI client. JSON config examples, common errors and fixes, and the top-rated MCP servers to install first.',
    date: '2026-03-18',
  },
  {
    slug: 'what-is-mcp-model-context-protocol-explained',
    title: 'What is MCP? Model Context Protocol Explained for Developers',
    description: 'A beginner-friendly explainer on the Model Context Protocol — what problem it solves, how the host-client-server architecture works, what MCP servers can do, and how it compares to plugins and function calling.',
    date: '2026-03-18',
  },
  {
    slug: 'best-python-mcp-libraries',
    title: 'Best Python Libraries for Building MCP Servers in 2026',
    description: 'FastMCP, the official Python SDK, and the leading Python MCP frameworks — scored by real signals from the AgentRank index. Code examples, pros/cons, and a decision framework.',
    date: '2026-03-18',
  },
  {
    slug: 'top-mcp-servers-2026',
    title: 'Top 10 MCP Servers for AI Agents in 2026 (Ranked by Real Data)',
    description: 'The 10 highest-scoring MCP servers from 25,000+ in the AgentRank index. Ranked by composite signal: stars, freshness, issue health, contributors, and dependents. Updated March 2026.',
    date: '2026-03-18',
  },
  {
    slug: 'this-week-in-mcp-2026-03-24',
    title: 'This Week in MCP — March 24, 2026',
    description: 'Weekly ecosystem report: top 10 reshuffled — PrefectHQ/fastmcp rises from #7 to #1, modelcontextprotocol SDKs surge in. Freshness beats stars.',
    date: '2026-03-24',
  },
  {
    slug: 'this-week-in-mcp-2026-03-17',
    title: 'This Week in MCP — March 17, 2026',
    description: 'Weekly ecosystem report: 25632 new tools, biggest movers, and index stats for the week of March 17, 2026. Auto-generated from the AgentRank index.',
    date: '2026-03-17',
  },
  {
    slug: 'mcp-server-directory-comparison',
    title: 'MCP Server Discovery Tools Compared (2026)',
    description: 'An objective comparison of every major MCP server directory: MCPMarket, PulseMCP, Glama.ai, Awesome-MCP-Servers, the Official MCP Registry, and AgentRank. Coverage, ranking methodology, freshness, and who each platform is best for.',
    date: '2026-03-17',
  },
  {
    slug: 'how-to-build-an-mcp-server',
    title: 'How to Build an MCP Server in 2026',
    description: 'Step-by-step guide using the official Python SDK, TypeScript SDK, or FastMCP. With code examples, framework comparisons, and production best practices from the AgentRank index.',
    date: '2026-03-17',
  },
  {
    slug: 'mcp-server-vs-rest-api',
    title: 'MCP Server vs REST API: When to Use Each',
    description: 'A practical comparison of MCP servers and REST APIs for AI integrations. When MCP wins, when REST wins, and a decision framework backed by ecosystem data from 25,000+ indexed repos.',
    date: '2026-03-17',
  },
  {
    slug: 'best-mcp-servers-memory',
    title: 'Best MCP Servers for Memory and Knowledge Management in 2026',
    description: 'Top-ranked MCP servers for persistent agent memory, knowledge graphs, codebase indexing, and context management. The fastest-growing category in the AgentRank index — 37.6% freshness rate.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-design',
    title: 'Best MCP Servers for Design (Figma, UI/UX Workflows) in 2026',
    description: 'Top-ranked MCP servers for design workflows — Figma layout context, UI components, icon systems, diagramming, and open-source design tool integrations. Figma-Context-MCP leads at 13,663 stars.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-code-generation',
    title: 'Best MCP Servers for Code Generation in 2026',
    description: 'Top-ranked MCP servers for AI-assisted code generation: GitHub access, semantic code editing, execution sandboxes, and dev workflow automation. Real scores from the AgentRank index.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-web-browser',
    title: 'Best MCP Servers for Web Scraping & Browser Automation in 2026',
    description: 'Top-ranked MCP servers for web scraping, browser automation, Playwright, Puppeteer, and content extraction. Firecrawl, Browserbase, Apify, and more — scored by real signals.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-communication',
    title: 'Best MCP Servers for Communication in 2026',
    description: 'Top-ranked MCP servers for Slack, Discord, email, messaging, and notifications. Real scores from the AgentRank index — March 2026 data.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-productivity',
    title: 'Best MCP Servers for Productivity in 2026',
    description: 'Top-ranked MCP servers for task management, note-taking, calendar, email, and team communication. Notion, Linear, Slack, Gmail, and more — scored by real signals from the AgentRank index.',
    date: '2026-03-17',
  },
  {
    slug: 'mcp-server-landscape-q1-2026',
    title: 'The MCP Server Landscape: Q1 2026 — Data-Driven Ecosystem Report',
    description: 'Growth trajectory, category breakdown, biggest movers, language momentum, and Q2 2026 predictions. Real data from the AgentRank index covering 25,632 GitHub repositories.',
    date: '2026-03-17',
  },
  {
    slug: 'mcp-server-comparison-top-10',
    title: 'MCP Server Comparison: Top 10 Head-to-Head in 2026',
    description: 'A data-driven comparison of the 10 highest-scoring MCP servers across all categories. Stars, freshness, issue health, contributors, and AgentRank scores — side by side.',
    date: '2026-03-17',
  },
  {
    slug: 'how-to-choose-an-mcp-server',
    title: 'How to Choose an MCP Server in 2026',
    description: 'A decision framework for evaluating MCP servers using five real quality signals. Stop picking by stars — start scoring by what actually predicts reliability.',
    date: '2026-03-17',
  },
  {
    slug: 'best-mcp-servers-security',
    title: 'Best MCP Servers for Security in 2026',
    description: 'Top-ranked MCP servers for vulnerability scanning, secrets management, container security, SAST, and cloud posture. Scored by real signals from the AgentRank index.',
    date: '2026-03-17',
  },
  {
    slug: 'best-mcp-servers-ai-ml',
    title: 'Best MCP Servers for AI & Machine Learning in 2026',
    description: 'Top MCP servers for vector databases, RAG pipelines, LLM access, and AI development workflows. Qdrant, Milvus, ChromaDB, HuggingFace, and more — ranked by real quality signals.',
    date: '2026-03-17',
  },
  {
    slug: 'best-mcp-servers-devops',
    title: 'Best MCP Servers for DevOps & Infrastructure in 2026',
    description: 'Top-ranked MCP servers for Kubernetes, Azure, AWS, GCP, and infrastructure management. Real scores from the AgentRank index — March 2026 data.',
    date: '2026-03-17',
  },
  {
    slug: 'best-mcp-servers-database',
    title: 'Best MCP Servers for Database Management in 2026',
    description: 'The top-ranked MCP servers for database access and management. MongoDB, Redis, MySQL, Postgres, DuckDB, and more — scored by freshness, issue health, and real usage signals.',
    date: '2026-03-17',
  },
  {
    slug: 'state-of-mcp-2026',
    title: 'The State of MCP Servers & Agent Tools in 2026',
    description: 'We indexed 25,632 repositories. Here\'s what the data actually shows about the MCP ecosystem — language breakdown, freshness, score distribution, and the top tools by every signal.',
    date: '2026-03-16',
  },
];

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET() {
  // Sort newest first
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  const entries = sorted.map((post) => {
    const url = `https://agentrank-ai.com/blog/${post.slug}/`;
    const pubDate = new Date(post.date + 'T00:00:00Z').toUTCString();
    return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>noreply@agentrank-ai.com (AgentRank)</author>
  </item>`;
  });

  const lastBuildDate = new Date(sorted[0].date + 'T00:00:00Z').toUTCString();

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AgentRank Blog</title>
    <link>https://agentrank-ai.com/blog/</link>
    <description>Data-driven analysis of the MCP server and agent tools ecosystem. Real numbers from the AgentRank index.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="https://agentrank-ai.com/blog/rss.xml" rel="self" type="application/rss+xml"/>
${entries.join('\n')}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, max-age=1800',
    },
  });
}
