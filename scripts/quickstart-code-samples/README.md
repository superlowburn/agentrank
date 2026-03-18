# AgentRank Quickstart Code Samples

Runnable examples for the tutorial: [How to Integrate AgentRank Scores Into Your AI Agent](https://agentrank-ai.com/blog/integrate-agentrank-ai-agent-tutorial/)

## Files

| File | Language | Description |
|------|----------|-------------|
| `recommend_tools.py` | Python | Core recommendation function + v2 detail lookup |
| `recommendTools.ts` | TypeScript | Same in TypeScript (Node.js 18+) |
| `openai_agent.py` | Python | OpenAI function-calling integration |

## Quick Start

### Python

```bash
pip install requests
python recommend_tools.py "browser automation"
```

### TypeScript

```bash
npx tsx recommendTools.ts "browser automation"
```

### OpenAI Agent

```bash
pip install openai requests
OPENAI_API_KEY=sk-... python openai_agent.py
```

## API Reference

- **v1 (no auth):** `GET https://agentrank-ai.com/api/v1/search?q=&category=&sort=&limit=`
- **v2 (API key):** `GET https://agentrank-ai.com/api/v2/search` — richer data, score breakdowns
- **Tool detail:** `GET https://agentrank-ai.com/api/v2/tool/{owner--repo}`

Get a free API key at [agentrank-ai.com/docs](https://agentrank-ai.com/docs)
