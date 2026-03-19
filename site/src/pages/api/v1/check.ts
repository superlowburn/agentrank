import type { APIRoute } from 'astro';

export const prerender = false;

const HOURLY_LIMIT = 10;

async function checkHourlyLimit(db: any, ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const window = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const key = `chk:${ip}`;

  try {
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (ip, window, count)
         VALUES (?1, ?2, 1)
         ON CONFLICT (ip, window) DO UPDATE SET count = count + 1
         RETURNING count`
      )
      .bind(key, window)
      .first<{ count: number }>();

    const count = row?.count ?? 1;

    // Occasionally prune old windows
    if (Math.random() < 0.02) {
      const cutoff = new Date(now.getTime() - 2 * 3600 * 1000).toISOString().slice(0, 13);
      db.prepare(`DELETE FROM rate_limits WHERE ip LIKE 'chk:%' AND window < ?`).bind(cutoff).run().catch(() => {});
    }

    return { allowed: count <= HOURLY_LIMIT, remaining: Math.max(0, HOURLY_LIMIT - count) };
  } catch {
    return { allowed: true, remaining: HOURLY_LIMIT };
  }
}

export const GET: APIRoute = async ({ url, locals, request }) => {
  const { env } = (locals as any).runtime;
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '0.0.0.0';

  const rl = await checkHourlyLimit(env.DB, ip);
  const rlHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(HOURLY_LIMIT),
    'X-RateLimit-Remaining': String(rl.remaining),
  };

  if (!rl.allowed) {
    return json({ error: 'Rate limit exceeded. Max 10 checks per hour.' }, 429, rlHeaders);
  }

  const input = (url.searchParams.get('url') || '').trim();

  if (!input) {
    return json({ error: 'Missing url parameter.' }, 400, rlHeaders);
  }

  if (input.length > 500) {
    return json({ error: 'URL too long.' }, 400, rlHeaders);
  }

  const match = input.match(/github\.com\/([^/\s]+\/[^/\s#?]+)/);
  if (!match) {
    return json({ error: 'Invalid GitHub URL. Expected: https://github.com/owner/repo' }, 400, rlHeaders);
  }
  const repo = match[1].replace(/\.git$/, '').replace(/\/$/, '');

  try {
    const row = await env.DB.prepare('SELECT * FROM tools WHERE full_name = ?').bind(repo).first();

    if (!row) {
      return json({ found: false, repo }, 404, rlHeaders);
    }

    const stars = row.stars as number;
    const openIssues = row.open_issues as number;
    const closedIssues = row.closed_issues as number;
    const contributors = row.contributors as number;
    const dependents = row.dependents as number;
    const lastCommitAt = row.last_commit_at as string | null;
    const isArchived = (row.is_archived as number) === 1;
    const description = row.description as string | null;
    const license = row.license as string | null;

    const signals = computeSignals({ stars, openIssues, closedIssues, contributors, dependents, lastCommitAt, isArchived, description, license });
    const hasDependents = dependents > 0;

    const weights = hasDependents
      ? { stars: 0.12, freshness: 0.23, issueHealth: 0.24, contributors: 0.09, dependents: 0.24, descriptionQuality: 0.05, licenseHealth: 0.03 }
      : { stars: 0.16, freshness: 0.30, issueHealth: 0.32, contributors: 0.12, dependents: 0.00, descriptionQuality: 0.07, licenseHealth: 0.03 };

    const score = Math.round((row.score as number) * 10) / 10;

    return json(
      {
        found: true,
        name: row.full_name as string,
        description,
        score,
        rank: row.rank as number,
        githubUrl: row.url as string,
        language: row.language as string | null,
        license,
        isArchived,
        stars,
        contributors,
        dependents,
        openIssues,
        closedIssues,
        lastCommitAt,
        signals: {
          stars: r3(signals.stars),
          freshness: r3(signals.freshness),
          issueHealth: r3(signals.issueHealth),
          contributors: r3(signals.contributors),
          dependents: r3(signals.dependents),
          descriptionQuality: r3(signals.descriptionQuality),
          licenseHealth: r3(signals.licenseHealth),
        },
        weights,
      },
      200,
      { ...rlHeaders, 'Cache-Control': 'public, s-maxage=300, max-age=60', 'Access-Control-Allow-Origin': '*' }
    );
  } catch (e: any) {
    return json({ error: 'Database error', detail: e.message }, 500, rlHeaders);
  }
};

function computeSignals(r: {
  stars: number; openIssues: number; closedIssues: number; contributors: number;
  dependents: number; lastCommitAt: string | null; isArchived: boolean;
  description: string | null; license: string | null;
}) {
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

  const descLen = r.description?.length ?? 0;
  const descriptionQuality = !r.description ? 0 : descLen < 50 ? 0.3 : descLen < 150 ? 0.7 : 1.0;

  const goodLicenses = ['mit', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', 'isc', 'mpl-2.0'];
  const licenseKey = (r.license ?? '').toLowerCase();
  const licenseHealth = goodLicenses.some(l => licenseKey.includes(l)) ? 1.0 : r.license ? 0.5 : 0.0;

  return { stars, freshness, issueHealth, contributors, dependents, descriptionQuality, licenseHealth };
}

function r3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}
