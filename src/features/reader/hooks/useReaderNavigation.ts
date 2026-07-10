import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface UseReaderNavigationResult {
  currentPage:  number;
  nextPage:     () => void;
  previousPage: () => void;
  goToPage:     (targetPage: number) => void;
}

/**
 * Manages page navigation state for the Reader.
 *
 * Owns currentPage and resets to page 1 whenever the document changes.
 * All action callbacks are stable (useCallback with empty or constant deps).
 */
export function useReaderNavigation(
  pdfDocument: PDFDocumentProxy | null,
): UseReaderNavigationResult {
  const [currentPage, setCurrentPage] = useState(1);

  // Stable ref to total pages so callbacks never need it in their dep arrays.
  const totalPagesRef = useRef(0);
  totalPagesRef.current = pdfDocument?.numPages ?? 0;

  // Reset to page 1 when the document changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [pdfDocument]);

  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      const total = totalPagesRef.current;
      return total > 0 ? Math.min(total, prev + 1) : prev;
    });
  }, []);

  const goToPage = useCallback((targetPage: number) => {
    const total = totalPagesRef.current;
    setCurrentPage(Math.min(Math.max(1, targetPage), Math.max(1, total)));
  }, []);

  return { currentPage, nextPage, previousPage, goToPage };
}
