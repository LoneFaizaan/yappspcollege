import { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import { FeedbackItem, ReportReason } from '../../shared/types';
import { REPORT_REASONS } from '../../shared/constants';
import { api } from '../lib/api';
import { TurnstileWidget } from './TurnstileWidget';
import { useToast } from './Toast';

interface ReportModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  turnstileSiteKey: string;
}

export function ReportModal({ item, onClose, turnstileSiteKey }: ReportModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState<ReportReason>('personal_information');
  const [details, setDetails] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Please complete the security verification challenge.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitReport(item.id, {
        reason,
        details: details.trim() || undefined,
        turnstileToken,
        honeypot,
      });

      showToast('Thank you. Your report has been submitted for moderation review.', 'success');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="relative w-full max-w-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle-light dark:border-border-subtle-dark">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Flag className="w-4 h-4" />
            </div>
            <h2 id="report-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Report Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preview of item */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-neutral-900 dark:text-neutral-200">Reporting item: </span>
            <span className="italic line-clamp-2">"{item.title || item.body}"</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason selection */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Why are you reporting this feedback?
            </label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    reason === r.value
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-neutral-900 dark:text-neutral-100'
                      : 'border-border-light dark:border-border-dark hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-medium block text-neutral-800 dark:text-neutral-200">{r.label}</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{r.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label htmlFor="report-details" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Additional Details (optional)
            </label>
            <textarea
              id="report-details"
              rows={2}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context for the moderation team..."
              className="w-full text-xs p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Honeypot field */}
          <div style={{ display: 'none' }}>
            <input
              type="text"
              name="hp_report_check"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Turnstile */}
          <TurnstileWidget siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
