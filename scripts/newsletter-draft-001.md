# AgentRank Newsletter #1 — Draft

> **STATUS: DRAFT — Do NOT send. Steve must review and approve before sending.**

Generated: 2026-03-17

---

## Subject Line Options

1. `25,000+ MCP tools ranked. Here's who's winning.`
2. `The MCP ecosystem by the numbers — AgentRank #1`
3. `AgentRank #1: Top tools, biggest movers, ecosystem snapshot`

**Recommended:** Option 1 — most direct, curiosity-driven, highest open rate potential.

---

## Preview Text (shows in inbox below subject)

`Top 5 tools, biggest rank jumps this week, and how to give your AI live access to the data.`

---

---

# PLAIN TEXT VERSION

---

AgentRank | Issue #1 | March 17, 2026

---

THE STATE OF THE MCP ECOSYSTEM

There are now 25,632 MCP servers, AI skills, and agent tools indexed in AgentRank. Scored daily on five GitHub signals: freshness, issue health, contributors, dependents, and stars.

A few numbers worth knowing:

- 54% of indexed repos haven't committed in 91-365 days. The ecosystem is wide and mostly stale.
- Python leads by language: 9,874 repos (38%), followed by TypeScript at 7,003 (27%).
- Average score across all 25,632 tools: 29.6/100. The distribution is steep — the top 1% of tools pull far from the median.

This is why the ranking exists: to surface the actually-maintained tools that don't have the star count yet.

---

TOP 5 THIS WEEK

Scores are 0-100. Updated daily.

Rank | Tool                              | Score | Stars  | Category
-----|-----------------------------------|-------|--------|------------------
#1   | CoplayDev/unity-mcp               | 98.7  | 7,003  | Unity / Game Dev
#2   | microsoft/azure-devops-mcp        | 97.2  | 1,406  | DevOps
#3   | laravel/boost                     | 96.9  | 3,333  | Web Framework
#4   | CoderGamester/mcp-unity           | 96.4  | 1,412  | Unity / Game Dev
#5   | mark3labs/mcp-go                  | 96.3  | 8,353  | SDK / Go

Full rankings: https://agentrank-ai.com

---

WHAT THE LEADERBOARD IS TELLING YOU

Unity is dominating the top 5. Two of the top 4 tools are Unity MCP integrations. Game developers are adopting MCP faster than any other dev category, and their maintainers are keeping pace. If you're building anything Unity-adjacent, the tooling is better than you might expect.

laravel/boost at #3 has something the Unity tools don't: 1,032 dependent repos. Stars measure attention; dependents measure actual usage. Laravel's MCP server has both, which is why it's this high despite "only" 3,300 stars.

mark3labs/mcp-go at #5 tells the same story: 8,353 stars but its 2,938 dependents are what sealed the ranking. It's the foundation a significant portion of Go MCP tools are built on.

---

BIGGEST MOVERS

Tools that changed rank most since yesterday:

Tool                         | Previous Rank | Current Rank | Change
-----------------------------|---------------|--------------|-------
homeassistant-ai/ha-mcp      | #72           | #16          | +56
CoderGamester/mcp-unity      | #43           | #4           | +39
jgravelle/jcodemunch-mcp     | #68           | #18          | +50
samanhappy/mcphub            | #50           | #9           | +41
microsoft/azure-devops-mcp   | #32           | #2           | +30

The Home Assistant MCP server jumped 56 spots in a single day — biggest mover in the index. The tool connects AI assistants directly to your home automation setup and has been gaining contributors quickly. The smart home developer community appears to have discovered MCP.

---

NEW ENTRIES

The index is updated nightly. Notable patterns in recent additions:

- Tools entering with 50+ stars on day one (already had a community before GitHub went live)
- Repos with 3+ contributors from the start (not a solo project — lower bus factor)
- Tools with dependent repos within the first week (someone is already building on it)

Check https://agentrank-ai.com for the current new-entries view.

---

GIVE YOUR AI LIVE ACCESS TO THE RANKINGS

The MCP server is the fastest way to use AgentRank. Install once and your AI queries the live index whenever it needs a tool recommendation:

  claude mcp add agentrank -- npx -y agentrank-mcp-server

