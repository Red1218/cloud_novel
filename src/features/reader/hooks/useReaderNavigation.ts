import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ReadingStateUpdate } from '@/repositories/BookRepository';

/**
 * Manages page navigation state for the Reader.
 *
 * Resets to initialPage whenever the document changes and reports every
 * page change to `persist`. All action callbacks are stable.
 */
export function useReaderNavigation(
  pdfDocument: PDFDocumentProxy | null,
  initialPage: number,
  persist: (update: ReadingStateUpdate) => void,
) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Stable ref to total pages so callbacks never need it in their dep arrays.
  const totalPagesRef = useRef(0);
  totalPagesRef.current = pdfDocument?.numPages ?? 0;

  // Reset to initialPage when the document changes.
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [pdfDocument, initialPage]);

  /** Moves to the page `target` picks, clamped to the document. */
  const move = useCallback((target: (prev: number) => number) => {
    setCurrentPage(prev => {
      const total = totalPagesRef.current;
      if (total === 0) return prev;
      const next = Math.min(Math.max(1, target(prev)), total);
      if (next !== prev) persist({ currentPage: next });
      return next;
    });
  }, [persist]);

  const previousPage = useCallback(() => move(prev => prev - 1), [move]);
  const nextPage = useCallback(() => move(prev => prev + 1), [move]);
  const goToPage = useCallback((page: number) => move(() => page), [move]);

  return { currentPage, nextPage, previousPage, goToPage };
}
