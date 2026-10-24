import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastMessage } from '@/types/toast';
import { Toast } from '@/components/common/Toast/Toast';

interface ToastContextValue {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/** One bar at a time: a new toast replaces the one showing. */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const addToast = useCallback((next: Omit<ToastMessage, 'id'>) => {
    setToast({ ...next, id: crypto.randomUUID() });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toast && <Toast key={toast.id} toast={toast} onClose={removeToast} />}
      </div>
    </ToastContext.Provider>
  );
}
