# admin-next Migration Tracker

Tracker for the structural cleanup proposed in `PROJECT_STRUCTURE_IMPROVEMENT.md`.

## Current Status

- [x] Add improvement proposal document
- [x] Add migration tracker
- [x] Update app README for real run/build/env setup
- [x] Exclude legacy/archive folders from TypeScript compilation
- [x] Re-enable auth redirect in dashboard layout (non-mock mode)
- [x] Consolidate Redux provider/store implementation to a single source
- [x] Move archive folders out of active `src` tree
- [x] Split mock data from `src/services` into dedicated mock layer
- [x] Standardize naming and remove typos in folders/files
- [x] Introduce layered import aliases (`core`, `shared`, `constants`) and migrate active imports

## Phase Breakdown

## Phase 1 - Reduce active code noise

Goal: make active app code easier to navigate and safer to refactor.

Tasks:

- [x] Prevent TS from scanning legacy/archive folders
- [x] Move `src/pages-legacy` to `_archive/pages-legacy`
- [x] Move `src/unused_pages_archive` to `_archive/unused_pages_archive`
- [x] Verify no active import points to archive paths

## Phase 2 - Store/provider unification

Goal: keep one canonical Redux store path.

Tasks:

- [x] Decide canonical path (`src/store` + `src/providers/StoreProvider.tsx`)
- [x] Remove or migrate duplicate `src/lib/store.ts`
- [x] Remove or migrate duplicate `src/lib/StoreProvider.tsx`
- [ ] Verify build and runtime behavior

## Phase 3 - Auth boundary hardening

Goal: consistent guarded route behavior between middleware and client.

Tasks:

- [x] Enable client redirect fallback in dashboard layout when not authenticated
- [ ] Review middleware matcher coverage for auth pages
- [ ] Document mock auth behavior for local development

## Phase 4 - Service/mock separation

Goal: keep service layer focused on API contracts.

Tasks:

- [x] Move large inline mock datasets to `src/mock/services`
- [x] Keep `src/services` focused on mock adapter logic only (data moved out)
- [ ] Add clear switch strategy (`NEXT_PUBLIC_USE_MOCK_DATA`)

## Phase 5 - Naming and hygiene

Goal: improve readability and consistency.

Tasks:

- [x] Normalize inconsistent names in active code (`HomeBredCurbs` -> `HomeBreadcrumbs`, `appex` -> `apex`)
- [ ] Ensure naming style is consistent for component files
- [ ] Clean outdated comments and migration leftovers

## Validation Checklist (each phase)

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Login/logout and protected routes still work
- [ ] Main dashboard pages still render correctly

## Notes

- Current `npm run lint` fails because of many pre-existing errors/warnings across the codebase (not introduced by this migration batch).
- Current `npm run build` fails due pre-existing missing modules in active app (`invoice` helpers, `utility/notifications`, `ui/Checkbox`) unrelated to the structural move itself.
