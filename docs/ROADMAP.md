# Cloud Novel Product Roadmap

**Version:** 1.0
**Status:** Living Document

---

## 1. Purpose

The roadmap communicates the strategic, long-term product direction for Cloud Novel.

This document is not a backlog of granular bugs or technical debt; it is a high-level view of our ambitions. The roadmap should evolve intentionally, and every feature added to it must rigorously support Cloud Novel's core product philosophy. 

Implementation details are explicitly omitted here. Technical breakdowns belong in individual `PHASE_X_X.md` specifications.

---

## 2. Current Status

### Completed
- [x] **Phase 5.1 — Library UX Polish**
- [x] **Phase 5.2 — Immersive Reading Experience**

### Current
- [▶] **Phase 5.3 — Reading Environment**

---

## 3. Planned Phases

The following features represent the approved strategic direction for Cloud Novel. Priorities and complexities are estimated and subject to change.

| Phase | Goal | Priority | Status | Dependencies | Estimated Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 5.4** | Bookmarks & Reading Navigation | High | Planned | Phase 5.3 | Medium |
| **Phase 5.5** | Search Inside PDF | Medium | Planned | Phase 5.4 | High |
| **Phase 5.6** | Reading Insights | Low | Planned | Phase 5.1 | Low |
| **Phase 5.7** | Cloud Sync | High | Planned | Phase 5.4 | Very High |
| **Phase 6.0** | Cross-device Reading | High | Planned | Phase 5.7 | Very High |
| **Future** | AI Reading Assistant | Medium | Backlog | Phase 5.5 | High |
| **Future** | Collections | Low | Backlog | Phase 5.1 | Medium |
| **Future** | Recommendations | Low | Backlog | Phase 5.7 | High |

---

## 4. Roadmap Principles

To remain on the roadmap, every proposed feature must fundamentally support:

- **Reader Immersion:** Does this pull the reader out of the story?
- **Reader-First Philosophy:** Does this solve a problem for the reader, or is it just a "cool" engineering exercise?
- **Offline-First:** Does this function without an internet connection?
- **Published Page Preservation:** Does this alter the original author's intent or formatting?
- **Performance:** Will this degrade rendering speed or battery life?
- **Accessibility:** Can everyone use this feature natively?

---

## 5. Out of Scope

To prevent architectural drift and feature bloat, the following concepts are permanently intentionally excluded from the Cloud Novel roadmap:

- **General PDF editing:** We are not a document editor.
- **OCR editing:** We do not manipulate embedded text.
- **Office document support:** We exclusively render PDFs.
- **PDF creation:** We consume; we do not produce.
- **Advertising:** Monetization will never occur via in-reader advertisements.
- **Feature bloat:** We reject features that do not directly enhance novel reading.

---

## 6. Roadmap Governance

A roadmap item is a strategic goal, not a mandate to start writing code. Features on this roadmap should **only** move to implementation after successfully clearing the following gates:

1. **UX Approval:** The interface and user journey are fully designed and approved.
2. **Architecture Approval:** The technical execution and data flow are documented and signed off.
3. **Design Freeze:** Scope is locked to prevent implementation-time creep.
4. **Implementation Charter:** Atomic tasks are defined for the engineering team.

---

## Version History

| Version | Date | Description |
| :--- | :--- | :--- |
| **1.0** | 2026-07-16 | Initial Product Roadmap. |
