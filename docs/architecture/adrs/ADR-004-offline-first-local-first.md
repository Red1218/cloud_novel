# ADR-004 — Offline-first & Local-first

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-03

## Owner

Engineering Team

## Related ADRs

- None

## Related Phases

- Phase 2: Core Reader
- Phase 4: Sync & Cloud

## Tags

data-architecture, network, storage

---

## Context

Readers consume books in various environments: on airplanes, subways, and in remote areas with poor connectivity. Relying on a constant internet connection for rendering pages, tracking progress, or accessing the library is unacceptable for a premium reading application.

## Problem Statement

What is the fundamental data and network architecture for Cloud Novel regarding data storage, state management, and cloud synchronization?

## Decision

We will adopt an **Offline-first & Local-first** architecture. The application must treat the local device storage as the primary source of truth for immediate operations. The cloud acts as a secondary synchronization layer, not a requirement for the core reading experience.

## Alternatives Considered

- **Cloud-first / Thin Client:** Streaming pages from a server and requiring a connection for basic operations. Rejected due to high latency and inability to function offline.
- **Manual Download Only:** Forcing users to manually download files before reading, without intelligent background syncing. Rejected as it degrades UX.

## Reasons for Choosing This Solution

An offline-first approach guarantees zero-latency page turns, immediate access to the active library, and a seamless reading experience regardless of network conditions.

## Consequences

### Benefits
- Extremely fast performance for reading and navigation.
- Uninterrupted reading in all environments.
- Reduced server load and bandwidth costs.

### Trade-offs
- High complexity in data synchronization and conflict resolution (e.g., progress syncing across devices).
- Increased local storage requirements on the user's device.
- More complex client-side database architecture (e.g., IndexedDB/Local SQLite).

### Risks
- Sync conflicts could lead to lost reading progress or corrupted state if not handled robustly.

## Future Considerations

We must design robust Conflict-Free Replicated Data Types (CRDTs) or robust timestamp-based resolution strategies for reading progress and bookmarks to handle multi-device offline usage.

## Related Documents

- Architecture Overview

## Implementation Notes

All data mutations (saving progress, adding a bookmark) must be written locally first and succeed immediately for the user, then queued for background synchronization with the cloud.

---

## Version History

- **1.0** - 2024-01-03 - Initial Proposal and Acceptance
