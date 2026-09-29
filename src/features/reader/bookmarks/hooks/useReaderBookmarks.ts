import { useState, useCallback, useEffect } from 'react';
import type { Bookmark } from '../types';
import { bookmarkService } from '../services/bookmarkService';

export interface UseReaderBookmarksResult {
  /** All bookmarks for the book, ordered by page ascending. */
  bookmarks: Bookmark[];
  /** Synchronously checks the loaded state for a bookmark on a page. */
  isBookmarked: (page: number) => boolean;
  /** Adds a bookmark on a page and refreshes state. */
  addBookmark: (page: number, label?: string) => Promise<void>;
  /** Removes a bookmark by ID and updates state. */
  removeBookmark: (bookmarkId: string) => Promise<void>;
  /** Toggles a bookmark on a page, delegating to add/remove based on state. */
  toggleBookmark: (page: number) => Promise<void>;
  /** Reloads bookmarks from IndexedDB into state. */
  refreshBookmarks: () => Promise<void>;
}

/**
 * Manages bookmark state for the Reader.
 *
 * Responsibilities:
 * - Load bookmarks when the book changes
 * - Keep state in sync after add/remove/toggle mutations
 *
 * This hook owns NO persistence logic — all IndexedDB access is
 * delegated to `bookmarkService`. It is consumed independently of
 * `useReader` so bookmark logic stays out of the orchestration hook.
 *
 * @param bookId - The UUID of the book being read
 */
export function useReaderBookmarks(bookId: string): UseReaderBookmarksResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const refreshBookmarks = useCallback(async (): Promise<void> => {
    const result = await bookmarkService.getBookmarks(bookId);
    setBookmarks(result);
  }, [bookId]);

  // Load bookmarks initially and whenever the book changes.
  useEffect(() => {
    refreshBookmarks().catch(err => {
      console.error('Failed to load bookmarks:', err);
    });
  }, [refreshBookmarks]);

  const isBookmarked = useCallback(
    (page: number): boolean => bookmarks.some(bookmark => bookmark.page === page),
    [bookmarks],
  );

  const addBookmark = useCallback(
    async (page: number, label?: string): Promise<void> => {
      await bookmarkService.addBookmark({ bookId, page, label });
      await refreshBookmarks();
    },
    [bookId, refreshBookmarks],
  );

  const removeBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    await bookmarkService.removeBookmark(bookmarkId);
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  }, []);

  const toggleBookmark = useCallback(
    async (page: number): Promise<void> => {
      const existing = bookmarks.find(bookmark => bookmark.page === page);
      if (existing) {
        await removeBookmark(existing.id);
      } else {
        await addBookmark(page);
      }
    },
    [bookmarks, addBookmark, removeBookmark],
  );

  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks,
  };
}
