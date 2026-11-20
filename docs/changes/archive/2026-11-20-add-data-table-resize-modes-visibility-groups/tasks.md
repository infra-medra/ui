# Tasks: add-data-table-resize-modes-visibility-groups

## Phase 1: Setup

- [x] T001 Add a `minor` changeset for `@medra.dev/ui` describing `columnResizeMode` (default `fit`), `visible` on `med-table-column`, and the `#headerGroup` and `#footerGroup` templates in `.changeset/data-table-resize-modes-visibility-groups.md` — verify: `npx changeset status` lists `@medra.dev/ui` as minor
  - evidence manual 2026-11-20: npx changeset status lists @medra.dev/ui under minor

## Phase 2: DAT-032 Data table column visibility

- [x] T002 [TEST] [DAT-032] Write unit tests for DAT-032.S1, DAT-032.S2, DAT-032.S3, DAT-032.S4, DAT-032.S5, DAT-032.S6 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'column visibility'` exit 1 — "Array [ | 'Name', | +   'Price',"
- [x] T003 [P] [TEST] [DAT-001, DAT-009, DAT-010] Retag the existing tests for DAT-001.S1, DAT-009.S1 and DAT-010.S1, asserting every Given and Then clause of each scenario, in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests pass (green), expected green from the start because they characterize behavior that already works
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'DAT-001.S1: the empty|DAT-009.S1: a quoted|DAT-010.S1: rowReorder'` exit 1 — "1830 |     expect(cells).toHaveLength(1); | 1831 |     expect(cells[0].textContent).toContain('No results found'); | > 1832 |     expect(cells[0].getAttribute('colspan')).toBe('3');"
- [x] T004 [DAT-032] after T002 Add the `visible` input (default `true`, boolean attribute) with TSDoc in `projects/medra/ui/src/lib/data-table/table-column.component.ts` — verify: `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exits 0
  - evidence green 2026-11-20: `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exit 0 [test-edited]
- [x] T005 [DAT-032, DAT-001, DAT-009] after T002, T003, T004 Add the `visibleColumns` computed and read it in the header and cell loops, `totalColumnCount`, `hasFrozenColumn`, `utilityFrozen`, `frozenLayout` and `exportCSV`, keeping sort and default global-filter fields on `columns()`, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T002 tests pass (green) and T003 tests stay green
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]

## Phase 3: DAT-031 Data table column resize modes

- [x] T006 [TEST] [DAT-031] after T005 Write unit tests with stubbed `getBoundingClientRect` for DAT-031.S2, DAT-031.S3, DAT-031.S5 and the width state of DAT-031.S1 and DAT-031.S4 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'column resize modes'` exit 1 — "1943 | | 1944 |     expect(headers(fixture)[0].style.width).toBe('250px'); | > 1945 |     expect(headers(fixture)[1].style.width).toBe('50px');"
- [x] T007 [P] [TEST] [DAT-031] Write real-browser tests for DAT-031.S1 and DAT-031.S4 against the docs resize demos in `e2e/site/data-table-columns.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-columns.spec.ts --project=site --reporter=line --trace off` exit 1 — "Received difference:   24.84375 | 40 | | 41 |     expect(await widthOf(headers.nth(0))).toBeCloseTo(first + 50, 0);"
- [x] T008 [DAT-031, DAT-010] after T003, T006 Add the `columnResizeMode` input (`fit` default), the fit-mode drag that trades width with the next visible column within the 40px minimum, and no handle on the last visible column in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T006 fit tests (S1 state, S2, S3, S5) pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'column resize modes'` exit 0 [test-edited]
- [x] T009 [DAT-031] after T006, T008 Add expand mode (dragged column only, inline table width grows by the applied delta, 40px minimum) and update the class TSDoc that says the table has no column resize in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T006 expand tests (S4 state, S5) pass (green) and `npx jest projects/medra/ui/src/lib/data-table` stays green
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]

## Phase 4: DAT-033 Data table column groups

