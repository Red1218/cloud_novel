import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface UseReaderNavigationOptions {
  /** Initial page number from persisted state (1-based). Defaults to 1. */
  initialPage?: number;
  /** Callback invoked whenever currentPage changes (for persistence). */
  onPageChange?: (page: number) => void;
}

export interface UseReaderNavigationResult {
  currentPage: number;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (targetPage: number) => void;
}

/**
 * Manages page navigation state for the Reader.
 *
 * Accepts initialPage from persisted state and reports changes via onPageChange.
 * Resets to initialPage (or 1) whenever the document changes.
 * All action callbacks are stable (useCallback with empty or constant deps).
 */
export function useReaderNavigation(
  pdfDocument: PDFDocumentProxy | null,
  options: UseReaderNavigationOptions = {},
): UseReaderNavigationResult {
  const { initialPage = 1, onPageChange } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Stable ref to total pages so callbacks never need it in their dep arrays.
  const totalPagesRef = useRef(0);
  totalPagesRef.current = pdfDocument?.numPages ?? 0;

  // Reset to initialPage when the document changes.
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [pdfDocument, initialPage]);

  const previousPage = useCallback(() => {
    setCurrentPage(prev => {
      const next = Math.max(1, prev - 1);
      if (next !== prev) {
        onPageChange?.(next);
      }
      return next;
    });
  }, [onPageChange]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      const total = totalPagesRef.current;
      const next = total > 0 ? Math.min(total, prev + 1) : prev;
      if (next !== prev) {
        onPageChange?.(next);
      }
      return next;
    });
  }, [onPageChange]);

  const goToPage = useCallback((targetPage: number) => {
    const total = totalPagesRef.current;
    setCurrentPage(prev => {
      const next = Math.min(Math.max(1, targetPage), Math.max(1, total));
      if (next !== prev) {
        onPageChange?.(next);
      }
      return next;
    });
  }, [onPageChange]);

  return { currentPage, nextPage, previousPage, goToPage };
}
