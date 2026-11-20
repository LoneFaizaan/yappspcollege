import { ShieldAlert } from 'lucide-react';
import { PiiDetectionResult } from '../../shared/validation';

interface PiiWarningBannerProps {
  piiResult: PiiDetectionResult;
}

export function PiiWarningBanner({ piiResult }: PiiWarningBannerProps) {
  if (!piiResult.hasPii) return null;

  return (
    <div
      role="alert"
      className="p-3.5 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-sm transition-all animate-fadeIn"
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-xs tracking-wide uppercase text-amber-700 dark:text-amber-400">
            Privacy Alert: Potential identifying details detected
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-800 dark:text-amber-300">
            {piiResult.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 pt-1">
            To ensure complete anonymity and protect yourself and others, please remove names, emails, phone numbers, and student IDs before submitting.
          </p>
        </div>
      </div>
    </div>
  );
}