After that, instead of guessing from training data, your AI checks current scores — freshness, issue health, dependent count, and more.

---

WHAT'S NEXT

- Category leaderboards — dedicated rankings for Browser Automation, Dev Tools, Game Dev, etc.
- Mover alerts — subscribe to a specific tool and get notified when its score changes
- Badge embeds — maintainers can add a live AgentRank score badge to their README

If you want early access, reply to this email.

---

AgentRank — https://agentrank-ai.com
Unsubscribe | You're receiving this because you subscribed at agentrank-ai.com

---

---

# HTML VERSION

---

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentRank #1 — 25,000+ MCP tools ranked</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #111827;
    }
    .wrapper {
      max-width: 600px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .header {
      background: #0f172a;
      padding: 32px 40px 28px;
    }
    .header-brand {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 8px;
    }
    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 6px;
      line-height: 1.3;
    }
    .header-meta {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    .content {
      padding: 36px 40px;
    }
    h2 {
      font-size: 13px;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    p {
      margin: 0 0 16px;
      color: #374151;
    }
    .stat-grid {
      display: flex;
      gap: 16px;
      margin: 0 0 28px;
    }
    .stat-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
    }
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 28px;
      font-size: 14px;
    }
    th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 12px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #111827;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .rank-badge {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: #0f172a;
      color: #f8fafc;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      line-height: 24px;
    }
    .score-bar-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .score-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      flex: 1;
      min-width: 60px;
    }
    .score-fill {
      height: 6px;
      background: #6366f1;
      border-radius: 3px;
    }
    .score-text {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
    }
    .tool-link {
      color: #0f172a;
      text-decoration: none;
      font-weight: 500;
    }
    .tool-link:hover {
      color: #6366f1;
    }
    .mover-up {
      color: #059669;
      font-weight: 600;
      font-size: 13px;
    }
    .insight-box {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      border-radius: 0 6px 6px 0;
      padding: 16px 20px;
      margin: 0 0 28px;
    }
    .insight-box p {
      margin: 0 0 8px;
      font-size: 14px;
    }
    .insight-box p:last-child {
      margin: 0;
    }
    .cta-block {
      background: #0f172a;
      border-radius: 8px;
      padding: 28px 32px;
      margin: 0 0 28px;
      text-align: center;
    }
    .cta-block h3 {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 8px;
    }
    .cta-block p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 20px;
    }
    .code-block {
      background: #1e293b;
      border-radius: 6px;
      padding: 12px 16px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      color: #a5f3fc;
      text-align: left;
      margin: 0 0 20px;
      overflow-x: auto;
    }
    .cta-button {
      display: inline-block;
      background: #6366f1;
      color: #ffffff;
      padding: 12px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .coming-soon {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 20px 24px;
      margin: 0 0 28px;
    }
    .coming-soon ul {
      margin: 8px 0 0;
      padding-left: 20px;
      color: #374151;
      font-size: 14px;
    }
    .coming-soon li {
      margin-bottom: 6px;
    }
    .footer {
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    .footer a {
      color: #6b7280;
    }
    .section-divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 0 0 28px;
    }
    @media (max-width: 480px) {
      .content { padding: 24px 20px; }
      .header { padding: 24px 20px; }
      .stat-grid { flex-direction: column; }
      .footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <p class="header-brand">AgentRank &bull; Issue #1</p>
      <h1 class="header-title">25,000+ MCP tools ranked.<br>Here's who's winning.</h1>
      <p class="header-meta">March 17, 2026 &bull; Weekly ecosystem snapshot</p>
    </div>

    <!-- Content -->
    <div class="content">

      <!-- Ecosystem stats -->
      <h2>The ecosystem, by the numbers</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-number">25,632</div>
          <div class="stat-label">tools indexed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">3,124</div>
          <div class="stat-label">skills tracked</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">29.6</div>
          <div class="stat-label">avg score / 100</div>
        </div>
      </div>
      <div class="insight-box">
        <p><strong>54% of repos haven't committed in 91–365 days.</strong> The ecosystem is wide and mostly stale. Python leads by language (38%), followed by TypeScript (27%). The average score of 29.6 tells you the real story: the top 1% pull dramatically from the median.</p>
        <p>That gap is why the ranking exists — to surface the tools that are actually being maintained.</p>
      </div>
      <hr class="section-divider">

      <!-- Top 5 -->
      <h2>Top 5 this week</h2>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px;">Scores are 0–100, updated daily from GitHub signals: freshness, issue health, contributors, dependents, and stars.</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Tool</th>
            <th>Score</th>
            <th>Stars</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="rank-badge">1</span></td>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/CoplayDev/unity-mcp">CoplayDev/unity-mcp</a></td>
            <td>
              <div class="score-bar-wrap">
                <div class="score-bar"><div class="score-fill" style="width:98.7%"></div></div>
                <span class="score-text">98.7</span>
              </div>
            </td>
            <td>7,003</td>
          </tr>
          <tr>
            <td><span class="rank-badge">2</span></td>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/microsoft/azure-devops-mcp">microsoft/azure-devops-mcp</a></td>
            <td>
              <div class="score-bar-wrap">
                <div class="score-bar"><div class="score-fill" style="width:97.2%"></div></div>
                <span class="score-text">97.2</span>
              </div>
            </td>
            <td>1,406</td>
          </tr>
          <tr>
            <td><span class="rank-badge">3</span></td>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/laravel/boost">laravel/boost</a></td>
            <td>
              <div class="score-bar-wrap">
                <div class="score-bar"><div class="score-fill" style="width:96.9%"></div></div>
                <span class="score-text">96.9</span>
              </div>
            </td>
            <td>3,333</td>
          </tr>
          <tr>
            <td><span class="rank-badge">4</span></td>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/CoderGamester/mcp-unity">CoderGamester/mcp-unity</a></td>
            <td>
              <div class="score-bar-wrap">
                <div class="score-bar"><div class="score-fill" style="width:96.4%"></div></div>
                <span class="score-text">96.4</span>
              </div>
            </td>
            <td>1,412</td>
          </tr>
          <tr>
            <td><span class="rank-badge">5</span></td>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/mark3labs/mcp-go">mark3labs/mcp-go</a></td>
            <td>
              <div class="score-bar-wrap">
                <div class="score-bar"><div class="score-fill" style="width:96.3%"></div></div>
                <span class="score-text">96.3</span>
              </div>
            </td>
            <td>8,353</td>
          </tr>
        </tbody>
      </table>
      <div class="insight-box">
        <p><strong>Unity is dominating the top 5.</strong> Two of the top 4 tools are Unity MCP integrations. Game developers are adopting MCP faster than any other dev category, and their maintainers are keeping pace.</p>
        <p><strong>laravel/boost scores so high with "only" 3,333 stars because of dependents.</strong> 1,032 other repos depend on it. Stars measure attention; dependents measure actual usage. mcp-go tells the same story at #5 — 2,938 dependents from 8,353 stars.</p>
      </div>
      <p style="text-align:center;margin-bottom:28px;">
        <a href="https://agentrank-ai.com" style="color:#6366f1;font-weight:600;font-size:14px;">View full top 100 at agentrank-ai.com &rarr;</a>
      </p>
      <hr class="section-divider">

      <!-- Biggest movers -->
      <h2>Biggest movers</h2>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px;">Rank changes since yesterday's snapshot.</p>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Was</th>
            <th>Now</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/homeassistant-ai/ha-mcp">homeassistant-ai/ha-mcp</a></td>
            <td style="color:#9ca3af;">#72</td>
            <td><strong>#16</strong></td>
            <td><span class="mover-up">+56</span></td>
          </tr>
          <tr>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/jgravelle/jcodemunch-mcp">jgravelle/jcodemunch-mcp</a></td>
            <td style="color:#9ca3af;">#68</td>
            <td><strong>#18</strong></td>
            <td><span class="mover-up">+50</span></td>
          </tr>
          <tr>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/CoderGamester/mcp-unity">CoderGamester/mcp-unity</a></td>
            <td style="color:#9ca3af;">#43</td>
            <td><strong>#4</strong></td>
            <td><span class="mover-up">+39</span></td>
          </tr>
          <tr>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/samanhappy/mcphub">samanhappy/mcphub</a></td>
            <td style="color:#9ca3af;">#50</td>
            <td><strong>#9</strong></td>
            <td><span class="mover-up">+41</span></td>
          </tr>
          <tr>
            <td><a class="tool-link" href="https://agentrank-ai.com/tool/microsoft/azure-devops-mcp">microsoft/azure-devops-mcp</a></td>
            <td style="color:#9ca3af;">#32</td>
            <td><strong>#2</strong></td>
            <td><span class="mover-up">+30</span></td>
          </tr>
        </tbody>
      </table>
      <div class="insight-box">
        <p><strong>The Home Assistant MCP server jumped 56 spots overnight.</strong> homeassistant-ai/ha-mcp connects AI assistants directly to home automation setups and has been gaining contributors fast. The smart home developer community appears to have found MCP.</p>
      </div>
      <hr class="section-divider">

      <!-- New entries -->
      <h2>New entries</h2>
      <p>The index updates nightly. Notable patterns in recent additions:</p>
      <ul style="font-size:14px;color:#374151;padding-left:20px;margin:0 0 16px;">
        <li style="margin-bottom:8px;"><strong>50+ stars on day one</strong> — already had a community before the GitHub repo went live</li>
        <li style="margin-bottom:8px;"><strong>3+ contributors from the start</strong> — not a solo project, lower bus-factor risk</li>
        <li style="margin-bottom:8px;"><strong>Dependents within the first week</strong> — someone is already building on it</li>
      </ul>
      <p style="text-align:center;margin-bottom:28px;">
        <a href="https://agentrank-ai.com" style="color:#6366f1;font-weight:600;font-size:14px;">Browse new entries at agentrank-ai.com &rarr;</a>
      </p>
      <hr class="section-divider">

      <!-- CTA -->
      <div class="cta-block">
        <h3>Give your AI live access to the rankings</h3>
        <p>Install once. Your AI queries the live index on every tool recommendation — freshness, issue health, dependent count, and more.</p>
        <div class="code-block">claude mcp add agentrank -- npx -y agentrank-mcp-server</div>
        <a class="cta-button" href="https://agentrank-ai.com">See the rankings</a>
      </div>

      <!-- Coming soon -->
      <h2>What's next</h2>
      <div class="coming-soon">
        <ul>
          <li><strong>Category leaderboards</strong> — dedicated rankings for Browser Automation, Dev Tools, Game Dev, and more</li>
          <li><strong>Mover alerts</strong> — subscribe to a specific tool and get notified when its score changes significantly</li>
          <li><strong>Badge embeds</strong> — maintainers can add a live AgentRank score badge to their README</li>
        </ul>
        <p style="font-size:13px;color:#6b7280;margin:12px 0 0;">Reply to this email to get early access to any of these.</p>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin:0 0 8px;"><a href="https://agentrank-ai.com">AgentRank</a> &bull; agentrank-ai.com</p>
      <p style="margin:0;"><a href="#">Unsubscribe</a> &bull; You're receiving this because you subscribed at agentrank-ai.com</p>
    </div>
  </div>
</body>
</html>
```

---

## Notes for Steve

- **Subject recommendation:** Option 1 (`25,000+ MCP tools ranked. Here's who's winning.`) — direct, data-forward, drives curiosity.
- **Send timing:** Tuesday or Wednesday morning, 9am PT — highest open rates for developer newsletters.
- **New entries section:** The nightly pipeline showed 0 net-new repos this week vs. baseline. The section uses evergreen language about what signals to look for rather than specific tool names. If you want concrete new entries by send time, pull from the "new entries" view on the dashboard or run the pipeline again.
- **Movers data source:** `data/movers.json` — compares current scores to March 16 baseline.
- **The Home Assistant callout** is the strongest hook in the movers section — 56 spots in a day is genuinely interesting data and the smart home angle is a new audience.
- **HTML version** is full-width email-safe HTML, inline-style-friendly. Paste into your email platform's HTML editor (Beehiiv, ConvertKit, etc.).

---

*Generated by Community Manager agent. Requires Steve's approval before sending.*
