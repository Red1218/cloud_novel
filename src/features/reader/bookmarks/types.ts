/**
 * Represents a saved position within a book.
 *
 * Pure data model — persistence and behavior live in
 * `services/bookmarkService` and `hooks/useReaderBookmarks`.
 */
export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  createdAt: number;
  label?: string;
}
