import { useEffect, useState, useMemo } from 'react';
import { Search, RotateCcw, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { FeedbackItem } from '../../shared/types';
import { LIMITS } from '../../shared/constants';
import { api } from '../lib/api';
import { CategoryFilter } from '../components/CategoryFilter';
import { FeedbackCard } from '../components/FeedbackCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ReportModal } from '../components/ReportModal';

interface FeedPageProps {
  initialCategory?: string;
  onNavigate: (path: string) => void;
  turnstileSiteKey: string;
}

export function FeedPage({ initialCategory, onNavigate, turnstileSiteKey }: FeedPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportingItem, setReportingItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadFeedback = async (category: string, targetPage: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await api.getFeedback(category, targetPage, LIMITS.FEED_PAGE_SIZE);
      if (append) {
        setItems((prev) => [...prev, ...res.items]);
      } else {
        setItems(res.items);
      }
      setHasMore(res.pagination.hasMore);
      setTotal(res.pagination.total);
      setPage(targetPage);
    } catch (err: any) {
      setError(err?.message || 'Failed to load feedback feed.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeedback(selectedCategory, 1, false);
  }, [selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeedback(selectedCategory, page + 1, true);
    }
  };

  // Client-side text filter on current results for instant searching
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        item.body.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Student Feedback Feed
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing {total} approved anonymous submission{total === 1 ? '' : 's'} from college and university students.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, topics, or issues..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadFeedback(selectedCategory, 1, false)}
            className="inline-flex items-center gap-1 font-medium text-rose-700 dark:text-rose-300 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Feed list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <FeedbackCard
                key={item.id}
                item={item}
                onReportClick={(target) => setReportingItem(target)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !searchQuery && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading more feedback...</span>
                  </>
                ) : (
                  <span>Load more feedback</span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {searchQuery
              ? `No feedback matching "${searchQuery}"`
              : `No approved feedback in "${selectedCategory}" yet`}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? 'Try searching with different keywords or switch back to All categories.'
              : 'Be the first student to share honest feedback on this topic.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/submit')}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Submit feedback for {selectedCategory === 'All' ? 'any category' : selectedCategory}
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        item={reportingItem}
        onClose={() => setReportingItem(null)}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
