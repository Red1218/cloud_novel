import type { Book } from '@/types/book';

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
 * Derives library statistics from a collection of books in a single pass.
 *
 * @param books - The source array of books (readonly)
 * @returns LibraryStats containing total, reading, and finished counts
 */
export function deriveLibraryStats(books: readonly Book[]): LibraryStats {
  let reading = 0;
  let finished = 0;

  for (const book of books) {
    if (book.progress === 100) {
      finished++;
    } else if (book.progress > 0) {
      reading++;
    }
  }

  return { totalBooks: books.length, reading, finished };
}
