import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label htmlFor={checkboxId} className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-[var(--primary)]',
            'focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1',
            'transition-colors duration-200',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export { Checkbox };
