import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

interface UsePdfRendererProps {
  pdfDocument: PDFDocumentProxy | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentPage: number;
}

/**
 * Hook to handle rendering a specific page of a PDFDocumentProxy to a canvas.
 * Manages responsive resizing.
 */
export function usePdfRenderer({ pdfDocument, canvasRef, currentPage }: UsePdfRendererProps) {
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || currentPage < 1) return;

    const canvas = canvasRef.current;
    let isMounted = true;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        if (!isMounted) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        // Cancel previous render if any
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const containerWidth = parent.clientWidth;
        
        // Base viewport at scale 1 to get original dimensions
        const originalViewport = page.getViewport({ scale: 1.0 });
        
        // Calculate scale to fit container width
        const scale = containerWidth / originalViewport.width;
        const viewport = page.getViewport({ scale });

        // High DPI canvas rendering (prevent blur)
        const outputScale = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear before render
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : undefined;

        const renderContext = {
          canvasContext: ctx, 
          viewport,
          transform,
        };

        // We use a localized type assertion for RenderParameters because @types/pdfjs-dist
        // incorrectly requires the 'canvas' property which is optional in the actual PDF.js API.
        const renderTask = page.render(renderContext as Parameters<typeof page.render>[0]);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
        
        // Free internal rendering resources after successful render
        page.cleanup();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'RenderingCancelledException') {
          // Normal during resize
          return;
        }
        console.error('Error rendering page:', err);
      }
    };

    renderPage();

    // Re-render on window resize (debounced)
    let timeoutId: ReturnType<typeof window.setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          renderPage();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDocument, canvasRef, currentPage]);
}
