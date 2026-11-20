import { useState } from 'react';
import { MessageSquarePlus, Menu, X, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Feed', path: '/feed' },
    { label: 'Guidelines', path: '/guidelines' },
    { label: 'Privacy', path: '/privacy' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light/90 dark:bg-canvas-dark/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 font-semibold tracking-tight text-base hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-md bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900">
            <Shield className="w-4 h-4" />
          </div>
          <span>StudentVoice</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`transition-colors font-normal py-1 ${
                currentPath === item.path
                  ? 'text-neutral-900 dark:text-white font-medium border-b-2 border-neutral-900 dark:border-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => handleNavClick('/submit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Share Feedback</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`block w-full text-left py-2 px-3 rounded-md text-sm ${
                currentPath === item.path
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-border-subtle-light dark:border-border-subtle-dark">
            <button
              onClick={() => handleNavClick('/submit')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Anonymous Feedback</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
