# ADR-011 — Page Prominence Principle

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-10

## Owner

Design Team

## Related ADRs

- ADR-002 — The Published Page is Sacred

## Related Phases

- Phase 2: Core Reader

## Tags

design, ui, layout

---

## Context

When designing a digital reading application, it is tempting to surround the reading canvas with persistently visible tools, progress bars, settings menus, and library navigation. While functional, this visual clutter competes with the text for the reader's attention.

## Problem Statement

What is the visual hierarchy of the reading interface, and how do we ensure the book itself remains the undisputed focal point?

## Decision

We adopt the **Page Prominence Principle**. In the reading view, the rendered PDF page must be the most visually prominent element on the screen. It must occupy the maximum possible screen real estate. All persistent UI elements (headers, footers, sidebars) must be subordinate in size, contrast, and visual weight to the page content.

## Alternatives Considered

- **Persistent Toolbars:** Keeping navigation and settings toolbars visible at all times for ease of access. Rejected because it cramps the reading area, especially on mobile devices.
- **Floating Action Buttons (FABs):** Using a persistent floating button over the page for menu access. Rejected because it directly obscures content (violating ADR-002).

## Reasons for Choosing This Solution

The primary task is reading. The interface should recede into the background. By maximizing page prominence, we respect the medium and provide a more comfortable reading experience.

## Consequences

### Benefits
- Maximum screen utilization for content.
- Cleaner, more elegant aesthetic.
- Reduced cognitive load for the reader.

### Trade-offs
- Discoverability of features (like settings or table of contents) is reduced if they are hidden behind interactions (like a tap).
- Requires careful design of the interaction model to reveal UI when needed.

### Risks
- Users may find it confusing to navigate if the controls are entirely hidden without clear affordances.

## Future Considerations

We must define exact tap zones (e.g., center tap to reveal UI, edge taps to turn pages) that feel intuitive and do not accidentally trigger when a user is simply trying to turn a page.

## Related Documents

- UI Design System

## Implementation Notes

By default, the reading canvas should fill 100% of the viewport width and height when in active reading mode, with UI elements layered on top only when explicitly summoned.

---

## Version History

- **1.0** - 2024-01-10 - Initial Proposal and Acceptance
