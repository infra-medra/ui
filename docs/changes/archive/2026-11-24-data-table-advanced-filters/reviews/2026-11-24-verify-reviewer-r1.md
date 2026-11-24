# Review: data-table-advanced-filters — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

All three requirements (`DAT-057`, `DAT-038`, `DAT-039`) are implemented, TDD evidence (`red` before `green`) is intact across all six tasks, no tests were weakened, and the test suite is green. The most important issue is a regression in keyboard column reordering (`moveColumnByKey`) where querying `thead tr:last-child th[scope="col"]` targets `<tr data-med-filter-row>` when `filterDisplay="row"` is active and drops keyboard focus instead of returning it to the moved header. Two minor issues affect programmatic ISO date string values in `DatePicker` filter controls and uncleaned `FormControl.valueChanges` subscriptions across filter menu opens.

## Findings

### F-01 [major] Keyboard column reorder loses focus when `filterDisplay="row"` is active

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2833` (and lines `607`, `770-782`) · DAT-057 / Constitution Article VI
**Problem:** After moving a column with `Alt+ArrowLeft` or `Alt+ArrowRight`, `moveColumnByKey` restores focus by querying `thead tr:last-child th[scope="col"]`. When `filterDisplay="row"` is enabled and the table is not stacked, `<tr data-med-filter-row>` is rendered after `<tr data-med-header-row>` as `thead tr:last-child`, and its `<th>` elements have no `scope="col"`, so `headers` resolves to `[]` and focus is lost.
**Fix:** Update the query in `moveColumnByKey` to `'thead tr[data-med-header-row] th[scope="col"]'`, and add a Jest test enabling both `reorderableColumns` and `filterDisplay="row"` that presses `Alt+ArrowRight` on a header and asserts focus stays on the moved `th[scope="col"]`.

### F-02 [minor] Programmatic ISO date string rules leave menu and row `DatePicker` controls blank

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1637-1648, 2489-2491, 2564-2567` · DAT-038 / DAT-039.S2
**Problem:** `matchesDate` (`projects/medra/ui/src/lib/data-table/data-table-column-filter.ts:57-67`) accepts both `Date` objects and ISO date strings (`YYYY-MM-DD` and `YYYY-MM-DDT...`), and `DAT-039.S2` specifies ISO string bounds (`["2026-01-10", "2026-01-20"]`). However, `createDraftRule`, `getOrCreateRowControls`, and the `rowControls` sync effect guard with `value instanceof Date ? value : null`, so writing ISO date strings to `[(columnFilters)]` filters the rows while showing empty `med-date-picker` inputs in the menu and filter row.
**Fix:** Extract a shared helper that converts `Date` values and valid ISO date strings (parsing `YYYY-MM-DD` in local time, matching `dayKey`) to `Date | null` for those `FormControl` initializations and updates.

### F-03 [minor] Filter menu drafts leak `valueChanges` subscriptions across opens and allocate drafts for `#filter` templates

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2561-2630` (and line `683`) · DAT-038 / DAT-057.S2
**Problem:** Each filter menu opening invokes `onFilterMenuShown` and `createDraftRule`, subscribing `operatorControl`, `modeControl`, `dateControl`, `dateStartControl`, `dateEndControl`, and `multiSelectControl` `valueChanges` with `takeUntilDestroyed(this.destroyRef)`. Those subscriptions are never torn down on `onFilterMenuHidden` or `removeFilterRule`, accumulating until `DataTableComponent` is destroyed, and `onFilterMenuShown` still constructs the draft when `col.filterTemplate()` replaces the default UI.
**Fix:** Return early from `onFilterMenuShown` when `col.filterTemplate()` is set (after updating `openFilterField`), and complete a per-draft (and per-rule) teardown `Subject<void>` in `onFilterMenuHidden` and `removeFilterRule`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-057` | `tasks.md` T005/T006; `projects/medra/ui/src/lib/data-table/table-column.component.ts:119, 140-144`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:684-687, 770-828, 1031, 2454-2468`; `projects/medra/ui/src/lib/data-table/data-table-filter-row.spec.ts:129-310` (`DAT-057.S1`, `DAT-057.S2`) | met |
| `DAT-038` | `tasks.md` T003/T004; `projects/medra/ui/src/lib/data-table/data-table-column-filter.ts:184-231`; `projects/medra/ui/src/lib/data-table/data-table-state.ts:21-24, 132-223`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:670-750, 2356-2402, 2561-2751`; `projects/medra/ui/src/lib/data-table/data-table-advanced-filters.spec.ts:116-240, 349-486` (`DAT-038.S9`, bounded `stateKey`); `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3092-3373` (`DAT-038.S2`–`S8`); `e2e/site/data-table-column-filters.spec.ts:47-145` (`DAT-038.S1`, `S5`, `S7`) | met |
| `DAT-039` | `tasks.md` T001/T002; `projects/medra/ui/src/lib/data-table/data-table.types.ts:64-86`; `projects/medra/ui/src/lib/data-table/data-table-column-filter.ts:4-181`; `projects/medra/ui/src/lib/data-table/table-column.component.ts:117`; `projects/medra/ui/src/lib/data-table/data-table.component.ts:2405-2435`; `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts:13-170` (`DAT-039.S1`, `DAT-039.S2`, `DAT-039.S3`); `projects/medra/ui/src/lib/data-table/data-table-advanced-filters.spec.ts:243-346` (`DAT-039.S2`, `DAT-039.S3`); `projects/medra/ui/src/lib/data-table/data-table-filter-row.spec.ts:312-330` (`filterOptions`) | met |
