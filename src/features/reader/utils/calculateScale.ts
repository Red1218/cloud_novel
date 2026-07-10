import type { PDFPageProxy } from 'pdfjs-dist';
import type { ScaleMode } from '../types';

/**
 * Calculates the scale factor for rendering a PDF page within a container.
 *
 * Pure function — no side effects, no React dependencies.
 *
 * @param page        - PDFPageProxy used to read the original page dimensions.
 * @param container   - HTML element whose available area determines the scale.
 * @param zoom        - Explicit zoom multiplier (only applied when scaleMode is 'custom').
 * @param scaleMode   - How the page should be scaled.
 * @returns The numeric scale factor to pass to page.getViewport().
 */
export function calculateScale(
  page: PDFPageProxy,
  container: HTMLElement,
  zoom: number,
  scaleMode: ScaleMode,
): number {
  const original = page.getViewport({ scale: 1.0 });

  const style = window.getComputedStyle(container);
  const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  // Clamp to 1 to prevent division-by-zero on degenerate containers.
  const availableWidth  = Math.max(1, container.clientWidth  - paddingH);
  const availableHeight = Math.max(1, container.clientHeight - paddingV);

  switch (scaleMode) {
    case 'fit-width':
      return availableWidth / original.width;

    case 'fit-page':
      return Math.min(
        availableWidth  / original.width,
        availableHeight / original.height,
      );

    case 'custom':
      return zoom;
  }
}
