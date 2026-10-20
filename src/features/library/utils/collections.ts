import type { Book } from '@/types/book';

export type CollectionKind = 'series' | 'author' | 'genre';

/**
 * A group of books, derived from the books themselves (nothing is stored
 * separately): a series by `book.series.name`, an author by `book.author`,
 * a genre by each entry of `book.genres`. An author collection named ''
 * holds the books with no author.
 */
export interface Collection {
  kind: CollectionKind;
  name: string;
  books: Book[];
}

const byTitle = (a: Book, b: Book) => a.title.localeCompare(b.title, undefined, { numeric: true });

/** Series order first (by number), then title. */
export function compareInSeries(a: Book, b: Book): number {
  return (a.series?.number ?? Infinity) - (b.series?.number ?? Infinity) || byTitle(a, b);
}

function group(books: readonly Book[], keys: (book: Book) => string[]): Map<string, Book[]> {
  const groups = new Map<string, Book[]>();
  for (const book of books) {
    for (const key of keys(book)) {
      const list = groups.get(key);
      if (list) list.push(book);
      else groups.set(key, [book]);
    }
  }
  return groups;
}

function toCollections(kind: CollectionKind, groups: Map<string, Book[]>, compare: (a: Book, b: Book) => number): Collection[] {
  return [...groups]
    .map(([name, books]) => ({ kind, name, books: books.sort(compare) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Every series, author and genre in the library, each sorted by name. */
export function deriveCollections(books: readonly Book[]): Collection[] {
  return [
    ...toCollections('series', group(books, (b) => (b.series ? [b.series.name] : [])), compareInSeries),
    ...toCollections('author', group(books, (b) => (b.author ? [b.author] : [])), compareInSeries),
    ...toCollections('genre', group(books, (b) => b.genres ?? []), byTitle),
  ];
}

/** One collection by kind and name; `('author', '')` gives the books with no author. */
export function findCollection(books: readonly Book[], kind: CollectionKind, name: string): Collection | undefined {
  if (kind === 'author' && name === '') {
    const without = books.filter((b) => !b.author);
    return without.length > 0 ? { kind, name, books: [...without].sort(byTitle) } : undefined;
  }
  return deriveCollections(books).find((c) => c.kind === kind && c.name === name);
}

/** Every genre used in the library, alphabetically. */
export function allGenres(books: readonly Book[]): string[] {
  return [...new Set(books.flatMap((b) => b.genres ?? []))].sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// Series guessing from titles, offered right after an import
// ---------------------------------------------------------------------------

/** "Corran Point, Book 2", "Corran Point #2", "Corran Point Vol. 2: Low Water" */
const MARKED = /^(.+?)[\s,:–—-]*\b(?:book|vol\.?|volume|part|no\.?)\s*(\d{1,3})\b|^(.+?)\s*#\s*(\d{1,3})\b/i;
/** "Corran Point 2: Low Water", "Corran Point 2" */
const TRAILING = /^(.+?)\s+(\d{1,3})(?:\s*[:–—-].*)?$/;

export function parseSeriesTitle(title: string): { name: string; number: number } | null {
  const m = MARKED.exec(title) ?? TRAILING.exec(title);
  if (!m) return null;
  const name = (m[1] ?? m[3]).replace(/[\s,:–—-]+$/, '').trim();
  const number = Number(m[2] ?? m[4]);
  return name && number > 0 ? { name, number } : null;
}

export interface SeriesGuess {
  name: string;
  books: { book: Book; number: number }[];
}

/**
 * Groups of books whose titles share a series name with different numbers.
 * Only books not already in a series count, and each group must include at
 * least one of `added` (so old guesses are not offered again).
 */
export function guessSeries(books: readonly Book[], added: readonly Book[]): SeriesGuess[] {
  const addedIds = new Set(added.map((b) => b.id));
  const groups = new Map<string, SeriesGuess>();

  for (const book of books) {
    if (book.series) continue;
    const parsed = parseSeriesTitle(book.title);
    if (!parsed) continue;
    const key = parsed.name.toLowerCase();
    const guess = groups.get(key) ?? { name: parsed.name, books: [] };
    guess.books.push({ book, number: parsed.number });
    groups.set(key, guess);
  }

  return [...groups.values()]
    .filter((g) => new Set(g.books.map((b) => b.number)).size >= 2 && g.books.some((b) => addedIds.has(b.book.id)))
    .map((g) => ({ ...g, books: g.books.sort((a, b) => a.number - b.number) }));
}

/**
 * A title without its series prefix, for lists inside the series:
 * "Corran Point, Book 2: Low Water" → "Low Water". Other titles are unchanged.
 */
export function titleInSeries(book: Book): string {
  if (!book.series) return book.title;
  const parsed = parseSeriesTitle(book.title);
  const rest = book.title.split(/:\s*/).slice(1).join(': ').trim();
  return parsed && parsed.name.toLowerCase() === book.series.name.toLowerCase() && rest ? rest : book.title;
}
