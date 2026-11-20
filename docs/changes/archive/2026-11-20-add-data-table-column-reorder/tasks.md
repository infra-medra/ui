# Tasks: add-data-table-column-reorder

## Phase 1: Setup

- [x] T001 Add the `TableColumnReorderEvent` interface (`dragIndex`, `dropIndex`, `columns`) in `projects/medra/ui/src/lib/data-table/data-table.types.ts` and a `reorderable` input (boolean, default `true`) with TSDoc on `TableColumnComponent` in `projects/medra/ui/src/lib/data-table/table-column.component.ts` — verify: `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exits 0
  - evidence green 2026-11-20: `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exit 0

## Phase 2: DAT-034 Data table column reorder

- [x] T002 [TEST] [DAT-034] after T001 Write tests for DAT-034.S1, DAT-034.S2, DAT-034.S3, DAT-034.S4, DAT-034.S5, DAT-034.S6, DAT-034.S7, DAT-034.S10, DAT-034.S11 in a new `describe('DataTableComponent column reorder')` in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (dispatch `dragstart`/`dragover`/`drop`/`dragend` on header cells) — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'column reorder'` exit 1 — "Array [ | +   'A', | 'B',"
- [x] T003 [TEST] [DAT-034] after T002 Write tests for DAT-034.S8, DAT-034.S9 (Alt+Arrow order, `colReorder` payload, focus kept, live region text, edge no-op) in the same `describe` of `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-034.S[89]'` exit 1 — "Array [ | 'A', | -   'C',"
- [x] T004 [DAT-034] after T002 Add the `reorderableColumns` input, the `columnOrder` signal, the `orderedColumns` computed and rebase `visibleColumns` on it, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` (D-01, D-02) — verify: existing data-table tests still pass and the order-derivation cases in T002 move toward green
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table -t '^(?!.*column reorder)'` exit 0 [test-edited]
- [x] T005 [DAT-034] after T004 Add `moveColumn(fromField, toField)` with the equal-field, `reorderable` and frozen-edge guards, the full-order `dragIndex`/`dropIndex` and the `colReorder` output (`TableColumnReorderEvent`) in `projects/medra/ui/src/lib/data-table/data-table.component.ts` (D-01, D-02) — verify: T002 tests for S2, S3, S4, S5, S6 and S7 pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-034.S[2-7]'` exit 0 [test-edited]
- [x] T006 [DAT-034] after T005 Add the header drag handlers (`[draggable]` only with `reorderableColumns` and a reorderable column, `dragstart` cancelled while `colResizeState` is set, `dragover` default prevented only over a valid target, `drop`, `dragend`) and the `dropTargetField` highlight using brand/surface tokens with `dark:` variants, in the `<th>` of `projects/medra/ui/src/lib/data-table/data-table.component.ts` (D-03, D-05) — verify: T002 tests pass (green), including S1, S10 and S11
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-034.S([1-7]|1[01])'` exit 0 [test-edited]
- [x] T007 [DAT-034] after T005 Add Alt+ArrowLeft/Right handling in `onHeaderKeydown` (nearest visible column, `preventDefault`, no effect without `reorderableColumns`), `tabindex` 0 on reorderable headers, the `focus-visible` ring for them in `headerCellClass`, and refocus of the header after the move via `afterNextRender`, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` (D-04, D-05) — verify: T003 S9 and the order, event and focus assertions of S8 pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-034.S[89]'` exit 0 [test-edited]
- [x] T008 [DAT-034] after T007 Add the `columnMoveAnnouncement` input (default `` `${header} moved to position ${position} of ${total}` ``), the announcement signal and the visually hidden `role="status"` `aria-live="polite"` element in `projects/medra/ui/src/lib/data-table/data-table.component.ts` (D-04, Article VIII) — verify: T003 tests pass (green), including the live region text of S8
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'DAT-034.S[89]'` exit 0 [test-edited]
- [x] T009 [DAT-034] after T008 Update the TSDoc of `DataTableComponent` for `reorderableColumns`, `colReorder` and `columnMoveAnnouncement` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: `npx jest projects/medra/ui/src/lib/data-table` passes in full
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited]

## Phase 3: DAT-024 Data table documentation page

- [x] T010 [TEST] [DAT-024] [DAT-034] after T009 Write the real-browser tests for DAT-024.S9, DAT-034.S1, DAT-034.S5, DAT-034.S8 in a new `e2e/site/data-table-column-reorder.spec.ts` (drag a header in the `column-reorder` demo, sticky offsets after a frozen-column move, Alt+ArrowRight keeps focus on the header) and add `column-reorder` to the expected sections in `e2e/site/data-table-docs.spec.ts` — verify: `npx playwright test e2e/site/data-table-column-reorder.spec.ts` fails (red)
  - evidence red 2026-11-20: `npx playwright test e2e/site/data-table-column-reorder.spec.ts --trace off` exit 1 — "Call log: | - Expect 'toBeAttached' locator('app-data-table-column-reorder-demo') with timeout 5000ms | - waiting for locator('app-data-table-column-reorder-demo')"
- [x] T011 [DAT-024] after T010 Add `{ id: 'example-column-reorder', label: 'Column reorder' }` after `example-column-groups` in `EXAMPLES` and a matching section (English prose, a live demo with `reorderableColumns`, a pinned column with `reorderable` false and a `colReorder` readout, and a code block of the demo template) in `projects/site/src/app/pages/docs/components/data-table.page.ts` (D-06) — verify: `npx playwright test e2e/site/data-table-column-reorder.spec.ts e2e/site/data-table-docs.spec.ts` pass (green)
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-column-reorder.spec.ts e2e/site/data-table-docs.spec.ts --trace off` exit 0 [test-edited]
- [x] T012 [DAT-024] after T011 Add the changeset `.changeset/data-table-column-reorder.md` (`'@medra.dev/ui': minor`) describing `reorderableColumns`, `reorderable`, `colReorder` and `columnMoveAnnouncement` — verify: `npx changeset status` lists `@medra.dev/ui` as a minor bump
  - evidence green 2026-11-20: `npx changeset status` exit 0 [test-edited]
