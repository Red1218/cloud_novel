import { useState, useCallback, useEffect } from 'react';
import type { Bookmark } from '../types';
import { bookmarkService } from '../services/bookmarkService';

/**
 * Manages bookmark state for the Reader.
 *
 * Responsibilities:
 * - Load bookmarks when the book changes
 * - Keep state in sync after add/remove/toggle/rename mutations
 *
 * This hook owns NO persistence logic — all IndexedDB access is
 * delegated to `bookmarkService`. It is consumed independently of
 * `useReader` so bookmark logic stays out of the orchestration hook.
 *
 * @param bookId - The UUID of the book being read
 */
export function useReaderBookmarks(bookId: string) {
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
    async (page: number): Promise<Bookmark> => {
      const bookmark = await bookmarkService.addBookmark({ bookId, page });
      await refreshBookmarks();
      return bookmark;
    },
    [bookId, refreshBookmarks],
  );

  const removeBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    await bookmarkService.removeBookmark(bookmarkId);
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  }, []);

  const renameBookmark = useCallback(async (bookmarkId: string, label: string): Promise<void> => {
    const updated = await bookmarkService.updateBookmarkLabel(bookmarkId, label);
    if (!updated) return;
    setBookmarks(prev => prev.map(bookmark => (bookmark.id === bookmarkId ? updated : bookmark)));
  }, []);

  const toggleBookmark = useCallback(
    /** Resolves to the new bookmark, or undefined when one was removed. */
    async (page: number): Promise<Bookmark | undefined> => {
      const existing = bookmarks.find(bookmark => bookmark.page === page);
      if (existing) {
        await removeBookmark(existing.id);
        return undefined;
      }
      return addBookmark(page);
    },
    [bookmarks, addBookmark, removeBookmark],
  );

  return {
    bookmarks,
    isBookmarked,
    removeBookmark,
    renameBookmark,
    toggleBookmark,
  };
}
