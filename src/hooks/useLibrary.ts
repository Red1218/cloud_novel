import { useState, useCallback, useEffect } from 'react';
import type { Book, StoredBook } from '@/types/book';
import { BookRepository, type CollectionsUpdate } from '@/repositories/BookRepository';
import { extractPdfData } from '@/services/pdfService';
import { computeSHA256 } from '@/utils/hash';
import { selectPdfFiles } from '@/utils/filePicker';
import { useToast } from '@/hooks/useToast';

type ImportResult =
  | { status: 'added'; title: string; id: string }
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
  return { status: 'added', title: newBook.title, id: newBook.id };
}

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  /** Ids of the books the last import added, for the grouping sheet. */
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([]);

  const { showToast } = useToast();

  const fetchBooks = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
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
    const added: { title: string; id: string }[] = [];
    const duplicates: string[] = [];
    const failed: { name: string; reason: string }[] = [];

    // One at a time: each PDF is parsed and rendered for its thumbnail.
    for (const file of files) {
      try {
        const result = await importFile(file);
        if (result.status === 'added') added.push(result);
        else duplicates.push(result.title);
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
    setLastImportedIds(added.map((a) => a.id));

    if (added.length > 0) {
      showToast({
        type: 'success',
        title: 'Import Successful',
        message: added.length === 1
          ? `Added "${added[0].title}" to your library.`
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

  /** Saves books' author, series and genres, then refreshes the list once. */
  const applyCollectionUpdates = useCallback(async (updates: { id: string; update: CollectionsUpdate }[]) => {
    try {
      for (const { id, update } of updates) {
        await BookRepository.updateCollections(id, update);
      }
      await fetchBooks(true);
    } catch (err) {
      console.error('Failed to update collections:', err);
      showToast({ type: 'error', title: 'Error', message: 'Could not save the collections.' });
    }
  }, [fetchBooks, showToast]);

  const updateCollections = useCallback(
    (id: string, update: CollectionsUpdate) => applyCollectionUpdates([{ id, update }]),
    [applyCollectionUpdates]
  );

  const clearLastImported = useCallback(() => setLastImportedIds([]), []);

  const removeBook = useCallback(async (id: string) => {
    try {
      await BookRepository.remove(id);
      await fetchBooks(true);
    } catch (err) {
      console.error('Failed to remove book:', err);
      showToast({ type: 'error', title: 'Error', message: 'Could not remove the book.' });
    }
  }, [fetchBooks, showToast]);

  return {
    books,
    isLoading,
    isImporting,
    importBooks,
    lastImportedIds,
    clearLastImported,
    updateCollections,
    applyCollectionUpdates,
    removeBook,
  };
}
