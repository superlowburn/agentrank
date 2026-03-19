import type { APIRoute } from 'astro';
import { signSession, buildSessionCookie } from '../../../../lib/session';
import { generateApiKey } from '../../../../lib/api-auth';

export const prerender = false;

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split('; ').filter(Boolean).map((c) => {
      const i = c.indexOf('=');
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

export const GET: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const redirect = (path: string, extraHeaders?: Headers) => {
    const headers = extraHeaders ?? new Headers();
    headers.set('Location', new URL(path, url.origin).toString());
    return new Response(null, { status: 302, headers });
  };

  // Decode state early so we can redirect to the right page on errors
  let stateData: { tool?: string; type?: string; intent?: string; nonce: string } | null = null;
  if (stateParam) {
    try {
      stateData = JSON.parse(atob(stateParam));
    } catch {
      // stateData stays null
    }
  }

  const isDeveloperFlow = stateData?.intent === 'developer';
  const toolPath = stateData?.tool ? `/claim/${stateData.tool}/` : '/';
  const errorRedirect = isDeveloperFlow ? '/developer/?error=' : `${toolPath}?error=`;

  if (errorParam || !code || !stateParam) {
    return redirect(`${errorRedirect}cancelled`);
  }

  if (!stateData) {
    return redirect(`${errorRedirect}invalid_state`);
  }

  // CSRF check — nonce in state must match nonce cookie
  const cookies = parseCookies(request.headers.get('cookie') || '');
  if (!stateData.nonce || cookies.oauth_nonce !== stateData.nonce) {
    return redirect(`${errorRedirect}csrf`);
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/auth/github/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return redirect(`${errorRedirect}token`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token || tokenData.error) {
    return redirect(`${errorRedirect}token`);
  }

  // Get authenticated user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AgentRank/1.0' },
  });

  if (!userRes.ok) {
    return redirect(`${errorRedirect}user`);
  }

  const user = (await userRes.json()) as { login: string; id: number };

  // === Developer dashboard flow ===
  if (isDeveloperFlow) {
    const secret = env.DASH_TOKEN || 'fallback-secret';

    // Ensure user has at least one active API key (create free key if not)
    const existingKey = await env.DB.prepare(
      `SELECT id FROM api_keys WHERE github_user_id = ? AND is_active = 1 LIMIT 1`
    ).bind(user.id).first<{ id: string }>();

    if (!existingKey) {
      try {
        const { id, keyHash, keyPrefix } = await generateApiKey('free');
        await env.DB.prepare(
          `INSERT INTO api_keys (id, key_hash, key_prefix, name, tier, github_user_id, github_username, is_active)
           VALUES (?1, ?2, ?3, 'Default', 'free', ?4, ?5, 1)`
        ).bind(id, keyHash, keyPrefix, user.id, user.login).run();
      } catch {
        // Ignore insert errors (e.g. race conditions) — key may already exist
      }
    }

    // Set signed session cookie and redirect to dashboard
    const sessionValue = await signSession(secret, { userId: user.id, username: user.login });
    const headers = new Headers();
    headers.append('Set-Cookie', `oauth_nonce=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=0`);
    headers.append('Set-Cookie', buildSessionCookie(sessionValue));
    return redirect('/developer/dashboard/', headers);
  }

  // === Claim flow ===
  if (!stateData.tool) {
    return redirect('/?error=invalid_state');
  }

  const fullName = stateData.tool.replace('--', '/');
  const [owner, repo] = fullName.split('/');
  let isContributor = false;

  // Check repo owner
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AgentRank/1.0' },
  });
  if (repoRes.ok) {
    const repoData = (await repoRes.json()) as { owner?: { login: string } };
    if (repoData.owner?.login?.toLowerCase() === user.login.toLowerCase()) {
      isContributor = true;
    }
  }

  // Check contributors list (top 100)
  if (!isContributor) {
    const contribRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AgentRank/1.0' },
      }
    );
    if (contribRes.ok) {
      const contributors = (await contribRes.json()) as Array<{ login: string }>;
      isContributor = contributors.some((c) => c.login.toLowerCase() === user.login.toLowerCase());
    }
  }

  if (!isContributor) {
    return redirect(`/claim/${stateData.tool}/?error=not_contributor`);
  }

  // Upsert verified claim
  await env.DB.prepare(`
    INSERT INTO claims (tool_full_name, tool_type, github_username, github_user_id, verified, status)
    VALUES (?, ?, ?, ?, 1, 'active')
    ON CONFLICT(tool_full_name, github_username) DO UPDATE SET
      verified = 1,
      status = 'active',
      updated_at = datetime('now')
  `).bind(fullName, stateData.type, user.login, user.id).run();

  // Set session cookie and redirect to claim page
  const session = `${stateData.tool}:${user.login}`;
  const headers = new Headers({
    Location: new URL(`/claim/${stateData.tool}/?verified=1`, url.origin).toString(),
  });
  headers.append(
    'Set-Cookie',
    `oauth_nonce=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=0`
  );
  headers.append(
    'Set-Cookie',
    `claim_session=${encodeURIComponent(session)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
  );

  return new Response(null, { status: 302, headers });
};
