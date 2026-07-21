# ADR-014 — Reader Immersion Principle

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-13

## Owner

Design Team

## Related ADRs

- ADR-003 — Reader-first Philosophy
- ADR-011 — Page Prominence Principle

## Related Phases

- Phase 2: Core Reader

## Tags

ux, immersion, interaction-design

---

## Context

Modern operating systems and web browsers are inherently distracting. They feature status bars, notification banners, battery indicators, and URL bars. These elements constantly pull the user's attention away from the narrative of the novel.

## Problem Statement

How do we design the active reading state to maximize deep focus and minimize external distractions?

## Decision

We enforce the **Reader Immersion Principle**. When a user enters the active reading state (i.e., they are turning pages), the application must aggressively eliminate all non-essential UI. This means defaulting to full-screen APIs where available, hiding OS status bars (on mobile/PWA), auto-hiding all application menus, and suppressing non-critical in-app notifications.

## Alternatives Considered

- **Standard Windowed Mode:** Always showing the browser chrome or OS status bar. Rejected because it breaks the boundary between the "real world" (notifications) and the "book world."
- **Manual Full-screen Only:** Forcing the user to click a specific button to enter full screen. Rejected because users often don't bother, settling for a sub-optimal, distracted reading experience.

## Reasons for Choosing This Solution

Immersion is the goal of reading fiction. By programmatically removing the digital environment's "noise," we simulate the focused experience of holding a physical book, aligning perfectly with our Reader-first philosophy.

## Consequences

### Benefits
- Deeply focused reading experience.
- Better utilization of screen real estate.
- Higher perceived value as a premium "dedicated" reader rather than just a web app.

### Trade-offs
- Users cannot easily check the time or battery life without interacting to break immersion.
- Full-screen APIs in web browsers can be notoriously inconsistent and require user gestures to initiate.

### Risks
- Aggressive auto-hiding of UI can trap users if the gestures to reveal the UI (e.g., tap center) are not intuitive.

## Future Considerations

We need to implement a robust, reliable interaction model to break immersion gracefully (e.g., a single tap anywhere in the center 60% of the screen) to reveal the UI, exit full screen, and check the time.

## Related Documents

- Interaction Design Specs

## Implementation Notes

Utilize the Web Fullscreen API upon the user opening a book. For mobile PWAs, configure the `manifest.json` `display` property to `fullscreen` or `standalone` to minimize OS chrome.

---

## Version History

- **1.0** - 2024-01-13 - Initial Proposal and Acceptance
