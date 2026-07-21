# ADR-013 — Reading Environment

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-12

## Owner

Architecture Team

## Related ADRs

- ADR-004 — Offline-first & Local-first

## Related Phases

- Phase 3: Library & Organization

## Tags

state-management, continuity, data-model

---

## Context

A reader's experience is not just the single page they are currently on. It encompasses their progress, their bookmarks, the last chapter they read, and their personalized settings for that specific book. When a user opens the app, they expect to immediately resume exactly where they left off, with the same settings.

## Problem Statement

How do we model and manage the state of the "Reading Environment" to ensure seamless continuity across sessions and devices?

## Decision

We will model the **Reading Environment** as a distinct, persistent state entity separate from the core Library metadata. The Reading Environment state will track the exact reading position (page/offset), active theme overrides for the specific book, and session metadata. This state must be persisted instantly to local storage on every page turn or setting change.

## Alternatives Considered

- **Stateless Reader:** Requiring the user to manually find their page every time they open the app. Rejected as unacceptable for a modern application.
- **Co-locating State with File Metadata:** Storing reading progress in the same database table/object as the author and title metadata. Rejected because reading state mutates constantly (every page turn), while metadata is static. Co-locating them causes unnecessary writes and sync complexities.

## Reasons for Choosing This Solution

Separating the highly volatile Reading Environment state from the static Library metadata optimizes local database writes and simplifies cloud synchronization. It guarantees that the user always drops right back into their book with zero friction.

## Consequences

### Benefits
- Instant resumption of reading.
- Optimized database performance (frequent writes are isolated to small state objects).
- Easier to build "sync progress" features without syncing the entire library catalog.

### Trade-offs
- Requires careful management of local storage to ensure the environment state is never lost during sudden app closures.
- Adds complexity to the state management architecture (e.g., Redux or Zustand stores).

### Risks
- Debouncing page-turn saves too aggressively could lead to lost progress if the app crashes.

## Future Considerations

The Reading Environment model must be designed to support eventual cross-device synchronization (Phase 4).

## Related Documents

- State Management Architecture

## Implementation Notes

Use a fast, synchronous local storage mechanism (or heavily optimized IndexedDB wrapper) for persisting the Reading Environment, ensuring writes happen without blocking the UI thread.

---

## Version History

- **1.0** - 2024-01-12 - Initial Proposal and Acceptance
