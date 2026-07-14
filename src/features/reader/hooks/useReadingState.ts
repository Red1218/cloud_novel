import { useCallback, useRef, useEffect } from 'react';
import type { ScaleMode } from '../types';
import { BookRepository } from '@/repositories/BookRepository';

/**
 * Reading state that is persisted to IndexedDB.
 */
export interface PersistedReadingState {
  currentPage: number;
  zoom: number;
  scaleMode: ScaleMode;
  lastOpened: number;
}

/**
 * Partial state for updates (all fields optional).
 */
export type ReadingStateUpdate = Partial<PersistedReadingState>;

/**
 * Result of the useReadingState hook.
 */
export interface UseReadingStateResult {
  /** Immediately persist lastOpened (call when book is opened). */
  touchLastOpened: () => Promise<void>;
  /** Queue a debounced persistence update (500ms). */
  queueUpdate: (update: ReadingStateUpdate) => void;
  /** Immediately flush any pending updates. */
  flush: () => Promise<void>;
}

/** Debounce delay in milliseconds. */
const DEBOUNCE_MS = 500;

/**
 * Hook to manage persisted reading state for a book.
 *
 * Responsibilities:
 * - Queue debounced updates for currentPage, zoom, scaleMode (500ms)
 * - Immediately persist lastOpened when requested
 * - Flush pending updates on visibilitychange and beforeunload
 *
 * This hook does NOT own the state values — it only handles persistence.
 * The actual state lives in useReader and its sub-hooks.
 *
 * @param bookId - The UUID of the book being read
 */
export function useReadingState(bookId: string | undefined): UseReadingStateResult {
  const pendingUpdateRef = useRef<ReadingStateUpdate | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFlushingRef = useRef(false);

  /**
   * Persist the given update to IndexedDB immediately.
   */
  const persistUpdate = useCallback(async (update: ReadingStateUpdate): Promise<void> => {
    if (!bookId) return;
    await BookRepository.updateReadingState(bookId, update);
  }, [bookId]);

  /**
   * Immediately persist lastOpened timestamp.
   * Call this when the book is first opened.
   */
  const touchLastOpened = useCallback(async (): Promise<void> => {
    await persistUpdate({ lastOpened: Date.now() });
  }, [persistUpdate]);

  /**
   * Flush any pending update immediately.
   *
   * Race-safe: If updates are queued during an active flush,
   * they are captured and a follow-up flush is scheduled automatically.
   */
  const flush = useCallback(async (): Promise<void> => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // If a flush is already in progress, don't proceed.
    // The active flush will capture any pending updates and schedule a follow-up.
    if (isFlushingRef.current) return;

    // Snapshot and clear pending updates
    const pending = pendingUpdateRef.current;
    if (!pending) return;

    pendingUpdateRef.current = null;
    isFlushingRef.current = true;

    try {
      await persistUpdate(pending);
    } finally {
      isFlushingRef.current = false;

      // If new updates arrived during the flush, schedule another flush
      if (pendingUpdateRef.current !== null) {
        void flush();
      }
    }
  }, [persistUpdate]);

  /**
   * Queue an update to be persisted after the debounce delay.
   * Multiple calls within the debounce window are merged.
   */
  const queueUpdate = useCallback((update: ReadingStateUpdate): void => {
    // Merge with any existing pending update
    pendingUpdateRef.current = {
      ...pendingUpdateRef.current,
      ...update,
    };

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void flush();
    }, DEBOUNCE_MS);
  }, [flush]);

  /**
   * Flush pending updates on page hide/unload to prevent data loss.
   */
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        void flush();
      }
    };

    const handleBeforeUnload = (): void => {
      void flush();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Flush any pending updates when the hook unmounts
      void flush();
    };
  }, [flush]);

  return {
    touchLastOpened,
    queueUpdate,
    flush,
  };
}
