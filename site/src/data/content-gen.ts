import type { Tool } from './tools';

const PERMISSIVE_LICENSES = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense'];

export const CATEGORIES: Record<string, string> = {
  'mcp-server': 'MCP Server',
  'agent-framework': 'Agent Framework',
  'ai-tool': 'AI Tool',
  'llm-client': 'LLM Client',
  'code-assistant': 'Code Assistant',
  'data-processing': 'Data Processing',
  'browser-automation': 'Browser Automation',
  'database': 'Database',
  'filesystem': 'Filesystem',
  'search': 'Search & RAG',
  'api-integration': 'API Integration',
  'deployment': 'Deployment & DevOps',
  'code-generation': 'Code Generation',
  'monitoring': 'Monitoring',
  'communication': 'Communication',
  'ai-models': 'AI Models',
  'other': 'Other',
};

export interface CategoryContent {
  heading: string;
  intro: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  relatedCategories: string[];
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  'database': {
    heading: 'Database MCP Servers',
    intro: [
      'Database MCP servers give AI agents direct, structured access to SQL and NoSQL databases through the Model Context Protocol. These tools let language models query, insert, update, and manage data without writing raw connection code — making them the backbone of AI-powered data analysis, automated reporting, and database administration workflows.',
      'The leading database MCP servers cover the full spectrum of modern data infrastructure: PostgreSQL, MySQL, SQLite, MongoDB, Redis, and cloud-native databases like Supabase, Neon, PlanetScale, CockroachDB, and Turso. Most expose a standardized tool interface so your agent can describe data needs in natural language and get back typed results.',
      'When evaluating database MCP servers, prioritize freshness (active maintenance), issue health (responsive maintainers), and dependent project count (real-world adoption). A tool used by hundreds of downstream projects has been battle-tested in ways a brand-new release hasn\'t.',
    ],
    metaTitle: 'Best Database MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top database MCP servers for AI agents: PostgreSQL, MySQL, SQLite, MongoDB, Redis, Supabase, Neon and more. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'database MCP server, PostgreSQL MCP, MySQL MCP, SQLite MCP server, Supabase MCP, Neon MCP, MongoDB agent tool, Redis MCP server',
    relatedCategories: ['search', 'data-processing', 'filesystem'],
  },
  'filesystem': {
    heading: 'Filesystem MCP Servers',
    intro: [
      'Filesystem MCP servers give AI agents read and write access to local and remote file systems. These tools are among the most fundamental MCP servers — they let language models open files, list directories, create and delete paths, and process documents without any custom glue code.',
      'Common use cases include document processing pipelines, automated file organization, log analysis, and any workflow where an agent needs to persist or retrieve data locally. Most filesystem MCP servers include safety controls like path allowlisting to prevent agents from accessing sensitive system directories.',
      'Look for filesystem tools with clear permission models and explicit path scoping. The best implementations let you whitelist specific directories and block writes to system paths, so you can give agents broad read access while still limiting the blast radius of any mistakes.',
    ],
    metaTitle: 'Best Filesystem MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top filesystem MCP servers for AI agents: file read/write, directory management, and document access. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'filesystem MCP server, file access MCP, local file MCP server, directory MCP tool, file manager agent, document access AI',
    relatedCategories: ['database', 'mcp-server', 'data-processing'],
  },
  'search': {
    heading: 'Search & RAG MCP Servers',
    intro: [
      'Search and RAG MCP servers connect AI agents to semantic search engines, vector databases, and retrieval-augmented generation pipelines. These tools are the infrastructure layer that lets language models answer questions grounded in your own data — not just their training data.',
      'The category covers two types: web search tools (Brave Search, Tavily, SerpAPI) that give agents access to current information, and vector store tools (Pinecone, Weaviate, Qdrant, Chroma, Milvus) that enable semantic retrieval over private document collections. Both are essential for production AI applications.',
      'For RAG workloads, prioritize tools with chunking strategies, metadata filtering, and hybrid search (keyword + semantic). For web search, look for tools that return structured results with citations — raw HTML dumps are much harder for agents to work with than clean snippets.',
    ],
    metaTitle: 'Best Search & RAG MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top search and RAG MCP servers: Pinecone, Weaviate, Qdrant, Chroma, Brave Search, Tavily and more. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'RAG MCP server, vector database MCP, semantic search agent, Pinecone MCP, Weaviate MCP, Qdrant MCP, Chroma MCP, web search MCP tool',
    relatedCategories: ['database', 'data-processing', 'ai-models'],
  },
  'api-integration': {
    heading: 'API Integration MCP Servers',
    intro: [
      'API integration MCP servers give AI agents the ability to call third-party web services and REST APIs. Instead of writing custom HTTP clients for every service, these tools expose a standardized interface so agents can interact with external platforms through natural language instructions.',
      'This category spans everything from single-service connectors (GitHub, Jira, Notion, Linear, Salesforce) to general-purpose API execution tools that can call any HTTP endpoint. Multi-service platforms like Zapier and Make.com integrations are also common in this space.',
      'The best API integration tools handle auth transparently (OAuth flows, API key injection) and return structured data rather than raw JSON blobs. Agents work best when they receive typed, validated responses with clear field definitions — not unstructured API responses they have to interpret.',
    ],
    metaTitle: 'Best API Integration MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top API integration MCP servers for AI agents: GitHub, Jira, Notion, Salesforce, REST API tools and more. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'API integration MCP, REST API agent tool, GitHub MCP server, Jira MCP, Notion MCP, web service AI agent, HTTP MCP tool',
    relatedCategories: ['communication', 'mcp-server', 'monitoring'],
  },
  'browser-automation': {
    heading: 'Browser Automation MCP Servers',
    intro: [
      'Browser automation MCP servers give AI agents the ability to control web browsers programmatically. These tools enable language models to navigate websites, click buttons, fill forms, extract data, and take screenshots — without any human interaction required.',
      'Most browser automation MCP servers wrap Playwright, Puppeteer, or Selenium under a standardized tool interface. The agent describes what it wants to do in natural language ("click the login button", "extract all product prices"), and the MCP server translates that into browser commands. This makes web scraping, automated testing, and web-based research workflows dramatically easier to build.',
      'Key quality signals for browser automation tools: does it handle JavaScript-rendered content? Does it support headless mode? Does it expose screenshot tools for visual debugging? And critically — does it have anti-detection measures for scraping tasks that require it?',
    ],
    metaTitle: 'Best Browser Automation MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top browser automation MCP servers: Playwright MCP, Puppeteer MCP, web scraping tools for AI agents. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'browser automation MCP server, Playwright MCP, Puppeteer MCP, web scraping agent, headless browser MCP, Selenium MCP tool',
    relatedCategories: ['search', 'api-integration', 'mcp-server'],
  },
  'code-generation': {
    heading: 'Code Generation Tools',
    intro: [
      'Code generation tools and MCP servers give AI agents specialized capabilities for writing, transforming, and understanding code. These go beyond basic autocomplete — providing full function generation, test scaffolding, documentation writing, refactoring suggestions, and multi-file code synthesis.',
      'In the agent ecosystem, code generation tools often act as subagents within larger workflows. A higher-level orchestrator might delegate "write a unit test for this function" to a specialized code generation tool, then pass the result to a deployment tool. This composability is what makes agent frameworks powerful.',
      'When comparing code generation tools, look at language support breadth, context window handling (can it work with large files?), and whether it integrates with your existing development environment. Tools that also handle linting and formatting post-generation save significant iteration time.',
    ],
    metaTitle: 'Best Code Generation MCP Servers & Tools — Ranked by Real Signals',
    metaDescription: 'Top code generation MCP servers and AI tools: code synthesis, test generation, documentation tools. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'code generation MCP, AI code generator, code synthesis tool, test generation agent, code completion MCP, AI coding tool',
    relatedCategories: ['code-assistant', 'agent-framework', 'mcp-server'],
  },
  'deployment': {
    heading: 'Deployment & DevOps Tools',
    intro: [
      'Deployment and DevOps MCP servers give AI agents access to infrastructure, container orchestration, and CI/CD pipelines. These tools let language models check deployment status, trigger builds, manage containers, inspect cloud resources, and perform infrastructure operations — all through natural language.',
      'Common integrations include Docker, Kubernetes, GitHub Actions, GitLab CI, Terraform, Ansible, and major cloud platforms (AWS, GCP, Azure). The goal is enabling AI-assisted operations: agents that can diagnose deployment failures, suggest rollback strategies, and execute infrastructure changes under human supervision.',
      'Safety is the critical factor here. The best deployment MCP servers implement explicit confirmation steps for destructive operations, maintain audit logs of agent actions, and support dry-run modes that preview changes before applying them. Never give an agent unreviewed write access to production infrastructure.',
    ],
    metaTitle: 'Best Deployment & DevOps MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top deployment and DevOps MCP servers: Docker, Kubernetes, GitHub Actions, Terraform, cloud platform tools for AI agents. Ranked by stars, freshness, and real adoption.',
    keywords: 'deployment MCP server, DevOps AI agent, Kubernetes MCP, Docker MCP, CI/CD agent tool, Terraform MCP, GitHub Actions MCP',
    relatedCategories: ['monitoring', 'code-assistant', 'api-integration'],
  },
  'monitoring': {
    heading: 'Monitoring & Observability Tools',
    intro: [
      'Monitoring and observability MCP servers give AI agents access to system metrics, logs, alerts, and traces. These tools let language models query Prometheus metrics, read Grafana dashboards, triage Sentry errors, and analyze OpenTelemetry traces — enabling autonomous incident detection and response workflows.',
      'The most powerful use case is incident response: an agent that monitors for anomalies, identifies the likely root cause from correlated signals, and either auto-remediates or pages the right human with a structured diagnosis. This requires MCP servers that expose not just raw metrics but also alerting, threshold management, and correlation queries.',
      'For observability tooling, prioritize MCP servers with read-only safe modes for production environments, support for time-range queries, and the ability to correlate metrics with deployment events. The best tools make it trivial to answer "what changed right before the error rate spiked?"',
    ],
    metaTitle: 'Best Monitoring & Observability MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top monitoring MCP servers: Prometheus, Grafana, Datadog, Sentry, OpenTelemetry tools for AI agents. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'monitoring MCP server, observability AI agent, Prometheus MCP, Grafana MCP, Datadog MCP, Sentry MCP, OpenTelemetry MCP tool',
    relatedCategories: ['communication', 'deployment', 'api-integration'],
  },
  'communication': {
    heading: 'Communication MCP Servers',
    intro: [
      'Communication MCP servers give AI agents the ability to send messages, notifications, and emails through popular platforms. These tools close the loop on automated workflows — when an agent finishes a task, it can notify stakeholders via Slack, post a Discord update, send an email, or trigger a webhook.',
      'Coverage includes workspace messaging (Slack, Discord, Teams), email providers (SendGrid, Mailgun, SMTP), SMS/voice (Twilio), and generic webhook endpoints. Most communication MCP servers support both sending and reading — giving agents the ability to monitor incoming messages and respond to triggers.',
      'The most important quality factor for communication tools is reliability at scale. A tool that works fine for one message but fails under load, rate-limits silently, or drops messages without errors is worse than useless in production. Check the issue tracker for reports of silent failures before committing to a tool.',
    ],
    metaTitle: 'Best Communication MCP Servers — Ranked by Real Signals',
    metaDescription: 'Top communication MCP servers: Slack, Discord, email, Twilio, webhook tools for AI agents. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'Slack MCP server, Discord MCP, communication AI agent, email MCP tool, Twilio MCP, webhook notification agent, Teams MCP server',
    relatedCategories: ['monitoring', 'api-integration', 'mcp-server'],
  },
  'mcp-server': {
    heading: 'MCP Servers',
    intro: [
      'MCP servers are tools that extend AI agents using the Model Context Protocol — an open standard developed by Anthropic that defines how language models connect to external capabilities. An MCP server runs as a local process and exposes typed tools, resources, and prompts that any MCP-compatible client (Claude, Cursor, VS Code Copilot, Cline, Windsurf) can call.',
      'This category covers general-purpose MCP servers that don\'t fit neatly into more specific categories — tools for time and date access, system information, calculator utilities, unit conversion, and other broadly useful capabilities. Think of them as the Unix utilities of the agent ecosystem.',
      'The MCP ecosystem is growing fast: thousands of servers are now indexed on AgentRank, spanning databases, browsers, filesystems, APIs, and communication platforms. If you\'re evaluating which MCP server to use for a specific task, start with the more specialized category pages where tools are ranked and compared within their domain.',
    ],
    metaTitle: 'Best MCP Servers — Ranked by Real Signals | AgentRank',
    metaDescription: 'Top MCP servers for AI agents: general-purpose tools ranked by stars, freshness, issue health, and real adoption. The definitive index of Model Context Protocol servers.',
    keywords: 'MCP server list, model context protocol tools, best MCP servers 2026, MCP server ranking, Claude MCP tools, Cursor MCP extensions',
    relatedCategories: ['database', 'browser-automation', 'agent-framework', 'search'],
  },
  'agent-framework': {
    heading: 'Agent Frameworks & SDKs',
    intro: [
      'Agent frameworks and SDKs are the infrastructure for building multi-agent systems. These tools provide orchestration primitives — task routing, memory management, tool calling, agent-to-agent communication, and workflow state — so developers don\'t have to implement these from scratch for every application.',
      'The ecosystem spans a spectrum from lightweight SDK wrappers (a thin abstraction over LLM APIs with tool calling) to full orchestration platforms (visual workflow builders, multi-agent routing, human-in-the-loop checkpoints). Choose based on how much control you need versus how fast you want to ship.',
      'Key signals when evaluating agent frameworks: does it support multiple LLM backends? How does it handle failures and retries? Does it have an observability story (tracing, logging, cost tracking)? Is there a path from prototype to production without a full rewrite? The best frameworks make the easy cases easy and the hard cases possible.',
    ],
    metaTitle: 'Best AI Agent Frameworks & SDKs — Ranked by Real Signals',
    metaDescription: 'Top AI agent frameworks and SDKs: multi-agent orchestration, LLM workflow tools ranked by stars, freshness, and real adoption. Build production AI agents.',
    keywords: 'AI agent framework, multi-agent orchestration, LLM agent SDK, agent workflow tool, autonomous agent library, AI agent builder',
    relatedCategories: ['llm-client', 'mcp-server', 'code-assistant'],
  },
  'llm-client': {
    heading: 'LLM Clients & Gateways',
    intro: [
      'LLM clients, gateways, and routers provide a unified interface for interacting with multiple AI model providers. These tools let developers and agents switch between OpenAI, Anthropic, Mistral, Google, and open-source models through a single API — enabling cost optimization, fallback routing, load balancing, and model comparison.',
      'The category includes both SDK-level clients (thin wrappers around provider APIs) and full gateway deployments (proxy servers that add rate limiting, caching, cost tracking, and observability on top of raw model calls). LiteLLM is the dominant open-source option, with commercial alternatives like Portkey and Helicone for teams needing managed infrastructure.',
      'Key features to evaluate: OpenAI-compatible API surface (so existing code works with zero changes), streaming support, token usage tracking, retry logic, and semantic caching. For production deployments, look for tools with Redis caching support to reduce costs on repeated queries.',
    ],
    metaTitle: 'Best LLM Clients & Gateways — Ranked by Real Signals',
    metaDescription: 'Top LLM clients, gateways, and routers: LiteLLM, model proxy tools ranked by stars, freshness, and real adoption. Unified interface for all AI models.',
    keywords: 'LLM gateway, AI proxy server, OpenAI compatible API, LiteLLM, model router, LLM client library, AI gateway tool',
    relatedCategories: ['agent-framework', 'ai-models', 'mcp-server'],
  },
  'code-assistant': {
    heading: 'Code Assistants',
    intro: [
      'Code assistant tools in the agent ecosystem are specialized for software development workflows: repository analysis, code review, PR automation, test generation, linting, and CI/CD pipeline management. These differ from general code generation tools in that they\'re deeply integrated with development environments and version control.',
      'Common patterns include GitHub-integrated tools that can read and write to repositories, tools that wrap language server protocols for semantic code understanding, and tools that integrate with package managers to automate dependency updates. The best code assistants understand code context at the project level, not just the file level.',
      'When evaluating code assistants, look for language server integration (for semantic understanding beyond text), repository-level context (can it understand the whole codebase?), and safety controls for write operations (especially for tools that open PRs or push commits automatically).',
    ],
    metaTitle: 'Best AI Code Assistant Tools — Ranked by Real Signals',
    metaDescription: 'Top AI code assistant tools: GitHub integration, code review, test generation, CI/CD tools ranked by stars, freshness, and real adoption.',
    keywords: 'AI code assistant, code review agent, GitHub MCP tool, test generation AI, CI/CD agent, code automation tool, developer AI agent',
    relatedCategories: ['code-generation', 'agent-framework', 'deployment'],
  },
  'data-processing': {
    heading: 'Data Processing Tools',
    intro: [
      'Data processing MCP servers and tools connect AI agents to data pipeline infrastructure: Apache Kafka streams, Spark clusters, dbt models, Airflow DAGs, and ETL workflows. These tools enable a new class of AI-assisted data engineering where agents can monitor, debug, and even modify data pipelines in response to natural language instructions.',
      'Beyond traditional data engineering tools, this category includes document processing utilities (PDF extraction, OCR, format conversion) and data transformation tools that let agents reshape structured data between formats. These are the plumbing that makes AI-powered analytics workflows possible.',
      'Data processing tools often require careful permissioning — an agent with write access to a production Kafka topic or dbt project can cause serious downstream damage. Look for tools with dry-run modes, explicit schema validation, and audit logging before granting write access in production environments.',
    ],
    metaTitle: 'Best Data Processing MCP Servers & Tools — Ranked by Real Signals',
    metaDescription: 'Top data processing tools: Kafka, Spark, dbt, ETL pipeline tools for AI agents. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'data pipeline MCP server, ETL agent tool, Kafka MCP, dbt MCP, Airflow MCP, data processing AI, data transformation agent',
    relatedCategories: ['database', 'search', 'monitoring'],
  },
  'ai-models': {
    heading: 'AI Model Providers & Inference Tools',
    intro: [
      'AI model provider tools give agents programmatic access to language models, embedding models, image generators, and speech services. These range from official provider SDKs (OpenAI, Anthropic, Google) to local inference tools (Ollama, llama.cpp, LM Studio) that run models on your own hardware.',
      'In multi-agent architectures, model provider tools often serve as the "brain" that other specialized agents call. An orchestrator might use a fast, cheap model for routing decisions while delegating complex reasoning tasks to a more capable model — all through a unified model provider interface.',
      'Local inference tools deserve special attention: Ollama in particular has become the standard for running open models (Llama, Mistral, Phi, Gemma) locally. This matters for privacy-sensitive workloads, offline operation, and cost control at scale. The tradeoff is hardware requirements and latency vs. API-based models.',
    ],
    metaTitle: 'Best AI Model Provider Tools — Ranked by Real Signals',
    metaDescription: 'Top AI model provider tools: Ollama, local LLM runners, OpenAI/Anthropic SDK tools ranked by stars, freshness, and real adoption signals.',
    keywords: 'AI model MCP server, Ollama MCP, local LLM tool, model inference agent, OpenAI SDK tool, Anthropic MCP, embedding model tool',
    relatedCategories: ['llm-client', 'agent-framework', 'search'],
  },
  'ai-tool': {
    heading: 'AI Tools',
    intro: [
      'General AI tools cover a broad range of capabilities that enhance language model workflows without fitting neatly into more specific categories. These include AI utility tools, specialized model wrappers, AI-powered content processors, and experimental tools at the frontier of what agents can do.',
      'This is the most diverse category in the AgentRank index — and often where the most innovative tools appear first. New use cases that don\'t yet have a dedicated category show up here before the ecosystem converges on naming conventions and standard patterns.',
      'When browsing AI tools, the AgentRank score is especially useful as a quality signal since the category is heterogeneous. A high score (especially high dependents + high freshness) is a strong indicator that a tool has found real-world product-market fit, even in a nascent category.',
    ],
    metaTitle: 'Best AI Tools — Ranked by Real Signals | AgentRank',
    metaDescription: 'Top general AI tools and utilities for agents: diverse AI capabilities ranked by stars, freshness, and real adoption. Discover emerging AI tools.',
    keywords: 'AI agent tools, AI utilities, LLM tools, AI automation, agent tool library, AI capability tools',
    relatedCategories: ['mcp-server', 'agent-framework', 'llm-client'],
  },
  'other': {
    heading: 'Other Tools',
    intro: [
      'Tools in this category don\'t match any of the primary AgentRank classification patterns but are still part of the broader agent and MCP ecosystem. Check back as classification improves — many tools here will migrate to more specific categories as the index grows.',
    ],
    metaTitle: 'Other Agent Tools — AgentRank',
    metaDescription: 'Miscellaneous agent tools and MCP servers indexed by AgentRank. Ranked by stars, freshness, and real adoption signals.',
    keywords: 'agent tools, MCP tools, AI tools misc',
    relatedCategories: ['mcp-server', 'ai-tool'],
  },
};

