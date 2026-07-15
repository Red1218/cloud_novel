import type { Book } from '@/types';

/**
 * Library statistics derived from the book collection.
 */
export interface LibraryStats {
  /** Total number of books in the library */
  readonly totalBooks: number;
  /** Number of books currently being read (0 < progress < 100) */
  readonly reading: number;
  /** Number of books finished (progress === 100) */
  readonly finished: number;
}

/**
 * Derives library statistics from a collection of books.
 *
 * Rules:
 * - Single O(n) pass
 * - No sorting, no filtering, no mutation
 * - Returns immutable frozen stats object
 *
 * @param books - The source array of books (readonly)
 * @returns Frozen LibraryStats containing total, reading, and finished counts
 */
export function deriveLibraryStats(
  books: readonly Book[]
): Readonly<LibraryStats> {
  let totalBooks = 0;
  let reading = 0;
  let finished = 0;

  for (const book of books) {
    totalBooks++;

    if (book.progress === 100) {
      finished++;
    } else if (book.progress > 0) {
      reading++;
    }
  }

  return Object.freeze({
    totalBooks,
    reading,
    finished,
  });
}
