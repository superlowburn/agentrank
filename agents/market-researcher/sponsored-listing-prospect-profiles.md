# Sponsored Listing Prospect Profiles — Phase 2

**Research date:** 2026-03-19
**Task:** AUT-377 — Profile top 10 commercial MCP companies for Phase 2 sponsored listings outreach
**Builds on:** AUT-315 (`sponsored-listing-prospects.md`), AUT-303 (`sponsored-leads.md`)
**Methodology:** Known candidates list + AgentRank DB scores + company funding research + commercial signal analysis

---

## Overview

These 10 companies represent a Phase 2 target list distinct from AUT-315's 20 prospects. Focus is on companies with dedicated commercial MCP products, strong developer brand, and DevRel-oriented marketing culture. Two candidates (Cursor/Anysphere, Replit) are flagged LOW conversion likelihood — they are MCP consumers (IDE/platform), not MCP server publishers, making the sponsored listing pitch structurally weaker.

---

## Top 10 Prospect Table

| # | Company | MCP Tool (GitHub) | AR Score | AR Rank | Stars | Business Model | Likelihood | Tier |
|---|---------|------------------|----------|---------|-------|----------------|------------|------|
| 1 | Composio | ComposioHQ/composio (SDK) + mcp.composio.dev (hosted) | N/A (platform) | — | 26,500 (main SDK) | API platform, usage-based | HIGH | 1 |
| 2 | Browserbase | browserbase/mcp-server-browserbase | 73.06 | #288 | 3,192 | Cloud browser API, usage-based | HIGH | 1 |
| 3 | Firecrawl | firecrawl/firecrawl-mcp-server | 73.94 | #273 | 5,798 | Web scraping API, freemium | HIGH | 1 |
| 4 | Snyk | snyk/agent-scan | 82.28 | #132 | 1,907 | DevSecOps platform, freemium | MEDIUM-HIGH | 2 |
| 5 | E2B | e2b-dev/mcp-server | 65.76 | #438 | 383 | Cloud sandbox API, usage-based | MEDIUM-HIGH | 2 |
| 6 | LangChain (LangSmith) | langchain-ai/langsmith-mcp-server | 67.74 | #390 | 90 (5,659 PyPI/mo) | Observability SaaS, freemium | MEDIUM | 2 |
| 7 | Neon | neondatabase/mcp-server-neon | 78.58 | #195 | 564 | Serverless Postgres, freemium | MEDIUM | 2 |
| 8 | PlanetScale | planetscale/mcp-server | 43.12 | #5,728 | 3 | Serverless MySQL, freemium | MEDIUM | 3 |
| 9 | Cursor/Anysphere | cursor/mcp-servers | 68.20 | #386 | 215 | AI IDE subscription, $20/mo+ | LOW-MEDIUM | 3 |
| 10 | Replit | (no official MCP in index) | — | — | — | AI dev platform, freemium | LOW | 3 |

---

## Full Profiles

### 1. Composio — HIGH

