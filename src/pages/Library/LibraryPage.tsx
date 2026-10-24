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
import { readState, statusText, upNext, type ReadState } from '@/features/library/utils/readingStatus';
import { BookCover } from '@/components/library/BookCover/BookCover';
import type { Book } from '@/types/book';
import { DEFAULT_SHELF, deriveShelves, freeShelfName, loadShelfOrder, saveShelfOrder } from '@/features/library/utils/shelves';
import { deriveCollections, type CollectionKind } from '@/features/library/utils/collections';
import { CollectionsView } from './CollectionsView';

import './LibraryPage.css';

/** Reading states, plus the reader's plans: Up next and Not now. */
type Filter = 'all' | ReadState | 'next' | 'later';

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ['all', 'All'],
  ['next', 'Up next'],
  ['reading', 'Reading'],
  ['new', 'New'],
  ['finished', 'Finished'],
  ['later', 'Not now'],
];

const KINDS: ReadonlyArray<[CollectionKind, string]> = [
  ['series', 'Series'],
  ['author', 'Authors'],
  ['genre', 'Genres'],
];

const isKind = (v: string | null): v is CollectionKind => v === 'series' || v === 'author' || v === 'genre';

/**
 * Library page: a one-row header, then one scrolling row of chips. The
 * reading-state chips show books spine-out in a white bookcase, on shelves the reader names
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
  const [chosenFilter, setFilter] = useState<Filter>('all');
  // Home's Details opens a book's sheet here (?book=id); closing it goes back.
  const fromHome = params.get('book') ?? undefined;
  const [pickedId, setPickedId] = useState(fromHome);
  const [editingId, setEditingId] = useState<string>();
  const [shelfOrder, setShelfOrder] = useState(loadShelfOrder);
  const [editingShelf, setEditingShelf] = useState<string>();

  const ordered = useMemo(() => sortBooks(books, 'lastOpened'), [books]);
  // Set-aside books leave the shelves and every count but their own.
  const onShelves = useMemo(() => ordered.filter((b) => b.intent !== 'later'), [ordered]);
  const setAside = useMemo(() => ordered.filter((b) => b.intent === 'later'), [ordered]);
  const queue = useMemo(() => upNext(books), [books]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: onShelves.length, new: 0, reading: 0, finished: 0, next: queue.length, later: setAside.length };
    for (const book of onShelves) c[readState(book)]++;
    return c;
  }, [onShelves, queue, setAside]);
  // Up next and Not now chips only exist while they hold books.
  const shown = (id: Filter) => (id !== 'next' && id !== 'later') || counts[id] > 0;
  const filter = shown(chosenFilter) ? chosenFilter : 'all';

  const visible = filter === 'all' ? onShelves : onShelves.filter((b) => readState(b) === filter);
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
            {FILTERS.filter(([id]) => shown(id)).map(([id, label]) => (
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
          ) : filter === 'next' ? (
            <PlanList
              books={queue}
              numbered
              note="These also fill Home's Reading now shelf after the books you're in the middle of."
              onPick={setPickedId}
            />
          ) : filter === 'later' ? (
            <PlanList
              books={setAside}
              intro="Set aside for now. Opening one brings it back."
              onPick={setPickedId}
              onBringBack={(id) => library.updateCollections(id, { intent: null })}
            />
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
              {filter === 'all' && setAside.length > 0 && (
                <p className="plan-aside">
                  {setAside.length === 1 ? '1 book' : `${setAside.length} books`} set aside for now
                  <button type="button" className="plan-aside__show" onClick={() => showBooks('later')}>Show</button>
                </p>
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
          onIntent={(intent) => library.updateCollections(picked.id, { intent })}
          onRename={(title) => library.updateCollections(picked.id, { title })}
          onRemove={() => {
            void library.removeBook(picked.id);
            setPickedId(undefined);
          }}
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

interface PlanListProps {
  books: readonly Book[];
  /** Up next shows each book's place in the queue. */
  numbered?: boolean;
  intro?: string;
  note?: string;
  onPick: (id: string) => void;
  /** Not now: clears the mark so the book returns to the shelves. */
  onBringBack?: (id: string) => void;
}

/** The Up next queue or the set-aside books, as rows of cards. */
function PlanList({ books, numbered, intro, note, onPick, onBringBack }: PlanListProps) {
  return (
    <>
      {intro && <p className="plan-list__text">{intro}</p>}
      <ol className="plan-list" role="list">
        {books.map((book, i) => (
          <li key={book.id} className="plan-row">
            <button type="button" className="plan-row__open" onClick={() => onPick(book.id)}>
              {numbered && <span className="plan-row__number">{i + 1}</span>}
              <span className="plan-row__cover">
                <BookCover src={book.thumbnail} title={book.title} />
              </span>
              <span className="plan-row__text">
                <span className="plan-row__title">{book.title}</span>
                <span className="plan-row__meta">
                  {[book.author, readState(book) === 'new' ? 'not started' : statusText(book).toLowerCase()].filter(Boolean).join(', ')}
                </span>
              </span>
            </button>
            {onBringBack && (
              <button type="button" className="pill pill--outline plan-row__back" onClick={() => onBringBack(book.id)}>
                Bring back
              </button>
            )}
          </li>
        ))}
      </ol>
      {note && <p className="plan-list__text">{note}</p>}
    </>
  );
}
