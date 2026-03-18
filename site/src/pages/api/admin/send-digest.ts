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
 * Returns: { sent, failed, total, weekOf, errors? }
 */

import type { APIRoute } from 'astro';
import { generateDigestEmail } from '../../../lib/email-template';
import type { DigestData } from '../../../lib/email-template';

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

  const [statsRow, top10Result, gainersResult, losersResult, newEntriesResult, subsResult] = await Promise.all([
    // Stats: counts and avg score from today's snapshot
    db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM rank_history WHERE snapshot_date = ?1 AND tool_type = 'tool') AS total_tools,
        (SELECT COUNT(*) FROM rank_history WHERE snapshot_date = ?1 AND tool_type = 'skill') AS total_skills,
        (SELECT ROUND(AVG(score), 1) FROM rank_history WHERE snapshot_date = ?1 AND tool_type = 'tool') AS avg_score
    `).bind(today).first<{ total_tools: number; total_skills: number; avg_score: number }>()
      .catch(() => null),

    // Top 10 by rank, join tools for language
    db.prepare(`
      SELECT rh.rank, rh.tool_full_name AS full_name, rh.score, rh.stars,
             COALESCE(t.language, '') AS language
      FROM rank_history rh
      LEFT JOIN tools t ON t.full_name = rh.tool_full_name
      WHERE rh.snapshot_date = ?1 AND rh.tool_type = 'tool'
      ORDER BY rh.rank ASC
      LIMIT 10
    `).bind(today).all().catch(() => ({ results: [] as unknown[] })),

    // Gainers: tools whose score improved vs prior snapshot
    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank AS current_rank,
        (prev.rank - cur.rank) AS rank_change,
        cur.score AS current_score,
        ROUND(cur.score - prev.score, 1) AS score_change
      FROM rank_history cur
      JOIN rank_history prev
        ON cur.tool_full_name = prev.tool_full_name
       AND cur.tool_type = prev.tool_type
      WHERE cur.snapshot_date = ?1
        AND cur.tool_type = 'tool'
        AND prev.snapshot_date = (
          SELECT MAX(snapshot_date) FROM rank_history
          WHERE snapshot_date <= ?2
            AND tool_full_name = cur.tool_full_name
            AND tool_type = cur.tool_type
        )
        AND (cur.score - prev.score) > 0
      ORDER BY (cur.score - prev.score) DESC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    // Losers: tools whose score dropped vs prior snapshot
    db.prepare(`
      SELECT
        cur.tool_full_name AS full_name,
        cur.rank AS current_rank,
        (prev.rank - cur.rank) AS rank_change,
        cur.score AS current_score,
        ROUND(cur.score - prev.score, 1) AS score_change
      FROM rank_history cur
      JOIN rank_history prev
        ON cur.tool_full_name = prev.tool_full_name
       AND cur.tool_type = prev.tool_type
      WHERE cur.snapshot_date = ?1
        AND cur.tool_type = 'tool'
        AND prev.snapshot_date = (
          SELECT MAX(snapshot_date) FROM rank_history
          WHERE snapshot_date <= ?2
            AND tool_full_name = cur.tool_full_name
            AND tool_type = cur.tool_type
        )
        AND (cur.score - prev.score) < 0
      ORDER BY (cur.score - prev.score) ASC
      LIMIT 5
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    // New entries: first appeared on or after prevDate
    db.prepare(`
      SELECT
        rh.tool_full_name AS full_name,
        rh.score,
        rh.stars,
        COALESCE(t.language, '') AS language,
        MIN(rh2.snapshot_date) AS first_seen
      FROM rank_history rh
      JOIN rank_history rh2
        ON rh2.tool_full_name = rh.tool_full_name
       AND rh2.tool_type = rh.tool_type
      LEFT JOIN tools t ON t.full_name = rh.tool_full_name
      WHERE rh.snapshot_date = ?1
        AND rh.tool_type = 'tool'
      GROUP BY rh.tool_full_name, rh.tool_type
      HAVING first_seen >= ?2
      ORDER BY rh.score DESC
      LIMIT 10
    `).bind(today, prevDate).all().catch(() => ({ results: [] as unknown[] })),

    // Subscribers
    db.prepare(`SELECT email FROM email_subscribers ORDER BY subscribed_at ASC`)
      .all().catch(() => ({ results: [] as unknown[] })),
  ]);

  const stats = {
    total_tools: statsRow?.total_tools ?? 0,
    total_skills: statsRow?.total_skills ?? 0,
    avg_score: typeof statsRow?.avg_score === 'number' ? statsRow.avg_score : 0,
    new_tools_this_week: 0, // filled below
  };

  const top10 = (top10Result.results || []).map((r: any) => ({
    rank: r.rank,
    full_name: r.full_name,
    score: Math.round(r.score * 10) / 10,
    stars: r.stars,
    language: r.language ?? '',
  }));

  const gainers = (gainersResult.results || []).map((r: any) => ({
    name: r.full_name,
    current_rank: r.current_rank,
    rank_change: r.rank_change,
    current_score: Math.round(r.current_score * 10) / 10,
    score_change: Math.round(r.score_change * 10) / 10,
  }));

  const losers = (losersResult.results || []).map((r: any) => ({
    name: r.full_name,
    current_rank: r.current_rank,
    rank_change: r.rank_change,
    current_score: Math.round(r.current_score * 10) / 10,
    score_change: Math.round(r.score_change * 10) / 10,
  }));

  const new_entries = (newEntriesResult.results || []).map((r: any) => ({
    full_name: r.full_name,
    score: Math.round(r.score * 10) / 10,
    stars: r.stars,
    language: r.language ?? '',
  }));

  stats.new_tools_this_week = new_entries.length;

  const subscribers = (subsResult.results || []).map((r: any) => r.email as string);

  if (subscribers.length === 0) {
    return json({ sent: 0, failed: 0, total: 0, message: 'No subscribers found.' });
  }

  const unsubSecret: string = env.UNSUB_SECRET || env.DASH_TOKEN || 'change-me';

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of subscribers) {
    try {
      const token = await generateUnsubToken(unsubSecret, email);
      const unsubscribe_url = `https://agentrank-ai.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

      const digestData: DigestData = {
        date: today,
        stats,
        top10,
        gainers,
        losers,
        new_entries,
        unsubscribe_url,
      };

      const { html, text, subject } = generateDigestEmail(digestData);

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
