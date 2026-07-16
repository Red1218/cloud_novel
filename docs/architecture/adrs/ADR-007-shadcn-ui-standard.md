# ADR-007 — shadcn/ui as the Standard Component Library

## Status

[x] Proposed
[x] Accepted
[ ] Implemented
[ ] Superseded
[ ] Deprecated
[ ] Archived

## Date

2024-01-06

## Owner

Frontend Architecture Team

## Related ADRs

- None

## Related Phases

- Phase 1: Foundation
- Phase 3: Library & Organization

## Tags

ui, frontend, design-system

---

## Context

Cloud Novel requires a polished, premium, and accessible user interface for library management, settings, and reading environment controls. Building every component (dropdowns, dialogs, sliders) from scratch is time-consuming and prone to accessibility oversights. However, traditional monolithic component libraries (like Material UI or Ant Design) are difficult to customize and often introduce bloated CSS.

## Problem Statement

What UI component strategy should we adopt to balance development speed, premium design customization, and accessibility?

## Decision

We will adopt **shadcn/ui** as the standard component library. Instead of installing a monolithic npm package, we will copy the source code of required components into our repository. We will use Tailwind CSS for styling these components.

## Alternatives Considered

- **Material UI / Chakra UI / Mantine:** Rejected because overriding their default styling to achieve our specific "premium" aesthetic is often fighting against the framework.
- **Custom Built Components (from scratch):** Rejected due to the immense effort required to handle edge cases, keyboard navigation, and ARIA accessibility standards.

## Reasons for Choosing This Solution

shadcn/ui provides highly accessible, unstyled (or minimally styled) components built on Radix UI primitives. By owning the code, we have total control over the DOM structure and styling via Tailwind. This allows us to create a deeply customized, premium look without the overhead of a heavy UI framework.

## Consequences

### Benefits
- Total control over component styling and behavior.
- World-class accessibility out of the box (via Radix).
- Smaller bundle size compared to monolithic libraries.

### Trade-offs
- We are responsible for maintaining the component code; updates to shadcn/ui upstream must be merged manually if desired.
- Requires proficiency in Tailwind CSS across the team.

### Risks
- Diverging too far from the base components might make future updates difficult.

## Future Considerations

We should establish a strict design token system (colors, spacing, typography) within our Tailwind configuration to ensure consistency across all imported shadcn/ui components.

## Related Documents

- Design System Guidelines

## Implementation Notes

Components should be initialized via the shadcn CLI and placed in `src/presentation/components/ui`.

---

## Version History

- **1.0** - 2024-01-06 - Initial Proposal and Acceptance
