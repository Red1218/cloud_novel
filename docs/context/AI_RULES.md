# AI Rules

These rules are permanent and must be followed by all AI assistants interacting with the Cloud Novel repository.

## Session Initialization
For every new AI session, the user must use the standardized prompt (found in `docs/AI_PROMPT.md`) or the AI must enforce this behavior:
1. Read `docs/AI_BOOTSTRAP.md` completely.
2. Follow the documented read order.
3. Treat the repository documentation as the single source of truth.
4. Do not rely on previous chat memory.
5. After completing your assigned task, update any required context documents before finishing.

## Architecture Change Policy
- No AI may implement architectural changes without explicit user approval.
- All proposed architectural changes must first be drafted as an ADR.

## Documentation Freeze
- If a "Documentation Freeze" is declared by the user, AI assistants must NOT modify any documentation files until the freeze is lifted.

## Design Freeze
- If a "Design Freeze" is declared, no new features, UI changes, or structural database changes may be introduced. Focus strictly on bug fixes, testing, and optimization.

## Review Workflow
- AI must always present a plan or summary of changes before executing large modifications.
- Wait for user feedback on complex implementations.

## Role-Specific Responsibilities
- **Codex:** Focus on code generation, syntax optimization, and boilerplate creation.
- **ChatGPT:** Handle general reasoning, architecture discussions, and explanatory text.
- **Kimi:** Act as the primary reviewer for large context windows, analyzing full-codebase impact.
- **Claude:** Responsible for cleanup, refactoring, and maintaining documentation quality.
- **Gemini:** End-to-end integration, advanced reasoning, and full-stack development tasks.

## Documentation Update Rule
- Whenever a code change impacts architecture, flow, or public APIs, the corresponding documentation **must** be updated in the same pull request/session.

## Branch Workflow
- Work on feature branches. Do not commit directly to `main` or `master` unless explicitly instructed by the user.
- Provide descriptive commit messages summarizing the "why" as well as the "what".

## Bookmark Engine Conventions
- **Permanent Rule:** AI assistants must not couple IndexedDB bookmark persistence directly within UI components.
- **Convention:** Always use the headless hook `useReaderBookmarks` to interact with bookmarks in the React layer.
- **Convention:** `bookmarkService.ts` is strictly for database interactions and should contain no UI or React-specific logic.