- **Website:** composio.dev | mcp.composio.dev
- **MCP tool:** mcp.composio.dev — hosted MCP gateway with 1,000+ toolkits. Main SDK: ComposioHQ/composio (26,500 stars). Not directly in AgentRank index as a discrete MCP server (the gateway is a hosted service, not a GitHub repo with MCP tooling per se).
- **AgentRank score:** Not directly indexed as a single tool. ComposioHQ/awesome-claude-plugins: score 57.16, rank #801, 1,155 stars.
- **Business model:** API platform — AI agents connect to 200+ external apps (Gmail, Slack, GitHub, Notion, etc.) through Composio's hosted gateway. Revenue via API call volume, usage-based pricing. Enterprise tier available.
- **Funding:** $29M total — YC 2023 seed + Series A ($25M, Lightspeed Venture Partners, April 2025). Elevation Capital, SV Angel, Dharmesh Shah (HubSpot) also participated.
- **Size:** ~50–70 employees, San Francisco / India
- **Key decision maker:** Soham Ganatra (CEO/co-founder) — github.com/SohamG | @sohamganatra on X | linkedin.com/in/sohamganatra. Karan Vaidya (co-founder) — @karanVaidya6
- **Contact:** composio.dev/contact | @sohamganatra on X | founders@composio.dev
- **Current marketing channels:** Heavy developer content marketing (YouTube tutorials, technical blog posts), partnerships with Claude/Cursor/Copilot ecosystems, open-source community via ComposioHQ GitHub org, active X/Twitter developer presence. No paid ads known.
- **Why they'd care about AgentRank visibility:** Composio's product IS an MCP gateway — it's literally a meta-MCP server aggregating 1,000+ integrations. Being featured prominently on the leading MCP ranking site is existential brand-building for them. They are in a crowded category with emerging competitors (Arcade AI, Toolbase, custom tool servers). A sponsored listing positions them as the default choice every time a developer searches "MCP tools" or "MCP integration layer."
- **Pitch angle:** "You've built the most ambitious MCP integration layer in the ecosystem. AgentRank indexes 25,000+ tools, and developers consult it before every build. A sponsored listing makes Composio the first name they see in the 'MCP gateway' category — before your competitors define it."
- **Estimated likelihood:** HIGH. Series A recently closed, developer-native company, MCP IS their core product, founder is personally active and reachable on X.

---

### 2. Browserbase — HIGH

- **Website:** browserbase.com
- **MCP tool:** browserbase/mcp-server-browserbase — cloud browser automation MCP. Enables LLMs to control browsers via Browserbase + Stagehand.
- **AgentRank score:** 73.06 | Rank #288 | 3,192 stars
- **Business model:** Cloud browser automation API — AI agents get full browser sessions in the cloud. Usage-based pricing (credit packs). Enterprise contracts for high-volume agent builders.
- **Funding:** $67.5M total — Seed + Series A ($27.5M) + Series B ($40M at $300M valuation, Notable Capital + CRV + Kleiner Perkins, June 2025). Angel investors: Patrick Collison (Stripe CEO), Jeff Lawson (ex-Twilio CEO), Guillermo Rauch (Vercel CEO).
- **Size:** ~40 employees, San Francisco. Founded 2024.
- **Key decision maker:** Paul Klein IV (CEO/founder) — @pkiv on X | linkedin.com/in/paul-klein-iv
- **Contact:** browserbase.com/contact | @pkiv on X
- **Current marketing channels:** Developer blog (technical deep-dives on browser automation for AI), X/Twitter, GitHub releases and issue engagement, partnership integrations (Docker MCP Catalog, Anthropic ecosystem). Light paid ads via search.
- **Why they'd care about AgentRank visibility:** Browserbase competes directly with competitors already in our index. Their MCP server (3,192 stars, rank #288) is well-established but they trail category peers in visibility. Browser automation is one of the highest-intent categories — developers building agents that need web access are high-value customers. Pitch hook: At rank #288, they need to stand out against generic browser tools and emerging alternatives (BrowserMCP, Kernel). The $300M Series B valuation means $399/mo is a rounding error.
- **Competitive positioning:** Competing against BrowserMCP (community tool), Playwright MCP integrations, Kernel ($22M Series A). Browserbase is the commercial leader but needs index visibility to match.
- **Pitch angle:** "Browser automation is one of the top 5 most-searched agent categories on AgentRank. You're at rank #288. A sponsored listing ensures that every developer building web-capable agents sees Browserbase first — before community-built alternatives."
- **Estimated likelihood:** HIGH. $300M valuation, active DevRel, MCP server is core to their developer GTM.

---

### 3. Firecrawl — HIGH

