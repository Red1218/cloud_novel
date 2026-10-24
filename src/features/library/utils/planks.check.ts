/**
 * Self-check for bookcase packing. Run: node src/features/library/utils/planks.check.ts
 */
import assert from 'node:assert/strict';
import { packPlanks, spineWidth } from './planks.ts';

const books = (p: ReturnType<typeof packPlanks>) => p.planks.map((pl) => pl.books);

assert.equal(spineWidth(0), 22, 'thin books floor at 22px');
assert.equal(spineWidth(320), 27);
assert.equal(spineWidth(5000), 38, 'fat books cap at 38px');

// 30px spines, 3px gaps: 10 books use 327px.
const ten = Array(10).fill(30);
assert.deepEqual(books(packPlanks(ten, 340)), [[0, 1, 2, 3, 4, 5, 6, 7, 8], [9]], 'bookend room pushes the tenth book down');
assert.deepEqual(books(packPlanks(ten.slice(0, 4), 340)).length, 1, 'a short shelf is one plank');
assert.deepEqual(packPlanks([], 340), { planks: [{ books: [], lean: false }], stack: [] }, 'an empty shelf keeps one plank');

// Full plank of 3 x 100 = 306 in 340: 34px left, the last book leans.
const lean = packPlanks([100, 100, 100, 100], 340);
assert.deepEqual(books(lean), [[0, 1, 2], [3]]);
assert.equal(lean.planks[0].lean, true, 'a full plank with room leans its last book');
assert.equal(lean.planks[1].lean, false, 'the last plank never leans');
assert.equal(packPlanks([110, 110, 110, 100], 340).planks[0].lean, false, 'no lean without 26px of room');

// Six books, last plank half empty: the last two lie flat.
const stacked = packPlanks([30, 30, 30, 30, 30, 30], 340);
assert.deepEqual(stacked.stack, [4, 5], 'the last two books lie flat');
assert.deepEqual(books(stacked), [[0, 1, 2, 3]]);
assert.deepEqual(packPlanks([30, 30, 30, 30], 340).stack, [], 'short shelves keep every book standing');

assert.deepEqual(packPlanks(ten, 340), packPlanks(ten, 340), 'packing is deterministic');
console.log('planks.check: ok');
