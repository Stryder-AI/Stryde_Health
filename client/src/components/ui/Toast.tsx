import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />,
  error: <AlertCircle className="w-5 h-5 text-[var(--danger)]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />,
  info: <Info className="w-5 h-5 text-[var(--info)]" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-l-[3px] border-l-[var(--success)]',
  error: 'border-l-[3px] border-l-[var(--danger)]',
  warning: 'border-l-[3px] border-l-[var(--warning)]',
  info: 'border-l-[3px] border-l-[var(--info)]',
};

let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function notify(listeners: Array<(t: ToastItem[]) => void>) {
  listeners.forEach((fn) => fn([...toasts]));
}

function addToast(type: ToastType, message: string, title?: string) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, type, message, title }];
  notify(toastListeners);
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify(toastListeners);
  }, 4000);
}

export const toast = {
  success: (message: string, title?: string) => addToast('success', message, title),
  error: (message: string, title?: string) => addToast('error', message, title),
  warning: (message: string, title?: string) => addToast('warning', message, title),
  info: (message: string, title?: string) => addToast('info', message, title),
};

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => { toastListeners = toastListeners.filter((fn) => fn !== setItems); };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify(toastListeners);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'glass-elevated p-4 flex items-start gap-3 animate-slide-in-right',
            borderStyles[item.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[item.type]}</div>
          <div className="flex-1 min-w-0">
            {item.title && <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>}
            <p className="text-sm text-[var(--text-secondary)]">{item.message}</p>
          </div>
          <button
            onClick={() => dismiss(item.id)}
            className="flex-shrink-0 p-1 hover:bg-[var(--surface)] rounded-[var(--radius-xs)] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          </button>
        </div>
      ))}
    </div>
  );
}
