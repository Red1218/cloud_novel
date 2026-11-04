/**
 * Self-check for Library shelves. Run: node src/features/library/utils/shelves.check.ts
 */
import assert from 'node:assert/strict';
import { DEFAULT_SHELF, deriveShelves, freeShelfName } from './shelves.ts';
import type { Book } from '@/types/book';

const book = (id: string, shelf?: string) => ({ id, title: id, shelf }) as Book;
const names = (order: string[], books: Book[]) =>
  deriveShelves(books, order).map((s) => `${s.name}:${s.books.map((b) => b.id).join('')}`);

assert.deepEqual(names([], []), [`${DEFAULT_SHELF}:`], 'an empty library still has the default shelf');
assert.deepEqual(names([], [book('a'), book('b')]), [`${DEFAULT_SHELF}:ab`], 'everything starts on one shelf');
assert.deepEqual(
  names(['Gothic', 'Empty'], [book('a'), book('b', 'Gothic'), book('c', 'Sci-Fi')]),
  [`${DEFAULT_SHELF}:a`, 'Gothic:b', 'Empty:', 'Sci-Fi:c'],
  'order first, empty shelves kept, unknown shelves appended'
);
assert.deepEqual(names(['Gothic'], [book('b', 'Gothic')]), ['Gothic:b'], 'default shelf hides once empty');

const rankedBook = (id: string, shelfRank?: number) => ({ id, title: id, shelf: 'ToG', shelfRank }) as Book;
assert.deepEqual(
  names(['ToG'], [rankedBook('x'), rankedBook('c', 3), rankedBook('a', 1), rankedBook('y'), rankedBook('b', 2)]),
  ['ToG:abcxy'],
  'ranked books first in rank order, unranked after in the order they came'
);

assert.equal(freeShelfName([]), 'New shelf');
assert.equal(freeShelfName(['new shelf', 'New shelf 2']), 'New shelf 3');
assert.equal(freeShelfName([], DEFAULT_SHELF), `${DEFAULT_SHELF} 2`);

console.log('shelves: ok');
