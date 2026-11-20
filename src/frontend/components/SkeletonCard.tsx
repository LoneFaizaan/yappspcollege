export function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2.5"></div>
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
          <div className="h-3.5 w-5/6 bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
          <div className="h-3.5 w-4/6 bg-neutral-100 dark:bg-neutral-800/60 rounded"></div>
        </div>
      </div>
      <div className="mt-5 pt-3.5 border-t border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-between">
        <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
      </div>
    </div>
  );
}
