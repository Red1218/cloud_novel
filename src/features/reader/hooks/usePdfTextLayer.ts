import { useState, useEffect, useRef } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import { getTextContent } from '../services/textLayerService';
import type { TextContent } from '../services/textLayerService';

// ─── Public interface ─────────────────────────────────────────────────────────

export interface UsePdfTextLayerResult {
  textContent: TextContent | null;
  isLoading:   boolean;
  error:        string | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Data-only hook. Fetches the text content for the current PDF page.
 *
 * Responsibilities:
 *  - Fetch TextContent via textLayerService when `page` changes.
 *  - Apply a request-ID cancellation pattern (identical to useReaderViewport)
 *    so stale responses from old pages are discarded during rapid navigation.
 *  - Reset state when `page` becomes null (document unloaded / navigate away).
 *  - Never re-fetch when only the viewport changes — text content is per-page.
 *  - Only return text content that belongs to `page`: while a new page's
 *    text is loading, `textContent` is null rather than the previous page's.
 *
 * Does NOT:
 *  - Touch the DOM.
 *  - Instantiate TextLayer.
 *  - Know anything about zoom, scale, or viewport.
 *
 * @param page - The current PDFPageProxy, or null when no page is loaded.
 */
export function usePdfTextLayer(
  page: PDFPageProxy | null,
): UsePdfTextLayerResult {
  // The loaded content is stored with the page it belongs to, so a page
  // change never exposes the previous page's text (derived during render).
  const [loaded, setLoaded] = useState<{ page: PDFPageProxy; content: TextContent } | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Identifies the most-recent fetch request.
  // A response whose ID no longer matches requestIdRef.current is stale and discarded.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!page) {
      setLoaded(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Snapshot the request ID before the async call.
    requestIdRef.current += 1;
    const thisRequest = requestIdRef.current;

    setIsLoading(true);
    setError(null);

    getTextContent(page)
      .then((content) => {
        if (thisRequest !== requestIdRef.current) return; // stale — discard
        setLoaded({ page, content });
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (thisRequest !== requestIdRef.current) return; // stale — discard
        const message = err instanceof Error ? err.message : 'Failed to load text content.';
        console.error('[usePdfTextLayer] Failed to load text content:', err);
        setError(message);
        setIsLoading(false);
      });

    return () => {
      // Invalidate this request when page changes or the component unmounts.
      requestIdRef.current += 1;
    };
  }, [page]); // viewport is intentionally excluded — text is per-page, not per-zoom.

  const textContent = loaded && loaded.page === page ? loaded.content : null;

  return { textContent, isLoading, error };
}
