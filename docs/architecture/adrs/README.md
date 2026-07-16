# Architecture Decision Records (ADRs)

This document explains how Architecture Decision Records work in Cloud Novel.

## Purpose

Architecture Decision Records (ADRs) document permanent, significant engineering decisions made during the development of Cloud Novel. They provide a historical record of *why* a decision was made, not just *what* the decision was, preventing circular debates and ensuring future contributors understand the rationale behind the current architecture.

## When to create an ADR

You should create an ADR when making a decision that:
- Significantly impacts the system's architecture (e.g., introducing a new layer, changing the database paradigm).
- Introduces a new foundational technology or framework (e.g., adopting a new state management library).
- Enforces a new project-wide engineering standard or pattern.
- Involves significant trade-offs that need to be documented.
- Alters the primary user experience flow fundamentally.

## When NOT to create an ADR

Do not create an ADR for:
- Trivial, easily reversible decisions (e.g., changing a variable name, refactoring a single small component).
- Standard implementation details that do not affect the broader architecture.
- Decisions already covered by existing ADRs or established industry best practices (unless deviating from them).
- Feature requirements or product specifications (these belong in product docs).

## ADR Lifecycle

1. **Proposed:** An engineer identifies a need, drafts the ADR using the template, and submits it for review.
2. **Accepted:** The architecture team reviews, discusses, and accepts the proposal. The decision is now official.
3. **Implemented:** The decision has been fully realized in the codebase.
4. **Superseded:** A new ADR is accepted that replaces or fundamentally alters this decision.
5. **Deprecated:** The decision is no longer relevant, but the implementation may still exist temporarily.
6. **Archived:** The decision is completely removed from active relevance and kept only for historical context.

## Naming Conventions

ADRs must follow a strict naming convention: `ADR-XXX-[kebab-case-title].md`.
- `XXX`: A sequential, zero-padded, three-digit number.
- `[kebab-case-title]`: A descriptive title in kebab-case.

Examples:
- `ADR-001-premium-pdf-novel-reader.md`
- `ADR-002-the-published-page-is-sacred.md`

## Review Workflow

1. **Draft:** Create a branch and draft the ADR using `docs/architecture/templates/ADR_TEMPLATE.md`.
2. **Pull Request:** Open a PR targeting the main branch.
3. **Discussion:** Invite relevant stakeholders (engineers, leads, product) to review.
4. **Resolution:** Address feedback. The ADR must reach consensus among core maintainers.
5. **Merge:** Once accepted, the PR is merged, and the ADR transitions to "Accepted."

## Relationship with Decision Log

The [Decision Log](../DECISION_LOG.md) is a lightweight tracker for minor, day-to-day project decisions that do not warrant a full ADR. If a decision requires an ADR, it may be referenced in the Decision Log, but the ADR serves as the source of truth.

## Relationship with Engineering Handbook

The Engineering Handbook contains current practices and how-tos. ADRs document the *decisions* that led to those practices. When an ADR is accepted, the Engineering Handbook should be updated to reflect the new reality.

## Examples of good ADRs

- **Adopting a new state management library:** Clearly outlines why Redux was chosen over Zustand, including the specific trade-offs for Cloud Novel's use case.
- **Micro-frontend architecture:** Documents the decision to split the reader and the library into separate deployable units.

## Examples of decisions that should NOT become ADRs

- **Naming a utility function:** "Decision to name the date formatter `formatDate` instead of `parseDate`."
- **Choosing a specific CSS color hex code:** "Decision to use `#FFFFFF` for the background."

## Best Practices

- Keep it concise but comprehensive.
- Focus on the *why*.
- Be honest about trade-offs and risks.
- Keep the language professional and objective.
- Update the status when the ADR is superseded or implemented.

## Version History

- **Version 1.0**: Initial creation of the ADR process for Cloud Novel.
