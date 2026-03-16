import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const start = Date.now();
  const { env } = (locals as any).runtime;
  const checks: Record<string, any> = {};
  let healthy = true;

  // DB connectivity
  try {
    const dbStart = Date.now();
    const row = await env.DB.prepare('SELECT 1 AS ok').first();
    checks.db = { ok: row?.ok === 1, latency_ms: Date.now() - dbStart };
  } catch (e: any) {
    checks.db = { ok: false, error: e.message };
    healthy = false;
  }

  // Tool stats
  try {
    const toolStats = await env.DB.prepare(
      `SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN score IS NOT NULL THEN 1 END) AS scored,
        ROUND(AVG(score), 1) AS avg_score,
        MAX(score) AS top_score,
        MAX(last_commit_at) AS latest_commit
      FROM tools`
    ).first();
    checks.tools = toolStats;
  } catch (e: any) {
    checks.tools = { error: e.message };
    healthy = false;
  }

  // Skill stats
  try {
    const skillStats = await env.DB.prepare(
      `SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN score IS NOT NULL THEN 1 END) AS scored,
        ROUND(AVG(score), 1) AS avg_score,
        MAX(score) AS top_score
      FROM skills`
    ).first();
    checks.skills = skillStats;
  } catch (e: any) {
    checks.skills = { error: e.message };
    healthy = false;
  }

  // Submission queue
  try {
    const pending = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM submissions WHERE status = 'pending'`
    ).first();
    checks.pending_submissions = pending?.count ?? 0;
  } catch {
    // non-critical
  }

  // Agent count
  try {
    const agents = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM agents`
    ).first();
    checks.agents = agents?.count ?? 0;
  } catch {
    // non-critical
  }

  const payload = {
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    response_ms: Date.now() - start,
    checks,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: healthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
};
