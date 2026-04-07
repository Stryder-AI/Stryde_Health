import { forwardRef, type InputHTMLAttributes } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, success, icon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--primary)] transition-colors duration-200">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              'transition-all duration-300 ease-out',
              'hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)]',
              'focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-11',
              (rightIcon || success) && 'pr-11',
              error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] animate-shake',
              success && !error && 'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]',
              className
            )}
            {...props}
          />
          {/* Right side: success checkmark OR custom rightIcon (rightIcon takes precedence visually when both exist) */}
          {success && !error && !rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--danger)] flex items-center gap-1 animate-fade-in">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold leading-[14px] text-center shrink-0">!</span>
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
