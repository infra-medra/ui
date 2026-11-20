# Review: add-data-table-column-reorder — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 0
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Every scenario of DAT-034 (S1–S11) and DAT-024.S9 is implemented and backed by tests that assert each Given and Then clause. The suite is green, and the spec file has no removed lines against `b1468e5`, so no test was weakened. One plan decision is not implemented: D-03 says `dragstart` is cancelled while a column resize is in progress, but the handler only returns, so a resize on a table with `reorderableColumns` can start a native header drag. The e2e spec `e2e/site/data-table-column-reorder.spec.ts` changed after its red run (hash at T010 differs from the check snapshot). The file is untracked, so I could not diff it, and I judged only its final content, which asserts strongly.

## Findings

### F-01 [major] `dragstart` is not cancelled during a column resize (plan D-03 not implemented)

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1056` · T006, plan D-03
**Problem:** D-03 and T006 require `dragstart` to be cancelled while `colResizeState` is set, because the resize handle sits inside the now-`draggable` `th`. `onColDragStart` does `return` when `this.colResizeState` is truthy, without calling `event.preventDefault()`, so the browser still starts a native drag of the header. `onColResizeStart` (line 1367, bound to `pointerdown` at line 357) does not call `preventDefault` either, so nothing else blocks the drag. A native drag fires `pointercancel`, which can cut a resize short whenever `resizableColumns` and `reorderableColumns` are on together. No unit or e2e test combines the two inputs, and the docs demo enables only `reorderableColumns`, so the gap is untested. I did not run this in a browser; the evidence is the code against the plan.
**Fix:** In `onColDragStart`, call `event.preventDefault()` before returning when `this.colResizeState` is set. Alternatively, set `draggable` to `null` while a resize is active. Add a unit test that fires `dragstart` with a resize in progress and asserts `defaultPrevented`, and add a real-browser check that a handle drag on a table with both inputs resizes the column and does not move it.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-034` | S1–S7, S10, S11 are in the `describe('DataTableComponent column reorder')` block of `data-table.component.spec.ts` (lines 2179–2330). S8 and S9 are at lines 2319–2340. S1, S5 and S8 also have real-browser tests in `e2e/site/data-table-column-reorder.spec.ts`. Red evidence is on T002, T003 and T010, and green evidence on T004–T009 and T011. Implementation is in `data-table.component.ts` (`moveColumn`, `canMoveColumn`, `moveColumnByKey`, `orderedColumns`). `medra coverage` reports 20/20. `suite: green` per dispatch. F-01 is a plan deviation outside the scenarios. | met |
| `DAT-024` | S1–S8 are carried by the unchanged `e2e/site/data-table-docs.spec.ts` plus `column-reorder` added to `RESIZE_TOGGLE_GROUPS`. S9 is covered by `e2e/site/data-table-column-reorder.spec.ts` (real `dragTo` on the demo). The `EXAMPLES` entry, section, demo, prose (`data-table-column-reorder.txt`) and code block are in place in `data-table.page.ts`. | met |
