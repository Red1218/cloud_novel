# ADR-015 — Search Inside PDF

## Status

[x] Proposed
[x] Accepted
[x] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2026-09-29

## Owner

Engineering Team (approved by the repository owner)

## Related ADRs

- ADR-002 — The Published Page is Sacred
- ADR-004 — Offline-first & Local-first
- ADR-006 — Reader Rendering Independent from UI
- ADR-011 — Page Prominence Principle
- ADR-014 — Reader Immersion Principle

## Related Phases

- Phase 5.5 — Search Inside PDF

## Tags

architecture, reader, search, performance, ux

---

## Context

Phase 5.5 asks for text search inside the PDF reader: find words or phrases, highlight them, and jump between results without compromising render speed. `DECISIONS.md` lists "Search Engine" as a decision that requires an ADR once the feature needs one.

The reader renders one page at a time to a canvas, with PDF.js's invisible text layer on top for selection. PDF.js already parses page text in its background worker via `page.getTextContent()`, and the text layer's spans map one-to-one to the text items that call returns. The app is local-first: books live in IndexedDB and may be read offline.

## Problem Statement

How should Cloud Novel find text across a whole book and show matches on the page, without altering the published page, blocking rendering, or coupling search logic to React?

## Decision

1. **Engine:** a framework-agnostic `searchService` extracts each page's text lazily with `page.getTextContent()` (parsed in the existing PDF.js worker), caches it in memory for the open document only, and finds matches on the main thread in small batches that yield between pages.
2. **Matching:** case-insensitive, accent-insensitive, and ligature-insensitive (Unicode NFKD with combining marks removed), with runs of whitespace (including line ends) treated as one space so phrases match across line breaks. Results are capped at 1,000 per query. Each match records its page, its character ranges within the page's text items, and a short context snippet.
3. **Highlighting:** matches on the visible page are highlighted inside the PDF.js text layer (the transparent overlay), using PDF.js's own `.highlight` / `.selected` styles. The canvas, and therefore the rendered page, is never modified.
4. **State and UI:** a `useReaderSearch` hook owns query, indexing progress, results, and the current match. Presentational components provide a search bar under the reader top bar (with "N of M", previous/next) and a results panel listing every match with its page and snippet. The reader page navigates to matches with the existing `goToPage`.
5. **Access:** a search button in the reader top bar, and Ctrl/Cmd+F inside the reader only, where the browser's own find cannot see the PDF's text.

## Alternatives Considered

- **PDF.js `PDFFindController` (from `pdfjs-dist/web/pdf_viewer`):** built for PDF.js's full `PDFViewer` with its event bus and link service. Cloud Novel uses its own single-page renderer, so adopting it would pull in the viewer stack and couple search to PDF.js's viewer internals. Rejected.
- **Dedicated search Web Worker with its own index:** would move string matching off the main thread, but text parsing already runs in the PDF.js worker, and matching normalized page strings is fast. The extra worker adds build and messaging complexity for little gain at novel sizes. Revisit if profiling shows main-thread cost.
- **Persisted full-text index in IndexedDB:** faster repeat searches, but adds a schema migration, storage growth, and invalidation work. In-memory extraction is quick enough per session. Rejected for now.
- **Drawing highlights on the canvas or a separate overlay layer:** drawing on the canvas violates ADR-002. A separate overlay would need to recompute geometry that the text layer already provides. Rejected in favour of the text layer.

## Reasons for Choosing This Solution

It reuses what the reader already has (the PDF.js worker, the text layer, `goToPage`), keeps the published page untouched (ADR-002), keeps the engine independent of React (ADR-006), works fully offline (ADR-004), and keeps the search UI in the auto-hiding reader chrome (ADR-011, ADR-014).

## Consequences

### Benefits
- No new dependencies, workers, or database changes.
- Highlights line up exactly with the text PDF.js lays out, at every zoom level.
- Matching tolerates accents, ligatures, and line wraps common in typeset novels.

### Trade-offs
- The first search in a book extracts every page's text, so it takes longer than later searches in the same session.
- The extracted text is held in memory while the book is open.
- Searching depends on the PDF having a text layer; scanned image-only PDFs return no results.

### Risks
- Very large books may make the first search noticeably slow; indexing progress is shown, and the work yields between pages to keep the UI responsive.
- PDF text order can differ from visual order in unusual layouts, which may produce missed or odd matches.

## Future Considerations

- Persist extracted text to speed up repeat searches, if profiling warrants it.
- Search options (match case, whole words).
- OCR for image-only PDFs (would need its own ADR).

## Related Documents

- `docs/context/CURRENT_PHASE.md` (Phase 5.5 objectives)
- `docs/architecture/PRODUCT_GUIDELINES.md` ("Search: rendered in-context without disrupting the page")
- `docs/architecture/ARCHITECTURE.md`

## Implementation Notes

- Vertical slice under `src/features/reader/search/` (`services/`, `hooks/`, `components/`, `types.ts`), mirroring the bookmark engine.
- `searchService` must use the same `getTextContent()` options as the text layer, so text item indexes line up with the text layer's spans.
- The highlighter restores each affected text span before re-applying highlights, and highlights are cleared when search closes.

---

## Version History

- **1.0** - 2026-09-29 - Initial proposal, accepted by the repository owner.
