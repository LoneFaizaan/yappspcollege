import { Hono } from 'hono';
import { WorkerEnv } from '../types';
import { DbClient } from '../db/client';
import { createRateLimiter } from '../middleware/rateLimiter';
import { verifyTurnstileToken } from '../middleware/turnstile';
import { validateFeedbackSubmission, detectPotentialPii } from '../../shared/validation';
import { LIMITS } from '../../shared/constants';

const feedbackRouter = new Hono<{ Bindings: WorkerEnv }>();

// Rate limiter for submissions: max 10 submissions per 10 minutes per IP
const submissionRateLimiter = createRateLimiter(10, 10 * 60 * 1000, 'submit');

/**
 * GET /api/feedback
 * Public feed returning approved feedback only.
 */
feedbackRouter.get('/', async (c) => {
  const db = new DbClient(c.env.DB);
  const category = c.req.query('category');
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || `${LIMITS.FEED_PAGE_SIZE}`, 10) || LIMITS.FEED_PAGE_SIZE));

  try {
    const { items, total } = await db.getApprovedFeedback(category, page, limit);
    const hasMore = page * limit < total;

    return c.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    return c.json(
      {
        success: false,
        error: 'Unable to retrieve feedback at this time. Please try again later.',
      },
      500
    );
  }
});

/**
 * GET /api/feedback/:id
 * Public single approved feedback item.
 */
feedbackRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!id || id.length < 5) {
    return c.json({ success: false, error: 'Invalid feedback ID' }, 400);
  }

  const db = new DbClient(c.env.DB);
  try {
    const item = await db.getApprovedFeedbackById(id);
    if (!item) {
      return c.json({ success: false, error: 'Feedback not found or not currently available.' }, 404);
    }

    return c.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error fetching single feedback:', error);
    return c.json(
      {
        success: false,
        error: 'Unable to fetch feedback.',
      },
      500
    );
  }
});

/**
 * POST /api/feedback
 * Anonymous feedback submission.
 */
feedbackRouter.post('/', submissionRateLimiter, async (c) => {
  let bodyJson: unknown;
  try {
    bodyJson = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON request format' }, 400);
  }

  // 1. Validate fields
  const validation = validateFeedbackSubmission(bodyJson);
  if (!validation.isValid || !validation.cleaned) {
    return c.json(
      {
        success: false,
        error: 'Please fix the errors in your submission.',
        details: validation.errors,
      },
      400
    );
  }

  const { title, body, category, turnstileToken } = validation.cleaned;

  // 2. Check for PII (personally identifiable information)
  const fullContent = `${title || ''} ${body}`;
  const piiCheck = detectPotentialPii(fullContent);
  if (piiCheck.hasPii) {
    return c.json(
      {
        success: false,
        error: 'Potential personally identifying information detected. To protect privacy, submissions must not contain personal details.',
        details: {
          piiWarnings: piiCheck.warnings,
          piiTypes: piiCheck.types,
        },
      },
      400
    );
  }

  // 3. Verify Turnstile token
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');
  const turnstileResult = await verifyTurnstileToken(turnstileToken, c.env, clientIp);
  if (!turnstileResult.success) {
    return c.json(
      {
        success: false,
        error: turnstileResult.error || 'Bot verification failed. Please complete the security check again.',
      },
      403
    );
  }

  // 4. Save submission into D1 with pending status and random UUID
  const id = crypto.randomUUID();
  const now = Date.now();
  const db = new DbClient(c.env.DB);

  try {
    await db.insertFeedback({
      id,
      title,
      body,
      category,
      status: 'pending',
      created_at: now,
    });

    return c.json(
      {
        success: true,
        message: 'Your feedback has been received. Thank you for sharing your thoughts. Your submission will be reviewed before appearing publicly.',
        data: {
          id,
          status: 'pending',
        },
      },
      201
    );
  } catch (error) {
    console.error('Error saving feedback to database:', error);
    return c.json(
      {
        success: false,
        error: 'Unable to save feedback at this moment. Please try again shortly.',
      },
      500
    );
  }
});

export { feedbackRouter };
