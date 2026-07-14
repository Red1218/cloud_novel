import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { StoredBook } from '@/types';
import { readerService } from '../services/readerService';

interface UsePdfDocumentResult {
  pdfDocument: PDFDocumentProxy | null;
  book: StoredBook | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage the loading lifecycle of a PDF document.
 */
export function usePdfDocument(bookId: string | undefined): UsePdfDocumentResult {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [book, setBook] = useState<StoredBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let currentTask: any = null;

    async function load() {
      if (!bookId) {
        setError('No book ID provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const storedBook = await readerService.loadBook(bookId);
        if (!isMounted) return;
        setBook(storedBook);

        const arrayBuffer = await readerService.convertBlobToArrayBuffer(storedBook.pdf);
        if (!isMounted) return;

        const loadingTask = readerService.loadPdfDocument(arrayBuffer);
        currentTask = loadingTask;
        
        const doc = await loadingTask.promise;
        if (!isMounted) {
          loadingTask.destroy();
          return;
        }

        setPdfDocument(doc);
      } catch (err: any) {
        console.error('Failed to load PDF document:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load PDF document.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
      if (currentTask) {
        currentTask.destroy();
      }
    };
  }, [bookId]);

  return { pdfDocument, book, isLoading, error };
}
