import { Hono } from 'hono';
import { WorkerEnv } from '../types';
import { DbClient } from '../db/client';
import { adminAuthMiddleware } from '../middleware/auth';
import { FeedbackStatus } from '../../shared/types';
import { LIMITS } from '../../shared/constants';

const adminRouter = new Hono<{ Bindings: WorkerEnv }>();

// Protect all admin endpoints with Cloudflare Access verification middleware
adminRouter.use('*', adminAuthMiddleware);

/**
 * GET /api/admin/stats
 * Overview numbers for moderation dashboard
 */
adminRouter.get('/stats', async (c) => {
  const db = new DbClient(c.env.DB);
  try {
    const stats = await db.getAdminStats();
    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ success: false, error: 'Failed to retrieve stats' }, 500);
  }
});

/**
 * GET /api/admin/feedback
 * Moderation queue list
 */
adminRouter.get('/feedback', async (c) => {
  const db = new DbClient(c.env.DB);
  const status = c.req.query('status') || 'pending';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || `${LIMITS.ADMIN_PAGE_SIZE}`, 10) || LIMITS.ADMIN_PAGE_SIZE));

  try {
    const { items, total } = await db.getAdminFeedback(status, page, limit);
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
    console.error('Error fetching admin feedback queue:', error);
    return c.json({ success: false, error: 'Failed to load feedback queue' }, 500);
  }
});

/**
 * PATCH /api/admin/feedback/:id/status
 * Updates status (approved, rejected, hidden)
 */
adminRouter.patch('/feedback/:id/status', async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('adminUser');

  let bodyJson: any;
  try {
    bodyJson = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON request format' }, 400);
  }

  const newStatus = bodyJson?.status as FeedbackStatus;
  const validStatuses: FeedbackStatus[] = ['approved', 'rejected', 'hidden', 'pending'];
  if (!newStatus || !validStatuses.includes(newStatus)) {
    return c.json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
  }

  const db = new DbClient(c.env.DB);
  const now = Date.now();

  try {
    const updated = await db.updateFeedbackStatus(id, newStatus, now);
    if (!updated) {
      return c.json({ success: false, error: 'Feedback item not found' }, 404);
    }

    // Record audit log
    await db.insertAuditLog({
      id: crypto.randomUUID(),
      action: `status_change_to_${newStatus}`,
      feedback_id: id,
      admin_email: adminUser?.email || 'unknown_admin',
      created_at: now,
    });

    return c.json({
      success: true,
      message: `Feedback status updated to ${newStatus}.`,
      data: { id, status: newStatus },
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return c.json({ success: false, error: 'Failed to update feedback status' }, 500);
  }
});

/**
 * DELETE /api/admin/feedback/:id
 * Permanently deletes a feedback record and associated reports
 */
adminRouter.delete('/feedback/:id', async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('adminUser');
  const db = new DbClient(c.env.DB);
  const now = Date.now();

  try {
    const deleted = await db.deleteFeedback(id);
    if (!deleted) {
      return c.json({ success: false, error: 'Feedback not found or already deleted' }, 404);
    }

    // Record audit log
    await db.insertAuditLog({
      id: crypto.randomUUID(),
      action: 'delete_feedback',
      feedback_id: id,
      admin_email: adminUser?.email || 'unknown_admin',
      created_at: now,
    });

    return c.json({
      success: true,
      message: 'Feedback record permanently removed.',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return c.json({ success: false, error: 'Failed to delete feedback' }, 500);
  }
});

/**
 * GET /api/admin/reports
 * Lists reports with associated feedback preview
 */
adminRouter.get('/reports', async (c) => {
  const db = new DbClient(c.env.DB);
  const status = c.req.query('status') || 'pending';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || `${LIMITS.ADMIN_PAGE_SIZE}`, 10) || LIMITS.ADMIN_PAGE_SIZE));

  try {
    const { items, total } = await db.getReports(status, page, limit);
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
    console.error('Error fetching reports:', error);
    return c.json({ success: false, error: 'Failed to load reports' }, 500);
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Update report status (e.g. reviewed, dismissed)
 */
adminRouter.patch('/reports/:id', async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('adminUser');

  let bodyJson: any;
  try {
    bodyJson = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON request format' }, 400);
  }

  const newStatus = bodyJson?.status;
  if (!newStatus || !['reviewed', 'dismissed'].includes(newStatus)) {
    return c.json({ success: false, error: "Invalid status. Must be 'reviewed' or 'dismissed'" }, 400);
  }

  const db = new DbClient(c.env.DB);
  const now = Date.now();

  try {
    const updated = await db.updateReportStatus(id, newStatus);
    if (!updated) {
      return c.json({ success: false, error: 'Report not found' }, 404);
    }

    // Record audit log
    await db.insertAuditLog({
      id: crypto.randomUUID(),
      action: `report_${newStatus}`,
      feedback_id: id,
      admin_email: adminUser?.email || 'unknown_admin',
      created_at: now,
    });

    return c.json({
      success: true,
      message: `Report status updated to ${newStatus}.`,
      data: { id, status: newStatus },
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return c.json({ success: false, error: 'Failed to update report status' }, 500);
  }
});

/**
 * GET /api/admin/audit-logs
 * Retrieves recent audit trail for administrator actions
 */
adminRouter.get('/audit-logs', async (c) => {
  const db = new DbClient(c.env.DB);
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50', 10) || 50));

  try {
    const logs = await db.getAuditLogs(limit);
    return c.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return c.json({ success: false, error: 'Failed to load audit logs' }, 500);
  }
});

export { adminRouter };
