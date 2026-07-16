# Cloud Novel Engineering Handbook

Welcome to the Cloud Novel engineering handbook. This document serves as the primary reference for all developers and AI agents working on the project. It defines our product philosophy, engineering principles, quality standards, and official workflows.

---

## Vision

Cloud Novel is a premium PDF novel reader.

The published page is sacred.

The application exists to create the best possible reading experience.

The reader is always more important than the interface.

---

Documentation Version: 1.0

Status: Frozen

Last Updated:

YYYY-MM-DD

Maintained By:

Engineering


## Product Philosophy

- **Reader-first.** Every decision must prioritize the reading experience over aesthetic novelty or developer convenience.
- **Offline-first.** The application must function flawlessly without an active internet connection.
- **Local-first.** User data and documents reside primarily on the user's device, ensuring privacy and ownership.
- **The PDF page must never be modified.** We do not alter, watermark, or re-render the underlying document structure.
- **UI surrounds the page. Never the opposite.** The page is the central artifact; the user interface exists strictly to frame and navigate it, never to obscure it.

---

## Engineering Principles

- **Clean Architecture.** Enforce clear boundaries between domains, data, and presentation.
- **DDD (Domain-Driven Design).** Model software to match the business domain explicitly.
- **SOLID.** Adhere strictly to the five principles of object-oriented and component design.
- **Composition over inheritance.** Build flexible, decoupled systems by composing small, focused units.
- **Feature-first architecture.** Group files and logic by feature, not by technical role.
- **Reusable components.** Extract common UI patterns into generalized, uncoupled components.
- **Minimal coupling.** Systems should know as little about each other as possible.
- **Maximum cohesion.** Code that changes together should live together.
- **Accessibility first.** Accessibility is a core requirement, not an afterthought.
- **Performance first.** Optimize for rapid load times, smooth scrolling, and minimal memory footprint.

---

## Documentation Standards

No feature begins without documentation. Every feature requires the following lifecycle:

1. **UX specification:** Define the user experience and interface requirements.
2. **Architecture review:** Evaluate the technical approach against our engineering principles.
3. **Implementation charter:** Formalize the execution plan and acceptance criteria.
4. **Code review:** Ensure adherence to style, architecture, and performance guidelines.
5. **Cleanup:** Remove technical debt, dead code, and temporary scaffolding.
6. **Documentation update:** Ensure this handbook, ADRs, and inline documentation reflect the new state of the system.

---

## Design Freeze Policy

A **Design Freeze** is declared once a UX specification and Architecture Review are approved. 

**What happens after a Design Freeze:**
- **No new features.** Scope is strictly locked.
- **No architectural redesigns.** The approved structure must be followed.
- **No major UI deviations.** The implementation must match the approved specification.

Changes after a design freeze are strictly limited to bug fixes, performance optimizations, and minor layout polish (e.g., spacing adjustments) that do not alter the fundamental architecture or feature set.

---

## AI Workflow

Cloud Novel utilizes a strict, multi-agent AI workflow to ensure quality and consistency. The official workflow is:

1. **ChatGPT:** Initial product ideation, UX specification, and requirements gathering.
2. **Stitch:** Translating requirements into initial code scaffolds and component structures.
3. **Architecture Review:** Human and AI evaluation of the proposed implementation against Clean Architecture principles.
4. **Implementation Charter:** Formalizing the exact steps required for development.
5. **Codex:** Deep implementation of complex logic and algorithms.
6. **Kimi Review:** Specialized code review focusing on performance, accessibility, and edge cases.
7. **Claude Cleanup:** Refactoring, bug fixing, layout polish, and removing dead code.
8. **ChatGPT Final Review:** Final verification against the original UX specification.
9. **Commit:** Preparing the atomic, well-documented commit.
10. **Merge:** Integration into the main development branch.

**Responsibility of each AI:**
- **ChatGPT:** High-level reasoning, product direction, and final sign-off.
- **Stitch:** Rapid prototyping and initial scaffolding.
- **Codex:** Complex, domain-specific algorithm implementation.
- **Kimi:** Critical review and defensive programming enforcement.
- **Claude:** Refinement, polish, and surgical bug fixes.

---

## Git Workflow

- **Feature branches:** All development must occur on dedicated feature branches branched from `develop`.
- **No direct commits to main:** The `main` (and `develop`) branches are protected.
- **Merge strategy:** Use squash-and-merge or rebase to maintain a linear, clean project history.
- **Commit message format:** Use conventional commits (e.g., `feat:`, `fix:`, `refactor:`). Messages must be descriptive and explain *why*, not just *what*.
- **Branch naming:** Use standard prefixes (e.g., `feature/`, `bugfix/`, `hotfix/`, `docs/`) followed by a hyphen-separated description.

---

## Review Standards

Every implementation submitted for review must include the following information:

1. **Implementation Summary:** A concise overview of what was built or fixed.
2. **Files Created:** A list of new files added to the repository.
3. **Files Modified:** A list of existing files that were altered.
4. **Architecture Notes:** Justification for any structural decisions made during implementation.
5. **Build Output:** Proof that the application builds successfully without errors or new warnings.
6. **Manual Verification:** A checklist of manual tests performed to ensure quality.
7. **Git Status:** Confirmation of a clean working directory ready for commit.

---

## Coding Principles

- **Small components.** Keep components focused on a single task or UI element.
- **Single Responsibility.** Every function, class, and module should have only one reason to change.
- **No duplicated logic.** DRY (Don't Repeat Yourself). Extract shared logic into utility functions or hooks.
- **No magic numbers.** Define all constants explicitly with descriptive names.
- **Accessibility.** Ensure proper ARIA roles, keyboard navigation, and contrast ratios.
- **Performance.** Avoid unnecessary re-renders. Memoize expensive calculations.
- **Reader rendering isolated from UI.** The PDF rendering engine must remain completely decoupled from the surrounding chrome and application state.

---

## Architecture Principles

To maintain a scalable and maintainable codebase, we strictly enforce boundary isolation:

- **Reader rendering independent:** The core PDF display logic knows nothing about the application.
- **Repositories independent:** Data access layers do not leak persistence details to the domain.
- **UI independent:** Presentation components consume data but do not dictate business rules.
- **Business logic independent:** Core domain rules do not depend on UI or databases.
- **Persistence independent:** The choice of database (e.g., IndexedDB) can be swapped without affecting the domain.

---

## Quality Gates

Before any phase or feature can be considered complete, it must successfully pass all of the following gates:

1. **Architecture Review:** Conformance to Clean Architecture and minimal coupling.
2. **Build:** Zero compilation errors or build-step warnings.
3. **Manual Testing:** Verification of the feature on target devices and screen sizes.
4. **Code Review:** Peer or AI review against coding principles and SOLID guidelines.
5. **Cleanup:** Removal of all temporary code, logs, and unused imports.
6. **Final Review:** Final sign-off against the Implementation Charter.

---

## Future Contributors

Welcome to Cloud Novel. As you contribute to this project, your primary responsibility is to **preserve the product philosophy**. 

Before proposing a new feature, modifying the UI, or refactoring the architecture, ask yourself: *Does this serve the reader? Does it obstruct the published page?* 

Adhere strictly to the guidelines in this handbook. Favor stability, performance, and simplicity over complexity. Read the ADRs in `docs/DECISIONS.md` to understand historical context. 

We are building a premium tool. The quality of your code should reflect the quality of the reading experience we provide.
