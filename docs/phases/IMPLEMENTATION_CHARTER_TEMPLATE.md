# Phase [X.X]: [Phase Title]

**Status:** [Draft | Approved | In Progress | Completed]

---

## 1. Goal

*Provide a clear, high-level statement of what this phase aims to achieve and why it is valuable to the reader.*

> [Goal Description]

---

## 2. Product Philosophy

*Explain how this feature supports Cloud Novel's core philosophy (e.g., "The published page is sacred," "The reader comes before the interface").*

- **Alignment:** [Explain alignment]

---

## 3. Design Freeze

*Acknowledge that upon approval of this charter, the design and scope are strictly frozen. No new features, UX changes, or redesigns are permitted during implementation.*

- [ ] Design Freeze acknowledged by all contributors.

---

## 4. Scope

### User Stories
- As a reader, I want to...
- As a reader, I want to...

### Approved Features
- [Feature 1]
- [Feature 2]

---

## 5. Architecture

*Define the precise technical approach. How does this fit into the existing Clean Architecture?*

### Components
- **[Component Name]:** [Brief description of responsibility]
- **[Component Name]:** [Brief description of responsibility]

### State Management
- **Local State:** [Variables/Hooks required]
- **Global Context:** [Modifications to Context providers, if any]

### Persistence
- **IndexedDB:** [Schema changes, new tables, or key modifications]
- **LocalStorage:** [New keys or value shapes]

---

## 6. Expected File Changes

### Expected Files Created
- `src/features/...`
- `src/components/...`

### Expected Files Modified
- `src/features/...`
- `src/hooks/...`

---

## 7. Architecture Boundary

*Explicitly list the systems, layers, or features that must **NOT** be modified or impacted by this phase.*

- Do **NOT** modify PDF rendering logic.
- Do **NOT** introduce new global contexts unless absolutely necessary.
- Do **NOT** couple [Feature A] with [Feature B].

---

## 8. Requirements

### Accessibility Requirements
- [ ] Must be fully navigable via Keyboard (`Tab`, `Enter`, `Escape`).
- [ ] Must maintain 4.5:1 color contrast.
- [ ] Must provide clear focus outlines for all new interactive elements.

### Performance Requirements
- [ ] Must not block the main thread for more than 50ms.
- [ ] Must not trigger unnecessary re-renders of the PDF canvas.
- [ ] Must maintain smooth 60fps scrolling and interactions.

---

## 9. Out of Scope

*List related ideas, feature creep, or technical debt that will explicitly NOT be addressed in this phase.*

- [Out of scope item 1]
- [Out of scope item 2]

---

## 10. Implementation Rules

1. **Strict Adherence:** Implement exactly what is specified in this charter.
2. **No Silent Refactors:** Do not refactor unrelated code.
3. **Atomic Commits:** Keep commits focused and logically grouped.
4. **Follow Standards:** Adhere strictly to `CODING_STANDARDS.md` and `ANTI_PATTERNS.md`.

---

## 11. Verification Checklist

### Build Requirements
- [ ] `npm run build` passes with zero errors.
- [ ] `npm run lint` passes with zero warnings.
- [ ] `tsc --noEmit` passes with zero errors.

### Expected Implementation Summary
*(To be filled out post-implementation for the reviewer)*
- **Summary of changes:** 

### Expected Build Output
*(Paste the successful build output here)*
```text
[Build Output]
```

### Expected Git Status
*(Verify working tree is clean and commits are pushed)*
```text
[Git Status Output]
```

---

## 12. Review Checklist

*(To be completed by Kimi or Human Reviewer)*
- [ ] Code aligns with the Architecture defined above.
- [ ] No `ANTI_PATTERNS.md` violations detected.
- [ ] Accessibility Requirements met.
- [ ] Performance Requirements met.
- [ ] Code is clean, well-named, and free of temporary logs.

---

## 13. Stop Conditions

**CRITICAL RULE:** If, during implementation, you discover that the proposed architecture is flawed, inefficient, or requires changing core systems:

**STOP.**
1. Document the proposed architectural change.
2. Wait for explicit approval from the lead architect (Human or ChatGPT).
3. **Do not continue implementation until the architecture is re-approved.**
