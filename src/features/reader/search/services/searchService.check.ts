/**
 * Self-check for in-book search. Run: node src/features/reader/search/services/searchService.check.ts
 */
import assert from 'node:assert/strict';
import { buildPageText, findMatches, normalizeQuery } from './searchService.ts';

assert.equal(normalizeQuery('  Café   FIRE '), 'cafe fire', 'queries drop accents, lowercase and squeeze spaces');

// A page whose words split across text items and a line break, with a ligature.
const page = buildPageText(7, [
  { str: 'The ﬁre of', hasEOL: true },
  { str: 'Café', hasEOL: false },
  { str: ' Terrasen', hasEOL: false },
]);

const fire = findMatches([page], normalizeQuery('fire'));
assert.equal(fire.matches.length, 1, 'the "ﬁ" ligature matches "fi"');
assert.deepEqual(fire.matches[0].ranges, [{ itemIndex: 0, start: 4, end: 7 }], 'highlight covers the ligature and "re" in item 0');
assert.equal(fire.matches[0].pageNumber, 7);

const acrossLine = findMatches([page], normalizeQuery('of cafe'));
assert.equal(acrossLine.matches.length, 1, 'a line break counts as a space between words');
assert.deepEqual(
  acrossLine.matches[0].ranges.map((r) => r.itemIndex),
  [0, 1],
  'a match across a line break highlights both lines'
);
assert.equal(acrossLine.matches[0].snippet.match, 'of Café', 'the results list shows the original text');

assert.equal(findMatches([page], normalizeQuery('cafe terrasen')).matches.length, 1, 'words split across items still match');
assert.equal(findMatches([page], '').matches.length, 0, 'an empty query finds nothing');
assert.equal(findMatches([page], normalizeQuery('dragon')).matches.length, 0);

console.log('searchService: ok');
