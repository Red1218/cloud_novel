# Cloud Novel Coding Standards

This document defines the official coding standards for Cloud Novel. Consistency is critical for maintainability. Every developer and AI agent must adhere to these conventions.

---

## 1. TypeScript Conventions

- **Strict Mode:** TypeScript `strict` mode is mandatory. No implicitly `any` types.
- **Interfaces over Types:** Use `interface` for object shapes and component props. Use `type` only for unions, intersections, and primitives.
- **Explicit Return Types:** All functions and React components must have explicit return types.
- **Enums vs. Unions:** Prefer string union types (e.g., `type ScaleMode = 'fit-width' | 'fit-page' | 'custom'`) over TypeScript `enum` to reduce bundle size and complexity.
- **Null vs. Undefined:** Use `null` for intentional absence of a value (e.g., a missing DOM node or unset state). Use `undefined` for uninitialized variables or optional function arguments.
- **Immutable Updates:** Never mutate objects or arrays directly. Always return new copies (e.g., using spread syntax).

---

## 2. React Conventions

- **Functional Components:** Use functional components exclusively. No class components.
- **Destructuring:** Destructure props directly in the function signature.
- **Default Props:** Use default function parameters for default props (e.g., `function Component({ prop = 'default' }: Props) { ... }`). Do not use `defaultProps`.
- **Event Handlers:** Prefix event handler props with `on` (e.g., `onZoomChange`) and internal handler functions with `handle` (e.g., `handleZoomClick`).
- **Dependencies Array:** Never disable exhaustive-deps warnings. Ensure all dependencies are correctly listed in `useEffect`, `useCallback`, and `useMemo`.

---

## 3. CSS Conventions

- **Vanilla CSS:** Use plain CSS with CSS Custom Properties (Variables). Do not use TailwindCSS or CSS-in-JS libraries unless explicitly approved.
- **BEM Methodology:** Use a modified Block Element Modifier (BEM) convention (e.g., `.reader-toolbar`, `.reader-toolbar__button`, `.reader-toolbar__button--active`).
- **CSS Variables:** All colors, spacing, typography, and z-indexes must reference variables defined in `src/styles/tokens.css`. No magic values (e.g., use `var(--space-4)` instead of `16px`).
- **Colocation:** Component styles must be colocated with their React component (e.g., `ReaderToolbar.css` lives next to `ReaderToolbar.tsx`).
- **Z-Index:** Never use arbitrary z-index values. Always use the predefined scale in `tokens.css`.

---

## 4. Naming Conventions

- **Files & Directories:** 
  - React components: PascalCase (e.g., `ReaderHeader.tsx`).
  - Hooks: camelCase with `use` prefix (e.g., `useReaderZoom.ts`).
  - Utilities/Services/Types: camelCase (e.g., `pdfService.ts`, `calculateScale.ts`).
  - Directories: camelCase (except for component folders, which match the component PascalCase name).
- **Variables & Functions:** camelCase.
- **Constants:** UPPER_SNAKE_CASE (e.g., `ZOOM_DEFAULT = 1.0`).
- **Booleans:** Prefix with `is`, `has`, `should`, or `can` (e.g., `isChromeVisible`).

---

## 5. Hooks

- **Single Responsibility:** Custom hooks should do one thing well. Compose smaller hooks into larger ones if necessary (e.g., `useReader` composing `useReaderZoom` and `useReaderNavigation`).
- **Stable References:** Always use `useCallback` for functions returned from hooks to prevent unnecessary re-renders in consuming components.
- **Pure Functions:** Hooks should not mutate external state directly without an explicit setter.
- **Refs for Mutable Data:** Use `useRef` for mutable values that do not require a re-render when they change (e.g., keeping track of a request ID or capturing the latest state for a callback without adding it to the dependency array).

---

## 6. Component Structure

Organize component files consistently. Follow this order:

1. **Imports:** External dependencies first, then internal absolute paths (`@/...`), then relative paths, then the colocated CSS file.
2. **Interfaces/Types:** Define `Props` directly above the component.
3. **Component Definition:** Export the function directly.
4. **Hooks & State:** Initialize refs, state, and context first.
5. **Derived Data:** Calculate `useMemo` values.
6. **Callbacks:** Define `useCallback` functions.
7. **Effects:** Define `useEffect` blocks.
8. **Render:** Return the JSX. Keep the render block as clean as possible.

---

## 7. Folder Structure

- **Features (`src/features/`):** Code must be grouped by feature domain. A feature contains its own `components`, `hooks`, `services`, and `utils`.
- **Component Folders:** Each component gets its own folder containing the `.tsx` file, `.css` file, and an `index.ts` barrel file.
  ```text
  components/
  └── ReaderToolbar/
      ├── ReaderToolbar.tsx
      ├── ReaderToolbar.css
      └── index.ts
  ```
- **Barrel Files:** Use `index.ts` files to cleanly export public APIs from features and component directories.

---

## 8. Performance Rules

- **Minimal Renders:** Avoid unnecessary re-renders. Use `useMemo` for expensive calculations and `React.memo` for heavy pure components.
- **State Colocation:** Keep state as close to where it is used as possible to avoid rendering entire trees unnecessarily.
- **Debounce & Throttle:** Use `requestAnimationFrame`, debounce, or throttle for rapid events (resize, scroll, pointermove).
- **PDF Isolation:** The PDF.js rendering logic is expensive. It must remain strictly decoupled from the React UI render cycles.

---

## 9. Accessibility Rules

- **Semantic HTML:** Use proper HTML5 elements (`<header>`, `<main>`, `<button>`, `<nav>`). Do not use `<div>` for clickable elements.
- **Keyboard Navigation:** Every interactive element must be focusable and operable via the keyboard.
- **ARIA Attributes:** Use `aria-label`, `aria-hidden`, and `aria-live` where visual context is insufficient for screen readers.
- **Focus Outlines:** Never remove focus outlines (`outline: none`) without providing a distinct visual alternative for keyboard users.

---

## 10. Review Checklist

Before opening a PR or finalizing an implementation charter, verify the following:

- [ ] Does it run without TypeScript errors?
- [ ] Does the build succeed (`npm run build`) without new warnings?
- [ ] Are styles using CSS variables from `tokens.css`?
- [ ] Are all dependencies in `useEffect` and `useCallback` complete and accurate?
- [ ] Is the logic properly placed (Business logic in hooks/services, UI in components)?
- [ ] Have you manually tested keyboard navigation (Tab, Space, Enter, Arrows)?
- [ ] Is the commit message clear and descriptive?
- [ ] Has dead code / `console.log` been removed?
