import type { PDFPageProxy } from 'pdfjs-dist';

/** TextContent is not re-exported from pdfjs-dist's top-level entry point.
 *  Derive it from the return type of getTextContent() to stay strictly typed. */
export type TextContent = Awaited<ReturnType<PDFPageProxy['getTextContent']>>;

/**
 * Fetches the text content for a single PDF page.
 *
 * Pure async service — no React, no side-effects.
 *
 * The caller (usePdfTextLayer) is responsible for stale-request cancellation.
 * This function simply wraps page.getTextContent() with a typed return value.
 *
 * @param page - The PDFPageProxy whose text content is required.
 * @returns The TextContent object produced by pdfjs-dist.
 */
export async function getTextContent(page: PDFPageProxy): Promise<TextContent> {
  return page.getTextContent();
}
