/**
 * Represents a book in the Cloud Novel library.
 * This shared interface is used across components and mock data,
 * and will eventually map to IndexedDB records.
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  progress: number;
  lastOpened: string;
  pageCount?: number;
  currentPage?: number;
}
