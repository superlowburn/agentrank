import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');
  const { env } = (locals as any).runtime;

  const row = await env.DB.prepare(
    'SELECT full_name, score, rank, stars, open_issues, closed_issues, contributors, dependents, last_commit_at, is_archived, description FROM tools WHERE full_name = ?'
  )
    .bind(fullName)
    .first();

  if (!row) {
    return new Response(notFoundHtml(slug), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
    });
  }

  const score = row.score as number;
  const rank = row.rank as number | null;
  const stars = row.stars as number;
  const openIssues = row.open_issues as number;
  const closedIssues = row.closed_issues as number;
  const contributors = row.contributors as number;
  const dependents = row.dependents as number;
  const lastCommitAt = row.last_commit_at as string | null;
  const isArchived = (row.is_archived as number) === 1;
  const description = row.description as string | null;

  const signals = computeSignals({ stars, openIssues, closedIssues, contributors, dependents, lastCommitAt, isArchived });
  const toolUrl = `https://agentrank-ai.com/tool/${slug}/`;

  return new Response(generateWidgetHtml(fullName, score, rank, signals, description, lastCommitAt, toolUrl), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=3600, max-age=600',
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
};

interface Signals {
  stars: number;
  freshness: number;
  issueHealth: number;
  contributors: number;
  dependents: number;
}

function computeSignals(r: {
  stars: number; openIssues: number; closedIssues: number;
  contributors: number; dependents: number; lastCommitAt: string | null; isArchived: boolean;
}): Signals {
  const days = r.lastCommitAt
    ? Math.max(0, (Date.now() - new Date(r.lastCommitAt).getTime()) / 86_400_000)
    : 365;

  let freshness: number;
  if (r.isArchived) {
    freshness = 0;
  } else if (days <= 7) {
    freshness = 1.0;
  } else if (days <= 90) {
    freshness = 1.0 - (days - 7) / (90 - 7);
  } else {
    freshness = Math.max(0, Math.exp(-(days - 90) / 90) * 0.1);
  }
  const isEstablished = r.stars >= 200 || r.dependents >= 5;
  if (isEstablished && freshness < 0.3) freshness = 0.3;

  const totalIssues = r.openIssues + r.closedIssues;
  const issueHealth = totalIssues === 0 ? 0.5 : r.closedIssues / totalIssues;
  const stars = Math.min(1, Math.log1p(r.stars) / Math.log1p(5000));
  const contributors = Math.min(1, Math.log1p(r.contributors) / Math.log1p(50));
  const dependents = Math.min(1, Math.log1p(r.dependents) / Math.log1p(100));

  return { stars, freshness, issueHealth, contributors, dependents };
}

function scoreColor(score: number): string {
  if (score > 70) return '#22c55e';
  if (score > 40) return '#eab308';
  return '#ef4444';
}

