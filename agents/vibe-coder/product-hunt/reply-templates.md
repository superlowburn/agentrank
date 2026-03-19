# First Comment Reply Templates

## 1. How does the scoring actually work?

The score is a composite of 5 GitHub signals: stars (15%), freshness / days since last commit (25%), issue health / closed÷total issues (25%), contributor count (10%), and inbound dependents / how many repos use it (25%). Weighted toward freshness and dependents because a popular-but-dead tool is a liability. Full methodology at agentrank-ai.com/methodology.

---

## 2. Can I add my tool / claim my listing?

If it's on GitHub and matches a query for MCP server or agent tool, it's probably already indexed — search for it at agentrank-ai.com. To add context, fix metadata, or claim ownership of your listing: agentrank-ai.com/claim. Free, no account required.

---

## 3. Is there an API?

Yes, fully open. No key needed for the free tier (100 req/min). Quick start: `GET https://agentrank-ai.com/api/search?q=<tool-name>`. Full docs at agentrank-ai.com/docs. There's also a TypeScript SDK (`@agentrank/sdk`) and an MCP server you can plug directly into Claude or any agent runtime.

---

## 4. What's the business model / is this sustainable?

Right now it's free for everything. I'm a solo builder and the infra cost is basically zero (Cloudflare Workers + D1 + nightly GitHub crawl). Long term: API Pro tier for high-volume users, sponsored listings for verified maintainers who want more visibility, and eventually an agent-to-agent transaction layer as the ecosystem matures. But the index stays free.

---

## 5. How is this different from Glama / MCP.so / other directories?

Directories list things. AgentRank ranks them. The key difference is the daily-updated composite score that reflects real-world health, not just "did someone submit this." Dead tools score low automatically — no manual curation required. The score is also transparent and documented, so you can disagree with the weighting and that conversation is worth having.
