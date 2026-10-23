import type { PDFPageProxy, PageViewport } from 'pdfjs-dist';

export interface PageRender {
  /** Resolves once the page is on the canvas; rejects on failure or cancel. */
  promise: Promise<void>;
  cancel: () => void;
}

/**
 * Draws `page` at `viewport` onto `canvas`, sized for the screen's pixel
 * density. It renders off-screen first and copies the result in one step,
 * so the visible canvas never shows a blank frame while PDF.js works.
 */
export function renderPage(page: PDFPageProxy, viewport: PageViewport, canvas: HTMLCanvasElement): PageRender {
  const outputScale = window.devicePixelRatio || 1;
  const buffer = document.createElement('canvas');
  buffer.width = Math.floor(viewport.width * outputScale);
  buffer.height = Math.floor(viewport.height * outputScale);

  // @types/pdfjs-dist wrongly requires `canvas`, which is optional in PDF.js.
  const task = page.render({
    canvasContext: buffer.getContext('2d')!,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
  } as Parameters<typeof page.render>[0]);

  const promise = task.promise.then(() => {
    canvas.width = buffer.width;
    canvas.height = buffer.height;
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    canvas.getContext('2d')?.drawImage(buffer, 0, 0);
    page.cleanup(); // release PDF.js's internal resources for this page
  });

  return { promise, cancel: () => task.cancel() };
}

/** True for the error PDF.js throws when a render is cancelled on purpose. */
export function isCancelled(err: unknown): boolean {
  return err instanceof Error && err.name === 'RenderingCancelledException';
}
