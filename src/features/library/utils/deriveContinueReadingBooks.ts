import type { Book } from '@/types/book';

/** Maximum number of books to show in Continue Reading section */
const CONTINUE_READING_MAX = 3;

/**
 * Derives the list of books for the "Continue Reading" section.
 *
 * Rules:
 * - Only books with progress > 0 and progress < 100
 * - Only books with lastOpened timestamp
 * - Sorted by lastOpened descending (most recent first)
 * - Stable sort: preserves original order for ties
 * - Maximum of CONTINUE_READING_MAX books
 *
 * @param books - The source array of books (readonly)
 * @returns A new readonly array containing up to CONTINUE_READING_MAX books
 */
export function deriveContinueReadingBooks(
  books: readonly Book[]
): readonly Book[] {
  // Filter: progress > 0, progress < 100, lastOpened exists
  const inProgress = books.filter(
    (book): book is Book & { lastOpened: number } =>
      book.progress > 0 &&
      book.progress < 100 &&
      book.lastOpened !== undefined &&
      book.lastOpened !== null
  );

  // Sort by lastOpened descending (stable sort); filter already copied the array.
  return inProgress
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(0, CONTINUE_READING_MAX);
}
