# Racing Arcade Prototype

Racing Arcade is a Vite + React + TypeScript prototype for the MOZA Racing event platform. The current implementation is a static-data frontend prototype that demonstrates the user-facing flows described in `../PRD.md` and `../PROTOTYPE.md`.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run check
```

`npm run check` is the default pre-handoff quality gate. It runs lint and production build/typecheck.

## Current Architecture

```text
src/
  components/        Shared presentational components and layout
  data/              Static mock data used by the prototype
  hooks/             App-wide React context
  i18n/              English and Chinese UI translations
  lib/               Small shared utilities
  pages/             Route-level pages
```

The prototype currently keeps most domain logic inside route pages. This is acceptable for quick visual iteration, but it should not be the long-term production shape.

## Architecture Direction

The next refactor should introduce a clearer boundary between UI and domain logic:

```text
src/
  app/               Router, providers, guards, app shell
  domain/            Types, event status machine, registration rules
  data/              API clients, repositories, mock adapters
  features/          Events, championships, calendar, teams, profile
  shared/            UI primitives, i18n helpers, generic utilities
```

Priority extraction targets:

- Event and championship selectors currently duplicated across home, events, calendar, and my-events pages.
- Registration state and capacity logic currently kept as local component state.
- Region and language fallback rules currently applied manually in pages.
- Route protection and profile-completion gates currently not modeled.

## Guardrails Added

- `src/components/ErrorBoundary.tsx` catches route render failures and offers a refresh action.
- `src/pages/NotFoundPage.tsx` provides a real fallback for unmatched routes.
- `npm run check` gives contributors one command for the current quality gate.
