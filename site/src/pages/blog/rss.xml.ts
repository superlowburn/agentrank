export const prerender = true;

const posts = [
  {
    slug: 'top-mcp-servers-database',
    title: 'Top 10 MCP Servers for Database Access in 2026',
    description: 'The 10 highest-scoring MCP servers for database access, ranked by real signals: AgentRank score, stars, issue close rate, and freshness. Covers Postgres, MySQL, MongoDB, Redis, DuckDB, and more.',
    date: '2026-03-19',
  },
  {
    slug: 'state-of-mcp-ecosystem-march-2026',
    title: 'State of the MCP Ecosystem — March 2026',
    description: 'A data-driven analysis of 25,750 MCP repositories and 3,859 skills from the AgentRank index. Ecosystem size, health metrics, language breakdown, top tools, and what the data predicts for Q2 2026.',
    date: '2026-03-19',
  },
  {
    slug: 'getting-started-with-mcp-servers',
    title: 'Getting Started with MCP Servers: A Complete Beginner Tutorial',
    description: 'Learn what MCP servers are, how to install your first one, how to evaluate quality with the AgentRank score, and the top 5 servers every developer should start with.',
    date: '2026-03-19',
  },
  {
    slug: 'mcp-server-framework-comparison',
    title: 'MCP Server Framework Comparison: TypeScript SDK vs FastMCP vs MCP-Go (2026)',
    description: 'Data-driven comparison of every major MCP server framework. AgentRank scores, dependents, issue health, and a pick-your-language decision guide — March 2026.',
    date: '2026-03-19',
  },
  {
    slug: 'mcp-server-security-best-practices',
    title: 'MCP Server Security Best Practices for 2026',
    description: 'A practical guide to securing Model Context Protocol servers. Transport security, authentication, prompt injection defense, sandboxing, and a security checklist for publishing MCP servers.',
    date: '2026-03-18',
  },
  {
    slug: 'fastmcp-vs-official-mcp-sdk',
    title: 'FastMCP vs Official MCP SDK: Which Python Framework to Use?',
    description: 'Data-driven comparison of FastMCP and the official Python MCP SDK. Scores, dependents, issue health, and when to pick each — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'a2a-vs-mcp-agent-protocol-comparison',
    title: "A2A vs MCP: The Definitive Agent Protocol Comparison (2026)",
    description: "Google's A2A and Anthropic's MCP solve different problems in the AI agent stack. A detailed, data-backed comparison of design philosophy, ecosystem size, use cases, and how to choose between them.",
    date: '2026-03-18',
  },
  {
    slug: 'agentrank-claude-code-integration-guide',
    title: 'How to Use AgentRank Scores in Claude Code — Integration Guide',
    description: 'Step-by-step guide to installing the AgentRank MCP server in Claude Code. Query MCP tool rankings, look up scores, and pick the best server for your project — from inside your editor.',
    date: '2026-03-18',
  },
  {
    slug: 'agentrank-cursor-integration-guide',
    title: 'How to Use AgentRank in Cursor — Integration Guide',
    description: 'Step-by-step guide to adding the AgentRank MCP server to Cursor. Query live tool rankings, check scores before adding dependencies, and pick the best MCP tools for your project from inside Cursor.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-api-integration',
    title: 'Best MCP Servers for API Integration in 2026',
    description: 'Top-ranked MCP servers for connecting agents to Slack, GitHub, Notion, Google Workspace, Jira, and Airtable. Real scores from the AgentRank index, updated March 2026.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-data-science',
    title: 'Top 10 MCP Servers for Data Science and Analytics in 2026',
    description: 'The 10 highest-scoring MCP servers for data science: DuckDB, Jupyter, Spark, ClickHouse, dbt, GA4, Airflow, Snowflake, E2B, BigQuery. Scored by real signals — stars, freshness, issue health, contributors.',
    date: '2026-03-19',
  },
  {
    slug: 'best-mcp-servers-file-management',
    title: 'Best MCP Servers for File Management in 2026',
    description: 'The top-ranked MCP servers for file management: local filesystem access, Google Drive, AWS S3, and cloud storage. Scored by real signals — stars, freshness, issue health, contributors.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-game-dev',
    title: 'Best MCP Servers for Game Development in 2026 (Unity, Xcode, KiCAD)',
    description: 'The top-ranked MCP servers for game development: Unity Editor, Unreal Engine, iOS/Xcode, and KiCAD PCB design. Scored by real signals — updated March 2026.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-home-automation',
    title: 'Best MCP Servers for Home Automation and IoT in 2026',
    description: 'Top-ranked MCP servers for Home Assistant, smart home control, and IoT device management. Scored by freshness, issue health, and community signals. March 2026 data.',
    date: '2026-03-18',
  },
  {
    slug: 'best-mcp-servers-web-scraping-research',
    title: 'Best MCP Servers for Web Scraping and Research in 2026',
    description: 'Top-ranked MCP servers for web scraping and research: Tavily, Exa, Firecrawl, Brave, Apify. Real AgentRank scores updated March 2026.',
    date: '2026-03-19',
  },
  {
    slug: 'desktop-commander-mcp-vs-official-filesystem',
    title: 'Desktop Commander MCP vs Official Filesystem Server: Local File Access Compared',
    description: 'Compare DesktopCommanderMCP and the official MCP filesystem server. Scores, feature coverage, and which to use for local file access — March 2026 data.',
    date: '2026-03-19',
  },
  {
    slug: 'exa-mcp-vs-firecrawl-mcp',
    title: 'Exa MCP vs Firecrawl MCP: Which Web Research Tool?',
    description: 'Compare Exa and Firecrawl MCP servers for web research. Scores, use cases, and which to choose for search vs scraping — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'github-mcp-vs-git-mcp',
    title: 'GitHub MCP Server vs git-mcp: Which GitHub Integration to Use?',
    description: 'Compare the official GitHub MCP server and git-mcp. Scores, approach differences, and when to use each — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'google-workspace-mcp-vs-microsoft-365-mcp',
    title: 'Google Workspace MCP vs Microsoft 365 MCP: Which Productivity Server?',
    description: 'Compare Google Workspace and Microsoft 365 MCP servers. Scores, features, and which to use for your productivity stack — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'integrate-agentrank-ai-agent-tutorial',
    title: 'How to Integrate AgentRank Scores Into Your AI Agent — Tutorial',
    description: 'Step-by-step guide to using the AgentRank API in your AI agent. Search the ranked MCP index, look up tool scores, and let your agent pick the best tools automatically.',
    date: '2026-03-18',
  },
  {
    slug: 'kubernetes-mcp-server-vs-mcp-server-kubernetes',
    title: 'containers/kubernetes-mcp-server vs Flux159/mcp-server-kubernetes — Compared',
    description: 'Compare the two leading Kubernetes MCP servers. Scores, languages, OpenShift support, and which to use for your cluster — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'mcp-server-directory-comparison-2026',
    title: 'AgentRank vs Smithery vs Glama vs MCP.so: MCP Directory Comparison 2026',
    description: 'Which MCP server directory should you use? We compare AgentRank, Smithery.ai, Glama.ai, MCP.so, mcp-get.com, and the official MCP registry on coverage, scoring methodology, API availability, and use cases.',
    date: '2026-03-18',
  },
  {
    slug: 'monthly-mcp-index-march-2026',
    title: 'Monthly MCP Index Report — March 2026 in Numbers',
    description: 'The AgentRank monthly data brief: 25,632 tools indexed, 3,124 skills tracked, 17.8M total installs. Top 10 leaderboard, biggest movers, language trends, and April 2026 outlook.',
    date: '2026-03-18',
  },
  {
    slug: 'motherduck-mcp-vs-redis-mcp',
    title: 'MotherDuck MCP vs Redis MCP: Which Database MCP Server?',
    description: 'Compare MotherDuck and Redis MCP servers. Which to use for analytics vs real-time data — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'neon-mcp-vs-mongodb-mcp',
    title: 'Neon MCP vs MongoDB MCP: Which Cloud Database MCP Server?',
    description: 'Compare the official Neon and MongoDB MCP servers. Scores, signal breakdowns, and which to use for your database type — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'playwright-mcp-vs-puppeteer-mcp',
    title: 'Playwright MCP vs Puppeteer MCP: Which Browser Automation Tool?',
    description: 'Data-driven comparison of Playwright and Puppeteer MCP servers. Scores, stars, issue health, and contributor depth for every option — March 2026 data from the AgentRank index.',
    date: '2026-03-18',
  },
  {
    slug: 'tavily-mcp-vs-brave-search-mcp',
    title: 'Tavily MCP vs Brave Search MCP: Which Web Search Server?',
    description: 'Compare Tavily and Brave Search MCP servers. Scores, signal breakdowns, and which to use for your agent web search needs — March 2026 data from the AgentRank index.',
    date: '2026-03-19',
  },
  {
    slug: 'this-week-in-mcp-2026-03-18',
    title: 'This Week in MCP — March 18, 2026',
    description: 'Weekly ecosystem report: 263 new tools indexed this week, enterprise tooling breaks into the top 3, and microsoft/playwright-mcp enters the top 10 with 29K stars. Data from 25,638 indexed repositories.',
    date: '2026-03-18',
  },
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
