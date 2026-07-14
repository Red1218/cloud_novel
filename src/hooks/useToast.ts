import { useContext, useCallback } from 'react';
import { ToastContext } from '@/contexts/ToastContext';
import type { ToastMessage } from '@/types';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'> & { id?: string }) => {
    context.addToast(toast);
  }, [context]);

  return { showToast };
}
