# Plan: data-table-virtual-features

## Summary

We enable `#rowexpansion`, `rowGroupMode` (`'subheader'` and `'rowspan'`), `expandableRowGroups`, and `reorderable` inside `virtualScroll` (when `lazy` is `false`) in `DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`). A flattened `virtualItems` computed stream maps `pagedValue()` into typed virtual items (`'subheader'`, `'row'`, `'expansion'`) when any of those features are active, reusing `buildVirtualHeightIndex` (`projects/medra/ui/src/lib/data-table/data-table-virtual-heights.ts`) for cumulative offsets, window slicing, and `focusVirtualRow`. For `rowGroupMode="rowspan"`, `virtualEntries` computes window-sliced `rowspan` counts across rendered rows in the active window so the top visible row of any partially scrolled group renders the merged cell and keeps the table rectangular. For `reorderable`, `draggedRowIndex` becomes a signal (`pinnedDragIndex`) that pins the dragged row in `virtualEntries()` until `drop` or `dragend`, mapping virtual row indices back to `value()`.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | All new state (`virtualItems`, `draggedRowSignal`, `virtualRowSpans`) uses Angular signals and computeds inside standalone `DataTableComponent`. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | Reuses existing subheader, expansion, and reorder-handle templates and token classes. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No new overlays or icons introduced. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps `DAT-062.S1`–`S4` to Jest component tests ordered before implementation; layout behavior relies on existing `virtualScroll` viewport/table CSS. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Subheaders, expansion toggles, group toggles, and `aria-rowcount`/`aria-rowindex` preserve existing ARIA attributes and focus behavior across the virtual item stream. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, specs, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No new internal UI strings are added; existing `rowGroupToggleLabel` and `rowExpansionLabel` inputs are reused. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | n/a | No package version or dependency changes. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Every `DAT-062.S1`–`S4` test will assert every Given/When/Then clause with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts`
- **Framework:** Jest (`jest-preset-angular`)

| Scenario | Level | Test location |
|---|---|---|
| `DAT-062.S1` | integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` |
| `DAT-062.S2` | integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` |
| `DAT-062.S3` | integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` |
| `DAT-062.S4` | integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts` |

## Architecture & Interfaces

- **Fast-path preservation:** When `lazy()` is `true`, or when `!rowExpansionTemplate() && !rowGroupMode() && !reorderable()`, `virtualEntries()` keeps the zero-allocation 1:1 row indexing over `pagedValue()`.
- **Flattened virtual item stream (`virtualItems`):** When `virtualScroll()` is `true`, `lazy()` is `false`, and `rowExpansionTemplate()` or `effectiveRowGroupMode() === 'subheader'` is active:
  - Each `row` in `pagedValue()` produces: optional `{ kind: 'subheader', row, rowIndex, groupValue }` (when `isGroupStart(row, i)`), `{ kind: 'row', row, rowIndex }` (unless `isGroupCollapsed(row)`), and optional `{ kind: 'expansion', row, rowIndex }` (when `!isGroupCollapsed(row) && isRowExpanded(row, i)`).
  - `virtualHeightIndex` sizes `total = virtualItems.length` using `virtualScrollItemSize()` (or `virtualScrollRowHeight` for `'row'` items).
  - `ariaRowCount` reflects `headerRowCount() + frozenRows().length + virtualItems.length`.
- **Window-sliced `rowspan` (`rowGroupMode="rowspan"`):**
  - `virtualEntries()` renders each `{ kind: 'row' }` in the active window `[start, end)` and computes a `virtualRowSpans` map keyed by `rowIndex` for the rendered window: consecutive rendered rows in the window sharing the same `groupRowsBy` value get `rowspan = runCount + expandedCountInWindow` on the first rendered row of that run in the window, and `0` (omitted) on subsequent rows of that run.
- **Pinned drag row (`reorderable`):**
  - `draggedRowIndex` is stored in a `signal<number | null>(null)` and included in `pinned` indices in `virtualEntries()` so the dragged `<tr>` remains in the DOM while scrolling; `onRowDragEnd` clears it if cancelled outside a valid drop target, and `onRowDragStart(entry.index)` / `onRowDrop(entry.index)` use `pagedValue()` indices.

## Decisions

### D-01: Flattened virtual item stream only when expansion/subheader is active

**Choice:** Build a flattened `virtualItems` array only when `virtualScroll` is combined with `#rowexpansion` or `rowGroupMode="subheader"`, keeping plain 1:1 row indexing for 100k-row plain/lazy virtual tables.
**Alternatives:** Always flattening `value()` into wrapper objects even for plain virtual tables.
**Rationale:** Avoids allocating 100k wrapper objects when neither expansion nor subheader grouping is used, preserving `DAT-046`/`DAT-048` performance.

### D-02: Window-sliced `rowspan` on rendered window rows

**Choice:** Compute `rowspan` counts across the rendered rows of the current virtual window `[start, end)` so the first rendered row of a group inside the window owns the cell with `rowspan` equal to its rendered run length in that window.
**Alternatives:** Measuring/rendering off-window spacer-spanning cells (impossible in HTML `<table>` when intermediate rows are replaced by a single `<tr><td colspan>` spacer).
**Rationale:** Keeps the DOM strictly rectangular and guarantees the group label stays visible even when the top of a large group has scrolled above the viewport.
