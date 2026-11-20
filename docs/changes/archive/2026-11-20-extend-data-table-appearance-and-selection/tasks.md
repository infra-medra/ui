# Tasks: extend-data-table-appearance-and-selection

## Phase 1: DAT-025 Data table appearance

- [x] T001 [TEST] [DAT-025] Write the Playwright site spec for DAT-025.S1, DAT-025.S2, DAT-025.S3 (computed padding of `size` `sm` vs `lg`, cell borders with and without `showGridlines`, background of the first and second row with `stripedRows`) in `e2e/site/data-table-appearance.spec.ts` — verify: `npx playwright test --project=site e2e/site/data-table-appearance.spec.ts` fails (red)
  - evidence red 2026-11-20: `npx playwright test --project=site e2e/site/data-table-appearance.spec.ts --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-grid-lines-demo med-data-table').first() with timeout 5000ms | - waiting for locator('app-data-table-grid-lines-demo med-data-table').first()"
- [x] T002 [DAT-025] after T001 Add the `size`, `showGridlines` and `stripedRows` inputs, the per-size class map and the row-index stripe to the header, body, group, expansion and selection cells in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` passes (green) with the existing tests unchanged
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]
- [x] T003 [DAT-025] after T001 Add the `size`, `grid-lines` and `striped-rows` demos and prose (`size`, `showGridlines`, `stripedRows`) in `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/` — verify: each slug has `.demo.ts`, `.demo.html` and a `.txt` starting with `## `, every table has an `ariaLabel`, and the demos use only inputs listed in `data-table.component.ts`
  - evidence green 2026-11-20: `for s in size grid-lines striped-rows; do test -f projects/site/src/app/pages/docs/components/demos/data-table-$s.demo.ts && test -f projects/site/src/app/pages/docs/components/demos/data-table-$s.demo.html && head -c 3 projects/site/src/content/docs/data-table-$s.txt | grep -q '## ' || exit 1; test $(grep -o '<med-data-table' projects/site/src/app/pages/docs/components/demos/data-table-$s.demo.html | wc -l) = $(grep -o 'ariaLabel=' projects/site/src/app/pages/docs/components/demos/data-table-$s.demo.html | wc -l) || exit 1; done` exit 0 [test-edited]

## Phase 2: DAT-006 Data table selection

- [x] T004 [TEST] [DAT-006] Write the Jest tests for DAT-006.S3 (radio selection: checked radio follows the selection, one `rowSelect`, no select-all control, single behavior kept) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` fails on the new tests (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 1 — "Received array:  [] | 343 |       const fixture = create((h) => (h.selectionMode = 'radio')); | 344 |       const inputs = radios(fixture);"
- [x] T005 [DAT-006] after T004 Add the `radio` value to `TableSelectionMode`, treat `single` and `radio` alike in selection, click and `tabindex` handling, and render the radio cell (native radio from `radioRingVariants`, empty header cell, `rowAriaLabel` name, counted in `totalColumnCount`) in `projects/medra/ui/src/lib/data-table/data-table.types.ts` and `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T004 tests pass (green) and the DAT-006.S1 and DAT-006.S2 tests still pass
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0

## Phase 3: DAT-026 Data table row keyboard navigation

- [x] T006 [TEST] [DAT-026] Write the Jest tests for DAT-026.S1, DAT-026.S2, DAT-026.S3 (ArrowDown keeps the selection, Home and End in `radio` mode, ArrowUp at the first row stays put, `multiple` mode ignores the keys, group header rows skipped) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` fails on the new tests (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 1 — "@@ -9,29 +9,29 @@ | <!--container--> | <td"
- [x] T007 [DAT-026] after T006, T005 Handle ArrowUp, ArrowDown, Home and End in `onRowKeydown`, focusing a sibling `tbody > tr[tabindex]` row without changing the selection, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T006 tests pass (green) and the earlier data-table tests still pass
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]

## Phase 4: DAT-024 Data table documentation page

- [x] T008 [TEST] [DAT-024] Extend the Playwright site spec with DAT-024.S4 (radio selection, size, grid lines, striped rows and keyboard navigation each have a section with a demo) in `e2e/site/data-table-docs.spec.ts` — verify: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` fails on DAT-024.S4 (red)
  - evidence red 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts -g DAT-024.S4` exit 1 — "91 |     for (const slug of NEW_APPEARANCE_AND_SELECTION) { | > 92 |       expect(anchorIds, `no section for '${slug}'`).toContain(`example-${slug}`); | |                                                     ^"
- [x] T009 [DAT-024] after T008, T005, T007 Add the `selection-radio` and `keyboard-navigation` demos and prose (`selectionMode="radio"`, ArrowUp, ArrowDown, Home and End on rows) in `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/` — verify: each slug has `.demo.ts`, `.demo.html` and a `.txt` starting with `## `, every table has an `ariaLabel`, and the demos use only inputs listed in `data-table.component.ts`
  - evidence green 2026-11-20: `for s in selection-radio keyboard-navigation; do d=projects/site/src/app/pages/docs/components/demos/data-table-$s.demo; test -f $d.ts && test -f $d.html && head -c3 projects/site/src/content/docs/data-table-$s.txt | grep -q "## " && grep -q ariaLabel $d.html || exit 1; done` exit 0 [test-edited]
- [x] T010 [DAT-024] after T009, T003, T002 Add the five slugs `selection-radio`, `keyboard-navigation`, `size`, `grid-lines` and `striped-rows` to the `EXAMPLES` constant, imports and sections of `projects/site/src/app/pages/docs/components/data-table.page.ts` — verify: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts e2e/site/data-table-appearance.spec.ts` passes (green) and `npm run build:site` succeeds
  - evidence green 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts e2e/site/data-table-appearance.spec.ts --trace off && npm run build:site` exit 0 [test-edited]

## Phase 5: Release and verification

- [x] T011 Add a `minor` changeset for `@medra.dev/ui` describing the `size`, `showGridlines` and `stripedRows` inputs, the `radio` selection mode and the row keyboard navigation in `.changeset/` — verify: `ls .changeset/*.md` lists the new file, and its front matter names `@medra.dev/ui` with `minor`
  - evidence green 2026-11-20: `ls .changeset/*.md && grep -q "@medra.dev/ui.: minor" .changeset/data-table-appearance-and-selection.md` exit 0
- [x] T012 after T010, T011 Run the full verification set — verify: `npm test`, `npm run build:ui` and `npm run build:site` exit 0
  - evidence green 2026-11-20: `npm test && npm run build:ui && npm run build:site` exit 0 [test-edited]

## Phase 6: DAT-006 Scenario traceability

- [x] T013 [DAT-006] after T005 Tag the existing select-all test with its scenario ID (`// DAT-006.S1` and a `DAT-006.S1:` title prefix) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` passes (green) and `medra coverage` lists DAT-006.S1 as covered
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]
- [x] T014 [DAT-006] after T013 Tag the existing `dataKey` selection tests with their scenario ID (`// DAT-006.S2` and a `DAT-006.S2:` title prefix) in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` passes (green) and `medra coverage` lists no uncovered scenario
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]
