import { useEffect, useState } from 'react';
import type { Book } from '@/types/book';
import './BookSpines.css';

interface SpineColor {
  bg: string;
  fg: string;
}

const FALLBACK: SpineColor = { bg: '#3a352d', fg: '#f2ede3' };

/** Average colour of a cover thumbnail (one-pixel downscale), with readable text on it. */
const colorCache = new Map<string, Promise<SpineColor>>();
function coverColor(src: string): Promise<SpineColor> {
  let pending = colorCache.get(src);
  if (!pending) {
    pending = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return resolve(FALLBACK);
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const light = 0.299 * r + 0.587 * g + 0.114 * b > 150;
        resolve({ bg: `rgb(${r} ${g} ${b})`, fg: light ? '#1f1b16' : '#f6f1e7' });
      };
      img.onerror = () => resolve(FALLBACK);
      img.src = src;
    });
    colorCache.set(src, pending);
  }
  return pending;
}

/** Stable 0..1 value per book, so spine heights vary but never jump between renders. */
function jitter(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 1000) / 1000;
}

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
  const [colors, setColors] = useState<Record<string, SpineColor>>({});

  useEffect(() => {
    let alive = true;
    for (const book of books) {
      if (!book.thumbnail || colors[book.id]) continue;
      coverColor(book.thumbnail).then((c) => {
        if (alive) setColors((prev) => ({ ...prev, [book.id]: c }));
      });
    }
    return () => {
      alive = false;
    };
  }, [books, colors]);

  return (
    <div className="book-spines" role="group" aria-label="Books">
      {books.map((book) => {
        const color = colors[book.id] ?? FALLBACK;
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
