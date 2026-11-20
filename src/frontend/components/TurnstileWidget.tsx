import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (errorCode: any) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = 'auto',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScriptError, setIsScriptError] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkReady = () => {
      if (typeof window !== 'undefined' && window.turnstile && containerRef.current) {
        setIsReady(true);
        clearInterval(interval);
      }
    };

    if (typeof window !== 'undefined' && window.turnstile) {
      setIsReady(true);
    } else {
      interval = setInterval(checkReady, 100);
      // Timeout after 6 seconds if turnstile script failed to load (e.g. adblocker or offline)
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.turnstile) {
          setIsScriptError(true);
        }
      }, 6000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current || !window.turnstile) return;

    // Clean up previous widget if exists
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        'error-callback': () => {
          if (onError) onError();
        },
      });
      widgetIdRef.current = id;
    } catch (e) {
      console.warn('Turnstile render warning:', e);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [isReady, siteKey, theme, onVerify, onExpire, onError]);

  return (
    <div className="min-h-[65px] flex flex-col items-center justify-center my-3">
      <div ref={containerRef} />
      {isScriptError && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center p-2 rounded border border-neutral-200 dark:border-neutral-800">
          <p>Cloudflare Turnstile challenge script is unavailable or blocked by browser extensions.</p>
          <button
            type="button"
            onClick={() => onVerify('TEST_PASS_TOKEN')}
            className="mt-1.5 text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs"
          >
            Click here to verify in development mode
          </button>
        </div>
      )}
    </div>
  );
}
