import { useEffect, useRef, useState } from 'react';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextContent } from '../../services/textLayerService';
import { TextLayerHighlighter } from '../../search/services/textLayerHighlighter';
import type { TextLayerHighlight } from '../../search/types';
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
  /** Search matches on this page; the selected one is scrolled into view. */
  highlights?: TextLayerHighlight[];
}

const NO_HIGHLIGHTS: TextLayerHighlight[] = [];

/**
 * PDF.js 6 sizes the text layer and its spans with `--total-scale-factor`,
 * which its own viewer sets on each page. Without it the layer falls back
 * to a default size and drifts from the canvas (misplaced selection and
 * search highlights), so derive it from the viewport the canvas uses.
 */
function setTextLayerScale(container: HTMLElement, viewport: PageViewport): void {
  const { pageWidth } = viewport.rawDims as { pageWidth: number };
  const renderedWidth = viewport.rotation % 180 === 0 ? viewport.width : viewport.height;
  container.style.setProperty('--total-scale-factor', String(renderedWidth / pageWidth));
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
export function PdfTextLayer({ page, textContent, viewport, highlights = NO_HIGHLIGHTS }: PdfTextLayerProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const textLayerRef  = useRef<TextLayer | null>(null);
  const renderedPageRef = useRef<PDFPageProxy | null>(null);
  const highlighterRef = useRef<TextLayerHighlighter | null>(null);
  // Bumped when a text layer finishes rendering, so highlights are applied
  // to the new spans.
  const [renderedVersion, setRenderedVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !page || !textContent || !viewport) {
      // Nothing to render — cancel any existing layer and bail.
      if (textLayerRef.current) {
        textLayerRef.current.cancel();
        textLayerRef.current = null;
        renderedPageRef.current = null;
      }
      highlighterRef.current = null;
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
      setTextLayerScale(container, viewport);

      const layer = new TextLayer({
        textContentSource: textContent,
        container,
        viewport,
      });

      textLayerRef.current = layer;
      highlighterRef.current = null;

      // Fire-and-forget: void suppresses the floating-promise lint warning.
      // RenderingCancelledException is expected during rapid page navigation
      // and is silently ignored. All other errors are logged.
      void layer.render().then(() => {
        if (textLayerRef.current !== layer) return; // superseded
        highlighterRef.current = new TextLayerHighlighter(layer.textDivs, layer.textContentItemsStr);
        setRenderedVersion(v => v + 1);
      }).catch((err: unknown) => {
        if (err instanceof Error && err.name === 'RenderingCancelledException') {
          return;
        }
        console.error('[PdfTextLayer] Failed to render text layer:', err);
      });

    } else {
      // ── Same page, viewport changed (zoom / resize): update positioning ──
      setTextLayerScale(container, viewport);
      textLayerRef.current?.update({ viewport });
    }
  }, [page, textContent, viewport]);

  // Apply search highlights once the layer is rendered, and whenever they change.
  useEffect(() => {
    const highlighter = highlighterRef.current;
    if (!highlighter) return;
    const selected = highlighter.apply(highlights);
    selected?.scrollIntoView({ block: 'center', inline: 'center' });
  }, [highlights, renderedVersion]);

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
      highlighterRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="textLayer" />;
}
