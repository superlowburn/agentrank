# AI Agent Framework Tool Discovery Research
## Integration Opportunities for AgentRank

**Date:** March 19, 2026
**Issue:** AUT-325
**Goal:** Identify where AgentRank can become the default tool recommendation engine embedded in agent frameworks.

---

## TL;DR

Every major agent framework supports MCP. Developers in all these ecosystems need help finding which MCP servers to use. AgentRank can be the answer to that question — either via our MCP server (queryable by agents directly), our API, or through documentation partnerships. The highest-leverage plays are LangChain, PydanticAI, and CrewAI.

---

## Framework Analysis

### 1. LangChain / LangGraph
**GitHub:** https://github.com/langchain-ai/langchain
**Stars:** 130K (LangChain) + 27K (LangGraph)
**PyPI downloads:** 224M/month (langchain), LangGraph separate
**User base:** Largest agent framework by volume. Dominant in enterprise Python.

**Tool discovery mechanism:**
Manual config. Developers instantiate tools from `langchain_community.tools` (80+ built-ins) or subclass `BaseTool`. No automated discovery — devs research tools themselves.

**MCP support:**
YES — official `langchain-mcp-adapters` library (3.4K stars, ~6M downloads/month). Load any MCP server's tools into LangChain/LangGraph with `load_mcp_tools(session)`.

**Integration API:**
Any MCP server automatically becomes a LangChain tool via the adapter. AgentRank's own MCP server is already usable by LangChain agents today. But the bigger play is being the recommended discovery layer in their docs.

**Partnership channel:**
- @hwchase17 (Harrison Chase, CEO LangChain) — reachable on X/GitHub
- @baskaryan (Bagel Rao) — engineering lead
- GitHub Discussions, partnerships@langchain.dev

**Opportunity:**
Get AgentRank linked in the `langchain-mcp-adapters` README as the recommended registry for finding MCP servers. That README is read by every developer using LangChain + MCP. A single doc addition = permanent top-of-funnel.

---

### 2. PydanticAI
**GitHub:** https://github.com/pydantic/pydantic-ai
**Stars:** 15.6K
**PyPI downloads:** 15.6M/month — extremely high for age; fastest-growing framework
**User base:** Python developers who trust Pydantic's quality-first approach.

**Tool discovery mechanism:**
Tool functions registered via decorator. No discovery registry currently.

**MCP support:**
YES — explicit first-class feature. Supports MCP + A2A protocol. Docs at ai.pydantic.dev/mcp/overview.

**Integration API:**
MCP servers registered via standard MCP client API. Framework hooks into any MCP server.

**Partnership channel:**
- @samuelcolvin (Samuel Colvin, founder) — very reachable, active on X
- Pydantic Discord
- GitHub Issues — responsive team

**Opportunity:**
Fastest-growing framework with no incumbent tool discovery. Early partnership = default recommendation. Much easier to influence docs at this stage than LangChain which has established patterns. Propose: "When building PydanticAI agents, use AgentRank to find trusted MCP servers."

---

### 3. CrewAI
**GitHub:** https://github.com/crewAIInc/crewAI
**Stars:** 46.5K
**PyPI downloads:** 5.75M/month (crewai) + 5.7M/month (crewai-tools)
**User base:** Business/enterprise teams building multi-agent workflows. Strong YouTube tutorial community.

**Tool discovery mechanism:**
Built-in tool library (`crewai-tools`) with 30+ tools. Custom tools via `BaseTool` subclass or `@tool` decorator.

**MCP support:**
YES — `pip install crewai-tools[mcp]`. Full MCP server integration as of recent release.

**Integration API:**
Standard MCP client protocol. Any MCP server usable by CrewAI agents once connected.

**Partnership channel:**
- @joaomdmoura (João Moura, founder) — active on X
- community.crewai.com
- partnerships@crewai.com

**Opportunity:**
CrewAI recently added MCP support but their docs don't yet point to any MCP discovery source. We have a 60-day window to be the first recommended registry. Proposed action: reach out to João directly with a "we built the ranked index of MCP servers your users need" pitch.

---

### 4. LlamaIndex + LlamaHub
**GitHub:** https://github.com/run-llama/llama_index
**Stars:** 47.8K
**PyPI downloads:** 6.5M/month (llama-index-core), 70K/month (llama-index-tools-mcp)
**User base:** RAG-heavy teams, document processing, production deployments.

**Tool discovery mechanism:**
**LlamaHub** (llamahub.ai) — community registry of data loaders and tools. This is the closest existing analogue to AgentRank. MCP tool integration via `llama-index-tools-mcp` package.

**MCP support:**
YES — dedicated `llama-index-tools-mcp` package (70K downloads/month, growing).

