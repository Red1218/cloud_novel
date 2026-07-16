# ADR-012 — Reader Environment Principle

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-11

## Owner

Engineering Team

## Related ADRs

- None

## Related Phases

- Phase 2: Core Reader

## Tags

hardware, accessibility, environment

---

## Context

Unlike a physical book, a digital device emits light. Readers use devices in bright sunlight, dim bedrooms, and entirely dark environments. A static, blindingly white background or a UI that doesn't respect system-level hardware settings causes eye strain and ruins the experience.

## Problem Statement

How should the application respond to the physical environment and hardware capabilities of the user's device?

## Decision

We establish the **Reader Environment Principle**. The application must actively adapt to the user's physical environment. This includes supporting system-level light/dark modes, offering true black themes for OLED/AMOLED screens to save battery and reduce glare, and providing fine-grained brightness and warmth (blue light filter) controls directly within the reader, if the platform allows.

## Alternatives Considered

- **Static Theming:** Offering only a light mode or only relying on the system default without offering in-app overrides. Rejected because readers often want a specific reading theme (e.g., sepia) regardless of their system's global setting.
- **Ignoring Hardware Capabilities:** Treating all screens as standard LCDs. Rejected because OLED screens offer significant benefits for night reading if true black (#000000) is utilized.

## Reasons for Choosing This Solution

Reading is an endurance activity. Eye comfort is paramount. By leveraging hardware capabilities and environmental context, we create a more comfortable and personalized experience that encourages longer reading sessions.

## Consequences

### Benefits
- Reduced eye strain for users.
- Improved battery life on OLED devices.
- A highly polished, "native" feel to the application.

### Trade-offs
- Increased complexity in the theming engine, as it must blend PDF rendering (which may have hardcoded white backgrounds) with app-level dark modes.
- Requires testing across various device types and screen technologies.

### Risks
- Applying dark mode to PDFs with transparent images or poorly defined backgrounds can result in unreadable text. We need robust color inversion or blending strategies.

## Future Considerations

Investigate advanced PDF processing to dynamically invert text and background colors without altering image colors, to provide a true dark mode for fixed-layout PDFs.

## Related Documents

- Theming Architecture

## Implementation Notes

The application state must observe `prefers-color-scheme` media queries but also allow explicit user overrides stored in local settings.

---

## Version History

- **1.0** - 2024-01-11 - Initial Proposal and Acceptance
