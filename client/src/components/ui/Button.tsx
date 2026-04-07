import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, loadingText, children, disabled, style, ...props }, ref) => {
    // Preserve min-width when switching to spinner to prevent width shrink
    const minWidthStyle = loading ? { minWidth: 'var(--btn-min-w, auto)' } : {};

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? true : undefined}
        style={{ ...minWidthStyle, ...style }}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-[var(--radius-sm)] transition-all duration-300 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'active:scale-[0.97]',
          {
            // Primary — solid teal with glow on hover
            'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_20px_var(--primary-glow)] hover:-translate-y-0.5':
              variant === 'primary',
            // Secondary — glass
            'glass-card-static text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:-translate-y-0.5':
              variant === 'secondary',
            // Danger
            'bg-[var(--danger)] text-white hover:brightness-110 hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5':
              variant === 'danger',
            // Ghost
            'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]':
              variant === 'ghost',
            // Glow — primary with pulsing glow
            'bg-[var(--primary)] text-white animate-glow-pulse hover:brightness-110 hover:-translate-y-0.5':
              variant === 'glow',
          },
          {
            'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
            'px-5 py-2.5 text-sm gap-2': size === 'md',
            'px-7 py-3.5 text-base gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            {/* CSS-only spinner — no Loader2 import needed */}
            <span
              className={cn(
                'inline-block rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0',
                {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg',
                }
              )}
              aria-hidden="true"
            />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
