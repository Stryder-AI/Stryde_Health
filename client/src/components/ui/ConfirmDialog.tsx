import { AlertTriangle, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const IconComponent = variant === 'info' ? Info : AlertTriangle;

  const iconColorClass =
    variant === 'danger'
      ? 'text-[var(--danger)]'
      : variant === 'warning'
      ? 'text-amber-500'
      : 'text-[var(--primary)]';

  const iconBgClass =
    variant === 'danger'
      ? 'bg-[var(--danger-bg)]'
      : variant === 'warning'
      ? 'bg-amber-500/10'
      : 'bg-[var(--primary-light)]';

  const confirmVariant: 'danger' | 'primary' =
    variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', iconBgClass)}>
          <IconComponent className={cn('w-7 h-7', iconColorClass)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
