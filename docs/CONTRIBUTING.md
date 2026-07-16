# Contributing to Cloud Novel

**Version:** 1.0
**Status:** Living Document

Welcome to the Cloud Novel repository! We are excited to have you contribute.

Cloud Novel is a premium PDF novel reader. Every line of code, UX decision, and architectural choice serves a single purpose: delivering an unparalleled reading experience. 

This document is your official guide to contributing. It explains our engineering workflow, where to find critical documentation, our development expectations, and how the review process functions.

---

## 1. Before You Start

Do not begin writing code until you understand the philosophical and architectural boundaries of this project. Every contributor (human and AI) must read the following documents in order before making changes:

1. `README.md`
2. `ENGINEERING_HANDBOOK.md`
3. `architecture/PRODUCT_GUIDELINES.md`
4. `architecture/ADR.md`
5. `architecture/DECISION_LOG.md`
6. `architecture/ANTI_PATTERNS.md`
7. `development/CODING_STANDARDS.md`
8. `development/AI_WORKFLOW.md`
9. `development/GIT_WORKFLOW.md`
10. `development/TESTING_GUIDELINES.md`

*(Note: See the Project Documentation Index at the bottom of this file for links and summaries).*

---

## 2. Product Philosophy

Before proposing a feature or fixing a bug, ensure your work aligns with our core principles:

- **The published page is sacred.** We do not alter publisher content, change embedded fonts, or reflow text.
- **The reader comes before the interface.** The UI must never obscure or distract from the document.
- **The page is the hero.** Every pixel exists to support the document.
- **The environment adapts to the reader.** The UI flexes around the document's aspect ratio and zoom.
- **Every feature must improve reader immersion.** If a feature does not directly serve the reading experience, it belongs in another app.

For deep dives into these principles, consult the [Architecture Decision Records (ADRs)](architecture/ADR.md).

---

## 3. Development Workflow

We follow a rigorous, phase-based development workflow. Implementation must **never** begin before architecture approval.

1. **Feature Idea:** Propose the concept.
2. **UX Specification:** Define the exact user experience and interface requirements.
3. **Architecture Review:** Evaluate technical feasibility, data flow, and boundaries.
4. **Design:** Finalize visual assets and component structure.
5. **Design Freeze:** Scope is locked. No new features can be added.
6. **Implementation Charter:** Formalize the execution plan and atomic tasks.
7. **Implementation:** Write the code.
8. **Enterprise Review:** AI and Human code review focusing on performance and standards.
9. **Cleanup:** Remove technical debt and polish the UI.
10. **Final Review:** Verify against the original UX Specification.
11. **Commit:** Prepare a clean, atomic commit.
12. **Merge into `develop`:** Integrate the feature.
13. **Release:** Deploy to `main`.

---

## 4. AI Workflow

Cloud Novel utilizes a strict multi-agent AI workflow. Each model has defined responsibilities. **Do not mix responsibilities unnecessarily.**

- **ChatGPT:** Architecture, Planning, Product decisions, Documentation, Final Review.
- **Stitch:** UI, UX, Design exploration, Scaffolding.
- **Codex:** Primary implementation, Large feature development, Complex algorithms.
- **Kimi:** Independent enterprise code review, Architecture critique, Performance profiling.
- **Claude:** Small fixes, Cleanup, Bug fixing, UI polish.

For detailed handoff procedures, read [`AI_WORKFLOW.md`](development/AI_WORKFLOW.md).

---

## 5. Git Workflow

We maintain a pristine git history to ensure audibility and rollback capability.

- **Feature branches only:** All work occurs on `feature/*`, `bugfix/*`, or `docs/*` branches.
- **Never commit directly to `main`:** `main` is strictly for production releases.
- **Merge feature branches into `develop`:** Use Squash and Merge for features entering `develop`.
- **Merge `develop` into `main` only after validation:** Use `--no-ff` merge commits for releases.
- **Use conventional commit messages:** (e.g., `feat:`, `fix:`, `refactor:`).
- **Never commit unrelated files:** Keep commits atomic.

For branch naming and release tagging, read [`GIT_WORKFLOW.md`](development/GIT_WORKFLOW.md).

---

## 6. Documentation Workflow

Code does not exist in a vacuum. Every major feature requires:

