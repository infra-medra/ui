# Tasks: add-data-table-frozen-columns-rows-and-scroll

## Phase 1: Setup

- [x] T001 Add a `minor` changeset for `@medra.dev/ui` describing `frozen`/`alignFrozen` support, `frozenValue`, `frozenRowsPosition` and `scrollHeight="flex"` in `.changeset/data-table-frozen-columns-rows-and-scroll.md` — verify: `npx changeset status` lists `@medra.dev/ui` as minor
  - evidence manual 2026-11-20: npx changeset status lists @medra.dev/ui under minor

## Phase 2: DAT-028 Data table frozen columns

- [x] T002 [TEST] [DAT-028] Write unit tests for DAT-028.S3, DAT-028.S4, DAT-028.S5, DAT-028.S6 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t 'DataTableComponent frozen columns'` exit 1 — "1523 | | 1524 |     for (const cells of [headerCells(fixture), firstRowCells(fixture)]) { | > 1525 |       expect(cells[0].style.position).toBe('sticky');"
- [x] T003 [P] [TEST] [DAT-028] Write real-browser tests for DAT-028.S1, DAT-028.S2, DAT-028.S4 against the docs demos in `e2e/site/data-table-frozen.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts --project=site --reporter=line --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-frozen-columns-demo') with timeout 5000ms | - waiting for locator('app-data-table-frozen-columns-demo')"
- [x] T004 [DAT-028] after T002 Give the reorder, selection and radio utility cells exact inline pixel widths (32px, 40px) and add the `frozenLayout` computed (side and offset per column, 60px fallback, resized widths included, utility base offset) in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T002 offset tests (S3, S5, S6) pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0
- [x] T005 [DAT-028] after T004 Apply sticky inline styles, opaque row-state-aware backgrounds with dark variants and the scroll-facing border to frozen header and body cells, make utility cells sticky when a left-frozen column exists, add `group` to rows and force `table-fixed` when any column is frozen in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T002 tests (S4) pass (green) and `npx jest projects/medra/ui/src/lib/data-table` stays green
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0
- [x] T006 [DAT-028] after T005 Update the class TSDoc (remove the "no frozen columns" cut) and the `frozen`/`alignFrozen` doc in `projects/medra/ui/src/lib/data-table/table-column.component.ts` — verify: no remaining text calls the inputs inert in `med-data-table`
  - evidence green 2026-11-20: `! grep -rn 'inert' projects/medra/ui/src/lib/data-table/data-table.component.ts projects/medra/ui/src/lib/data-table/table-column.component.ts` exit 0

## Phase 3: DAT-029 Data table frozen rows

- [x] T007 [TEST] [DAT-029] Write unit tests for DAT-029.S1, DAT-029.S2, DAT-029.S4, DAT-029.S5 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'frozen rows'` exit 1 — "Array [ | -   'Pinned', | 'Widget',"
- [x] T008 [P] [TEST] [DAT-029] Write real-browser tests for DAT-029.S3, DAT-029.S6 against the docs demos in `e2e/site/data-table-frozen.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g 'frozen rows' --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-frozen-rows-demo') with timeout 5000ms | - waiting for locator('app-data-table-frozen-rows-demo')"
- [x] T009 [DAT-029] after T007 Add the `frozenValue` and `frozenRowsPosition` inputs, extract the cell loop into one shared `ng-template` and render frozen rows without handlers, `tabindex`, drag or selection state in top and bottom `<tbody>` sections in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T007 tests pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]
- [x] T010 [DAT-029] after T009 Make the frozen `<tbody>` sections sticky (top at the `<thead>` height read through a `ResizeObserver` signal started after first render, bottom at 0) with opaque backgrounds in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` stays green and no `ResizeObserver` runs during SSR
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]

## Phase 4: DAT-030 Data table horizontal and flexible scroll

- [x] T011 [TEST] [DAT-030] Write real-browser tests for DAT-030.S1, DAT-030.S2 against the docs demos in `e2e/site/data-table-frozen.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g 'horizontal and flexible' --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-scroll-flexible-demo') with timeout 5000ms | - waiting for locator('app-data-table-scroll-flexible-demo')"
- [x] T012 [DAT-030] after T011 Support `scrollHeight="flex"` (flex-column host, `flex-1 min-h-0` wrapper, no `max-height`) and add `min-w-0` to the host so a wide table scrolls inside its wrapper in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` stays green and the fixed `scrollHeight` unit tests are unchanged
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0

## Phase 5: DAT-024 Data table documentation page

- [x] T013 [TEST] [DAT-024] Extend the example lists with the `frozen-columns`, `frozen-columns-both`, `frozen-rows`, `scroll-horizontal` and `scroll-flexible` slugs and add the DAT-024.S6 test in `e2e/site/data-table-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-docs.spec.ts -g DAT-024.S6` exit 1 — "118 |     for (const slug of FROZEN_AND_SCROLL) { | > 119 |       expect(anchorIds, `no section for '${slug}'`).toContain(`example-${slug}`); | |                                                     ^"
- [x] T014 [DAT-024] after T013 Add the `frozen-columns` and `frozen-columns-both` demos (`.ts` and `.html`) in `projects/site/src/app/pages/docs/components/demos/` — verify: T003 tests for DAT-028.S1, DAT-028.S2, DAT-028.S4 pass (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g DAT-028` exit 0
- [x] T015 [DAT-024] after T013 Add the `frozen-rows` demo with a `top` and a `bottom` table in `projects/site/src/app/pages/docs/components/demos/data-table-frozen-rows.demo.ts` and its `.html` — verify: T008 tests for DAT-029.S3, DAT-029.S6 pass (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g DAT-029` exit 0
- [x] T016 [DAT-024] after T013 Add the `scroll-horizontal` and `scroll-flexible` demos (`.ts` and `.html`) in `projects/site/src/app/pages/docs/components/demos/` — verify: T011 tests for DAT-030.S1, DAT-030.S2 pass (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-frozen.spec.ts -g DAT-030` exit 0
- [x] T017 [DAT-024] after T014, T015, T016 Add the five `EXAMPLES` entries, sections with English prose and code blocks in `projects/site/src/app/pages/docs/components/data-table.page.ts` and the prose files in `projects/site/src/content/docs/` — verify: `npx playwright test e2e/site/data-table-docs.spec.ts e2e/site/data-table-frozen.spec.ts` passes (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-docs.spec.ts e2e/site/data-table-frozen.spec.ts` exit 0
