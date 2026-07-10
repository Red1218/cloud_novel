import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist';

interface UsePdfRendererProps {
  page:      PDFPageProxy | null;
  viewport:  PageViewport | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * Pure rendering hook.
 *
 * Receives a pre-computed PDFPageProxy and PageViewport from useReader.
 * Owns canvas sizing (HiDPI), RenderTask lifecycle, and page.cleanup().
 *
 * Never fetches pages, never calculates scale, never mutates Reader state.
 */
export function usePdfRenderer({ page, viewport, canvasRef }: UsePdfRendererProps): void {
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    if (!page || !viewport || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let isMounted = true;

    const doRender = async () => {
      // Cancel any in-flight render before starting a new one.
      if (renderTaskRef.current) {
        await renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (!isMounted) return;

      // HiDPI canvas sizing (prevents blur on retina / high-DPI displays).
      const outputScale = window.devicePixelRatio || 1;
      canvas.width  = Math.floor(viewport.width  * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width  = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx || !isMounted) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : undefined;

      // We use a localized type assertion for RenderParameters because @types/pdfjs-dist
      // incorrectly requires the 'canvas' property which is optional in the actual PDF.js API.
      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
        transform,
      } as Parameters<typeof page.render>[0]);

      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
        // Release internal rendering resources after a successful render.
        page.cleanup();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'RenderingCancelledException') {
          // Normal when page or viewport changes during an active render.
          return;
        }
        console.error('Error rendering page:', err);
      }
    };

    doRender();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [page, viewport, canvasRef]);
}
