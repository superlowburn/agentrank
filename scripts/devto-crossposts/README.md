# dev.to Cross-Posts

Three blog posts ready for cross-posting to dev.to. Each file has dev.to frontmatter with `published: false` and a `canonical_url` pointing back to agentrank-ai.com.

The canonical URLs ensure all SEO credit flows back to agentrank-ai.com. Dev.to is a high-DA domain (DA 90+) so every published post creates a permanent, high-quality backlink.

## Files

| File | Canonical URL |
|------|--------------|
| `what-is-mcp-model-context-protocol-explained.md` | https://agentrank-ai.com/blog/what-is-mcp-model-context-protocol-explained/ |
| `how-to-choose-an-mcp-server.md` | https://agentrank-ai.com/blog/how-to-choose-an-mcp-server/ |
| `fastmcp-tutorial-python-mcp-server.md` | https://agentrank-ai.com/blog/fastmcp-tutorial-python-mcp-server/ |

## How to Publish

### Step 1: Create a dev.to account

1. Go to https://dev.to
2. Sign up with GitHub (recommended — it's faster and links your profile to your GitHub presence)
3. Fill in your profile: name "AgentRank", bio something like "Ranked index of 25,000+ MCP servers and agent tools. Updated daily. agentrank-ai.com"

### Step 2: Publish each post

**Option A — Paste markdown directly (easiest)**

1. Click "Write a post" (top right)
2. Click the "..." menu → "Edit with markdown"
3. Copy the entire contents of the `.md` file (including frontmatter)
4. Paste into the editor
5. dev.to will parse the frontmatter automatically — title, description, tags, and canonical_url will populate
6. Preview the post to check formatting
7. Change `published: false` to `published: true` in the frontmatter, or use the toggle in the editor
8. Publish

**Option B — Use the dev.to API**

```bash
# Set your API key (get from https://dev.to/settings/extensions)
export DEVTO_API_KEY="your-api-key-here"

# Publish a post
curl -X POST https://dev.to/api/articles \
  -H "api-key: $DEVTO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"article\": {\"body_markdown\": $(cat what-is-mcp-model-context-protocol-explained.md | jq -Rs .)}}"
```

### Step 3: Ordering

Publish in this order (most SEO-valuable first, then let each one settle before the next):

1. `what-is-mcp-model-context-protocol-explained.md` — broadest audience, highest search volume
2. `fastmcp-tutorial-python-mcp-server.md` — high intent, Python devs actively searching
3. `how-to-choose-an-mcp-server.md` — decision-stage buyers

Wait 24–48 hours between posts to avoid looking spammy.

### Step 4: After publishing

- Add the dev.to post URLs as backlink sources in the AgentRank SEO tracker
- Share each post on @AgentRank_ai Twitter (pending board approval)
- Engage with comments in the first 24 hours — dev.to's algorithm rewards engagement

## Notes

- All images use absolute URLs pointing to agentrank-ai.com — no need to re-upload images
- Internal links use absolute agentrank-ai.com URLs — they'll work correctly on dev.to
- The canonical_url in each post's frontmatter is the most important field — verify it's set correctly before publishing
- dev.to supports all standard markdown including tables and fenced code blocks — no special formatting needed
