/**
 * GET /api/unsubscribe?email=<email>&token=<hmac-token>
 *
 * Verifies the HMAC token and removes the subscriber from the list.
 * Token is HMAC-SHA256(UNSUB_SECRET || DASH_TOKEN, email).
 *
 * Returns an HTML confirmation page (no JSON — this is clicked from an email link).
 */

import type { APIRoute } from 'astro';

export const prerender = false;

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function page(title: string, heading: string, body: string, isError = false): string {
  const color = isError ? '#f87171' : '#34d399';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — AgentRank</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#030712;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{max-width:480px;width:100%;text-align:center}
    .icon{font-size:40px;margin-bottom:16px}
    h1{font-size:22px;font-weight:700;color:${color};margin-bottom:12px}
    p{color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:24px}
    a{display:inline-block;color:#60a5fa;text-decoration:none;font-size:14px;padding:10px 20px;border:1px solid #1f2937;border-radius:6px}
    a:hover{border-color:#374151;color:#93c5fd}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? '&#10007;' : '&#10003;'}</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a href="https://agentrank-ai.com/">Back to AgentRank</a>
  </div>
</body>
</html>`;
}

async function verifyUnsubToken(secret: string, email: string, token: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = new Uint8Array(
      token.match(/.{2}/g)!.map(h => parseInt(h, 16))
    );
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(email));
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ url, locals }) => {
  const { env } = (locals as any).runtime;

  const email = url.searchParams.get('email')?.trim().toLowerCase();
  const token = url.searchParams.get('token')?.trim();

  if (!email || !token) {
    return htmlResponse(
      page('Invalid Link', 'Invalid unsubscribe link', 'This link is missing required parameters. Please use the unsubscribe link from your email.', true),
      400
    );
  }

  // Validate token format (64 hex chars = SHA-256)
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return htmlResponse(
      page('Invalid Link', 'Invalid unsubscribe link', 'This link appears to be malformed. Please use the unsubscribe link from your email.', true),
      400
    );
  }

  const unsubSecret: string = env.UNSUB_SECRET || env.DASH_TOKEN || 'change-me';
  const valid = await verifyUnsubToken(unsubSecret, email, token);

  if (!valid) {
    return htmlResponse(
      page('Invalid Link', 'Invalid unsubscribe link', 'This unsubscribe link is invalid or expired. Please contact us at hello@agentrank-ai.com if you need assistance.', true),
      403
    );
  }

  try {
    const result = await env.DB.prepare(
      'DELETE FROM email_subscribers WHERE email = ?'
    ).bind(email).run();

    if ((result as any).changes === 0) {
      // Already removed — still show success to prevent enumeration
      return htmlResponse(
        page('Unsubscribed', 'You\'re unsubscribed', `${email} has been removed from the AgentRank weekly digest. You won't receive any more emails from us.`)
      );
    }

    return htmlResponse(
      page('Unsubscribed', 'Successfully unsubscribed', `${email} has been removed from the AgentRank weekly digest. You won't receive any more emails from us.`)
    );
  } catch (e: any) {
    return htmlResponse(
      page('Error', 'Something went wrong', 'We couldn\'t process your unsubscribe request. Please try again or contact hello@agentrank-ai.com.', true),
      500
    );
  }
};
