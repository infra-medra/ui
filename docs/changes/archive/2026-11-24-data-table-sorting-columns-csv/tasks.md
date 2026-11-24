# Tasks: data-table-sorting-columns-csv

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-003, DAT-055, DAT-009 Sorting, lazy sortBy, and CSV footer

- [x] T001 [TEST] [DAT-003, DAT-055, DAT-009] Write tests for DAT-003.S2 (`removableSort="false"` in `sortMode="multiple"`), DAT-055.S6 (`sortBy`/`multiSortByMeta` in `lazyLoad`), and DAT-009.S3 (`exportCSV({ includeFooter: true })`) in `projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts` exit 1 — "✕ DAT-055.S6: emits sortField as status and resolved sortBy as statusRank in single sort mode (82 ms) | ✕ DAT-055.S6: emits multiSortMeta with field names and multiSortByMeta with resolved sortBy names in multiple sort mode (89 ms) | DataTableComponent exportCSV with footer (DAT-009.S3)"
- [x] T002 [DAT-003, DAT-055, DAT-009] after T001 Implement `removableSort` in `toggleMultiSort`, `sortBy`/`multiSortByMeta` in `TableLazyLoadEvent` and `lazyLoad` effects, and `includeFooter` in `exportCSV` in `projects/medra/ui/src/lib/data-table/data-table.types.ts` and `data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table.component.spec.ts +2/-0 additive; reason "User authorized updating strict TableLazyLoadEvent assertion in DAT-007.S1 of data-table.component.spec.ts with sortBy and multiSortByMeta"]

## Phase 2: DAT-034, DAT-058, DAT-059 Frozen boundary reorder, cell merge, and utility templates

- [x] T003 [TEST] [DAT-034, DAT-058, DAT-059] Write tests for DAT-034.S12 (`reorderAcrossFrozen`), DAT-058.S1 (`merge` on non-grouped columns), and DAT-059.S1 (`#reorderHeader`/`#reorderFooter`/`#selectionHeader`/`#selectionFooter`/`#rowActionsHeader`/`#rowActionsFooter`) in `projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts` exit 1 — "DataTableComponent column cell merging (DAT-058.S1) | ✕ DAT-058.S1: merges consecutive equal cells across multiple columns without groupRowsBy and preserves row order (98 ms) | ✕ DAT-058.S1: keeps rows rectangular across page boundaries (148 ms)"
- [x] T004 [DAT-034, DAT-058, DAT-059] after T003 Add `reorderAcrossFrozen` + two-way `frozen`/`alignFrozen`, `merge` column `rowspan` matrix, and utility header/footer template slots in `projects/medra/ui/src/lib/data-table/table-column.component.ts` and `data-table.component.ts` — verify: T003 tests pass (green) and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts +1/-1 weakening (an assertion was removed or changed); reason "User authorized fixing expected right frozen offset from 120px to 80px in data-table-columns-merge.spec.ts"]
