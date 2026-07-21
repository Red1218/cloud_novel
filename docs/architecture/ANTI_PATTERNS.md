# Cloud Novel Anti-Patterns

**Version:** 1.0
**Status:** Living Document

---

## 1. Introduction

Anti-patterns exist to preserve the long-term vision of Cloud Novel. As software scales, the natural tendency is toward entropy—features bloat, boundaries blur, and original product philosophies are compromised in the name of expediency. 

This document defines what we **must never do**. It serves as a strict guardrail for all engineering, design, and AI contributions. Every contributor (human or AI) must review this document before implementing major features or proposing architectural changes.

If a proposed feature, PR, or AI implementation charter violates any principle listed here, **implementation must stop immediately** until a formal architecture review resolves the conflict.

---

## 2. Product Anti-Patterns

- **Never become a generic PDF application.** Cloud Novel is a dedicated reading environment, not a multi-purpose utility.
- **Never become a document editor.** We do not support annotating, signing, or modifying the document structure.
- **Never prioritize features over reading quality.** A feature that degrades the reading experience must be rejected.
- **Never sacrifice immersion for convenience.** The interface should never intrude unprompted.
- **Never clutter the reader with unnecessary UI.** Chrome must remain minimal, floating, and dismissible.
- **Never modify the published page.** We respect the author's and publisher's original intent.
- **Never reflow publisher text.** We do not extract text to apply custom layout engines.
- **Never replace fonts.** We render the embedded fonts precisely as published.
- **Never crop pages.** The page canvas must be rendered in its entirety.
- **Never alter layout.** We preserve the exact pagination and margins of the source file.
- **Never introduce advertisements.** Monetization (if any) must never happen within the reader view.
- **Never introduce distracting animations.** Motion should be subtle, purposeful, and structural.
- **Never add features that do not improve reading.** Feature bloat is the enemy of a premium experience.

---

## 3. Architecture Anti-Patterns

- **Never couple PDF rendering with UI.** The PDF.js wrapper must remain a distinct service layer unaware of React presentation logic.
- **Never place business logic inside components.** Components are strictly for presentation and capturing user intent.
- **Never place rendering logic inside presentation components.** Heavy derivations belong in hooks or services.
- **Never allow repositories to know about UI.** Data access layers must return domain objects, completely agnostic to how they are displayed.
- **Never tightly couple features together.** `features/library` and `features/reader` must remain independent and not import from one another.
- **Never bypass the feature architecture.** Do not place domain logic in the global `utils/` or `app/` directories.
- **Never create circular dependencies.** Dependencies must strictly flow inward toward the domain or downward to generic UI/infrastructure.
- **Never duplicate business logic.** Extract shared rules into reusable domain hooks.
- **Never introduce unnecessary abstractions.** Do not over-engineer; avoid premature generalization.
- **Never refactor architecture without approval.** Structural changes require a documented Architecture Review.
- **Never introduce global state unless justified.** Keep state as local as possible. Use Context only for truly global data (e.g., Theme).

---

## 4. React Anti-Patterns

- **Avoid prop drilling.** If props are passed through more than 3 layers of components, rethink the component composition or use Context.
- **Avoid deeply nested component trees.** Favor flatter hierarchies using children props (`composition over inheritance`).
- **Avoid large monolithic components.** Components over 200-300 lines should be evaluated for splitting.
- **Avoid unnecessary `useEffect`.** If state can be derived during render, do not use an effect to sync state.
- **Avoid duplicated state.** Do not store data in state if it can be computed from existing props or state.
- **Avoid anonymous functions that cause unnecessary renders where performance matters.** Use `useCallback` for functions passed as props to memoized child components.
- **Avoid unnecessary Context providers.** Context triggers re-renders for all consumers; use it sparingly.
- **Avoid premature optimization.** Do not wrap every component in `React.memo` by default. Profile first, optimize second.

---

## 5. Performance Anti-Patterns

- **Never rerender the PDF unnecessarily.** PDF rendering is highly expensive; canvas updates must be strictly controlled and isolated from UI state changes (like hovering a button).
- **Never perform expensive calculations during render.** Offload heavy operations to Web Workers or memoize them heavily.
- **Never block the main thread.** The UI must remain responsive at 60fps at all times.
- **Never recalculate layouts without need.** Avoid CSS properties that trigger costly reflows (e.g., animating `width` instead of `transform`).
- **Never perform unnecessary IndexedDB writes.** Batch updates or debounce writes for rapidly changing state (e.g., reading progress).
- **Never create unnecessary observers.** Clean up `IntersectionObserver` or `ResizeObserver` instances immediately when components unmount.
- **Never create unnecessary timers.** Always clear `setTimeout` and `setInterval` on unmount.

