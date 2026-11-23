# Review: add-data-table-cell-selection-and-context-menu — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 3
**Reviewer:** reviewer agent
**Date:** 2026-11-22

## Summary

All four requirements (`DAT-043`, `DAT-044`, `DAT-045`, `DAT-024`) and their 18 scenarios are implemented and covered by TDD red/green evidence, Jest unit tests, Playwright documentation tests, and the full build/test suite. No critical or major defects, constitution violations, or test weakenings were found (the authorized `T002` test edit only switched `CellSelectionHost.rows` to a `signal` for Angular 21 zoneless change detection while keeping all assertions intact). Three minor findings remain around row highlighting when `contextMenu` is `null`, missing explicit `focus-visible` ring classes on focusable context-menu rows, and duplicate rows in `exportCSV({ selectionOnly: true })` during multi-cell selection.

## Findings

### F-01 [minor] Right-clicking a row highlights `contextMenuSelection` even when `contextMenu` is `null`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1299`, `1381`, `1696-1699`, `1743-1759` · REQ DAT-045
**Problem:** `(contextmenu)="onRowContextMenu($event, row)"` runs unconditionally on every body `<tr>` and calls `this.contextMenuSelection.set(row)` inside `invokeRowContextMenu`, while `frozenBackground` (line 1299) and `rowClassFor` (line 1381) highlight any row matching `isContextMenuSelected(row)`. On a plain table with `[contextMenu]="null"`, opening the native browser context menu on a row leaves that row highlighted with `bg-brand-50 dark:bg-brand-500/10` (and `bg-brand-50 dark:bg-brand-950` on frozen cells) with no way to clear it.
**Fix:** Require `this.contextMenu() !== null` inside `isContextMenuSelected(row)` (or at its styling call sites) so plain tables without a linked `ContextMenuDirective` do not display context-selection styling on native right-clicks while still emitting `contextMenuSelect` and updating `contextMenuSelection`.

### F-02 [minor] Newly focusable context-menu `<tr>` rows lack explicit `focus-visible` ring classes

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:553`, `1370-1388` · Constitution Articles II & VI / REQ DAT-045
**Problem:** Line 553 sets `[attr.tabindex]="(selectionMode() || contextMenu()) && !isCellSelectionActive() ? 0 : null"`, making body `<tr>` rows keyboard-focusable whenever `contextMenu` is bound. Unlike `bodyCellClass` (line 1353, which applies `focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 dark:focus-visible:outline-brand-400`), `rowClassFor` adds no `focus-visible` outline utility classes and relies on browser defaults inside an `overflow-hidden` wrapper.
**Fix:** Add `focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 dark:focus-visible:outline-brand-400` to `rowClassFor` when `interactive && (this.selectionMode() || this.contextMenu()) && !this.isCellSelectionActive()`.

### F-03 [minor] `exportCSV({ selectionOnly: true })` duplicates rows when multiple cells in one row are selected

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2070-2081` · REQ DAT-043
**Problem:** In `selectionAsArray()`, when `isCellSelectionActive()` is true, each `TableCellSelection<T>` entry is mapped directly to `entry.row` without deduplication. Selecting two cells on the same row in `selectionMode="multiple"` and calling `exportCSV({ selectionOnly: true })` emits that row twice in the generated CSV.
**Fix:** Deduplicate the mapped rows in `selectionAsArray()` using `this.rowsEqual` before returning them to `exportCSV`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-043` | `T001` red (`exit 1`) / `T002` green (`exit 0`); Jest `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3836,3882,3926,3947,3972`; Playwright `e2e/site/data-table-cell-context.spec.ts:61`; `T009` `npm test` (`exit 0`) | met |
| `DAT-044` | `T003` red (`exit 1`) / `T004` green (`exit 0`); Jest `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3996,4051`; Playwright `e2e/site/data-table-cell-context.spec.ts:84`; `T009` `npm test` (`exit 0`) | met |
| `DAT-045` | `T005` red (`exit 1`) / `T006` green (`exit 0`); Jest `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:4141,4172,4210`; Playwright `e2e/site/data-table-cell-context.spec.ts:102`; `T009` `npm test` (`exit 0`) | met |
| `DAT-024` | `T007` red (`exit 1`) / `T008` green (`exit 0`); Playwright `e2e/site/data-table-cell-context.spec.ts:12,13,61,84,102`, `e2e/site/data-table-docs.spec.ts`, `data-table-frozen.spec.ts`, `data-table-column-reorder.spec.ts`, `data-table-row-editing.spec.ts`, `data-table-column-filters.spec.ts`, `data-table-slots-skeleton.spec.ts` (`medra coverage`: 18/18 scenarios); `T009` `npm run build:ui && npm run build:site` (`exit 0`) | met |
