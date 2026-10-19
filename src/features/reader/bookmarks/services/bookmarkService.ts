import { getDB } from '@/services/db';
import type { Bookmark } from '../types';

/** Fields required to create a bookmark (id/createdAt are generated). */
export type CreateBookmarkInput = Omit<Bookmark, 'id' | 'createdAt'>;

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
    const db = await getDB();
    const bookmarks = await db.getAllFromIndex('bookmarks', 'by-bookId', input.bookId);
    const existing = bookmarks.find(bookmark => bookmark.page === input.page);
    if (existing) {
      return existing;
    }

    const bookmark: Bookmark = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    await db.put('bookmarks', bookmark);
    return bookmark;
  },

  /**
   * Sets or clears a bookmark's label. The label is trimmed; an empty
   * label removes it. Returns the updated bookmark, or undefined when the
   * bookmark does not exist.
   */
  async updateBookmarkLabel(bookmarkId: string, label: string): Promise<Bookmark | undefined> {
    const db = await getDB();
    const bookmark = await db.get('bookmarks', bookmarkId);
    if (!bookmark) return undefined;

    const trimmed = label.trim();
    const updated: Bookmark = { ...bookmark };
    if (trimmed) updated.label = trimmed;
    else delete updated.label;

    await db.put('bookmarks', updated);
    return updated;
  },

  /**
   * Removes a bookmark by ID. No-op when the bookmark does not exist.
   */
  async removeBookmark(bookmarkId: string): Promise<void> {
    const db = await getDB();
    await db.delete('bookmarks', bookmarkId);
  },
};
