import type { RefObject } from 'react';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import type { TextContent } from '../../types';
import { PdfTextLayer }  from '../PdfTextLayer/PdfTextLayer';
import type { TextLayerHighlight } from '../../search/types';
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
  /** Search matches on this page, highlighted in the text layer. */
  highlights?:  TextLayerHighlight[];
  /** Whether the PDF document is still loading. */
  isLoading:    boolean;
  /** Error message, or null when there is no error. */
  error:        string | null;
  /** Drawn on by the canvas rendering hook (usePdfRenderer). */
  canvasRef:    RefObject<HTMLCanvasElement | null>;
  /** Attached to the scroll container so useReaderViewport can measure
   *  available dimensions for fit-width / fit-page calculations. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Fit screen: the whole page shows, and the bars float over it instead of
   *  taking room, so showing them never resizes or scrolls the page. */
  fitScreen?:   boolean;
  /** The page and its neighbours; usePageTurn moves it during a turn. */
  trackRef:     RefObject<HTMLDivElement | null>;
  /** The previous and next pages, drawn by useNeighbourPages, shown while turning. */
  prevRef:      RefObject<HTMLCanvasElement | null>;
  nextRef:      RefObject<HTMLCanvasElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Layout and composition component — no hooks, no data fetching.
 *
 * Establishes the stacking context that holds the rendering layers in order:
 * the page canvas, then PdfTextLayer (text selection) on top of it.
 *
 * ReaderPage owns all orchestration hooks and passes the results down as props.
 */
export function ReaderViewport({
  page,
  viewport,
  textContent,
  highlights,
  isLoading,
  error,
  canvasRef,
  containerRef,
  fitScreen,
  trackRef,
  prevRef,
  nextRef,
}: ReaderViewportProps) {
  return (
    <div className="reader-viewport-scroll" ref={containerRef} data-fit={fitScreen ? 'screen' : undefined}>
      <div className="reader-turn" ref={trackRef}>
        <canvas ref={prevRef} className="reader-turn__neighbour reader-turn__neighbour--prev" aria-hidden="true" hidden />
        <div className="reader-viewport-page">
          <canvas
            ref={canvasRef}
            className={`pdf-canvas ${isLoading || error ? 'pdf-canvas--hidden' : ''}`}
          />
          <PdfTextLayer
            page={page}
            textContent={textContent}
            viewport={viewport}
            highlights={highlights}
          />
        </div>
        <canvas ref={nextRef} className="reader-turn__neighbour reader-turn__neighbour--next" aria-hidden="true" hidden />
      </div>
    </div>
  );
}
