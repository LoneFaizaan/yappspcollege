import { Hono } from 'hono';
import { WorkerEnv } from '../types';
import { DbClient } from '../db/client';
import { createRateLimiter } from '../middleware/rateLimiter';
import { verifyTurnstileToken } from '../middleware/turnstile';
import { validateReportSubmission } from '../../shared/validation';

const reportsRouter = new Hono<{ Bindings: WorkerEnv }>();

// Rate limiter for reports: max 15 reports per 10 minutes per IP
const reportRateLimiter = createRateLimiter(15, 10 * 60 * 1000, 'report');

/**
 * POST /api/feedback/:id/report
 * Submits a report for review against a published feedback item.
 */
reportsRouter.post('/:id/report', reportRateLimiter, async (c) => {
  const feedbackId = c.req.param('id');
  if (!feedbackId || typeof feedbackId !== 'string' || feedbackId.trim() === '') {
    return c.json({ success: false, error: 'Invalid feedback ID' }, 400);
  }

  let bodyJson: any;

  try {
    bodyJson = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON request format' }, 400);
  }

  // Inject feedbackId from URL if not in body
  if (bodyJson && typeof bodyJson === 'object' && !bodyJson.feedbackId) {
    bodyJson.feedbackId = feedbackId;
  }

  // 1. Validate inputs
  const validation = validateReportSubmission(bodyJson);
  if (!validation.isValid || !validation.cleaned) {
    return c.json(
      {
        success: false,
        error: 'Please fix the errors in your report.',
        details: validation.errors,
      },
      400
    );
  }

  const { reason, details, turnstileToken } = validation.cleaned;

  // 2. Verify Turnstile token
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');
  const turnstileResult = await verifyTurnstileToken(turnstileToken, c.env, clientIp);
  if (!turnstileResult.success) {
    return c.json(
      {
        success: false,
        error: turnstileResult.error || 'Bot verification failed. Please try again.',
      },
      403
    );
  }

  const db = new DbClient(c.env.DB);

  try {
    // Check if the feedback item actually exists
    const existing = await db.getApprovedFeedbackById(feedbackId);
    if (!existing) {
      return c.json(
        {
          success: false,
          error: 'The feedback item you are trying to report does not exist or has been removed.',
        },
        404
      );
    }

    const reportId = crypto.randomUUID();
    const now = Date.now();

    await db.insertReport({
      id: reportId,
      feedback_id: feedbackId,
      reason,
      details,
      created_at: now,
      status: 'pending',
    });

    return c.json(
      {
        success: true,
        message: 'Thank you for your report. Our moderation team will review this submission.',
      },
      201
    );
  } catch (error) {
    console.error('Error submitting report:', error);
    return c.json(
      {
        success: false,
        error: 'Unable to submit report at this time. Please try again shortly.',
      },
      500
    );
  }
});

export { reportsRouter };
