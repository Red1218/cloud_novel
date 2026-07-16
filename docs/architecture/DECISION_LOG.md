# Cloud Novel Decision Log

**Version:** 1.0
**Status:** Living Document

---

## 1. Purpose

This document exists to preserve context and institutional memory for Cloud Novel.

As the project grows, future contributors must be able to understand *WHY* a decision was made without reopening old discussions or repeating past mistakes. Every meaningful decision regarding product direction, architecture, UX, and engineering processes should be recorded here.

This log complements `ADR.md`. While `ADR.md` contains formal, permanent architectural decisions, the `DECISION_LOG.md` is an engineering journal recording the day-to-day context: accepted ideas, rejected ideas, temporary measures, and deferred discussions.

We record:
- **Accepted decisions**
- **Rejected decisions**
- **Deferred decisions**
- **Temporary decisions**

---

## 2. Decision Template

Use the following reusable template when adding new decisions to this log:

```markdown
## YYYY-MM-DD

### Decision
Describe the decision.

### Status
[ Accepted | Rejected | Deferred | Temporary | Superseded ]

### Context
Why was the decision necessary? What problem existed?

### Alternatives Considered
List realistic alternatives.

### Decision
Describe the chosen approach.

### Reasoning
Explain why this solution was selected.

### Consequences
- **Benefits:**
- **Trade-offs:**
- **Future impact:**

### Related
[ ADR | Phase | Issue | Design | Pull Request ]
```

---

## 3. Initial Decision Entries

The following major product and architectural decisions form the foundation of Cloud Novel.

### Decision: Core Identity
**Decision:** Cloud Novel will be a premium PDF novel reader.
**Status:** Accepted
**Reasoning:** Maintain a focused identity instead of becoming a generic PDF application.
**Related:** ADR-001

### Decision: Immutability of Content
**Decision:** The published PDF page is sacred.
**Status:** Accepted
**Reasoning:** Never alter publisher content.
**Related:** ADR-002

### Decision: Immersive Reader UI
**Decision:** Use immersive disappearing reader chrome.
**Status:** Accepted
**Reasoning:** Increase reader immersion.
**Related:** Phase 5.2

### Decision: Reader Tooling
**Decision:** Use floating overlays instead of permanent toolbars.
**Status:** Accepted
**Reasoning:** Reduce visual distraction.

### Decision: Brightness Implementation
**Decision:** Brightness is implemented as an environment overlay.
**Status:** Accepted
**Reasoning:** Do not modify the PDF.
**Related:** Phase 5.3

### Decision: Preset State
**Decision:** Reading presets apply settings once.
**Status:** Accepted
**Reasoning:** Avoid unnecessary preset state complexity.

### Decision: Terminology Update
**Decision:** Rename Reader Settings to Reading Environment.
**Status:** Accepted
**Reasoning:** Reflect product philosophy.

### Decision: Scope of Customization
**Decision:** Reader customization affects only the environment.
**Status:** Accepted
**Reasoning:** Preserve the published page.

### Decision: Design Freeze
**Decision:** Design Freeze after UX approval.
**Status:** Accepted
**Reasoning:** Prevent implementation-time redesign.

### Decision: Architectural Oversight
**Decision:** Architecture changes require explicit approval.
**Status:** Accepted
**Reasoning:** Prevent silent architectural drift.

### Decision: AI Workflow
**Decision:** Use ChatGPT → Stitch → Codex → Kimi → Claude workflow.
**Status:** Accepted
**Reasoning:** Separate planning, implementation and review responsibilities.

---

## 4. Rejected Decisions

The following ideas and approaches were formally evaluated and rejected.

### Decision: Persistent Preset Modes
**Decision:** Persistent reading preset modes.
**Status:** Rejected
**Reasoning:** Adds unnecessary state and UX complexity.

### Decision: PDF Color Manipulation
**Decision:** PDF color manipulation.
**Status:** Rejected
**Reasoning:** Violates "The Published Page is Sacred."

### Decision: System Brightness Integration
**Decision:** System brightness control.
**Status:** Rejected
**Reasoning:** Platform inconsistency. Environment overlay is preferred.

### Decision: Full-Screen Settings
**Decision:** Reader customization as a full-screen settings page.
**Status:** Rejected
**Reasoning:** Breaks immersion.

### Decision: Agile Feature Addition
**Decision:** Adding features during implementation.
**Status:** Rejected
**Reasoning:** Violates Design Freeze.

---

## 5. Future Decisions

*(New decisions should be appended chronologically below this section.)*

### Rules for Future Entries:
- **Never delete historical decisions.** They provide vital context.
- **If a decision changes:** Mark the old entry's status as `Superseded` and reference the newer decision. 
- **Never erase project history.**

---

## Version History

| Version | Date | Description |
| :--- | :--- | :--- |
| **1.0** | 2026-07-16 | Initial decision log. |
