export type FeedbackCategory =
  | 'Academics'
  | 'Faculty & Teaching'
  | 'Administration'
  | 'Examinations'
  | 'Infrastructure'
  | 'Campus Facilities'
  | 'Student Services'
  | 'Campus Life'
  | 'Suggestions'
  | 'Other';

export type FeedbackStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface FeedbackItem {
  id: string;
  title: string | null;
  body: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  created_at: number;
  published_at: number | null;
  updated_at: number | null;
}

export type ReportReason =
  | 'personal_information'
  | 'harassment'
  | 'spam'
  | 'hate_speech'
  | 'inappropriate_content'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ReportItem {
  id: string;
  feedback_id: string;
  reason: ReportReason;
  details: string | null;
  created_at: number;
  status: ReportStatus;
  feedback_preview?: {
    id: string;
    title: string | null;
    body: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
  };
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  feedback_id: string | null;
  admin_email: string | null;
  created_at: number;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  reported: number;
  totalReports: number;
}

export interface PublicFeedbackResponse {
  items: FeedbackItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface FeedbackSubmissionRequest {
  title?: string;
  body: string;
  category: FeedbackCategory;
  turnstileToken: string;
  honeypot?: string;
}

export interface ReportSubmissionRequest {
  feedbackId: string;
  reason: ReportReason;
  details?: string;
  turnstileToken: string;
  honeypot?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}
