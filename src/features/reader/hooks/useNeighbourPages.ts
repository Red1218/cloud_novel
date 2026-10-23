import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { isCancelled, renderPage, type PageRender } from '../utils/renderPage';

/**
 * Keeps the previous and next pages drawn, at the current page's scale, on
 * the canvases that sit beside it during a page turn. Each canvas is first
 * sized as a plain sheet, then filled in when its render lands; a missing
 * neighbour (first or last page) is hidden.
 */
export function useNeighbourPages(
  pdfDocument: PDFDocumentProxy | null,
  currentPage: number,
  scale: number | undefined,
  prevRef: RefObject<HTMLCanvasElement | null>,
  nextRef: RefObject<HTMLCanvasElement | null>,
): void {
  useEffect(() => {
    if (!pdfDocument || !scale) return;

    let live = true;
    const renders: PageRender[] = [];
    const neighbours = [
      [prevRef.current, currentPage - 1],
      [nextRef.current, currentPage + 1],
    ] as const;

    for (const [canvas, pageNumber] of neighbours) {
      if (!canvas) continue;
      canvas.hidden = pageNumber < 1 || pageNumber > pdfDocument.numPages;
      if (canvas.hidden) continue;
      canvas.width = 1; // drop the old image at once: a blank sheet until this page lands

      pdfDocument.getPage(pageNumber).then((page) => {
        if (!live) return;
        const viewport = page.getViewport({ scale });
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const render = renderPage(page, viewport, canvas);
        renders.push(render);
        render.promise.catch((err: unknown) => {
          if (!isCancelled(err)) console.error('Error rendering neighbour page:', err);
        });
      }).catch((err: unknown) => console.error('Failed to load neighbour page:', err));
    }

    return () => {
      live = false;
      renders.forEach((r) => r.cancel());
    };
  }, [pdfDocument, currentPage, scale, prevRef, nextRef]);
}
