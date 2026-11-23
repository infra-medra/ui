# Tasks: add-data-table-responsive-stack

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-050 Data table responsive stack layout

- [x] T001 [TEST] [DAT-050,DAT-051,DAT-052] Write unit tests, with a controllable `window.matchMedia` mock, for DAT-050.S1, DAT-050.S2, DAT-050.S3, DAT-050.S4, DAT-050.S5, DAT-050.S6, DAT-051.S1, DAT-051.S2, DAT-051.S3, DAT-051.S4, DAT-051.S5, DAT-052.S1, DAT-052.S2, DAT-052.S3, DAT-052.S4, DAT-052.S5, DAT-052.S6, DAT-052.S7, DAT-052.S8 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (DAT-050.S1 leaves `responsiveLayout`, `breakpoint` and `stackLabel` unset, and each test asserts every Given and Then clause) — verify: tests fail (red)
  - evidence red 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'responsive stack' --kind red` exit 1 — "Unrecognized option 'kind'. | CLI Options Documentation: | https://jestjs.io/docs/cli"
- [x] T002 [DAT-050] after T001 Add the `stackLabel` input to `projects/medra/ui/src/lib/data-table/table-column.component.ts`, and the `responsiveLayout` and `breakpoint` inputs, the `matchMedia` signal and the `stacked` computed (off for `virtualScroll` and for an invalid length) to `projects/medra/ui/src/lib/data-table/data-table.component.ts`, with TSDoc — verify: T001 tests for DAT-050.S1, S3, S4 and S6 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-050.S(1|3|6):'` exit 0
- [x] T003 [DAT-050] after T002 Render the `aria-hidden` label element before each data cell's content while stacked, using `stackLabel` then `header`, and none when both are empty, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests for DAT-050.S2 and S5 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-050.S(2|5):'` exit 0

## Phase 2: DAT-051 Data table stacked semantics and appearance

- [x] T004 [DAT-051] after T001, T003 Add the explicit roles, the `sr-only` header row and the stacked block classes with dark-mode token pairs to the class helpers and template of `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests for DAT-051.S1 to S5 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-051.S[1-5]:'` exit 0

## Phase 3: DAT-052 Data table stacked layout and other features

- [x] T005 [DAT-052] after T004 Make sorting, header focus, column drag, resize handles and the `#headerGroup` row inactive or hidden while stacked (`onHeaderClick`, `onHeaderKeydown`, header `tabindex`, `isColumnDraggable`, `hasResizeHandle`) in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests for DAT-052.S1, S3 and S6 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-052.S[136]:'` exit 0
- [x] T006 [DAT-052] after T005 Make frozen columns and frozen rows non-sticky while stacked (`frozenStyle`, `frozenUtilityClass`, `frozenCellClass`, the frozen `<tbody>` classes and the sticky header classes) in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests for DAT-052.S2 and S8 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-052.S[28]:'` exit 0
- [x] T007 [DAT-052] after T006 Hide the row reorder handle, turn off row-span merging, render subheader, expansion and empty rows as full-width blocks, and keep selection, editing and caption slots working while stacked in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests for DAT-052.S4, S5 and S7 pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-052.S[457]:'` exit 0

## Phase 4: DAT-024 Data table documentation page

- [x] T008 [TEST] [DAT-050,DAT-051,DAT-052,DAT-024] Write Playwright tests at 400px and 1280px wide for DAT-050.S1, DAT-050.S2, DAT-050.S3, DAT-050.S4, DAT-051.S2, DAT-051.S5, DAT-052.S2, DAT-052.S3, DAT-052.S6, DAT-052.S8 and DAT-024.S16 in `e2e/site/data-table-responsive-stack.spec.ts`, and add the `responsive-stack` slug to the checked lists of DAT-024.S1 and S2 in `e2e/site/data-table-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-23: `npx playwright test --reporter=list --project=site e2e/site/data-table-responsive-stack.spec.ts e2e/site/data-table-docs.spec.ts` exit 1 — "79 |     expect(tocIds).toEqual(anchorIds); | > 80 |     expect(tocIds, 'no index entry for the responsive stack example').toContain(`example-${RESPONSIVE_STACK}`); | |                                                                       ^"
- [x] T009 [DAT-024] after T008, T007 Add the responsive stack demo (a table with `responsiveLayout="stack"`, a `stackLabel` override and a column without a header) in `projects/site/src/app/pages/docs/components/demos/data-table-responsive-stack.demo.ts`, `projects/site/src/app/pages/docs/components/demos/data-table-responsive-stack.demo.html` and `projects/site/src/content/docs/data-table-responsive-stack.txt` — verify: the three files exist and `npx tsc --noEmit -p projects/site/tsconfig.app.json` exits 0
  - evidence green 2026-11-23: `npx tsc --noEmit -p projects/site/tsconfig.app.json` exit 0
- [x] T010 [DAT-024] after T009 Register the `example-responsive-stack` section after the horizontal and flexible scroll examples and add the new inputs to the API reference in `projects/site/src/app/pages/docs/components/data-table.page.ts` and `projects/site/src/content/api/data-table.json` — verify: T008 tests pass (green)
  - evidence green 2026-11-23: `npx playwright test --reporter=list --project=site e2e/site/data-table-responsive-stack.spec.ts e2e/site/data-table-docs.spec.ts` exit 0

## Phase 5: Release

- [x] T011 [DAT-050] after T007 Replace the `responsiveLayout="stack"` scope-cut note in the class doc with a description of the opt-in layout in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `grep -c "No \`responsiveLayout" projects/medra/ui/src/lib/data-table/data-table.component.ts` prints 0
  - evidence green 2026-11-23: `! grep -q "No .responsiveLayout" projects/medra/ui/src/lib/data-table/data-table.component.ts` exit 0
- [x] T012 Add a `minor` changeset for `@medra.dev/ui` describing `responsiveLayout`, `breakpoint` and `stackLabel` in `.changeset/data-table-responsive-stack.md` — verify: the file names `'@medra.dev/ui': minor`
  - evidence green 2026-11-23: `grep -q "'@medra.dev/ui': minor" .changeset/data-table-responsive-stack.md` exit 0
- [x] T013 [DAT-050] after T010, T011 Run the full unit suite and every data-table Playwright spec in `e2e/site/` — verify: `npm test` and `npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` exit 0
  - evidence green 2026-11-23: `npm test && npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` exit 0
