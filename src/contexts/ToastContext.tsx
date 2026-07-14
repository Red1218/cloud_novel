import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastMessage } from '@/types';
import { ToastContainer } from '@/components/common/Toast';

interface ToastContextValue {
  addToast: (toast: Omit<ToastMessage, 'id'> & { id?: string }) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'> & { id?: string }) => {
    const id = toast.id || crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
