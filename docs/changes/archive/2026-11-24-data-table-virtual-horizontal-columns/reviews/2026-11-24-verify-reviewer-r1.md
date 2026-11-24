# Review: data-table-virtual-horizontal-columns — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

The implementation satisfies `REQ DAT-063` and both scenarios (`DAT-063.S1` in Jest and `DAT-063.S2` in Playwright), with verified red/green TDD evidence, no weakened or skipped tests, and full compliance with the constitution. One major finding remains when `resizableColumns` is used interactively alongside `virtualScrollColumns`, because resize start and width pinning read horizontal spacer `<th>` elements and mismatch DOM cell indices against `visibleColumns()`. A minor width-consistency finding affects non-`px` or sub-`1px` declared column widths.

## Findings

### F-01 [major] Interactive column resize corrupts widths when `resizableColumns` is combined with `virtualScrollColumns`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:4698-4731` · REQ DAT-063
**Problem:** In `onColResizeStart` (lines 4698–4710), `fit` mode pairs `visible[visible.indexOf(col) + 1]` with `th.nextElementSibling`. When `virtualColumnsActive()` is `true` and `col` sits directly before `<th data-med-col-spacer-left>` (a left-frozen column while `leftSpacerPx > 0`) or `<th data-med-col-spacer-right>` (the last rendered scrollable column while `rightSpacerPx > 0`), `th.nextElementSibling` is the horizontal spacer `<th>` rather than the next column, so dragging assigns `nextCol` a width derived from the spacer's full pixel width. In `expand` mode, `pinMeasuredWidths` (lines 4718–4731) computes `offset = cells.indexOf(th) - visible.indexOf(col)` and reads `cells[offset + i]` for every column in `visibleColumns()`, even though `tr[data-med-header-row]` only renders the virtualized `columnSlots()` plus spacers; dragging pins spacer widths and off-window neighbor widths onto unrendered columns in `resizedColumnWidths`, breaking `virtualColumnLayout().totalWidthPx` and spacer widths.
**Fix:** When `this.virtualColumnsActive()` is `true`, update `onColResizeStart` to find the next rendered non-spacer column slot (skipping `[data-med-col-spacer-left]` and `[data-med-col-spacer-right]`) or disable `fit` resizing across spacer boundaries, and update `pinMeasuredWidths` to seed `resizedColumnWidths` by matching rendered `columnSlots()` elements and falling back to `resolveColPxWidth(column, this.effectiveVirtualColumnWidth())` for off-screen columns instead of indexing `cells[offset + i]`.

### F-02 [minor] Non-`px` or sub-`1px` declared `width` diverges between `columnWidth()` and `virtualColumnLayout()`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2695-2702`, `2930-2937`, `4671-4681` · REQ DAT-063
**Problem:** `resolveColPxWidth` (lines 2695–2702) only accepts `px` strings (clamped to `>= 1px`) and falls back to `effectiveVirtualColumnWidth()` for anything else, whereas `columnWidth(col)` (lines 4671–4681) returns any truthy `col.width()` verbatim (e.g. `"20%"`, `"10rem"`, or `"0px"`), and `frozenColumnPx` (lines 2930–2937) does not clamp `px` values to `>= 1px`. In `table-fixed` layout, a non-`px` or `0px` declared width causes the rendered `<th>` width to disagree with `tableWidthPx()`, `leftSpacerPx`/`rightSpacerPx`, and `frozenLayout` offsets.
**Fix:** When `this.virtualColumnsActive()` is `true`, return `` `${this.resolveColPxWidth(col, this.effectiveVirtualColumnWidth())}px` `` from `columnWidth(col)` and clamp `frozenColumnPx(col)` with `Math.max(1, ...)` so the rendered `<th>` widths, frozen offsets, and spacer sums use the exact same pixel values.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-063` | `projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts:195-395` (`DAT-063.S1` + `REQ DAT-063` defaults, clamping, spacer rows, `colspan`, frozen & stacked behavior), `e2e/site/data-table-virtual-columns.spec.ts:15-85` (`DAT-063.S2`), `docs/changes/data-table-virtual-horizontal-columns/tasks.md` (T001 red, T002/T003 green; suite green) | met |