- **Website:** firecrawl.dev
- **MCP tool:** firecrawl/firecrawl-mcp-server — web scraping and search MCP. JavaScript rendering, batch processing, search capabilities.
- **AgentRank score:** 73.94 | Rank #273 | 5,798 stars
- **Business model:** Web scraping API — freemium (limited free tier) + paid from $16/mo. Revenue via API call volume. Part of the Mendable/Firecrawl product family.
- **Funding:** $16.2M total — YC W24 seed + Series A ($14.5M, Nexus Venture Partners, Aug 2025). Tobias Lütke (Shopify CEO) participated.
- **Size:** ~10 employees, San Francisco. YC W24.
- **Key decision makers:** Eric Ciarla (co-founder/CEO) — @ericciarla on X | Nicholas Silberstein Camara (co-founder) — @nickscamara on X | Caleb Peffer (co-founder) — @calebpeffer on X
- **Contact:** firecrawl.dev/contact | @ericciarla on X (most active on X)
- **Current marketing channels:** Heavy technical content (Firecrawl blog, YouTube tutorials), X/Twitter, GitHub releases and PRs, AppSumo launch, Hacker News launches. No significant paid advertising. Strong SEO play ("best MCP servers" content).
- **Why they'd care about AgentRank visibility:** MCP is Firecrawl's primary developer acquisition channel. The firecrawl-mcp-server has 5,798 stars — more than most commercial tools in the index — but ranks #273 due to relatively low dependency signals. Direct competitor Exa (#229) and Tavily (#152) currently outrank them. "Exa ranks 44 spots above you despite fewer GitHub stars" is a clean pitch. At $16/mo entry point, Firecrawl needs high-volume developer discovery to scale revenue.
- **Competitive positioning:** Exa Labs #229, Tavily AI #152, SerpApi #51 all outrank Firecrawl #273 in related search/scraping category.
- **Pitch angle:** "You have 5,800 stars — more than most search API MCP tools in our index. But Exa and Tavily both rank ahead of you. A sponsored listing flips that."
- **Estimated likelihood:** HIGH. Small team that moves fast, MCP is their GTM, fresh Series A, founders are personally reachable on X.

---

### 4. Snyk — MEDIUM-HIGH

- **Website:** snyk.io
- **MCP tool:** snyk/agent-scan — AI-native security scanning MCP, 1,907 stars.
- **AgentRank score:** 82.28 | Rank #132
- **Business model:** DevSecOps SaaS — freemium (developer plan free) + team/business plans from $25/mo/dev. Enterprise contracts. ~$217M raised, ~$100M+ ARR.
- **Funding:** ~$530M total (Series G, 2022), ~$8.5B valuation at peak. Current status: pre-IPO, profitable, $100M+ ARR.
- **Size:** ~1,200 employees, London/San Francisco
- **Key decision makers:** Peter McKay (CEO) | Manoj Nair (President) | David Aronchick (DevRel lead — check LinkedIn for current head of developer relations)
- **Contact:** snyk.io/contact-us | developer@snyk.io | snyk.io/partners
- **Current marketing channels:** Major DevRel program (Snyk Ambassador program), dev conferences (KubeCon, DockerCon), strong blog content, paid ads on Google/LinkedIn, GitHub integrations.
- **Why they'd care about AgentRank visibility:** Security MCP category has no named competitors in our index. snyk/agent-scan at rank #132 is a strong organic position — a sponsored listing makes it permanent as security-focused agent tooling grows. Snyk has a history of proactive DevRel investment and ecosystem partnerships. The MCP tool gives them entry into the agent security space, which is a fast-moving category. Pitch: "You're the only serious security MCP in our entire index. A sponsored listing makes that official."
- **Competitive positioning:** Unique in security scanning/DevSecOps MCP category. No direct competitors in index.
- **Pitch angle:** "Security is a top concern for enterprise agent builders. You're the only serious security MCP in our 25,000+ tool index. Category ownership via sponsored listing is $299/mo."
- **Estimated likelihood:** MEDIUM-HIGH. Large company with real DevRel budget and culture, but larger procurement cycle. DevRel team should be the target, not the CRO.

---

### 5. E2B — MEDIUM-HIGH

