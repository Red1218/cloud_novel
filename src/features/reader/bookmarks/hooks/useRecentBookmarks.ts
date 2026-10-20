import { useEffect, useState } from 'react';
import type { Bookmark } from '../types';
import { bookmarkService } from '../services/bookmarkService';

/**
 * Bookmarks across every book, newest first, for surfaces outside the
 * reader (Home). Loaded once on mount; persistence stays in bookmarkService.
 */
export function useRecentBookmarks(): Bookmark[] {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    let active = true;
    bookmarkService
      .getRecentBookmarks()
      .then((result) => {
        if (active) setBookmarks(result);
      })
      .catch((err) => console.error('Failed to load recent bookmarks:', err));
    return () => {
      active = false;
    };
  }, []);

  return bookmarks;
}
