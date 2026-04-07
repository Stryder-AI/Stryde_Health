import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'danger' | 'warning' | 'success' | 'info' | 'accent';
  dot?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)]',
  waiting: 'bg-[var(--warning-bg)] text-amber-600 dark:text-amber-400',
  in_progress: 'bg-[var(--info-bg)] text-blue-600 dark:text-blue-400',
  completed: 'bg-[var(--success-bg)] text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-[var(--danger-bg)] text-red-600 dark:text-red-400',
  danger: 'bg-[var(--danger-bg)] text-red-600 dark:text-red-400',
  warning: 'bg-[var(--warning-bg)] text-amber-600 dark:text-amber-400',
  success: 'bg-[var(--success-bg)] text-emerald-600 dark:text-emerald-400',
  info: 'bg-[var(--info-bg)] text-blue-600 dark:text-blue-400',
  accent: 'bg-[rgba(139,92,246,0.1)] text-purple-600 dark:text-purple-400',
};

const dotColors: Record<string, string> = {
  waiting: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  accent: 'bg-purple-500',
  default: 'bg-gray-400',
};

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-soft', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
