import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useParams } from 'react-router-dom';
import { TextLayer } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { useDocumentTitle, useToast } from '@/hooks';
import {
  BookmarkPanel,
  ReaderHeader,
  ReaderToolbar,
  ReadingEnvironmentPanel,
  LoadingState,
  ErrorState,
  ReaderViewport,
  SearchBar,
  SearchResultsPanel,
  usePdfDocument,
  usePdfRenderer,
  usePdfTextLayer,
  useReader,
  useReaderBookmarks,
  useReaderEnvironment,
  useReaderSearch,
  type ReaderOpeningMode,
  type ReaderTheme,
  type ReadingPreset,
  type TextLayerHighlight,
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
  // True while the controls are showing only because the mouse moved over
  // the page. The click that usually follows should keep them, not hide them.
  const revealedByHoverRef = useRef(false);
  const isCoarsePointerRef = useRef(
    window.matchMedia('(hover: none), (pointer: coarse)').matches,
  );

  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [isEnvironmentOpen, setIsEnvironmentOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [zoomFeedback, setZoomFeedback] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Controls stay visible while a panel or the search bar is open.
  const isChromePinned = isEnvironmentOpen || isBookmarksOpen || isSearchResultsOpen || isSearchOpen;

  const { pdfDocument, book, isLoading, error } = usePdfDocument(bookId);
  const readerEnvironment = useReaderEnvironment(bookId);
  const readerBookmarks = useReaderBookmarks(bookId ?? '');
  const { showToast } = useToast();

  const reader = useReader(pdfDocument, containerRef, bookId, {
    initialPage: book?.currentPage ?? 1,
    initialZoom: book?.zoom,
    initialScaleMode: book?.scaleMode,
  });
  const { touchLastOpened } = reader;
  const loadedBookId = book?.id;
  const search = useReaderSearch(pdfDocument, reader.currentPage);

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

  const openReadingEnvironment = useCallback((): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    setIsBookmarksOpen(false);
    setIsSearchResultsOpen(false);
    setIsEnvironmentOpen(true);
  }, [clearChromeTimer]);

  const closeReadingEnvironment = useCallback((): void => {
    setIsEnvironmentOpen(false);
    if (readerEnvironment.settings.autoHideControls) {
      scheduleChromeHide();
    }
  }, [readerEnvironment.settings.autoHideControls, scheduleChromeHide]);

  const openBookmarks = useCallback((): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    setIsEnvironmentOpen(false);
    setIsSearchResultsOpen(false);
    setIsBookmarksOpen(true);
  }, [clearChromeTimer]);

  const closeBookmarks = useCallback((): void => {
    setIsBookmarksOpen(false);
  }, []);

  const openSearch = useCallback((): void => {
    clearChromeTimer();
    isChromeVisibleRef.current = true;
    setIsChromeVisible(true);
    setIsSearchOpen(true);
    // Already open: bring focus back to the field (it autofocuses on mount).
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, [clearChromeTimer]);

  const closeSearch = useCallback((): void => {
    setIsSearchOpen(false);
    setIsSearchResultsOpen(false);
  }, []);

  const openSearchResults = useCallback((): void => {
    setIsEnvironmentOpen(false);
    setIsBookmarksOpen(false);
    setIsSearchResultsOpen(true);
  }, []);

  const closeSearchResults = useCallback((): void => {
    setIsSearchResultsOpen(false);
  }, []);

  const { selectMatch } = search;
  const handleSelectSearchResult = useCallback((index: number): void => {
    selectMatch(index);
    setIsSearchResultsOpen(false);
  }, [selectMatch]);

  const { toggleBookmark, removeBookmark, renameBookmark } = readerBookmarks;
  const { currentPage, goToPage } = reader;

  const reportBookmarkError = useCallback((err: unknown): void => {
    console.error('Bookmark update failed:', err);
    showToast({ type: 'error', title: 'Bookmark Error', message: 'Could not update bookmarks.' });
  }, [showToast]);

  const handleToggleBookmark = useCallback((): void => {
    toggleBookmark(currentPage).catch(reportBookmarkError);
  }, [currentPage, reportBookmarkError, toggleBookmark]);

  const handleRemoveBookmark = useCallback((bookmarkId: string): void => {
    removeBookmark(bookmarkId).catch(reportBookmarkError);
  }, [removeBookmark, reportBookmarkError]);

  const handleRenameBookmark = useCallback((bookmarkId: string, label: string): void => {
    renameBookmark(bookmarkId, label).catch(reportBookmarkError);
  }, [renameBookmark, reportBookmarkError]);

  const handleSelectBookmark = useCallback((page: number): void => {
    goToPage(page);
    setIsBookmarksOpen(false);
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

    if (!isChromePinned && isChromeVisibleRef.current) {
      scheduleChromeHide();
    }
  }, [clearChromeTimer, isChromePinned, readerEnvironment, scheduleChromeHide]);

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
      if (event.key !== 'Escape') return;
      if (isEnvironmentOpen) closeReadingEnvironment();
      if (isBookmarksOpen) closeBookmarks();
      if (isSearchResultsOpen) closeSearchResults();
      else if (isSearchOpen && !isEnvironmentOpen && !isBookmarksOpen) closeSearch();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    closeBookmarks,
    closeReadingEnvironment,
    closeSearch,
    closeSearchResults,
    isBookmarksOpen,
    isEnvironmentOpen,
    isSearchOpen,
    isSearchResultsOpen,
    loadedBookId,
    openSearch,
  ]);

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
          isBookmarked={readerBookmarks.isBookmarked(reader.currentPage)}
          onToggleBookmark={book ? handleToggleBookmark : undefined}
          onOpenBookmarks={book ? openBookmarks : undefined}
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
            onShowResults={openSearchResults}
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

      {isBookmarksOpen && (
        <>
          <button
            type="button"
            className="reader-page__environment-scrim"
            onClick={closeBookmarks}
            aria-label="Close bookmarks"
          />
          <div
            className="reader-page__environment-panel"
            onPointerDown={handleChromePointerDown}
            onClick={(event) => event.stopPropagation()}
          >
            <BookmarkPanel
              bookmarks={readerBookmarks.bookmarks}
              currentPage={reader.currentPage}
              onSelect={handleSelectBookmark}
              onRemove={handleRemoveBookmark}
              onRename={handleRenameBookmark}
              onClose={closeBookmarks}
            />
          </div>
        </>
      )}

      {isSearchResultsOpen && searchResults && (
        <>
          <button
            type="button"
            className="reader-page__environment-scrim"
            onClick={closeSearchResults}
            aria-label="Close matches"
          />
          <div
            className="reader-page__environment-panel"
            onPointerDown={handleChromePointerDown}
            onClick={(event) => event.stopPropagation()}
          >
            <SearchResultsPanel
              matches={searchResults.matches}
              truncated={searchResults.truncated}
              currentIndex={currentMatch?.index ?? -1}
              onSelect={handleSelectSearchResult}
              onClose={closeSearchResults}
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
