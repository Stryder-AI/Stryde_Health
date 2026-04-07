import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-shimmer rounded-[var(--radius-sm)]', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card-static p-0 overflow-hidden">
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
