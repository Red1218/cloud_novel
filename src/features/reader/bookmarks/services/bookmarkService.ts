import { getDB } from '@/services/db';
import type { Bookmark } from '../types';

/** Fields required to create a bookmark (id/createdAt are generated). */
export type CreateBookmarkInput = Omit<Bookmark, 'id' | 'createdAt'>;

/**
 * Finds the bookmark for a specific page of a book, if any.
 */
async function findBookmarkByPage(bookId: string, page: number): Promise<Bookmark | undefined> {
  const db = await getDB();
  const bookmarks = await db.getAllFromIndex('bookmarks', 'by-bookId', bookId);
  return bookmarks.find(bookmark => bookmark.page === page);
}

/**
 * Service responsible for bookmark persistence in IndexedDB.
 *
 * Contains no React or state logic — it only reads and writes
 * the 'bookmarks' object store. State management lives in
 * `useReaderBookmarks`.
 */
export const bookmarkService = {
  /**
   * Returns all bookmarks for a book, ordered by page ascending.
   */
  async getBookmarks(bookId: string): Promise<Bookmark[]> {
    const db = await getDB();
    const bookmarks = await db.getAllFromIndex('bookmarks', 'by-bookId', bookId);
    return bookmarks.sort((a, b) => a.page - b.page);
  },

  /**
   * Persists a new bookmark, generating its id and createdAt timestamp.
   *
   * Idempotent: if the page is already bookmarked, the existing
   * bookmark is returned unchanged.
   */
  async addBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
    const existing = await findBookmarkByPage(input.bookId, input.page);
    if (existing) {
      return existing;
    }

    const bookmark: Bookmark = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const db = await getDB();
    await db.put('bookmarks', bookmark);
    return bookmark;
  },

  /**
   * Removes a bookmark by ID. No-op when the bookmark does not exist.
   */
  async removeBookmark(bookmarkId: string): Promise<void> {
    const db = await getDB();
    await db.delete('bookmarks', bookmarkId);
  },

  /**
   * Removes all bookmarks for a book in a single transaction.
   */
  async clearBookmarks(bookId: string): Promise<void> {
    const db = await getDB();
    const keys = await db.getAllKeysFromIndex('bookmarks', 'by-bookId', bookId);
    if (keys.length === 0) return;

    const tx = db.transaction('bookmarks', 'readwrite');
    await Promise.all([...keys.map(key => tx.store.delete(key)), tx.done]);
  },

  /**
   * Checks whether a page of a book is bookmarked.
   */
  async isBookmarked(bookId: string, page: number): Promise<boolean> {
    const existing = await findBookmarkByPage(bookId, page);
    return existing !== undefined;
  },

};
