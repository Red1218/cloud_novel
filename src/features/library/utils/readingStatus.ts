import type { Book } from '@/types/book';

export type ReadState = 'new' | 'reading' | 'finished';

export function readState(book: Book): ReadState {
  if (book.progress >= 100) return 'finished';
  return book.progress > 0 ? 'reading' : 'new';
}

/** "Not started · 212 pages", "Page 7 of 212", "Finished · 212 pages" */
export function statusText(book: Book): string {
  const pages = `${book.pageCount} ${book.pageCount === 1 ? 'page' : 'pages'}`;
  const state = readState(book);
  if (state === 'new') return `Not started · ${pages}`;
  if (state === 'finished') return `Finished · ${pages}`;
  return `Page ${book.currentPage ?? 1} of ${book.pageCount}`;
}

/** The label of the button that opens the book. */
export function openLabel(book: Book): string {
  const state = readState(book);
  return state === 'new' ? 'Start reading' : state === 'finished' ? 'Read again' : 'Continue reading';
}
