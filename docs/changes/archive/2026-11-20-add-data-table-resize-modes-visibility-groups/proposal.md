# Proposal: add-data-table-resize-modes-visibility-groups

## Why

People building tables with `med-data-table` cannot choose how a column resize affects the rest of the table, cannot hide a column without removing it from the template, and cannot group columns under spanning headers or add a footer row. The PrimeNG table the component replaces supports all three, and they are the remaining items of the DataTable parity plan (change 4b, following the archived frozen columns, frozen rows and scroll change). The documentation page also still does not show that a frozen column combines with the reorder handle and selection columns, which the previous change already implemented.

## What Changes

- With `resizableColumns`, a new `columnResizeMode` input picks `fit` (default: the table width is kept and the dragged column trades width with its right neighbour) or `expand` (the table grows or shrinks with the dragged column).
- A new `visible` input on `med-table-column` (default `true`) hides a column's header, cells and footer cell without removing the column from the template.
- A new `#headerGroup` template renders application-written rows above the column header row, and a new `#footerGroup` template renders application-written rows in a table footer, so columns can be grouped under spanning headers.
- The DataTable documentation page gains examples for resize modes, column toggle, column groups and a frozen column combined with the reorder handle and selection column.

## Scope

### In scope

- `columnResizeMode` (`fit` and `expand`) on `med-data-table`, keeping the `colResize` event.
- `visible` on `med-table-column`, honored by rendering, frozen offsets, row spans and CSV export.
- `#headerGroup` and `#footerGroup` templates on `med-data-table`.
- Four documentation examples with demos: resize modes, column toggle (a multi-select driving `visible`), column groups, and a frozen column with the utility columns.

### Out of scope

- A built-in column-toggle control: the application owns the control, because it varies per product; the docs demo shows one.
- Persisting column widths or visibility in `stateKey` state: not requested, and it widens the persisted-state format.
- Column reorder by dragging headers: a separate parity item.
- Sorting or resize handles on application-written group rows: the leaf header row keeps them, which avoids a second header contract.
- Changing frozen behavior or `med-tree-table`: the utility-column behavior is already specified in DAT-028 and only needs documenting.

## Track

**Track:** full
**Rationale:** Interface fires: new public inputs (`columnResizeMode`, `visible`) and two new content templates, and the `fit` default changes how an existing resize behaves. Size is likely above 8 tasks (resize logic, visibility across five features, two templates, four demos, e2e). No new capability, data, dependency or constitution gate fires, and breadth is one capability.
**Security:** not-relevant
**Security rationale:** Presentation-only changes to a client-side table: no authentication, data handling, external input, secrets, infrastructure or dependency change. Application-written group rows are Angular templates, not user-supplied HTML.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-031, DAT-032, DAT-033 added; DAT-001, DAT-009, DAT-010, DAT-024 modified |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/**` (component, column, specs), the DataTable docs page and demos under `projects/site/src/app/pages/docs/components/`, `e2e/site/`, and a changeset.
- **Interfaces:** new inputs `columnResizeMode` on `med-data-table` and `visible` on `med-table-column`; new templates `#headerGroup` and `#footerGroup`; the default resize behavior becomes `fit`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
