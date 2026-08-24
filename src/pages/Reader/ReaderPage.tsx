import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import { TextLayer } from 'pdfjs-dist';
import { useDocumentTitle } from '@/hooks';
import {
  ReaderHeader,
  ReaderToolbar,
  ReadingEnvironmentPanel,
  LoadingState,
  ErrorState,
  ReaderViewport,
  usePdfDocument,
  usePdfRenderer,
  usePdfTextLayer,
  useReader,
  useReaderEnvironment,
  type ReaderOpeningMode,
  type ReaderTheme,
  type ReadingPreset,
} from '@/features/reader';
import './ReaderPage.css';

const CHROME_HIDE_DELAY_MS = 10_000;
const ZOOM_FEEDBACK_DELAY_MS = 1_000;
const CLICK_TOGGLE_DRAG_THRESHOLD_PX = 6;

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
  const clickStartRef = useRef<{ x: number; y: number } | null>(null);
  const isChromeVisibleRef = useRef(true);
  const isCoarsePointerRef = useRef(
    window.matchMedia('(hover: none), (pointer: coarse)').matches,
  );

  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState(false);
  const [zoomFeedback, setZoomFeedback] = useState<string | null>(null);

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);
  const readerEnvironment = useReaderEnvironment(bookId);

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
    if (!readerEnvironment.settings.autoHideControls || isEnvironmentOpen) {
      clearChromeTimer();
      return;
    }

    clearChromeTimer();
    chromeTimerRef.current = setTimeout(() => {
      isChromeVisibleRef.current = false;
      setIsChromeVisible(false);
      chromeTimerRef.current = null;
    }, CHROME_HIDE_DELAY_MS);
  }, [
    clearChromeTimer,
    isEnvironmentOpen,
    readerEnvironment.settings.autoHideControls,
  ]);

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

  const handleReaderPointerDown = useCallback((event: PointerEvent): void => {
    clickStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handlePointerMove = useCallback((): void => {
    if (!isCoarsePointerRef.current) {
      revealChrome();
    }
  }, [revealChrome]);

  const handleReaderClick = useCallback((event: MouseEvent): void => {
    if (event.defaultPrevented) return;

    const target = event.target;
    if (
      target instanceof Element
      && target.closest('a, button, input, select, textarea, [role="button"]')
    ) {
      return;
    }

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
      return;
    }

    const clickStart = clickStartRef.current;
    clickStartRef.current = null;

    if (clickStart) {
      const deltaX = Math.abs(event.clientX - clickStart.x);
      const deltaY = Math.abs(event.clientY - clickStart.y);
      if (
        deltaX > CLICK_TOGGLE_DRAG_THRESHOLD_PX
        || deltaY > CLICK_TOGGLE_DRAG_THRESHOLD_PX
      ) {
        return;
      }
    }

    toggleChrome();
  }, [toggleChrome]);

  const handleChromePointerDown = useCallback((event: PointerEvent): void => {
    event.stopPropagation();
    revealChrome();
  }, [revealChrome]);

  useEffect(() => {
    if (!loadedBookId) return;

    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    scheduleChromeHide();
  }, [loadedBookId, scheduleChromeHide]);

  const openReadingEnvironment = useCallback((): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    setIsEnvironmentOpen(true);
  }, [clearChromeTimer]);

  const closeReadingEnvironment = useCallback((): void => {
    setIsEnvironmentOpen(false);
    if (readerEnvironment.settings.autoHideControls) {
      scheduleChromeHide();
    }
  }, [readerEnvironment.settings.autoHideControls, scheduleChromeHide]);

  const applyReadingPreset = useCallback((preset: ReadingPreset): void => {
    readerEnvironment.updateSettings({
      theme: preset.theme,
      brightness: preset.brightness,
    });

    if (preset.openingMode === 'fit-page') {
      reader.fitPage();
      return;
    }

    reader.fitWidth();
  }, [reader, readerEnvironment]);

  const handleThemeChange = useCallback((theme: ReaderTheme): void => {
    readerEnvironment.updateSettings({ theme });
  }, [readerEnvironment]);

  const handleBrightnessChange = useCallback((brightness: number): void => {
    readerEnvironment.updateSettings({ brightness });
  }, [readerEnvironment]);

  const handleOpeningModeChange = useCallback((openingMode: ReaderOpeningMode): void => {
    if (openingMode === 'fit-page') {
      reader.fitPage();
      return;
    }

    reader.fitWidth();
  }, [reader]);

  const handleAutoHideControlsChange = useCallback((autoHideControls: boolean): void => {
    readerEnvironment.updateSettings({ autoHideControls });

    if (!autoHideControls) {
      clearChromeTimer();
      return;
    }

    if (!isEnvironmentOpen && isChromeVisibleRef.current) {
      scheduleChromeHide();
    }
  }, [clearChromeTimer, isEnvironmentOpen, readerEnvironment, scheduleChromeHide]);

  const readerEnvironmentStyle = {
    '--reader-environment-dim-opacity': readerEnvironment.dimOpacity.toString(),
  } as CSSProperties;

  useEffect(() => {
    return () => {
      clearChromeTimer();
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
    };
  }, [clearChromeTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isEnvironmentOpen) {
        closeReadingEnvironment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeReadingEnvironment, isEnvironmentOpen]);

  useEffect(() => {
    if (
      !isEnvironmentOpen
      && isChromeVisibleRef.current
      && readerEnvironment.settings.autoHideControls
    ) {
      scheduleChromeHide();
    }
  }, [
    isEnvironmentOpen,
    readerEnvironment.settings.autoHideControls,
    scheduleChromeHide,
  ]);

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
      className={`reader-page reader-page--theme-${readerEnvironment.settings.theme} ${isChromeVisible ? 'reader-page--chrome-visible' : ''}`}
      style={readerEnvironmentStyle}
      onPointerDown={handleReaderPointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleReaderClick}
    >
      <div className="reader-page__environment-dim" aria-hidden="true" />

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
          onOpenReadingEnvironment={openReadingEnvironment}
        />
      </div>

      {isEnvironmentOpen && (
        <>
          <button
            type="button"
            className="reader-page__environment-scrim"
            onClick={closeReadingEnvironment}
            aria-label="Close reading environment"
          />
          <div
            className="reader-page__environment-panel"
            onPointerDown={handleChromePointerDown}
            onClick={(event) => event.stopPropagation()}
          >
            <ReadingEnvironmentPanel
              settings={readerEnvironment.settings}
              scaleMode={reader.scaleMode}
              onApplyPreset={applyReadingPreset}
              onThemeChange={handleThemeChange}
              onBrightnessChange={handleBrightnessChange}
              onOpeningModeChange={handleOpeningModeChange}
              onAutoHideControlsChange={handleAutoHideControlsChange}
              onReset={readerEnvironment.resetSettings}
              onClose={closeReadingEnvironment}
            />
          </div>
        </>
      )}

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
