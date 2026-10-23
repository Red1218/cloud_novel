import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookShelves } from '@/components/library/BookShelves/BookShelves';
import { BookSheet } from '@/components/library/BookSheet/BookSheet';
import { BookCollectionsSheet } from '@/components/library/BookCollectionsSheet/BookCollectionsSheet';
import { ProfileButton } from '@/components/layout/ProfileButton/ProfileButton';
import { ImportGroupPrompt } from '@/components/library/ImportGroupSheet/ImportGroupSheet';
import { sortBooks } from '@/features/library/utils/sortBooks';
import { readState, type ReadState } from '@/features/library/utils/readingStatus';
import { DEFAULT_SHELF, deriveShelves, freeShelfName, loadShelfOrder, saveShelfOrder } from '@/features/library/utils/shelves';
import { deriveCollections, type CollectionKind } from '@/features/library/utils/collections';
import { CollectionsView } from './CollectionsView';

import './LibraryPage.css';

type Filter = 'all' | ReadState;

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ['all', 'All'],
  ['reading', 'Reading'],
  ['new', 'New'],
  ['finished', 'Finished'],
];

const KINDS: ReadonlyArray<[CollectionKind, string]> = [
  ['series', 'Series'],
  ['author', 'Authors'],
  ['genre', 'Genres'],
];

const isKind = (v: string | null): v is CollectionKind => v === 'series' || v === 'author' || v === 'genre';

/**
 * Library page: a one-row header, then one scrolling row of chips. The
 * reading-state chips show books face-out on glass shelves the reader names
 * and fills (all on one shelf to start); a tapped book opens its sheet. The
 * Series, Authors and Genres chips list collections (?view=series etc., so
 * Back returns to it).
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const viewParam = params.get('view');
  // ?view=collections is the old link to the collections tab
  const kind: CollectionKind | undefined = viewParam === 'collections' ? 'series' : isKind(viewParam) ? viewParam : undefined;
  const library = useLibrary();
  const { books, isLoading, isImporting, importBooks } = library;
  const [filter, setFilter] = useState<Filter>('all');
  // Home's Details opens a book's sheet here (?book=id); closing it goes back.
  const fromHome = params.get('book') ?? undefined;
  const [pickedId, setPickedId] = useState(fromHome);
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
  const collections = useMemo(() => deriveCollections(books), [books]);
  const chipsRef = useRef<HTMLDivElement>(null);

  // Keep the selected chip in sight (Series and the rest start off-screen).
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && chip) row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2 });
  }, [kind, filter, books.length]);
  const kindCounts: Record<CollectionKind, number> = { series: 0, author: 0, genre: 0 };
  for (const c of collections) kindCounts[c.kind]++;

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

  const showBooks = (next: Filter) => {
    setFilter(next);
    if (kind) setParams({}, { replace: true });
  };
  const showKind = (next: CollectionKind) => setParams({ view: next }, { replace: true });

  return (
    <div className="spines-page paper-page">
      <header className="library-hero">
        <div className="library-hero__text">
          <h1 className="library-hero__title">Library</h1>
          {!isLoading && (
            <p className="library-hero__meta">
              {counts.all} {counts.all === 1 ? 'book' : 'books'}, {counts.reading} reading
            </p>
          )}
        </div>
        <div className="library-hero__actions">
          <ProfileButton />
          <button
            type="button"
            className="pill pill--filled library-hero__import"
            onClick={importBooks}
            disabled={isImporting}
              title="Import PDFs"
          >
            {isImporting ? 'Importing…' : 'Import'}
          </button>
        </div>
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on the shelf yet</p>
          <p>Tap + to import a PDF. It stays on this device, and your page, zoom and bookmarks are remembered for every book.</p>
        </div>
      )}

      {books.length > 0 && (
        <>
          <div ref={chipsRef} className="spines-page__filters" role="group" aria-label="Show">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="pill spines-page__chip"
                aria-pressed={!kind && filter === id}
                onClick={() => showBooks(id)}
              >
                {label} <span className="spines-page__chip-count">{counts[id]}</span>
              </button>
            ))}
            <span className="spines-page__chip-divider" aria-hidden="true" />
            {KINDS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="pill spines-page__chip"
                aria-pressed={kind === id}
                onClick={() => showKind(id)}
              >
                {label} <span className="spines-page__chip-count">{kindCounts[id]}</span>
              </button>
            ))}
          </div>

          {kind ? (
            <CollectionsView books={books} collections={collections.filter((c) => c.kind === kind)} kind={kind} />
          ) : (
            <>
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
                <button type="button" className="pill pill--outline library-hero__new-shelf" onClick={addShelf}>
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
          onClose={() => (picked.id === fromHome ? navigate(-1) : setPickedId(undefined))}
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