export function classifyTool(tool: {
  description: string | null;
  matched_queries: string[];
  github_topics?: string[];
  full_name: string;
}): string {
  const text = [
    tool.description || '',
    (tool.github_topics || []).join(' '),
    tool.full_name,
  ].join(' ').toLowerCase();

  const queries = (tool.matched_queries || []).join(' ').toLowerCase();

  // Agent framework / SDK (check before MCP server)
  if (/\b(multi[- ]?agent|orchestrat|workflow)\b/.test(text) ||
      /a2a/.test(queries) ||
      /\b(sdk|framework|library|toolkit)\b.*\b(mcp|agent|llm)\b|\b(mcp|agent|llm)\b.*\b(sdk|framework|library|toolkit)\b/.test(text)) {
    return 'agent-framework';
  }

  // Browser automation
  if (/\b(playwright|puppeteer|selenium|headless.*browser|browser.*automat|web.*scrape|scraping)\b/.test(text)) {
    return 'browser-automation';
  }

  // Database
  if (/\b(postgres|postgresql|mysql|sqlite|mongodb|redis|cassandra|supabase|neon|planetscale|cockroach|turso|libsql|database.*server|sql.*server)\b/.test(text)) {
    return 'database';
  }

  // Filesystem
  if (/\b(filesystem|file.*system|local.*file|file.*access|file.*manager|directory.*list|read.*write.*file|file.*server)\b/.test(text)) {
    return 'filesystem';
  }

  // Search / RAG / Vector
  if (/\b(vector.*store|vector.*db|embedding.*search|semantic.*search|rag\b|retrieval.*augment|pinecone|weaviate|qdrant|chroma|milvus|opensearch|elasticsearch)\b/.test(text)) {
    return 'search';
  }

  // Monitoring / Observability
  if (/\b(prometheus|grafana|datadog|sentry|opentelemetry|otel|observability|telemetry|tracing)\b/.test(text)) {
    return 'monitoring';
  }

  // Communication
  if (/\b(slack|discord|telegram|twilio|sendgrid|mailgun|smtp|email.*send|send.*email|webhook.*notif)\b/.test(text)) {
    return 'communication';
  }

  // LLM Client / Gateway
  if (/\b(litellm|llm.*gateway|llm.*proxy|llm.*router|ai.*gateway|openai.*compat|model.*router)\b/.test(text)) {
    return 'llm-client';
  }

  // AI model providers / local inference
  if (/\b(ollama|llama\.cpp|lm.?studio|hugging.?face.*model|mistral.*api|openai.*api|anthropic.*api|gemini.*api|model.*inference|inference.*server|local.*llm|run.*model)\b/.test(text)) {
    return 'ai-models';
  }

  // Deployment / DevOps
  if (/\b(docker|kubernetes|k8s\b|helm\b|terraform|ansible|github.*actions|gitlab.*ci|ci.*cd|infrastructure.*as.*code|container.*deploy|cloud.*deploy)\b/.test(text)) {
    return 'deployment';
  }

  // Code generation
  if (/\b(code.*gen|generat.*code|scaffold|boilerplate|code.*synthesis|codegen|generate.*function|generate.*test)\b/.test(text)) {
    return 'code-generation';
  }

  // API Integration
  if (/\b(rest.*api|graphql.*api|openapi|swagger|webhook.*integr|api.*integr|zapier|n8n\b|make\.com|api.*connect)\b/.test(text)) {
    return 'api-integration';
  }

  // Data processing
  if (/\b(apache.*kafka|apache.*spark|apache.*airflow|dbt\b|etl\b|data.*pipeline|data.*ingestion|data.*transform)\b/.test(text)) {
    return 'data-processing';
  }

  // MCP server (catch-all for MCP-tagged tools)
  if (/mcp|model.*context.*protocol/.test(queries)) {
    return 'mcp-server';
  }

  return 'ai-tool';
}

