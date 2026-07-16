# Review Template

*This template must be completed and submitted by the reviewer (AI or Human) before any feature or phase is considered complete and ready for merge.*

---

## 1. Architecture Review
- [ ] **Boundary Adherence:** Do the changes respect the established boundaries between features, UI, and repositories?
- [ ] **Dependencies:** Are dependencies pointing inward toward the domain or downward toward shared generic layers?
- [ ] **Data Flow:** Is the state management localized properly? Does it avoid unnecessary global state?
- [ ] **PDF Isolation:** Does the PDF rendering engine remain strictly decoupled from the surrounding UI?

*Reviewer Comments (Architecture):*
> 

## 2. Code Quality
- [ ] **TypeScript:** Does the code use strict typing without `any`? Are interfaces used appropriately?
- [ ] **SOLID Principles:** Are components small, single-responsibility, and cohesive?
- [ ] **DRY (Don't Repeat Yourself):** Has duplicated logic been properly extracted into reusable hooks or utilities?
- [ ] **Naming Conventions:** Do all variables, functions, and components follow the naming standards outlined in `CODING_STANDARDS.md`?

*Reviewer Comments (Code Quality):*
> 

## 3. Performance
- [ ] **Re-renders:** Are expensive calculations memoized (`useMemo`) and stable callbacks utilized (`useCallback`)?
- [ ] **Event Handlers:** Are rapid events (scroll, resize) properly debounced or throttled?
- [ ] **Memory Leaks:** Are all side effects and subscriptions properly cleaned up in `useEffect` returns?

*Reviewer Comments (Performance):*
> 

## 4. Accessibility
- [ ] **Keyboard Navigation:** Can all interactive elements be reached and activated via the keyboard?
- [ ] **Semantic HTML:** Are the correct HTML5 elements used instead of generic `div`s?
- [ ] **ARIA Labels:** Do non-text elements (e.g., icon buttons) have proper `aria-label`s?

*Reviewer Comments (Accessibility):*
> 

## 5. Security
- [ ] **Input Validation:** Is all user input (if any) sanitized and validated?
- [ ] **Data Privacy:** Does the application maintain its local-first, offline-first promise? No unexpected external network calls?

*Reviewer Comments (Security):*
> 

## 6. Build Status
- [ ] `npm run build` completed with 0 errors.
- [ ] `npm run lint` completed with 0 errors.
- [ ] `tsc --noEmit` completed with 0 errors.

*Reviewer Comments (Build Status):*
> 

## 7. Manual Testing
- [ ] Verified UI matches the UX Specification across Desktop and Mobile form factors.
- [ ] Verified interactions (buttons, zooming, scrolling) perform as expected without jitter.
- [ ] Verified Edge Cases (e.g., extremely large PDF, extremely short PDF, rapid clicking).

*Reviewer Comments (Manual Testing):*
> 

## 8. Git Status
- [ ] Branch is up to date with `develop`.
- [ ] Working directory is clean and ready for squash/merge.
- [ ] Commit messages follow Conventional Commits formatting.

*Reviewer Comments (Git Status):*
> 

## 9. Recommendation
- **Status:** `[ APPROVED | CHANGES REQUESTED | REJECTED ]`

*Final Summary:*
> 
