import { useState } from 'react';
import { Flag, UserCheck, Calendar } from 'lucide-react';
import { FeedbackItem } from '../../shared/types';
import { GENERIC_AUTHOR_LABEL } from '../../shared/constants';

interface FeedbackCardProps {
  item: FeedbackItem;
  onReportClick: (item: FeedbackItem) => void;
}

export function FeedbackCard({ item, onReportClick }: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Format date cleanly
  const formattedDate = (() => {
    const ts = item.published_at || item.created_at;
    try {
      return new Date(ts).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  const isLong = item.body.length > 400;
  const displayText = !expanded && isLong ? `${item.body.substring(0, 380)}...` : item.body;

  return (
    <article className="group p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-all duration-150 hover:border-neutral-300 dark:hover:border-neutral-700 flex flex-col justify-between">
      <div>
        {/* Top Header: Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50">
            {item.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            <Calendar className="w-3 h-3" />
            <time dateTime={new Date(item.published_at || item.created_at).toISOString()}>{formattedDate}</time>
          </span>
        </div>

        {/* Title if provided */}
        {item.title && (
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug tracking-tight mb-2">
            {item.title}
          </h3>
        )}

        {/* Feedback Body (rendered safely as plain text) */}
        <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words font-normal">
          {displayText}
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? 'Show less' : 'Read full feedback'}
          </button>
        )}
      </div>

      {/* Card Footer: Anonymous author badge & report flag */}
      <div className="mt-5 pt-3.5 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
            <UserCheck className="w-2.5 h-2.5" />
          </div>
          <span className="font-medium text-neutral-500 dark:text-neutral-400 text-[11px] tracking-wide">
            {GENERIC_AUTHOR_LABEL}
          </span>
        </div>

        <button
          onClick={() => onReportClick(item)}
          className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 -mr-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          title="Report inappropriate feedback"
          aria-label="Report this feedback item"
        >
          <Flag className="w-3 h-3" />
          <span>Report</span>
        </button>
      </div>
    </article>
  );
}
