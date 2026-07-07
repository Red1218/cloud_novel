import { getDB } from '@/services/db';
import type { Book, StoredBook } from '@/types';

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
   * Retrieves the full StoredBook (including the PDF blob) for reading.
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
};
