# Current Phase

## Current Phase Name
- Phase 5.6: Reading Insights
- Status: Objectives drafted from the Roadmap and Product Guidelines; pending UX and architecture approval before implementation.

## Objectives
- Passively measure reading sessions (time spent reading), with no prompts or UI during reading (Product Guidelines: Reading Timer).
- Aggregate reading statistics — time read, pages read, books in progress and finished, recent activity — kept private and local by default (Product Guidelines: Reading Statistics; ADR-004).
- Surface insights outside the reading view, never interrupting reading (ADR-014).

## Out of Scope Items
- Cloud Sync (Phase 5.7).
- Reading Streaks, badges, goals, or notifications (separate optional feature; ADR-003 rejects engagement-driven gamification).
- Any analytics or telemetry that leaves the device.
- AI Reading Assistant (Future).

## Expected Deliverables
- An ADR for reading-session storage (new IndexedDB data and schema version).
- Passive session tracking in the reader that pauses when the page is hidden or the reader is idle.
- Reading statistics on the Dashboard, replacing its "Reading Statistics" placeholder.

## Success Criteria
- Reading time and pages read are recorded without any UI during reading.
- Statistics are accurate, available offline, and stay on the device.
- No measurable impact on page rendering or navigation performance.
- AI assistants correctly identify Phase 5.6 context.
