# ADR-002 — The Published Page is Sacred

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-01

## Owner

Architecture Team

## Related ADRs

- ADR-001 — Premium PDF Novel Reader

## Related Phases

- Phase 1: Foundation
- Phase 2: Core Reader

## Tags

rendering, typography, core-principle

---

## Context

A defining characteristic of published novels, particularly premium digital releases, is the meticulous typesetting, font selection, and layout design provided by the publisher. Traditional e-readers often strip this formatting to reflow text, destroying the publisher's typographic intent.

## Problem Statement

We must decide how to handle the visual representation of PDF content. Should we attempt to extract and reformat text for different screen sizes, or preserve the original layout?

## Decision

We adopt the principle that **The Published Page is Sacred**. Cloud Novel will not alter, reflow, or modify the rendered output of the PDF page. The application will act as a pristine pane of glass, presenting the page exactly as the publisher intended.

## Alternatives Considered

- **Text Extraction and Reflow:** Using OCR or PDF text extraction to allow users to change font sizes and styles. Rejected because it breaks the fundamental value proposition of consuming a typeset novel and introduces significant layout errors.
- **Hybrid Rendering:** Attempting to reflow text on small devices while keeping fixed layout on large devices. Rejected due to extreme technical complexity and inconsistent user experience.

## Reasons for Choosing This Solution

Preserving the exact rendering respects the art of book design. It guarantees that illustrations, complex formatting, and typographic nuances remain intact, offering a superior experience for purists.

## Consequences

### Benefits
- Zero rendering errors related to text reflow.
- 100% fidelity to the original publication.
- Simplified rendering pipeline (we render images/pages, not text nodes).

### Trade-offs
- Reading on small screens (like mobile phones) requires zooming and panning, which can be cumbersome.
- Accessibility features like custom large print or dyslexic fonts cannot be applied to the text directly.

### Risks
- Users accustomed to reflowable ePubs may find the rigid structure frustrating on certain devices.

## Future Considerations

We must invest heavily in intelligent zooming, cropping, and panning navigation systems to mitigate the downside of fixed layouts on smaller screens.

## Related Documents

- None

## Implementation Notes

The PDF rendering engine must output exact visual representations. The UI layer should focus on scaling and positioning these representations, not manipulating their internal content.

---

## Version History

- **1.0** - 2024-01-01 - Initial Proposal and Acceptance
