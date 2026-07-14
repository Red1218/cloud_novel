import type { ScaleMode } from '@/features/reader/types';

/**
 * Represents a book in the Cloud Novel library (Domain Model).
 * This interface is used by the UI components.
 */
export interface Book {
  /** A unique identifier (UUID v4) */
  id: string;
  /** The SHA-256 hash of the PDF file, used for duplicate detection */
  hash: string;
  /** Extracted or default title */
  title: string;
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
  /** Last zoom level used (for persistence) */
  zoom?: number;
  /** Last scale mode used (for persistence) */
  scaleMode?: ScaleMode;
}

/**
 * Represents a book as stored in IndexedDB (Persistence Model).
 * Extends the domain model by including the raw PDF Blob.
 */
export interface StoredBook extends Book {
  /** The actual PDF file data */
  pdf: Blob;
}
