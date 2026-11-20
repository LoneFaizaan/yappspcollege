import { FeedbackCategory, FeedbackItem, FeedbackStatus, ReportItem, AdminStats, AdminAuditLogItem } from '../../shared/types';

export class DbClient {
  constructor(private db: D1Database) {}

  /**
   * Retrieves paginated, approved feedback items for public feed.
   */
  async getApprovedFeedback(category?: string, page = 1, limit = 12): Promise<{ items: FeedbackItem[]; total: number }> {
    const offset = Math.max(0, (page - 1) * limit);

    if (category && category !== 'All') {
      const countRes = await this.db
        .prepare('SELECT COUNT(*) as count FROM feedback WHERE status = ? AND category = ?')
        .bind('approved', category)
        .first<{ count: number }>();

      const total = countRes?.count ?? 0;

      const res = await this.db
        .prepare(
          'SELECT id, title, body, category, status, created_at, published_at, updated_at FROM feedback WHERE status = ? AND category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?'
        )
        .bind('approved', category, limit, offset)
        .all<FeedbackItem>();

      return {
        items: res.results || [],
        total,
      };
    }

    const countRes = await this.db
      .prepare('SELECT COUNT(*) as count FROM feedback WHERE status = ?')
      .bind('approved')
      .first<{ count: number }>();

    const total = countRes?.count ?? 0;

    const res = await this.db
      .prepare(
        'SELECT id, title, body, category, status, created_at, published_at, updated_at FROM feedback WHERE status = ? ORDER BY published_at DESC LIMIT ? OFFSET ?'
      )
      .bind('approved', limit, offset)
      .all<FeedbackItem>();

    return {
      items: res.results || [],
      total,
    };
  }

  /**
   * Retrieves single approved feedback by ID.
   */
  async getApprovedFeedbackById(id: string): Promise<FeedbackItem | null> {
    const res = await this.db
      .prepare('SELECT id, title, body, category, status, created_at, published_at, updated_at FROM feedback WHERE id = ? AND status = ?')
      .bind(id, 'approved')
      .first<FeedbackItem>();

    return res || null;
  }

  /**
   * Inserts new student feedback (defaults to pending status).
   * Note: No IP address, user account, or identifying metadata is accepted or stored!
   */
  async insertFeedback(item: {
    id: string;
    title: string | null;
    body: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    created_at: number;
  }): Promise<void> {
    await this.db
      .prepare(
        'INSERT INTO feedback (id, title, body, category, status, created_at, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)'
      )
      .bind(item.id, item.title, item.body, item.category, item.status, item.created_at, item.created_at)
      .run();
  }

