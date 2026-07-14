import type { RefObject } from 'react';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { TextContent } from '../../services/textLayerService';
import { PdfCanvas }     from '../PdfCanvas/PdfCanvas';
import { PdfTextLayer }  from '../PdfTextLayer/PdfTextLayer';
import './ReaderViewport.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReaderViewportProps {
  /** The current PDF page — shared with PdfCanvas and PdfTextLayer. */
  page:         PDFPageProxy | null;
  /** The computed viewport — shared with PdfCanvas and PdfTextLayer.
   *  Calculated once in useReaderViewport; never recalculated here. */
  viewport:     PageViewport | null;
  /** Text content for the current page, fetched by usePdfTextLayer. */
  textContent:  TextContent | null;
  /** Whether the PDF document is still loading. */
  isLoading:    boolean;
  /** Error message, or null when there is no error. */
  error:        string | null;
  /** Forwarded to PdfCanvas for the canvas rendering hook (usePdfRenderer). */
  canvasRef:    RefObject<HTMLCanvasElement | null>;
  /** Attached to the scroll container so useReaderViewport can measure
   *  available dimensions for fit-width / fit-page calculations. */
  containerRef: RefObject<HTMLDivElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Layout and composition component — no hooks, no data fetching.
 *
 * Establishes the stacking context that holds all rendering layers in order:
 *
 *   z-index 1  PdfCanvas       (canvas rendering)
 *   z-index 2  PdfTextLayer    (text selection)
 *   z-index 3  HighlightLayer  (future)
 *   z-index 4  AnnotationLayer (future)
 *
 * PdfCanvas and PdfTextLayer are siblings — neither knows about the other.
 * Adding a new layer in the future means adding one sibling here only.
 *
 * ReaderPage owns all orchestration hooks and passes the results down as props.
 */
export function ReaderViewport({
  page,
  viewport,
  textContent,
  isLoading,
  error,
  canvasRef,
  containerRef,
}: ReaderViewportProps) {
  return (
    <div className="reader-viewport-scroll" ref={containerRef}>
      <div className="reader-viewport-page">
        <PdfCanvas
          ref={canvasRef}
          isLoading={isLoading}
          error={error}
        />
        <PdfTextLayer
          page={page}
          textContent={textContent}
          viewport={viewport}
        />
      </div>
    </div>
  );
}
