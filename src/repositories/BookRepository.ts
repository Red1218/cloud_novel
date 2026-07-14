import { getDB } from '@/services/db';
import type { Book, StoredBook } from '@/types';
import type { ScaleMode } from '@/features/reader/types';

/**
 * Update payload for reading state persistence.
 * All fields are optional — only provided fields will be updated.
 */
export interface ReadingStateUpdate {
  currentPage?: number;
  zoom?: number;
  scaleMode?: ScaleMode;
  lastOpened?: number;
}

/**
 * Repository for interacting with the books collection in IndexedDB.
 * Decouples the UI and domain logic from the specific storage mechanism.
 */
export const BookRepository = {
  /**
   * Retrieves all books, stripping out the raw PDF blob to keep memory usage low.
   * Returns domain `Book` objects.
   */
  async getAll(): Promise<Book[]> {
    const db = await getDB();
    const storedBooks = await db.getAll('books');

    // Map StoredBook -> Book (omitting the pdf blob)
    return storedBooks.map((stored) => {
      const { pdf, ...domainBook } = stored;
      return domainBook;
    });
  },

  /**
   * Retrieves a specific book by its hash using the 'by-hash' index.
   * Note: This returns a domain `Book`, not the `StoredBook`.
   */
  async getByHash(hash: string): Promise<Book | undefined> {
    const db = await getDB();
    const storedBook = await db.getFromIndex('books', 'by-hash', hash);
    if (!storedBook) return undefined;

    const { pdf, ...domainBook } = storedBook;
    return domainBook;
  },

  /**
   * Retrieves the full StoredBook (including the PDF blob) for reading by UUID.
   */
  async getStoredBookById(id: string): Promise<StoredBook | undefined> {
    const db = await getDB();
    return db.get('books', id);
  },

  /**
   * Retrieves the full StoredBook (including the PDF blob) for reading by hash.
   */
  async getStoredBookByHash(hash: string): Promise<StoredBook | undefined> {
    const db = await getDB();
    return db.getFromIndex('books', 'by-hash', hash);
  },

  /**
   * Persists a new StoredBook to the database.
   */
  async save(book: StoredBook): Promise<void> {
    const db = await getDB();
    await db.put('books', book);
  },

  /**
   * Deletes a book from the database by its hash.
   * First resolves the hash to the primary key (id), then deletes.
   */
  async delete(hash: string): Promise<void> {
    const db = await getDB();
    // In Phase 3.1, the primary key is 'id', so we must look up the id via the hash index first.
    const key = await db.getKeyFromIndex('books', 'by-hash', hash);
    if (key) {
      await db.delete('books', key);
    }
  },

  /**
   * Partially updates the reading state fields of a book.
   * Only updates the fields provided in the update object.
   *
   * IMPORTANT: progress is ALWAYS derived from currentPage / pageCount.
   * It must NEVER be written independently. When currentPage changes,
   * progress is automatically recalculated.
   *
   * currentPage is clamped to valid range: 1 <= currentPage <= pageCount.
   *
   * Only writes to IndexedDB if at least one field actually changed.
   *
   * @param id - The UUID of the book to update
   * @param update - Partial reading state to persist
   */
  async updateReadingState(id: string, update: ReadingStateUpdate): Promise<void> {
    const db = await getDB();

    // Get the existing book
    const book = await db.get('books', id);
    if (!book) {
      // Book no longer exists — not an exceptional condition for persistence
      return;
    }

    // Protect against corrupted pageCount (must be at least 1)
    const safePageCount = Math.max(1, book.pageCount);

    let changed = false;

    // Apply updates with change detection
    if (update.currentPage !== undefined) {
      // Clamp currentPage to valid range: 1 <= currentPage <= safePageCount
      const clampedPage = Math.min(Math.max(1, update.currentPage), safePageCount);

      if (book.currentPage !== clampedPage) {
        book.currentPage = clampedPage;
        // Derive progress from currentPage / safePageCount
        // Ensure progress is between 0 and 100
        const rawProgress = (clampedPage / safePageCount) * 100;
        book.progress = Math.min(100, Math.max(0, rawProgress));
        changed = true;
      }
    }

    if (update.zoom !== undefined && book.zoom !== update.zoom) {
      book.zoom = update.zoom;
      changed = true;
    }

    if (update.scaleMode !== undefined && book.scaleMode !== update.scaleMode) {
      book.scaleMode = update.scaleMode;
      changed = true;
    }

    if (update.lastOpened !== undefined && book.lastOpened !== update.lastOpened) {
      book.lastOpened = update.lastOpened;
      changed = true;
    }

    // Only write to IndexedDB if something actually changed
    if (changed) {
      await db.put('books', book);
    }
  },
};
