# Phase Template

This document serves as the master template for all future development phases. Copy this template to track progress and ensure strict adherence to Cloud Novel's engineering principles.

---

## 1. Goal
*Describe the high-level objective of this phase. What is the business or user value?*

> 

## 2. Scope
*Explicitly state what is IN scope and OUT of scope for this phase. This prevents feature creep and ensures architectural boundaries are respected.*

**In Scope:**
- 

**Out of Scope:**
- 

---

## 3. UX Specification
*Define the exact user experience. How does the user interact with the feature? What does it look like? Reference Figma files or wireframes if applicable.*

- **UI Elements:** 
- **Interactions:** 
- **States (Loading, Error, Empty):** 

---

## 4. Architecture Review
*Analyze how this feature fits into the existing architecture. Define data flow, required state management, and the boundaries it will interact with. This must be approved before implementation begins.*

- **State Management:** 
- **Persistence (IndexedDB):** 
- **Feature Dependencies:** 

*(Ensure no domain logic leaks into presentation components, and PDF parsing remains isolated).*

---

## 5. Implementation Charter
*A detailed step-by-step technical plan. Break down the work into logical, atomic tasks.*

- [ ] Task 1: 
- [ ] Task 2: 
- [ ] Task 3: 

---

## 6. Acceptance Criteria
*A bulleted list of conditions that must be met for this phase to be considered successful. This should map directly back to the UX Specification.*

- [ ] Criteria 1: 
- [ ] Criteria 2: 

---

## 7. Testing
*Define the testing strategy for this phase. How will it be validated?*

- **Unit Tests Required:** 
- **Integration Tests Required:** 
- **Manual Verification Steps:**
  1. 
  2. 

---

## 8. Review
*Execute the standard review template. An AI or Human reviewer must complete this.*

- [ ] Architecture Review Passed
- [ ] Code Quality Verified
- [ ] Performance Validated
- [ ] Accessibility Checked
- [ ] Security Audited

*(Link to completed `REVIEW_TEMPLATE.md` output)*

---

## 9. Cleanup
*Technical debt removal and final polish.*

- [ ] Remove all `console.log` statements and debugging code.
- [ ] Delete unused imports and dead code.
- [ ] Refactor repetitive blocks into reusable hooks/components.
- [ ] Perform a UI polish pass (spacing, transitions, z-index validation against `tokens.css`).

---

## 10. Merge Checklist
*Final verification before merging into `develop`.*

- [ ] Build passes (`npm run build`).
- [ ] Linter passes (`npm run lint`).
- [ ] TypeScript check passes (`tsc --noEmit`).
- [ ] Commit history is clean and uses Conventional Commits.
- [ ] Documentation (`HANDBOOK.md`, `ARCHITECTURE.md`, `CHANGELOG.md`) is updated if necessary.
- [ ] PR opened and approved.
