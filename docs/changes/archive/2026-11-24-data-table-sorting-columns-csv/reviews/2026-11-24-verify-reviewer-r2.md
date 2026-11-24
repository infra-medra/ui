# Review: data-table-sorting-columns-csv — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 2 · major 0 · minor 0
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

Round 2 verification fails with two critical findings on the fixes for Round 1's `F-01` and `F-02`. In `data-table.component.ts:2017`, `mergeSpans` calls `this.isGroupStart(i)` with one argument where `isGroupStart(row: T, index: number)` expects two, failing `tsconfig.lib.json` typechecking (`TS2554`) and throwing a `TypeError` at runtime when `merge` is used with `rowGroupMode="subheader"`; meanwhile, the new `DAT-003.S1` test in `data-table-sorting-csv.spec.ts:91-108` violates Constitution Article XI by omitting any assertion on sorted row order (`tbody tr`) while using pre-sorted rows and a non-default `removableSort="false"` host.

## Findings

### F-01 [critical] `mergeSpans` calls `isGroupStart(i)` with missing `row` argument, breaking TypeScript compilation and crashing on subheader grouping

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2017` (definition at `:2219-2229`) · `DAT-058`
**Problem:** To address Round 1 `F-02`, line `2017` added `const groupBoundary = isSubheader && this.isGroupStart(i);`, passing only the row index `i` to `isGroupStart(row: T, index: number)` (`:2219`). Running `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` fails with exit code 2 (`projects/medra/ui/src/lib/data-table/data-table.component.ts:2017:51 - error TS2554: Expected 2 arguments, but got 1.`), breaking `ng build @medra.dev/ui`. At runtime, when `rowGroupMode="subheader"` and `groupRowsBy` are active with a `merge` column, `index` evaluates as `undefined`: `if (index === 0)` (`:2224`) is `false`, `this.pagedValue()[index - 1]` (`:2227`) yields `undefined`, and `this.rowFieldValue(previous, field)` (`:2228`, `:1886`) throws a `TypeError` reading `field` from `undefined`. No test covers `merge` together with `rowGroupMode="subheader"`.
**Fix:** Change line `2017` to `const groupBoundary = isSubheader && this.isGroupStart(row, i);`, verify `npx tsc --noEmit -p projects/medra/ui/tsconfig.lib.json` passes with zero errors, and add a unit test in `projects/medra/ui/src/lib/data-table/data-table-columns-merge.spec.ts` verifying that `merge` resets spans across `rowGroupMode="subheader"` boundaries (both expanded adjacent groups with matching merge values and collapsed groups).

### F-02 [critical] `DAT-003.S1` test violates Constitution Article XI by omitting sorted data assertions and relying on non-default `removableSort="false"`

**Where:** `projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts:36-62, 91-108` · `DAT-003` (`DAT-003.S1`)
**Problem:** Scenario `DAT-003.S1` requires: "Given a table sorted by column A in multiple mode / When the user Shift+clicks column B / Then the data is sorted by A then B and both show priority badges." The new test tagged `DAT-003.S1` (`:91-108`) asserts only `host.multiSortMeta` (`:102-105`) and header priority badges `'1'` and `'2'` (`:106-107`) — it never asserts the rendered body rows (`tbody tr`), and `NonRemovableMultiSortHostComponent.rows` (`:53-57`) is already pre-sorted (`Alpha/1`, `Alpha/2`, `Beta/3`). In addition, `NonRemovableMultiSortHostComponent` sets `[removableSort]="false"` (`:43`) instead of leaving default inputs unset. This violates Constitution Article XI ("Every test tagged with a scenario ID MUST assert each Given and Then clause of that scenario, including the library's own defaults when the scenario relies on them, with the inputs left unset") without `Complexity Tracking`.
**Fix:** Give `DAT-003.S1` a dedicated host in `projects/medra/ui/src/lib/data-table/data-table-sorting-csv.spec.ts` with default `removableSort` left unset, initial unsorted/tie-breaking rows (e.g., `Beta/1`, `Alpha/2`, `Alpha/1`) sorted by column `a`, Shift+click column `b`, and assert `multiSortMeta`, the `1`/`2` priority badges, and the resulting `tbody tr` cell order (`[['Alpha', '1'], ['Alpha', '2'], ['Beta', '1']]`).

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-058` | `table-column.component.ts:82` (carried from r1), `data-table.component.ts:387, 400, 549-558, 1930-2042`; `data-table-columns-merge.spec.ts:183-256` (`DAT-058.S1`; carried from r1); tasks `T003` (red), `T004` (green); `data-table.component.ts:2017` fails `tsc` (`F-01`) | partial |
| `DAT-059` | Carried from r1 (`data-table.component.ts:598-634, 768-773, 903-959, 1282-1293, 2361-2367`; `data-table-columns-merge.spec.ts:303-332` (`DAT-059.S1`); tasks `T003` (red), `T004` (green)) | met |
| `DAT-003` | `data-table.component.ts:666-668, 2054-2083, 2938-2944, 3108-3154`; `data-table-sorting-csv.spec.ts:64-89, 110-125` (`DAT-003.S2`), `data-table.component.spec.ts:760-822` (untagged multi-sort tests); tasks `T001` (red), `T002` (green); `DAT-003.S1` (`data-table-sorting-csv.spec.ts:91-108`) violates Article XI (`F-02`) | partial |
| `DAT-009` | `data-table.component.ts:3807-3828`; `data-table.component.spec.ts:999-1004, 1855-1870, 3126-3139` (`DAT-009.S1`, `DAT-009.S2`; carried from r1), `data-table-sorting-csv.spec.ts:231-266` (`DAT-009.S3`); tasks `T001` (red), `T002` (green) | met |
| `DAT-034` | Carried from r1 (`table-column.component.ts:74-93`, `data-table.component.ts:1125, 3071-3106`; `data-table.component.spec.ts:2198-2381` (`DAT-034.S1`–`S11`), `e2e/site/data-table-column-reorder.spec.ts:37-109`, `data-table-columns-merge.spec.ts:79-131` (`DAT-034.S12`); tasks `T003` (red), `T004` (green)) | met |
| `DAT-055` | `data-table.types.ts:26-34` & `table-column.component.ts:65-70` (carried from r1), `data-table.component.ts:1530-1547, 1902-1910, 2054-2099`; `data-table-column-templates.spec.ts:601-661` (`DAT-055.S1`–`S5`; carried from r1), `data-table-sorting-csv.spec.ts:163-205` (`DAT-055.S6`); tasks `T001` (red), `T002` (green) | met |
