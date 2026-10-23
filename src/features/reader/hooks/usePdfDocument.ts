import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { StoredBook } from '@/types/book';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { BookRepository } from '@/repositories/BookRepository';

interface UsePdfDocumentResult {
  pdfDocument: PDFDocumentProxy | null;
  book: StoredBook | null;
  isLoading: boolean;
  error: string | null;
}

/** One PDF.js worker for every book opened, so opening a book skips its start-up. */
let sharedWorker: pdfjsLib.PDFWorker | null = null;

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
    let currentTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

    async function load() {
      if (!bookId) {
        setError('No book ID provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const storedBook = await BookRepository.getStoredBookById(bookId);
        if (!storedBook) throw new Error('Book not found in library.');
        if (!isMounted) return;
        setBook(storedBook);

        const data = new Uint8Array(await storedBook.pdf.arrayBuffer());
        if (!isMounted) return;

        sharedWorker ??= new pdfjsLib.PDFWorker();
        const loadingTask = pdfjsLib.getDocument({ data, worker: sharedWorker });
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
