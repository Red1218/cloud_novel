import { useEffect, useRef, useState } from 'react';
import type { Book } from '@/types/book';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { DEFAULT_SHELF } from '@/features/library/utils/shelves';
import { openLabel, statusText } from '@/features/library/utils/readingStatus';
import '@/components/library/BookCollectionsSheet/BookCollectionsSheet.css';
import './BookSheet.css';

export interface BookSheetProps {
  book: Book;
  /** Every shelf name, the default shelf first. */
  shelfNames: readonly string[];
  onOpen: () => void;
  onEditCollections: () => void;
  /** Moves the book; `null` is the default shelf. A name not yet a shelf makes one. */
  onMove: (shelf: string | null) => void;
  onClose: () => void;
}

/**
 * A tapped book: its progress, Open and Collections, and the shelf it sits on.
 * Choosing a shelf moves the book at once.
 */
export function BookSheet({ book, shelfNames, onOpen, onEditCollections, onMove, onClose }: BookSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newShelf, setNewShelf] = useState('');
  const progress = Math.round(book.progress);
  const current = book.shelf && shelfNames.includes(book.shelf) ? book.shelf : DEFAULT_SHELF;
  const memberships = [book.series && `${book.series.name} #${book.series.number}`, ...(book.genres ?? [])].filter(Boolean);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="collections-sheet"
      aria-labelledby="book-sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="collections-sheet__panel">
        <span className="collections-sheet__handle" aria-hidden="true" />

        <div className="book-sheet__head">
          <div className="book-sheet__cover">
            <BookCover src={book.thumbnail} title={book.title} />
          </div>
          <div className="book-sheet__info">
            <h2 id="book-sheet-title" className="collections-sheet__title">{book.title}</h2>
            {book.author && <p className="collections-sheet__subtitle">{book.author}</p>}
            {memberships.length > 0 && <p className="book-sheet__memberships">{memberships.join(' · ')}</p>}
            <div className="paper-progress book-sheet__progress">
              <div
                className="paper-progress__bar"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Reading progress: ${progress}%`}
              >
                <div style={{ width: `${progress}%` }} />
              </div>
              <span className="paper-progress__label">{statusText(book)}</span>
            </div>
          </div>
        </div>

        <div className="book-sheet__actions">
          <button type="button" className="pill pill--filled book-sheet__open" onClick={onOpen}>
            {openLabel(book)}
          </button>
          <button type="button" className="pill pill--outline" onClick={onEditCollections}>
            Collections
          </button>
        </div>

        <fieldset className="collections-sheet__group">
          <legend className="paper-eyebrow">Shelf</legend>
          {shelfNames.map((name) => (
            <label key={name} className="collections-sheet__option">
              <input
                type="radio"
                name="shelf"
                checked={current === name}
                onChange={() => onMove(name === DEFAULT_SHELF ? null : name)}
              />
              <span>{name}</span>
            </label>
          ))}
          <form
            className="collections-sheet__new-genre"
            onSubmit={(e) => {
              e.preventDefault();
              if (newShelf.trim()) onMove(newShelf.trim());
              setNewShelf('');
            }}
          >
            <input
              type="text"
              className="collections-sheet__input"
              aria-label="New shelf name"
              placeholder="New shelf, e.g. Sci-Fi"
              value={newShelf}
              onChange={(e) => setNewShelf(e.target.value)}
            />
            <button type="submit" className="pill pill--outline" disabled={!newShelf.trim()}>Add</button>
          </form>
        </fieldset>
      </div>
    </dialog>
  );
}
