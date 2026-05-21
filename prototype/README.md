# Racing Arcade Prototype

Racing Arcade is a Vite + React + TypeScript prototype for the MOZA Racing event platform. The current implementation is a static-data frontend prototype that demonstrates the user-facing flows described in `../PRD.md` and `../PROTOTYPE.md`.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

`npm run check` is the default pre-handoff quality gate. It runs lint, typecheck, tests, and production build.

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
  lib/               Small shared utilities
  pages/             Route-level pages
  shared/            Generic cross-feature helpers
  test/              Test setup and app-level smoke tests
```

Route pages now delegate shared event and championship rules to `src/domain/`, while route composition, global providers, profile-completion gating, and auth guards live in `src/app/`. Static mock records still live in `src/data/`, but pages consume them through repository-backed feature hooks rather than direct mock imports. Registration count/ownership overrides are centralized through `src/hooks/useEventRegistration.ts`, and localized field fallback/date formatting is centralized through `src/hooks/useLocale.ts`.

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
- The large feature view files can be split further into smaller section components once behavior stabilizes.

## Guardrails Added

- `src/components/ErrorBoundary.tsx` catches route render failures and offers a refresh action.
- `src/pages/NotFoundPage.tsx` provides a real fallback for unmatched routes.
- `src/test/` and `src/domain/__tests__/` cover domain rules and route smoke scenarios with Vitest.
- `npm run check` gives contributors one command for lint, typecheck, tests, and build.
