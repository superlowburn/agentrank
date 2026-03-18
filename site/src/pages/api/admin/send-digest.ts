/**
 * POST /api/admin/send-digest
 *
 * Sends the weekly AgentRank digest email to all subscribers via Resend.
 * Requires DASH_TOKEN auth (Bearer token in Authorization header).
 *
 * Env vars required:
 *   DASH_TOKEN       — admin auth token
 *   RESEND_API_KEY   — Resend API key (wrangler secret put RESEND_API_KEY)
 *   UNSUB_SECRET     — HMAC signing key for unsubscribe tokens (optional, falls back to DASH_TOKEN)
 *
 * Returns: { sent, failed, total, errors? }
 */

import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requireDashToken(request: Request, env: any): boolean {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  return !!token && token === env.DASH_TOKEN;
}

async function generateUnsubToken(secret: string, email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface Mover {
  full_name: string;
  current_rank: number;
  prev_rank: number;
  rank_delta: number;
  current_score: number;
  stars: number;
}

interface Tool {
  full_name: string;
  rank: number;
  score: number;
  stars: number;
  first_seen: string;
}

interface Featured {
  full_name: string;
  score: number;
  rank: number;
  stars: number;
}

interface DigestData {
  movers: Mover[];
  newTools: Tool[];
  featured: Featured | null;
  weekOf: string;
}

function toolUrl(full_name: string): string {
  return `https://agentrank-ai.com/tool/${full_name}/`;
}

function shortName(full_name: string): string {
  return full_name.split('/').pop() ?? full_name;
}

function rankArrow(delta: number): string {
  if (delta > 0) return `&#9650; +${delta}`;
  if (delta < 0) return `&#9660; ${delta}`;
  return '&#8212;';
}

function buildHtmlEmail(data: DigestData, unsubToken: string, email: string): string {
  const unsubUrl = `https://agentrank-ai.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;
  const leaderboardUrl = 'https://agentrank-ai.com/';

  const moversRows = data.movers.length
    ? data.movers.map(m => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1f2937;">
            <a href="${toolUrl(m.full_name)}" style="color:#60a5fa;text-decoration:none;font-weight:600;">${shortName(m.full_name)}</a>
            <span style="color:#6b7280;font-size:12px;margin-left:6px;">${m.full_name}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;white-space:nowrap;">
            #${m.current_rank}
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #1f2937;text-align:right;white-space:nowrap;color:${m.rank_delta > 0 ? '#34d399' : '#f87171'};">
            ${rankArrow(m.rank_delta)}
          </td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:16px 0;color:#6b7280;font-style:italic;">No significant movers this week.</td></tr>`;

  const newToolsRows = data.newTools.length
    ? data.newTools.map(t => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1f2937;">
            <a href="${toolUrl(t.full_name)}" style="color:#60a5fa;text-decoration:none;font-weight:600;">${shortName(t.full_name)}</a>
            <span style="color:#6b7280;font-size:12px;margin-left:6px;">${t.full_name}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;white-space:nowrap;">
            Score: ${t.score}
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;white-space:nowrap;">
            &#9733; ${t.stars.toLocaleString()}
          </td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:16px 0;color:#6b7280;font-style:italic;">No new tools this week.</td></tr>`;

  const featuredBlock = data.featured ? `
    <div style="background:#111827;border:1px solid #374151;border-radius:8px;padding:20px;margin:0 0 32px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;">Featured Tool of the Week</div>
      <a href="${toolUrl(data.featured.full_name)}" style="color:#f9fafb;text-decoration:none;font-size:20px;font-weight:700;display:block;margin-bottom:4px;">
        ${shortName(data.featured.full_name)}
      </a>
      <div style="color:#6b7280;font-size:13px;margin-bottom:12px;">${data.featured.full_name}</div>
      <div style="display:flex;gap:20px;">
        <span style="color:#9ca3af;">Rank <strong style="color:#e5e7eb;">#${data.featured.rank}</strong></span>
        <span style="color:#9ca3af;">Score <strong style="color:#e5e7eb;">${data.featured.score}</strong></span>
        <span style="color:#9ca3af;">Stars <strong style="color:#e5e7eb;">${data.featured.stars.toLocaleString()}</strong></span>
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentRank Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#030712;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px;">
              <a href="https://agentrank-ai.com/" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;color:#f9fafb;letter-spacing:-0.5px;">AgentRank</span>
                <span style="font-size:13px;color:#6b7280;margin-left:8px;">Weekly Digest</span>
              </a>
              <div style="font-size:12px;color:#4b5563;margin-top:4px;">Week of ${data.weekOf}</div>
            </td>
          </tr>

          <!-- Featured -->
          <tr><td>${featuredBlock}</td></tr>

          <!-- Movers -->
          <tr>
            <td style="padding:0 0 32px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">
                Top Movers This Week
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">Tool</th>
                    <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 12px 8px;border-bottom:1px solid #1f2937;">Rank</th>
                    <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 0 8px 12px;border-bottom:1px solid #1f2937;">Change</th>
                  </tr>
                </thead>
                <tbody>${moversRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- New Tools -->
          <tr>
            <td style="padding:0 0 32px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#f9fafb;text-transform:uppercase;letter-spacing:0.5px;">
                New in the Index
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 0 8px;border-bottom:1px solid #1f2937;">Tool</th>
                    <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 12px 8px;border-bottom:1px solid #1f2937;">Score</th>
                    <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b5563;padding:0 0 8px 12px;border-bottom:1px solid #1f2937;">Stars</th>
                  </tr>
                </thead>
                <tbody>${newToolsRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 0 40px;text-align:center;">
              <a href="${leaderboardUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
                View Full Leaderboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #111827;padding:24px 0 0;">
              <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
                You're receiving this because you subscribed to AgentRank at <a href="https://agentrank-ai.com/" style="color:#4b5563;">agentrank-ai.com</a>.
                <br>
                <a href="${unsubUrl}" style="color:#4b5563;">Unsubscribe</a>
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

function buildTextEmail(data: DigestData, unsubToken: string, email: string): string {
  const unsubUrl = `https://agentrank-ai.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;

  const moversText = data.movers.length
    ? data.movers.map(m =>
        `  ${shortName(m.full_name)} (${m.full_name}) — Rank #${m.current_rank} (${m.rank_delta > 0 ? '+' : ''}${m.rank_delta} from #${m.prev_rank})`
      ).join('\n')
    : '  No significant movers this week.';

  const newToolsText = data.newTools.length
    ? data.newTools.map(t =>
        `  ${shortName(t.full_name)} (${t.full_name}) — Score: ${t.score}, Stars: ${t.stars}`
      ).join('\n')
    : '  No new tools this week.';

  const featuredText = data.featured
    ? `FEATURED TOOL: ${shortName(data.featured.full_name)}\n${toolUrl(data.featured.full_name)}\nRank #${data.featured.rank} · Score ${data.featured.score} · ${data.featured.stars.toLocaleString()} stars\n\n`
    : '';

  return `AgentRank Weekly Digest — ${data.weekOf}
${'='.repeat(50)}

${featuredText}TOP MOVERS THIS WEEK
${'─'.repeat(30)}
${moversText}

NEW IN THE INDEX
${'─'.repeat(30)}
${newToolsText}

View the full leaderboard: https://agentrank-ai.com/

${'─'.repeat(50)}
You're receiving this because you subscribed to AgentRank.
Unsubscribe: ${unsubUrl}
`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  if (!requireDashToken(request, env)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const resendKey: string | undefined = env.RESEND_API_KEY;
  if (!resendKey) {
    return json({
      error: 'RESEND_API_KEY not configured.',
      hint: 'Add it via: wrangler secret put RESEND_API_KEY --env production',
    }, 503);
  }

  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7);
  const prevDate = d.toISOString().slice(0, 10);

  const db: D1Database = env.DB;

  const [moversResult, newToolsResult, featuredRow, subsResult] = await Promise.all([
    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank AS current_rank,
        prev.rank AS prev_rank,
        (prev.rank - cur.rank) AS rank_delta,
        cur.score AS current_score,
        cur.stars
      FROM rank_history cur
      JOIN rank_history prev
        ON cur.tool_full_name = prev.tool_full_name
       AND cur.tool_type = prev.tool_type
      WHERE cur.snapshot_date = ?1
        AND prev.snapshot_date = (
          SELECT MAX(snapshot_date) FROM rank_history
          WHERE snapshot_date <= ?2
            AND tool_full_name = cur.tool_full_name
            AND tool_type = cur.tool_type
        )
        AND cur.tool_type = 'tool'
        AND ABS(prev.rank - cur.rank) >= 1
      ORDER BY ABS(prev.rank - cur.rank) DESC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank,
        cur.score,
        cur.stars,
        MIN(rh.snapshot_date) AS first_seen
      FROM rank_history cur
      JOIN rank_history rh
        ON rh.tool_full_name = cur.tool_full_name
       AND rh.tool_type = cur.tool_type
      WHERE cur.snapshot_date = ?1
        AND cur.tool_type = 'tool'
      GROUP BY cur.tool_full_name, cur.tool_type
      HAVING first_seen >= ?2
      ORDER BY cur.score DESC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    db.prepare(`
      SELECT tool_full_name AS full_name, score, rank, stars
      FROM rank_history
      WHERE snapshot_date = ? AND tool_type = 'tool'
      ORDER BY score DESC LIMIT 1
    `).bind(today).first<{ full_name: string; score: number; rank: number; stars: number }>()
      .catch(() => null),

    db.prepare(`SELECT email FROM email_subscribers ORDER BY subscribed_at ASC`)
      .all().catch(() => ({ results: [] as unknown[] })),
  ]);

  const movers: Mover[] = (moversResult.results || []).map((r: any) => ({
    full_name: r.full_name,
    current_rank: r.current_rank,
    prev_rank: r.prev_rank,
    rank_delta: r.rank_delta,
    current_score: Math.round(r.current_score * 10) / 10,
    stars: r.stars,
  }));

  const newTools: Tool[] = (newToolsResult.results || []).map((r: any) => ({
    full_name: r.full_name,
    rank: r.rank,
    score: Math.round(r.score * 10) / 10,
    stars: r.stars,
    first_seen: r.first_seen,
  }));

  const featured: Featured | null = featuredRow
    ? {
        full_name: featuredRow.full_name,
        score: Math.round(featuredRow.score * 10) / 10,
        rank: featuredRow.rank,
        stars: featuredRow.stars,
      }
    : null;

  const subscribers = (subsResult.results || []).map((r: any) => r.email as string);

  if (subscribers.length === 0) {
    return json({ sent: 0, failed: 0, total: 0, message: 'No subscribers found.' });
  }

  const digestData: DigestData = { movers, newTools, featured, weekOf: today };
  const unsubSecret: string = env.UNSUB_SECRET || env.DASH_TOKEN || 'change-me';

  const weekLabel = new Date(today + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  const subject = `AgentRank Weekly — ${weekLabel}`;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of subscribers) {
    try {
      const token = await generateUnsubToken(unsubSecret, email);
      const html = buildHtmlEmail(digestData, token, email);
      const text = buildTextEmail(digestData, token, email);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AgentRank <digest@agentrank-ai.com>',
          to: email,
          subject,
          html,
          text,
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        const errText = await res.text().catch(() => '');
        errors.push(`${email}: HTTP ${res.status} — ${errText.slice(0, 200)}`);
        failed++;
      }
    } catch (e: any) {
      errors.push(`${email}: ${e?.message ?? 'unknown error'}`);
      failed++;
    }
  }

  return json({
    sent,
    failed,
    total: subscribers.length,
    weekOf: today,
    ...(errors.length ? { errors: errors.slice(0, 10) } : {}),
  });
};

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<{ results: unknown[] }>;
  first<T = unknown>(): Promise<T | null>;
}
