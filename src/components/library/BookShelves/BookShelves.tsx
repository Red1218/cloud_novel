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
 * Every shelf in one white bookcase, one plank each. A shelf's label
 * pill sits on its plank; on the reader's own shelves it opens rename
 * and delete above that shelf.
 */
export function BookShelves({ shelves, editing, onEdit, onRename, onDelete, onPick }: BookShelvesProps) {
  return (
    <div className="bookcase">
      {shelves.map((shelf) => {
        const text = `${shelf.name} · ${shelf.books.length}`;
        return (
          <section key={shelf.name} className="shelf" aria-label={shelf.name}>
            {editing === shelf.name && (
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
            )}
            <ShelfRail
              books={shelf.books}
              name={shelf.name}
              onPick={onPick}
              empty="Empty. Tap a book and move it here."
              label={
                shelf.custom ? (
                  <button
                    type="button"
                    className="case-label"
                    aria-label={`${text}. Rename or delete`}
                    aria-expanded={editing === shelf.name}
                    onClick={() => onEdit(editing === shelf.name ? undefined : shelf.name)}
                  >
                    {text}
                  </button>
                ) : (
                  <span className="case-label">{text}</span>
                )
              }
            />
          </section>
        );
      })}
    </div>
  );
}
