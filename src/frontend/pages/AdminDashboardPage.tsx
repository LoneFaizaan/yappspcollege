import { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Check,
  X,
  Trash2,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  Clock,
  Flag,
  FileText,
  Key,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  AdminStats,
  FeedbackItem,
  FeedbackStatus,
  ReportItem,
  AdminAuditLogItem,
} from '../../shared/types';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export function AdminDashboardPage() {
  const { showToast } = useToast();

  // Admin dev token (stored in sessionStorage for local development convenience)
  const [adminDevSecret, setAdminDevSecret] = useState<string>(() => {
    return sessionStorage.getItem('studentvoice_admin_token') || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'hidden' | 'reports' | 'logs'>('pending');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const saveDevSecret = (secret: string) => {
    setAdminDevSecret(secret);
    sessionStorage.setItem('studentvoice_admin_token', secret);
    setAuthError(null);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setAuthError(null);

    try {
      // 1. Fetch stats
      const statsRes = await api.getAdminStats(adminDevSecret || undefined);
      setStats(statsRes);

      // 2. Fetch current tab data
      if (activeTab === 'reports') {
        const repRes = await api.getAdminReports('all', 1, 50, adminDevSecret || undefined);
        setReports(repRes.items);
      } else if (activeTab === 'logs') {
        const logsRes = await api.getAdminAuditLogs(50, adminDevSecret || undefined);
        setAuditLogs(logsRes);
      } else {
        const feedRes = await api.getAdminFeedback(activeTab, 1, 50, adminDevSecret || undefined);
        setFeedbackItems(feedRes.items);
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAuthError(err.message || 'Access Denied: Cloudflare Access authentication required.');
      } else {
        showToast(err?.message || 'Failed to fetch admin data', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [adminDevSecret, activeTab, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Action handlers
  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    setActionLoadingId(id);
    try {
      await api.updateFeedbackStatus(id, status, adminDevSecret || undefined);
      showToast(`Feedback status updated to ${status}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this feedback record from the database? This cannot be undone.')) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.deleteFeedback(id, adminDevSecret || undefined);
      showToast('Feedback permanently deleted.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete record', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReportStatus = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    setActionLoadingId(reportId);
    try {
      await api.updateReportStatus(reportId, status, adminDevSecret || undefined);
      showToast(`Report marked as ${status}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update report status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Moderation & Administration
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Protected management workspace for reviewing student feedback and user reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Cloudflare Access Authentication / Local Dev Notice */}
      {authError && (
        <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-sm">Protected Administrator Area</p>
              <p className="leading-relaxed">
                In production, this interface is securely guarded by <strong>Cloudflare Access</strong> and requires an authorized institutional login.
              </p>
              <p className="leading-relaxed text-amber-700 dark:text-amber-300">
                For local development or testing, you can authenticate by providing the <code>ADMIN_DEV_SECRET</code> token defined in your <code>.dev.vars</code> file.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tokenInput.trim()) {
                saveDevSecret(tokenInput.trim());
              }
            }}
            className="flex flex-col sm:flex-row items-center gap-2 pt-1"
          >
            <div className="relative w-full sm:w-80">
              <Key className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter ADMIN_DEV_SECRET token..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border border-amber-300 dark:border-amber-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
            >
              Verify Dev Token
            </button>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Pending Review
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats ? stats.pending : '-'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Approved (Live)
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats ? stats.approved : '-'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Rejected
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats ? stats.rejected : '-'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Hidden
          </span>
          <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
            {stats ? stats.hidden : '-'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Active Reports
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats ? stats.reported : '-'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Total Submissions
          </span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats ? stats.total : '-'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-light dark:border-border-dark overflow-x-auto pb-px">
        {[
          { id: 'pending', label: 'Pending Queue', badge: stats?.pending },
          { id: 'approved', label: 'Approved (Live)', badge: stats?.approved },
          { id: 'rejected', label: 'Rejected', badge: stats?.rejected },
          { id: 'hidden', label: 'Hidden', badge: stats?.hidden },
          { id: 'reports', label: 'User Reports', badge: stats?.reported },
          { id: 'logs', label: 'Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tab.id === 'pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-xs text-neutral-400">
            Loading queue records...
          </div>
        ) : activeTab === 'reports' ? (
          /* Reports Tab */
          reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {report.reason.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-neutral-400">
                        Reported on {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      report.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      Status: {report.status}
                    </span>
                  </div>

                  {report.details && (
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800">
                      Reporter note: "{report.details}"
                    </p>
                  )}

                  {/* Feedback Target Preview */}
                  {report.feedback_preview ? (
                    <div className="p-3 rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-neutral-50/50 dark:bg-neutral-900/50 text-xs space-y-1">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Target Feedback: {report.feedback_preview.title || 'Untitled'} ({report.feedback_preview.category})
                      </div>
                      <div className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap line-clamp-3">
                        {report.feedback_preview.body}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 italic">Target feedback was already deleted.</div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReportStatus(report.id, 'dismissed')}
                          disabled={actionLoadingId === report.id}
                          className="px-3 py-1 rounded text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleReportStatus(report.id, 'reviewed')}
                          disabled={actionLoadingId === report.id}
                          className="px-3 py-1 rounded text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
                        >
                          Mark Reviewed
                        </button>
                      </>
                    )}
                    {report.feedback_preview && (
                      <button
                        onClick={() => handleDelete(report.feedback_id)}
                        disabled={actionLoadingId === report.feedback_id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Content</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-neutral-400">
              No reports found in this category.
            </div>
          )
        ) : activeTab === 'logs' ? (
          /* Audit Logs Tab */
          auditLogs.length > 0 ? (
            <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-border-light dark:border-border-dark text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Timestamp</th>
                      <th className="py-2.5 px-4 font-medium">Action</th>
                      <th className="py-2.5 px-4 font-medium">Target ID</th>
                      <th className="py-2.5 px-4 font-medium">Administrator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark text-neutral-700 dark:text-neutral-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-2 px-4 font-mono text-[11px] text-neutral-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 font-medium">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-mono text-[11px] text-neutral-400 truncate max-w-xs">
                          {log.feedback_id || '-'}
                        </td>
                        <td className="py-2 px-4 font-mono text-[11px] text-neutral-500">
                          {log.admin_email || 'system'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-neutral-400">
              No audit logs recorded yet.
            </div>
          )
        ) : (
          /* Feedback items list */
          feedbackItems.length > 0 ? (
            <div className="space-y-4">
              {feedbackItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      item.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : item.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.title && (
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                  )}

                  <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="pt-3 border-t border-border-subtle-light dark:border-border-subtle-dark flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-neutral-400">
                      ID: {item.id}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'approved')}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      )}

                      {item.status !== 'rejected' && item.status !== 'hidden' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'rejected')}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {item.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'hidden')}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide from Public</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Permanently delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-neutral-400">
              No feedback items in the '{activeTab}' category.
            </div>
          )
        )}
      </div>
    </div>
  );
}