**Integration API:**
Standard MCP client. Tools loadable from any MCP server.

**Partnership channel:**
- @jerryjliu0 (Jerry Liu, CEO LlamaIndex) — active on X
- community.llamaindex.ai
- Discord

**Opportunity:**
LlamaHub is the incumbent tool/loader registry but it's Python-package focused, not MCP-native. As developers shift to MCP-based tools, AgentRank can be positioned as "LlamaHub but for the MCP era." Propose data partnership: AgentRank provides ranked MCP server data that LlamaHub surfaces. Mutually beneficial.

---

### 5. AutoGen (Microsoft)
**GitHub:** https://github.com/microsoft/autogen
**Stars:** 55.9K
**PyPI downloads:** 1.2M/month (autogen-agentchat)
**User base:** Research teams, Microsoft ecosystem, enterprise. Heavy .NET/Azure presence.

**Tool discovery mechanism:**
`autogen_ext.tools.mcp` module with `McpWorkbench` class. Well-structured MCP integration in the extension package.

**MCP support:**
YES — native McpWorkbench, StdioServerParams, SSE, streamable HTTP. First-class citizen.

**Integration API:**
```python
from autogen_ext.tools.mcp import McpWorkbench, StdioServerParams
```
Full MCP workbench abstraction.

**Partnership channel:**
- Microsoft AutoGen GitHub team (@ekzhu, @victordibia)
- GitHub Discussions
- autogen@microsoft.com
- Note: Microsoft has its own MCP ecosystem; partnership may have internal politics

**Opportunity:**
Solid technical integration already possible. Partnership path is harder than startups — Microsoft moves slowly. Best approach: open source contribution to AutoGen docs that lists AgentRank as discovery source. Lower priority than startup-led frameworks.

---

### 6. Semantic Kernel (Microsoft)
**GitHub:** https://github.com/microsoft/semantic-kernel
**Stars:** 27.5K
**PyPI downloads:** 2.8M/month
**User base:** Enterprise .NET/Python teams, Azure customers, Copilot builders.

**Tool discovery mechanism:**
Plugin system supporting: native code functions, prompt templates, OpenAPI specs, MCP. Plugin "marketplace" concept but no central registry.

**MCP support:**
YES — explicitly listed as first-class feature. Works across Python and C#/.NET.

**Integration API:**
```csharp
kernel.Plugins.Add(KernelPluginFactory.CreateFromType<MenuPlugin>())
```
Also supports MCP plugin loading.

**Partnership channel:**
- Microsoft Semantic Kernel team
- GitHub Discussions
- Microsoft partner program

**Opportunity:**
Similar to AutoGen — Microsoft politics, slower moving. But SK has a real "plugins" concept where a plugin marketplace would fit naturally. Long-term play: propose AgentRank as the MCP server discovery layer for SK's plugin ecosystem.

---

### 7. Agno (formerly Phidata)
**GitHub:** https://github.com/agno-agi/agno
**Stars:** 38.8K
**PyPI downloads:** 1.45M/month
**User base:** Production-focused Python teams wanting lightweight, fast agents.

**Tool discovery mechanism:**
Native `MCPTools` class, deeply MCP-integrated design philosophy. Also has custom tool functions.

**MCP support:**
YES — `from agno.tools.mcp import MCPTools`. MCP-first design.

**Integration API:**
```python
tools=[MCPTools(url="https://docs.agno.com/mcp")]
```
Any URL-accessible MCP server.

**Partnership channel:**
- @ashpreetbedi (Ashpreet Bedi, founder) — active on X, Discord
- docs.agno.com
- Small team = faster decisions

**Opportunity:**
Smaller company, MCP-native philosophy, no incumbent discovery source. Best candidate for a quick partnership win. "Use AgentRank to find the best MCP servers for your Agno agents" — easy ask, high leverage.

---

### 8. Haystack
**GitHub:** https://github.com/deepset-ai/haystack
**Stars:** 24.5K
**PyPI downloads:** 640K/month
**User base:** RAG/NLP teams, production pipelines, German-speaking tech community (deepset is Berlin-based).

**Tool discovery mechanism:**
Component-based pipeline architecture. Community integrations in `haystack-core-integrations` (183 stars).

**MCP support:**
Partial — Hayhooks can *serve* Haystack pipelines as MCP servers, but MCP consumption for tools is less developed. Lower MCP integration maturity vs. other frameworks.

**Partnership channel:**
- deepset.ai (company behind Haystack)
- Discord: discord.com/invite/VBpFzsgRVF
- GitHub Discussions

**Opportunity:**
Lower priority. MCP consumption not yet a strength. Better engagement path may be through Hayhooks (serving AgentRank as an MCP endpoint that Haystack pipelines can use).

