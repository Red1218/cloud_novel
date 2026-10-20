import type { ReactNode } from 'react';
import type { Book } from '@/types/book';
import { BookCover } from '@/components/library/BookCover/BookCover';
import './BookShelves.css';

export interface ShelfRailProps {
  books: readonly Book[];
  /** Names the row for the scroll arrows' labels. */
  label: string;
  onPick: (bookId: string) => void;
  /** Shown in place of covers when there are no books. */
  empty?: ReactNode;
}

/**
 * One full-width row of face-out covers on a glass band in --shelf-color,
 * scrolling sideways (arrows only for mouse and trackpad). Used by the
 * Library's shelves, Home and collection pages.
 */
export function ShelfRail({ books, label, onPick, empty }: ShelfRailProps) {
  return (
    <div className="shelf__rail">
      <div className="shelf__row">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            className="shelf__book"
            aria-label={book.author ? `${book.title}, ${book.author}` : book.title}
            onClick={() => onPick(book.id)}
          >
            <BookCover src={book.thumbnail} title={book.title} />
          </button>
        ))}
        {books.length === 0 && empty && <p className="shelf__empty">{empty}</p>}
      </div>
      <span className="glass-shelf" aria-hidden="true" />
      {books.length > 1 &&
        ([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            className={`shelf__arrow shelf__arrow--${dir < 0 ? 'prev' : 'next'}`}
            aria-label={dir < 0 ? `Scroll ${label} back` : `Scroll ${label} on`}
            onClick={(e) => {
              const row = e.currentTarget.parentElement?.querySelector('.shelf__row');
              row?.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: 'smooth' });
            }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={dir < 0 ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
            </svg>
          </button>
        ))}
    </div>
  );
}
