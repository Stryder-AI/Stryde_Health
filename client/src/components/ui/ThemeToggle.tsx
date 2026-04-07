import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle
 * - Animated sun/moon transition on toggle
 * - Tooltip shows current/target theme
 * - Glow effect in dark mode
 * - System preference detection on first load
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle, setTheme } = useThemeStore();
  const [toggling, setToggling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Detect system preference on first mount (only if no stored preference)
  useEffect(() => {
    const stored = localStorage.getItem('stryde-theme');
    if (!stored && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) {
        setTheme('dark');
      }
      // Listen for system preference changes
      const handler = (e: MediaQueryListEvent) => {
        const storedNow = localStorage.getItem('stryde-theme');
        // Only auto-switch if user hasn't manually set it
        if (!storedNow) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    setToggling(true);
    toggle();
    setTimeout(() => setToggling(false), 500);
  };

  const isDark = theme === 'dark';
  const tooltipText = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <button
        onClick={handleToggle}
        aria-label={tooltipText}
        className={cn(
          'relative w-14 h-7 rounded-full transition-all duration-500 ease-out',
          'border border-[var(--surface-border)]',
          isDark
            ? 'bg-[var(--surface)] theme-toggle-active'
            : 'bg-[var(--primary-light)]',
          'hover:shadow-[0_0_16px_var(--primary-glow)]',
          className
        )}
      >
        {/* Track icons */}
        <Sun
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500 transition-opacity duration-300"
          style={{ opacity: isDark ? 0 : 0.4 }}
          aria-hidden="true"
        />
        <Moon
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400 transition-opacity duration-300"
          style={{ opacity: isDark ? 0.4 : 0 }}
          aria-hidden="true"
        />

        {/* Thumb with icon rotation animation */}
        <span
          className={cn(
            'absolute top-0.5 w-6 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-center',
            'shadow-md',
            isDark
              ? 'left-[calc(100%-1.625rem)] bg-[var(--primary)]'
              : 'left-0.5 bg-white'
          )}
        >
          <span
            className="transition-transform duration-500 ease-out"
            style={{
              transform: toggling
                ? 'rotate(180deg) scale(0.7)'
                : 'rotate(0deg) scale(1)',
            }}
          >
            {isDark
              ? <Moon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              : <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            }
          </span>
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50',
            'px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-medium whitespace-nowrap',
            'glass-elevated shadow-md text-[var(--text-primary)] pointer-events-none',
            'animate-fade-in-scale'
          )}
          role="tooltip"
        >
          {tooltipText}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--surface-elevated)]"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