export function classifySkill(skill: {
  description: string | null;
  name: string | null;
  slug: string;
  source: string;
}): string {
  const text = [
    skill.description || '',
    skill.name || '',
    skill.slug,
  ].join(' ').toLowerCase();

  // Browser automation
  if (/\b(playwright|puppeteer|selenium|browser.*use|browser.*automat|web.*scrape|headless)\b/.test(text)) {
    return 'browser-automation';
  }

  // Database
  if (/\b(postgres|postgresql|mysql|sqlite|mongodb|redis|supabase|neon|database)\b/.test(text)) {
    return 'database';
  }

  // Search / RAG
  if (/\b(vector.*store|vector.*db|semantic.*search|rag\b|embedding|pinecone|weaviate|qdrant|chroma)\b/.test(text)) {
    return 'search';
  }

  // Monitoring
  if (/\b(prometheus|grafana|datadog|sentry|opentelemetry|observability|telemetry|tracing)\b/.test(text)) {
    return 'monitoring';
  }

  // Communication
  if (/\b(slack|discord|telegram|twilio|sendgrid|email.*send|webhook)\b/.test(text)) {
    return 'communication';
  }

  // Agent framework
  if (/\b(framework|orchestrat|multi[- ]?agent|workflow.*agent|agent.*workflow)\b/.test(text)) {
    return 'agent-framework';
  }

  // MCP server — Glama source is MCP servers
  if (skill.source === 'glama' || /\b(mcp|model.*context.*protocol)\b/.test(text)) {
    return 'mcp-server';
  }

  // Code assistant
  if (/\b(github|copilot|lint|linting|test.*run|ci.*cd|deploy|turborepo|eslint|prettier)\b/.test(text)) {
    return 'code-assistant';
  }

  return 'ai-tool';
}

