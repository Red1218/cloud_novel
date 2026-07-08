import { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks';
import {
  ReaderHeader,
  LoadingState,
  ErrorState,
  PdfCanvas,
  usePdfDocument,
  usePdfRenderer,
} from '@/features/reader';
import './ReaderPage.css';

export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  
  const { pdfDocument, book, isLoading: isDocumentLoading, error } = usePdfDocument(bookId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = pdfDocument?.numPages || 0;

  // Reset scroll position immediately on mount to ensure header is visible
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Reset to page 1 when a new document loads
  useEffect(() => {
    if (pdfDocument) {
      setCurrentPage(1);
    }
  }, [pdfDocument]);

  // Update document title dynamically
  const title = book?.title ? `${book.title} — Page ${currentPage}` : 'Reader';
  useDocumentTitle(title);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if (totalPages > 0) {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }
  }, [totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key presses while typing inside input or textarea elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  usePdfRenderer({ pdfDocument, canvasRef, currentPage });

  return (
    <div className="reader-page">
      <ReaderHeader 
        title={book?.title} 
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
      
      <main className="reader-page__content">
        {isDocumentLoading && <LoadingState />}
        
        {error && !isDocumentLoading && <ErrorState message={error} />}
        
        <PdfCanvas 
          ref={canvasRef} 
          isLoading={isDocumentLoading} 
          error={error} 
        />
      </main>
    </div>
  );
}
