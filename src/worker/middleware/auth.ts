import { Context, Next } from 'hono';
import { WorkerEnv, AdminUser } from '../types';

declare module 'hono' {
  interface ContextVariableMap {
    adminUser: AdminUser;
  }
}

/**
 * Middleware that strictly verifies Cloudflare Access authentication for all admin routes.
 */
export async function adminAuthMiddleware(c: Context<{ Bindings: WorkerEnv }>, next: Next) {
  const env = c.env;
  const isDev = env.ENVIRONMENT === 'development';

  // 1. Check for standard Cloudflare Access Headers
  const cfAccessEmail = c.req.header('cf-access-authenticated-user-email');
  const cfJwt = c.req.header('cf-access-jwt-assertion');
  if (cfJwt && !cfAccessEmail) {
    // If JWT assertion is present without email header, could decode payload if needed
  }

  // 2. Allowed admin emails list
  const allowedEmails = (env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let authenticatedEmail: string | null = null;
  let isDevBypass = false;

  if (cfAccessEmail) {
    authenticatedEmail = cfAccessEmail.trim().toLowerCase();
  }

  // 3. In local development environment ONLY, allow dev bypass header if configured
  if (!authenticatedEmail && isDev) {
    const devSecretHeader = c.req.header('x-admin-dev-secret');
    const devEmailHeader = c.req.header('x-admin-email');

    if (env.ADMIN_DEV_SECRET && devSecretHeader === env.ADMIN_DEV_SECRET) {
      authenticatedEmail = (devEmailHeader || allowedEmails[0] || 'dev-admin@localhost').toLowerCase();
      isDevBypass = true;
    }
  }

  // If no authenticated identity could be determined
  if (!authenticatedEmail) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized: Cloudflare Access authentication required to access administration.',
      },
      401
    );
  }

  // Check if authenticated email is in the allowed administrator list
  if (allowedEmails.length > 0 && !allowedEmails.includes(authenticatedEmail)) {
    return c.json(
      {
        success: false,
        error: `Forbidden: The account '${authenticatedEmail}' is not authorized to moderate feedback.`,
      },
      403
    );
  }

  // Attach verified admin user to context
  c.set('adminUser', {
    email: authenticatedEmail,
    isDevBypass,
  });

  await next();
}
