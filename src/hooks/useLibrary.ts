import { useState, useCallback, useEffect } from 'react';
import type { Book, StoredBook } from '@/types/book';
import { BookRepository } from '@/repositories/BookRepository';
import { extractPdfData } from '@/services/pdfService';
import { computeSHA256 } from '@/utils/hash';
import { selectPdfFiles } from '@/utils/filePicker';
import { useToast } from '@/hooks/useToast';

type ImportResult =
  | { status: 'added'; title: string }
  | { status: 'duplicate'; title: string };

/**
 * Imports one PDF into the library. Throws when the file is not a PDF or
 * cannot be read; resolves 'duplicate' when the same file is already stored.
 */
async function importFile(file: File): Promise<ImportResult> {
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
    throw new Error('Not a PDF file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const hash = await computeSHA256(arrayBuffer);

  const existingBook = await BookRepository.getByHash(hash);
  if (existingBook) {
    return { status: 'duplicate', title: existingBook.title };
  }

  const metadata = await extractPdfData(arrayBuffer, file.name);
  const newBook: StoredBook = {
    id: crypto.randomUUID(),
    hash, // SHA-256 hash for duplicate check
    title: metadata.title,
    author: metadata.author,
    fileName: file.name,
    fileSize: file.size,
    pageCount: metadata.pageCount,
    importedAt: Date.now(),
    progress: 0,
    thumbnail: metadata.thumbnail,
    pdf: file,
  };
  await BookRepository.save(newBook);
  return { status: 'added', title: newBook.title };
}

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const { showToast } = useToast();

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBooks = await BookRepository.getAll();
      // Sort by recently added
      allBooks.sort((a, b) => b.importedAt - a.importedAt);
      setBooks(allBooks);
    } catch (err) {
      console.error('Failed to fetch books from library:', err);
      showToast({ type: 'error', title: 'Error', message: 'Failed to load library.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch initially
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const importBooks = useCallback(async () => {
    let files: File[];
    try {
      files = await selectPdfFiles();
    } catch {
      return; // Picker cancelled
    }

    setIsImporting(true);
    const added: string[] = [];
    const duplicates: string[] = [];
    const failed: { name: string; reason: string }[] = [];

    // One at a time: each PDF is parsed and rendered for its thumbnail.
    for (const file of files) {
      try {
        const result = await importFile(file);
        (result.status === 'added' ? added : duplicates).push(result.title);
      } catch (err) {
        console.error(`Import failed for ${file.name}:`, err);
        failed.push({
          name: file.name,
          reason: err instanceof Error && err.message
            ? err.message
            : 'The PDF might be corrupted or unsupported.',
        });
      }
    }

    if (added.length > 0) await fetchBooks();
    setIsImporting(false);

    if (added.length > 0) {
      showToast({
        type: 'success',
        title: 'Import Successful',
        message: added.length === 1
          ? `Added "${added[0]}" to your library.`
          : `Added ${added.length} books to your library.`,
      });
    }
    if (duplicates.length > 0) {
      showToast({
        type: 'warning',
        title: duplicates.length === 1 ? 'Duplicate Book' : 'Duplicate Books',
        message: duplicates.length === 1
          ? `The book "${duplicates[0]}" is already in your library.`
          : `${duplicates.length} books were already in your library.`,
      });
    }
    if (failed.length > 0) {
      showToast({
        type: 'error',
        title: 'Import Error',
        message: failed.length === 1
          ? `Couldn't import "${failed[0].name}": ${failed[0].reason}`
          : `Couldn't import ${failed.length} files: ${failed.map((f) => f.name).join(', ')}.`,
      });
    }
  }, [fetchBooks, showToast]);

  return {
    books,
    isLoading,
    isImporting,
    importBooks,
  };
}
