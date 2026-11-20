import { Context, Next } from 'hono';

export async function securityHeadersMiddleware(c: Context, next: Next) {
  await next();

  const headersToSet: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };

  try {
    for (const [key, val] of Object.entries(headersToSet)) {
      c.res.headers.set(key, val);
    }
  } catch {
    // If response headers are immutable (e.g. from env.ASSETS.fetch)
    const newHeaders = new Headers(c.res.headers);
    for (const [key, val] of Object.entries(headersToSet)) {
      newHeaders.set(key, val);
    }
    c.res = new Response(c.res.body, {
      status: c.res.status,
      statusText: c.res.statusText,
      headers: newHeaders,
    });
  }
}