---

### 9. Agency Swarm
**GitHub:** https://github.com/VRSEN/agency-swarm
**Stars:** 4.1K
**User base:** YouTube tutorial audience, automation builders.

**MCP support:** Limited/unclear.
**Priority:** Low — smaller community, no clear MCP integration path.

---

## Notable Third-Party: mcpadapt
**GitHub:** https://github.com/grll/mcpadapt
**Stars:** 420
**Tagline:** "Unlock 650+ MCP servers tools in your favorite agentic framework"

Supports: smolagents, LangChain, CrewAI, Google GenAI. Their README references Glama and Smithery as MCP discovery sources. This is a direct signal — developers using mcpadapt are actively looking for MCP server directories. **AgentRank should be listed as the preferred alternative to Glama/Smithery here.** Open a PR or reach out to the maintainer (@grll).

---

## Priority Matrix

| Rank | Framework | Monthly Reach | MCP Maturity | Partnership Speed | Action |
|------|-----------|---------------|--------------|-------------------|--------|
| 1 | LangChain + LangGraph | 224M installs | High (official adapter) | Medium | Get listed in langchain-mcp-adapters README |
| 2 | PydanticAI | 15.6M installs | High (first-class) | Fast (small team) | Reach out to @samuelcolvin |
| 3 | CrewAI | 5.75M installs | High (native) | Fast (startup) | Reach out to @joaomdmoura |
| 4 | LlamaIndex | 6.5M installs | Medium (package) | Medium | Propose LlamaHub data partnership |
| 5 | Agno | 1.45M installs | High (native) | Fast (small team) | Reach out to @ashpreetbedi |
| 6 | Semantic Kernel | 2.8M installs | High (Microsoft) | Slow (Microsoft) | Open-source docs contribution |
| 7 | AutoGen | 1.2M installs | High (Microsoft) | Slow (Microsoft) | Open-source docs contribution |
| 8 | mcpadapt | Small | High | Fast (1 maintainer) | Open PR to add AgentRank |

---

## Integration Architecture: How AgentRank Plugs In

Three integration patterns, ordered by leverage:

**Pattern A — MCP Server (immediate, zero-effort for framework):**
AgentRank's MCP server (`@agentrank/mcp-server`) is already usable by any of these frameworks today. An agent can query AgentRank for "what's the best MCP server for X" and get a ranked answer. No framework partnership needed. Distribution comes from being listed in their docs.

**Pattern B — Data Partnership (medium-term):**
Provide the AgentRank API as a data source for framework-native tool discovery. LlamaHub and LangChain community tools could index AgentRank scores alongside their own metadata.

**Pattern C — Docs/Tutorial Inclusion (immediate, high-leverage):**
Get linked in every framework's "how to find MCP servers" tutorial or recommended-resources list. This is the cheapest and most durable distribution channel. One PR = permanent discovery.

---

## Recommended Actions (for CEO/Growth Engineer)

1. **Immediate (this week):** Open PR to add AgentRank to `langchain-mcp-adapters` README as recommended MCP discovery source.

2. **Quick wins (2 weeks):** Cold outreach to @joaomdmoura (CrewAI) and @ashpreetbedi (Agno) — both founder-led startups that make partner decisions fast. Offer: free featured placement for their top-rated tools on AgentRank.

3. **Highest leverage (2-4 weeks):** Reach out to @samuelcolvin (PydanticAI) before the ecosystem standardizes on a discovery pattern. PydanticAI's growth trajectory means whoever gets embedded in their docs gets 15M+ monthly eyeballs within 6 months.

4. **Contribution play (ongoing):** Open PR to mcpadapt adding AgentRank as a recommended discovery source alongside Glama/Smithery.

5. **Microsoft play (later):** Don't chase Microsoft partnerships now — too slow. Prioritize the startup-led frameworks first. Come back to SK/AutoGen when we have traffic numbers to justify their attention.

---

## Contact Summary for Outreach

| Framework | Key Contact | Channel | Note |
|-----------|-------------|---------|------|
| LangChain | @hwchase17 (Harrison Chase) | X, partnerships@langchain.dev | CEO, high bar |
| PydanticAI | @samuelcolvin (Samuel Colvin) | X, GitHub | Founder, responds fast |
| CrewAI | @joaomdmoura (João Moura) | X, community.crewai.com | Founder, startup culture |
| LlamaIndex | @jerryjliu0 (Jerry Liu) | X, Discord | CEO |
| Agno | @ashpreetbedi (Ashpreet Bedi) | X, Discord | Founder, small team |
| AutoGen | @ekzhu (Eric Zhu) | GitHub | Core maintainer |
| mcpadapt | @grll | GitHub Issues | Solo maintainer |
