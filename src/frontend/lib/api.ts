import {
  FeedbackItem,
  PublicFeedbackResponse,
  FeedbackSubmissionRequest,
  ReportSubmissionRequest,
  AdminStats,
  ReportItem,
  AdminAuditLogItem,
  FeedbackStatus,
} from '../../shared/types';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Unexpected response from server', response.status);
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(data?.error || `Request failed with status ${response.status}`, response.status, data?.details);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Public
  async getConfig(): Promise<{ turnstileSiteKey: string; environment: string }> {
    return request('/config');
  },

  async getFeedback(category?: string, page = 1, limit = 12): Promise<PublicFeedbackResponse> {
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.set('category', category);
    }
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    return request(`/feedback?${params.toString()}`);
  },

  async getFeedbackById(id: string): Promise<FeedbackItem> {
    return request(`/feedback/${encodeURIComponent(id)}`);
  },

  async submitFeedback(data: FeedbackSubmissionRequest): Promise<{ id: string; status: string }> {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitReport(feedbackId: string, data: Omit<ReportSubmissionRequest, 'feedbackId'>): Promise<void> {
    return request(`/feedback/${encodeURIComponent(feedbackId)}/report`, {
      method: 'POST',
      body: JSON.stringify({ ...data, feedbackId }),
    });
  },

  // Admin (Cloudflare Access automatically sends Access credentials; for local dev, an admin token can be passed)
  async getAdminStats(adminSecret?: string): Promise<AdminStats> {
    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }
    return request('/admin/stats', { headers });
  },

  async getAdminFeedback(
    status = 'pending',
    page = 1,
    limit = 20,
    adminSecret?: string
  ): Promise<{ items: FeedbackItem[]; pagination: { page: number; limit: number; total: number; hasMore: boolean } }> {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }

    return request(`/admin/feedback?${params.toString()}`, { headers });
  },

  async updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    adminSecret?: string
  ): Promise<{ id: string; status: FeedbackStatus }> {
    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }

    return request(`/admin/feedback/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
  },

  async deleteFeedback(id: string, adminSecret?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }

    return request(`/admin/feedback/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
  },

  async getAdminReports(
    status = 'pending',
    page = 1,
    limit = 20,
    adminSecret?: string
  ): Promise<{ items: ReportItem[]; pagination: { page: number; limit: number; total: number; hasMore: boolean } }> {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }

    return request(`/admin/reports?${params.toString()}`, { headers });
  },

  async updateReportStatus(id: string, status: 'reviewed' | 'dismissed', adminSecret?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }

    return request(`/admin/reports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
  },

  async getAdminAuditLogs(limit = 50, adminSecret?: string): Promise<AdminAuditLogItem[]> {
    const headers: Record<string, string> = {};
    if (adminSecret) {
      headers['x-admin-dev-secret'] = adminSecret;
    }
    return request(`/admin/audit-logs?limit=${limit}`, { headers });
  },
};
