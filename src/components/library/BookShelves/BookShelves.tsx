import type { CSSProperties } from 'react';
import type { Shelf } from '@/features/library/utils/shelves';
import { ShelfRail } from './ShelfRail';

export interface BookShelvesProps {
  shelves: readonly Shelf[];
  /** The shelf whose name is being edited. */
  editing?: string;
  onEdit: (name: string | undefined) => void;
  onRename: (from: string, to: string) => void;
  onDelete: (name: string) => void;
  onPick: (bookId: string) => void;
}

/**
 * Books face-out on glass shelves, one row per shelf, each row scrolling
 * sideways. The reader's own shelves can be renamed or deleted in place.
 */
export function BookShelves({ shelves, editing, onEdit, onRename, onDelete, onPick }: BookShelvesProps) {
  return (
    <div className="shelves">
      {shelves.map((shelf, i) => (
        <section
          key={shelf.name}
          className="shelf"
          aria-label={shelf.name}
          style={{ '--shelf-color': `var(--shelf-${(i % 3) + 1})` } as CSSProperties}
        >
          {editing === shelf.name ? (
            <form
              className="shelf__head"
              onSubmit={(e) => {
                e.preventDefault();
                const name = new FormData(e.currentTarget).get('name');
                onRename(shelf.name, typeof name === 'string' ? name : shelf.name);
              }}
            >
              <input
                name="name"
                className="shelf__input"
                aria-label="Shelf name"
                defaultValue={shelf.name}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
              />
              <button type="button" className="shelf__text-btn" onClick={() => onDelete(shelf.name)}>
                Delete
              </button>
              <button type="submit" className="pill pill--filled shelf__done">Done</button>
            </form>
          ) : (
            <div className="shelf__head">
              <span className="shelf__dot" aria-hidden="true" />
              <h2 className="shelf__name">{shelf.name}</h2>
              <span className="shelf__count badge">{shelf.books.length} {shelf.books.length === 1 ? 'book' : 'books'}</span>
              {shelf.custom && (
                <button type="button" className="shelf__edit" aria-label={`Rename ${shelf.name}`} onClick={() => onEdit(shelf.name)}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h4L19 9l-4-4L4 16z" />
                    <path d="M13 7l4 4" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <ShelfRail
            books={shelf.books}
            label={shelf.name}
            onPick={onPick}
            empty="Empty. Tap a book and move it here."
          />
        </section>
      ))}
    </div>
  );
}
