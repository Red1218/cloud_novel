import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Book } from '@/types/book';
import { SPINE_FALLBACK, jitter, useSpineColors, type SpineColor } from '@/components/library/BookSpines/useSpineColors';
import { packPlanks, spineWidth } from '@/features/library/utils/planks';
import './BookShelves.css';

export interface ShelfRailProps {
  books: readonly Book[];
  onPick: (bookId: string) => void;
  /** The pill centred on the shelf's first plank. */
  label?: ReactNode;
  /** Shown in an empty bay when there are no books. */
  empty?: ReactNode;
}

/** Bay padding, 6px a side. */
const BAY_PAD = 12;

const lastName = (author?: string) => author?.trim().split(/\s+/).pop() ?? '';
const spineLabel = (book: Book) => [book.title, book.author, book.intent === 'next' && 'up next'].filter(Boolean).join(', ');
const paint = (c: SpineColor | undefined) => ({ backgroundColor: (c ?? SPINE_FALLBACK).bg, color: (c ?? SPINE_FALLBACK).fg });

/**
 * One shelf of a white bookcase: books stand spine-out on planks and wrap
 * onto the next plank when one is full. A full plank's last book leans, the
 * last plank ends with a bookend, and a roomy last plank lays its last two
 * books flat. Goes inside a `.bookcase`. Used by the Library and collection
 * pages.
 */
export function ShelfRail({ books, onPick, label, empty }: ShelfRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(330 - BAY_PAD);
  const colors = useSpineColors(books);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setRoom(el.clientWidth - BAY_PAD);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { planks, stack } = packPlanks(books.map((b) => spineWidth(b.pageCount)), room);
  const lastPlank = planks.length - 1;

  return (
    <div ref={ref} className="case-shelf">
      {planks.map((plank, p) => (
        <div key={p} className="case-plank">
          <div className="case-bay">
            {books.length === 0 && <p className="case-bay__empty">{empty}</p>}
            {plank.books.map((i, n) => {
              const book = books[i];
              return (
                <button
                  key={book.id}
                  type="button"
                  className="case-spine"
                  data-next={book.intent === 'next' || undefined}
                  data-lean={(plank.lean && n === plank.books.length - 1) || undefined}
                  aria-label={spineLabel(book)}
                  style={{ ...paint(colors[book.id]), width: spineWidth(book.pageCount), height: Math.round(134 + jitter(book.id) * 32) }}
                  onClick={() => onPick(book.id)}
                >
                  <span className="case-spine__title">{book.title}</span>
                  <span className="case-spine__author">{lastName(book.author)}</span>
                </button>
              );
            })}
            {p === lastPlank && stack.length > 0 && (
              <div className="case-stack">
                {[...stack].reverse().map((i, n) => {
                  const book = books[i];
                  return (
                    <button
                      key={book.id}
                      type="button"
                      className="case-flat"
                      data-next={book.intent === 'next' || undefined}
                      aria-label={spineLabel(book)}
                      style={{ ...paint(colors[book.id]), width: n === 0 ? 110 : 116, height: Math.round(20 + jitter(book.id) * 6), marginLeft: n === 0 ? 6 : 0 }}
                      onClick={() => onPick(book.id)}
                    >
                      {book.title}
                    </button>
                  );
                })}
              </div>
            )}
            {p === lastPlank && books.length > 0 && <span className="case-bookend" aria-hidden="true" />}
          </div>
          <div className="case-board">{p === 0 && label}</div>
        </div>
      ))}
    </div>
  );
}
