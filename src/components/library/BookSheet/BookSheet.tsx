import { useEffect, useRef, useState } from 'react';
import type { Book, BookIntent } from '@/types/book';
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
  /** Sets the plan for this book; null clears it. */
  onIntent: (intent: BookIntent | null) => void;
  /** Deletes the book (after the sheet's own confirm). */
  onRemove: () => void;
  onClose: () => void;
}

const PLANS: ReadonlyArray<{ id: BookIntent; label: string; hint: string; badge: string; done: string; icon: string }> = [
  {
    id: 'next',
    label: 'Up next',
    hint: 'Read it soon',
    badge: 'Up next',
    done: "Added to Up next. It joins Home's Reading now shelf.",
    icon: 'M4 6h11M4 12h11M4 18h7M17 15v6M14 18h6',
  },
  {
    id: 'later',
    label: 'Not now',
    hint: 'Set it aside',
    badge: 'Not now',
    done: 'Set aside. It leaves your shelves until you open it.',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  },
];

/**
 * A tapped book: its progress, Open and Collections, and the shelf it sits on.
 * Choosing a shelf moves the book at once, and so does a plan (Up next or Not now).
 */
export function BookSheet({ book, shelfNames, onOpen, onEditCollections, onMove, onIntent, onRemove, onClose }: BookSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newShelf, setNewShelf] = useState('');
  const [announced, setAnnounced] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const plan = PLANS.find((p) => p.id === book.intent);
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
            {plan && <p className="badge book-sheet__badge">{plan.badge}</p>}
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

        <div>
          <div className="book-sheet__plans" role="group" aria-label="Plan for this book">
            {PLANS.map((p) => {
              const on = book.intent === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="book-sheet__plan"
                  aria-pressed={on}
                  onClick={() => {
                    onIntent(on ? null : p.id);
                    setAnnounced(on ? '' : p.done);
                  }}
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                  <span>
                    <span className="book-sheet__plan-label">{p.label}</span>
                    <span className="book-sheet__plan-hint">{p.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="book-sheet__announce" aria-live="polite">{announced}</p>
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

        {confirmRemove ? (
          <div className="book-sheet__remove-confirm" role="group" aria-labelledby="remove-title">
            <p id="remove-title" className="book-sheet__remove-title">Remove “{book.title}”?</p>
            <p className="book-sheet__remove-text">Its PDF, reading place and bookmarks are deleted from this phone. You can't undo this.</p>
            <div className="book-sheet__actions">
              <button type="button" className="pill book-sheet__remove-yes" onClick={onRemove}>Remove</button>
              {/* Focus starts on Cancel so a double tap can't delete */}
              <button type="button" className="pill pill--outline" autoFocus onClick={() => setConfirmRemove(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" className="pill pill--outline book-sheet__remove" onClick={() => setConfirmRemove(true)}>
            Remove from library
          </button>
        )}
      </div>
    </dialog>
  );
}
