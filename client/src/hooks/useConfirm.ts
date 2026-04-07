import { useState, useCallback, useRef } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ConfirmState extends ConfirmOptions {
  open: boolean;
  loading: boolean;
  resolve: ((value: boolean) => void) | null;
}

const initialState: ConfirmState = {
  open: false,
  loading: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  resolve: null,
};

/**
 * useConfirm — imperative confirmation dialog hook.
 *
 * Usage:
 *   const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
 *   const ok = await confirm({ title: 'Delete?', message: 'This cannot be undone.' });
 *   if (ok) { ... }
 *
 * Wire up <ConfirmDialog> in the component:
 *   <ConfirmDialog
 *     open={confirmState.open}
 *     onClose={handleCancel}
 *     onConfirm={handleConfirm}
 *     title={confirmState.title}
 *     message={confirmState.message}
 *     confirmText={confirmState.confirmText}
 *     cancelText={confirmState.cancelText}
 *     variant={confirmState.variant}
 *     loading={confirmState.loading}
 *   />
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>(initialState);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setConfirmState({
        ...initialState,
        ...options,
        open: true,
        loading: false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  return { confirm, confirmState, handleConfirm, handleCancel };
}
