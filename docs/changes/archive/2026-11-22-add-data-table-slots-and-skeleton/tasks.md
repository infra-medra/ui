# Tasks: add-data-table-slots-and-skeleton

## Phase 1: DAT-040 Data table caption and summary slots

- [x] T001 [TEST] [DAT-040] Write unit tests for DAT-040.S1, DAT-040.S2 (caption above header, summary below table and before paginator, omitted slots render no wrapper) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` fails (red)
  - evidence red 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 1 — "✓ renders no selection UI at all when selectionMode is null (46 ms) | sorting | ✓ clicking a sortable header cycles asc -> desc -> none (unsorted), not a two-state toggle (119 ms)"
- [x] T002 [DAT-040] after T001 Query `captionTemplate` and `summaryTemplate` and separate the inner scroll viewport from the outer bordered container in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` passes (green)
  - evidence green 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 0

## Phase 2: DAT-041 Data table custom empty template

- [x] T003 [TEST] [DAT-041] Write unit tests for DAT-041.S1, DAT-041.S2 (custom `#empty` template rendered in spanning cell when empty and not loading, fallback to `emptyLabel` when omitted) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` fails (red)
  - evidence red 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 1 — "✓ renders no selection UI at all when selectionMode is null (33 ms) | sorting | ✓ clicking a sortable header cycles asc -> desc -> none (unsorted), not a two-state toggle (75 ms)"
- [x] T004 [DAT-041] after T003 Query `emptyTemplate` (`#empty`) and render it inside the empty-state `<td>` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` passes (green)
  - evidence green 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 0

## Phase 3: DAT-042 and DAT-007 Data table skeleton loading and spinner mode

- [x] T005 [TEST] [DAT-042, DAT-007] Write unit tests for DAT-042.S1, DAT-042.S2 and verify DAT-007.S1, DAT-007.S2 (skeleton cells across utility and visible columns, no spinner overlay, `aria-busy` and `role="status"` announcement, data restored when `loading` turns false; DAT-007 tests expected green from start) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` fails on DAT-042 tests (red)
  - evidence red 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 1 — "✓ renders no selection UI at all when selectionMode is null (33 ms) | sorting | ✓ clicking a sortable header cycles asc -> desc -> none (unsorted), not a two-state toggle (82 ms)"
- [x] T006 [DAT-042, DAT-007] after T005 Export `TableLoadingMode` in `projects/medra/ui/src/lib/data-table/data-table.types.ts` and `projects/medra/ui/src/public-api.ts`, and implement `loadingMode` (`'spinner' | 'skeleton'`) using `SkeletonComponent` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` passes (green)
  - evidence green 2026-11-22: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table.component.spec.ts +3/-3 other (3 line(s) of the red version were removed or edited); reason "Use signal(true) for Host.loading in DAT-042.S2 to avoid Angular 21 zoneless NG0100 on detectChanges()"]

## Phase 4: DAT-024 Data table documentation page and release metadata

- [x] T007 [TEST] [DAT-024] Write Playwright e2e tests for DAT-024.S12 (and verify DAT-024.S1–DAT-024.S11 coverage) in `e2e/site/data-table-slots-skeleton.spec.ts` — verify: `npx playwright test e2e/site/data-table-slots-skeleton.spec.ts` fails (red)
  - evidence red 2026-11-22: `npx playwright test --reporter=list e2e/site/data-table-slots-skeleton.spec.ts` exit 1 — "52 |     for (const entry of report) { | > 53 |       expect(entry.inToc, `missing TOC entry for '${entry.id}'`).toBe(true); | |                                                                  ^"
- [x] T008 [DAT-024] after T007 Add `example-caption-summary`, `example-empty-template`, and `example-loading-skeleton` demos and sections to `projects/site/src/app/pages/docs/components/data-table.page.ts` and update `DataTableComponent` TSDoc in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx playwright test e2e/site/data-table-slots-skeleton.spec.ts e2e/site/data-table-docs.spec.ts` passes (green)
  - evidence green 2026-11-22: `npx playwright test --reporter=list e2e/site/data-table-slots-skeleton.spec.ts e2e/site/data-table-docs.spec.ts` exit 0
- [x] T009 [DAT-040, DAT-041, DAT-042] after T002, T004, T006, T008 Add `minor` changeset in `.changeset/data-table-slots-and-skeleton.md` and run full suite and builds — verify: `npm test && npm run build:ui && npm run build:site` exits 0
  - evidence green 2026-11-22: `npm test && npm run build:ui && npm run build:site` exit 0
