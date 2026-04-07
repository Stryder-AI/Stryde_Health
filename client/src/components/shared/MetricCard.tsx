import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  iconColor?: string;
  className?: string;
}

function AnimatedValue({ value }: { value: string | number }) {
  const isNumber = typeof value === 'number';
  const animatedCount = useCountUp(isNumber ? value : 0);

  return (
    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight count-up-value">
      {isNumber ? animatedCount.toLocaleString() : value}
    </p>
  );
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, iconColor, className }: MetricCardProps) {
  return (
    <div className={cn('glass-card p-5 group card-enter', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{title}</p>
          <AnimatedValue value={value} />
          {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
              trend.positive ? 'bg-[var(--success-bg)] text-emerald-600' : 'bg-[var(--danger-bg)] text-red-600'
            )}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.positive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-[var(--radius-sm)] transition-all duration-300',
          'group-hover:scale-110 group-hover:shadow-lg',
          iconColor || 'bg-[var(--primary-light)] text-[var(--primary)]'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
