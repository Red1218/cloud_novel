import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import { TextLayer } from 'pdfjs-dist';
import { useDocumentTitle } from '@/hooks';
import {
  ReaderHeader,
  ReaderToolbar,
  LoadingState,
  ErrorState,
  ReaderViewport,
  usePdfDocument,
  usePdfRenderer,
  usePdfTextLayer,
  useReader,
} from '@/features/reader';
import './ReaderPage.css';

const CHROME_HIDE_DELAY_MS = 10_000;
const ZOOM_FEEDBACK_DELAY_MS = 1_000;

/**
 * Reader page - composition and orchestration only.
 *
 * ReaderViewport remains the PDF layer. Header, toolbar, and zoom feedback
 * are temporary reader chrome layered around it.
 */
export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chromeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousZoomPctRef = useRef<number | null>(null);
  const isChromeVisibleRef = useRef(false);
  const isCoarsePointerRef = useRef(
    window.matchMedia('(hover: none), (pointer: coarse)').matches,
  );

  const [isChromeVisible, setIsChromeVisible] = useState(false);
  const [zoomFeedback, setZoomFeedback] = useState<string | null>(null);

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);

  const reader = useReader(pdfDocument, containerRef, bookId, {
    initialPage: book?.currentPage ?? 1,
    initialZoom: book?.zoom,
    initialScaleMode: book?.scaleMode,
  });
  const { touchLastOpened } = reader;
  const loadedBookId = book?.id;

  useEffect(() => {
    if (loadedBookId) {
      void touchLastOpened();
    }
  }, [loadedBookId, touchLastOpened]);

  const { textContent } = usePdfTextLayer(reader.page);

  useDocumentTitle(
    book?.title ? `${book.title} - Page ${reader.currentPage}` : 'Reader',
  );

  useEffect(() => {
    if (!pdfDocument) return;
    return () => {
      TextLayer.cleanup();
    };
  }, [pdfDocument]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  usePdfRenderer({
    page: reader.page,
    viewport: reader.viewport,
    canvasRef,
  });

  const clearChromeTimer = useCallback((): void => {
    if (chromeTimerRef.current) {
      clearTimeout(chromeTimerRef.current);
      chromeTimerRef.current = null;
    }
  }, []);

  const scheduleChromeHide = useCallback((): void => {
    clearChromeTimer();
    chromeTimerRef.current = setTimeout(() => {
      isChromeVisibleRef.current = false;
      setIsChromeVisible(false);
      chromeTimerRef.current = null;
    }, CHROME_HIDE_DELAY_MS);
  }, [clearChromeTimer]);

  const revealChrome = useCallback((): void => {
    if (isChromeVisibleRef.current) {
      scheduleChromeHide();
      return;
    }

    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    scheduleChromeHide();
  }, [scheduleChromeHide]);

  const toggleChrome = useCallback((): void => {
    setIsChromeVisible((current) => {
      const next = !current;
      isChromeVisibleRef.current = next;
      if (next) {
        scheduleChromeHide();
      } else {
        clearChromeTimer();
      }
      return next;
    });
  }, [clearChromeTimer, scheduleChromeHide]);

  const handlePointerMove = useCallback((): void => {
    if (!isCoarsePointerRef.current) {
      revealChrome();
    }
  }, [revealChrome]);

  const handleReaderClick = useCallback((): void => {
    if (isCoarsePointerRef.current) {
      toggleChrome();
    }
  }, [toggleChrome]);

  const handleChromePointerDown = useCallback((event: PointerEvent): void => {
    event.stopPropagation();
    revealChrome();
  }, [revealChrome]);

  useEffect(() => {
    return () => {
      clearChromeTimer();
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
    };
  }, [clearChromeTimer]);

  useEffect(() => {
    if (!reader.viewport) return;

    const zoomPct = Math.round(reader.effectiveZoom * 100);
    if (previousZoomPctRef.current === null) {
      previousZoomPctRef.current = zoomPct;
      return;
    }

    if (previousZoomPctRef.current === zoomPct) return;

    previousZoomPctRef.current = zoomPct;
    setZoomFeedback(`${zoomPct}%`);

    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
    }

    zoomTimerRef.current = setTimeout(() => {
      setZoomFeedback(null);
      zoomTimerRef.current = null;
    }, ZOOM_FEEDBACK_DELAY_MS);
  }, [reader.effectiveZoom, reader.viewport]);

  return (
    <div
      className={`reader-page ${isChromeVisible ? 'reader-page--chrome-visible' : ''}`}
      onPointerMove={handlePointerMove}
      onClick={handleReaderClick}
    >
      <div
        className="reader-page__top-chrome reader-page__chrome"
        onPointerDown={handleChromePointerDown}
        onClick={(event) => event.stopPropagation()}
      >
        <ReaderHeader
          title={book?.title}
          currentPage={reader.currentPage}
          totalPages={reader.totalPages}
          onPrevPage={reader.previousPage}
          onNextPage={reader.nextPage}
        />
      </div>

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

      <div
        className="reader-page__bottom-chrome reader-page__chrome"
        onPointerDown={handleChromePointerDown}
        onClick={(event) => event.stopPropagation()}
      >
        <ReaderToolbar
          zoom={reader.effectiveZoom}
          onZoomIn={reader.zoomIn}
          onZoomOut={reader.zoomOut}
          onResetZoom={reader.resetZoom}
          onFitWidth={reader.fitWidth}
          onFitPage={reader.fitPage}
        />
      </div>

      <div
        className={`reader-page__zoom-feedback ${zoomFeedback ? 'reader-page__zoom-feedback--visible' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {zoomFeedback}
      </div>
    </div>
  );
}
