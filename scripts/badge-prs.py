#!/usr/bin/env python3
"""
Opens PRs to top 10 ranked repos adding AgentRank badge to their README.
Badge URL format: https://agentrank-ai.com/api/badge/tool/OWNER--REPO
Tool page URL format: https://agentrank-ai.com/tool/OWNER--REPO
"""

import json
import base64
import subprocess
import sys
import os
import tempfile
import shutil

TOP10 = [
    "CoplayDev/unity-mcp",
    "microsoft/azure-devops-mcp",
    "laravel/boost",
    "CoderGamester/mcp-unity",
    "Pimzino/spec-workflow-mcp",
    "mark3labs/mcp-go",
    "zcaceres/markdownify-mcp",
    "microsoft/playwright-mcp",
    "PrefectHQ/fastmcp",
    "perplexityai/modelcontextprotocol",
]


def gh(args, capture=True):
    cmd = ["gh"] + args
    result = subprocess.run(cmd, capture_output=capture, text=True)
    return result


def get_readme(repo):
    result = gh(["api", f"repos/{repo}/readme"])
    if result.returncode != 0:
        return None, None, None
    data = json.loads(result.stdout)
    content = base64.b64decode(data["content"]).decode("utf-8")
    return content, data["sha"], data["path"]


def make_badge_md(owner, repo_name):
    slug = f"{owner}--{repo_name}"
    badge_url = f"https://agentrank-ai.com/api/badge/tool/{slug}"
    tool_url = f"https://agentrank-ai.com/tool/{slug}"
    return f"[![AgentRank Score]({badge_url})]({tool_url})"


def insert_badge(readme_content, badge_md):
    """Insert badge near the top of README, after first heading or at top."""
    lines = readme_content.split("\n")
    insert_at = 0

    # Find first heading line
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("# ") or stripped.startswith("## "):
            insert_at = i + 1
            # Skip any empty lines after heading
            while insert_at < len(lines) and not lines[insert_at].strip():
                insert_at += 1
            break

    # Insert badge line with surrounding blank lines
    new_lines = lines[:insert_at] + [badge_md, ""] + lines[insert_at:]
    return "\n".join(new_lines)


def open_pr_for_repo(repo):
    owner, repo_name = repo.split("/")
    slug = f"{owner}--{repo_name}"
    badge_md = make_badge_md(owner, repo_name)

    print(f"\n=== Processing {repo} ===")

    # Get README
    readme_content, readme_sha, readme_path = get_readme(repo)
    if readme_content is None:
        print(f"  SKIP: No README found")
        return None

    # Check if already has AgentRank badge
    if "agentrank" in readme_content.lower():
        print(f"  SKIP: Already has AgentRank badge")
        return "already_has_badge"

    print(f"  README: {readme_path} ({len(readme_content)} chars)")

    # Fork the repo
    print(f"  Forking {repo}...")
    fork_result = gh(["repo", "fork", repo, "--clone=false"])
    if fork_result.returncode != 0 and "already exists" not in fork_result.stderr:
        print(f"  ERROR forking: {fork_result.stderr}")
        return None

    # Clone to temp dir
    tmpdir = tempfile.mkdtemp(prefix=f"agentrank-badge-{repo_name}-")
    try:
        print(f"  Cloning fork to {tmpdir}...")
        clone_result = subprocess.run(
            ["gh", "repo", "clone", f"superlowburn/{repo_name}", tmpdir, "--", "--depth=1"],
            capture_output=True, text=True
        )
        if clone_result.returncode != 0:
            print(f"  ERROR cloning: {clone_result.stderr}")
            return None

        # Create branch
        branch = "add-agentrank-badge"
        subprocess.run(["git", "-C", tmpdir, "checkout", "-b", branch], capture_output=True)

        # Read existing README
        readme_file = os.path.join(tmpdir, readme_path)
        with open(readme_file, "r", encoding="utf-8") as f:
            current_content = f.read()

        # Double-check no badge
        if "agentrank" in current_content.lower():
            print(f"  SKIP: Fork already has AgentRank badge")
            return "already_has_badge"

        # Insert badge
        new_content = insert_badge(current_content, badge_md)

        with open(readme_file, "w", encoding="utf-8") as f:
            f.write(new_content)

        # Commit
        subprocess.run(["git", "-C", tmpdir, "add", readme_path], capture_output=True)
        commit_result = subprocess.run(
            ["git", "-C", tmpdir, "commit", "-m",
             f"Add AgentRank score badge to README\n\nCo-Authored-By: Paperclip <noreply@paperclip.ing>"],
            capture_output=True, text=True
        )
        if commit_result.returncode != 0:
            print(f"  ERROR committing: {commit_result.stderr}")
            return None

        # Push
        print(f"  Pushing branch {branch}...")
        push_result = subprocess.run(
            ["git", "-C", tmpdir, "push", "origin", branch, "--force"],
            capture_output=True, text=True
        )
        if push_result.returncode != 0:
            print(f"  ERROR pushing: {push_result.stderr}")
            return None

        # Get default branch of upstream repo
        default_branch_result = gh(["api", f"repos/{repo}", "--jq", ".default_branch"])
        default_branch = default_branch_result.stdout.strip() if default_branch_result.returncode == 0 else "main"

        # Open PR
        pr_title = "Add AgentRank score badge to README"
        pr_body = f"""Hi! I'm adding an [AgentRank](https://agentrank-ai.com) score badge to your README.

AgentRank is an open index of 25,000+ MCP servers and agent tools, scored daily by real signals (stars, freshness, issue health, contributors, dependents). Your repo is currently ranked **#{get_rank(repo)}** in the index.

The badge links back to your [tool page on AgentRank]({f"https://agentrank-ai.com/tool/{slug}"}) where maintainers can see their full score breakdown. It also updates automatically as your score changes.

Feel free to close if you'd prefer not to have it — no pressure!"""

        print(f"  Opening PR...")
        pr_result = gh([
            "pr", "create",
            "--repo", repo,
            "--title", pr_title,
            "--body", pr_body,
            "--head", f"superlowburn:{branch}",
            "--base", default_branch,
        ])

        if pr_result.returncode != 0:
            print(f"  ERROR opening PR: {pr_result.stderr}")
            return None

        pr_url = pr_result.stdout.strip()
        print(f"  PR opened: {pr_url}")
        return pr_url

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def get_rank(repo):
    with open("/Users/mallett/claude/AgentRank/data/ranked.json") as f:
        data = json.load(f)
    for i, item in enumerate(data):
        if item.get("full_name", "").lower() == repo.lower():
            return i + 1
    return "?"


def main():
    results = {}
    for repo in TOP10:
        result = open_pr_for_repo(repo)
        results[repo] = result

    print("\n\n=== SUMMARY ===")
    prs_opened = []
    skipped = []
    failed = []
    for repo, result in results.items():
        if result and result.startswith("http"):
            prs_opened.append(f"{repo}: {result}")
        elif result == "already_has_badge":
            skipped.append(repo)
        else:
            failed.append(repo)

    print(f"\nPRs opened ({len(prs_opened)}):")
    for p in prs_opened:
        print(f"  {p}")

    print(f"\nSkipped - already has badge ({len(skipped)}):")
    for s in skipped:
        print(f"  {s}")

    print(f"\nFailed ({len(failed)}):")
    for f in failed:
        print(f"  {f}")

    return results


if __name__ == "__main__":
    main()
