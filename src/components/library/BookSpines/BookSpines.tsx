import type { Book } from '@/types/book';
import { SPINE_FALLBACK, jitter, useSpineColors } from './useSpineColors';
import './BookSpines.css';

export interface BookSpinesProps {
  books: readonly Book[];
  selectedId?: string;
  onSelect: (bookId: string) => void;
}

/**
 * Books seen spine-out on one shelf. Width follows page count, colour comes
 * from the cover; the selected book is pulled forward.
 */
export function BookSpines({ books, selectedId, onSelect }: BookSpinesProps) {
  const colors = useSpineColors(books);

  return (
    <div className="book-spines" role="group" aria-label="Books">
      {books.map((book) => {
        const color = colors[book.id] ?? SPINE_FALLBACK;
        const width = Math.round(Math.min(48, Math.max(26, 20 + book.pageCount / 10)));
        const height = Math.round(200 + jitter(book.id) * 50);
        const lastName = book.author?.trim().split(/\s+/).pop();
        return (
          <button
            key={book.id}
            type="button"
            className="book-spines__spine"
            aria-pressed={book.id === selectedId}
            aria-label={book.author ? `${book.title}, ${book.author}` : book.title}
            onClick={() => onSelect(book.id)}
            style={{ width, height, background: color.bg, color: color.fg }}
          >
            <span className="book-spines__band" aria-hidden="true" />
            <span className="book-spines__title" style={{ fontSize: width >= 32 ? 14 : 12 }}>
              {book.title}
            </span>
            {lastName && <span className="book-spines__author">{lastName}</span>}
          </button>
        );
      })}
    </div>
  );
}
