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

  // Track the previous page, scale, and viewport to avoid creating a new
  // PageViewport object when a resize event produces the identical scale.
  const prevPageRef     = useRef<PDFPageProxy | null>(null);
  const prevScaleRef    = useRef<number | null>(null);
  const prevViewportRef = useRef<PageViewport | null>(null);

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
  // A ResizeObserver on containerRef.current is used instead of a window
  // listener so that sidebar-width changes and orientation changes are all
  // captured through a single, precise observer on the exact element whose
  // clientWidth/clientHeight calculateScale() reads.
  //
  // Dimension cache (plain refs, not state) — avoids scheduling rAF + debounce
  // when the observer fires but both dimensions are unchanged (e.g. a vertical-
  // only resize while in fit-width mode, or a spurious browser notification).
  // The cache lives entirely inside this effect and has no public API surface.
  const cachedWidthRef  = useRef<number>(-1);
  const cachedHeightRef = useRef<number>(-1);

  useEffect(() => {
    if (scaleMode === 'custom') return;

    // Snapshot the element at effect-run time.
    // If the ref is not yet attached (rare but possible during fast
    // unmount/remount), exit cleanly — no polling, no retry.
    const el = containerRef.current;
    if (!el) return;

    // Reset the dimension cache whenever the effect re-runs (scaleMode changed).
    cachedWidthRef.current  = -1;
    cachedHeightRef.current = -1;

    let rafId:     ReturnType<typeof requestAnimationFrame> | null      = null;
    let timeoutId: ReturnType<typeof setTimeout>             | undefined = undefined;

    const observer = new ResizeObserver(() => {
      // Read dimensions synchronously inside the callback is safe here because
      // we are only reading, not writing, layout properties.
      const w = el.clientWidth;
      const h = el.clientHeight;

      // Skip scheduling if neither dimension actually changed.
      if (w === cachedWidthRef.current && h === cachedHeightRef.current) return;

      // Accept the new dimensions before scheduling so that rapid successive
      // callbacks with the same size are also deduplicated.
      cachedWidthRef.current  = w;
      cachedHeightRef.current = h;

      // rAF defers the debounce scheduling out of the ResizeObserver
      // notification microtask, preventing synchronous forced layout.
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setContainerVersion(v => v + 1);
        }, 100);
      });
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [scaleMode, containerRef]);

  // ── Viewport (derived data, not state) ───────────────────────────────────

  // viewport is computed inline during render from page + zoom + scaleMode
  // + container dimensions. It is NOT stored in useState.
  // containerVersion acts as the reactive hook for resize-driven recalculation.
  const viewport = useMemo<PageViewport | null>(() => {
    if (!page || !containerRef.current) {
      prevPageRef.current     = null;
      prevScaleRef.current    = null;
      prevViewportRef.current = null;
      return null;
    }

    const scale = calculateScale(page, containerRef.current, zoom, scaleMode);

    // Return the same PageViewport object when the page AND scale are both
    // unchanged. This prevents usePdfRenderer from re-rendering when a resize
    // event fires but the container size (and thus scale) has not actually
    // changed — e.g. the user resized an unrelated panel, or the browser
    // triggered a spurious resize event.
    if (
      prevPageRef.current === page &&
      prevViewportRef.current !== null &&
      prevScaleRef.current !== null &&
      Math.abs(scale - prevScaleRef.current) < 1e-6
    ) {
      return prevViewportRef.current;
    }

    const vp = page.getViewport({ scale });
    prevPageRef.current     = page;
    prevScaleRef.current    = scale;
    prevViewportRef.current = vp;
    return vp;
  }, [page, zoom, scaleMode, containerVersion, containerRef]);

  return {
    page,
    viewport,
    effectiveZoom: viewport?.scale ?? zoom,
  };
}
