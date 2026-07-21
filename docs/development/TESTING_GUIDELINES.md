# Cloud Novel Testing Guidelines

**Version:** 1.0
**Status:** Living Document

---

## 1. Purpose

Testing is a required engineering activity, not an optional final step. 

Every feature, refactor, and bug fix must pass rigorous verification before merging into the main branch. Our testing strategy ensures that regressions are prevented and Cloud Novel's core product philosophy is preserved across updates.

---

## 2. Testing Philosophy

Cloud Novel is a premium PDF novel reader. The reading experience is paramount. Therefore, testing should prioritize:

- **Reading Experience:** Is the UI invisible when it needs to be? Does it frame the page perfectly?
- **Performance:** Are page loads instantaneous? Is zooming completely fluid?
- **Accessibility:** Is the reader universally operable via keyboard and assistive tech?
- **Reliability:** Is offline persistence flawless? Are large PDFs handled without crashes?
- **Reader Immersion:** Do notifications, alerts, or animations interrupt the reading flow?

---

## 3. Testing Pyramid

Cloud Novel's testing strategy balances immediate manual quality assurance with a long-term vision for automation.

### Current Project Status
At this stage of development, we rely heavily on strict manual verification driven by rigorous checklists. As the foundational architecture solidifies, we will transition towards an automated pyramid.

1. **Manual Testing:** Thorough verification by human and AI reviewers against detailed device and interaction checklists.
2. **Component Testing:** Isolation testing of pure UI functions and highly complex React hooks.
3. **Integration Testing:** Ensuring the IndexedDB persistence layer accurately feeds the UI via repositories.
4. **Future End-to-End Testing:** Simulated user journeys (importing a book, reading, customizing settings) across real browser engines.

---

## 4. Required Testing Before Merge

Every feature branch must complete the following steps before being merged:

1. **Build:** Must compile successfully without errors or new warnings (`npm run build`).
2. **Lint:** Must pass all static analysis checks (`npm run lint` & `tsc --noEmit`).
3. **Manual Verification:** Completion of the relevant checklists below.
4. **Architecture Review:** Verification against `ANTI_PATTERNS.md` and `ARCHITECTURE.md`.
5. **Code Quality Review:** Validation against `CODING_STANDARDS.md`.
6. **Cleanup:** Removal of all temporary code, logs, and technical debt.
7. **Final Review:** Final sign-off ensuring the implementation meets the original UX Spec.

---

## 5. Desktop Testing

Verify the application across standard and large desktop environments:

- [ ] **Mouse:** Hover states, precise clicking, drag-to-scroll.
- [ ] **Keyboard:** Full keyboard navigation (`Tab`, `Space`, `Arrow` keys).
- [ ] **Trackpad:** Two-finger scrolling and zooming.
- [ ] **Window Resize:** Smooth layout reflows when rapidly resizing the browser window.
- [ ] **Large Monitors:** Layout remains constrained and readable on ultra-wide screens.
- [ ] **Small Monitors:** Core features remain accessible on 13-inch displays.
- [ ] **Reader Chrome:** Top and bottom bars appear/disappear smoothly.
- [ ] **Scrolling:** Native browser scrolling feels frictionless.
- [ ] **Zoom:** Custom zoom steps correctly without jumping.
- [ ] **Theme Switching:** Colors update instantly across the entire application.
- [ ] **Reader Settings:** Environment sliders update the reading view in real-time.

---

## 6. Mobile Testing

Verify the application natively behaves on mobile form factors:

- [ ] **Portrait:** The page fits cleanly edge-to-edge.
- [ ] **Landscape:** The page scales properly without vertical clipping.
- [ ] **Touch Interactions:** Taps are registered accurately; no delay (300ms tap delay eliminated).
- [ ] **Bottom Sheet:** Settings sheets slide up smoothly and can be dismissed via swipe or tap outside.
- [ ] **Reader Controls:** Tap zones are large enough (minimum 44x44px).
- [ ] **Zoom Gestures:** Pinch-to-zoom (browser native) and button zoom work flawlessly.
- [ ] **Scrolling:** Touch momentum scrolling is active (`-webkit-overflow-scrolling: touch`).
- [ ] **Brightness:** Overlay masks the screen without altering the DOM beneath.
- [ ] **Themes:** Background colors extend to the safe areas and overscroll regions.
- [ ] **Safe Areas:** UI respects notches and system gesture bars (`env(safe-area-inset-*)`).
- [ ] **Different Screen Sizes:** Test on standard phones (iPhone SE size) and large phones/phablets.

---

## 7. Reader Testing

The core reader requires exhaustive verification:

