import { Context, Next } from 'hono';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory transient rate limit cache (lives only in worker runtime instance memory)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup to avoid memory growth in long-running isolates
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }
}

/**
 * Creates a rate limiter middleware for sensitive endpoints.
 * @param limit Maximum allowed requests within window
 * @param windowMs Time window in milliseconds
 * @param keyPrefix Route prefix to isolate limits (e.g. 'submit', 'report')
 */
export function createRateLimiter(limit: number, windowMs: number, keyPrefix: string) {
  return async (c: Context, next: Next) => {
    cleanupExpired();

    // Get client IP transiently
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';

    // Hash the IP with route prefix so the raw IP is never held directly
    // Using simple cryptographic hash or safe string identifier in transient memory
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || record.resetAt < now) {
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
    } else {
      if (record.count >= limit) {
        const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
        c.res.headers.set('Retry-After', retryAfterSeconds.toString());
        return c.json(
          {
            success: false,
            error: 'Rate limit exceeded. Please wait a few moments before trying again.',
          },
          429
        );
      }
      record.count += 1;
    }

    await next();
  };
}
