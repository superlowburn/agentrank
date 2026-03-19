import type { APIRoute } from 'astro';

export const prerender = false;

/** GET /api/auth/github/developer — start GitHub OAuth for developer dashboard login. */
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);

  try {
    const { env } = (locals as any).runtime;

    if (!env.GITHUB_CLIENT_ID) {
      return new Response(null, {
        status: 302,
        headers: { Location: new URL('/developer/?error=oauth_not_configured', url.origin).toString() },
      });
    }

    const nonce = crypto.randomUUID();
    const stateData = JSON.stringify({ intent: 'developer', nonce });
    const state = btoa(stateData);

    const githubUrl = new URL('https://github.com/login/oauth/authorize');
    githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    githubUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/github/callback`);
    githubUrl.searchParams.set('scope', 'read:user');
    githubUrl.searchParams.set('state', state);

    const headers = new Headers({ Location: githubUrl.toString() });
    headers.append(
      'Set-Cookie',
      `oauth_nonce=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=600`
    );

    return new Response(null, { status: 302, headers });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
};