- [ ] **PDF Renders Correctly:** Fonts, images, and formatting match the source document.
- [ ] **Fit Width:** The page expands to fill horizontal space, margins center automatically.
- [ ] **Fit Page:** The entire page is visible vertically without scrolling.
- [ ] **Manual Zoom:** Zooming progresses smoothly from the current effective scale.
- [ ] **Page Navigation:** Next/Previous buttons and arrows correctly advance the document.
- [ ] **Progress Restoration:** Returning to a book opens it to the exact last read page.
- [ ] **Brightness Overlay:** The dark mask applies uniformly.
- [ ] **Theme Switching:** Sepia, Dark, and Light modes adjust background and UI chrome accurately.
- [ ] **Auto-hide Controls:** Tapping the center of the screen toggles the UI chrome.
- [ ] **Motion Settings:** Reduced motion prevents sliding animations.
- [ ] **Reader Presets:** "Modern" and "Classic" configurations apply settings instantly.

---

## 8. Library Testing

Verify the book management flow:

- [ ] **Import:** PDFs upload correctly and extract titles/metadata (if available).
- [ ] **Duplicate Detection:** Uploading the same book handles errors gracefully or replaces the file.
- [ ] **Book Removal:** Deleting a book wipes it completely from IndexedDB.
- [ ] **Continue Reading:** Clicking a book launches the Reader precisely where the user left off.
- [ ] **Sorting:** Books order correctly by recent, title, or progress.
- [ ] **Statistics:** Reading progress percentages calculate accurately.
- [ ] **Empty State:** A beautiful, clear CTA appears when no books exist.

---

## 9. Accessibility Testing

Verify that the app is fully accessible:

- [ ] **Keyboard Navigation:** Users can access the Library, open a book, turn pages, change settings, and return to the library without a mouse.
- [ ] **Focus Indicators:** Every focused element has a clear, high-contrast visual outline.
- [ ] **Screen Reader Labels:** Icon-only buttons have descriptive `aria-label` attributes.
- [ ] **ARIA:** Dialogs, menus, and overlays use correct `role` attributes and trap focus.
- [ ] **WCAG AA:** Contrast ratios meet the 4.5:1 standard.
- [ ] **Touch Target Size:** Interactive elements on mobile are at least 44x44 CSS pixels.
- [ ] **Color Contrast:** Text remains legible across all three theme modes.
- [ ] **`prefers-reduced-motion`:** Animations are disabled at the OS level if requested.

---

## 10. Performance Testing

Verify the application remains light and fast:

- [ ] **Build Success:** The CI/CD pipeline completes without failure.
- [ ] **No Runtime Errors:** The browser console is completely free of errors and React warnings.
- [ ] **Bundle Size:** Chunk sizes remain within acceptable limits; code splitting is utilized.
- [ ] **Memory Usage:** Uploading a large PDF does not crash the browser tab.
- [ ] **Reader Responsiveness:** Page turns happen instantly (or show a fast loading skeleton).
- [ ] **Rendering Performance:** The PDF canvas does not redraw unnecessarily when unrelated state changes.
- [ ] **No Unnecessary Rerenders:** Using React DevTools, verify that typing or clicking doesn't re-render the entire app tree.

---

## 11. Regression Checklist

Before final sign-off, explicitly verify the following:

- [ ] **Existing features still work:** New features did not break core reading.
- [ ] **No UI regressions:** Layout spacing, fonts, and colors remain exact.
- [ ] **No reader regressions:** The PDF still renders at 60fps.
- [ ] **No performance regressions:** Interactions remain instant.
- [ ] **No accessibility regressions:** Focus outlines and ARIA labels are intact.

---

## 12. Future Automation

*This section details our future roadmap for test automation. Implementations will be filled in as architecture matures.*

- **Vitest:** For unit testing hooks, utilities, and repository logic.
- **Playwright:** For End-to-End browser simulation and mobile emulation.
- **GitHub Actions:** For enforcing builds, linting, and automated test execution on PRs.
- **Visual Regression Testing:** For ensuring pixel-perfect layout stability in the Reader view.
- **Performance Benchmarking:** For tracking PDF rendering times and memory consumption per commit.

---

## 13. Testing Rules

- **Never merge without testing.** There are no exceptions for "quick fixes."
- **Never rely solely on AI review.** Human verification of the reading experience is mandatory.
- **Always verify on a real device for reader features.** Emulators are insufficient for judging touch latency and reading comfort.
- **Document discovered regressions.** If you find a bug during QA, document it explicitly so it becomes part of the permanent regression suite.
- **Fix critical issues before merge.** Do not merge known bugs with the intention of fixing them in a future phase.

---

## Version History

| Version | Date | Description |
| :--- | :--- | :--- |
| **1.0** | 2026-07-16 | Initial Testing Guidelines. |
