/**
 * A character range inside one text item of a page, as returned by
 * `page.getTextContent()` (text items only, marked content excluded).
 * Item indexes line up with the PDF.js text layer's `textDivs`.
 */
export interface TextItemRange {
  itemIndex: number;
  /** Start offset in the item's string (inclusive). */
  start: number;
  /** End offset in the item's string (exclusive). */
  end: number;
}

/** One occurrence of the query in the book. */
export interface SearchMatch {
  /** Position in the book-wide result list (0-based). */
  index: number;
  /** 1-based page number. */
  pageNumber: number;
  /** Character ranges to highlight, in text-item order. */
  ranges: TextItemRange[];
  /** Original-text context for the results list. */
  snippet: {
    before: string;
    match: string;
    after: string;
  };
}

export interface SearchResults {
  matches: SearchMatch[];
  /** True when more matches exist than were returned. */
  truncated: boolean;
}

/** A match to highlight on the visible page. */
export interface TextLayerHighlight {
  ranges: TextItemRange[];
  selected: boolean;
}
