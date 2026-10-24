import type { ReactNode } from 'react';
import type { Book } from '@/types/book';
import { BookCover } from '@/components/library/BookCover/BookCover';
import './BookShelves.css';

export interface ShelfRailProps {
  books: readonly Book[];
  onPick: (bookId: string) => void;
  /** Names the shelf for the scroll arrows' labels. */
  name: string;
  /** The pill centred on the plank. */
  label?: ReactNode;
  /** Shown in the bay when there are no books. */
  empty?: ReactNode;
}

/**
 * One shelf of a white bookcase: covers stand on a fixed plank and scroll
 * sideways above it (arrows only for mouse and trackpad). Goes inside a
 * `.bookcase`. Used by the Library and collection pages.
 */
export function ShelfRail({ books, onPick, name, label, empty }: ShelfRailProps) {
  return (
    <div className="case-shelf">
      <div className="case-bay">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            className="case-cover"
            aria-label={[book.title, book.author, book.intent === 'next' && 'up next'].filter(Boolean).join(', ')}
            onClick={() => onPick(book.id)}
          >
            <BookCover src={book.thumbnail} title={book.title} />
            {book.intent === 'next' && <span className="case-cover__tag">Up next</span>}
          </button>
        ))}
        {books.length === 0 && <p className="case-bay__empty">{empty}</p>}
      </div>
      <div className="case-board">{label}</div>
      {books.length > 1 &&
        ([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            className={`case-arrow case-arrow--${dir < 0 ? 'prev' : 'next'}`}
            aria-label={dir < 0 ? `Scroll ${name} back` : `Scroll ${name} on`}
            onClick={(e) => {
              const bay = e.currentTarget.parentElement?.querySelector('.case-bay');
              bay?.scrollBy({ left: dir * bay.clientWidth * 0.8, behavior: 'smooth' });
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
