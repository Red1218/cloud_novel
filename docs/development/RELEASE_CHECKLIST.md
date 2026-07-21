# Cloud Novel Release Checklist

This document outlines the mandatory steps required before any release can be cut and deployed to production. Every step must be verified by the release engineer or the designated AI agent.

---

## Pre-Release Verification

### 1. Build
- [ ] Ensure all local changes are committed.
- [ ] Switch to the `develop` branch and pull the latest changes.
- [ ] Run a clean install: `npm ci`
- [ ] Execute the production build: `npm run build`
- [ ] Verify that the build completes successfully with zero compilation errors and no new warnings.

### 2. Lint & Static Analysis
- [ ] Run the linter: `npm run lint`
- [ ] Verify there are no ESLint errors or unhandled warnings.
- [ ] Run the TypeScript compiler check: `tsc --noEmit`
- [ ] Verify zero type errors.

### 3. Tests
- [ ] Run the automated test suite: `npm test`
- [ ] Ensure all unit and integration tests pass.
- [ ] Check test coverage to ensure no significant drops in critical paths (e.g., Reader hooks, PDF rendering logic).

### 4. Manual Verification
- [ ] Start the preview server: `npm run preview`
- [ ] Open the application in Chrome, Firefox, and Safari (or WebKit equivalent).
- [ ] **Critical Path Test:** Upload a heavy PDF and verify render speed and stability.
- [ ] **Interaction Test:** Verify Fit-Width, Fit-Page, and custom zoom scales behave seamlessly without jitter.
- [ ] **Mobile Test:** Emulate a mobile device and ensure the UI collapses correctly and horizontal scrollbars do not overlap the system navigation bar.
- [ ] **Accessibility Test:** Navigate the main reader UI entirely via keyboard.

---

## Release Preparation

### 5. Documentation Updates
- [ ] Verify that `docs/HANDBOOK.md`, `docs/ARCHITECTURE.md`, and `docs/CODING_STANDARDS.md` reflect the current state of the application.
- [ ] Ensure any newly approved Architecture Decision Records (ADRs) are documented in `docs/DECISIONS.md`.

### 6. Changelog & Release Notes
- [ ] Review all squashed commits merged into `develop` since the last release.
- [ ] Update `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format.
- [ ] Draft the user-facing release notes. Focus on reader benefits, performance improvements, and bug fixes rather than internal architectural changes.

### 7. Version Bump
- [ ] Determine the new version number based on Semantic Versioning (Major, Minor, or Patch).
- [ ] Update the `version` field in `package.json`.
- [ ] Update the version number in any other required files (e.g., `package-lock.json` via `npm install`).
- [ ] Commit the version bump with a message like `chore: bump version to vX.Y.Z`.

---

## Deployment & Tagging

### 8. Final Merge & Tag
- [ ] Open a Pull Request from `develop` into `main` titled `Release vX.Y.Z`.
- [ ] Merge the Pull Request using a **Merge Commit** (`--no-ff`).
- [ ] Checkout `main` and pull the latest changes.
- [ ] Create an annotated git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z: <Short Summary>"`
- [ ] Push the `main` branch and the new tag to origin: `git push origin main --tags`

### 9. Post-Release
- [ ] Verify the CI/CD pipeline triggered successfully and deployed the application to production.
- [ ] Perform a quick sanity check on the live production URL.
- [ ] Announce the release and publish the drafted Release Notes.