  /**
   * Inserts a report against a feedback item.
   */
  async insertReport(report: {
    id: string;
    feedback_id: string;
    reason: string;
    details: string | null;
    created_at: number;
    status: string;
  }): Promise<void> {
    await this.db
      .prepare(
        'INSERT INTO reports (id, feedback_id, reason, details, created_at, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(report.id, report.feedback_id, report.reason, report.details, report.created_at, report.status)
      .run();
  }

  /**
   * Admin: Get feedback by status.
   */
  async getAdminFeedback(status?: string, page = 1, limit = 20): Promise<{ items: FeedbackItem[]; total: number }> {
    const offset = Math.max(0, (page - 1) * limit);

    if (status && status !== 'all') {
      const countRes = await this.db
        .prepare('SELECT COUNT(*) as count FROM feedback WHERE status = ?')
        .bind(status)
        .first<{ count: number }>();

      const total = countRes?.count ?? 0;

      const res = await this.db
        .prepare(
          'SELECT id, title, body, category, status, created_at, published_at, updated_at FROM feedback WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        )
        .bind(status, limit, offset)
        .all<FeedbackItem>();

      return {
        items: res.results || [],
        total,
      };
    }

    const countRes = await this.db
      .prepare('SELECT COUNT(*) as count FROM feedback')
      .first<{ count: number }>();

    const total = countRes?.count ?? 0;

    const res = await this.db
      .prepare(
        'SELECT id, title, body, category, status, created_at, published_at, updated_at FROM feedback ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .bind(limit, offset)
      .all<FeedbackItem>();

    return {
      items: res.results || [],
      total,
    };
  }

  /**
   * Admin: Update status of feedback (approve, reject, hide).
   */
  async updateFeedbackStatus(id: string, status: FeedbackStatus, timestamp: number): Promise<boolean> {
    const publishedAt = status === 'approved' ? timestamp : null;

    const res = await this.db
      .prepare(
        'UPDATE feedback SET status = ?, published_at = COALESCE(?, published_at), updated_at = ? WHERE id = ?'
      )
      .bind(status, publishedAt, timestamp, id)
      .run();

    return res.meta.changes > 0;
  }

  /**
   * Admin: Permanently delete a feedback item.
   */
  async deleteFeedback(id: string): Promise<boolean> {
    // Delete cascading reports first (in case SQLite foreign key cascade isn't active on D1)
    await this.db.prepare('DELETE FROM reports WHERE feedback_id = ?').bind(id).run();
    const res = await this.db.prepare('DELETE FROM feedback WHERE id = ?').bind(id).run();
    return res.meta.changes > 0;
  }

  /**
   * Admin: Get all reports with associated feedback preview.
   */
  async getReports(status?: string, page = 1, limit = 20): Promise<{ items: ReportItem[]; total: number }> {
    const offset = Math.max(0, (page - 1) * limit);

    let countQuery = 'SELECT COUNT(*) as count FROM reports';
    let query = `
      SELECT 
        r.id, r.feedback_id, r.reason, r.details, r.created_at, r.status,
        f.id as f_id, f.title as f_title, f.body as f_body, f.category as f_category, f.status as f_status
      FROM reports r
      LEFT JOIN feedback f ON r.feedback_id = f.id
    `;

    if (status && status !== 'all') {
      countQuery += ' WHERE status = ?';
      query += ' WHERE r.status = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?';

      const countRes = await this.db.prepare(countQuery).bind(status).first<{ count: number }>();
      const total = countRes?.count ?? 0;

      const res = await this.db.prepare(query).bind(status, limit, offset).all<any>();
      const items: ReportItem[] = (res.results || []).map((row) => ({
        id: row.id,
        feedback_id: row.feedback_id,
        reason: row.reason,
        details: row.details,
        created_at: row.created_at,
        status: row.status,
        feedback_preview: row.f_id
          ? {
              id: row.f_id,
              title: row.f_title,
              body: row.f_body,
              category: row.f_category,
              status: row.f_status,
            }
          : undefined,
      }));

      return { items, total };
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    const countRes = await this.db.prepare(countQuery).first<{ count: number }>();
    const total = countRes?.count ?? 0;

    const res = await this.db.prepare(query).bind(limit, offset).all<any>();
    const items: ReportItem[] = (res.results || []).map((row) => ({
      id: row.id,
      feedback_id: row.feedback_id,
      reason: row.reason,
      details: row.details,
      created_at: row.created_at,
      status: row.status,
      feedback_preview: row.f_id
        ? {
            id: row.f_id,
            title: row.f_title,
            body: row.f_body,
            category: row.f_category,
            status: row.f_status,
          }
        : undefined,
    }));

    return { items, total };
  }

  /**
   * Admin: Update report status (reviewed, dismissed).
   */
  async updateReportStatus(id: string, status: string): Promise<boolean> {
    const res = await this.db
      .prepare('UPDATE reports SET status = ? WHERE id = ?')
      .bind(status, id)
      .run();
    return res.meta.changes > 0;
  }

  /**
   * Admin: Get dashboard overview counts.
   */
  async getAdminStats(): Promise<AdminStats> {
    const totalRow = await this.db.prepare('SELECT COUNT(*) as count FROM feedback').first<{ count: number }>();
    const pendingRow = await this.db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'pending'").first<{ count: number }>();
    const approvedRow = await this.db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'approved'").first<{ count: number }>();
    const rejectedRow = await this.db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'rejected'").first<{ count: number }>();
    const hiddenRow = await this.db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'hidden'").first<{ count: number }>();
    const totalReportsRow = await this.db.prepare('SELECT COUNT(*) as count FROM reports').first<{ count: number }>();
    const pendingReportsRow = await this.db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").first<{ count: number }>();

    return {
      total: totalRow?.count ?? 0,
      pending: pendingRow?.count ?? 0,
      approved: approvedRow?.count ?? 0,
      rejected: rejectedRow?.count ?? 0,
      hidden: hiddenRow?.count ?? 0,
      reported: pendingReportsRow?.count ?? 0,
      totalReports: totalReportsRow?.count ?? 0,
    };
  }

  /**
   * Admin Audit Logs
   */
  async insertAuditLog(log: {
    id: string;
    action: string;
    feedback_id: string | null;
    admin_email: string | null;
    created_at: number;
  }): Promise<void> {
    await this.db
      .prepare('INSERT INTO admin_audit_logs (id, action, feedback_id, admin_email, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(log.id, log.action, log.feedback_id, log.admin_email, log.created_at)
      .run();
  }

  async getAuditLogs(limit = 50): Promise<AdminAuditLogItem[]> {
    const res = await this.db
      .prepare('SELECT id, action, feedback_id, admin_email, created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<AdminAuditLogItem>();

    return res.results || [];
  }
}
