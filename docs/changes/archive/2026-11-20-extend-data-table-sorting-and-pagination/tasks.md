# Tasks: extend-data-table-sorting-and-pagination

## Phase 1: DAT-002 Data table single-column sorting

- [x] T001 [TEST] [DAT-002, DAT-005] Bind `sortField`, `sortOrder`, `removableSort` and `first` in the test host, tag the existing sort cycle, Space, page slice and rows per page tests with their scenario IDs, and write tests for DAT-002.S3, DAT-002.S4, DAT-005.S2, DAT-005.S3 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red); DAT-005.S2 and S3 only characterize behavior that already works, so DAT-002.S4 is the failing case
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 1 — "Array [ | 'ascending', | 'descending',"
- [x] T002 [DAT-002] after T001 Add the `removableSort` input (default true, TSDoc noting it is ignored in `sortMode="multiple"`) and make `toggleSort` return to ascending instead of unsorted when it is false in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0

## Phase 2: DAT-002 and DAT-005 docs examples

- [x] T003 [DAT-002] after T002 Add the `presort` and `removable-sort` examples (demos, prose files and code imports) after `sort-single` in `projects/site/src/app/pages/docs/components/data-table.page.ts` — verify: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` passes
  - evidence green 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` exit 0
- [x] T004 [DAT-005] after T001, T003 Add the `programmatic-pagination` example (demo, prose file and code import) after `pagination` in `projects/site/src/app/pages/docs/components/data-table.page.ts` — verify: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` passes
  - evidence green 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` exit 0

## Phase 3: Release

- [x] T005 [DAT-002] after T002 Add a minor changeset describing `removableSort` in `.changeset/data-table-removable-sort.md` — verify: `npx changeset status` lists `@medra.dev/ui` as minor
  - evidence green 2026-11-20: `npx changeset status` exit 0
