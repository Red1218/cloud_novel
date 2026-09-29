import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SearchMatch, SearchResults, TextItemRange } from '../types';

/** Maximum matches returned per query (ADR-015). */
export const MAX_SEARCH_RESULTS = 1000;

/** Characters of original text shown on each side of a match in snippets. */
const SNIPPET_CONTEXT = 40;

/**
 * A page's text prepared for searching.
 *
 * `text` is folded (see `foldChar`) with whitespace collapsed to single
 * spaces. Each folded character maps back to the original text item and
 * the character range within it, so matches can be highlighted exactly.
 */
export interface PageText {
  pageNumber: number;
  text: string;
  itemIndex: number[];
  charStart: number[];
  charEnd: number[];
  /** Original item strings joined, with a space at each end of line. */
  raw: string;
  /** Offset of each item within `raw`. */
  rawItemStart: number[];
}

const WHITESPACE = /\s/u;
const COMBINING_MARKS = /\p{M}/gu;

/**
 * Folds one character for matching: compatibility-decomposes it (so
 * ligatures like "ﬁ" become "fi"), drops accents, and lowercases it.
 */
function foldChar(ch: string): string {
  return ch.normalize('NFKD').replace(COMBINING_MARKS, '').toLowerCase();
}

/** Normalizes a query the same way page text is normalized. */
export function normalizeQuery(query: string): string {
  let out = '';
  let lastWasSpace = true;
  for (const ch of query) {
    if (WHITESPACE.test(ch)) {
      if (!lastWasSpace) out += ' ';
      lastWasSpace = true;
    } else {
      const folded = foldChar(ch);
      if (folded) {
        out += folded;
        lastWasSpace = false;
      }
    }
  }
  return out.trimEnd();
}

interface ItemLike {
  str: string;
  hasEOL: boolean;
}

/** Builds the searchable text for one page from its text items. */
export function buildPageText(pageNumber: number, items: ItemLike[]): PageText {
  let text = '';
  const itemIndex: number[] = [];
  const charStart: number[] = [];
  const charEnd: number[] = [];
  const rawParts: string[] = [];
  const rawItemStart: number[] = [];
  let rawLength = 0;
  let lastWasSpace = true;

  const push = (ch: string, item: number, start: number, end: number): void => {
    text += ch;
    itemIndex.push(item);
    charStart.push(start);
    charEnd.push(end);
  };

  items.forEach(({ str, hasEOL }, i) => {
    rawItemStart.push(rawLength);
    rawParts.push(str);
    rawLength += str.length;

    let offset = 0;
    for (const ch of str) {
      const start = offset;
      offset += ch.length;
      if (WHITESPACE.test(ch)) {
        if (!lastWasSpace) push(' ', i, start, offset);
        lastWasSpace = true;
        continue;
      }
      const folded = foldChar(ch);
      for (const f of folded) push(f, i, start, offset);
      if (folded) lastWasSpace = false;
    }

    if (hasEOL) {
      rawParts.push(' ');
      rawLength += 1;
      // A line break separates words, but maps to no characters on screen.
      if (!lastWasSpace) push(' ', i, str.length, str.length);
      lastWasSpace = true;
    }
  });

  return { pageNumber, text, itemIndex, charStart, charEnd, raw: rawParts.join(''), rawItemStart };
}

/** Converts a match in folded text to per-item character ranges. */
function toRanges(page: PageText, from: number, to: number): TextItemRange[] {
  const ranges: TextItemRange[] = [];
  for (let k = from; k < to; k++) {
    const start = page.charStart[k];
    const end = page.charEnd[k];
    if (start === end) continue;
    const last = ranges[ranges.length - 1];
    if (last && last.itemIndex === page.itemIndex[k]) {
      last.start = Math.min(last.start, start);
      last.end = Math.max(last.end, end);
    } else {
      ranges.push({ itemIndex: page.itemIndex[k], start, end });
    }
  }
  return ranges;
}

function collapse(text: string): string {
  return text.replace(/\s+/gu, ' ');
}

function toSnippet(page: PageText, ranges: TextItemRange[]): SearchMatch['snippet'] {
  const first = ranges[0];
  const last = ranges[ranges.length - 1];
  const start = page.rawItemStart[first.itemIndex] + first.start;
  const end = page.rawItemStart[last.itemIndex] + last.end;
  const before = page.raw.slice(Math.max(0, start - SNIPPET_CONTEXT), start);
  const after = page.raw.slice(end, end + SNIPPET_CONTEXT);
  return {
    before: collapse(before).trimStart(),
    match: collapse(page.raw.slice(start, end)),
    after: collapse(after).trimEnd(),
  };
}

/**
 * Finds every occurrence of `query` (already normalized) across the pages,
 * in page order, stopping at `limit` matches.
 */
export function findMatches(
  pages: PageText[],
  query: string,
  limit: number = MAX_SEARCH_RESULTS,
): SearchResults {
  const matches: SearchMatch[] = [];
  if (!query) return { matches, truncated: false };

  for (const page of pages) {
    let from = page.text.indexOf(query);
    while (from !== -1) {
      if (matches.length === limit) return { matches, truncated: true };
      const ranges = toRanges(page, from, from + query.length);
      if (ranges.length > 0) {
        matches.push({
          index: matches.length,
          pageNumber: page.pageNumber,
          ranges,
          snippet: toSnippet(page, ranges),
        });
      }
      from = page.text.indexOf(query, from + query.length);
    }
  }
  return { matches, truncated: false };
}

export interface ExtractOptions {
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
}

/** Extracted pages per open document. Held in memory only (ADR-015). */
const pageTextCache = new WeakMap<PDFDocumentProxy, PageText[]>();

/**
 * Returns every page's searchable text, extracting it on first use.
 *
 * Text is parsed by PDF.js in its worker via `getTextContent()`, with the
 * same default options as the text layer so item indexes line up with its
 * spans. Throws an `AbortError` DOMException if `signal` aborts.
 */
export async function extractPageTexts(
  pdfDocument: PDFDocumentProxy,
  { signal, onProgress }: ExtractOptions = {},
): Promise<PageText[]> {
  const cached = pageTextCache.get(pdfDocument);
  if (cached) {
    onProgress?.(cached.length, cached.length);
    return cached;
  }

  const total = pdfDocument.numPages;
  const pages: PageText[] = [];
  for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
    signal?.throwIfAborted();
    const page = await pdfDocument.getPage(pageNumber);
    const content = await page.getTextContent();
    const items: ItemLike[] = [];
    for (const item of content.items) {
      if ('str' in item) items.push({ str: item.str, hasEOL: item.hasEOL });
    }
    pages.push(buildPageText(pageNumber, items));
    onProgress?.(pageNumber, total);
  }
  signal?.throwIfAborted();

  pageTextCache.set(pdfDocument, pages);
  return pages;
}
