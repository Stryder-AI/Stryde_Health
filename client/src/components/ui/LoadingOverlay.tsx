import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  subtitle?: string;
}

export function LoadingOverlay({ visible, text, subtitle = 'Please wait...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[9000] flex items-center justify-center',
        'bg-black/40 backdrop-blur-sm',
        'animate-fade-in'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={text ?? 'Loading'}
    >
      <div className="glass-elevated rounded-[var(--radius-lg)] px-10 py-8 flex flex-col items-center gap-5 shadow-xl min-w-[200px]">
        {/* Teal CSS spinner */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <span
            className="absolute inset-0 rounded-full border-[3px] border-[var(--primary-light)] border-t-[var(--primary)]"
            style={{ animation: 'spin 0.9s linear infinite' }}
          />
          <span
            className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-[var(--accent)]"
            style={{ animation: 'spin 1.4s linear infinite reverse' }}
          />
        </div>

        {text && (
          <p className="text-sm font-semibold text-[var(--text-primary)] text-center">{text}</p>
        )}
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] text-center -mt-2">{subtitle}</p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}