---

## 6. Accessibility Anti-Patterns

- **Never rely on color alone.** Status, errors, and active states must be distinguishable by shape, icon, or text.
- **Never remove keyboard navigation.** Every interactive element must be reachable via the `Tab` key.
- **Never remove focus indicators.** Do not use `outline: none` without providing a custom, high-contrast visual focus state.
- **Never ignore `prefers-reduced-motion`.** Respect user OS settings by disabling non-essential transitions.
- **Never create touch targets below accessibility recommendations.** Minimum touch target size is 44x44px.
- **Never ship inaccessible dialogs.** Modals must trap focus and close via the `Escape` key.

---

## 7. UX Anti-Patterns

- **Never require unnecessary taps.** Optimize for the shortest path to the most common actions.
- **Never hide important actions.** Core reading controls must be immediately discoverable.
- **Never force confirmation dialogs when unnecessary.** Allow undo actions instead of blocking confirmation modals for non-destructive events.
- **Never introduce "Apply" buttons for live settings.** Changes to theme, zoom, or layout must reflect immediately in real-time.
- **Never interrupt reading unnecessarily.** Tooltips, toasts, or modals must not fire unprompted during active reading.
- **Never create full-screen settings pages for reader customization.** Reading settings must exist contextually over the page via floating sheets or popovers.
- **Never expose implementation details to users.** Error messages must be human-readable, not stack traces or DB codes.

---

## 8. Documentation Anti-Patterns

- **Never implement major features without documentation.** Code does not exist in a vacuum; intent must be recorded.
- **Never skip Architecture Review.** No feature proceeds to implementation without structural sign-off.
- **Never skip Design Freeze.** Do not continuously shift requirements mid-implementation.
- **Never skip Code Review.** All code, regardless of author (Human or AI), must be scrutinized.
- **Never skip Cleanup.** Do not merge branches containing commented-out blocks, `console.log`, or `TODO` notes meant for this sprint.
- **Never merge undocumented architecture.** If you change how a system works, update `ARCHITECTURE.md` or `DECISIONS.md`.

---

## 9. Git Anti-Patterns

- **Never commit directly to `main`.** `main` is protected and strictly for production-ready releases.
- **Never skip feature branches.** All work must occur on a distinct branch (e.g., `feature/`, `bugfix/`).
- **Never merge without review.** At least one independent review is required.
- **Never commit unrelated files.** Commits must be atomic and focused on a single logical change.
- **Never commit generated artifacts unless intentionally versioned.** Do not commit build output (`dist/`) or local cache directories.

---

## 10. AI Workflow Anti-Patterns

- **Never allow AI to redesign approved UX during implementation.** Stick to the UX Specification. If the spec is flawed, halt and renegotiate the spec.
- **Never allow AI to silently refactor architecture.** Architectural changes must be explicit, requested, and reviewed.
- **Never accept AI-generated code without review.** AI code must pass the exact same Quality Gates as human code.
- **Never skip independent review.** An AI implementing a feature (Codex) cannot be the sole reviewer of its own feature (Kimi must review).
- **Never skip final architecture review.** ChatGPT must verify the final product aligns with the original vision.

---

## 11. Reader Philosophy

We enforce the following permanent principles:

- **The Published Page is Sacred.** We are custodians of the author's work, not editors of it.
- **The Reader Disappears.** The interface should be invisible when the user is engrossed in the story.
- **The Page is the Hero.** Every pixel of the screen exists to support the document.
- **The Environment Adapts to the Reader.** The UI flexes around the document's aspect ratio and zoom, never forcing the document to compromise.

Every feature, refactor, and fix must strengthen reader immersion.

---

## 12. Review Rule

Any proposal, PR, or implementation plan that violates one or more of these anti-patterns must **pause implementation**. 

The architecture must be formally reviewed and a consensus reached before work continues. There are no exceptions for expediency.

---

## Version History

| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| **1.0** | Initial | Cloud Novel Core Team | Initial release of the Anti-Patterns manifesto. |
