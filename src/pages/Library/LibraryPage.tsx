import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookShelves } from '@/components/library/BookShelves/BookShelves';
import { BookSheet } from '@/components/library/BookSheet/BookSheet';
import { BookCollectionsSheet } from '@/components/library/BookCollectionsSheet/BookCollectionsSheet';
import { ImportGroupPrompt } from '@/components/library/ImportGroupSheet/ImportGroupSheet';
import { sortBooks } from '@/features/library/utils/sortBooks';
import { readState, type ReadState } from '@/features/library/utils/readingStatus';
import { DEFAULT_SHELF, deriveShelves, freeShelfName, loadShelfOrder, saveShelfOrder } from '@/features/library/utils/shelves';
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
 * Library page. Books: face-out on glass shelves the reader names and fills
 * (all on one shelf to start), filtered by reading state; a tapped book opens
 * its sheet. Collections:
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
  const [pickedId, setPickedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [shelfOrder, setShelfOrder] = useState(loadShelfOrder);
  const [editingShelf, setEditingShelf] = useState<string>();

  const ordered = useMemo(() => sortBooks(books, 'lastOpened'), [books]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: books.length, new: 0, reading: 0, finished: 0 };
    for (const book of books) c[readState(book)]++;
    return c;
  }, [books]);

  const visible = filter === 'all' ? ordered : ordered.filter((b) => readState(b) === filter);
  const allShelves = useMemo(() => deriveShelves(books, shelfOrder), [books, shelfOrder]);
  const customNames = allShelves.filter((s) => s.custom).map((s) => s.name);
  const shelves = deriveShelves(visible, shelfOrder).filter((s) => filter === 'all' || s.books.length > 0);
  const picked = books.find((b) => b.id === pickedId);
  const editing = books.find((b) => b.id === editingId);

  const saveOrder = (next: string[]) => {
    setShelfOrder(next);
    saveShelfOrder(next);
  };

  const addShelf = () => {
    const name = freeShelfName(customNames);
    saveOrder([...customNames, name]);
    setEditingShelf(name);
  };

  const moveBook = (id: string, name: string | null) => {
    const shelf = name?.toLowerCase() === DEFAULT_SHELF.toLowerCase() ? null : name;
    if (shelf && !customNames.some((n) => n.toLowerCase() === shelf.toLowerCase())) {
      saveOrder([...customNames, shelf]);
    }
    const existing = customNames.find((n) => n.toLowerCase() === shelf?.toLowerCase()) ?? shelf;
    void library.updateCollections(id, { shelf: existing });
  };

  const renameShelf = (from: string, to: string) => {
    const name = to.trim();
    setEditingShelf(undefined);
    const taken = [DEFAULT_SHELF, ...customNames.filter((n) => n !== from)].some((n) => n.toLowerCase() === name.toLowerCase());
    if (!name || name === from || taken) return;
    saveOrder(customNames.map((n) => (n === from ? name : n)));
    void library.applyCollectionUpdates(
      books.filter((b) => b.shelf === from).map((b) => ({ id: b.id, update: { shelf: name } }))
    );
  };

  const deleteShelf = (name: string) => {
    setEditingShelf(undefined);
    saveOrder(customNames.filter((n) => n !== name));
    void library.applyCollectionUpdates(
      books.filter((b) => b.shelf === name).map((b) => ({ id: b.id, update: { shelf: null } }))
    );
  };

  const setView = (next: 'books' | 'collections') =>
    setParams(next === 'collections' ? { view: 'collections' } : {}, { replace: true });

  return (
    <div className="spines-page paper-page">
      <header className="library-hero">
        <p className="library-hero__eyebrow">My favourite</p>
        <h1 className="library-hero__title">Books</h1>
        {!isLoading && (
          <p className="library-hero__meta">
            {counts.all} {counts.all === 1 ? 'book' : 'books'} · {allShelves.length} {allShelves.length === 1 ? 'shelf' : 'shelves'} · {counts.reading} reading
          </p>
        )}
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

              {visible.length === 0 ? (
                <p className="spines-page__none">No books here yet.</p>
              ) : (
                <BookShelves
                  shelves={shelves}
                  editing={editingShelf}
                  onEdit={setEditingShelf}
                  onRename={renameShelf}
                  onDelete={deleteShelf}
                  onPick={setPickedId}
                />
              )}
              {filter === 'all' && (
                <button type="button" className="pill library-hero__new-shelf" onClick={addShelf}>
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New shelf
                </button>
              )}
            </>
          )}
        </>
      )}

      {picked && !editing && (
        <BookSheet
          key={picked.id}
          book={picked}
          shelfNames={[DEFAULT_SHELF, ...customNames]}
          onOpen={() => navigate(`${ROUTES.READER}/${picked.id}`)}
          onEditCollections={() => setEditingId(picked.id)}
          onMove={(shelf) => moveBook(picked.id, shelf)}
          onClose={() => setPickedId(undefined)}
        />
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
