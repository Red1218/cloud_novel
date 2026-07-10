import { useEffect, useRef } from 'react';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist';
import type { TextContent } from '../../services/textLayerService';
import './PdfTextLayer.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PdfTextLayerProps {
  /** The current page — passed explicitly so the component reacts to page
   *  identity changes without comparing textContent object references. */
  page:        PDFPageProxy | null;
  /** Text content fetched by usePdfTextLayer for the current page. */
  textContent: TextContent | null;
  /** The viewport shared with the canvas — never recalculated independently. */
  viewport:    PageViewport | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Rendering component for the PDF.js text layer.
 *
 * Responsibilities:
 *  - Own the TextLayer class lifecycle (create, render, update, cancel).
 *  - React to page identity changes by cancelling the old TextLayer and
 *    creating a fresh one (previous layer cancelled, container cleared
 *    with explicit removeChild — never innerHTML = "").
 *  - React to viewport-only changes (zoom / resize) by calling
 *    TextLayer.update() — no DOM teardown, no new text fetch.
 *  - Clean up fully on unmount: cancel the active TextLayer and reset
 *    ALL tracking refs so the component is left in a completely clean state.
 *
 * render() is called as a fire-and-forget with `void` — the promise is
 * not awaited because React effects cannot safely await and the
 * RenderingCancelledException that fires on rapid navigation is handled
 * in the catch handler.
 *
 * Does NOT:
 *  - Fetch text content (that belongs to usePdfTextLayer).
 *  - Calculate scale or viewport (both flow in as props from useReader).
 *  - Know about navigation, zoom actions, or document loading.
 *
 * The container div uses the official PDF.js className "textLayer" so that
 * PdfTextLayer.css applies the correct selection, span positioning, and
 * visibility rules from the pdfjs-dist stylesheet.
 */
export function PdfTextLayer({ page, textContent, viewport }: PdfTextLayerProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const textLayerRef  = useRef<TextLayer | null>(null);
  const renderedPageRef = useRef<PDFPageProxy | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !page || !textContent || !viewport) {
      // Nothing to render — cancel any existing layer and bail.
      if (textLayerRef.current) {
        textLayerRef.current.cancel();
        textLayerRef.current = null;
        renderedPageRef.current = null;
      }
      return;
    }

    const pageChanged = renderedPageRef.current !== page;

    if (pageChanged) {
      // ── New page: cancel existing layer, clear container, create fresh one ──

      if (textLayerRef.current) {
        textLayerRef.current.cancel();
        textLayerRef.current = null;
      }

      // Remove all child nodes explicitly — do not use innerHTML = "".
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      renderedPageRef.current = page;

      const layer = new TextLayer({
        textContentSource: textContent,
        container,
        viewport,
      });

      textLayerRef.current = layer;

      // Fire-and-forget: void suppresses the floating-promise lint warning.
      // RenderingCancelledException is expected during rapid page navigation
      // and is silently ignored. All other errors are logged.
      void layer.render().catch((err: unknown) => {
        if (err instanceof Error && err.name === 'RenderingCancelledException') {
          return;
        }
        console.error('[PdfTextLayer] Failed to render text layer:', err);
      });

    } else {
      // ── Same page, viewport changed (zoom / resize): update positioning ──
      textLayerRef.current?.update({ viewport });
    }
  }, [page, textContent, viewport]);

  // Full cleanup on unmount.
  // Reset every internal tracking ref so the component is left in a
  // completely clean state and holds no references to PDF objects.
  useEffect(() => {
    return () => {
      if (textLayerRef.current) {
        textLayerRef.current.cancel();
        textLayerRef.current = null;
      }
      renderedPageRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="textLayer" />;
}
