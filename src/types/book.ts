
/**
 * Represents a book in the Cloud Novel library (Domain Model).
 * This interface is used by the UI components.
 */
export interface Book {
  /** A unique identifier (UUID v4) */
  id: string;
  /** The SHA-256 hash of the PDF file, used for duplicate detection */
  hash: string;
  /** Extracted or default title; the reader can rename it */
  title: string;
  /** The PDF's own title, kept the first time the book is renamed */
  fileTitle?: string;
  /** Extracted or default author */
  author?: string;
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** Total number of pages */
  pageCount: number;
  /** Timestamp of when the book was imported */
  importedAt: number;
  /** Timestamp of when the book was last opened */
  lastOpened?: number;
  /** Base64 PNG string of the first page */
  thumbnail?: string;
  /**
   * Current reading progress (0-100).
   * This is ALWAYS derived from currentPage / pageCount.
   * Do not set directly — use updateReadingState instead.
   */
  progress: number;
  /** Current page number (1-based) */
  currentPage?: number;
  /** This book's own zoom (1 = 100%): it opens there, centred, instead of fitting the whole page. */
  openZoom?: number;
  /** The series this book belongs to (at most one), with its place in it */
  series?: BookSeries;
  /** Genres the reader filed this book under (any number) */
  genres?: string[];
  /** The reader's own shelf in the Library; none = the default shelf */
  shelf?: string;
  /** The reader's plan: read it soon ('next') or set it aside ('later') */
  intent?: BookIntent;
  /** When the plan was set; Up next is read oldest first */
  intentAt?: number;
}

export type BookIntent = 'next' | 'later';

/** A book's place in a series: books are read in `number` order. */
export interface BookSeries {
  name: string;
  number: number;
}

/**
 * Represents a book as stored in IndexedDB (Persistence Model).
 * Extends the domain model by including the raw PDF Blob.
 */
export interface StoredBook extends Book {
  /** The actual PDF file data */
  pdf: Blob;
}
