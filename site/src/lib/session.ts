/** Developer session cookie utilities — sign and verify with HMAC-SHA256 */

const SESSION_COOKIE = 'dev_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface DevSession {
  userId: number;
  username: string;
}

/** Create a signed session cookie value. */
export async function signSession(secret: string, session: DevSession): Promise<string> {
  const ts = Math.floor(Date.now() / 1000);
  const payload = `${session.userId}:${session.username}:${ts}`;
  const sig = await hmac(secret, payload);
  return `${payload}:${sig}`;
}

/** Verify and parse a session cookie value. Returns null if invalid/expired. */
export async function verifySession(secret: string, cookie: string): Promise<DevSession | null> {
  try {
    const parts = cookie.split(':');
    if (parts.length !== 4) return null;
    const [userIdStr, username, tsStr, sig] = parts;
    const payload = `${userIdStr}:${username}:${tsStr}`;
    const expected = await hmac(secret, payload);
    if (sig !== expected) return null;
    const ts = parseInt(tsStr, 10);
    if (isNaN(ts) || Date.now() / 1000 - ts > SESSION_MAX_AGE) return null;
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) return null;
    return { userId, username };
  } catch {
    return null;
  }
}

/** Build the Set-Cookie header string for the session. */
export function buildSessionCookie(value: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

/** Build an expired Set-Cookie header to clear the session. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/** Parse the session cookie value from a Request. */
export function parseSessionCookie(request: Request): string | null {
  const header = request.headers.get('cookie') || '';
  const match = header.split('; ').find(c => c.startsWith(SESSION_COOKIE + '='));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
}
