import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '@/types/book';
import { collectionPath } from '@/constants/routes';
import { BookCover } from '@/components/library/BookCover/BookCover';
import type { Collection, CollectionKind } from '@/features/library/utils/collections';

const EMPTY: Record<CollectionKind, string> = {
  series: 'No series yet. Tap a book, choose Collections, and give it a series.',
  author: 'No authors yet. Books group by author on their own when their PDFs name one.',
  genre: 'No genres yet. Tap a book, choose Collections, and add a genre.',
};

function describe(collection: Collection): string {
  const count = `${collection.books.length} ${collection.books.length === 1 ? 'book' : 'books'}`;
  if (collection.kind !== 'series') return count;
  const authors = new Set(collection.books.map((b) => b.author).filter(Boolean));
  return authors.size === 1 ? `${[...authors][0]}, ${count}` : count;
}

export interface CollectionsViewProps {
  books: readonly Book[];
  /** The collections of `kind` to list. */
  collections: readonly Collection[];
  kind: CollectionKind;
}

/**
 * The Library's Series, Authors or Genres list: each collection as a few of
 * its covers on a small glass band, opening the collection's own page.
 */
export function CollectionsView({ books, collections, kind }: CollectionsViewProps) {
  const withoutAuthor = useMemo(() => books.filter((b) => !b.author).length, [books]);

  return (
    <>
      {kind === 'author' && withoutAuthor > 0 && (
        <Link to={collectionPath('author', '')} className="collections-view__missing">
          <span>
            {withoutAuthor === 1 ? '1 book has' : `${withoutAuthor} books have`} no author in their PDF details
          </span>
          <span className="collections-view__missing-action">Add one</span>
        </Link>
      )}

      {collections.length === 0 ? (
        <p className="spines-page__none">{EMPTY[kind]}</p>
      ) : (
        <ul className="collections-view__list" role="list">
          {collections.map((collection, i) => (
            <li key={collection.name}>
              <Link to={collectionPath(collection.kind, collection.name)} className="collections-view__row">
                <span
                  className="collections-view__shelf"
                  aria-hidden="true"
                  style={{ '--shelf-color': `var(--shelf-${(i % 3) + 1})` } as CSSProperties}
                >
                  {collection.books.slice(0, 3).map((book) => (
                    <span key={book.id} className="collections-view__cover">
                      <BookCover src={book.thumbnail} title={book.title} />
                    </span>
                  ))}
                  <span className="glass-shelf" />
                </span>
                <span className="collections-view__text">
                  <span className="collections-view__name">{collection.name}</span>
                  <span className="collections-view__meta">{describe(collection)}</span>
                </span>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
