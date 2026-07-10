import { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks';
import {
  ReaderHeader,
  LoadingState,
  ErrorState,
  PdfCanvas,
  usePdfDocument,
  usePdfRenderer,
  useReader,
} from '@/features/reader';
import './ReaderPage.css';

/**
 * Reader page — composition only.
 *
 * Wires together:
 *  - usePdfDocument  (loads StoredBook + PDFDocumentProxy)
 *  - useReader       (all Reader state: page, zoom, viewport, shortcuts)
 *  - usePdfRenderer  (pure canvas rendering)
 *
 * Contains no Reader business logic.
 */
export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);

  const reader = useReader(pdfDocument, containerRef);

  useDocumentTitle(
    book?.title ? `${book.title} — Page ${reader.currentPage}` : 'Reader',
  );

  // Ensure the header is visible when the reader opens.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  usePdfRenderer({
    page:     reader.page,
    viewport: reader.viewport,
    canvasRef,
  });

  return (
    <div className="reader-page">
      <ReaderHeader
        title={book?.title}
        currentPage={reader.currentPage}
        totalPages={reader.totalPages}
        zoom={reader.effectiveZoom}
        onPrevPage={reader.previousPage}
        onNextPage={reader.nextPage}
        onZoomIn={reader.zoomIn}
        onZoomOut={reader.zoomOut}
        onResetZoom={reader.resetZoom}
        onFitWidth={reader.fitWidth}
        onFitPage={reader.fitPage}
      />

      <main className="reader-page__content">
        {isLoading && <LoadingState />}

        {error && !isLoading && <ErrorState message={error} />}

        <PdfCanvas
          ref={canvasRef}
          containerRef={containerRef}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  );
}
