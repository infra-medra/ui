# Review: data-table-sorting-columns-csv — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

All six added and modified requirements (`DAT-003`, `DAT-009`, `DAT-034`, `DAT-055`, `DAT-058`, `DAT-059`) are implemented across `data-table.types.ts`, `table-column.component.ts`, and `data-table.component.ts`, with passing TDD evidence (`T001`–`T004`, `Suite: green`), verified user-authorized test edits, and no constitution violations. Two minor findings remain: `DAT-003.S1` is not tagged with a scenario ID in tests (leaving CLI coverage at 24/25 scenarios) and splits its Shift+click, sort order, and badge clauses across three separate `it` blocks, and `mergeSpans` does not reset or exclude rows when `col.merge()` is combined with `rowGroupMode="subheader"`.

## Findings

### F-01 [minor] Missing scenario tag and combined assertions for DAT-003.S1

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:760-822` · `DAT-003` (`DAT-003.S1`)
**Problem:** CLI pre-checks report `Coverage: 24/25 scenarios cited by a test; uncovered: DAT-003.S1`. In `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:760-822`, `DAT-003.S1` ("Given a table sorted by column A in multiple mode / When the user Shift+clicks column B / Then the data is sorted by A then B and both show priority badges") is covered functionally across three untagged `it` blocks (`:760-771` verifies Shift+click updating `multiSortMeta`, `:773-788` verifies tie-breaking row order from preset `multiSortMeta`, and `:812-822` verifies priority badges from preset `multiSortMeta`), leaving `DAT-003.S1` unlinked in coverage tracking and without a single test asserting both sorted data and priority badges after Shift+click (Constitution Article XI).
**Fix:** Add or tag a `DAT-003.S1` test (in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` or `projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts`) starting from a table sorted by column A in `sortMode="multiple"`, Shift+clicking column B, and asserting both the resulting A-then-B row order and the `1` and `2` priority badges on the column headers.

### F-02 [minor] Column merge spans do not break on subheader group boundaries

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1930-1945, 1997-2025` · `DAT-058`
**Problem:** `mergedColumnFields` (`data-table.component.ts:1930-1945`) disables column merging when `stacked()` or `virtualScroll()` is true, and `mergeSpans` (`data-table.component.ts:1997-2025`) iterates `pagedValue()` merging consecutive rows with equal raw values without checking `this.isGroupStart(row, i)` or `this.isRowHiddenByGroup(row)` (`data-table.component.ts:444-467`). If `col.merge()` is used together with `rowGroupMode="subheader"`, consecutive groups sharing the same raw value across a subheader `<tr>` (or collapsed group rows) would produce a `rowspan` spanning across the subheader row or hidden rows.
**Fix:** Either exclude `col.merge()` in `mergedColumnFields` when `effectiveRowGroupMode() === 'subheader'`, or reset the active merge run in `mergeSpans` whenever `this.isGroupStart(row, i)` is true and skip rows where `this.isRowHiddenByGroup(row)` is true.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-058` | `table-column.component.ts:82`, `data-table.component.ts:387, 400, 549-558, 1930-2042`; `data-table-columns-merge.spec.ts:183-256` (`DAT-058.S1`); tasks `T003` (red), `T004` (green) | met |
| `DAT-059` | `data-table.component.ts:598-634, 768-773, 903-959, 1282-1293, 2352-2358`; `data-table-columns-merge.spec.ts:303-332` (`DAT-059.S1`); tasks `T003` (red), `T004` (green) | met |
| `DAT-003` | `data-table.component.ts:666-668, 2052-2074, 2929-2935, 3123-3145`; `data-table-sorting-csv.spec.ts:64-107` (`DAT-003.S2`), `data-table.component.spec.ts:760-822, 1165-1174` (untagged `DAT-003.S1` + `sort` output); tasks `T001` (red), `T002` (green) | met |
| `DAT-009` | `data-table.component.ts:3798-3819`; `data-table.component.spec.ts:999-1004, 1855-1870, 3126-3139` (`DAT-009.S1`, `DAT-009.S2`), `data-table-sorting-csv.spec.ts:212-247` (`DAT-009.S3`); tasks `T001` (red), `T002` (green) | met |
| `DAT-034` | `table-column.component.ts:74-93`, `data-table.component.ts:1125, 3061-3097`; `data-table.component.spec.ts:2198-2381` (`DAT-034.S1`–`S11`), `e2e/site/data-table-column-reorder.spec.ts:37-109`, `data-table-columns-merge.spec.ts:79-131` (`DAT-034.S12`); tasks `T003` (red), `T004` (green) | met |
| `DAT-055` | `data-table.types.ts:26-34`, `table-column.component.ts:65-70`, `data-table.component.ts:1530-1547, 1902-1910, 2045-2091`; `data-table-column-templates.spec.ts:601-661` (`DAT-055.S1`–`S5`), `data-table-sorting-csv.spec.ts:144-186` (`DAT-055.S6`); tasks `T001` (red), `T002` (green) | met |
