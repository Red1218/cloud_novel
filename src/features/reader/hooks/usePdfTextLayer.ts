import { useState, useEffect, useRef } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { TextContent } from '../types';

/**
 * Data-only hook. Fetches the text content for the current PDF page.
 *
 * Stale responses from old pages are discarded with a request ID, and only
 * text belonging to `page` is returned: while a new page's text is loading,
 * the result is null rather than the previous page's.
 *
 * @param page - The current PDFPageProxy, or null when no page is loaded.
 */
export function usePdfTextLayer(page: PDFPageProxy | null): TextContent | null {
  // The loaded content is stored with the page it belongs to, so a page
  // change never exposes the previous page's text (derived during render).
  const [loaded, setLoaded] = useState<{ page: PDFPageProxy; content: TextContent } | null>(null);

  // Identifies the most-recent fetch request.
  // A response whose ID no longer matches requestIdRef.current is stale and discarded.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!page) {
      setLoaded(null);
      return;
    }

    requestIdRef.current += 1;
    const thisRequest = requestIdRef.current;

    page.getTextContent()
      .then((content) => {
        if (thisRequest !== requestIdRef.current) return; // stale — discard
        setLoaded({ page, content });
      })
      .catch((err: unknown) => {
        if (thisRequest !== requestIdRef.current) return; // stale — discard
        console.error('[usePdfTextLayer] Failed to load text content:', err);
      });

    return () => {
      // Invalidate this request when page changes or the component unmounts.
      requestIdRef.current += 1;
    };
  }, [page]); // viewport is intentionally excluded — text is per-page, not per-zoom.

  return loaded && loaded.page === page ? loaded.content : null;
}
