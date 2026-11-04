import type { Shelf } from '@/features/library/utils/shelves';
import { ShelfRail } from './ShelfRail';

export interface BookShelvesProps {
  shelves: readonly Shelf[];
  /** A shelf's label was tapped: open its sheet (order, and name for the reader's own). */
  onEdit: (name: string) => void;
  onPick: (bookId: string) => void;
}

/**
 * Every shelf in one white bookcase, one plank each. A shelf's label
 * pill sits on its plank and opens that shelf's sheet.
 */
export function BookShelves({ shelves, onEdit, onPick }: BookShelvesProps) {
  return (
    <div className="bookcase">
      {shelves.map((shelf) => {
        const text = `${shelf.name} · ${shelf.books.length}`;
        return (
          <section key={shelf.name} className="shelf" aria-label={shelf.name}>
            <ShelfRail
              books={shelf.books}
              name={shelf.name}
              onPick={onPick}
              empty="Empty. Tap a book and move it here."
              label={
                <button
                  type="button"
                  className="case-label"
                  aria-label={`${text}. ${shelf.custom ? 'Order, rename or delete' : 'Order the books'}`}
                  aria-haspopup="dialog"
                  onClick={() => onEdit(shelf.name)}
                >
                  {text}
                </button>
              }
            />
          </section>
        );
      })}
    </div>
  );
}
