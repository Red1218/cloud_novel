import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Shelf } from '@/features/library/utils/shelves';
import type { Book } from '@/types/book';
import { BookCover } from '@/components/library/BookCover/BookCover';
import '@/components/library/BookCollectionsSheet/BookCollectionsSheet.css';
import './ShelfSheet.css';

export interface ShelfSheetProps {
  shelf: Shelf;
  /** Name (custom shelves only) and book order; order is undefined when untouched. */
  onSave: (name: string, order: Book[] | undefined) => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Sheet for one shelf: its name (the reader's own shelves), its books in
 * order, dragged by their handle (or moved with the arrow keys), and
 * Delete. Nothing is saved until Done; the backdrop or Esc cancels.
 */
export function ShelfSheet({ shelf, onSave, onDelete, onClose }: ShelfSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(shelf.name);
  const [books, setBooks] = useState(shelf.books);
  const [moved, setMoved] = useState(false);
  const [dragging, setDragging] = useState<string>();
  const drag = useRef({ y: 0, row: 0 });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= books.length || to === from) return;
    setBooks((current) => {
      const next = [...current];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
    setMoved(true);
  };

  // Dragging: the book moves one place for every row the pointer travels
  // (rounded), however far a single move event jumps.
  const startDrag = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, row: e.currentTarget.closest('li')?.offsetHeight ?? 64 };
    setDragging(id);
  };
  const onDrag = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const at = books.findIndex((b) => b.id === dragging);
    const steps = Math.round((e.clientY - drag.current.y) / drag.current.row);
    const to = Math.min(books.length - 1, Math.max(0, at + steps));
    if (to === at) return;
    move(at, to);
    drag.current.y += (to - at) * drag.current.row;
  };

  return (
    <dialog
      ref={dialogRef}
      className="collections-sheet"
      aria-labelledby="shelf-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="collections-sheet__panel">
        <span className="collections-sheet__handle" aria-hidden="true" />

        <header className="collections-sheet__header">
          <div className="collections-sheet__heading">
            <h2 id="shelf-sheet-title" className="collections-sheet__title">{shelf.name}</h2>
            <p className="collections-sheet__subtitle">Drag the books into the order you want</p>
          </div>
          <button type="button" className="collections-sheet__text-btn" onClick={() => dialogRef.current?.close()}>Cancel</button>
          <button
            type="button"
            className="pill pill--filled collections-sheet__done"
            onClick={() => onSave(name, moved ? books : undefined)}
          >
            Done
          </button>
        </header>

        {shelf.custom && (
          <div className="collections-sheet__group">
            <label htmlFor="shelf-sheet-name" className="paper-eyebrow">Name</label>
            <input
              id="shelf-sheet-name"
              type="text"
              className="collections-sheet__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}

        {books.length === 0 ? (
          <p className="collections-sheet__hint">No books on this shelf yet. Tap a book in the Library and move it here.</p>
        ) : (
          <ol className="shelf-sheet__list" aria-label={`Books on ${shelf.name}`}>
            {books.map((book, i) => (
              <li key={book.id} className="shelf-sheet__row" data-dragging={dragging === book.id || undefined}>
                <span className="shelf-sheet__number">{i + 1}</span>
                <span className="shelf-sheet__cover">
                  <BookCover src={book.thumbnail} title={book.title} />
                </span>
                <span className="shelf-sheet__title">{book.title}</span>
                <button
                  type="button"
                  className="shelf-sheet__handle"
                  aria-label={`Move ${book.title}, place ${i + 1} of ${books.length}. Drag, or use the up and down arrow keys`}
                  onPointerDown={(e) => startDrag(e, book.id)}
                  onPointerMove={onDrag}
                  onPointerUp={() => setDragging(undefined)}
                  onPointerCancel={() => setDragging(undefined)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                    e.preventDefault();
                    move(i, i + (e.key === 'ArrowUp' ? -1 : 1));
                  }}
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
                    <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
                    <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
        )}

        {shelf.custom && (
          <button type="button" className="shelf-sheet__delete" onClick={onDelete}>
            Delete shelf
          </button>
        )}
      </div>
    </dialog>
  );
}
