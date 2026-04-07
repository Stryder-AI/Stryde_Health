import { cn } from '@/lib/utils';

interface InlineLoaderProps {
  variant?: 'dots' | 'bar' | 'pulse';
  className?: string;
  label?: string;
}

export function InlineLoader({ variant = 'dots', className, label }: InlineLoaderProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status" aria-label={label ?? 'Loading'}>
      {variant === 'dots' && (
        <span className="inline-flex items-center gap-1">
          <style>{`
            @keyframes inline-bounce {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
              40% { transform: translateY(-5px); opacity: 1; }
            }
          `}</style>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
              style={{
                animation: 'inline-bounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </span>
      )}

      {variant === 'bar' && (
        <span className="relative inline-block w-20 h-1 rounded-full bg-[var(--surface-border)] overflow-hidden">
          <style>{`
            @keyframes bar-fill {
              0% { left: -100%; }
              100% { left: 100%; }
            }
          `}</style>
          <span
            className="absolute inset-y-0 w-1/2 rounded-full bg-[var(--primary)]"
            style={{ animation: 'bar-fill 1.2s ease-in-out infinite' }}
          />
        </span>
      )}

      {variant === 'pulse' && (
        <span className="relative inline-flex items-center justify-center w-4 h-4">
          <style>{`
            @keyframes pulse-ring {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>
          <span
            className="absolute inset-0 rounded-full bg-[var(--primary)]"
            style={{ animation: 'pulse-ring 1.2s ease-out infinite' }}
          />
          <span className="relative w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
        </span>
      )}

      {label && (
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      )}
    </span>
  );
}
