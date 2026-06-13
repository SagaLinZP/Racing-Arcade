# Racing Arcade Prototype

Racing Arcade is a Vite + React + TypeScript prototype for the MOZA Racing event platform. The current implementation is a static-data frontend prototype that demonstrates the user-facing flows described in `../PRD.md` and `../PROTOTYPE.md`.

## Prerequisites

- **Node.js** — managed via [fnm](https://github.com/Schniz/fnm). Local development uses Node 24; CI uses Node 22.
- **pnpm** is the preferred package manager (`npm` also works; CI uses `npm ci`).

Activate Node for the current shell (already in `~/.zshrc`):

```bash
eval "$(fnm env)"
```

## Commands

All commands run in the `prototype/` directory:

```bash
pnpm install         # install dependencies
pnpm run dev         # dev server → http://localhost:5173/Racing-Arcade/
pnpm run lint        # ESLint
pnpm run typecheck   # tsc -b
pnpm run test        # vitest run
pnpm run build       # tsc -b && vite build
pnpm run check       # ★ quality gate: lint + typecheck + test + build
```

`pnpm run check` is the default pre-handoff quality gate. It runs lint, typecheck, tests, and production build. Run it before considering any change complete.

> Dev server URL includes the `/Racing-Arcade/` base path (matches GitHub Pages).

## Current Architecture

```text
src/
  app/               Router, providers, guards, and app shell
  components/        Shared presentational components and layout
  data/              Static mock data plus repository adapters
  domain/            Domain types, event status rules, and pure selectors
  features/          Business feature hooks and route-level view composition
  hooks/             App-wide React context and shared stateful UI hooks
  i18n/              English and Chinese UI translations
  lib/               Legacy re-export shim (cn + domain types)
  pages/             Route-level pages
  shared/            Generic cross-feature helpers
  test/              Test setup and app-level smoke tests
```

### Layered data flow

```
pages/        → thin route components (pull params, call hooks, render feature view)
    ↓
features/     → feature-scoped hooks (call repositories + domain selectors, return view-models)
    ↓
data/repositories/  → query/filter adapters over static arrays (list/getById, delegate to domain)
    ↓
domain/       → pure types + stateless business rules (status machine, filters, sorting, standings)
```

Route pages delegate shared event and championship rules to `src/domain/`, while route composition, global providers, profile-completion gating, and auth guards live in `src/app/`. Static mock records still live in `src/data/`, but pages consume them through repository-backed feature hooks rather than direct mock imports.

### Key modules

- **`hooks/useAppStore.ts`** — `AppContext` / `useApp()` global state (`isLoggedIn`, `currentRegion`, `language`, `registrationOverrides`, …).
- **`hooks/useLocale.ts`** — `useLocale()` → `text(zh, en)` / `field(source, key)` / `date()` helpers with fallback chain (primary → English → Chinese → fallback).
- **`hooks/useEventRegistration.ts`** — `useEventRegistration()` → `register` / `unregister` / `getSnapshot`. Registration count and ownership overrides are centralized in `state.registrationOverrides[eventId]`.
- **`domain/events.ts`** — `getEventStatus(event)` dynamic status machine, filtering, sorting, capacity helpers.
- **`app/routes.tsx`** — declarative route table with nested guards (`GuestOnlyRoute`, `RequireAuth`, `RequireCompleteProfile`, `RequireEventRegistrant`).

## Architecture Direction

The architecture is moving toward this stable boundary:

```text
src/
  app/               Router, providers, guards, app shell
  domain/            Types, event status machine, registration rules
  data/              API clients, repositories, mock adapters
  features/          Events, championships, calendar, teams, profile
  shared/            UI primitives, i18n helpers, generic utilities
```

Remaining extraction targets:

- Remaining hard-coded page labels can move into `src/i18n/` resources.
- Region-specific availability/copy rules should be extracted when the prototype grows beyond static mock data.
- The large feature view files (`EventDetailView.tsx`, `ChampionshipDetailView.tsx`) can be split further into smaller section components once behavior stabilizes.

## Guardrails Added

- `src/components/ErrorBoundary.tsx` catches route render failures and remounts on pathname change.
- `src/pages/NotFoundPage.tsx` provides a real fallback for unmatched routes.
- `src/test/` and `src/domain/__tests__/` cover domain rules and route smoke scenarios with Vitest.
- `pnpm run check` gives contributors one command for lint, typecheck, tests, and build.
