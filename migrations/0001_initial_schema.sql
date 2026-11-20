-- Initial Schema for Anonymous Student Feedback Platform
-- D1 SQLite Migration

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'hidden')),
    created_at INTEGER NOT NULL,
    published_at INTEGER,
    updated_at INTEGER
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_published_at ON feedback(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status_category_published ON feedback(status, category, published_at DESC);

-- Table: reports
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    feedback_id TEXT NOT NULL,
    reason TEXT NOT NULL CHECK(reason IN ('personal_information', 'harassment', 'spam', 'hate_speech', 'inappropriate_content', 'other')),
    details TEXT,
    created_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed')),
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_feedback_id ON reports(feedback_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Table: admin_audit_logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    feedback_id TEXT,
    admin_email TEXT,
    created_at INTEGER NOT NULL
);

-- Indexes for admin_audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_feedback_id ON admin_audit_logs(feedback_id);