- UX Specification
- Architecture Review
- Implementation Charter
- Documentation Update
- Testing
- Review
- Cleanup

**If documentation is missing, implementation should not begin.** When a feature is completed, relevant files in `docs/` must be updated to reflect the new state of the system.

---

## 7. Code Review Expectations

Every pull request or finalized implementation charter must include the following information for the reviewer:

- **Implementation Summary:** What was built or fixed.
- **Files Created:** List of new additions.
- **Files Modified:** List of altered files.
- **Architecture Notes:** Justification for structural decisions.
- **Build Output:** Proof of a successful build (`npm run build`).
- **Testing Results:** Proof of passing tests and linting.
- **Git Status:** Confirmation of a clean working tree.
- **Known Limitations:** Any edge cases deferred to future phases.

---

## 8. Testing Expectations

Every feature must pass the following gates before merge:

- **Build:** Zero compilation errors.
- **Lint:** Zero static analysis warnings.
- **Manual Verification:** Step-by-step verification against the UX spec.
- **Accessibility Review:** Keyboard navigation and contrast checks.
- **Performance Review:** Validation of 60fps scrolling and rendering.
- **Reader Testing (if applicable):** Verification within the PDF viewer context.
- **Real Device Testing (for reader features):** Validation on physical mobile hardware, not just emulators.

Read [`TESTING_GUIDELINES.md`](development/TESTING_GUIDELINES.md) for the full matrix.

---

## 9. Design Freeze

A **Design Freeze** occurs immediately after UX and Architecture approval, right before the Implementation Charter is drafted. 

After approval:
- **No redesign.**
- **No feature additions.**
- **No UX changes.**

Only the following are permitted:
- Bug fixes.
- Accessibility improvements.
- Performance improvements.
- Alterations forced by unforeseen implementation constraints.

New ideas generated during implementation belong to future phases.

---

## 10. Architecture Changes

If, during implementation, you discover an architectural improvement or a flaw in the original design:

**STOP.**

1. Document the proposal.
2. Wait for approval via an Architecture Review.
3. **Never silently refactor architecture.**

---

## 11. Communication

We value explicit reasoning over implicit assumptions. We encourage all contributors to:

- **Explain reasoning:** Detail *why* you wrote code a certain way.
- **Document trade-offs:** Acknowledge what is sacrificed for performance or speed.
- **Record important decisions:** Update [`DECISION_LOG.md`](architecture/DECISION_LOG.md) when appropriate.
- **Create ADRs:** Draft formal Architecture Decision Records in [`ADR.md`](architecture/ADR.md) for permanent structural choices.

---

## 12. Definition of Done

A feature is complete only when it meets all of the following criteria:

- [x] UX approved
- [x] Architecture approved
- [x] Design frozen
- [x] Build passes
- [x] Manual testing complete
- [x] Documentation updated
- [x] Enterprise review complete
- [x] Cleanup complete
- [x] Final review approved
- [x] Merged into `develop`

---

## 13. Project Documentation Index

Use this index to navigate the repository's guidelines:

| File | Purpose |
| :--- | :--- |
| `README.md` | Project overview, installation, and quick start. |
| `ENGINEERING_HANDBOOK.md` | Master engineering standards and principles. |
| `architecture/ADR.md` | Permanent architecture decisions (Records). |
| `architecture/DECISION_LOG.md` | Historical, day-to-day decisions and rejected ideas. |
| `architecture/ANTI_PATTERNS.md` | Practices, architectures, and UX patterns to explicitly avoid. |
| `architecture/PRODUCT_GUIDELINES.md` | Detailed UX and feature product guidelines. |
| `development/CODING_STANDARDS.md` | React, TypeScript, and CSS coding conventions. |
| `development/TESTING_GUIDELINES.md` | Manual and automated testing requirements. |
| `development/AI_WORKFLOW.md` | Strict AI agent responsibilities and handoffs. |
| `development/GIT_WORKFLOW.md` | Branching, merging, and PR processes. |
| `phases/PHASE_TEMPLATE.md` | Blank template for planning new features. |
| `phases/REVIEW_TEMPLATE.md` | Blank template for reviewing completed features. |

---

## Version History

| Version | Date | Description |
| :--- | :--- | :--- |
| **1.0** | 2026-07-16 | Initial Contributor Guide. |
