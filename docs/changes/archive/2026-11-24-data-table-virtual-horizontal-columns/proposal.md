# Proposal: data-table-virtual-horizontal-columns

## Why

`<med-data-table>` currently renders every visible column in `<thead>`, `<tbody>`, and `<tfoot>`, which degrades DOM size and rendering performance on wide datasets with dozens or hundreds of columns. Adding horizontal column virtualization renders only the scrollable columns intersecting the horizontal scroll viewport (plus a buffer and any frozen columns), keeping wide tables responsive.

## What Changes

- Add `virtualScrollColumns` (`boolean`, default `false`) and `virtualScrollColumnWidth` (`number`, default `120` px) inputs on `<med-data-table>`.
- Partition `visibleColumns()` into always-rendered left/right frozen columns and horizontally virtualized scrollable columns, using cumulative column widths (from resized/declared `px` widths or `virtualScrollColumnWidth`), left/right horizontal spacer `<th>`/`<td>` cells, and `table-fixed` layout.
- Track horizontal `scrollLeft` and viewport `clientWidth` on `[data-med-scroll-viewport]`, update `totalColumnCount` for full-width `colspan` rows, and expose `aria-colcount`/`aria-colindex`.

## Scope

### In scope

- `virtualScrollColumns` and `virtualScrollColumnWidth` inputs and horizontal range calculation in `DataTableComponent`.
- Left/right spacer cells in header, filter, body, frozen, skeleton, and footer rows, plus frozen column preservation.
- Unit/integration tests (`DAT-063.S1`, `DAT-063.S2`) and real-browser Playwright verification.

### Out of scope

- Horizontal virtualization while `stacked()` is active (stacked layout renders rows vertically as blocks).
- Custom `#headerGroup` / `#footerGroup` automatic `colspan` rewriting (user-supplied group rows keep their own markup, as in `DAT-034`).

## Track

**Track:** full
**Rationale:** Requires architectural design for horizontal column windowing, left/right spacer synchronization across all table sections (`thead`, `tbody`, `tfoot`, frozen/skeleton rows), frozen-edge partitioning, and `totalColumnCount` `colspan` alignment.
**Security:** not-relevant
**Security rationale:** Purely client-side horizontal scroll offset math and column slicing over declared `<med-table-column>` definitions; no external input parsing, storage, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-063 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts`, new test file `projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts`, and `e2e/site/data-table-virtual-columns.spec.ts`.
- **Interfaces:** New `virtualScrollColumns` and `virtualScrollColumnWidth` inputs on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
