# Active Decisions

This document summarizes important active engineering decisions that are not yet formalized into historical Architectural Decision Records (ADRs).

| Decision | Reason | Status | Owner | Related ADR |
| :--- | :--- | :--- | :--- | :--- |
| **AI Context System Implementation** | To allow rapid onboarding of AI assistants without relying on chat memory. | **Approved / Active** | Engineering Team | N/A |
| **Bookmark Engine Architecture** | To completely decouple bookmark state from UI, persistence was implemented via a dedicated `bookmarkService.ts` communicating with IndexedDB. Headless hooks bridge the UI and service. | **Approved / Active** | Engineering Team | N/A |
| *[Template: Component X Library Choice]* | *[Reasoning for choice]* | *[Proposed/Review/Active]* | *[Name]* | *[Link if applicable]* |

*(Note: Once a decision is finalized and affects architecture, it should be moved to `docs/architecture/decisions/` and removed from here.)*

## Assumptions & Future Extension Points
- **Assumptions (Phase 5.4):** Bookmarks are tightly coupled to a `page` number rather than a specific text offset. This relies on the assumption that page counts are deterministic and do not reflow.
- **Extension Points:** The `bookmarkService.ts` can be extended in Phase 5.7 to sync data to a cloud backend via a sync adapter without needing to rewrite the UI logic.
