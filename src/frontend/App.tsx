import { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { SubmitPage } from './pages/SubmitPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { api } from './lib/api';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [queryState, setQueryState] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const res: Record<string, string> = {};
      search.forEach((val, key) => {
        res[key] = val;
      });
      return res;
    }
    return {};
  });

  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>('1x00000000000000000000AA');

  useEffect(() => {
    api
      .getConfig()
      .then((cfg) => {
        if (cfg?.turnstileSiteKey) {
          setTurnstileSiteKey(cfg.turnstileSiteKey);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch config from worker, using default test site key:', err);
      });
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      const search = new URLSearchParams(window.location.search);
      const res: Record<string, string> = {};
      search.forEach((val, key) => {
        res[key] = val;
      });
      setQueryState(res);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, query?: Record<string, string>) => {
    let url = path;
    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
      setQueryState(query);
    } else {
      setQueryState({});
    }

    window.history.pushState({}, '', url);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 transition-colors">
        <Navbar currentPath={currentPath} onNavigate={navigate} />

        <main className="flex-1">
          {currentPath === '/' && (
            <HomePage onNavigate={navigate} turnstileSiteKey={turnstileSiteKey} />
          )}
          {currentPath === '/feed' && (
            <FeedPage
              initialCategory={queryState.category}
              onNavigate={navigate}
              turnstileSiteKey={turnstileSiteKey}
            />
          )}
          {currentPath === '/submit' && (
            <SubmitPage onNavigate={navigate} turnstileSiteKey={turnstileSiteKey} />
          )}
          {currentPath === '/guidelines' && <GuidelinesPage onNavigate={navigate} />}
          {currentPath === '/privacy' && <PrivacyPolicyPage />}
          {currentPath === '/admin' && <AdminDashboardPage />}
          {![
            '/',
            '/feed',
            '/submit',
            '/guidelines',
            '/privacy',
            '/admin',
          ].includes(currentPath) && (
            <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
              <h1 className="text-3xl font-bold">Page Not Found</h1>
              <p className="text-xs text-neutral-500">
                The page you requested does not exist or has moved.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                Return to Home
              </button>
            </div>
          )}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </ToastProvider>
  );
}
