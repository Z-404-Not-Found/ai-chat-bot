# Repository Guidelines

## Project Structure & Module Organization

- `src/main`: Electron main process code (window lifecycle, IPC handlers, SQLite, OpenAI service).
- `src/preload`: Secure bridge exposed to the renderer via preload scripts.
- `src/renderer`: Vue 3 UI (`src/renderer/src/components`, `pages`, `routers`, `composables`, `themes`).
- `src/shared`: Cross-process constants and TypeScript types.
- `build` and `resources`: App icons, entitlements, and packaging assets.
- Config lives at the root (`electron.vite.config.ts`, `electron-builder.yml`, `eslint.config.mjs`, `tsconfig*.json`).

## Build, Test, and Development Commands

- `pnpm install`: Install dependencies.
- `pnpm dev`: Run Electron + Vite in development mode.
- `pnpm start`: Preview built output.
- `pnpm build`: Type-check (`node` + `web`) and bundle app.
- `pnpm build:mac` / `pnpm build:win` / `pnpm build:linux`: Build platform packages.
- `pnpm lint`: Run ESLint.
- `pnpm format`: Run Prettier across the repo.

## Coding Style & Naming Conventions

- Use TypeScript and Vue SFCs with 4-space indentation (`.editorconfig`).
- Prettier rules: single quotes, no semicolons, `printWidth: 100`.
- Keep filenames descriptive and aligned with feature scope (`src/main/ipc/chat.ts`, `src/main/database/messages.ts`).
- Use `camelCase` for variables/functions, `PascalCase` for Vue components/types, and `UPPER_SNAKE_CASE` for shared constants.

## Testing Guidelines

- No dedicated automated test suite is configured yet.
- Required quality gate before commit: `pnpm lint` and `pnpm typecheck`.
- Validate behavior manually in `pnpm dev` for affected flows (IPC calls, chat streaming, DB persistence, window controls).
- If adding tests, co-locate with source using `*.spec.ts` naming.

## Commit & Pull Request Guidelines

- Follow Conventional Commit style seen in history, e.g. `feat(chat): ...`, `refactor(ipc): ...`, `docs: ...`, `chore: ...`.
- Keep subject lines short and scoped to one change.
- Before pushing, ensure Husky pre-commit passes (`lint-staged` + `npm run typecheck`).
- PRs should include: purpose, key changes, manual verification steps, and screenshots/GIFs for renderer UI updates.

## Security & Configuration Tips

- Never commit API keys or local user data.
- AI settings (API key/base URL/model) and SQLite data are stored under Electron userData at runtime; treat exported logs/db files as sensitive.
