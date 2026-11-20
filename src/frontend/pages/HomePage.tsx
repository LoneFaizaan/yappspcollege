import { useEffect, useState } from 'react';
import { ArrowRight, MessageSquarePlus, Compass, Shield, CheckCircle2, EyeOff, Sparkles } from 'lucide-react';
import { FeedbackItem } from '../../shared/types';
import { CATEGORIES } from '../../shared/constants';
import { api } from '../lib/api';
import { FeedbackCard } from '../components/FeedbackCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ReportModal } from '../components/ReportModal';

interface HomePageProps {
  onNavigate: (path: string, query?: Record<string, string>) => void;
  turnstileSiteKey: string;
}

export function HomePage({ onNavigate, turnstileSiteKey }: HomePageProps) {
  const [recentItems, setRecentItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingItem, setReportingItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .getFeedback(undefined, 1, 4)
      .then((res) => {
        if (mounted) {
          setRecentItems(res.items);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load recent feedback:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60 shadow-xs">
          <EyeOff className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>100% Anonymous & Account-Free</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
          Your voice. <br />
          <span className="text-neutral-500 dark:text-neutral-400">Without your name.</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl mx-auto font-normal">
          A space for students to share honest feedback, experiences, and ideas. No accounts. No identities. Just opinions that matter.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/submit')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Share your feedback</span>
          </button>
          <button
            onClick={() => onNavigate('/feed')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explore feedback</span>
          </button>
        </div>
      </section>

      {/* How It Works (Three Steps) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            How It Works
          </h2>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
            Simple, private, and constructive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
              1
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Write your feedback
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Select a category and share honest thoughts on academics, campus facilities, administration, or exams.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
              2
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Submit it anonymously
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No account creation or personal login required. Student IP addresses and device fingerprints are never saved in our database.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
              3
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Let your voice be heard
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              After a quick safety review to prevent doxxing or spam, your feedback is published publicly for peers and educators to read.
            </p>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Browse by Topic
          </h2>
          <button
            onClick={() => onNavigate('/feed')}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <span>All categories</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => onNavigate('/feed', { category: cat })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Latest Approved Feedback Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Student Feedback
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Moderated and approved opinions from verified anonymous students
            </p>
          </div>
          <button
            onClick={() => onNavigate('/feed')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentItems.map((item) => (
              <FeedbackCard key={item.id} item={item} onReportClick={setReportingItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-6 rounded-xl border border-dashed border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No approved feedback yet.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Be the first student to voice your opinion anonymously.
            </p>
            <button
              onClick={() => onNavigate('/submit')}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
            >
              Share your feedback
            </button>
          </div>
        )}
      </section>

      {/* Philosophy Callout Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-2xl border border-border-light dark:border-border-dark bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900/40 dark:to-surface-dark text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            "Your opinion matters. Your identity doesn't."
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Constructive criticism drives improvement. Our platform is strictly independent, privacy-first, and designed to give every student a voice without fear of consequences.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('/guidelines')}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline font-medium"
            >
              Read Community Guidelines
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <button
              onClick={() => onNavigate('/privacy')}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline font-medium"
            >
              Our Privacy Commitment
            </button>
          </div>
        </div>
      </section>

      {/* Report Modal */}
      <ReportModal
        item={reportingItem}
        onClose={() => setReportingItem(null)}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