function scoreColorLight(score: number): string {
  if (score > 70) return '#16a34a';
  if (score > 40) return '#ca8a04';
  return '#dc2626';
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return 'unknown';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateWidgetHtml(
  name: string,
  score: number,
  rank: number | null,
  signals: Signals,
  description: string | null,
  lastCommitAt: string | null,
  toolUrl: string,
): string {
  const color = scoreColor(score);
  const colorLight = scoreColorLight(score);
  const scoreText = score.toFixed(0);
  const displayName = name.length > 40 ? name.slice(0, 38) + '…' : name;
  const displayDesc = description
    ? (description.length > 90 ? description.slice(0, 88) + '…' : description)
    : '';
  const rankText = rank ? `#${rank}` : '';
  const updatedText = relativeDate(lastCommitAt);

  const signalRows: { label: string; value: number }[] = [
    { label: 'Stars', value: signals.stars },
    { label: 'Freshness', value: signals.freshness },
    { label: 'Issue health', value: signals.issueHealth },
    { label: 'Contributors', value: signals.contributors },
    { label: 'Dependents', value: signals.dependents },
  ];

  const barsHtml = signalRows.map(s => {
    const pct = Math.round(s.value * 100);
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span class="sig-label">${s.label}</span>
        <div class="sig-track">
          <div class="sig-fill" style="width:${pct}%;background:${color};" data-color-light="${colorLight}"></div>
        </div>
        <span class="sig-pct">${pct}</span>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AgentRank: ${esc(name)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;padding:14px 16px;}
  a{color:inherit;text-decoration:none;}
  a:hover .name{text-decoration:underline;}
  .sig-label{font-size:10px;color:#888;width:82px;text-align:right;flex-shrink:0;}
  .sig-track{flex:1;height:4px;background:#222;border-radius:3px;overflow:hidden;}
  .sig-fill{height:100%;opacity:.85;border-radius:3px;transition:width .3s;}
  .sig-pct{font-size:10px;color:#666;width:24px;flex-shrink:0;}
  .label{font-size:9px;letter-spacing:.6px;font-weight:600;margin-bottom:3px;}
  .footer{margin-top:8px;border-top:1px solid #1a1a1a;padding-top:6px;display:flex;justify-content:space-between;align-items:center;}
  .footer-left{display:flex;align-items:center;gap:6px;}
  .rank-chip{font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600;font-variant-numeric:tabular-nums;}

  /* Dark (default) */
  body{background:#111;color:#e5e5e5;}
  .label{color:#555;}
  .name{color:#e5e5e5;}
  .desc{color:#888;}
  .footer span{color:#444;}
  .rank-chip{background:#1e1e1e;color:#888;}
  .divider{border-top:1px solid #1e1e1e;}

  /* Light */
  @media (prefers-color-scheme: light) {
    body{background:#fff;color:#18181b;}
    .label{color:#a1a1aa;}
    .name{color:#18181b;}
    .desc{color:#71717a;}
    .sig-label{color:#71717a;}
    .sig-track{background:#e4e4e7;}
    .sig-pct{color:#a1a1aa;}
    .footer{border-top-color:#e4e4e7;}
    .footer span{color:#a1a1aa;}
    .rank-chip{background:#f4f4f5;color:#71717a;}
    .divider{border-top-color:#e4e4e7;}
    .sig-fill{opacity:1;}
  }
</style>
</head>
<body>
  <a href="${esc(toolUrl)}" target="_blank" rel="noopener" style="display:block;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
      <div style="min-width:0;flex:1;">
        <div class="label">AGENTRANK</div>
        <div class="name" style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(displayName)}</div>
        ${displayDesc ? `<div class="desc" style="font-size:10px;margin-top:2px;line-height:1.3;">${esc(displayDesc)}</div>` : ''}
      </div>
      <div style="flex-shrink:0;margin-left:12px;text-align:center;">
        <div style="width:44px;height:44px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;">
          <span style="font-size:16px;font-weight:800;color:${color};">${esc(scoreText)}</span>
        </div>
        <div style="font-size:8px;color:#555;margin-top:2px;">/ 100</div>
      </div>
    </div>
    <div class="divider" style="padding-top:8px;margin-top:4px;">
      ${barsHtml}
    </div>
    <div class="footer">
      <div class="footer-left">
        <span style="font-size:9px;">agentrank-ai.com</span>
        ${rankText ? `<span class="rank-chip">${esc(rankText)}</span>` : ''}
      </div>
      <span style="font-size:9px;">updated ${esc(updatedText)}</span>
    </div>
  </a>
  <script>
    // Apply light-mode colors to signal bars via JS (since CSS can't override inline style for background)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.querySelectorAll('.sig-fill').forEach(function(el) {
        var lc = el.getAttribute('data-color-light');
        if (lc) el.style.background = lc;
      });
      document.querySelectorAll('[style*="border:2px solid"]').forEach(function(el) {
        // score circle — recolor to light variant handled via inline style
      });
    }
  </script>
</body>
</html>`;
}

function notFoundHtml(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>AgentRank: Not Found</title>
<style>
  body{background:#111;color:#e5e5e5;font-family:system-ui,sans-serif;padding:14px 16px;}
  @media(prefers-color-scheme:light){body{background:#fff;color:#18181b;}}
</style>
</head>
<body>
  <div style="font-size:9px;color:#555;letter-spacing:.6px;font-weight:600;margin-bottom:6px;">AGENTRANK</div>
  <div style="font-size:12px;color:#ef4444;">Tool not found: ${esc(slug)}</div>
  <div style="margin-top:8px;font-size:10px;color:#666;"><a href="https://agentrank-ai.com" style="color:#666;">agentrank-ai.com</a></div>
</body>
</html>`;
}
