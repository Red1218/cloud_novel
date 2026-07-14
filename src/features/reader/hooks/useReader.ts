import { useCallback, type RefObject } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { ScaleMode } from '../types';
import { useReaderNavigation } from './useReaderNavigation';
import { useReaderZoom } from './useReaderZoom';
import { useReaderViewport } from './useReaderViewport';
import { useReaderKeyboard } from './useReaderKeyboard';
import { useReadingState } from './useReadingState';

// ─── Public interface ─────────────────────────────────────────────────────────

export interface UseReaderOptions {
  /** Initial page from persisted state. */
  initialPage?: number;
  /** Initial zoom from persisted state. */
  initialZoom?: number;
  /** Initial scale mode from persisted state. */
  initialScaleMode?: ScaleMode;
}

export interface UseReaderResult {
  // State
  readonly currentPage: number;
  readonly totalPages: number;
  readonly zoom: number;
  readonly scaleMode: ScaleMode;
  readonly page: PDFPageProxy | null;
  readonly viewport: PageViewport | null;
  /** The scale actually being rendered. Equals viewport.scale when set, else zoom. */
  readonly effectiveZoom: number;

  // Navigation
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly goToPage: (targetPage: number) => void;

  // Zoom
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly resetZoom: () => void;
  readonly fitWidth: () => void;
  readonly fitPage: () => void;

  // Persistence control
  /** Immediately persist lastOpened timestamp. Call when book is opened. */
  readonly touchLastOpened: () => Promise<void>;
  /** Flush any pending persistence updates immediately. */
  readonly flushPersistence: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Composes all Reader behaviour into a single public API.
 *
 * Delegates to focused sub-hooks:
 *  useReaderNavigation  currentPage, page navigation, document reset
 *  useReaderZoom        zoom level, scaleMode, zoom actions
 *  useReaderViewport    page loading, viewport derivation, resize handling
 *  useReaderKeyboard    global keyboard shortcuts
 *  useReadingState      persistence of reading state to IndexedDB
 *
 * The public API (UseReaderResult) is unchanged from the monolithic version.
 * Callers and tests are unaffected by this internal restructuring.
 *
 * @param pdfDocument  - The loaded PDF document, or null while loading.
 * @param containerRef - Ref to the scroll container used for fit measurements.
 * @param bookId       - The UUID of the book for persistence. If undefined, persistence is disabled.
 * @param options      - Optional configuration including initial persisted state.
 */
export function useReader(
  pdfDocument: PDFDocumentProxy | null,
  containerRef: RefObject<HTMLDivElement | null>,
  bookId: string | undefined,
  options: UseReaderOptions = {},
): UseReaderResult {
  const { initialPage = 1, initialZoom, initialScaleMode } = options;
  const totalPages = pdfDocument?.numPages ?? 0;

  // Persistence hook — owns all IndexedDB interactions for reading state
  // Destructure callbacks for stable dependencies
  const {
    queueUpdate,
    flush,
    touchLastOpened,
  } = useReadingState(bookId);

  // Wrap queueUpdate for specific fields to match expected callback signatures
  const handlePageChange = useCallback((page: number): void => {
    queueUpdate({ currentPage: page });
  }, [queueUpdate]);

  const handleZoomChange = useCallback((zoom: number): void => {
    queueUpdate({ zoom });
  }, [queueUpdate]);

  const handleScaleModeChange = useCallback((scaleMode: ScaleMode): void => {
    queueUpdate({ scaleMode });
  }, [queueUpdate]);

  // Navigation with persistence callbacks
  const nav = useReaderNavigation(pdfDocument, {
    initialPage,
    onPageChange: handlePageChange,
  });

  // Zoom with persistence callbacks
  const zoom = useReaderZoom({
    initialZoom,
    initialScaleMode,
    onZoomChange: handleZoomChange,
    onScaleModeChange: handleScaleModeChange,
  });

  const vp = useReaderViewport(
    pdfDocument,
    nav.currentPage,
    zoom.zoom,
    zoom.scaleMode,
    containerRef,
  );

  useReaderKeyboard({
    previousPage: nav.previousPage,
    nextPage: nav.nextPage,
    zoomIn: zoom.zoomIn,
    zoomOut: zoom.zoomOut,
    resetZoom: zoom.resetZoom,
  });

  return {
    currentPage: nav.currentPage,
    totalPages,
    zoom: zoom.zoom,
    scaleMode: zoom.scaleMode,
    page: vp.page,
    viewport: vp.viewport,
    effectiveZoom: vp.effectiveZoom,
    nextPage: nav.nextPage,
    previousPage: nav.previousPage,
    goToPage: nav.goToPage,
    zoomIn: zoom.zoomIn,
    zoomOut: zoom.zoomOut,
    resetZoom: zoom.resetZoom,
    fitWidth: zoom.fitWidth,
    fitPage: zoom.fitPage,
    touchLastOpened,
    flushPersistence: flush,
  };
}
