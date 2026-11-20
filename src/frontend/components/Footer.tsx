import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-neutral-500 dark:text-neutral-400 text-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border-subtle-light dark:border-border-subtle-dark">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-medium text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Independent Student Voice</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
              "Your opinion matters. Your identity doesn't." Built for students to share constructive feedback, facilities suggestions, and honest academic perspectives without fear of retribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs">
            <button
              onClick={() => onNavigate('/feed')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Public Feed
            </button>
            <button
              onClick={() => onNavigate('/guidelines')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Community Guidelines
            </button>
            <button
              onClick={() => onNavigate('/privacy')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('/admin')}
              className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors opacity-70 hover:opacity-100"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Moderation</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400 dark:text-neutral-500 text-[11px]">
          <p>© {new Date().getFullYear()} StudentVoice. Zero user tracking. No cookies.</p>
          <p className="flex items-center gap-1.5">
            <span>Powered by Cloudflare Workers & D1</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
