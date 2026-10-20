import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Book } from '@/types/book';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { BookSpines } from '@/components/library/BookSpines/BookSpines';
import { BookCollectionsSheet } from '@/components/library/BookCollectionsSheet/BookCollectionsSheet';
import { ImportGroupPrompt } from '@/components/library/ImportGroupSheet/ImportGroupSheet';
import { sortBooks } from '@/features/library/utils/sortBooks';
import { openLabel, readState, statusText, type ReadState } from '@/features/library/utils/readingStatus';
import { CollectionsView } from './CollectionsView';

import './LibraryPage.css';

type Filter = 'all' | ReadState;

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ['all', 'All'],
  ['reading', 'Reading'],
  ['new', 'New'],
  ['finished', 'Finished'],
];

/**
 * Library page. Books: every book spine-out on one shelf, filtered by
 * reading state, the selected spine opening a detail panel. Collections:
 * series, authors and genres (?view=collections, so Back returns to it).
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'collections' ? 'collections' : 'books';
  const library = useLibrary();
  const { books, isLoading, isImporting, importBooks } = library;
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();

  const ordered = useMemo(() => sortBooks(books, 'lastOpened'), [books]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: books.length, new: 0, reading: 0, finished: 0 };
    for (const book of books) c[readState(book)]++;
    return c;
  }, [books]);

  const visible = filter === 'all' ? ordered : ordered.filter((b) => readState(b) === filter);
  const selected = visible.find((b) => b.id === selectedId) ?? visible[0];
  const editing = books.find((b) => b.id === editingId);

  const setView = (next: 'books' | 'collections') =>
    setParams(next === 'collections' ? { view: 'collections' } : {}, { replace: true });

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
        <button type="button" className="pill pill--outline" onClick={importBooks} disabled={isImporting}>
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isImporting ? 'Importing…' : 'Import'}
        </button>
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on the shelf yet</p>
          <p>Import a PDF and it stays on this device. Your page, zoom and bookmarks are remembered for every book.</p>
        </div>
      )}

      {books.length > 0 && (
        <>
          <div className="spines-page__views" role="tablist" aria-label="Library view">
            {(['books', 'collections'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                className="spines-page__view"
                onClick={() => setView(id)}
              >
                {id === 'books' ? 'Books' : 'Collections'}
              </button>
            ))}
          </div>

          {view === 'collections' ? (
            <CollectionsView books={books} onAddFirst={() => setView('books')} />
          ) : (
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
                <BookDetail
                  book={selected}
                  onOpen={() => navigate(`${ROUTES.READER}/${selected.id}`)}
                  onEditCollections={() => setEditingId(selected.id)}
                />
              ) : (
                <p className="spines-page__none">No books here yet.</p>
              )}
            </>
          )}
        </>
      )}

      {editing && (
        <BookCollectionsSheet
          key={editing.id}
          book={editing}
          books={books}
          onSave={(update) => library.updateCollections(editing.id, update)}
          onClose={() => setEditingId(undefined)}
        />
      )}

      <ImportGroupPrompt
        books={books}
        lastImportedIds={library.lastImportedIds}
        onApply={library.applyCollectionUpdates}
        onClose={library.clearLastImported}
      />
    </div>
  );
}

function BookDetail({ book, onOpen, onEditCollections }: { book: Book; onOpen: () => void; onEditCollections: () => void }) {
  const progress = Math.round(book.progress);
  const memberships = [
    book.series && `${book.series.name} #${book.series.number}`,
    ...(book.genres ?? []),
  ].filter(Boolean);

  return (
    <section className="spines-page__detail" aria-label="Selected book">
      <div className="spines-page__cover">
        <BookCover src={book.thumbnail} title={book.title} />
      </div>
      <div className="spines-page__info">
        <h2 className="spines-page__book-title">{book.title}</h2>
        {book.author && <p className="spines-page__author">{book.author}</p>}
        {memberships.length > 0 && <p className="spines-page__memberships">{memberships.join(' · ')}</p>}
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
          <span className="paper-progress__label">{statusText(book)}</span>
        </div>
        <div className="spines-page__actions">
          <button type="button" className="pill pill--filled spines-page__open" onClick={onOpen}>
            {openLabel(book)}
          </button>
          <button type="button" className="pill pill--outline" onClick={onEditCollections}>
            Collections
          </button>
        </div>
      </div>
    </section>
  );
}
