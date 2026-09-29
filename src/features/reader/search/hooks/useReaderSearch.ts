import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SearchMatch, SearchResults } from '../types';
import {
  extractPageTexts,
  findMatches,
  normalizeQuery,
  type PageText,
} from '../services/searchService';

/** Delay after the last keystroke before searching. */
const QUERY_DEBOUNCE_MS = 250;

export type SearchStatus = 'idle' | 'indexing' | 'ready' | 'error';

export interface UseReaderSearchResult {
  /** The text in the search field. */
  query: string;
  setQuery: (query: string) => void;
  status: SearchStatus;
  /** Pages indexed so far while status is 'indexing'. */
  progress: { done: number; total: number };
  /** Results for the last completed search, or null when there is none. */
  results: SearchResults | null;
  currentMatch: SearchMatch | null;
  next: () => void;
  previous: () => void;
  selectMatch: (index: number) => void;
}

/**
 * Manages text search for the Reader.
 *
 * Owns query, indexing progress, results, and the current match. All text
 * extraction and matching is delegated to `searchService` (ADR-015); this
 * hook knows nothing about rendering or navigation — the caller moves to
 * `currentMatch.pageNumber`.
 *
 * @param pdfDocument - The open document, or null while loading.
 * @param currentPage - The page being read; a new search starts at the
 *   first match on or after it.
 */
export function useReaderSearch(
  pdfDocument: PDFDocumentProxy | null,
  currentPage: number,
): UseReaderSearchResult {
  const [query, setQueryState] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<SearchResults | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const pagesPromiseRef = useRef<Promise<PageText[]> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A different document invalidates everything.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      pagesPromiseRef.current = null;
      requestIdRef.current += 1;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setQueryState('');
      setStatus('idle');
      setResults(null);
      setCurrentIndex(-1);
    };
  }, [pdfDocument]);

  const runSearch = useCallback(async (rawQuery: string): Promise<void> => {
    const requestId = ++requestIdRef.current;
    const normalized = normalizeQuery(rawQuery);
    if (!normalized || !pdfDocument) {
      setStatus('idle');
      setResults(null);
      setCurrentIndex(-1);
      return;
    }

    if (!pagesPromiseRef.current) {
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('indexing');
      setProgress({ done: 0, total: pdfDocument.numPages });
      pagesPromiseRef.current = extractPageTexts(pdfDocument, {
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });
    }

    try {
      const pages = await pagesPromiseRef.current;
      if (requestId !== requestIdRef.current) return; // superseded
      const found = findMatches(pages, normalized);
      const fromPage = currentPageRef.current;
      const start = found.matches.findIndex(m => m.pageNumber >= fromPage);
      setResults(found);
      setCurrentIndex(found.matches.length === 0 ? -1 : Math.max(0, start));
      setStatus('ready');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[useReaderSearch] Search failed:', err);
      pagesPromiseRef.current = null;
      if (requestId !== requestIdRef.current) return;
      setStatus('error');
      setResults(null);
      setCurrentIndex(-1);
    }
  }, [pdfDocument]);

  const setQuery = useCallback((next: string): void => {
    setQueryState(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void runSearch(next);
    }, QUERY_DEBOUNCE_MS);
  }, [runSearch]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const count = results?.matches.length ?? 0;

  const next = useCallback((): void => {
    if (count === 0) return;
    setCurrentIndex(i => (i + 1) % count);
  }, [count]);

  const previous = useCallback((): void => {
    if (count === 0) return;
    setCurrentIndex(i => (i - 1 + count) % count);
  }, [count]);

  const selectMatch = useCallback((index: number): void => {
    if (index >= 0 && index < count) setCurrentIndex(index);
  }, [count]);

  return {
    query,
    setQuery,
    status,
    progress,
    results,
    currentMatch: results?.matches[currentIndex] ?? null,
    next,
    previous,
    selectMatch,
  };
}
