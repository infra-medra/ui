# Review: data-table-virtual-features — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

The implementation of `REQ DAT-062` fails verification due to one critical rectangular-grid defect (`F-01`) when combining `virtualScroll`, `rowGroupMode="rowspan"`, and `#rowexpansion`. `#rowexpansion`, `rowGroupMode="subheader"` with `expandableRowGroups`, and `reorderable` with pinned drag rows (`DAT-062.S1`, `S2`, `S4`) pass with clean TDD evidence, TypeScript compilation, and `lazy` guards, and one minor stale-JSDoc issue (`F-02`) remains.

## Findings

### F-01 [critical] Orphaned expansion row at virtual window start breaks rectangular rowspan grid

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1654`, `2357-2393`, `2457-2468` · REQ DAT-062 (clause 3) / DAT-062.S3 / T004
**Problem:** When `virtualScroll` is combined with `rowGroupMode="rowspan"` and `#rowexpansion`, `virtualItems()` (`data-table.component.ts:1511-1514`) emits `{ kind: 'expansion', row, rowIndex }` immediately after its parent `{ kind: 'row', row, rowIndex }`, and `expansionSegments()` (`data-table.component.ts:2357-2393`) omits the `groupRowsBy` column from `#expansionRow` because `mergedColumnFields()` (`data-table.component.ts:2342-2345`) includes `spanColumnField()`. However, `virtualEntries()` (`data-table.component.ts:1654, 1681-1683`) slices `virtualItems()` directly at `start` from `virtualRange()`. Whenever `start` lands on an `'expansion'` item (for example, in the `DAT-062.S3` configuration with row 10 expanded and `scrollTop = 640`, making `firstVisible = 16` and `start = 11` = `virtualItems[11]`, or with row 0 expanded and `scrollTop = 240`, making `start = 1`), the parent `'row'` is hidden inside the preceding spacer, `virtualRowSpans()` resets `runStartRowIndex = null` on that spacer (`data-table.component.ts:2458-2468`), and no `<td rowspan>` covers the omitted `groupRowsBy` cell of the leading expansion `<tr>`. That `<tr>` renders one fewer `<td>` than `totalColumnCount()`, violating REQ DAT-062 clause 3 ("omitting covered cells so the table remains rectangular even when the top of a group is scrolled out of view"). `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts:190-205` only tests `scrollTop = 600` (`start = 10`, a `'row'` item) and does not cover offsets where `start` lands on an `'expansion'` item.
**Fix:** In `virtualEntries()` (`projects/medra/ui/src/lib/data-table/data-table.component.ts:1654`), before computing `pinned` and emitting `[start, end)`, adjust `let { start, end } = this.virtualRange();` by decrementing `start` by 1 when `items && start > 0 && start < total && items[start]?.kind === 'expansion'` so an expansion row is never rendered at the top of the window without its parent `'row'` item. Add a test in `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` scrolling to an offset where `start` lands on an expansion item (e.g., `640px` with row 10 expanded) and asserting `expectRectangularGrid(rows, 2)`.

### F-02 [minor] Stale virtualScroll JSDoc still states rowGroupMode, #rowexpansion, and reorderable are ignored

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:351-352`, `1215` · REQ DAT-062
**Problem:** Both the class documentation (`data-table.component.ts:351-352`) and the `virtualScroll` input JSDoc (`data-table.component.ts:1215`) still state "`rowGroupMode`, `#rowexpansion` and `reorderable` are ignored in this mode", contradicting `REQ DAT-062` now that all three operate in non-lazy `virtualScroll` and are ignored only when `lazy` is `true`.
**Fix:** Update `data-table.component.ts:351-352` and `:1215` to state that `rowGroupMode`, `#rowexpansion`, and `reorderable` work in non-lazy `virtualScroll` and are ignored when `lazy` is `true` (while `paginator` remains ignored in `virtualScroll`).

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `REQ DAT-062` | `projects/medra/ui/src/lib/data-table/data-table-virtual-expansions-groups.spec.ts:145-280` (`DAT-062.S1`, `DAT-062.S2`, `lazy` guard), `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts:146-299` (`DAT-062.S3`, `DAT-062.S4`, `lazy` guard), `docs/changes/data-table-virtual-features/tasks.md:7-17` (T001–T004 red/green TDD), `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit` (exit 0); fails clause 3 rectangularity when `start` lands on an `'expansion'` item (`F-01`) | partial |
