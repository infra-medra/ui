# Proposal: data-table-virtual-features

## Why

`<med-data-table>` currently disables `#rowexpansion`, `rowGroupMode` (`'subheader'` and `'rowspan'`), `expandableRowGroups`, and `reorderable` whenever `virtualScroll` is enabled, forcing applications with large datasets to choose between virtualization and core table features. Designing a unified virtual item stream and pinned drag-row lifecycle brings all four features into `virtualScroll` mode cleanly.

## What Changes

- Support `#rowexpansion` inside `virtualScroll` by interleaving expansion rows into the flattened virtual item stream (sized via `virtualScrollItemSize` or `virtualScrollRowHeight`) so spacers, scroll range, and `aria-rowcount` remain accurate.
- Support `rowGroupMode="subheader"` and `expandableRowGroups` inside `virtualScroll` by emitting virtual subheader items and omitting collapsed group rows from the virtual item stream (updating `expandedRowGroups`, `rowGroupExpand`, and `rowGroupCollapse` as in non-virtual mode).
- Support `rowGroupMode="rowspan"` inside `virtualScroll` by computing group runs across `sortedValue()` and slicing each run's `rowspan` to the rendered window so the first visible row of a partially scrolled group renders the merged cell and the table remains rectangular.
- Support `reorderable` inside `virtualScroll` by pinning the dragged row in `virtualEntries()` during drag-and-drop (clearing on `drop`/`dragend`) and mapping virtual row indices back to `value()` indices in `rowReorder`.

## Scope

### In scope

- Flattened virtual item model (`subheaders`, `rows`, `expansions`) in `DataTableComponent` when `virtualScroll` is active (non-lazy).
- Window-sliced `rowspan` calculation for `rowGroupMode="rowspan"` inside `virtualScroll`.
- Pinned dragged row (`pinnedDragIndex`) and `dragend` cleanup for `reorderable` inside `virtualScroll`.
- Unit/component tests covering all four features in `virtualScroll` mode.

### Out of scope

- Horizontal column virtualization — separate change with its own design.
- Mixing `lazy` sparse virtual blocks with `rowGroupMode` / `reorderable` (grouped/reordered views require loaded rows; `lazy` continues to render sparse blocks as before).

## Track

**Track:** full
**Rationale:** Requires architectural design for a flattened virtual item stream (subheaders + rows + expansions), window-sliced `rowspan` under partial rendering, and pinned drag-row lifecycle during virtual scrolling.
**Security:** not-relevant
**Security rationale:** Purely client-side virtual list indexing, DOM rendering, and drag-and-drop over in-memory row arrays; no external input parsing, storage, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-062 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts`, new test file `projects/medra/ui/src/lib/data-table/data-table-virtual-features.spec.ts`.
- **Interfaces:** Enables existing `#rowexpansion`, `rowGroupMode` (`'subheader' | 'rowspan'`), `expandableRowGroups`, and `reorderable` inputs to operate when `virtualScroll` is `true`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