- [x] T010 [TEST] [DAT-033] Write unit tests for DAT-033.S1, DAT-033.S2, DAT-033.S3, DAT-033.S4 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'column groups'` exit 1 — "Received array:  [<tr class='border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50'><!--container--><!--container--><!--container--><th class='dark:text-surface-200 font-semibold px-3 py-2.5 select-none text-left... | 2065 | | 2066 |     const rows = Array.from<HTM"
- [x] T011 [DAT-033] after T010 Render the `#headerGroup` template above the leaf header row inside `<thead>` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T010 tests for S1 and S4 pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'DAT-033.S1|DAT-033.S4'` exit 0
- [x] T012 [DAT-033] after T011 Render the `#footerGroup` template in a `<tfoot>` after the last `<tbody>`, only when the template exists, with header surface and border tokens and `dark:` variants in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T010 tests for S2 and S3 pass (green) and `npx jest projects/medra/ui/src/lib/data-table` stays green
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0

## Phase 5: DAT-024 Data table documentation page

- [x] T013 [TEST] [DAT-024] Write real-browser tests for DAT-024.S1 and DAT-024.S7 (index matches sections; resize modes, column toggle and column groups each have prose, demo and code block) in `e2e/site/data-table-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-docs.spec.ts -g DAT-024.S7 --trace off` exit 1 — "135 |     for (const slug of RESIZE_TOGGLE_GROUPS) { | > 136 |       expect(anchorIds, `no section for '${slug}'`).toContain(`example-${slug}`); | |                                                     ^"
- [x] T014 [P] [TEST] [DAT-024] Write the real-browser test for DAT-024.S8 (reorder handle, selection column and frozen column stay in view on horizontal scroll) in `e2e/site/data-table-frozen.spec.ts` — verify: test fails (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g DAT-024.S8 --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-frozen-columns-utility-demo') with timeout 5000ms | - waiting for locator('app-data-table-frozen-columns-utility-demo')"
- [x] T015 [DAT-024, DAT-031] after T007, T009, T013 Add the expand-mode resize demo with its docs prose and rewrite the existing resize prose for the `fit` default in `projects/site/src/app/pages/docs/components/demos/data-table-column-resize-expand.demo.ts` — verify: T007 tests pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'resize modes'` exit 0 [test-edited]
- [x] T016 [P] [DAT-024, DAT-032] after T005, T013 Add the column toggle demo, a `med-multi-select` driving `visible`, with its docs prose in `projects/site/src/app/pages/docs/components/demos/data-table-column-toggle.demo.ts` — verify: the demo builds with `npm run build:site`
  - evidence green 2026-11-20: `npm run build:site` exit 0 [test-edited]
- [x] T017 [P] [DAT-024, DAT-033] after T012, T013 Add the column groups demo with a header group and a footer group and its docs prose in `projects/site/src/app/pages/docs/components/demos/data-table-column-groups.demo.ts` — verify: the demo builds with `npm run build:site`
  - evidence green 2026-11-20: `npm run build:site` exit 0
- [x] T018 [P] [DAT-024] after T014 Add the frozen column with utility columns demo (reorder handle, multiple selection, frozen first column) and its docs prose in `projects/site/src/app/pages/docs/components/demos/data-table-frozen-columns-utility.demo.ts` — verify: T014 test passes (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g DAT-024.S8 --trace off` exit 0
- [x] T019 [DAT-024] after T013, T015, T016, T017, T018 Register the four sections, their imports and `EXAMPLES` entries in `projects/site/src/app/pages/docs/components/data-table.page.ts` — verify: T013 tests pass (green) and `npx playwright test e2e/site/data-table-docs.spec.ts e2e/site/data-table-frozen.spec.ts e2e/site/data-table-columns.spec.ts` exits 0
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-docs.spec.ts e2e/site/data-table-frozen.spec.ts e2e/site/data-table-columns.spec.ts --trace off` exit 0 [test-edited]
