import * as pdfjsLib from 'pdfjs-dist';

import { BookRepository } from '@/repositories/BookRepository';
import type { StoredBook } from '@/types';

/**
 * Service responsible for interacting with IndexedDB and pdfjs-dist
 * to load a PDF document without containing any React UI logic.
 */
export const readerService = {
  /**
   * Loads a StoredBook by ID from IndexedDB.
   */
  async loadBook(id: string): Promise<StoredBook> {
    const book = await BookRepository.getStoredBookById(id);
    if (!book) {
      throw new Error('Book not found in library.');
    }
    return book;
  },

  /**
   * Converts a Blob (from IndexedDB) into an ArrayBuffer.
   */
  async convertBlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return await blob.arrayBuffer();
  },

  /**
   * Loads the PDF document using pdfjs-dist.
   * Returns the loading task so the caller can properly destroy it.
   */
  loadPdfDocument(buffer: ArrayBuffer) {
    // We create a Uint8Array view over the buffer to pass to PDF.js
    // which allows the underlying ArrayBuffer to remain intact if needed elsewhere.
    const data = new Uint8Array(buffer);
    return pdfjsLib.getDocument({ data });
  },
};
