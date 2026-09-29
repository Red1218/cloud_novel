import { useState, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { ScaleMode } from '../types';
import { calculateScale } from '../utils/calculateScale';

export interface UseReaderViewportResult {
  page:          PDFPageProxy | null;
  viewport:      PageViewport | null;
  effectiveZoom: number;
}

/**
 * Manages PDF page loading and viewport derivation.
 *
 * Responsibilities:
 *  - Loads the PDFPageProxy for the current page (async, request-ID pattern
 *    prevents stale results from landing during rapid navigation).
 *  - Derives the PageViewport via useMemo (not stored in state).
 *  - Handles window resize for fit modes by bumping a reactive version counter.
 *  - Deduplicates viewport object creation when resize produces the same scale,
 *    preventing unnecessary canvas re-renders.
 */
export function useReaderViewport(
  pdfDocument:  PDFDocumentProxy | null,
  currentPage:  number,
  zoom:         number,
  scaleMode:    ScaleMode,
  containerRef: RefObject<HTMLDivElement | null>,
): UseReaderViewportResult {
  // page is genuine async state — must be stored.
  const [page, setPage] = useState<PDFPageProxy | null>(null);

  // Reactive trigger for resize events; containerRef.current is not reactive
  // so bumping this counter causes the useMemo to re-read container dimensions.
  const [containerVersion, setContainerVersion] = useState(0);

  // Identifies the most-recent page load request.
  // A response whose ID no longer matches requestIdRef.current is stale and discarded.
  const requestIdRef = useRef(0);

  // The last viewport created, and the page it belongs to, so a resize that
  // produces the identical scale can reuse it instead of creating a new one.
  const lastRef = useRef<{ page: PDFPageProxy; viewport: PageViewport } | null>(null);

  // ── Page loading ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfDocument || currentPage < 1) {
      setPage(null);
      return;
    }

    // Capture a snapshot of the request ID before the async call.
    requestIdRef.current += 1;
    const thisRequest = requestIdRef.current;

    pdfDocument.getPage(currentPage).then(p => {
      if (thisRequest !== requestIdRef.current) return; // stale — discard
      setPage(p);
    }).catch((err: unknown) => {
      if (thisRequest !== requestIdRef.current) return; // stale — discard
      console.error('[useReaderViewport] Failed to load page:', err);
    });

    return () => {
      // Invalidate this request when deps change or the component unmounts.
      requestIdRef.current += 1;
    };
  }, [pdfDocument, currentPage]);

  // ── Resize handling ──────────────────────────────────────────────────────

  // Custom zoom is deliberately preserved across resize events.
  // Only fit-width and fit-page modes need to recalculate on resize.
  //
  // A ResizeObserver on the container (rather than a window listener) also
  // catches sidebar-width and orientation changes. It only fires when the
  // element's size actually changes; notifications are debounced so a
  // drag-resize recalculates once, 100ms after it settles.
  useEffect(() => {
    if (scaleMode === 'custom') return;

    // If the ref is not yet attached (rare but possible during fast
    // unmount/remount), exit cleanly — no polling, no retry.
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setContainerVersion(v => v + 1), 100);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [scaleMode, containerRef]);

  // ── Viewport (derived data, not state) ───────────────────────────────────

  // viewport is computed inline during render from page + zoom + scaleMode
  // + container dimensions. It is NOT stored in useState.
  // containerVersion acts as the reactive hook for resize-driven recalculation.
  const viewport = useMemo<PageViewport | null>(() => {
    if (!page || !containerRef.current) {
      lastRef.current = null;
      return null;
    }

    const scale = calculateScale(page, containerRef.current, zoom, scaleMode);

    // Return the same PageViewport object when the page AND scale are both
    // unchanged (e.g. a height-only resize in fit-width mode). This prevents
    // usePdfRenderer from redrawing the canvas for an identical result.
    const last = lastRef.current;
    if (last?.page === page && Math.abs(scale - last.viewport.scale) < 1e-6) {
      return last.viewport;
    }

    const vp = page.getViewport({ scale });
    lastRef.current = { page, viewport: vp };
    return vp;
  }, [page, zoom, scaleMode, containerVersion, containerRef]);

  return {
    page,
    viewport,
    effectiveZoom: viewport?.scale ?? zoom,
  };
}
