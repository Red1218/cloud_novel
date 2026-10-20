import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '@/types/book';
import { collectionPath } from '@/constants/routes';
import { deriveCollections, type Collection, type CollectionKind } from '@/features/library/utils/collections';
import { SPINE_FALLBACK, jitter, useSpineColors } from '@/components/library/BookSpines/useSpineColors';

type Filter = 'all' | CollectionKind;

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ['all', 'All'],
  ['series', 'Series'],
  ['author', 'Authors'],
  ['genre', 'Genres'],
];

const KIND_LABEL: Record<CollectionKind, string> = { series: 'Series', author: 'Author', genre: 'Genre' };

function describe(collection: Collection): string {
  const count = `${collection.books.length} ${collection.books.length === 1 ? 'book' : 'books'}`;
  if (collection.kind !== 'series') return count;
  const authors = new Set(collection.books.map((b) => b.author).filter(Boolean));
  return authors.size === 1 ? `${[...authors][0]} · ${count}` : count;
}

/**
 * The Library's Collections tab: series, authors and genres, each as a small
 * shelf of its books' spines, opening the collection's own page.
 */
export function CollectionsView({ books, onAddFirst }: { books: readonly Book[]; onAddFirst: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const collections = useMemo(() => deriveCollections(books), [books]);
  const withoutAuthor = useMemo(() => books.filter((b) => !b.author).length, [books]);
  const colors = useSpineColors(books);

  const counts: Record<Filter, number> = { all: collections.length, series: 0, author: 0, genre: 0 };
  for (const c of collections) counts[c.kind]++;
  const visible = filter === 'all' ? collections : collections.filter((c) => c.kind === filter);

  if (collections.length === 0 && withoutAuthor === 0) {
    return (
      <div className="paper-note">
        <p className="paper-note__title">No collections yet</p>
        <p>Books group by author on their own when their PDFs name one. To make a series or a genre, open a book on the Books tab and choose Collections.</p>
        <button type="button" className="pill pill--outline collections-view__first" onClick={onAddFirst}>
          Go to Books
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="spines-page__filters" role="group" aria-label="Filter collections">
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

      {(filter === 'all' || filter === 'author') && withoutAuthor > 0 && (
        <Link to={collectionPath('author', '')} className="collections-view__missing">
          <span>
            {withoutAuthor === 1 ? '1 book has' : `${withoutAuthor} books have`} no author in their PDF details
          </span>
          <span className="collections-view__missing-action">Add one</span>
        </Link>
      )}

      {visible.length === 0 ? (
        <p className="spines-page__none">
          {filter === 'series' ? 'No series yet. Open a book and choose Collections to start one.' : 'Nothing here yet.'}
        </p>
      ) : (
        <ul className="collections-view__list" role="list">
          {visible.map((collection) => (
            <li key={`${collection.kind}:${collection.name}`}>
              <Link to={collectionPath(collection.kind, collection.name)} className="collections-view__row">
                <span className="collections-view__shelf" aria-hidden="true">
                  {collection.books.slice(0, 5).map((book) => (
                    <span
                      key={book.id}
                      className="collections-view__spine"
                      style={{
                        height: 40 + Math.round(jitter(book.id) * 16),
                        background: (colors[book.id] ?? SPINE_FALLBACK).bg,
                      }}
                    />
                  ))}
                </span>
                <span className="collections-view__text">
                  <span className="collections-view__name">{collection.name}</span>
                  <span className="collections-view__meta">
                    {KIND_LABEL[collection.kind]} · {describe(collection)}
                  </span>
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
