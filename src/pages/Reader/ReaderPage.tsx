import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { TextLayer } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { BookmarkPanel } from '@/features/reader/bookmarks/components/BookmarkPanel/BookmarkPanel';
import { ReaderHeader } from '@/features/reader/components/ReaderHeader/ReaderHeader';
import { ReaderToolbar } from '@/features/reader/components/ReaderToolbar/ReaderToolbar';
import { ReadingEnvironmentPanel } from '@/features/reader/components/ReadingEnvironmentPanel/ReadingEnvironmentPanel';
import { LoadingState } from '@/features/reader/components/LoadingState/LoadingState';
import { ErrorState } from '@/features/reader/components/ErrorState/ErrorState';
import { ReaderViewport } from '@/features/reader/components/ReaderViewport/ReaderViewport';
import { SearchBar } from '@/features/reader/search/components/SearchBar/SearchBar';
import { SearchResultsPanel } from '@/features/reader/search/components/SearchResultsPanel/SearchResultsPanel';
import { usePdfDocument } from '@/features/reader/hooks/usePdfDocument';
import { usePdfRenderer } from '@/features/reader/hooks/usePdfRenderer';
import { usePdfTextLayer } from '@/features/reader/hooks/usePdfTextLayer';
import { useReader } from '@/features/reader/hooks/useReader';
import { usePageTurn } from '@/features/reader/hooks/usePageTurn';
import { useNeighbourPages } from '@/features/reader/hooks/useNeighbourPages';
import { useReaderKeyboard } from '@/features/reader/hooks/useReaderKeyboard';
import { useReaderBookmarks } from '@/features/reader/bookmarks/hooks/useReaderBookmarks';
import { useReaderEnvironment } from '@/features/reader/hooks/useReaderEnvironment';
import { useReaderSearch } from '@/features/reader/search/hooks/useReaderSearch';
import { BookRepository } from '@/repositories/BookRepository';
import { type TextLayerHighlight } from '@/features/reader/search/types';
import './ReaderPage.css';

const CHROME_HIDE_DELAY_MS = 10_000;
const ZOOM_FEEDBACK_DELAY_MS = 1_000;
const CLICK_TOGGLE_DRAG_THRESHOLD_PX = 6;

type Panel = 'environment' | 'bookmarks' | 'results';

interface ReaderSheetProps {
  /** Id of the panel heading that names the dialog. */
  labelledBy: string;
  onClose: () => void;
  onPointerDown: (event: PointerEvent) => void;
  children: ReactNode;
}

/**
 * Shows a reader panel as a modal <dialog>. The browser closes it on Escape;
 * a click on the transparent area around the panel closes it too.
 */
