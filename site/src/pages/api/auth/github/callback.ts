import type { APIRoute } from 'astro';

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

  const redirect = (path: string) =>
    new Response(null, { status: 302, headers: { Location: new URL(path, url.origin).toString() } });

  if (errorParam || !code || !stateParam) {
    return redirect('/claim/?error=cancelled');
  }

  // Decode state
  let stateData: { tool: string; type: string; nonce: string };
  try {
    stateData = JSON.parse(atob(stateParam));
  } catch {
    return redirect('/claim/?error=invalid_state');
  }

  // CSRF check — nonce in state must match nonce cookie
  const cookies = parseCookies(request.headers.get('cookie') || '');
  if (!stateData.nonce || cookies.oauth_nonce !== stateData.nonce) {
    return redirect('/claim/?error=csrf');
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
    return redirect(`/claim/${stateData.tool}/?error=token`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token || tokenData.error) {
    return redirect(`/claim/${stateData.tool}/?error=token`);
  }

  // Get authenticated user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AgentRank/1.0' },
  });

  if (!userRes.ok) {
    return redirect(`/claim/${stateData.tool}/?error=user`);
  }

  const user = (await userRes.json()) as { login: string; id: number };

  // Verify contributor/owner status
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
