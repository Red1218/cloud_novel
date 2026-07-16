# Cloud Novel Git Workflow

This document defines the strict version control rules and workflows for the Cloud Novel repository. Adherence to these guidelines ensures a clean, auditable, and easily reversible project history.

---

## 1. Branching Strategy

Cloud Novel uses a simplified trunk-based approach modified for feature isolation.

### Core Branches
- **`main`**: The production-ready branch. Code in `main` must always be deployable. Direct commits are strictly prohibited.
- **`develop`**: The primary integration branch. All features are merged here for final QA before releasing to `main`. Direct commits are strictly prohibited.

### Supporting Branches
All active development occurs on supporting branches branched from `develop`.

- **Feature Branches (`feature/*`)**: Used for new additions or major refactors. 
  - *Example:* `feature/immersive-reader`
- **Bugfix Branches (`bugfix/*`)**: Used for fixing issues on `develop`.
  - *Example:* `bugfix/zoom-jump-glitch`
- **Hotfix Branches (`hotfix/*`)**: Used for critical production issues. Branched directly from `main` and merged into both `main` and `develop`.
  - *Example:* `hotfix/pdf-memory-leak`
- **Documentation Branches (`docs/*`)**: Used purely for updating documentation or handbook files.
  - *Example:* `docs/update-ai-workflow`

---

## 2. Merge Strategy

To maintain a clean and easily understandable history, we enforce the following merge strategies:

- **Feature to Develop:** Use **Squash and Merge**. This condenses the entire feature history (including WIP commits, typo fixes, etc.) into a single, cohesive commit on the `develop` branch.
- **Develop to Main:** Use **Merge Commit (`--no-ff`)**. This preserves the grouping of features that went into a specific release release.
- **Hotfix to Main:** Use **Merge Commit (`--no-ff`)**.
- **Rebasing:** Feature branches should regularly be rebased against `develop` to resolve conflicts locally before opening a Pull Request.

---

## 3. Commit Message Conventions

We strictly adhere to Conventional Commits. This enables automated changelog generation and clear historical context.

**Format:**
```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

**Allowed Types:**
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to the build process or auxiliary tools and libraries.

**Examples:**
- `feat(reader): add fit-page scale mode`
- `fix(zoom): prevent jump when transitioning from fit-width`
- `refactor(db): migrate book repository to dexie classes`

**Body Requirements:**
If a commit requires more than a single line of explanation, include a blank line after the description and provide a detailed body explaining the *why*, not just the *what*.

---

## 4. Release Tagging

Releases are tagged against the `main` branch immediately after a successful merge from `develop` or a `hotfix`.

- **Format:** Semantic Versioning (`vX.Y.Z`)
  - **MAJOR (X):** Incompatible architecture changes or massive overhauls (e.g., `v2.0.0`).
  - **MINOR (Y):** Backwards-compatible new features (e.g., `v1.2.0`).
  - **PATCH (Z):** Backwards-compatible bug fixes (e.g., `v1.2.1`).
- **Process:** The tag is created on the merge commit in `main`, accompanied by an annotated tag message containing the release notes.

---

## 5. Pull Request Expectations

A Pull Request is the ultimate quality gate before code enters `develop`. Every PR must meet the following criteria before being eligible for review:

1. **Title:** Must follow the Conventional Commits format (e.g., `feat: implement immersive reader mode`).
2. **Implementation Summary:** A clear explanation of what was built or fixed.
3. **Checklist Completion:** The PR author must manually check off the standard repository checklist (Build passes, UI tested, CSS variables used).
4. **Architecture Notes:** Justification for any structural decisions made during implementation.
5. **No WIP Commits:** If the PR is merged via Squash, the final commit message must be polished. Do not leave "WIP" or "Fixing things" as the final squashed message.
6. **AI Review:** The PR must have passed Kimi's specialized code review and Claude's cleanup phase before human review begins.

---

## 6. Rollback Strategy

If a critical issue is discovered in `main` or `develop` that cannot be instantly hotfixed, the code must be rolled back to restore stability.

- **Revert over Reset:** Never rewrite shared history (do not use `git reset --hard` on `main` or `develop`). Always use `git revert`.
- **Reverting a Squash Merge:** If a feature squashed into `develop` breaks the build, revert the entire squashed commit.
- **Reverting a Release Merge:** If a release merged into `main` fails catastrophically, revert the merge commit itself.
- **Post-Rollback:** Create a new branch from `develop` to address the root cause of the reverted code. Do not push the broken code back until a thorough Post-Mortem has been conducted.
