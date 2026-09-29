import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredBook } from '@/types';
import type { Bookmark } from '@/features/reader/bookmarks/types';

interface CloudNovelDBSchema extends DBSchema {
  books: {
    key: string; // The UUID (id)
    value: StoredBook;
    indexes: {
      'by-hash': string;
    };
  };
  bookmarks: {
    key: string; // The UUID (id)
    value: Bookmark;
    indexes: {
      'by-bookId': string;
    };
  };
}

const DB_NAME = 'CloudNovelDB';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<CloudNovelDBSchema>> | null = null;

/**
 * Initializes and returns the IndexedDB instance.
 * Automatically handles schema creation and upgrades.
 */
export function getDB(): Promise<IDBPDatabase<CloudNovelDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<CloudNovelDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2) {
          // Destructive migration for Phase 3.1
          if (db.objectStoreNames.contains('books')) {
            db.deleteObjectStore('books');
          }

          const bookStore = db.createObjectStore('books', { keyPath: 'id' });
          bookStore.createIndex('by-hash', 'hash', { unique: true });
        }

        if (oldVersion < 3 && !db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('by-bookId', 'bookId');
        }
      },
    });
  }
  return dbPromise;
}