export function getCategoryFromQueries(matchedQueries: string[]): string {
  for (const q of matchedQueries) {
    if (q.toLowerCase().includes('mcp server') || q.toLowerCase().includes('model context protocol')) return 'MCP server';
    if (q.toLowerCase().includes('a2a agent')) return 'A2A agent';
    if (q.toLowerCase().includes('agent tool')) return 'agent tool';
    if (q.toLowerCase().includes('agent framework')) return 'agent framework';
  }
  return 'tool';
}

export function generateToolSummary(tool: {
  full_name: string;
  description: string | null;
  language: string | null;
  license: string | null;
  matched_queries: string[];
  github_topics?: string[];
}): string {
  const category = getCategoryFromQueries(tool.matched_queries);
  const lang = tool.language ? `${tool.language} ` : '';
  const lic = tool.license && tool.license !== 'NOASSERTION' ? ` licensed under ${tool.license}` : '';

  let summary = `${tool.full_name} is a ${lang}${category}${lic}.`;

  if (tool.description) {
    summary += ` ${tool.description}`;
  }

  const topics = tool.github_topics || [];
  if (topics.length > 0) {
    summary += ` Topics: ${topics.join(', ')}.`;
  }

  return summary;
}

export function generateSkillSummary(skill: {
  name: string;
  description: string | null;
  source: string;
  author: string | null;
  platforms: string[];
  stars?: number;
  issueHealth?: number;
}): string {
  const sourceLabel = skill.source === 'skills.sh' ? 'skills.sh' : skill.source === 'glama' ? 'Glama' : skill.source === 'clawhub' ? 'ClawHub' : skill.source;

  // Deduplicate author — skip "by X" if the name already contains the author
  const nameLC = skill.name.toLowerCase();
  const authorLC = skill.author?.toLowerCase() ?? '';
  const authorPart = skill.author && !nameLC.includes(authorLC) ? ` by ${skill.author}` : '';

  let summary = `${skill.name} is a ${sourceLabel} skill${authorPart}.`;

  if (skill.description) {
    summary += ` ${skill.description}`;
  }

  // Add quality signal sentence
  const signals: string[] = [];
  if (skill.stars !== undefined && skill.stars > 0) {
    const formatted = skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1).replace(/\.0$/, '')}K` : `${skill.stars}`;
    signals.push(`${formatted} stars`);
  }
  if (skill.issueHealth !== undefined && skill.issueHealth > 0) {
    signals.push(`${Math.round(skill.issueHealth * 100)}% issue closure rate`);
  }
  if (signals.length > 0) {
    summary += ` Actively maintained with ${signals.join(' and ')}.`;
  }

  if (skill.platforms.length > 0) {
    const top3 = skill.platforms.slice(0, 3).join(', ');
    const extra = skill.platforms.length > 3 ? ` and ${skill.platforms.length - 3} more` : '';
    summary += ` Available on ${skill.platforms.length} platform${skill.platforms.length !== 1 ? 's' : ''} including ${top3}${extra}.`;
  }

  return summary;
}

export function generateContextSentences(item: {
  rank: number;
  score: number;
  stars?: number;
  dependents?: number;
  contributors?: number;
  last_commit_at?: string;
}, totalCount: number): string[] {
  const sentences: string[] = [];

  sentences.push(`Ranked #${item.rank} out of ${totalCount} indexed ${item.stars !== undefined ? 'tools' : 'skills'}.`);

  const topPercent = Math.ceil((item.rank / totalCount) * 100);
  if (topPercent <= 10) {
    sentences.push(`In the top ${topPercent}% of all indexed ${item.stars !== undefined ? 'tools' : 'skills'}.`);
  }

  if (item.stars !== undefined && item.stars >= 1000) {
    sentences.push(`Has ${item.stars.toLocaleString('en-US')} GitHub stars.`);
  }

  if (item.dependents !== undefined && item.dependents >= 10) {
    sentences.push(`Used by ${item.dependents.toLocaleString('en-US')} other projects.`);
  }

  if (item.contributors !== undefined && item.contributors >= 10) {
    sentences.push(`Has ${item.contributors} contributors.`);
  }

  if (item.last_commit_at) {
    const days = Math.floor((Date.now() - new Date(item.last_commit_at).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) {
      sentences.push('Actively maintained with commits in the last week.');
    }
  }

  return sentences;
}

