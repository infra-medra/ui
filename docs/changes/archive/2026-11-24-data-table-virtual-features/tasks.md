# Tasks: data-table-virtual-features

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-062.S1 & DAT-062.S2 Expansion and subheader/expandable groups in virtual scroll

- [x] T001 [TEST] [DAT-062] Write tests for `DAT-062.S1` (`#rowexpansion` in `virtualScroll`) and `DAT-062.S2` (`rowGroupMode="subheader"` + `expandableRowGroups` in `virtualScroll`) in `projects/medra/ui/src/lib/data-table/data-table-virtual-expansions-groups.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-expansions-groups.spec.ts` exit 1 — "✕ DAT-062.S2: collapsing a group also hides expansion rows belonging to its rows (87 ms) | ✓ REQ DAT-062: lazy virtualScroll keeps #rowexpansion and rowGroupMode ignored (126 ms) | ● DataTableComponent virtualScroll expansion and subheader groups (DAT-062.S1, DAT-062.S2) › DAT-062.S1: expands row 0 "
- [x] T002 [DAT-062] after T001 Enable `effectiveRowGroupMode` and `expansionRowsRender` in non-lazy `virtualScroll` with flattened `virtualItems` (`subheader`, `row`, `expansion`), cumulative `virtualHeightIndex`, and `aria-rowcount`/`aria-rowindex` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-expansions-groups.spec.ts` exit 0

## Phase 2: DAT-062.S3 & DAT-062.S4 Row-span grouping and row reorder in virtual scroll

- [x] T003 [TEST] [DAT-062] Write tests for `DAT-062.S3` (window-sliced `rowGroupMode="rowspan"` in `virtualScroll`) and `DAT-062.S4` (`reorderable` with pinned dragged row and `value()` indices in `virtualScroll`) in `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` exit 1 — "✕ DAT-062.S4: unpins the dragged row on dragend without emitting rowReorder (162 ms) | ✕ DAT-062.S4: emits rowReorder indices relative to value() when the virtual table is sorted (84 ms) | ✓ REQ DAT-062: lazy virtualScroll keeps rowspan and reorderable ignored (143 ms)"
- [x] T004 [DAT-062] after T002, T003 Implement window-sliced `virtualRowSpans` for `rowGroupMode="rowspan"` and `draggedRowIndex` signal pinning + `dragend` cleanup for `reorderable` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T003 tests pass (green), `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit` exits 0, and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0
