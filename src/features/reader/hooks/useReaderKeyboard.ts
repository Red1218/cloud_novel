import { useEffect } from 'react';

interface UseReaderKeyboardOptions {
  previousPage: () => void;
  nextPage:     () => void;
  zoomIn:       () => void;
  zoomOut:      () => void;
  resetZoom:    () => void;
}

/**
 * Registers global keyboard shortcuts for the Reader.
 *
 * Shortcuts:
 *  ArrowLeft           Previous page
 *  ArrowRight          Next page
 *  Ctrl / Meta + +     Zoom in
 *  Ctrl / Meta + -     Zoom out
 *  Ctrl / Meta + 0     Reset zoom to 100%
 *
 * All shortcuts are suppressed when focus is inside an editable element
 * (input, textarea, or contenteditable).
 *
 * Arrow keys always call preventDefault() to prevent the browser from
 * scrolling the viewport horizontally when the page is zoomed in and the
 * scroll container has horizontal overflow. Without this, the native scroll
 * and page navigation fire simultaneously, causing visible jitter.
 */
export function useReaderKeyboard({
  previousPage,
  nextPage,
  zoomIn,
  zoomOut,
  resetZoom,
}: UseReaderKeyboardOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        // preventDefault stops the browser from scrolling the scroll container
        // horizontally when the page is wider than the viewport (zoomed in).
        e.preventDefault();
        previousPage();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPage();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousPage, nextPage, zoomIn, zoomOut, resetZoom]);
}
