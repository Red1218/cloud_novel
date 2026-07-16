# ADR-005 — DDD + Clean Architecture

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-04

## Owner

Architecture Team

## Related ADRs

- None

## Related Phases

- Phase 1: Foundation
- Phase 2: Core Reader

## Tags

architecture, ddd, clean-architecture

---

## Context

Cloud Novel is not a simple CRUD application. It involves complex domains such as parsing proprietary PDF structures, managing reading progress across devices, handling library organization, and maintaining the reading environment state. As the application grows, coupling business logic to UI components or specific databases will lead to a fragile, unmaintainable codebase.

## Problem Statement

How should we structure the codebase to ensure long-term maintainability, testability, and separation of concerns?

## Decision

We will adopt a hybrid of **Domain-Driven Design (DDD)** and **Clean Architecture**. The codebase will be strictly layered: Entities (Domain), Use Cases (Application), Interface Adapters, and Frameworks/Drivers. Business rules will have no dependencies on external frameworks, UI, or databases.

## Alternatives Considered

- **Standard MVC / Three-Tier Architecture:** Rejected because it often leads to "fat controllers" and tightly coupled UI/Database layers in complex frontend applications.
- **Feature Sliced Design (FSD):** Considered, but DDD+Clean provides stronger boundaries for our specific complex domain logic (PDF parsing, sync). We will incorporate some FSD directory structures within the Clean Architecture layers.

## Reasons for Choosing This Solution

Clean Architecture isolates our core competitive advantage (the reading experience and PDF handling) from volatile external dependencies like React, IndexedDB, or specific UI component libraries. This allows us to test the business logic in complete isolation and swap out UI or database technologies if needed.

## Consequences

### Benefits
- Highly testable business logic (unit tests don't need a DOM).
- Clear separation of concerns; developers know exactly where logic belongs.
- Resilient to UI framework churn.

### Trade-offs
- Steeper learning curve for new developers.
- Increased boilerplate code (mappers, DTOs, interfaces) for simple operations.

### Risks
- Over-engineering simple features that don't require the full DDD treatment.

## Future Considerations

We must establish strict linting rules and dependency boundaries to ensure the UI layer never imports directly from the database or framework layers without going through application use cases.

## Related Documents

- Clean Architecture Guidelines

## Implementation Notes

Directories should be structured as `domain`, `application`, `infrastructure`, and `presentation`.

---

## Version History

- **1.0** - 2024-01-04 - Initial Proposal and Acceptance
