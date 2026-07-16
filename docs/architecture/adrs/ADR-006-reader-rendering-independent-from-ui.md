# ADR-006 — Reader Rendering Independent from UI

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-05

## Owner

Architecture Team

## Related ADRs

- ADR-005 — DDD + Clean Architecture

## Related Phases

- Phase 2: Core Reader

## Tags

rendering, pdf, architecture

---

## Context

The core value of Cloud Novel is rendering PDF pages flawlessly. The specific technology used to render PDFs (e.g., PDF.js, a custom WebGL renderer, or a WASM module) is complex and subject to change if performance bottlenecks are discovered. Simultaneously, the UI (menus, toolbars, settings) will iterate rapidly.

## Problem Statement

How do we prevent the PDF rendering engine from becoming tightly coupled to the React UI, ensuring we can upgrade or replace the renderer without rewriting the entire reading interface?

## Decision

We mandate that **Reader Rendering must be independent from the UI**. The rendering engine will be encapsulated within its own module or class, exposing a framework-agnostic API (e.g., `renderPage(pageNumber, canvasContext)`). The React UI will only interact with this API, never the underlying rendering library directly.

## Alternatives Considered

- **Tightly Coupled React-PDF Library:** Using a pre-built React wrapper for PDF.js. Rejected because it binds our core rendering performance to the React render cycle and limits our ability to implement custom WebGL or WASM optimizations in the future.

## Reasons for Choosing This Solution

Decoupling protects the application from technical lock-in. If a faster PDF rendering technology emerges, we can swap the internal implementation of our rendering interface without touching a single React component in the UI layer. It also aligns with our Clean Architecture principles (ADR-005).

## Consequences

### Benefits
- Maximum flexibility to optimize or replace the rendering engine.
- Rendering logic can be tested independently of React.
- UI performance is decoupled from rendering performance.

### Trade-offs
- Requires building and maintaining our own adapter layer between React and the rendering engine.
- Slightly more upfront architectural work compared to using an off-the-shelf React-PDF wrapper.

### Risks
- The abstraction layer might leak rendering-specific concepts if not designed carefully.

## Future Considerations

We may eventually move the PDF parsing and rendering completely off the main thread into a Web Worker to ensure UI responsiveness. This decoupled architecture makes that transition significantly easier.

## Related Documents

- PDF Rendering Architecture

## Implementation Notes

The renderer adapter should implement a clearly defined TypeScript interface that the UI consumes.

---

## Version History

- **1.0** - 2024-01-05 - Initial Proposal and Acceptance
