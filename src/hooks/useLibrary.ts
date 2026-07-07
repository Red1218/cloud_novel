import { useState, useCallback, useEffect } from 'react';
import type { Book, StoredBook } from '@/types';
import { BookRepository } from '@/repositories/BookRepository';
import { extractPdfData } from '@/services/pdfService';
import { computeSHA256 } from '@/utils/hash';
import { selectPdfFile } from '@/utils/filePicker';

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBooks = await BookRepository.getAll();
      // Sort by recently added
      allBooks.sort((a, b) => b.importedAt - a.importedAt);
      setBooks(allBooks);
    } catch (err) {
      console.error('Failed to fetch books from library:', err);
      setError('Failed to load library.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initially
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const importBook = useCallback(async () => {
    setError(null);
    try {
      // 1. File Picker
      const file = await selectPdfFile();
      setIsImporting(true);

      // 2. Read as ArrayBuffer for hashing and processing
      const arrayBuffer = await file.arrayBuffer();

      // 3. Compute SHA-256 Hash
      const hash = await computeSHA256(arrayBuffer);

      // 4. Duplicate Check
      const existingBook = await BookRepository.getByHash(hash);
      if (existingBook) {
        throw new Error(`The book "${existingBook.title}" is already in your library.`);
      }

      // 5. Extract Metadata and Thumbnail
      const metadata = await extractPdfData(arrayBuffer, file.name);

      // 6. Construct StoredBook Entity
      const newBook: StoredBook = {
        id: crypto.randomUUID(), // UUID v4 as requested
        hash,                    // SHA-256 hash for duplicate check
        title: metadata.title,
        author: metadata.author,
        fileName: file.name,
        fileSize: file.size,
        pageCount: metadata.pageCount,
        importedAt: Date.now(),
        progress: 0,
        thumbnail: metadata.thumbnail,
        pdf: file,               // Blob
      };

      // 7. Save to Repository
      await BookRepository.save(newBook);

      // 8. Refresh Library
      await fetchBooks();

    } catch (err: any) {
      if (err.message !== 'File selection cancelled') {
        console.error('Import failed:', err);
        setError(err.message || 'Failed to import book.');
        // If we had a toast system, we could dispatch here. 
        // For now, we use a simple browser alert to meet "friendly error handling" without over-engineering Phase 3 UI.
        alert(err.message || 'Failed to import book.');
      }
    } finally {
      setIsImporting(false);
    }
  }, [fetchBooks]);

  return {
    books,
    isLoading,
    isImporting,
    error,
    importBook,
    refresh: fetchBooks,
  };
}
