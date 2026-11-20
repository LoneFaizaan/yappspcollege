export interface WorkerEnv {
  DB: D1Database;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_ALLOWED_EMAILS?: string;
  ADMIN_DEV_SECRET?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

export interface AdminUser {
  email: string;
  isDevBypass?: boolean;
}
