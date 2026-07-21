# Cloud Novel — Architecture & Product Decisions

**Version:** 1.2
**Status:** Living document

## Purpose

This document records major architectural, UX, and product decisions.
Its purpose is not to document implementation.
Its purpose is to preserve reasoning.
Future contributors should be able to understand why a decision exists, even years later.

## Repository Standards

ADRs belong only in `docs/DECISIONS.md`.
Do not duplicate ADRs inside implementation documents. Link instead of copying.

## Reference

See also:
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)
- [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md)

---

## ADR Lifecycle

Proposal
↓
Architecture Review
↓
Accepted
↓
Implemented
↓
Verified
↓
Historical Reference

An ADR may also become:
- **Deprecated**
- **Superseded**
- **Rejected**

without being deleted.

### ADR Status Definitions

- **Accepted**: The decision is approved and represents the current project standard.
- **Proposed**: The decision is under architecture review.
- **Implemented**: The decision has been fully implemented.
- **Superseded**: The decision has been replaced by another ADR.
- **Deprecated**: The decision remains documented but should no longer be used.
- **Rejected**: The proposal was intentionally declined.

Historical ADRs are never deleted regardless of status.

## ADR Modification Policy

- Accepted ADRs should not be rewritten.
- Editorial improvements are allowed.
- If the reasoning changes significantly, create a new ADR instead of rewriting the old one.
- Historical accuracy is more important than perfect wording. This preserves the decision history.

---

## Decision Categories

Every future ADR should include one or more tags from the following categories:
- Architecture
- UX
- Infrastructure
- Security
- Performance
- Accessibility
- Product
- Workflow
- Documentation

---

## Decision Writing Standards

- Describe the problem first.
- Describe the decision second.
- Describe alternatives.
- Document trade-offs honestly.
- Avoid implementation details.
- Keep ADRs concise.
- Prefer permanent reasoning over temporary context.

---

## Decision Principles

Cloud Novel decisions must favour:
- Reader experience over feature count.
- Consistency over cleverness.
- Long-term maintainability.
- Accessibility.
- Offline capability.
- Publisher preservation.
- Intentional architecture.

These principles should guide future ADRs.

---

## Decision Template

*Copy this template for future decisions.*

### ADR-XXX — Title

**Status:** Accepted
**Date:** YYYY-MM-DD
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, UX, Reader

> **Note on Decision IDs:**
> ADR numbers are permanent. They never change and are never reused. Deprecated ADRs remain in history. Superseded ADRs reference their replacements.

**Context**
Describe the problem that required a decision.

**Decision**
Describe the chosen solution.

**Alternatives Considered**
List realistic alternatives.

**Reasons for choosing this solution**
Explain why this approach was selected.

**Consequences**
Positive consequences.
Trade-offs.
Future implications.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)
- [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md)

---

## Decision Index

| ADR | Title | Category | Status |
|-----|-------|----------|--------|
| ADR-001 | Cloud Novel is a Premium PDF Novel Reader | Product, UX | Accepted |
| ADR-002 | The Published Page is Sacred | Product, UX, Accessibility | Accepted |
| ADR-003 | Reader-first Philosophy | Product, UX | Accepted |
| ADR-004 | Offline-first & Local-first | Architecture, Infrastructure, Product | Accepted |
| ADR-005 | DDD + Clean Architecture | Architecture, Workflow | Accepted |
| ADR-006 | Reader Rendering Independent from UI | Architecture, Performance | Accepted |
| ADR-007 | shadcn/ui as the Standard Component Library | Architecture, UX, Accessibility | Accepted |
| ADR-008 | UX-first Workflow | Workflow, Documentation | Accepted |
| ADR-009 | Documentation-first Development | Workflow, Documentation | Accepted |
| ADR-010 | Architecture Improvements Require Approval | Architecture, Workflow | Accepted |

---

## Initial Decisions

### ADR-001 — Cloud Novel is a Premium PDF Novel Reader

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Product, UX

**Context**
Defining the core product identity and target use case.

**Decision**
Cloud Novel is designed exclusively as a premium PDF novel reader.

**Alternatives Considered**
- General PDF utility.
- Document manager.

**Reasons for choosing this solution**
- Maintain a focused product identity.
- Avoid becoming a general PDF utility.

**Consequences**
- Reader-first UX.
- Simpler roadmap.
- Clear market positioning.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-002 — The Published Page is Sacred

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Product, UX, Accessibility

**Context**
Establishing boundaries for how the application displays original PDF content.

**Decision**
The published page must never be modified.
Never:
- reflow
- crop
- replace fonts
- alter layout

**Alternatives Considered**
- Responsive text reflowing.
- Custom typography overrides.

**Reasons for choosing this solution**
- Respect publisher intent.
- Preserve authenticity.

**Consequences**
- UI evolves around the page.
- The page itself remains unchanged.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-003 — Reader-first Philosophy

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Product, UX

