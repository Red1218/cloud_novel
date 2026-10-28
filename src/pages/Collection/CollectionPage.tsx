import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { ShelfRail } from '@/components/library/BookShelves/ShelfRail';
import { BookCollectionsSheet } from '@/components/library/BookCollectionsSheet/BookCollectionsSheet';
import { findCollection, titleInSeries, type CollectionKind } from '@/features/library/utils/collections';
import { readState, statusText } from '@/features/library/utils/readingStatus';
import './CollectionPage.css';

const KIND_LABEL: Record<CollectionKind, string> = { series: 'Series', author: 'Author', genre: 'Genre' };
const isKind = (k: string | undefined): k is CollectionKind => k === 'series' || k === 'author' || k === 'genre';

type Order = 'number' | 'added';

/**
 * One series, author or genre: its books face-out in the white bookcase and in a
 * list; tapping either opens the book. A series
 * reads in book-number order (switchable to date added) and offers to
 * continue with the next unfinished book.
 */
export function CollectionPage() {
  const { kind, name = '' } = useParams();
  const navigate = useNavigate();
  const library = useLibrary();
  const { books, isLoading } = library;
  const [order, setOrder] = useState<Order>('number');
  const [editingId, setEditingId] = useState<string>();

  const collection = useMemo(
    () => (isKind(kind) ? findCollection(books, kind, name) : undefined),
    [books, kind, name]
  );
  const title = name || 'No author';
  useDocumentTitle(title);

  const isSeries = collection?.kind === 'series';
  const ordered = useMemo(() => {
    if (!collection) return [];
    return isSeries && order === 'added'
      ? [...collection.books].sort((a, b) => a.importedAt - b.importedAt)
      : collection.books;
  }, [collection, isSeries, order]);

  const next = isSeries
    ? ordered.find((b) => readState(b) === 'reading') ?? ordered.find((b) => readState(b) !== 'finished')
    : undefined;
  const editing = books.find((b) => b.id === editingId);
  const open = (id: string) => navigate(`${ROUTES.READER}/${id}`);

  const back = (
    <Link to={`${ROUTES.LIBRARY}?view=${isKind(kind) ? kind : 'series'}`} className="collection__back" aria-label="Back to the library">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      Library
    </Link>
  );

  if (isLoading) return <div className="collection paper-page">{back}</div>;

  if (!collection) {
    return (
      <div className="collection paper-page">
        {back}
        <div className="paper-note">
          <p className="paper-note__title">Nothing in “{title}” now</p>
          <p>Its books may have moved to another collection.</p>
        </div>
      </div>
    );
  }

  const authors = new Set(collection.books.map((b) => b.author).filter(Boolean));
  const count = `${collection.books.length} ${collection.books.length === 1 ? 'book' : 'books'}`;
  const meta = isSeries && authors.size === 1 ? `${[...authors][0]}, ${count}` : count;

  return (
    <div className="collection paper-page">
      {back}

      <p className="paper-eyebrow collection__kind">{KIND_LABEL[collection.kind]}</p>
      <h1 className="paper-title collection__title">{title}</h1>
      <p className="paper-meta">{meta}</p>

      <div className="collection__shelf bookcase">
        <ShelfRail books={ordered} name={title} onPick={open} />
      </div>

      {isSeries && (
        <div className="collection__order">
          <span id="order-label" className="paper-eyebrow">Reading order</span>
          <div className="collection__order-switch" role="group" aria-labelledby="order-label">
            {(['number', 'added'] as const).map((o) => (
              <button key={o} type="button" aria-pressed={order === o} onClick={() => setOrder(o)}>
                {o === 'number' ? 'Book number' : 'Date added'}
              </button>
            ))}
          </div>
        </div>
      )}

      <ol className="collection__list" role="list">
        {ordered.map((book) => (
          <li key={book.id} className="collection__item">
            {isSeries && (
              <span className={`collection__number${book.id === next?.id ? ' collection__number--next' : ''}`} aria-hidden="true">
                {book.series?.number}
              </span>
            )}
            <button type="button" className="collection__book" onClick={() => open(book.id)}>
              <span className="collection__book-title">{isSeries ? titleInSeries(book) : book.title}</span>
              <span className="collection__book-status">
                {isSeries || !book.author || collection.kind === 'author' ? statusText(book) : `${book.author}, ${statusText(book)}`}
              </span>
            </button>
            <button
              type="button"
              className="collection__edit"
              aria-label={`Collections for ${book.title}`}
              title="Collections"
              onClick={() => setEditingId(book.id)}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
              </svg>
            </button>
          </li>
        ))}
      </ol>

      {isSeries && order === 'number' && (
        <p className="collection__hint">To change the order, edit a book and set its book number.</p>
      )}

      {next && (
        <button type="button" className="pill pill--filled collection__continue" onClick={() => open(next.id)}>
          {readState(next) === 'reading' ? 'Continue' : 'Start'} book {next.series?.number}: {titleInSeries(next)}
        </button>
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
    </div>
  );
}
