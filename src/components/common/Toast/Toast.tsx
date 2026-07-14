import { useEffect, useState } from 'react';
import type { ToastType } from '@/types';
import './Toast.css';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the slide-out animation to finish before actually removing from DOM
    setTimeout(() => {
      onClose(id);
    }, 300); // matches --transition-slow or similar duration
  };

  return (
    <div 
      className={`toast toast--${type} ${isClosing ? 'toast--closing' : ''}`}
      role="alert"
    >
      <div className="toast__content">
        <h4 className="toast__title">{title}</h4>
        {message && <p className="toast__message">{message}</p>}
      </div>
      <button 
        type="button" 
        className="toast__close" 
        onClick={handleClose}
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