**Context**
Establishing a hierarchy for feature prioritisation.

**Decision**
Every feature must improve reading.

**Alternatives Considered**
- Productivity-focused or editing-focused feature sets.

**Reasons for choosing this solution**
- Reduce distractions.
- Increase immersion.

**Consequences**
- Many document-viewer features are intentionally excluded.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-004 — Offline-first & Local-first

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, Infrastructure, Product

**Context**
Determining the primary data storage and availability strategy.

**Decision**
Core functionality works without internet.
Cloud services are optional enhancements.

**Alternatives Considered**
- Cloud-primary architecture requiring persistent network connection.

**Reasons for choosing this solution**
- Reliability.
- Privacy.
- Performance.

**Consequences**
- Reading never depends on network availability.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-005 — DDD + Clean Architecture

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, Workflow

**Context**
Selecting the foundational architectural pattern for the codebase.

**Decision**
Cloud Novel follows Domain-Driven Design and Clean Architecture.

**Alternatives Considered**
- Traditional MVC.
- Unstructured component trees.

**Reasons for choosing this solution**
- Long-term maintainability.
- Clear separation of concerns.
- Testability.

**Consequences**
- Business logic remains independent of UI and infrastructure.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-006 — Reader Rendering Independent from UI

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, Performance

**Context**
Structuring the relationship between the PDF rendering engine and the UI layer.

**Decision**
PDF rendering and UI state are separate systems.

**Alternatives Considered**
- Tightly coupling UI state with the PDF rendering pipeline.

**Reasons for choosing this solution**
- Prevent rendering from being affected by UI changes.

**Consequences**
- Immersive mode.
- Future overlays.
- Future themes.
- Future controls.
- Can evolve independently.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-007 — shadcn/ui as the Standard Component Library

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, UX, Accessibility

**Context**
Choosing a UI component foundation to accelerate development while ensuring quality.

**Decision**
shadcn/ui is the default component library.

**Alternatives Considered**
- Building all components from scratch.
- Using heavily opinionated, inflexible component frameworks.

**Reasons for choosing this solution**
- Accessibility.
- Ownership of component code.
- Consistency.
- Tailwind integration.

**Consequences**
- Custom components only when justified.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)

### ADR-008 — UX-first Workflow

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Workflow, Documentation

**Context**
Defining the feature development lifecycle.

**Decision**
Every UI feature follows:
UX Specification
↓
Architecture Review
↓
Design
↓
Architecture Approval
↓
Implementation
↓
Code Review
↓
Cleanup

**Alternatives Considered**
- Code-first, iterate-later approach.

**Reasons for choosing this solution**
- Prevent redesign after implementation.
- Maintain consistent UX.

**Consequences**
- Design decisions happen before code.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)
- [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md)

### ADR-009 — Documentation-first Development

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Workflow, Documentation

**Context**
Establishing requirements for initiating new feature work.

**Decision**
Major features require documentation before implementation.

**Alternatives Considered**
- Ad-hoc feature development without formal charters.

**Reasons for choosing this solution**
- Reduce ambiguity.
- Improve consistency.

**Consequences**
- Every feature starts with a Phase Charter.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)
- [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md)

### ADR-010 — Architecture Improvements Require Approval

**Status:** Accepted
**Date:** 2026-07-15
**Decision Owner:** Cloud Novel Team
**Reviewers:** Architecture Review
**Supersedes:** None
**Superseded By:** None
**Tags:** Architecture, Workflow

**Context**
Handling architectural changes discovered during active implementation.

**Decision**
If an implementation reveals an architectural improvement:
Stop.
Propose it.
Wait for approval.
Then implement.

**Alternatives Considered**
- Allowing silent architectural refactoring during feature work.

**Reasons for choosing this solution**
- Architecture should evolve intentionally.
- Avoid silent architectural drift.

**Consequences**
- The architecture remains stable and predictable.

**Related Documents**
- [PRODUCT_GUIDELINES.md](./PRODUCT_GUIDELINES.md)
- [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md)

---

## Future ADRs

The following are examples of future architectural decisions that may require ADRs. *These are examples only; do not create the ADRs until the feature requires one.*

- Cloud Sync
- Authentication
- Collections
- Bookmarks
- Themes
- Offline Sync
- Database Encryption
- Search Engine
- Plugin Architecture
- CI/CD
- Testing Strategy
- Performance Budget

---

## Versioning Policy

- **Minor version:** Editorial improvements.
- **Major version:** Structural changes to ADR format.

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-07-15 | Initial Architecture Decision Record. Contains the foundational product and architectural decisions. |
| 1.1 | 2026-07-15 | Added expanded ADR metadata, Decision Lifecycle, Categories, Writing Standards, Versioning Policy, and Decision Principles. Backfilled related documents to initial ADRs. |
| 1.2 | 2026-07-15 | Added ADR Status Definitions, ADR Modification Policy, and Decision Index. |