function ReaderSheet({ labelledBy, onClose, onPointerDown, children }: ReaderSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="reader-page__sheet"
      aria-labelledby={labelledBy}
      // Escape fires `cancel` at once; `close` waits for the next frame.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

/**
 * Reader page - composition and orchestration only.
 *
 * ReaderViewport remains the PDF layer. Header, toolbar, and zoom feedback
 * are temporary reader chrome layered around it.
 */
export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  // ?page=N (from a bookmark on Home) opens at that page once; the saved
  // page only changes when the reader moves on from there.
  const [searchParams, setSearchParams] = useSearchParams();
  const [startPage] = useState(() => Number(searchParams.get('page')) || undefined);
  useEffect(() => {
    if (searchParams.has('page')) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<HTMLCanvasElement>(null);
  const nextPageRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chromeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousZoomPctRef = useRef<number | null>(null);
  const clickStartRef = useRef<{ x: number; y: number } | null>(null);
  const isChromeVisibleRef = useRef(true);
  // True while the controls are showing only because the mouse moved over
  // the page. The click that usually follows should keep them, not hide them.
  const revealedByHoverRef = useRef(false);
  const isCoarsePointerRef = useRef(
    window.matchMedia('(hover: none), (pointer: coarse)').matches,
  );

  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [zoomFeedback, setZoomFeedback] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Controls stay visible while a panel or the search bar is open.
  const isChromePinned = panel !== null || isSearchOpen;

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);
  const readerEnvironment = useReaderEnvironment(bookId);
  const readerBookmarks = useReaderBookmarks(bookId ?? '');
  const { showToast } = useToast();

  // The book's own zoom as changed in Aa this visit: null once cleared.
  const [changedZoom, setChangedZoom] = useState<number | null>();
  const openZoom = changedZoom === undefined ? book?.openZoom : changedZoom ?? undefined;
  const reader = useReader(pdfDocument, containerRef, bookId, {
    initialPage: startPage ?? book?.currentPage ?? 1,
    // A book opens at its own zoom, or with the whole page fitted; + and − are for the visit.
    initialScaleMode: book?.openZoom ? 'custom' : 'fit-page',
    initialZoom: book?.openZoom,
  });
  const { touchLastOpened } = reader;
  const { turnNext, turnPrevious } = usePageTurn({
    containerRef,
    trackRef,
    canvasRef,
    prevRef: prevPageRef,
    nextRef: nextPageRef,
    currentPage: reader.currentPage,
    totalPages: reader.totalPages,
    page: reader.page,
    nextPage: reader.nextPage,
    previousPage: reader.previousPage,
    // At the book's own zoom the page rests centred: it opens and lands there,
    // and a swipe from there turns the page.
    centred: openZoom !== undefined && reader.scaleMode === 'custom' && Math.abs(reader.zoom - openZoom) < 0.005,
  });
  useNeighbourPages(pdfDocument, reader.currentPage, reader.viewport?.scale, prevPageRef, nextPageRef);
  useReaderKeyboard({
    previousPage: turnPrevious,
    nextPage: turnNext,
    zoomIn: reader.zoomIn,
    zoomOut: reader.zoomOut,
    resetZoom: reader.resetZoom,
  });
  const loadedBookId = book?.id;
  const search = useReaderSearch(pdfDocument, reader.currentPage);

  useEffect(() => {
    if (loadedBookId) {
      void touchLastOpened();
    }
  }, [loadedBookId, touchLastOpened]);

  const textContent = usePdfTextLayer(reader.page);

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
    if (!readerEnvironment.settings.autoHideControls || isChromePinned) {
      clearChromeTimer();
      return;
    }

    clearChromeTimer();
    chromeTimerRef.current = setTimeout(() => {
      revealedByHoverRef.current = false;
      isChromeVisibleRef.current = false;
      setIsChromeVisible(false);
      chromeTimerRef.current = null;
    }, CHROME_HIDE_DELAY_MS);
  }, [
    clearChromeTimer,
    isChromePinned,
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
    revealedByHoverRef.current = false;
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
      if (!isChromeVisibleRef.current) {
        revealedByHoverRef.current = true;
      }
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

    if (revealedByHoverRef.current) {
      // Moving the mouse to click already showed the controls; keep them
      // shown rather than toggling them straight back off.
      revealedByHoverRef.current = false;
      scheduleChromeHide();
      return;
    }

    toggleChrome();
  }, [scheduleChromeHide, toggleChrome]);

  const handleChromePointerDown = useCallback((event: PointerEvent): void => {
    event.stopPropagation();
    revealedByHoverRef.current = false;
    revealChrome();
  }, [revealChrome]);

  useEffect(() => {
    if (!loadedBookId) return;

    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    scheduleChromeHide();
  }, [loadedBookId, scheduleChromeHide]);

  const openPanel = useCallback((next: Panel): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    setPanel(next);
  }, [clearChromeTimer]);

  const closePanel = useCallback((): void => setPanel(null), []);

  const openSearch = useCallback((): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    // An open panel is modal, so close it before focusing the field.
    setPanel(null);
    setIsSearchOpen(true);
    // Already open: bring focus back to the field (it autofocuses on mount).
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, [clearChromeTimer]);

  const closeSearch = useCallback((): void => {
    setIsSearchOpen(false);
    setPanel(current => (current === 'results' ? null : current));
  }, []);

  const { selectMatch } = search;
  const handleSelectSearchResult = useCallback((index: number): void => {
    selectMatch(index);
    setPanel(null);
  }, [selectMatch]);

  const { toggleBookmark, removeBookmark, renameBookmark } = readerBookmarks;
  const { currentPage, goToPage } = reader;

  const reportBookmarkError = useCallback((err: unknown): void => {
    console.error('Bookmark update failed:', err);
    showToast({ type: 'error', title: "Couldn't save the bookmark", message: 'Try again.' });
  }, [showToast]);

  const handleToggleBookmark = useCallback((): void => {
    toggleBookmark(currentPage)
      .then((added) => {
        if (!added) return;
        showToast({
          type: 'info',
          icon: 'bookmark',
          title: 'Bookmark added',
          // Page first, so a long title never hides the number
          message: book?.title ? `Page ${added.page}, ${book.title}` : `Page ${added.page}`,
          action: { label: 'Undo', onPress: () => void removeBookmark(added.id).catch(reportBookmarkError) },
        });
      })
      .catch(reportBookmarkError);
  }, [book?.title, currentPage, removeBookmark, reportBookmarkError, showToast, toggleBookmark]);

  // The toast sits 16px above the bottom bar, or 24px from the edge while the bars are hidden.
  useEffect(() => {
    const root = document.documentElement.style;
    const bar = document.querySelector<HTMLElement>('.reader-page__bottom-chrome');
    const place = () => root.setProperty('--toast-bottom', isChromeVisible && bar ? `${bar.offsetHeight + 16}px` : '24px');
    place();
    // The bar grows once the book loads (page count, scrubber), so follow its size.
    const observer = bar ? new ResizeObserver(place) : undefined;
    if (bar) observer?.observe(bar);
    return () => {
      observer?.disconnect();
      root.removeProperty('--toast-bottom');
    };
  }, [isChromeVisible]);

  const handleRemoveBookmark = useCallback((bookmarkId: string): void => {
    removeBookmark(bookmarkId).catch(reportBookmarkError);
  }, [removeBookmark, reportBookmarkError]);

  const handleRenameBookmark = useCallback((bookmarkId: string, label: string): void => {
    renameBookmark(bookmarkId, label).catch(reportBookmarkError);
  }, [renameBookmark, reportBookmarkError]);

  const handleSelectBookmark = useCallback((page: number): void => {
    goToPage(page);
    setPanel(null);
  }, [goToPage]);

  // Move to the current search match's page when the match changes (only
  // then, so reopening search or reading on doesn't jump back).
  const goToPageRef = useRef(goToPage);
  useEffect(() => {
    goToPageRef.current = goToPage;
  }, [goToPage]);

  const { currentMatch, results: searchResults } = search;
  useEffect(() => {
    if (currentMatch) goToPageRef.current(currentMatch.pageNumber);
  }, [currentMatch]);

  const searchHighlights = useMemo((): TextLayerHighlight[] | undefined => {
    if (!isSearchOpen || !searchResults) return undefined;
    return searchResults.matches
      .filter(match => match.pageNumber === currentPage)
      .map(match => ({ ranges: match.ranges, selected: match.index === currentMatch?.index }));
  }, [currentMatch, currentPage, isSearchOpen, searchResults]);

  const saveOpenZoom = (zoom: number | null): void => {
    if (!bookId) return;
    setChangedZoom(zoom);
    void BookRepository.updateReadingState(bookId, { openZoom: zoom });
    if (zoom === null) reader.fitPage();
  };

  const handleAutoHideControlsChange = (autoHideControls: boolean): void => {
    readerEnvironment.updateSettings({ autoHideControls });

    if (!autoHideControls) {
      clearChromeTimer();
      return;
    }

    if (!isChromePinned && isChromeVisibleRef.current) {
      scheduleChromeHide();
    }
  };

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
      // Ctrl/Cmd+F searches the book: the browser's own find can't see PDF text.
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f') {
        if (!loadedBookId) return;
        event.preventDefault();
        openSearch();
        return;
      }
      // Open panels are dialogs and close themselves on Escape.
      if (event.key === 'Escape' && !panel && isSearchOpen) closeSearch();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSearch, isSearchOpen, loadedBookId, openSearch, panel]);

  useEffect(() => {
    if (
      !isChromePinned
      && isChromeVisibleRef.current
      && readerEnvironment.settings.autoHideControls
    ) {
      scheduleChromeHide();
    }
  }, [
    isChromePinned,
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
    // ponytail: themes are off for now, every book reads in Night; use readerEnvironment.settings.theme to bring them back
    <div
      className={`reader-page reader-page--theme-dark ${isChromeVisible ? 'reader-page--chrome-visible' : ''}`}
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
          totalPages={reader.totalPages}
          isBookmarked={readerBookmarks.isBookmarked(reader.currentPage)}
          onToggleBookmark={book ? handleToggleBookmark : undefined}
          onOpenBookmarks={book ? () => openPanel('bookmarks') : undefined}
          onOpenSearch={book ? openSearch : undefined}
        />
      </div>

      {isSearchOpen && (
        <div
          className="reader-page__search-chrome reader-page__chrome"
          onPointerDown={handleChromePointerDown}
          onClick={(event) => event.stopPropagation()}
        >
          <SearchBar
            query={search.query}
            onQueryChange={search.setQuery}
            status={search.status}
            progress={search.progress}
            matchCount={searchResults?.matches.length ?? 0}
            truncated={searchResults?.truncated ?? false}
            currentPosition={currentMatch ? currentMatch.index + 1 : 0}
            onNext={search.next}
            onPrevious={search.previous}
            onShowResults={() => openPanel('results')}
            onClose={closeSearch}
            inputRef={searchInputRef}
          />
        </div>
      )}

      <main className="reader-page__content">
        {isLoading && <LoadingState />}

        {error && !isLoading && <ErrorState message={error} />}

        <ReaderViewport
          page={reader.page}
          viewport={reader.viewport}
          textContent={textContent}
          highlights={searchHighlights}
          isLoading={isLoading}
          error={error}
          canvasRef={canvasRef}
          containerRef={containerRef}
          fitScreen={reader.scaleMode === 'fit-page'}
          trackRef={trackRef}
          prevRef={prevPageRef}
          nextRef={nextPageRef}
        />
      </main>

      <div
        className="reader-page__bottom-chrome reader-page__chrome"
        onPointerDown={handleChromePointerDown}
        onClick={(event) => event.stopPropagation()}
      >
        <ReaderToolbar
          currentPage={reader.currentPage}
          totalPages={reader.totalPages}
          onPrevPage={turnPrevious}
          onNextPage={turnNext}
          onGoToPage={reader.goToPage}
          zoom={reader.effectiveZoom}
          onZoomIn={reader.zoomIn}
          onZoomOut={reader.zoomOut}
          onResetZoom={reader.resetZoom}
          onOpenReadingEnvironment={() => openPanel('environment')}
        />
      </div>

      {panel === 'environment' && (
        <ReaderSheet
          labelledBy="reading-environment-title"
          onClose={closePanel}
          onPointerDown={handleChromePointerDown}
        >
          <ReadingEnvironmentPanel
            settings={readerEnvironment.settings}
            openZoom={openZoom}
            zoom={reader.effectiveZoom}
            zoomed={reader.scaleMode === 'custom'}
            onZoomChange={reader.setZoomLevel}
            onBrightnessChange={(brightness) => readerEnvironment.updateSettings({ brightness })}
            onSaveZoom={() => saveOpenZoom(reader.zoom)}
            onClearZoom={() => saveOpenZoom(null)}
            onAutoHideControlsChange={handleAutoHideControlsChange}
            onReset={readerEnvironment.resetSettings}
            onClose={closePanel}
          />
        </ReaderSheet>
      )}

      {panel === 'bookmarks' && (
        <ReaderSheet
          labelledBy="bookmark-panel-title"
          onClose={closePanel}
          onPointerDown={handleChromePointerDown}
        >
          <BookmarkPanel
            bookmarks={readerBookmarks.bookmarks}
            currentPage={reader.currentPage}
            onSelect={handleSelectBookmark}
            onRemove={handleRemoveBookmark}
            onRename={handleRenameBookmark}
            onClose={closePanel}
          />
        </ReaderSheet>
      )}

      {panel === 'results' && searchResults && (
        <ReaderSheet
          labelledBy="search-results-title"
          onClose={closePanel}
          onPointerDown={handleChromePointerDown}
        >
          <SearchResultsPanel
            matches={searchResults.matches}
            truncated={searchResults.truncated}
            currentIndex={currentMatch?.index ?? -1}
            onSelect={handleSelectSearchResult}
            onClose={closePanel}
          />
        </ReaderSheet>
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
