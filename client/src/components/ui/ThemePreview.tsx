import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';

/**
 * ThemePreview — Two circles (light/dark), click to switch.
 * Used in admin settings.
 */
export function ThemePreview({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Light theme circle */}
      <button
        onClick={() => setTheme('light')}
        aria-label="Switch to light mode"
        aria-pressed={theme === 'light'}
        className={cn(
          'relative w-12 h-12 rounded-full transition-all duration-300 group',
          'hover:scale-110 active:scale-95',
          theme === 'light'
            ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-base)] scale-110'
            : 'opacity-60 hover:opacity-90'
        )}
        style={{
          background: 'linear-gradient(135deg, #F0F4FA 40%, #e2e8f0 100%)',
          boxShadow: theme === 'light' ? '0 0 16px rgba(13,148,136,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Mini preview layout */}
        <div className="absolute inset-2 rounded-full overflow-hidden">
          <div className="w-full h-1/3 bg-white/80 rounded-t-full" />
          <div className="w-full h-2/3 bg-[#F0F4FA] flex items-center justify-center">
            <div className="w-4 h-0.5 bg-[#0D9488] rounded-full opacity-60" />
          </div>
        </div>
        {theme === 'light' && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        )}
        <span className="sr-only">Light</span>
      </button>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Theme
        </span>
        <div className="w-8 h-px bg-[var(--surface-border)]" />
      </div>

      {/* Dark theme circle */}
      <button
        onClick={() => setTheme('dark')}
        aria-label="Switch to dark mode"
        aria-pressed={theme === 'dark'}
        className={cn(
          'relative w-12 h-12 rounded-full transition-all duration-300 group',
          'hover:scale-110 active:scale-95',
          theme === 'dark'
            ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-base)] scale-110'
            : 'opacity-60 hover:opacity-90'
        )}
        style={{
          background: 'linear-gradient(135deg, #0F172A 40%, #1e293b 100%)',
          boxShadow: theme === 'dark' ? '0 0 16px rgba(20,184,166,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Mini preview layout */}
        <div className="absolute inset-2 rounded-full overflow-hidden">
          <div className="w-full h-1/3 bg-[#1e293b] rounded-t-full" />
          <div className="w-full h-2/3 bg-[#080E1A] flex items-center justify-center">
            <div className="w-4 h-0.5 bg-[#14B8A6] rounded-full opacity-60" />
          </div>
        </div>
        {theme === 'dark' && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        )}
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}
