import type { PDFPageProxy } from 'pdfjs-dist';

/**
 * Determines how the PDF page is scaled within its container.
 *
 * - 'fit-page'   Scale so the entire page fits within the container.
 *                Re-calculates on window resize.
 * - 'custom'     Use the explicit zoom value chosen by the user.
 *                Preserved on window resize.
 */
export type ScaleMode = 'fit-page' | 'custom';

/** Visual environment around the published PDF page. */
export type ReaderTheme = 'dark' | 'light' | 'sepia' | 'contrast';

/** Reader environment settings persisted per book. */
export interface ReaderEnvironmentSettings {
  theme: ReaderTheme;
  brightness: number;
  autoHideControls: boolean;
}

/** TextContent is not re-exported from pdfjs-dist's top-level entry point,
 *  so derive it from the return type of getTextContent(). */
export type TextContent = Awaited<ReturnType<PDFPageProxy['getTextContent']>>;
