import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '@/types/book';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { BookSpines } from '@/components/library/BookSpines/BookSpines';
import { sortBooks } from '@/features/library/utils/sortBooks';

import './LibraryPage.css';

type ReadState = 'new' | 'reading' | 'finished';
type Filter = 'all' | ReadState;

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ['all', 'All'],
  ['reading', 'Reading'],
  ['new', 'New'],
  ['finished', 'Finished'],
];

function readState(book: Book): ReadState {
  if (book.progress >= 100) return 'finished';
  return book.progress > 0 ? 'reading' : 'new';
}

/**
 * Library page: every book spine-out on one shelf, filtered by reading
 * state; the selected spine opens a detail panel below.
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  const navigate = useNavigate();
  const { books, isLoading, isImporting, importBook } = useLibrary();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string>();

  const ordered = useMemo(() => sortBooks(books, 'lastOpened'), [books]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: books.length, new: 0, reading: 0, finished: 0 };
    for (const book of books) c[readState(book)]++;
    return c;
  }, [books]);

  const visible = filter === 'all' ? ordered : ordered.filter((b) => readState(b) === filter);
  const selected = visible.find((b) => b.id === selectedId) ?? visible[0];

  const importButton = (
    <button type="button" className="pill pill--outline" onClick={importBook} disabled={isImporting}>
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {isImporting ? 'Importing…' : 'Import'}
    </button>
  );

  return (
    <div className="spines-page paper-page">
      <header className="paper-header">
        <div>
          <h1 className="paper-title">Library</h1>
          {!isLoading && (
            <p className="paper-meta">
              {counts.all} {counts.all === 1 ? 'book' : 'books'} · {counts.reading} reading · {counts.finished} finished
            </p>
          )}
        </div>
        {importButton}
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on the shelf yet</p>
          <p>Import a PDF and it stays on this device. Your page, zoom and bookmarks are remembered for every book.</p>
        </div>
      )}

      {books.length > 0 && (
        <>
          <div className="spines-page__filters" role="group" aria-label="Filter books">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="pill spines-page__chip"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label} <span className="spines-page__chip-count">{counts[id]}</span>
              </button>
            ))}
          </div>

          <BookSpines books={visible} selectedId={selected?.id} onSelect={setSelectedId} />

          {selected ? (
            <BookDetail book={selected} onOpen={() => navigate(`${ROUTES.READER}/${selected.id}`)} />
          ) : (
            <p className="spines-page__none">No books here yet.</p>
          )}
        </>
      )}
    </div>
  );
}

function BookDetail({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const state = readState(book);
  const progress = Math.round(book.progress);
  const pages = `${book.pageCount} ${book.pageCount === 1 ? 'page' : 'pages'}`;
  const status =
    state === 'new' ? `Not started · ${pages}`
    : state === 'finished' ? `Finished · ${pages}`
    : `Page ${book.currentPage ?? 1} of ${book.pageCount}`;
  const action = state === 'new' ? 'Start reading' : state === 'finished' ? 'Read again' : 'Continue reading';

  return (
    <section className="spines-page__detail" aria-label="Selected book">
      <div className="spines-page__cover">
        <BookCover src={book.thumbnail} title={book.title} />
      </div>
      <div className="spines-page__info">
        <h2 className="spines-page__book-title">{book.title}</h2>
        {book.author && <p className="spines-page__author">{book.author}</p>}
        <div className="paper-progress spines-page__progress">
          <div
            className="paper-progress__bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Reading progress: ${progress}%`}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
          <span className="paper-progress__label">{status}</span>
        </div>
        <button type="button" className="pill pill--filled spines-page__open" onClick={onOpen}>
          {action}
        </button>
      </div>
    </section>
  );
}
