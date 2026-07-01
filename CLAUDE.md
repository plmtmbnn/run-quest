# RunQuest Developer Guidelines (CLAUDE.md)

## Build & Development Commands
- **Start Dev Server**: `pnpm dev`
- **Build Production Bundle**: `pnpm build`
- **Lint Check**: `pnpm lint` (runs `biome check .`)
- **Format Code**: `pnpm format` (runs `biome format --write .`)
- **Fix Lint & Format Errors**: `npx biome check --write <files>`
- **Run Unit Tests**: `pnpm test` (runs Vitest)

## Code Quality & Conventions
- **No `any` Types**: TypeScript must be kept strict. Never use `any`.
- **Pure Game Engine**: Gameplay logic in `src/engine/` must remain pure TypeScript. Do not introduce React, Zustand, or browser APIs (like `localStorage` or `window`) into the engine.
- **Data Access Policy**: UI components must never access `localStorage` directly. All storage reads and writes must pass through `src/storage/storage-repository.ts`.
- **Performance & Loading**:
  - Route screens (`src/app/`) must be dynamically imported via `next/dynamic` to split bundle chunks.
  - Heavy third-party utility packages (like `html-to-image` inside `useShareCard`) must be inline-imported dynamically (`await import(...)`) to avoid bloat on page mounts.
