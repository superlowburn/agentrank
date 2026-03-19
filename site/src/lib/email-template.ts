/**
 * AgentRank weekly digest email template.
 *
 * Exported interface compatible with AUT-209 spec.
 * generateDigestEmail(data) → { html, text, subject }
 *
 * NOTE: This is a working implementation that matches the AUT-209 interface.
 * VibeCoder may enhance the visual design; the exported types/function signature
 * must remain stable.
 */

export interface DigestData {
  date: string;
  stats: {
    total_tools: number;
    total_skills: number;
    new_tools_this_week: number;
    avg_score: number;
  };
  top10: Array<{
    rank: number;
    full_name: string;
    score: number;
    stars: number;
    language: string;
  }>;
  gainers: Array<{
    name: string;
    current_score: number;
    score_change: number;
    current_rank: number;
    rank_change: number;
  }>;
  losers: Array<{
    name: string;
    current_score: number;
    score_change: number;
    current_rank: number;
    rank_change: number;
  }>;
  new_entries: Array<{
    full_name: string;
    score: number;
    stars: number;
    language: string;
  }>;
  featured_tool?: {
    full_name: string;
    rank: number;
    score: number;
    stars: number;
    description: string | null;
    language: string | null;
  };
  top_trending_skills?: Array<{
    slug: string;
    name: string | null;
    rank: number | null;
    score: number | null;
    installs: number;
  }>;
  featured_blog?: {
    title: string;
    url: string;
    description: string;
  };
  top_news?: Array<{
    title: string;
    summary: string | null;
    source_url: string | null;
    category: string;
    author_handle: string | null;
  }>;
  unsubscribe_url: string;
}

