import { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextLayer } from 'pdfjs-dist';
import { useDocumentTitle } from '@/hooks';
import {
  ReaderHeader,
  LoadingState,
  ErrorState,
  ReaderViewport,
  usePdfDocument,
  usePdfRenderer,
  usePdfTextLayer,
  useReader,
} from '@/features/reader';
import './ReaderPage.css';

/**
 * Reader page — composition and orchestration only.
 *
 * Wires together all hooks and passes results to presentational components:
 *  - usePdfDocument   loads StoredBook + PDFDocumentProxy from IndexedDB
 *  - useReader        all Reader state: page, viewport, zoom, shortcuts, persistence
 *  - usePdfRenderer   pure canvas rendering (unchanged)
 *  - usePdfTextLayer  fetches TextContent per page for the text layer
 *
 * Contains no Reader business logic.
 * ReaderViewport receives all data as props and handles all layer composition.
 */
export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);

  // useReader is the single owner of reading state persistence.
  // It exposes touchLastOpened() and flushPersistence() for external control.
  const reader = useReader(pdfDocument, containerRef, bookId, {
    initialPage: book?.currentPage ?? 1,
    initialZoom: book?.zoom,
    initialScaleMode: book?.scaleMode,
  });

  // Touch lastOpened immediately when book is first loaded.
  // This is called only once per book load.
  useEffect(() => {
    if (book) {
      void reader.touchLastOpened();
    }
  }, [book, reader]);

  // Fetch text content for the current page.
  // Re-fetches only when `reader.page` changes — not on zoom or resize.
  const { textContent } = usePdfTextLayer(reader.page);

  useDocumentTitle(
    book?.title ? `${book.title} — Page ${reader.currentPage}` : 'Reader',
  );

  // Call TextLayer.cleanup() once when the document unloads.
  //
  // TextLayer.cleanup() releases global static state held by the TextLayer
  // class (font metrics caches, canvas contexts). It must be called only
  // during document teardown — NOT on page navigation, zoom, or resize.
  //
  // The effect runs whenever pdfDocument changes. The cleanup function fires
  // when pdfDocument transitions away from a value (i.e. becomes null on
  // unload), which is the correct and only moment to call this.
  useEffect(() => {
    if (!pdfDocument) return;
    return () => {
      TextLayer.cleanup();
    };
  }, [pdfDocument]);

  // Ensure the header is visible when the reader opens.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  usePdfRenderer({
    page: reader.page,
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

        <ReaderViewport
          page={reader.page}
          viewport={reader.viewport}
          textContent={textContent}
          isLoading={isLoading}
          error={error}
          canvasRef={canvasRef}
          containerRef={containerRef}
        />
      </main>
    </div>
  );
}
