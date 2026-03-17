import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug!;
  const fullName = slug.replace('--', '/');
  const { env } = (locals as any).runtime;

  const row = await env.DB.prepare(
    'SELECT full_name, score, stars, open_issues, closed_issues, contributors, dependents, last_commit_at, is_archived FROM tools WHERE full_name = ?'
  )
    .bind(fullName)
    .first();

  if (!row) {
    return new Response(notFoundSvg(slug), {
      status: 404,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' },
    });
  }

  const score = row.score as number;
  const stars = row.stars as number;
  const openIssues = row.open_issues as number;
  const closedIssues = row.closed_issues as number;
  const contributors = row.contributors as number;
  const dependents = row.dependents as number;
  const lastCommitAt = row.last_commit_at as string | null;
  const isArchived = (row.is_archived as number) === 1;

  const signals = computeSignals({ stars, openIssues, closedIssues, contributors, dependents, lastCommitAt, isArchived });

  const svg = generateWidgetSvg(fullName, score, signals);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=3600, max-age=600',
      'Access-Control-Allow-Origin': '*',
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

function generateWidgetSvg(name: string, score: number, signals: Signals): string {
  const W = 340;
  const H = 148;
  const color = scoreColor(score);
  const scoreText = score.toFixed(0);

  // Truncate long names
  const displayName = name.length > 36 ? name.slice(0, 34) + '…' : name;

  const signalRows: { label: string; value: number }[] = [
    { label: 'Stars', value: signals.stars },
    { label: 'Freshness', value: signals.freshness },
    { label: 'Issue health', value: signals.issueHealth },
    { label: 'Contributors', value: signals.contributors },
    { label: 'Dependents', value: signals.dependents },
  ];

  const barAreaX = 110;
  const barAreaW = 170;
  const barH = 5;
  const rowH = 17;
  const signalsStartY = 52;

  const barRows = signalRows.map((s, i) => {
    const y = signalsStartY + i * rowH;
    const filled = Math.round(s.value * barAreaW);
    const pct = Math.round(s.value * 100);
    return `
    <text x="108" y="${y + 8}" text-anchor="end" font-size="9" fill="#999" font-family="system-ui,sans-serif">${s.label}</text>
    <rect x="${barAreaX}" y="${y + 2}" width="${barAreaW}" height="${barH}" rx="2" fill="#2a2a2a"/>
    <rect x="${barAreaX}" y="${y + 2}" width="${filled}" height="${barH}" rx="2" fill="${color}" opacity="0.85"/>
    <text x="${barAreaX + barAreaW + 6}" y="${y + 8}" font-size="9" fill="#888" font-family="system-ui,sans-serif">${pct}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" role="img" aria-label="AgentRank widget for ${name}">
  <title>AgentRank: ${name} — Score ${scoreText}/100</title>
  <rect width="${W}" height="${H}" rx="6" fill="#111"/>
  <rect width="${W}" height="${H}" rx="6" fill="none" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Header -->
  <text x="12" y="21" font-size="10" fill="#666" font-family="system-ui,sans-serif" font-weight="600" letter-spacing="0.5">AGENTRANK</text>

  <!-- Score circle -->
  <circle cx="${W - 30}" cy="22" r="18" fill="${color}" opacity="0.15"/>
  <text x="${W - 30}" y="27" text-anchor="middle" font-size="14" fill="${color}" font-family="system-ui,sans-serif" font-weight="700">${scoreText}</text>

  <!-- Tool name -->
  <text x="12" y="40" font-size="11" fill="#e5e5e5" font-family="system-ui,sans-serif" font-weight="600">${escapeXml(displayName)}</text>

  <!-- Divider -->
  <line x1="12" y1="46" x2="${W - 12}" y2="46" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Signal bars -->
  ${barRows}

  <!-- Footer -->
  <line x1="12" y1="${H - 20}" x2="${W - 12}" y2="${H - 20}" stroke="#1e1e1e" stroke-width="1"/>
  <text x="12" y="${H - 7}" font-size="8" fill="#555" font-family="system-ui,sans-serif">agentrank-ai.com/tool/${escapeXml(name.replace('/', '--'))}/</text>
  <text x="${W - 12}" y="${H - 7}" text-anchor="end" font-size="8" fill="#444" font-family="system-ui,sans-serif">score out of 100</text>
</svg>`;
}

function notFoundSvg(slug: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="60" role="img">
  <title>AgentRank: Tool not found</title>
  <rect width="340" height="60" rx="6" fill="#111"/>
  <text x="12" y="22" font-size="10" fill="#666" font-family="system-ui,sans-serif" font-weight="600" letter-spacing="0.5">AGENTRANK</text>
  <text x="12" y="44" font-size="11" fill="#ef4444" font-family="system-ui,sans-serif">Tool not found: ${escapeXml(slug)}</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
