import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ToastMessage } from '@/types/toast';
import './Toast.css';

/** Matches the fade-out in Toast.css. */
const EXIT_MS = 160;
/** A downward drag this long dismisses the bar. */
const SWIPE_PX = 40;

const svg = (children: ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  success: svg(<path d="m5 12.5 4.5 4.5L19 7.5" />),
  warning: svg(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>),
  error: svg(<><path d="M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4M12 17h.01" /></>),
  info: svg(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  bookmark: svg(<path d="M6 4h12v16l-6-4.5L6 20Z" />),
};

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

/**
 * The ink bar: one dark bar near the bottom with an icon, a title, an
 * optional detail and action, and a dismiss ×. It leaves on its own after
 * 4s (6s with an action, 7s for errors), waiting while hovered or focused;
 * a downward swipe dismisses it.
 */
export function Toast({ toast, onClose }: ToastProps) {
  const { id, type, title, message, action, icon } = toast;
  const [leaving, setLeaving] = useState(false);
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<number | null>(null);

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(id), EXIT_MS);
  }, [id, onClose]);

  // Auto-dismiss, paused while the pointer or focus is on the bar.
  const remaining = useRef(type === 'error' ? 7000 : action ? 6000 : 4000);
  const timer = useRef<{ handle: number; started: number } | null>(null);
  const pause = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current.handle);
    remaining.current -= Date.now() - timer.current.started;
    timer.current = null;
  }, []);
  const resume = useCallback(() => {
    if (timer.current) return;
    timer.current = { handle: window.setTimeout(close, Math.max(0, remaining.current)), started: Date.now() };
  }, [close]);
  useEffect(() => {
    resume();
    return pause;
  }, [pause, resume]);

  return (
    <div
      className={`toast toast--${type}${leaving ? ' toast--leaving' : ''}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      style={drag ? { transform: `translateY(${drag}px)`, opacity: 1 - drag / 120 } : undefined}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') dragStart.current = e.clientY;
      }}
      onPointerMove={(e) => {
        if (dragStart.current !== null) setDrag(Math.max(0, e.clientY - dragStart.current));
      }}
      onPointerUp={() => {
        if (dragStart.current === null) return;
        dragStart.current = null;
        if (drag > SWIPE_PX) close();
        else setDrag(0);
      }}
      onPointerCancel={() => {
        dragStart.current = null;
        setDrag(0);
      }}
    >
      <span className="toast__icon" aria-hidden="true">{ICONS[icon ?? type]}</span>
      <div className="toast__text">
        <p className="toast__title">{title}</p>
        {message && <p className="toast__detail">{message}</p>}
      </div>
      {action && (
        <button
          type="button"
          className="toast__action"
          onClick={() => {
            action.onPress();
            close();
          }}
        >
          {action.label}
        </button>
      )}
      <button type="button" className="toast__close" onClick={close} aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
