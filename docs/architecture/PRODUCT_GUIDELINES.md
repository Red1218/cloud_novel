# Cloud Novel — Product Guidelines & Design System

**Version:** 1.1
**Status:** Living document — update through formal review only
**Owner:** Cloud Novel Product Team

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Identity](#2-product-identity)
3. [Product Philosophy](#3-product-philosophy)
4. [Golden Rules](#4-golden-rules)
5. [Reader Experience Principles](#5-reader-experience-principles)
6. [UI Principles](#6-ui-principles)
7. [Design Language](#7-design-language)
8. [Motion Guidelines](#8-motion-guidelines)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Technology Standards](#10-technology-standards)
11. [Component Philosophy](#11-component-philosophy)
12. [Future Features](#12-future-features)
13. [Decision Checklist](#13-decision-checklist)
14. [Design Review Checklist](#14-design-review-checklist)
15. [Conclusion](#15-conclusion)

---

*See also: [PHASE_TEMPLATE.md](./PHASE_TEMPLATE.md) — mandatory planning template for every implementation phase.*

---

## 1. Product Vision

Cloud Novel is a premium PDF novel reader.

Our mission is singular and non-negotiable:

> **Preserve the book exactly as published while creating the best possible reading experience around it.**

The published page is sacred. Publishers, authors, and typographers made deliberate decisions about every margin, every typeface, every line break, and every page layout. Those decisions belong to the book — not to us.

Our job is to build the finest possible *environment* for reading that book. We improve everything *around* the page. We never touch the page itself.

---

## 2. Product Identity

Understanding what Cloud Novel is — and what it is not — is essential for every product, design, and engineering decision.

### Cloud Novel IS

- **A premium PDF novel reader** — purpose-built for the long-form reading of novels and book-length documents in PDF format.
- **Reader-first** — every decision prioritises the person reading over the application itself.
- **Offline-first** — all core reading functionality works without a network connection.
- **Local-first** — user data lives on the user's device. Cloud features are additive, never a dependency.
- **Publisher-preserving** — the book is displayed exactly as the publisher produced it. No modifications, no reflowing, no substitution.

### Cloud Novel is NOT

- **A PDF editor** — Cloud Novel does not modify, annotate, or alter PDF files.
- **An annotation application** — highlighting, drawing, and markup are not core to the reading experience we serve.
- **An EPUB reader** — Cloud Novel reads PDF. EPUB is a different format with a different rendering model.
- **An OCR tool** — text recognition and extraction are not within the product's scope.
- **A general document manager** — Cloud Novel is not a file manager, a business document tool, or a productivity application. It reads novels.

### Our Purpose

> Our purpose is singular: Deliver the finest possible reading experience while preserving every published page exactly as intended.

---

## 3. Product Philosophy

The hierarchy is fixed and permanent:

### Reader First

The human reading a book is the only audience that matters. Every design decision, every feature, every animation, and every interaction exists to serve the reader — not to impress, not to demonstrate technical capability, not to follow trends.

### Book Second to None

The book is the product. We are the frame. A great frame makes the painting shine. A bad frame competes with it. Cloud Novel is an exceptional frame.

### UI Third

The application interface is infrastructure. It should be invisible when not needed, immediate when needed, and never a source of friction or distraction.

The reader should forget they are using software. They should feel as though they are reading a book.

---

## 4. Golden Rules

These rules are permanent. They cannot be overridden by a feature request, a design trend, or a business decision. They define what Cloud Novel is.

### The Published Page is Inviolable

- **Never modify the published page.** What the publisher produced is what the reader sees.
- **Never reflow PDF text.** Text reflow breaks the author's intended line rhythm, pagination, and typographic intent.
- **Never replace publisher typography.** Substituting fonts destroys the visual identity of the book.
- **Never crop publisher margins.** Margins are part of the reading experience and the page design.
- **Never change page layout.** Column structures, illustrations, and layout are compositional decisions owned by the publisher.
- **Never interfere with the reading experience.** No overlays, banners, tooltips, or interruptions during active reading.

### The Guiding Principle

> We improve everything around the page, not the page itself.

This is not a technical constraint. It is a product value. Every team member, at every level, must understand and defend it.

---

## 5. Reader Experience Principles

### State Restoration

Reading is a long-form activity. Cloud Novel remembers where the reader left off — always.

- **Restore reading state on every open.** A reader who opens a book on Tuesday should land exactly where they stopped on Monday.
- **Restore the last page.** Page position is persisted immediately and reliably.
- **Restore zoom level.** The reader's preferred zoom is remembered per book.
- **Restore scale mode.** If the reader was using Fit Width or a custom zoom, that preference is preserved.

### First Open Behaviour

- **Apply Fit Width on first open only.** This is the most common sensible default for novel-format PDFs. On all subsequent opens, the reader's last zoom state takes precedence.

### Control Visibility

Reading controls should be present when needed and invisible when not.

- **Reader controls auto-hide during reading.** Once the reader begins engaging with a book, the UI retreats.
- **Single tap reveals controls on mobile.** A deliberate, single tap on the reading surface brings controls back.
- **Mouse movement reveals controls on desktop.** Moving the mouse toward a control zone (header, footer) reveals the UI gracefully.

### Environment Quality

- **Minimal interruptions.** Notifications, toasts, and alerts are reserved for genuine errors or confirmation of significant actions. They never appear during active reading.
- **Calm reading environment.** The reading surface is free of noise: no advertising, no onboarding prompts, no unsolicited suggestions.

---

## 6. UI Principles

### Minimal UI

Every element rendered on screen carries a cost — attention. Add only what is essential. Remove anything the reader does not need right now.

### Reader-First

When a UI decision must be made, ask: *Does this serve the reader, or does it serve the application?* If the answer is "the application," remove it.

### Mobile-First

Cloud Novel is designed for the smallest screen first. Desktop layouts are progressive enhancements, not the default. This ensures the core experience is tight, focused, and distraction-free regardless of device.

### Accessibility-First

Accessibility is not a feature. It is a baseline quality standard. Every component, every interaction, every colour choice begins with accessibility requirements, not as an afterthought.

### Consistency Over Novelty

Readers build muscle memory. Consistent interaction patterns — consistent placements, consistent behaviours, consistent language — reduce cognitive load. Novel UI patterns exist to impress; consistent UI patterns exist to serve.

### Elegant Simplicity

Simplicity is the result of removing everything unnecessary, not of never adding anything. The result should feel effortless — which requires considerable effort to produce.

### Calm Interactions

Interactions should feel settled and composed. Nothing startles. Nothing races. Nothing demands attention that has not been explicitly invited.

---

## 7. Design Language

The Cloud Novel visual identity is defined by five qualities: **depth**, **restraint**, **warmth**, **precision**, and **calm**.

### Dark Reading Surface

The default reading environment uses a dark background. This reduces eye strain during extended reading sessions, creates visual contrast that makes the white PDF page emerge naturally, and produces the sensation of a page held in a dark space — a feeling familiar from reading in a dim room.

The dark surface is not a mode. It is the intended experience.

### Floating PDF Page

The PDF page floats visually above the reading surface. It has presence, weight, and dimension. This is achieved through layered shadows and elevation — not through borders or outlines, which would make the page feel framed rather than floating.

### Soft Shadows

Shadows communicate depth and elevation without aggression. They are soft, diffuse, and calibrated. Hard shadows compete with content; soft shadows support it.

### Glass Overlays

UI elements that appear over the reading surface — headers, controls, panels — use semi-transparent, blurred backgrounds. This keeps the overlay visually connected to the page beneath it, maintaining context and continuity for the reader.

### Indigo Accent

The primary accent colour is indigo. Indigo is calm, intellectual, and premium without being aggressive. It is used sparingly — only for primary interactive states, active indicators, and focus rings.

Accent colour is never decorative. It communicates meaning: *this is interactive*, *this is active*, *this is selected.*

### Generous Whitespace

Space is content. Crowding the interface signals anxiety; space signals confidence. Reading interfaces in particular benefit from generous whitespace — it signals that there is room to breathe, room to think, room to read.

### Elegant Typography

The application interface uses a single sans-serif typeface, applied with discipline: controlled size scale, controlled weight scale, controlled colour scale. Type in the UI never competes with the book. The book's typography is always visually dominant.

### Subtle Elevation

The Z-axis communicates hierarchy: reading surface at the base, floating page above it, controls above that. Every layer has a purpose. Elevation is never decorative.

### Responsive Layouts

Every layout adapts fluently across device sizes. Not through breakpoint jumps, but through considered proportional change. The experience should feel natural at every width, not merely functional.

---

## 8. Motion Guidelines

### Motion Has a Purpose

Every animation in Cloud Novel exists for one reason: to communicate information to the reader. It communicates transitions, confirmations, appearances, and disappearances. It does not perform. It does not entertain.

### Preferred Motion Patterns

- **Fade** — the default transition for any element appearing or disappearing. Opacity transitions are the least disruptive motion type.
- **Crossfade** — for transitions between content states. One view fades out as another fades in.
- **Soft opacity transitions** — for hover states, focus states, and interactive feedback.

### Motion to Avoid

- **Bounce** — communicates playfulness. Cloud Novel is not playful.
- **Flash** — aggressive and disorienting.
- **Excessive motion** — any animation that draws the eye away from the content being read is excessive.
- **Motion for decoration** — if removing an animation would not reduce the usability or clarity of an interaction, the animation should be removed.

### Duration Guidance

Transitions should be brief and purposeful:

| Type | Duration |
|------|----------|
| Micro-interactions (hover, focus) | 100-150 ms |
| State changes (element appearing) | 200-250 ms |
| Page-level transitions | 250-350 ms |

Nothing takes longer than 400 ms unless it is communicating a process (e.g. loading).

### Reduced Motion

Cloud Novel fully respects `prefers-reduced-motion`. When a user has requested reduced motion at the operating system level, all animations are suppressed. The layout remains unchanged; only motion is removed. This is not optional — it is a core accessibility commitment.

---

## 9. Accessibility Standards

Cloud Novel targets **WCAG 2.1 Level AA** compliance as a minimum, with AA+ practices applied throughout.

### Keyboard Navigation

Every feature available to mouse and touch users is available to keyboard users. Tab order is logical, predictable, and follows the visual layout. No keyboard traps. No inaccessible interactions.

### Touch Targets

Every interactive element has a minimum touch target of **44 x 44 points**. This applies to all buttons, controls, and interactive areas, regardless of their visual size. Padding is used to meet this requirement without altering visual design.

### Visible Focus States

Keyboard focus is always visible. Focus indicators use the indigo accent colour with sufficient contrast and a consistent ring style. Focus indicators are never hidden, suppressed, or replaced with subtle underlines.

### Colour Contrast

Text contrast meets or exceeds WCAG AA ratios:

| Text type | Minimum ratio |
|-----------|--------------|
| Normal text | 4.5 : 1 |
| Large text | 3 : 1 |
| Interactive components | 3 : 1 |

Contrast is verified against the actual rendered background, not a theoretical background colour.

### High Contrast Support

Cloud Novel functions correctly in high contrast operating system modes. It does not rely on colour alone to communicate state.

### Screen Reader Compatibility

Semantic HTML is used throughout. ARIA roles and labels are applied where native semantics are insufficient. Dynamic content changes are announced appropriately. Screen reader testing is included in the release checklist.

### Reduced Motion

See [Motion Guidelines](#8-motion-guidelines) above. Reduced motion is a first-class accessibility requirement, not an optional enhancement.

---

## 10. Technology Standards

### Core Framework

**React** — component-based UI composition. The application is built as a tree of focused, composable components with clear data flow.

### Styling

**Tailwind CSS** — utility-first styling for consistent, scalable design token application.
**shadcn/ui** — accessible, composable base components that follow the project's design language.

### Architecture

**Domain-Driven Design (DDD)** — the codebase is organised around business domains, not technical layers. Library management, reading state, and content rendering are distinct, bounded domains.

**Clean Architecture** — business logic is independent of framework and infrastructure concerns. Repositories abstract storage. Services abstract processing. Components consume data; they do not produce it.

### Data Strategy

**Offline-first** — Cloud Novel functions without an internet connection. All core reading functionality works locally. No feature degrades because of network absence.

**Local-first** — user data (books, reading state, preferences) lives on the user's device by default. Cloud sync is additive, never a dependency for core functionality.

### State Management

State ownership follows a deliberate hierarchy:

- **Prefer local component state.** If a value is only needed by a single component, it lives there. Do not lift state speculatively.
- **Lift state only when ownership requires it.** When a child needs to communicate with a sibling or a parent needs to coordinate across children, lift state to the nearest common ancestor.
- **Introduce global state only when multiple independent features require shared ownership.** Global stores are not a convenience — they are an architectural commitment. They should be introduced rarely and deliberately.
- **Avoid premature global stores.** Building a global state layer before a clear, cross-feature ownership problem exists creates unnecessary coupling and reduces component reusability.

### Rendering Independence

**Reader rendering is independent from UI.** The PDF rendering pipeline — page rasterisation, scale calculation, text layer generation — operates independently from the application's UI layer. A change to a UI component cannot break reading. A change to the rendering pipeline cannot break the UI.

This is an architectural boundary, not a convention. It must be enforced at every phase of development.

---

## Architecture Decision Records

Major product and architectural decisions for Cloud Novel are recorded in [`docs/DECISIONS.md`](./DECISIONS.md). Every entry in that document answers the following questions:

- **Why was this decision made?** The context and problem that necessitated a decision.
- **Alternatives considered.** What other approaches were evaluated and why they were not chosen.
- **Why this solution was selected.** The reasoning behind the chosen approach.
- **Long-term implications.** How this decision constrains or enables future work.

Decisions recorded in `DECISIONS.md` are binding. Reversing or modifying a recorded decision requires a new entry explaining the change — not an edit to the original.

---

## 11. Component Philosophy

### Prefer Composition

Complex behaviours are assembled from simple, focused components. A sophisticated UI is not a large component — it is many small components working together. Composition enables testing, reuse, and comprehension.

### Reuse Components

When a pattern exists, use it. When a component has been built, extend it. Do not rebuild what already exists. The design system is a shared resource; treat it accordingly.

### Avoid Duplicate Patterns

Two components that serve the same purpose are a maintenance liability and a consistency risk. Before building a new component, verify that an existing component cannot be adapted.

### Keep Components Small

A component that is difficult to understand is too large. A component that cannot be described in one sentence has more than one responsibility. Split it.

### Single Responsibility

Each component does one thing. It renders one concept, manages one concern, or presents one interaction. When a component begins accepting props that control fundamentally different behaviours, it has exceeded its responsibility.

### Presentational vs. Behavioural Separation

Presentational components render data. They do not fetch data, manage state, or perform side effects. Behavioural logic lives in hooks and services. This separation makes components predictable, testable, and reusable.

---

## 12. Future Features

The following capabilities are planned or under consideration for future phases. None have been implemented. All are subject to the product philosophy and the Decision Checklist.

| Feature | Description |
|---------|-------------|
| **Themes** | Alternative visual environments for the reading surface. Light mode, sepia, high-contrast. |
| **Bookmarks** | Reader-placed markers at specific pages. Persistent, restorable, named. |
| **Reading Timer** | Passive measurement of reading session duration. No prompts during reading. |
| **Reading Statistics** | Aggregate data on reading habits, progress, and history. Private and local by default. |
| **Cloud Sync** | Optional synchronisation of library and reading state across devices. Always additive; never a dependency. |
| **User Accounts** | Optional authentication for cloud features. Reading without an account is always fully supported. |
| **Reading Streaks** | Optional tracking of consecutive reading days. Motivational, not compulsory. |
| **Collections** | Reader-defined groupings for organising large libraries. Tags, shelves, or series. |
| **Search** | Full-text search within a book's text layer. Rendered in-context without disrupting the page. |
| **Notes** | Reader-authored notes attached to specific pages or positions. Private and exportable. |

### The Invariant

Every future feature, without exception, must pass the Decision Checklist before it enters planning. Features that cannot pass the checklist are not Cloud Novel features.

---

## 13. Decision Checklist

Every proposed feature, design change, or product addition must be evaluated against the following questions before it is approved for planning or implementation.

---

**1. Does this improve reading?**

Reading is the core activity. If a feature does not make reading better, easier, more comfortable, or more enjoyable — it has no place in Cloud Novel.

---

**2. Does it preserve the original PDF page?**

The published page is not a starting point for customisation. If a feature modifies, reflows, crops, overlays, or alters the visual content of the PDF page in any way, it violates the Cloud Novel contract with the reader and the publisher.

---

**3. Does it reduce distraction?**

Every feature adds surface area — UI, interaction cost, cognitive load. If a feature increases distraction rather than reducing it, it works against the product's purpose.

---

**4. Is it accessible?**

Not "can it be made accessible with extra effort?" — but "is it accessible as designed?" Accessibility must be designed in, not retrofitted. If a feature cannot meet the accessibility standards in this document, it must be redesigned.

---

**5. Does it fit the Cloud Novel philosophy?**

Reader-first. Calm. Minimal. Elegant. Consistent. Offline-capable. Local-first. If a feature conflicts with any of these values, the conflict must be resolved before the feature proceeds.

---

> If any answer is "No," the feature must be reconsidered — not refined, not qualified, not conditionally approved. **Reconsidered.**

---

## 14. Design Review Checklist

Use this checklist when reviewing any design proposal, UI change, or new component before it is approved for implementation.

- [ ] Does this improve reading?
- [ ] Does it preserve the published page?
- [ ] Is the UI calmer as a result?
- [ ] Is it designed mobile-first?
- [ ] Is it accessible as designed (not retrofitted)?
- [ ] Does it follow the design system (tokens, spacing, typography, colour)?
- [ ] Is it visually consistent with existing screens and components?
- [ ] Does it reduce distraction rather than adding to it?

All eight items must be checked before a design is approved. An unchecked item is a reason to revise — not a reason to proceed with a note.

---

## 15. Conclusion

Cloud Novel is not a document viewer.
Cloud Novel is not a PDF annotation tool.
Cloud Novel is not a reading app that happens to support PDFs.

> **Cloud Novel is a premium PDF novel reader.**

We preserve the book exactly as published while creating the best possible environment to enjoy reading.

The book comes first. The reader comes first. Everything else is infrastructure in service of those two priorities.

This document is the product's north star. It does not change with trends. It does not bend to scope pressure. It does not compromise on the reading experience for the sake of shipping velocity.

When in doubt: open a book, read a page, and ask whether the feature you are considering would have made that page better to read.

If the answer is yes — build it well.
If the answer is no — build something else.

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | 2026-07-15 | Initial project standard. All core sections established. |
| 1.1 | 2026-07-15 | Added Product Identity section. Added State Management guidance. Added Architecture Decision Records reference. Added Design Review Checklist. Updated section numbering. Strategic "published page" wording improvements. Cross-references to PHASE_TEMPLATE.md. |

---

*Cloud Novel Product Guidelines v1.1*
*This document is a living standard. Changes require formal team review and must not contradict the Golden Rules or the product philosophy defined herein.*
