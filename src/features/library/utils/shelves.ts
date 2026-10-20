import type { Book } from '@/types/book';

/** Where books without a shelf of their own sit. */
export const DEFAULT_SHELF = 'My books';

export interface Shelf {
  name: string;
  /** False for the default shelf, which cannot be renamed or deleted. */
  custom: boolean;
  books: Book[];
}

const STORAGE_KEY = 'cloud-novel:shelves';

/** The reader's shelf names in their order (empty shelves included). */
export function loadShelfOrder(): string[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((n): n is string => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

export function saveShelfOrder(names: readonly string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // Storage blocked: the order holds until the app closes.
  }
}

/**
 * The Library's shelves: the default shelf first (while it holds books or
 * is the only one), then the reader's shelves in their order, then any shelf
 * a book names that the order lost. Books keep the order they come in.
 */
export function deriveShelves(books: readonly Book[], order: readonly string[]): Shelf[] {
  const names = [...new Set([...order, ...books.flatMap((b) => (b.shelf ? [b.shelf] : []))])];
  const unshelved = books.filter((b) => !b.shelf || !names.includes(b.shelf));
  const custom = names.map((name) => ({ name, custom: true, books: books.filter((b) => b.shelf === name) }));
  return unshelved.length > 0 || custom.length === 0
    ? [{ name: DEFAULT_SHELF, custom: false, books: unshelved }, ...custom]
    : custom;
}

/** A shelf name not yet taken: "New shelf", "New shelf 2", … */
export function freeShelfName(taken: readonly string[], base = 'New shelf'): string {
  const lower = new Set([DEFAULT_SHELF, ...taken].map((n) => n.toLowerCase()));
  for (let i = 1; ; i++) {
    const name = i === 1 ? base : `${base} ${i}`;
    if (!lower.has(name.toLowerCase())) return name;
  }
}
