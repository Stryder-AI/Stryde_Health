import { useEffect, useRef, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullscreen';
  /** Custom header content rendered instead of title/description */
  headerContent?: ReactNode;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
  fullscreen: 'max-w-[95vw] w-[95vw]',
};

// Returns all focusable elements inside a container, in DOM order
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[inert]') && getComputedStyle(el).display !== 'none'
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
  headerContent,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Remember what was focused before the modal opened so we can restore it
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descId = useId();

  // Store the trigger element when modal opens
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  // Focus first focusable element when opened; restore focus on close
  useEffect(() => {
    if (!open) {
      // Restore focus to trigger element
      previousFocusRef.current?.focus();
      return;
    }

    document.body.style.overflow = 'hidden';

    // Small delay to let the portal paint before focusing
    const timer = requestAnimationFrame(() => {
      if (dialogRef.current) {
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    });

    return () => {
      cancelAnimationFrame(timer);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Keyboard: Escape to close + focus trap (Tab / Shift+Tab)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if focus is on first element, wrap to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if focus is on last element, wrap to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isFullscreen = size === 'fullscreen';

  const modalContent = (
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto',
        isFullscreen ? 'p-2 sm:p-4' : 'p-4 pt-[5vh]'
      )}
      // Only close when clicking directly on the overlay (not bubbled from modal)
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
        style={{ animationDuration: '0.2s' }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title || headerContent ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full glass-elevated p-0 animate-fade-in-scale my-auto',
          'outline-none',
          isFullscreen ? 'min-h-[90vh] flex flex-col' : '',
          sizeMap[size],
          className
        )}
        // Stop mousedown from bubbling to overlay (prevents accidental close)
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || headerContent) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--surface-border)] shrink-0">
            {headerContent ? (
              <div id={titleId}>{headerContent}</div>
            ) : (
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-[var(--text-primary)]"
                >
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="text-sm text-[var(--text-secondary)] mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all duration-200 group ml-4 shrink-0"
            >
              <X className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            'px-6 py-5 overflow-y-auto',
            isFullscreen ? 'flex-1' : 'max-h-[70vh]'
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-border)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
