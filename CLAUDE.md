# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI chat bot desktop application built with Electron + Vue 3 + TypeScript. Uses OpenAI SDK with user-provided API keys to call the API. Local chat history stored in SQLite, with PostgreSQL sync support.

## Development Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server with HMR
pnpm build        # Full build (typecheck + electron-vite build)
pnpm build:win    # Windows NSIS installer
pnpm build:mac    # macOS DMG
pnpm build:linux  # Linux AppImage/deb
pnpm lint         # ESLint with cache
pnpm format       # Prettier formatting
pnpm typecheck    # TypeScript checks (node + web)
```

## Architecture

### Electron Process Model

- **Main Process** (`src/main/index.ts`): Electron window creation, IPC handlers, system integration
- **Preload Script** (`src/preload/index.ts`): Context bridge exposing safe APIs to renderer via `contextBridge`
- **Renderer Process** (`src/renderer/`): Vue 3 SPA frontend

### IPC Communication Pattern

Main process uses `@electron-toolkit/utils` for window management and IPC:

```typescript
// Main process sends to renderer
mainWindow.webContents.send('channel', data)
// Main process receives from renderer via ipcMain.handle
```

### Build Tooling

- **electron-vite** (`electron.vite.config.ts`): Unified Vite config for main/preload/renderer
- **electron-builder** (`electron-builder.yml`): Packaging for Windows/macOS/Linux
- **electron-updater**: Auto-update via GitHub releases (configured in `dev-app-update.yml`)

## Frontend Stack

- **Vue 3.5** with Composition API and `<script setup>`
- **PrimeVue 4** with Aura theme (configured in `main.ts`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT Tailwind v3 config)
- **Vue Router** with hash history

## Database

- **better-sqlite3**: Local SQLite for chat history
- **pg**: PostgreSQL client for remote sync

## Key Files

| File                                | Purpose                              |
| ----------------------------------- | ------------------------------------ |
| `src/main/index.ts`                 | Electron main process entry          |
| `src/preload/index.ts`              | Context bridge API exposure          |
| `src/renderer/src/main.ts`          | Vue app initialization with PrimeVue |
| `src/renderer/src/routers/index.ts` | Vue Router configuration             |
| `electron.vite.config.ts`           | Vite build configuration             |
| `electron-builder.yml`              | App packaging settings               |
| `package.json`                      | Dependencies and scripts             |

## TypeScript Configuration

Uses composite TypeScript projects:

- `tsconfig.json`: Base referencing node and web
- `tsconfig.node.json`: Main/preload/config files
- `tsconfig.web.json`: Renderer (Vue) files

## Editor Configuration

- ESLint (flat config in `eslint.config.mjs`)
- Prettier (`.prettierrc.yaml`)
- VS Code recommended: ESLint extension

## Git Hooks

Husky pre-commit hook runs `lint-staged` and `typecheck` on staged files.
