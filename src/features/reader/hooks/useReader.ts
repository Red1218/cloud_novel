import { useRef, type RefObject } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ScaleMode } from '../types';
import { useReaderNavigation } from './useReaderNavigation';
import { useReaderZoom } from './useReaderZoom';
import { useReaderViewport } from './useReaderViewport';
import { useReadingState } from './useReadingState';

interface UseReaderOptions {
  /** Initial page from persisted state. */
  initialPage?: number;
  /** Initial zoom from persisted state. */
  initialZoom?: number;
  /** Initial scale mode from persisted state. */
  initialScaleMode?: ScaleMode;
}

/**
 * Composes all Reader behaviour into a single API.
 *
 * Delegates to focused sub-hooks:
 *  useReaderNavigation  currentPage, page navigation, document reset
 *  useReaderZoom        zoom level, scaleMode, zoom actions
 *  useReaderViewport    page loading, viewport derivation, resize handling
 *  useReadingState      persistence of reading state to IndexedDB
 *
 * @param pdfDocument  - The loaded PDF document, or null while loading.
 * @param containerRef - Ref to the scroll container used for fit measurements.
 * @param bookId       - The UUID of the book for persistence. If undefined, persistence is disabled.
 * @param options      - Initial persisted state.
 */
export function useReader(
  pdfDocument: PDFDocumentProxy | null,
  containerRef: RefObject<HTMLDivElement | null>,
  bookId: string | undefined,
  options: UseReaderOptions = {},
) {
  const { initialPage = 1, initialZoom, initialScaleMode } = options;
  const { queueUpdate, touchLastOpened } = useReadingState(bookId);

  const nav = useReaderNavigation(pdfDocument, initialPage, queueUpdate);

  // Kept current every render so zoomIn/zoomOut can start from the actual
  // rendered scale when leaving a fit mode.
  const effectiveZoomRef = useRef<number>(initialZoom ?? 1.0);

  const zoom = useReaderZoom({
    initialZoom,
    initialScaleMode,
    effectiveZoomRef,
  });

  const vp = useReaderViewport(
    pdfDocument,
    nav.currentPage,
    zoom.zoom,
    zoom.scaleMode,
    containerRef,
  );

  // Must happen after vp is computed, before any callbacks fire.
  effectiveZoomRef.current = vp.effectiveZoom;

  return {
    ...nav,
    ...zoom,
    ...vp,
    totalPages: pdfDocument?.numPages ?? 0,
    touchLastOpened,
  };
}