export function getLicenseClass(license: string | null): 'permissive' | 'copyleft' | 'missing' {
  if (!license || license === 'NOASSERTION') return 'missing';
  if (PERMISSIVE_LICENSES.includes(license)) return 'permissive';
  return 'copyleft';
}

export function generateToolJsonLd(tool: {
  full_name: string;
  url: string;
  description: string | null;
  language: string | null;
  license: string | null;
  score: number;
  last_commit_at: string;
  matched_queries: string[];
  github_topics?: string[];
}, pageUrl: string): object {
  const topics = tool.github_topics || [];
  const keywords = [...new Set([...tool.matched_queries, ...topics])];

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.full_name,
    description: tool.description || `Agent tool: ${tool.full_name}`,
    url: pageUrl,
    codeRepository: tool.url,
    programmingLanguage: tool.language || undefined,
    license: tool.license || undefined,
    dateModified: tool.last_commit_at,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.score.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      ratingCount: 1,
    },
  };
}

export function generateSkillJsonLd(skill: {
  name: string;
  slug: string;
  description: string | null;
  source: string;
  author: string | null;
  score: number;
  platforms: string[];
}, pageUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.description || `AI skill: ${skill.name}`,
    url: pageUrl,
    author: skill.author ? { '@type': 'Person', name: skill.author } : undefined,
    applicationCategory: 'AI Agent Skill',
    operatingSystem: skill.platforms.join(', ') || undefined,
    keywords: `${skill.source}, AI skill, agent skill`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: skill.score.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      ratingCount: 1,
    },
  };
}
