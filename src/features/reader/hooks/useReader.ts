import type { RefObject } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { ScaleMode } from '../types';
import { useReaderNavigation } from './useReaderNavigation';
import { useReaderZoom } from './useReaderZoom';
import { useReaderViewport } from './useReaderViewport';
import { useReaderKeyboard } from './useReaderKeyboard';

// ─── Public interface ─────────────────────────────────────────────────────────

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
 *
 * The public API (UseReaderResult) is unchanged from the monolithic version.
 * Callers and tests are unaffected by this internal restructuring.
 *
 * @param pdfDocument  - The loaded PDF document, or null while loading.
 * @param containerRef - Ref to the scroll container used for fit measurements.
 */
export function useReader(
  pdfDocument: PDFDocumentProxy | null,
  containerRef: RefObject<HTMLDivElement | null>,
): UseReaderResult {
  const totalPages = pdfDocument?.numPages ?? 0;

  const nav = useReaderNavigation(pdfDocument);
  const zoom = useReaderZoom();
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
  };
}