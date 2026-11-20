import { useState, useMemo } from 'react';
import {
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CATEGORIES, LIMITS } from '../../shared/constants';
import { FeedbackCategory } from '../../shared/types';
import { detectPotentialPii } from '../../shared/validation';
import { api } from '../lib/api';
import { PiiWarningBanner } from '../components/PiiWarningBanner';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { useToast } from '../components/Toast';

interface SubmitPageProps {
  onNavigate: (path: string) => void;
  turnstileSiteKey: string;
}

export function SubmitPage({ onNavigate, turnstileSiteKey }: SubmitPageProps) {
  const { showToast } = useToast();

  const [category, setCategory] = useState<FeedbackCategory>('Academics');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live PII Detection
  const combinedText = useMemo(() => `${title} ${body}`, [title, body]);
  const piiResult = useMemo(() => detectPotentialPii(combinedText), [combinedText]);

  // Character count helpers
  const bodyLength = body.trim().length;
  const isBodyTooShort = bodyLength < LIMITS.BODY_MIN_LENGTH;
  const isBodyTooLong = bodyLength > LIMITS.BODY_MAX_LENGTH;
  const isTitleTooLong = title.trim().length > LIMITS.TITLE_MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBodyTooShort) {
      setError(`Please provide at least ${LIMITS.BODY_MIN_LENGTH} characters of feedback (currently ${bodyLength}).`);
      return;
    }

    if (isBodyTooLong) {
      setError(`Feedback must not exceed ${LIMITS.BODY_MAX_LENGTH} characters.`);
      return;
    }

    if (isTitleTooLong) {
      setError(`Title must not exceed ${LIMITS.TITLE_MAX_LENGTH} characters.`);
      return;
    }

    if (piiResult.hasPii) {
      setError('Please remove personal details (email, phone, roll number) before submitting.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security verification challenge.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitFeedback({
        category,
        title: title.trim() || undefined,
        body: body.trim(),
        turnstileToken,
        honeypot,
      });

      setSubmitted(true);
      showToast('Feedback submitted for moderation review.', 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setBody('');
    setTurnstileToken('');
    setHoneypot('');
    setError(null);
    setSubmitted(false);
  };

  // Success view
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Your feedback has been received.
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            Thank you for sharing your thoughts. Your submission has been placed in the moderation queue and will be reviewed before appearing publicly.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-xs text-neutral-500 dark:text-neutral-400 text-left space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Privacy Note</span>
          </div>
          <p>
            No student name, email, IP address, or login credentials were recorded with this submission. Your opinion remains completely anonymous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Submit another response
          </button>
          <button
            onClick={() => onNavigate('/feed')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <span>Explore public feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          What's on your mind?
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Share your experience, suggestions, or concerns. Your feedback will be reviewed before publication.
        </p>
      </div>

      {/* Privacy reminder callout */}
      <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-medium text-neutral-900 dark:text-neutral-200">
            Strict Anonymity Reminder:
          </span>{' '}
          Please do not include your name, phone number, student ID, email address, or other personally identifying information.
        </div>
      </div>

      {/* Live PII Detection Warning */}
      <PiiWarningBanner piiResult={piiResult} />

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-5 shadow-xs">
        {/* Category Selection */}
        <div>
          <label htmlFor="feedback-category" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            1. Select Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="feedback-title" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              2. Feedback Title (Optional)
            </label>
            <span
              className={`text-[11px] font-mono ${
                title.length > LIMITS.TITLE_MAX_LENGTH ? 'text-rose-500 font-bold' : 'text-neutral-400'
              }`}
            >
              {title.length}/{LIMITS.TITLE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="feedback-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            placeholder="Brief summary of your topic or issue (e.g., Library study spaces during finals)..."
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Feedback Message Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="feedback-body" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              3. Feedback Message <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                isBodyTooShort
                  ? 'text-amber-500'
                  : isBodyTooLong
                  ? 'text-rose-500 font-bold'
                  : 'text-emerald-500 font-medium'
              }`}
            >
              {bodyLength} / {LIMITS.BODY_MAX_LENGTH} chars (min {LIMITS.BODY_MIN_LENGTH})
            </span>
          </div>

          <textarea
            id="feedback-body"
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your constructive observations, positive experiences, or suggestions for improvement here. Please focus on institutional systems, facilities, courses, or administration..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y leading-relaxed"
          />
          <p className="mt-1 text-[11px] text-neutral-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Focus on constructive institutional feedback rather than personal attacks.</span>
          </p>
        </div>

        {/* Honeypot Spam Trap */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="hp_check">Leave empty</label>
          <input
            id="hp_check"
            type="text"
            name="hp_user_validation"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Turnstile Bot Verification */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            4. Security Verification <span className="text-rose-500">*</span>
          </label>
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between">
          <p className="text-[11px] text-neutral-400 max-w-xs">
            By clicking submit, you confirm this feedback complies with Community Guidelines.
          </p>
          <button
            type="submit"
            disabled={submitting || isBodyTooShort || isBodyTooLong || !turnstileToken || piiResult.hasPii}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting anonymously...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
