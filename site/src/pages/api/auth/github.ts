import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const { env } = (locals as any).runtime;
  const url = new URL(request.url);
  const tool = url.searchParams.get('tool');
  const type = url.searchParams.get('type') || 'tool';

  if (!tool) {
    return new Response('Missing tool parameter', { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID) {
    const claimUrl = new URL(`/claim/${tool}`, url.origin);
    claimUrl.searchParams.set('error', 'oauth_not_configured');
    return new Response(null, { status: 302, headers: { Location: claimUrl.toString() } });
  }

  const nonce = crypto.randomUUID();
  const stateData = JSON.stringify({ tool, type, nonce });
  const state = btoa(stateData);

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/github/callback`);
  githubUrl.searchParams.set('scope', 'read:user');
  githubUrl.searchParams.set('state', state);

  const headers = new Headers({
    Location: githubUrl.toString(),
  });
  headers.append(
    'Set-Cookie',
    `oauth_nonce=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/github/callback; Max-Age=600`
  );

  return new Response(null, { status: 302, headers });
};
