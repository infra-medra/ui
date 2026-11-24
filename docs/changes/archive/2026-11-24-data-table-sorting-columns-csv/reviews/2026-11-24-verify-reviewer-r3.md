# Review: data-table-sorting-columns-csv — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

Round 3 verification passes with one minor finding: both critical blockers from Round 2 are resolved, `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exits `0`, `medra coverage` reports `25/25` scenarios covered, and the full test suite (`npm test`) passes (`183` suites, `4741` tests). Specifically, `data-table.component.ts:2017` now calls `this.isGroupStart(row, i)` and `data-table-sorting-csv.spec.ts:91-128` covers `DAT-003.S1` with default `removableSort` unset, unsorted tie-breaking rows, `tbody tr` cell order assertions, and `1`/`2` priority badges. One minor test-coverage gap remains from Round 2 `F-01`: no unit test exercises `merge` together with `rowGroupMode="subheader"`.

## Findings

### F-01 [minor] No unit test exercises `merge` spans across `rowGroupMode="subheader"` boundaries

**Where:** `projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts:183-256` (`projects/medra/ui/src/lib/data-table/data-table.component.ts:2012-2021`) · `DAT-058`
**Problem:** Although `data-table.component.ts:2017` now passes both arguments (`this.isGroupStart(row, i)`) and `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` exits `0`, `data-table-columns-merge.spec.ts` is unchanged since Round 2 (`sha256: 90723253...`) and has no test combining `col.merge()` with `rowGroupMode="subheader"`. As a result, the `isSubheader && this.isGroupCollapsed(row)` (`:2012-2016`) and `isSubheader && this.isGroupStart(row, i)` (`:2017`) guard branches in `mergeSpans` are verified only by inspection and remain unexecuted in the Jest suite.
**Fix:** With user authorization if `data-table-columns-merge.spec.ts` remains locked under `T003`, add a unit test in `projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts` combining `merge` with `rowGroupMode="subheader"` and `groupRowsBy` to verify that `rowspan` resets across subheader group boundaries (both expanded adjacent groups sharing merge values and collapsed groups).

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-058` | `table-column.component.ts:82` (carried from r1), `data-table.component.ts:387, 400, 549-558, 1930-2051` (`this.isGroupStart(row, i)` fixed at `:2017`; `tsconfig.lib.json` exits `0`); `data-table-columns-merge.spec.ts:183-256` (`DAT-058.S1`; carried from r1); tasks `T003` (red), `T004` (green); `npm test` green | met |
| `DAT-059` | Carried from r1 (`data-table.component.ts:598-634, 768-773, 910-955, 1282-1293, 2361-2367`; `data-table-columns-merge.spec.ts:303-332` (`DAT-059.S1`); tasks `T003` (red), `T004` (green)) | met |
| `DAT-003` | `data-table.component.ts:666-668, 2054-2083, 3108-3154`; `data-table-sorting-csv.spec.ts:64-146` (`DAT-003.S1` at `:91-128` with default `removableSort`, sorted `tbody tr` cells, and `1`/`2` badges; `DAT-003.S2` at `:65-89, 130-145`), `data-table.component.spec.ts:760-822` (carried from r1); tasks `T001` (red), `T002` (green); `npm test` green | met |
| `DAT-009` | Carried from r2 (`data-table.component.ts:3807-3828`; `data-table.component.spec.ts:999-1004, 1855-1870, 3126-3139` (`DAT-009.S1`, `DAT-009.S2`), `data-table-sorting-csv.spec.ts:251-286` (`DAT-009.S3`); tasks `T001` (red), `T002` (green)) | met |
| `DAT-034` | Carried from r1 (`table-column.component.ts:74-93`, `data-table.component.ts:1125, 3071-3106`; `data-table.component.spec.ts:2198-2381` (`DAT-034.S1`–`S11`), `e2e/site/data-table-column-reorder.spec.ts:37-109`, `data-table-columns-merge.spec.ts:79-131` (`DAT-034.S12`); tasks `T003` (red), `T004` (green)) | met |
| `DAT-055` | Carried from r2 (`data-table.types.ts:24-37`, `table-column.component.ts:65-70`, `data-table.component.ts:1531-1547, 1902-1910, 2054-2100`; `data-table-column-templates.spec.ts:600-662` (`DAT-055.S1`–`S5`), `data-table-sorting-csv.spec.ts:183-225` (`DAT-055.S6`); tasks `T001` (red), `T002` (green)) | met |
