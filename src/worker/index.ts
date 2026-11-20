import { Hono } from 'hono';
import { WorkerEnv } from './types';
import { securityHeadersMiddleware } from './middleware/security';
import { feedbackRouter } from './routes/feedback';
import { reportsRouter } from './routes/reports';
import { adminRouter } from './routes/admin';

const app = new Hono<{ Bindings: WorkerEnv }>();

// Global security headers
app.use('*', securityHeadersMiddleware);

// Public configuration endpoint
app.get('/api/config', (c) => {
  return c.json({
    success: true,
    data: {
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
      environment: c.env.ENVIRONMENT || 'development',
    },
  });
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: Date.now(),
  });
});

// Mount modular sub-routers
app.route('/api/feedback', feedbackRouter);
app.route('/api/feedback', reportsRouter);
app.route('/api/admin', adminRouter);

// Cloudflare Workers Static Assets fallback:
// Serves frontend static assets (built into dist/client) for non-API requests
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
