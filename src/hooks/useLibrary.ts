import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book, StoredBook } from '@/types/book';
import { BookRepository, type CollectionsUpdate } from '@/repositories/BookRepository';
import { extractPdfData } from '@/services/pdfService';
import { computeSHA256 } from '@/utils/hash';
import { selectPdfFiles } from '@/utils/filePicker';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';
import { DEFAULT_SHELF } from '@/features/library/utils/shelves';

const NOT_PDF = "It isn't a PDF file.";

type ImportResult =
  | { status: 'added'; title: string; id: string }
  | { status: 'duplicate'; title: string };

/**
 * Imports one PDF into the library. Throws when the file is not a PDF or
 * cannot be read; resolves 'duplicate' when the same file is already stored.
 */
async function importFile(file: File): Promise<ImportResult> {
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
    throw new Error(NOT_PDF);
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

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  /** Ids of the books the last import added, for the grouping sheet. */
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([]);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchBooks = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const allBooks = await BookRepository.getAll();
      // Sort by recently added
      allBooks.sort((a, b) => b.importedAt - a.importedAt);
      setBooks(allBooks);
    } catch (err) {
      console.error('Failed to fetch books from library:', err);
      showToast({ type: 'error', title: "Couldn't load your library", message: 'Close the app and open it again.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch initially
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const importFiles = useCallback(async (files: File[]) => {
    setIsImporting(true);
    const added: { title: string; id: string }[] = [];
    const duplicates: string[] = [];
    const failed: { file: File; reason: string }[] = [];

    // One at a time: each PDF is parsed and rendered for its thumbnail.
    for (const file of files) {
      try {
        const result = await importFile(file);
        if (result.status === 'added') added.push(result);
        else duplicates.push(result.title);
      } catch (err) {
        console.error(`Import failed for ${file.name}:`, err);
        failed.push({
          file,
          reason: err instanceof Error && err.message === NOT_PDF ? NOT_PDF : 'The PDF might be damaged or unsupported.',
        });
      }
    }

    if (added.length > 0) await fetchBooks();
    setIsImporting(false);
    setLastImportedIds(added.map((a) => a.id));

    // One bar at a time, so the most important outcome speaks for the rest.
    const others = [
      added.length > 0 && `${plural(added.length, 'other book')} added.`,
      duplicates.length > 0 && `${plural(duplicates.length, 'book')} already in your library.`,
    ].filter(Boolean).join(' ');
    if (failed.length > 0) {
      // Only a damaged-looking PDF is worth trying again; another file type never imports.
      const retry = failed.filter((f) => f.reason !== NOT_PDF).map((f) => f.file);
      showToast({
        type: 'error',
        title: failed.length === 1 ? `Couldn't import “${failed[0].file.name}”` : `Couldn't import ${failed.length} files`,
        message: [failed.length === 1 ? failed[0].reason : failed.map((f) => f.file.name).join(', '), others].filter(Boolean).join(' '),
        action: retry.length > 0 ? { label: 'Retry', onPress: () => void importFiles(retry) } : undefined,
      });
    } else if (added.length > 0) {
      showToast({
        type: 'success',
        title: `Added ${plural(added.length, 'book')}`,
        message: [
          `${added.length === 1 ? "It's" : "They're"} on ${DEFAULT_SHELF}.`,
          duplicates.length > 0 && `${plural(duplicates.length, 'book')} ${duplicates.length === 1 ? 'was' : 'were'} already in your library.`,
        ].filter(Boolean).join(' '),
        action: { label: 'View', onPress: () => navigate(ROUTES.LIBRARY) },
      });
    } else if (duplicates.length > 0) {
      showToast({
        type: 'warning',
        title: 'Already in your library',
        message: duplicates.length === 1
          ? `“${duplicates[0]}” wasn't added again.`
          : `${duplicates.length} books were already in your library.`,
      });
    }
  }, [fetchBooks, navigate, showToast]);

  const importBooks = useCallback(async () => {
    let files: File[];
    try {
      files = await selectPdfFiles();
    } catch {
      return; // Picker cancelled
    }
    await importFiles(files);
  }, [importFiles]);

  /** Saves books' author, series and genres, then refreshes the list once. */
  const applyCollectionUpdates = useCallback(async (updates: { id: string; update: CollectionsUpdate }[]) => {
    try {
      for (const { id, update } of updates) {
        await BookRepository.updateCollections(id, update);
      }
      await fetchBooks(true);
    } catch (err) {
      console.error('Failed to update collections:', err);
      showToast({ type: 'error', title: "Couldn't save the changes", message: 'Try again.' });
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
      showToast({ type: 'error', title: "Couldn't remove the book", message: 'Try again.' });
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
