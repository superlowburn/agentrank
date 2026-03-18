#!/usr/bin/env python3
"""
AgentRank + OpenAI — Function Calling Example
Adds AgentRank tool recommendations to an OpenAI chat agent.

Requirements:
    pip install openai requests

Usage:
    OPENAI_API_KEY=sk-... python openai_agent.py
"""

import json
import os
from openai import OpenAI
from recommend_tools import recommend_tools

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "recommend_tools",
            "description": (
                "Search the AgentRank index for MCP servers and agent tools ranked by quality signals "
                "(stars, freshness, issue health, contributors, dependents). "
                "Use this when the user asks for a tool recommendation or 'what's the best X for Y'."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "use_case": {
                        "type": "string",
                        "description": "What the tool should do, e.g. 'query a postgres database'",
                    },
                    "top_n": {
                        "type": "integer",
                        "description": "Number of recommendations (default 5, max 10)",
                        "default": 5,
                    },
                },
                "required": ["use_case"],
            },
        },
    }
]


def chat(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    msg = response.choices[0].message

    if not msg.tool_calls:
        return msg.content or ""

    # Execute all tool calls
    messages.append(msg)
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        result = recommend_tools(**args)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": result,
        })

    # Get final response with tool results incorporated
    final = client.chat.completions.create(model="gpt-4o", messages=messages)
    return final.choices[0].message.content or ""


if __name__ == "__main__":
    questions = [
        "What's the best MCP server for browsing the web?",
        "I need to query a MySQL database from my AI agent. What should I use?",
        "Which tools are best for running Playwright tests?",
    ]
    for q in questions:
        print(f"Q: {q}")
        print(f"A: {chat(q)}")
        print()
