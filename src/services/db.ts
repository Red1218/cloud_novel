import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredBook } from '@/types';

interface CloudNovelDBSchema extends DBSchema {
  books: {
    key: string; // The UUID (id)
    value: StoredBook;
    indexes: {
      'by-hash': string;
      'by-title': string;
      'by-importedAt': number;
      'by-lastOpened': number;
    };
  };
  // Future phases will use this
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'CloudNovelDB';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<CloudNovelDBSchema>> | null = null;

/**
 * Initializes and returns the IndexedDB instance.
 * Automatically handles schema creation and upgrades.
 */
export function getDB(): Promise<IDBPDatabase<CloudNovelDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<CloudNovelDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Destructive migration for Phase 3.1
        if (db.objectStoreNames.contains('books')) {
          db.deleteObjectStore('books');
        }
        
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        
        // Create indexes
        bookStore.createIndex('by-hash', 'hash', { unique: true });
        bookStore.createIndex('by-title', 'title');
        bookStore.createIndex('by-importedAt', 'importedAt');
        bookStore.createIndex('by-lastOpened', 'lastOpened');

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}
