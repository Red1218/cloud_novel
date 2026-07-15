import type { Book } from '@/types';

/**
 * Supported sort options for the library.
 */
export type SortOption = 'lastOpened' | 'recentlyAdded' | 'title';

/**
 * Sorts books according to the specified sort option.
 * Returns a new array; does not mutate the input.
 *
 * Sorting rules:
 * - 'lastOpened': Most recently opened first (books without lastOpened go to end, stable)
 * - 'recentlyAdded': Most recently imported first
 * - 'title': Alphabetical by title (A-Z), case-insensitive, natural sort
 *
 * Tie-breaking: For equal values, original order is preserved (stable sort).
 *
 * @param books - The source array of books (readonly)
 * @param sortBy - The sort option to apply
 * @returns A new readonly sorted array of books
 */
export function sortBooks(
  books: readonly Book[],
  sortBy: SortOption
): readonly Book[] {
  const sorted = [...books];

  switch (sortBy) {
    case 'lastOpened': {
      return sorted.sort((a, b) => {
        // Books without lastOpened go to the end
        if (!a.lastOpened && !b.lastOpened) return 0;
        if (!a.lastOpened) return 1;
        if (!b.lastOpened) return -1;
        return b.lastOpened - a.lastOpened;
      });
    }

    case 'recentlyAdded': {
      return sorted.sort((a, b) => b.importedAt - a.importedAt);
    }

    case 'title': {
      return sorted.sort((a, b) => {
        const otherTitle = b.title;

        // Equal title values return 0 so stable sort preserves original order.
        return a.title.localeCompare(otherTitle, undefined, {
          sensitivity: 'base',
          numeric: true,
        });
      });
    }

    default: {
      const exhaustive: never = sortBy;
      void exhaustive;
      return sorted;
    }
  }
}
