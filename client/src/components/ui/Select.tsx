import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]',
            'transition-all duration-200',
            'hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)]',
            'focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
