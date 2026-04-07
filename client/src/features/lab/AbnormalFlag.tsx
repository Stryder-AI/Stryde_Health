import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

export type AbnormalLevel = 'normal' | 'slight' | 'critical';

export interface AbnormalFlagProps {
  value: string | number;
  unit?: string;
  min?: number;
  max?: number;
  referenceRange?: string;
  /** Compact mode hides the reference range subtitle */
  compact?: boolean;
  className?: string;
}

// ─── Classification Logic ──────────────────────────────────────────────────

export function classifyValue(
  value: string | number,
  min?: number,
  max?: number
): { level: AbnormalLevel; direction: 'high' | 'low' | null } {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || min === undefined || max === undefined) {
    return { level: 'normal', direction: null };
  }

  const range = max - min;
  const threshold = range * 0.1; // 10% of range
  const criticalThreshold = range * 0.2; // 20% of range

  if (num >= min && num <= max) {
    return { level: 'normal', direction: null };
  }

  if (num < min) {
    const deviation = min - num;
    if (deviation > criticalThreshold) {
      return { level: 'critical', direction: 'low' };
    }
    return { level: 'slight', direction: 'low' };
  }

  // num > max
  const deviation = num - max;
  if (deviation > criticalThreshold) {
    return { level: 'critical', direction: 'high' };
  }
  return { level: 'slight', direction: 'high' };
}

// ─── Component ─────────────────────────────────────────────────────────────

export function AbnormalFlag({
  value,
  unit,
  min,
  max,
  referenceRange,
  compact = false,
  className,
}: AbnormalFlagProps) {
  const strVal = String(value).trim();
  if (!strVal) return null;

  const { level, direction } = classifyValue(value, min, max);

  const arrow = direction === 'high' ? ' \u2191' : direction === 'low' ? ' \u2193' : '';

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <div className="flex items-center gap-1.5">
        {/* Value display */}
        <span
          className={cn(
            'text-sm tabular-nums transition-all duration-200',
            level === 'normal' && 'text-emerald-600 dark:text-emerald-400 font-medium',
            level === 'slight' && 'text-amber-600 dark:text-amber-400 font-semibold',
            level === 'critical' && 'text-red-600 dark:text-red-400 font-bold animate-pulse'
          )}
        >
          {strVal}
          {unit && <span className="text-xs ml-0.5 opacity-70">{unit}</span>}
          {arrow && (
            <span
              className={cn(
                'ml-0.5 text-xs font-bold',
                level === 'slight' && 'text-amber-500 dark:text-amber-400',
                level === 'critical' && 'text-red-500 dark:text-red-400'
              )}
            >
              {arrow}
            </span>
          )}
        </span>

        {/* Icon indicators */}
        {level === 'slight' && (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        )}
        {level === 'critical' && (
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
          </span>
        )}
      </div>

      {/* Reference range subtitle */}
      {!compact && referenceRange && (
        <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">
          Ref: {referenceRange}
        </span>
      )}
    </div>
  );
}

// ─── Inline Badge for tables / report views ────────────────────────────────

export function AbnormalBadge({
  flag,
  value,
  className,
}: {
  flag?: 'H' | 'L' | null;
  value?: string;
  className?: string;
}) {
  if (!flag) return null;

  // Try to determine severity from the value and context
  // For the badge, we just show H/L with color coding
  const isHigh = flag === 'H';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
        isHigh
          ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
        className
      )}
    >
      {isHigh ? '\u2191' : '\u2193'} {flag}
    </span>
  );
}

// ─── Report-level ABNORMAL badge ───────────────────────────────────────────

export function ReportAbnormalBadge({
  flaggedCount,
  className,
}: {
  flaggedCount: number;
  className?: string;
}) {
  if (flaggedCount === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider',
        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        'border border-red-200 dark:border-red-800/50',
        'animate-fade-in',
        className
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      ABNORMAL
      <span className="text-[10px] font-semibold opacity-75">({flaggedCount})</span>
    </span>
  );
}
