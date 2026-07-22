# Cloud Novel Architecture

This document outlines the actual architecture, folder structure, dependency rules, and boundaries for the Cloud Novel codebase. It enforces the engineering principles defined in the `HANDBOOK.md`.

---

## 1. High-Level Architecture

Cloud Novel follows a **Feature-First Clean Architecture**. The codebase is vertically sliced by feature domain (e.g., `reader`, `library`), with shared horizontal layers for infrastructure (repositories, services) and generic presentation (shared components).

### Core Boundaries

1.  **Presentation (Pages & Components):** Responsible for UI rendering. Has no direct knowledge of IndexedDB or PDF parsing logic.
2.  **Domain (Features & Hooks):** Encapsulates business rules and state management. Features operate independently.
3.  **Data / Infrastructure (Repositories & Services):** Handles all external side-effects (IndexedDB, PDF.js web workers).

---

## 2. Folder Structure

The `src/` directory is organized as follows:

```text
src/
├── app/            # App initialization, global providers, and React Router configuration
├── assets/         # Static assets (fonts, images, PDF worker scripts)
├── components/     # Shared, generic UI components used across multiple features
├── constants/      # Global application constants
├── contexts/       # Global React contexts (theme, auth, etc.)
├── features/       # Vertically sliced feature modules (e.g., reader, library)
├── hooks/          # Shared global React hooks
├── layouts/        # Shared page layouts (e.g., MainLayout, ReaderLayout)
├── mocks/          # Mock data for testing and development
├── pages/          # Routable page components that orchestrate features
├── repositories/   # Data access layer (IndexedDB interactions)
├── services/       # Infrastructure and external API wrappers (PDF.js service)
├── styles/         # Global CSS variables, resets, and design tokens
├── types/          # Global TypeScript type definitions
└── utils/          # Shared utility functions
```

---

## 3. Dependency Rules & Boundaries

To prevent "spaghetti code" and maintain low coupling, the following dependency rules are strictly enforced:

### The Golden Rule
Dependencies must point **inward** toward the domain or **downward** toward shared generic layers.

### Feature Boundaries (`src/features/*`)
- **Isolation:** A feature (e.g., `features/reader`) **must not** import from another feature.
- **Contents:** Features should contain their own domain-specific `components/`, `hooks/`, `services/`, `types.ts`, and `constants.ts`.
- **Public API:** Each feature should export its public API via an `index.ts` barrel file. Pages should only import from this barrel file.

### Page Boundaries (`src/pages/*`)
- **Orchestration Only:** Pages are "glue" code. They map URL parameters to features and compose feature components.
- **No Business Logic:** Pages must not contain complex state management or business rules.
- **Dependencies:** Pages may import from `features/`, `components/`, `layouts/`, and `hooks/`.

### Shared Components (`src/components/*`)
- **Dumb Components:** Shared components must be purely presentational (e.g., buttons, inputs, dialogs).
- **No Domain Knowledge:** They must not import from `features/`, `repositories/`, or `services/`. They receive data strictly via props.

### Repositories & Services (`src/repositories/*`, `src/services/*`)
- **Infrastructure:** This is the only layer allowed to know about IndexedDB (`dexie`) or PDF.js internals.
- **Dependencies:** Services and repositories may import `types` and `utils`, but **must not** import from `features/`, `pages/`, or `components/`.

---

## 4. Specific Architectural Patterns

### State Management
State is localized as much as possible.
- **Feature State:** Managed via custom hooks within `features/` (e.g., `useReader.ts`, `useReaderZoom.ts`).
- **Global State:** Minimal. Managed via React Context in `contexts/`.

### Persistence (IndexedDB)
Persistence logic is decoupled from UI logic.
- **Services & Repositories:** Classes like `BookRepository.ts` and `bookmarkService.ts` abstract IndexedDB operations.
- **Feature Hooks:** Custom hooks (e.g., `useReadingState.ts`, `useReaderBookmarks.ts`) consume services to persist domain state. The UI simply calls generic functions like `queueUpdate` or `toggleBookmark`.
- **Database Schema:** The `CloudNovelDB` schema strictly defines object stores. Migrations are managed via the `DB_VERSION` constant (e.g., v3 added the `bookmarks` store).

### PDF Rendering Isolation
The PDF.js dependency is strictly isolated to prevent performance bottlenecks and maintain flexibility.
- **Service Layer:** `pdfService.ts` handles worker initialization and document fetching.
- **Feature Layer:** `usePdfDocument.ts` and `usePdfRenderer.ts` manage the async loading state and canvas painting.
- **Presentation Layer:** The UI (e.g., `ReaderViewport.tsx`) only provides an HTML canvas element and receives dimensions. It does not handle PDF byte parsing.

### Bookmark Engine
The Bookmark Engine (`src/features/reader/bookmarks`) follows a strict vertical slice architecture:
- **Persistence:** `bookmarkService.ts` directly interfaces with IndexedDB to save page positions, keeping persistence separate from React.
- **State Management:** `useReaderBookmarks.ts` exposes headless hooks (`toggleBookmark`, `addBookmark`, `removeBookmark`) for UI interaction.
- **Presentation:** The Bookmark Engine is designed to support dedicated UI components through the `useReaderBookmarks` headless hook, ensuring the presentation layer remains decoupled from persistence.

---

## 5. CSS Architecture

- **Tokens:** All colors, spacing, typography, and z-indexes are defined in `src/styles/tokens.css`.
- **BEM Naming:** Component styles follow a modified BEM (Block Element Modifier) convention (e.g., `.reader-toolbar`, `.reader-toolbar__button`, `.reader-toolbar__button--active`).
- **Colocation:** Component-specific CSS is colocated with its component (e.g., `ReaderToolbar.tsx` alongside `ReaderToolbar.css`).
