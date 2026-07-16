# Cloud Novel AI Workflow

Cloud Novel is built using a highly structured, multi-agent AI development workflow. Different AI models are specialized for different phases of the software development lifecycle to ensure high code quality, strict adherence to architectural principles, and a flawless user experience.

This document details the roles, responsibilities, and handoff points for each AI agent in the pipeline.

---

## The Agents

| Agent | Core Responsibility | Specialization |
| :--- | :--- | :--- |
| **ChatGPT** | Product Management & Final Review | Ideation, UX specifications, requirement gathering, and final acceptance testing. |
| **Stitch** | Prototyping & Scaffolding | Translating requirements into initial component structures, types, and boilerplate. |
| **Codex** | Deep Implementation | Writing complex domain logic, algorithms, and core feature behavior. |
| **Kimi** | Specialized Code Review | Performance profiling, accessibility audits, and defensive programming checks. |
| **Claude** | Refinement & Polish | UI/UX polish, bug fixing, refactoring, and removing technical debt. |
| **Gemini** | Knowledge & Context Orchestration | Generating and maintaining documentation, system analysis, and managing global coding standards. |

---

## Workflow Sequence & Handoff Points

Every major feature follows this strictly enforced sequence. No phase may be skipped.

### Phase 1: Ideation & Specification
**Lead Agent:** ChatGPT
- **Action:** ChatGPT works with human engineers to define the product requirements and UX specifications.
- **Output:** A finalized UX Specification document.
- **Handoff:** The UX Specification is passed to Stitch.

### Phase 2: Scaffolding
**Lead Agent:** Stitch
- **Action:** Stitch reads the UX Spec and generates the basic folder structure, TypeScript interfaces, empty React components, and necessary CSS variables.
- **Output:** Initial branch with boilerplate and un-implemented functions.
- **Handoff:** The scaffolding undergoes Architecture Review (Human + Kimi). Once approved, an Implementation Charter is handed to Codex.

### Phase 3: Core Implementation
**Lead Agent:** Codex
- **Action:** Codex implements the complex business logic, IndexedDB persistence, PDF.js parsing algorithms, and state management hooks.
- **Output:** Functional, feature-complete implementation.
- **Handoff:** Codex completes the implementation and requests a code review from Kimi.

### Phase 4: Code & Performance Review
**Lead Agent:** Kimi
- **Action:** Kimi reviews the implementation against the `CODING_STANDARDS.md` and `ARCHITECTURE.md`. It actively searches for edge-cases, memory leaks, missing dependencies in hooks, and accessibility violations.
- **Output:** A detailed review report with required changes.
- **Handoff:** The review report is passed to Claude for resolution.

### Phase 5: Refinement, Polish, & Bug Fixes
**Lead Agent:** Claude
- **Action:** Claude resolves all issues identified by Kimi. It also performs a "layout polish pass," ensuring CSS perfectly matches the UX spec, animations are smooth, and dead code is removed.
- **Output:** A polished, optimized, and clean codebase.
- **Handoff:** The polished code is sent back to ChatGPT for final product acceptance.

### Phase 6: Final Review & Acceptance
**Lead Agent:** ChatGPT
- **Action:** ChatGPT evaluates the final application behavior against the original UX Specification created in Phase 1. 
- **Output:** Final approval (or rejection with feedback back to Claude).
- **Handoff:** Once approved, the implementation moves to Phase 7.

### Phase 7: Documentation & Knowledge Sync
**Lead Agent:** Gemini
- **Action:** Gemini analyzes the completed feature and updates the `HANDBOOK.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, and `DECISIONS.md` (ADRs) as necessary to reflect the new state of the project.
- **Output:** Updated master documentation.
- **Handoff:** The feature is now ready for a Git Commit and Merge by human engineers.

---

## Strict Rules of Engagement

1. **No Overstepping:** An AI agent must not perform tasks outside its designated phase. (e.g., Stitch does not write complex PDF parsing logic; Claude does not rewrite the product specification).
2. **Handoff Contracts:** Every handoff must be accompanied by a clear summary of what was completed and what is expected of the next agent.
3. **Design Freeze:** Once Phase 1 is complete and Phase 2 begins, the design is frozen. ChatGPT cannot introduce new features during Phase 6.
