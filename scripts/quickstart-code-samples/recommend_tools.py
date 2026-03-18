#!/usr/bin/env python3
"""
AgentRank Quickstart — Python
Recommend MCP tools for a given use case using the AgentRank v1 API.

No API key required for basic search.
Get a free v2 API key at https://agentrank-ai.com/docs

Usage:
    python recommend_tools.py
    python recommend_tools.py "query postgres database"
"""

import sys
import requests

BASE_URL = "https://agentrank-ai.com/api/v1/search"


def search_tools(query: str, category: str = "tool", sort: str = "score", limit: int = 10) -> list[dict]:
    """Search the AgentRank index.

    Args:
        query: Keyword search, e.g. "database" or "browser automation"
        category: "tool" (GitHub repos), "skill" (registry entries), or "" (all)
        sort: "score" (default), "rank", "stars", or "freshness"
        limit: Number of results (max 100)

    Returns:
        List of result dicts with type, name, score, rank, url, raw fields.
    """
    resp = requests.get(
        BASE_URL,
        params={"q": query, "category": category, "sort": sort, "limit": limit},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["results"]


def recommend_tools(use_case: str, top_n: int = 5) -> str:
    """Return top-ranked MCP tools for a given use case.

    Args:
        use_case: Natural-language description, e.g. "scrape web pages"
        top_n: Number of recommendations to return (default 5)

    Returns:
        A formatted string suitable for including in an LLM prompt.
    """
    results = search_tools(use_case, limit=top_n)

    if not results:
        return f"No ranked tools found for '{use_case}'. Check agentrank-ai.com for the latest index."

    def verdict(score: float) -> str:
        if score >= 80:
            return "highly rated"
        if score >= 60:
            return "solid"
        return "use with caution"

    lines = [f"Top {len(results)} MCP tools for '{use_case}' (ranked by AgentRank score):\n"]
    for i, tool in enumerate(results, 1):
        score = tool["score"]
        lines.append(f"{i}. {tool['name']} — score {score:.1f} ({verdict(score)}, #{tool['rank']})")
        if tool.get("description"):
            lines.append(f"   {tool['description']}")
        lines.append(f"   {tool['url']}")
    return "\n".join(lines)


def get_tool_details(github_full_name: str, api_key: str) -> dict:
    """Fetch full score breakdown for a specific tool (requires v2 API key).

    Args:
        github_full_name: e.g. "modelcontextprotocol/python-sdk"
        api_key: Your AgentRank API key (get free at agentrank-ai.com/docs)

    Returns:
        Tool detail dict including signals, rankHistory, and metadata.
    """
    tool_id = github_full_name.replace("/", "--")
    resp = requests.get(
        f"https://agentrank-ai.com/api/v2/tool/{tool_id}",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    use_case = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "scrape web pages"
    print(recommend_tools(use_case))
    print()
    print(recommend_tools("query postgres database"))
