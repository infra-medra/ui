# Tasks: data-table-advanced-filters

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-039 Between and multi-select (`in`) match modes

- [x] T001 [TEST] [DAT-039] Write unit tests for `between` and `in` match modes (numeric, date, text, partial bounds, empty values) for DAT-039.S2, DAT-039.S3 in `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` exit 1 — "✓ DAT-039.S1 notEquals 'widget' shows Gadget and widget pro (1 ms) | ✓ DAT-039.S1 contains, notContains and equals are case-insensitive (1 ms) | ✓ DAT-039.S1 a missing cell is read as the empty string (1 ms)"
- [x] T002 [DAT-039] after T001 Add `between` and `in` match modes to `data-table.types.ts` and `data-table-column-filter.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` exit 0

## Phase 2: DAT-038 Multi-rule AND/OR column filtering & persisted state bounds

- [x] T003 [TEST] [DAT-038] Write tests for DAT-038.S9 (multiple rules per column with `and`/`or` operator in UI and `columnFilters` model, plus bounded `stateKey` restore) and `between`/`in` UI controls in `projects/medra/ui/src/lib/data-table/data-table-advanced-filters.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-advanced-filters.spec.ts` exit 1 — "✕ DAT-038.S9 adding two rules in the filter menu with AND then switching to OR updates rows and columnFilters (247 ms) | ✕ DAT-038.S9 supports removing an added rule and custom addRule/matchAll/matchAny labels (170 ms) | between and in menu UI controls"
- [x] T004 [DAT-038] after T002, T003 Implement `TableColumnFilterGroup` (`and`/`or`), multi-rule filter menu UI, `between`/`in` menu controls, and bounded `parseStoredColumnFilters` in `data-table.types.ts`, `data-table-column-filter.ts`, `data-table-state.ts`, and `data-table.component.ts` — verify: T003 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-advanced-filters.spec.ts` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table.component.spec.ts +0/-0 other (the files are too large to compare line by line); reason "User authorized 2-line TableColumnFilter type narrowing in data-table.component.spec.ts for TableColumnFilters union type"]

## Phase 3: DAT-057 Inline filter row (`filterDisplay="row"`) and `#filter` template

- [x] T005 [TEST] [DAT-057] Write tests for DAT-057.S1 (`filterDisplay="row"` inline filter row) and DAT-057.S2 (`#filter` custom template in row and menu modes) in `projects/medra/ui/src/lib/data-table/data-table-filter-row.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-filter-row.spec.ts` exit 1 — "✕ DAT-057.S1 typing 'wid' in the name filter row input filters immediately without opening a popover, updates columnFilters, and emits filter (212 ms) | ✕ DAT-057.S1 numeric filter row input filters rows immediately (160 ms) | ✓ DAT-057.S1 omits the filter row when the table is stacked (170 ms)"
- [x] T006 [DAT-057] after T004, T005 Add `filterTemplate` (`#filter`) and `filterOptions` to `table-column.component.ts` and `filterDisplay="row"` + `#filter` rendering to `data-table.component.ts` — verify: T005 tests pass (green) and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table-filter-row.spec.ts +4/-4 other (4 line(s) of the red version were removed or edited); reason "User authorized converting FilterOptionsHostComponent.filterDisplay to signal in data-table-filter-row.spec.ts for zoneless NG0100"]
