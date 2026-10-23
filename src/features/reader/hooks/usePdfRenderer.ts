import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { isCancelled, renderPage } from '../utils/renderPage';

interface UsePdfRendererProps {
  page:      PDFPageProxy | null;
  viewport:  PageViewport | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * Pure rendering hook.
 *
 * Receives a pre-computed PDFPageProxy and PageViewport from useReader and
 * draws them onto the canvas (renderPage), cancelling a render that a newer
 * page or viewport makes stale.
 *
 * Never fetches pages, never calculates scale, never mutates Reader state.
 */
export function usePdfRenderer({ page, viewport, canvasRef }: UsePdfRendererProps): void {
  useEffect(() => {
    if (!page || !viewport || !canvasRef.current) return;

    const render = renderPage(page, viewport, canvasRef.current);
    render.promise.catch((err: unknown) => {
      if (!isCancelled(err)) console.error('Error rendering page:', err);
    });

    return render.cancel;
  }, [page, viewport, canvasRef]);
}