export interface DigestEmail {
  html: string;
  text: string;
  subject: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortName(full_name: string): string {
  return full_name.split('/').pop() ?? full_name;
}

function ghUrl(full_name: string): string {
  return `https://github.com/${full_name}`;
}

function toolUrl(full_name: string): string {
  return `https://agentrank-ai.com/tool/${full_name}/`;
}

function fmtDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function signDelta(n: number, prefix = ''): string {
  return n > 0 ? `+${prefix}${n}` : `${prefix}${n}`;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildHtml(data: DigestData): string {
  const weekLabel = fmtDate(data.date);
  const leaderboard = 'https://agentrank-ai.com/';

  // --- Stats boxes ---
  const statsHtml = `
    <tr>
      <td style="padding:0 0 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${[
              ['Total Tools', data.stats.total_tools.toLocaleString()],
              ['New This Week', data.stats.new_tools_this_week.toLocaleString()],
              ['Avg Score', data.stats.avg_score.toFixed(1)],
              ['Total Skills', data.stats.total_skills.toLocaleString()],
            ].map(([label, val], i) => `
              <td width="25%" style="padding:0 ${i < 3 ? '6px' : '0'} 0 0;" valign="top">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#111111;border:1px solid #1a1a1a;border-radius:8px;padding:16px 8px;text-align:center;">
                      <div style="font-size:22px;font-weight:800;color:#e5e5e5;letter-spacing:-0.5px;line-height:1;">${val}</div>
                      <div style="font-size:9px;color:#4b5563;margin-top:6px;text-transform:uppercase;letter-spacing:1px;">${label}</div>
                    </td>
                  </tr>
                </table>
              </td>`).join('')}
          </tr>
        </table>
      </td>
    </tr>`;

  // --- Top 10 ---
  const top10Rows = data.top10.map(t => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #141414;color:#374151;font-size:12px;font-weight:700;width:28px;">${t.rank}</td>
      <td style="padding:10px 10px;border-bottom:1px solid #141414;">
        <a href="${ghUrl(t.full_name)}" style="color:#e5e5e5;text-decoration:none;font-weight:600;font-size:14px;">${shortName(t.full_name)}</a>
        <span style="color:#374151;font-size:11px;margin-left:5px;">${t.full_name.split('/')[0]}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6366f1;font-weight:700;font-size:13px;white-space:nowrap;">${t.score.toFixed(1)}</td>
      <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6b7280;font-size:12px;white-space:nowrap;">&#9733; ${t.stars.toLocaleString()}</td>
      <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#374151;font-size:11px;white-space:nowrap;">${t.language || ''}</td>
    </tr>`).join('');

  const top10Html = `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Top 10 This Week</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead><tr>
            <th style="text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px;border-bottom:1px solid #1a1a1a;">#</th>
            <th style="text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 10px 8px;border-bottom:1px solid #1a1a1a;">Tool</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 8px 8px;border-bottom:1px solid #1a1a1a;">Score</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px 8px;border-bottom:1px solid #1a1a1a;">Stars</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px 8px;border-bottom:1px solid #1a1a1a;">Lang</th>
          </tr></thead>
          <tbody>${top10Rows}</tbody>
        </table>
      </td>
    </tr>`;

  // --- Gainers ---
  const gainersHtml = data.gainers.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Biggest Movers Up &#9650;</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>${data.gainers.slice(0, 5).map(g => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #141414;color:#e5e5e5;font-weight:600;font-size:14px;">${shortName(g.name)}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6b7280;font-size:12px;white-space:nowrap;">#${g.current_rank}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#22c55e;font-size:12px;white-space:nowrap;">${signDelta(g.score_change)}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#22c55e;font-size:11px;white-space:nowrap;">&#9650; ${g.rank_change > 0 ? '+' : ''}${g.rank_change}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </td>
    </tr>` : '';

  // --- Losers ---
  const losersHtml = data.losers.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Biggest Movers Down &#9660;</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>${data.losers.slice(0, 5).map(l => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #141414;color:#e5e5e5;font-weight:600;font-size:14px;">${shortName(l.name)}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6b7280;font-size:12px;white-space:nowrap;">#${l.current_rank}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#ef4444;font-size:12px;white-space:nowrap;">${signDelta(l.score_change)}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#ef4444;font-size:11px;white-space:nowrap;">&#9660; ${Math.abs(l.rank_change)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </td>
    </tr>` : '';

  // --- New entries ---
  const newEntriesHtml = data.new_entries.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">New in the Index</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead><tr>
            <th style="text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px;border-bottom:1px solid #1a1a1a;">Tool</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 8px 8px;border-bottom:1px solid #1a1a1a;">Score</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px 8px;border-bottom:1px solid #1a1a1a;">Stars</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px 8px;border-bottom:1px solid #1a1a1a;">Lang</th>
          </tr></thead>
          <tbody>${data.new_entries.slice(0, 10).map(e => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #141414;">
                <a href="${ghUrl(e.full_name)}" style="color:#e5e5e5;text-decoration:none;font-weight:600;font-size:14px;">${shortName(e.full_name)}</a>
                <span style="color:#374151;font-size:11px;margin-left:5px;">${e.full_name.split('/')[0]}</span>
              </td>
              <td style="padding:10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6366f1;font-weight:700;font-size:13px;white-space:nowrap;">${e.score.toFixed(1)}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6b7280;font-size:12px;white-space:nowrap;">&#9733; ${e.stars.toLocaleString()}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#374151;font-size:11px;white-space:nowrap;">${e.language || ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </td>
    </tr>` : '';

  // --- Featured tool spotlight ---
  const featuredToolHtml = data.featured_tool ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Tool Spotlight</h2>
        <div style="background:#111111;border:1px solid #1a1a1a;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:18px 20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6366f1;background:#1a1a2e;border-radius:3px;padding:2px 6px;">#${data.featured_tool.rank} This Week</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:20px;font-weight:800;color:#6366f1;">${data.featured_tool.score.toFixed(1)}</span>
              <span style="font-size:10px;color:#4b5563;margin-left:3px;">pts</span>
            </div>
          </div>
          <a href="${ghUrl(data.featured_tool.full_name)}" style="color:#e5e5e5;text-decoration:none;font-size:18px;font-weight:700;display:block;margin-bottom:4px;">${shortName(data.featured_tool.full_name)}</a>
          <div style="font-size:11px;color:#4b5563;margin-bottom:10px;">${data.featured_tool.full_name.split('/')[0]}${data.featured_tool.language ? ' &bull; ' + data.featured_tool.language : ''} &bull; &#9733; ${data.featured_tool.stars.toLocaleString()}</div>
          ${data.featured_tool.description ? `<p style="margin:0 0 12px;color:#9ca3af;font-size:13px;line-height:1.6;">${data.featured_tool.description.slice(0, 200)}${data.featured_tool.description.length > 200 ? '…' : ''}</p>` : ''}
          <a href="${toolUrl(data.featured_tool.full_name)}" style="color:#6366f1;font-size:13px;text-decoration:none;font-weight:600;">View on AgentRank &rarr;</a>
        </div>
      </td>
    </tr>` : '';

  // --- Trending skills ---
  const trendingSkillsHtml = data.top_trending_skills && data.top_trending_skills.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Trending Skills</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead><tr>
            <th style="text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px;border-bottom:1px solid #1a1a1a;">#</th>
            <th style="text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 10px 8px;border-bottom:1px solid #1a1a1a;">Skill</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 8px 8px;border-bottom:1px solid #1a1a1a;">Score</th>
            <th style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#374151;padding:0 0 8px 8px;border-bottom:1px solid #1a1a1a;">Installs</th>
          </tr></thead>
          <tbody>${data.top_trending_skills.slice(0, 5).map(s => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #141414;color:#374151;font-size:12px;font-weight:700;width:28px;">${s.rank ?? '—'}</td>
              <td style="padding:10px 10px;border-bottom:1px solid #141414;">
                <a href="https://agentrank-ai.com/skill/${s.slug}/" style="color:#e5e5e5;text-decoration:none;font-weight:600;font-size:14px;">${s.name ?? s.slug}</a>
              </td>
              <td style="padding:10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6366f1;font-weight:700;font-size:13px;white-space:nowrap;">${s.score != null ? s.score.toFixed(1) : '—'}</td>
              <td style="padding:10px 0 10px 8px;border-bottom:1px solid #141414;text-align:right;color:#6b7280;font-size:12px;white-space:nowrap;">${s.installs.toLocaleString()}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div style="margin-top:14px;text-align:right;">
          <a href="https://agentrank-ai.com/skills/" style="color:#6366f1;font-size:12px;text-decoration:none;font-weight:600;">All skills &rarr;</a>
        </div>
      </td>
    </tr>` : '';

  // --- Top news ---
  const CATEGORY_LABELS: Record<string, string> = {
    launch: 'Launch',
    update: 'Update',
    community: 'Community',
    trending: 'Trending',
    analysis: 'Analysis',
  };
  const topNewsHtml = data.top_news && data.top_news.length ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">Top News This Week</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>${data.top_news.slice(0, 7).map((n, i) => {
            const catLabel = CATEGORY_LABELS[n.category] ?? n.category;
            const link = n.source_url ?? 'https://agentrank-ai.com/news';
            const handle = n.author_handle ? `@${n.author_handle}` : '';
            return `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #141414;${i === 0 ? 'border-top:1px solid #1a1a1a;' : ''}">
                <div style="margin-bottom:4px;">
                  <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6366f1;background:#1a1a2e;border-radius:3px;padding:2px 6px;">${catLabel}</span>
                  ${handle ? `<span style="font-size:10px;color:#374151;margin-left:6px;">${handle}</span>` : ''}
                </div>
                <a href="${link}" style="color:#e5e5e5;text-decoration:none;font-size:14px;font-weight:600;line-height:1.4;display:block;margin-bottom:4px;">${n.title}</a>
                ${n.summary ? `<p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">${n.summary.slice(0, 140)}${n.summary.length > 140 ? '…' : ''}</p>` : ''}
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
        <div style="margin-top:14px;text-align:right;">
          <a href="https://agentrank-ai.com/news" style="color:#6366f1;font-size:12px;text-decoration:none;font-weight:600;">All news &rarr;</a>
        </div>
      </td>
    </tr>` : '';

  // --- Featured blog ---
  const featuredHtml = data.featured_blog ? `
    <tr>
      <td style="padding:0 0 32px;">
        <h2 style="margin:0 0 14px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:1.5px;">From the Blog</h2>
        <div style="background:#111111;border:1px solid #1a1a1a;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:18px 20px;">
          <a href="${data.featured_blog.url}" style="color:#e5e5e5;text-decoration:none;font-size:16px;font-weight:700;display:block;margin-bottom:6px;">${data.featured_blog.title}</a>
          <p style="margin:0 0 12px;color:#6b7280;font-size:13px;line-height:1.6;">${data.featured_blog.description}</p>
          <a href="${data.featured_blog.url}" style="color:#6366f1;font-size:13px;text-decoration:none;font-weight:600;">Read more &rarr;</a>
        </div>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentRank Weekly Digest — ${weekLabel}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px;border-bottom:1px solid #111111;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${leaderboard}" style="text-decoration:none;">
                      <span style="font-size:20px;font-weight:800;color:#e5e5e5;letter-spacing:-0.5px;">AgentRank</span>
                    </a>
                    <div style="font-size:11px;color:#374151;margin-top:5px;text-transform:uppercase;letter-spacing:1px;">Weekly Digest &mdash; ${weekLabel}</div>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:10px;color:#374151;text-transform:uppercase;letter-spacing:1px;">agentrank-ai.com</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:28px 0 0;"></td></tr>

          <!-- Stats -->
          ${statsHtml}

          <!-- Top 10 -->
          ${top10Html}

          <!-- Gainers -->
          ${gainersHtml}

          <!-- Losers -->
          ${losersHtml}

          <!-- New Entries -->
          ${newEntriesHtml}

          <!-- Featured Tool Spotlight -->
          ${featuredToolHtml}

          <!-- Trending Skills -->
          ${trendingSkillsHtml}

          <!-- Featured Blog -->
          ${featuredHtml}

          <!-- Top News -->
          ${topNewsHtml}

          <!-- CTA -->
          <tr>
            <td style="padding:8px 0 40px;text-align:center;">
              <a href="${leaderboard}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:0.3px;">
                View Full Leaderboard &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #111111;padding:24px 0 0;">
              <p style="margin:0;font-size:12px;color:#374151;line-height:1.7;">
                You're receiving this because you subscribed to AgentRank at
                <a href="${leaderboard}" style="color:#4b5563;text-decoration:none;">agentrank-ai.com</a>.
                &nbsp;&bull;&nbsp;
                <a href="${data.unsubscribe_url}" style="color:#374151;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Plain text builder
// ---------------------------------------------------------------------------

function buildText(data: DigestData): string {
  const weekLabel = fmtDate(data.date);
  const sep = '='.repeat(50);
  const sub = '-'.repeat(30);

  const top10Lines = data.top10
    .map(t => `  ${t.rank}. ${t.full_name} — ${t.score.toFixed(1)} pts, ${t.stars.toLocaleString()} stars`)
    .join('\n');

  const gainerLines = data.gainers.slice(0, 5)
    .map(g => `  ${g.name} — +${g.score_change.toFixed(1)} pts, up ${g.rank_change} ranks to #${g.current_rank}`)
    .join('\n') || '  None this week.';

  const loserLines = data.losers.slice(0, 5)
    .map(l => `  ${l.name} — ${l.score_change.toFixed(1)} pts, down ${Math.abs(l.rank_change)} ranks to #${l.current_rank}`)
    .join('\n');

  const newLines = data.new_entries.slice(0, 5)
    .map(e => `  ${e.full_name} — ${e.score.toFixed(1)} pts, ${e.stars.toLocaleString()} stars`)
    .join('\n') || '';

  const featuredToolSection = data.featured_tool
    ? `\nTOOL SPOTLIGHT — #${data.featured_tool.rank} THIS WEEK\n${sub}\n${data.featured_tool.full_name} — ${data.featured_tool.score.toFixed(1)} pts, ${data.featured_tool.stars.toLocaleString()} stars\n${data.featured_tool.description ? data.featured_tool.description.slice(0, 200) + (data.featured_tool.description.length > 200 ? '…' : '') + '\n' : ''}https://agentrank-ai.com/tool/${data.featured_tool.full_name}/\n`
    : '';

  const trendingSkillsSection = data.top_trending_skills && data.top_trending_skills.length
    ? `\nTRENDING SKILLS\n${sub}\n${data.top_trending_skills.slice(0, 5).map(s => `  ${s.rank ?? '?'}. ${s.name ?? s.slug} — ${s.score != null ? s.score.toFixed(1) + ' pts' : ''}, ${s.installs.toLocaleString()} installs`).join('\n')}\n`
    : '';

  const featuredSection = data.featured_blog
    ? `\nFEATURED ARTICLE\n${sub}\n${data.featured_blog.title}\n${data.featured_blog.url}\n`
    : '';

  const newsSection = data.top_news && data.top_news.length
    ? `\nTOP NEWS THIS WEEK\n${sub}\n${data.top_news.slice(0, 7).map(n => {
        const handle = n.author_handle ? ` (${n.author_handle})` : '';
        const link = n.source_url ?? 'https://agentrank-ai.com/news';
        return `  [${(n.category || 'news').toUpperCase()}] ${n.title}${handle}\n  ${link}`;
      }).join('\n\n')}\n`
    : '';

  const newSection = newLines
    ? `\nNEW IN THE INDEX\n${sub}\n${newLines}\n`
    : '';

  const losersSection = loserLines
    ? `\nBIGGEST MOVERS DOWN\n${sub}\n${loserLines}\n`
    : '';

  return `AgentRank Weekly Digest — ${weekLabel}
${sep}

STATS
${sub}
  Tools indexed: ${data.stats.total_tools.toLocaleString()}
  New this week: ${data.stats.new_tools_this_week}
  Avg score: ${data.stats.avg_score.toFixed(1)}
  Skills indexed: ${data.stats.total_skills.toLocaleString()}

TOP 10 THIS WEEK
${sub}
${top10Lines}

BIGGEST MOVERS UP
${sub}
${gainerLines}
${losersSection}${newSection}${featuredToolSection}${trendingSkillsSection}${newsSection}${featuredSection}
View the full leaderboard: https://agentrank-ai.com/
${sub}
You're receiving this because you subscribed to AgentRank.
Unsubscribe: ${data.unsubscribe_url}
`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateDigestEmail(data: DigestData): DigestEmail {
  const weekLabel = fmtDate(data.date);
  const subject = `AgentRank Weekly — ${weekLabel}`;
  return {
    subject,
    html: buildHtml(data),
    text: buildText(data),
  };
}