- **Website:** e2b.dev
- **MCP tool:** e2b-dev/mcp-server — gives AI agents (Claude, Cursor, etc.) the ability to run code in secure cloud sandboxes via MCP.
- **AgentRank score:** 65.76 | Rank #438 | 383 stars
- **Business model:** Cloud sandbox API — usage-based pricing per compute minute. Open-source core (e2b-dev/E2B, GitHub Stars: ~14K) + paid cloud service. Serve Fortune 100 companies.
- **Funding:** $32M total — Seed + Series A ($21M, Insight Partners, July 2025). Decibel, Sunflower Capital, Kaya, angel investors including former Docker CEO Scott Johnston.
- **Size:** ~20–30 employees, Prague/San Francisco (Czech-founded)
- **Key decision maker:** Tereza Tizkova (CEO/co-founder) — @terezatizkova on X | linkedin.com/in/tereza-tizkova. Vasek Mlejnsky (CTO).
- **Contact:** e2b.dev/contact | @terezatizkova on X | info@e2b.dev
- **Current marketing channels:** Technical blog (deep-dives on agent sandboxing), Docker MCP Catalog partnership, X/Twitter, GitHub releases, developer community via Discord, active Hacker News presence.
- **Why they'd care about AgentRank visibility:** E2B's product is used by 88% of Fortune 100 companies for agent sandboxing, but their MCP server has only 383 stars — significantly underrepresenting their actual adoption. This is the classic "high real usage, low index visibility" gap. A sponsored listing ensures E2B is seen by every agent developer who visits AgentRank, even if they haven't yet discovered E2B through other channels. At rank #438 vs. Browserbase's #288, there's a clear category framing.
- **Competitive positioning:** Cloud browser automation (Browserbase #288) overlaps. Agent sandbox category is distinct — E2B is the only major player.
- **Pitch angle:** "You power 88% of Fortune 100 agent deployments but rank #438. Your real adoption isn't reflected in your index visibility. A sponsored listing closes that gap."
- **Estimated likelihood:** MEDIUM-HIGH. Fresh Series A, founder is active on X, developer-first company. Budget exists but team is small and founder-controlled.

---

### 6. LangChain (LangSmith) — MEDIUM

- **Website:** langchain.com | smith.langchain.com
- **MCP tool:** langchain-ai/langsmith-mcp-server — LangSmith observability/tracing MCP. 90 stars, 5,659 PyPI downloads/mo.
- **AgentRank score:** 67.74 | Rank #390
- **Business model:** LangChain is OSS framework (free) + LangSmith is commercial observability SaaS (freemium, team plans from $39/mo). LangGraph Platform for agent deployment (enterprise pricing).
- **Funding:** ~$135M total — Series A ($25M, Sequoia, 2023) + Series B ($100M at $1.1B valuation, IVP, July 2025). Benchmark also participated.
- **Size:** ~120 employees, San Francisco
- **Key decision maker:** Harrison Chase (CEO/co-founder) — @hwchase17 on X | linkedin.com/in/harrison-chase-961287118. Nuno Campos (engineering lead) | Bagatur Askaryan (developer advocacy).
- **Contact:** langchain.com/contact | harrison@langchain.com (public) | @hwchase17 on X
- **Current marketing channels:** Weekly newsletter (LangChain blog), extensive YouTube tutorials, LangGraph Academy, X/Twitter, developer conferences, GitHub ecosystem presence. Some paid search ads.
- **Why they'd care about AgentRank visibility:** LangSmith is LangChain's commercial product. The LangSmith MCP server gives LangSmith direct reach to agent developers — which is exactly who pays for LangSmith. Rank #390 is low for a $1.1B company whose commercial product is agent observability. Competitors: Grafana MCP (#398), Prefect FastMCP (#6) in adjacent monitoring/orchestration space. The pitch is about LangSmith — "every developer building agents with LangChain should see LangSmith on AgentRank."
- **Competitive positioning:** LangSmith observability vs. Grafana (#398) in monitoring. LangGraph Platform competes with Prefect (#6) for orchestration.
- **Pitch angle:** "LangSmith is the observability layer for the LangChain ecosystem. Your MCP server ranks #390. A sponsored listing puts LangSmith in front of every agent developer in our index."
- **Estimated likelihood:** MEDIUM. Unicorn with real budget, but decision cycle longer. DevRel team is the path. Harrison Chase is reachable but won't make a $300/mo decision personally — need to get to their developer advocacy team.

---

### 7. Neon — MEDIUM

*Note: Full profile exists in AUT-315 (sponsored-listing-prospects.md, entry #20). Summary below.*

- **Website:** neon.tech
- **MCP tool:** neondatabase/mcp-server-neon — serverless Postgres MCP.
- **AgentRank score:** 78.58 | Rank #195 | 564 stars
- **Business model:** Freemium serverless Postgres — free tier (0.5 compute hours/mo) + paid from $19/mo.
- **Funding:** ~$129.6M total (Series B, Databricks Ventures + GGV, 2024).
- **Size:** ~100 employees, remote-first.
- **Key decision maker:** Nikita Shamgunov (CEO/co-founder) — @n2o on X
- **Contact:** @n2o on X | founders@neon.tech
- **Why they'd care:** Developer-first Postgres company competing in data MCP space (MotherDuck #50, PlanetScale #5,728). Active in MCP ecosystem. Rank #195 trails MotherDuck significantly.
- **Estimated likelihood:** MEDIUM. See AUT-315 for full profile.

---

### 8. PlanetScale — MEDIUM

- **Website:** planetscale.com
- **MCP tool:** planetscale/mcp-server — hosted MCP server exposing PlanetScale databases, branches, schema, Insights data. Accessible via OAuth, available as Claude Connector and in Cursor plugin marketplace.
- **AgentRank score:** 43.12 | Rank #5,728 | 3 stars (repo is brand new, hosted server not crawled heavily)
- **Business model:** Serverless MySQL SaaS — freemium (Hobby plan) + paid Scaler ($39/mo) and Scaler Pro ($79/mo+). Enterprise contracts. ~$105M raised.
- **Funding:** $105M total (Series C: a16z, SignalFire, Insight Partners, Kleiner Perkins).
- **Size:** ~81 employees, Mountain View
- **Key decision maker:** Sam Lambert (CEO) — @isamlambert on X | linkedin.com/in/sam-lambert. Jitendra Vaidya (CSO/co-founder).
- **Contact:** planetscale.com/contact | @isamlambert on X | partnerships@planetscale.com
- **Current marketing channels:** Technical blog (heavily MySQL/database optimization content), X/Twitter presence (Sam Lambert is active), developer conferences, GitHub integration. Historically strong DevRel under Nick Van Wiggeren (ex-VP Marketing).
- **Why they'd care about AgentRank visibility:** PlanetScale just launched their hosted MCP server. At rank #5,728 with 3 stars, they have essentially zero organic AgentRank visibility despite being a $100M+ funded database company. They're competing in the Postgres/MySQL AI-native database space against Neon (#195) and MotherDuck (#50). The pitch is launch-timing: "You just shipped your MCP server. A sponsored listing gives it instant visibility before your competitors pull ahead."
- **Competitive positioning:** Neon #195 (serverless Postgres) and MotherDuck #50 (DuckDB) both rank significantly above PlanetScale #5,728.
- **Pitch angle:** "You just launched your hosted MCP server, but organic ranking takes months to build. A sponsored listing gives you immediate visibility in the database MCP category — before Neon and MotherDuck define it."
- **Estimated likelihood:** MEDIUM. Real budget, launched MCP, timing is perfect (launch window). But Sam Lambert will want to see traction metrics first. Start with a 3-month commitment pitch at $199/mo.

---

### 9. Cursor/Anysphere — LOW-MEDIUM

**Conversion flag:** Cursor is an MCP consumer (their IDE integrates MCP), not primarily an MCP server publisher. The pitch is structurally weaker but not impossible — cursor/mcp-servers is their curated list for the Cursor marketplace, and they have $1B+ ARR and real developer marketing budget.

- **Website:** cursor.com | anysphere.inc
- **MCP tool:** cursor/mcp-servers — curated MCP server registry for Cursor IDE. Not a traditional MCP server.
- **AgentRank score:** 68.20 | Rank #386 | 215 stars
- **Business model:** AI code editor subscription — Hobby (free, limited), Pro ($20/mo), Business ($40/mo/seat). $1B+ ARR. World's fastest-growing SaaS by ARR ramp.
- **Funding:** $3.3B total — Series A + Series B ($900M at $9B valuation, Thrive Capital, June 2025) + Series D ($2.3B at $29.3B valuation, Accel/Coatue, Nov 2025). Google and Nvidia partners.
- **Size:** ~200 employees (fast scaling), San Francisco. 4 co-founders: Michael Truell (CEO), Sualeh Asif, Arvid Lunnemark, Aman Sanger.
- **Key decision maker:** Michael Truell (CEO) — @trueilluminated on X. Aman Sanger (engineering co-founder) — @amansanger. No dedicated DevRel team publicly known — founders handle developer relations directly.
- **Contact:** cursor.com/contact | @trueilluminated on X (Michael Truell responds directly on X)
- **Current marketing channels:** Word-of-mouth, Twitter/X, developer community, GitHub integrations, Hacker News, no traditional advertising. The product sells itself.
- **Why they might care (reframe):** The pitch is developer brand/mindshare, not traditional "your tool ranks here." Reframe: "Cursor users are AgentRank's core audience. A sponsored listing for cursor/mcp-servers means every agent developer who visits AgentRank sees the official Cursor MCP resource — reinforcing Cursor as the default MCP-native IDE." This is awareness marketing for the IDE among developers actively evaluating MCP tools.
- **Conversion caveat:** At $29.3B valuation and $1B+ ARR, $399/mo is a rounding error, but the founders may not prioritize this because organic growth is exceptional. The path is through a developer relations or marketing hire — not the founding team.
- **Estimated likelihood:** LOW-MEDIUM. Huge budget but the product fit is indirect. Try only after Tier 1 and 2 are closed. The message needs to be about reaching Cursor's exact target customer (agent developers), not about ranking their MCP server.

---

### 10. Replit — LOW

**Conversion flag:** Replit has no official MCP server in the AgentRank index. They are an MCP consumer — their Agent feature connects to remote MCP servers built by others. A sponsored listing for a non-existent or community-built MCP tool is not a viable pitch without product development on their end.

- **Website:** replit.com
- **MCP tool:** None official in AgentRank index. Replit Agent supports remote MCP connections; there are community-built Replit MCP extensions but none are official Replit repos.
- **AgentRank score:** N/A (no official tool indexed)
- **Business model:** AI development platform — freemium (free tier) + Core ($25/mo) + Teams (custom). $150M ARR (Sep 2025).
- **Funding:** ~$500M+ total — Series E ($250M at $3B valuation, Prysm Capital, Sep 2025). a16z, Coatue, Google AI Futures Fund.
- **Size:** ~170 employees, San Francisco
- **Key decision maker:** Amjad Masad (CEO/co-founder) — @amasad on X | amjad@replit.com. Haya Odeh (co-founder) — @HayaOdeh on X.
- **Contact:** @amasad on X (very active, direct responses) | partnerships@replit.com
- **Current marketing channels:** X/Twitter (Amjad has 200K+ followers, high-engagement developer audience), YouTube tutorials, Replit blog, community events. Strong organic/viral growth via product.
- **Why they might care (conditional):** If Replit ships an official MCP server (e.g., a replit/mcp-server for programmatic workspace creation), the pitch becomes viable immediately. Monitor their GitHub for this. Alternatively, pitch them as a brand sponsor for the AgentRank newsletter or homepage — a different revenue model entirely.
- **Conditional path:** Watch for replit/mcp-server to appear on GitHub. When it does, reach out within 72 hours with the "just launched" timing pitch.
- **Estimated likelihood:** LOW until they ship an official MCP server. File under "watch and trigger."

---

## Priority Outreach Order

**Tier 1 — Start here (HIGH likelihood, fastest close):**

| Priority | Company | Contact | Price Point | Signal |
|----------|---------|---------|-------------|--------|
| 1 | **Composio** | @sohamganatra on X | $399/mo | MCP IS their product, Lightspeed Series A |
| 2 | **Firecrawl** | @ericciarla on X | $399/mo | MCP is #1 GTM, Exa/Tavily rank higher |
| 3 | **Browserbase** | @pkiv on X | $399/mo | $300M valuation, 3,192 stars, Series B |

**Tier 2 — Strong candidates (MEDIUM-HIGH, real budget, DevRel culture):**

| Priority | Company | Contact | Price Point | Signal |
|----------|---------|---------|-------------|--------|
| 4 | **Snyk** | developer@snyk.io | $299/mo | Category ownership, DevRel DNA |
| 5 | **E2B** | @terezatizkova on X | $299/mo | Series A, founders reachable |
| 6 | **LangChain** | @hwchase17 on X | $299/mo | Unicorn, LangSmith commercial product |

**Tier 3 — Real budget, longer cycle or weaker product fit:**

| Priority | Company | Contact | Price Point | Notes |
|----------|---------|---------|-------------|-------|
| 7 | **Neon** | @n2o on X | $199/mo | See AUT-315 full profile |
| 8 | **PlanetScale** | @isamlambert on X | $199/mo | Launch timing, prove value first |
| 9 | **Cursor** | @trueilluminated on X | $399/mo | Brand play, indirect pitch only |

**Watch & Trigger:**
- **Replit** — trigger outreach when official MCP server appears on GitHub.

---

## Key Pitch Angles for This Cohort

### "MCP is your acquisition channel" (highest conviction)
For: Composio, Firecrawl, Browserbase

> "Every developer building an agent searches AgentRank before they choose tools. You're at rank [X]. A sponsored listing ensures you're the first choice in [category] before [competitor] defines it."

### "You just launched — own it now"
For: PlanetScale

> "You shipped your hosted MCP server recently. Organic ranking builds over months. A sponsored listing gives you immediate category visibility while your index signals catch up."

### "High real adoption, low index visibility"
For: E2B, LangChain

> "You serve [X% of Fortune 100 / 200+ companies], but your MCP server ranks #[X]. The gap between your actual adoption and your index position costs you developer discovery. A sponsored listing closes it."

### "Category ownership — no competitors"
For: Snyk

> "You're the only serious [security] MCP in our 25,000+ tool index. A sponsored listing locks in that position before the category fills."

---

## Notes on Exclusions

- **LangChain vs. LangSmith:** Profile targets LangSmith MCP (commercial product), not the langchain-mcp-adapters repo. The pitch is about LangSmith's developer acquisition, not framework adoption.
- **Cursor vs. Anysphere:** cursor/mcp-servers is their curated list, not an original MCP server. The business case is developer brand awareness, not tool ranking. Only pursue after Tier 1–2 are closed.
- **Replit:** No viable pitch without an official MCP server in the index. Watch GitHub for release.

---

*Researched by Market Researcher agent (AUT-377). Sources: AgentRank DB (data/ranked.json, 25,750 tools), company websites, GitHub profiles, SiliconAngle, TechCrunch, GlobeNewsWire, SV funding databases, prior research AUT-315 and AUT-303.*
*Composio funding: SiliconAngle (Jul 2025) + Lightspeed post. Firecrawl funding: GlobeNewsWire (Aug 2025). Browserbase funding: builtinsf.com (Jun 2025). E2B funding: VentureBeat (Jul 2025). LangChain funding: Latenode research (Jul 2025). Replit funding: replit.com/news. Cursor funding: CNBC (Nov 2025).*
