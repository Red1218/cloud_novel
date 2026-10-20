/**
 * Self-check for series guessing. Run: node src/features/library/utils/collections.check.ts
 */
import assert from 'node:assert/strict';
import { guessSeries, parseSeriesTitle, titleInSeries } from './collections.ts';
import type { Book } from '@/types/book';

assert.deepEqual(parseSeriesTitle('Corran Point, Book 2'), { name: 'Corran Point', number: 2 });
assert.deepEqual(parseSeriesTitle('Corran Point #3'), { name: 'Corran Point', number: 3 });
assert.deepEqual(parseSeriesTitle('Corran Point Vol. 1: The Salt Road'), { name: 'Corran Point', number: 1 });
assert.deepEqual(parseSeriesTitle('Corran Point 2: Low Water'), { name: 'Corran Point', number: 2 });
assert.equal(parseSeriesTitle('The Salt Road'), null);
assert.equal(parseSeriesTitle('1984'), null);

const book = (id: string, title: string, extra: Partial<Book> = {}) => ({ id, title, ...extra }) as Book;
const library = [
  book('a', 'Corran Point, Book 2'),
  book('b', 'Corran Point, Book 1'),
  book('c', 'Catch 22'),
  book('d', 'Night Ferries #1', { series: { name: 'Night Ferries', number: 1 } }),
  book('e', 'Night Ferries #2'),
];

const guesses = guessSeries(library, [library[0]]);
assert.equal(guesses.length, 1, 'one series: lone "Catch 22" and an already-filed series are not offered');
assert.equal(guesses[0].name, 'Corran Point');
assert.deepEqual(guesses[0].books.map((b) => b.book.id), ['b', 'a'], 'ordered by number');
assert.equal(guessSeries(library, [library[2]]).length, 0, 'nothing when no newly added book is in a group');

assert.equal(titleInSeries(book('x', 'Corran Point, Book 2: Low Water', { series: { name: 'Corran Point', number: 2 } })), 'Low Water');
assert.equal(titleInSeries(book('y', 'Low Water', { series: { name: 'Corran Point', number: 2 } })), 'Low Water');
assert.equal(titleInSeries(book('z', 'Dune: Messiah', { series: { name: 'Corran Point', number: 2 } })), 'Dune: Messiah');

console.log('collections: ok');
