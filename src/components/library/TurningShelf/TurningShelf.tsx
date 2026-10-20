import type { CSSProperties } from 'react';
import type { Book } from '@/types/book';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { SPINE_FALLBACK, jitter, useSpineColors } from '@/components/library/BookSpines/useSpineColors';
import './TurningShelf.css';

/** Spine and cover widths; the open book's slot grows from one to the other. */
const SPINE = 34;
const COVER = 132;

export interface TurningShelfProps {
  books: readonly Book[];
  openId: string;
  onOpen: (bookId: string) => void;
}

/**
 * A short shelf of spines where one book at a time turns in 3D to show its
 * cover. Tap, hover or focus a spine to turn it out; the previous one turns
 * back. With reduced motion the switch is instant.
 */
export function TurningShelf({ books, openId, onOpen }: TurningShelfProps) {
  const colors = useSpineColors(books);
  const openIndex = Math.max(0, books.findIndex((b) => b.id === openId));

  return (
    <div
      className="turning-shelf"
      role="group"
      aria-label="Books you are reading"
      style={{ '--spine': `${SPINE}px`, '--cover': `${COVER}px` } as CSSProperties}
    >
      {books.map((book, i) => {
        const color = colors[book.id] ?? SPINE_FALLBACK;
        const open = i === openIndex;
        const lastName = book.author?.trim().split(/\s+/).pop();
        return (
          <button
            key={book.id}
            type="button"
            className="turning-shelf__slot"
            data-open={open}
            data-side={i < openIndex ? 'left' : 'right'}
            aria-pressed={open}
            aria-label={book.author ? `${book.title}, ${book.author}` : book.title}
            onClick={() => onOpen(book.id)}
            onMouseEnter={() => onOpen(book.id)}
            onFocus={() => onOpen(book.id)}
            style={{ height: Math.round(184 + jitter(book.id) * 18) }}
          >
            <span className="turning-shelf__stage">
              <span className="turning-shelf__box">
                <span className="turning-shelf__pages" aria-hidden="true" />
                <span className="turning-shelf__spine" style={{ background: color.bg, color: color.fg }}>
                  <span className="turning-shelf__band" aria-hidden="true" />
                  <span className="turning-shelf__spine-title">{book.title}</span>
                  {lastName && <span className="turning-shelf__spine-author">{lastName}</span>}
                </span>
                <span className="turning-shelf__cover" style={{ background: color.bg }}>
                  <BookCover src={book.thumbnail} title={book.title} />
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
