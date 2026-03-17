import { defineMiddleware } from 'astro:middleware';

const SKIP_PREFIXES = ['/dash', '/_astro/', '/favicon'];

function classifyRequest(path: string, ua: string): 'mcp' | 'api' | 'page' {
  if (ua.includes('AgentRank-MCP')) return 'mcp';
  if (path.startsWith('/api/')) return 'api';
  return 'page';
}

function extractQuery(path: string, url: URL): string | null {
  if (path === '/api/search') return url.searchParams.get('q');
  if (path === '/api/lookup') return url.searchParams.get('url');
  return null;
}

function extractUtmSource(url: URL): string | null {
  return url.searchParams.get('utm_source');
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;

  // Skip logging for dash, static assets, favicon
  if (SKIP_PREFIXES.some(p => path.startsWith(p))) {
    return next();
  }

  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;

  const ua = ctx.request.headers.get('user-agent') ?? '';
  const type = classifyRequest(path, ua);
  const country = ctx.request.headers.get('cf-ipcountry') ?? null;
  const query = extractQuery(path, ctx.url);
  const rawReferrer = ctx.request.headers.get('referer') ?? null;
  // Strip query strings and fragments from referrer; store origin+path only
  const referrer = rawReferrer ? (() => { try { const u = new URL(rawReferrer); return (u.origin + u.pathname).slice(0, 500); } catch { return rawReferrer.slice(0, 500); } })() : null;
  // Capture utm_source for distribution channel attribution (only on page requests)
  const utmSource = type === 'page' ? extractUtmSource(ctx.url) : null;

  try {
    const { env } = (ctx.locals as any).runtime;
    if (env.DB) {
      const stmt = env.DB.prepare(
        `INSERT INTO request_log (path, method, type, status, ua, country, duration_ms, query, referrer, utm_source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        path,
        ctx.request.method,
        type,
        response.status,
        ua.slice(0, 200),
        country,
        duration,
        query?.slice(0, 500) ?? null,
        referrer,
        utmSource?.slice(0, 100) ?? null,
      );

      // Fire-and-forget via waitUntil if available (Cloudflare)
      const runtime = (ctx.locals as any).runtime;
      if (runtime?.ctx?.waitUntil) {
        runtime.ctx.waitUntil(stmt.run());
      } else {
        stmt.run().catch(() => {});
      }
    }
  } catch {
    // Never block a response for logging
  }

  return response;
});
