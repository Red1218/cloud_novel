# Cloud Novel Technical Debt Register

**Version:** 1.0
**Status:** Living Document

---

## 1. Purpose

Technical debt is a natural byproduct of shipping software, but it must be intentional, tracked, and eventually paid down. 

This Technical Debt Register ensures that shortcuts, postponed refactors, and incomplete architectural visions are visible to the entire engineering team. Technical debt is not "forgotten work"—it is a conscious engineering decision. 

By maintaining this register, we ensure that every debt item has a clear owner, a defined priority, and a target phase for resolution, preventing the slow degradation of the Cloud Novel architecture.

---

## 2. Categories

Technical debt is classified into the following areas:

- **Architecture:** Structural compromises, coupling, or misplaced domain logic.
- **Performance:** Known bottlenecks, memory leaks, or unoptimized rendering.
- **Accessibility:** Missing ARIA labels, contrast issues, or keyboard traps.
- **Reader:** PDF.js integration debt or viewer-specific shortcuts.
- **Library:** IndexedDB schema debt or book management compromises.
- **Infrastructure:** Build tooling, bundling, or dependency issues.
- **Testing:** Missing test coverage or manual verification gaps.
- **Documentation:** Outdated specs or missing context.
- **Developer Experience:** Slow build times, flaky scripts, or poor DX.

---

## 3. Debt Entry Template

Use the following template when recording new technical debt:

```markdown
### [TD-XXX]: [Title]

**Status:** [Open | In Progress | Resolved]  
**Priority:** [Low | Medium | High | Critical]  
**Area:** [Category]  

**Description:**  
Detailed explanation of the debt. What shortcut was taken?

**Reason:**  
Why was this debt incurred? (e.g., Time constraints, deferred complexity).

**Impact:**  
How does this affect the user, performance, or developer experience?

**Risk:**  
What happens if we never fix this?

**Target Phase:** [Phase X.X or Future]  
**Owner:** [Team/Individual]  
**Related ADR:** [ADR-XXX if applicable]  
**Related Phase:** [Phase where debt was incurred]  

**Resolution Strategy:**  
High-level plan for how this debt will be paid down.
```

---

## 4. Initial Entries

### TD-001: Large Vite bundle warning

**Status:** Open  
**Priority:** Medium  
**Area:** Infrastructure  

**Description:**  
The production build currently triggers Vite warnings regarding large chunk sizes (particularly related to PDF.js and React vendor bundles).

**Reason:**  
Code splitting and lazy loading were deferred during the initial MVP builds to focus on feature completeness.

**Impact:**  
Increased initial load time for new users.

**Risk:**  
If left unaddressed, adding more features will bloat the main bundle, severely degrading time-to-interactive on slower networks.

**Target Phase:** Phase 6.0 (Performance Optimization)  
**Owner:** Core Engineering  
**Related Phase:** Phase 5.0  

**Resolution Strategy:**  
Implement dynamic `import()` for the PDF.js worker and heavy viewer components. Configure Rollup `manualChunks` to isolate vendor libraries.

---

### TD-002: Automated testing not yet implemented

**Status:** Open  
**Priority:** High  
**Area:** Testing  

**Description:**  
The project relies entirely on manual verification checklists. No unit, integration, or E2E tests are currently running in CI.

**Reason:**  
Deferred to allow rapid iteration on the core reader UI and IndexedDB schema without the friction of brittle tests.

**Impact:**  
High QA overhead per release. Increased risk of regressions slipping through.

**Risk:**  
As the team scales, manual QA will become a severe bottleneck.

**Target Phase:** Phase 6.0  
**Owner:** Core Engineering  
**Related Phase:** Phase 1.0  

**Resolution Strategy:**  
Introduce Vitest for unit/hook testing, followed by Playwright for E2E user journeys.

---

### TD-003: CI/CD pipeline not implemented

**Status:** Open  
**Priority:** High  
**Area:** Infrastructure  

**Description:**  
There is no automated GitHub Action pipeline enforcing builds, linting, or formatting on Pull Requests.

**Reason:**  
Deferred during the early foundational phases.

**Impact:**  
Code standards are enforced manually via reviews, which is error-prone.

**Risk:**  
Broken builds could accidentally be merged into `develop` or `main`.

**Target Phase:** Phase 6.0  
**Owner:** Core Engineering  

**Resolution Strategy:**  
Implement a basic GitHub Actions workflow to run `npm run lint` and `npm run build` on all PRs targeting `develop` and `main`.

---

### TD-004: Bundle size monitoring absent

**Status:** Open  
**Priority:** Low  
**Area:** Infrastructure  

**Description:**  
We have no automated tracking of how bundle sizes change over time per commit.

**Reason:**  
Deferred until the core CI/CD pipeline is established.

**Impact:**  
Gradual bundle bloat might go unnoticed.

**Risk:**  
Performance regressions might be merged silently.

**Target Phase:** Future  
**Owner:** Core Engineering  

**Resolution Strategy:**  
Integrate a bundle size action (e.g., compressed-size-action) into the CI pipeline once TD-003 is resolved.

---

### TD-005: Reader design token expansion deferred

**Status:** Open  
**Priority:** Medium  
**Area:** Architecture  

**Description:**  
While basic CSS variables exist, a comprehensive, scalable design token system for all reader themes (fonts, spacing, semantic colors) is not fully abstracted.

**Reason:**  
Hardcoded specific values to quickly validate the immersive reader UX in Phase 5.2 and 5.3.

**Impact:**  
Adding new themes or making global typography adjustments requires manual CSS audits.

**Risk:**  
UI inconsistencies will grow as more components are added.

**Target Phase:** Phase 6.0  
**Owner:** UX Engineering  
**Related Phase:** Phase 5.2  

**Resolution Strategy:**  
Refactor `tokens.css` into semantic tiers (global vs. alias vs. component) and replace all hardcoded values in components.

---

### TD-006: Security automation deferred

**Status:** Open  
**Priority:** Medium  
**Area:** Infrastructure  

**Description:**  
No automated dependency scanning (e.g., Dependabot) or static application security testing (SAST) is currently active.

**Reason:**  
The app is entirely offline-first with no backend, reducing the immediate threat model.

**Impact:**  
Vulnerable npm packages must be discovered and patched manually.

**Risk:**  
A compromised dependency could execute malicious code locally in the user's browser.

**Target Phase:** Phase 6.0  
**Owner:** Core Engineering  

**Resolution Strategy:**  
Enable Dependabot alerts and enforce `npm audit` in the future CI pipeline.

---

## 5. Rules

- **Never delete debt.** Historical context is permanent.
- **Mark resolved items as Resolved.** Update the status field rather than removing the entry.
- **Keep historical entries.** Even after resolution, the record explains past architectural shifts.
- **Review debt every major release.** The team must triage the register prior to planning the next major version.

---

## Version History

| Version | Date | Description |
| :--- | :--- | :--- |
| **1.0** | 2026-07-16 | Initial Technical Debt Register. |
