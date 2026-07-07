import { useEffect } from 'react';

const APP_NAME = 'Cloud Novel';

/**
 * Sets document.title to "{APP_NAME} • {pageTitle}" on mount
 * and restores it to APP_NAME on unmount.
 *
 * No external library required.
 *
 * @param pageTitle - The page-specific portion of the title.
 *
 * @example
 * useDocumentTitle('Dashboard');
 * // => document.title === 'Cloud Novel • Dashboard'
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${APP_NAME} \u2022 ${pageTitle}`;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
