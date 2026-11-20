# Proposal: add-data-table-column-reorder

## Why

People building tables with `med-data-table` cannot let their users rearrange columns: the order is fixed by the template, so each user who wants a different layout needs an application-specific workaround. The PrimeNG table the component replaces supports reordering columns by dragging their headers, and it is the next item of the DataTable parity plan after the archived resize, visibility and groups change, which deliberately left it out.

## What Changes

- A new `reorderableColumns` input on `med-data-table` (default `false`) lets the user drag a column header onto another column's header to move the column to that position.
- A new `colReorder` output emits the dragged index, the drop index and the new field order when a drag ends.
- With `reorderableColumns`, a focused column header can be moved one position with Alt+ArrowLeft and Alt+ArrowRight, and the new position is announced to assistive technology.
- A new `reorderable` input on `med-table-column` (default `true`) lets the application pin a column in place, for example the columns under an application-written header group.
- Frozen columns reorder only among the columns frozen on the same edge, and never cross into or out of the frozen set.
- Hidden columns keep their place in the order, so showing a column again restores it where the order puts it.
- The DataTable documentation page gains a column reorder example.

## Scope

### In scope

- `reorderableColumns` on `med-data-table` and `reorderable` on `med-table-column`.
- The `colReorder` output and its payload.
- Pointer drag and Alt+Arrow keyboard reordering of column headers, with a live announcement.
- Behavior with frozen columns, hidden columns and application-written `#headerGroup` rows.
- One documentation example with a demo, and a changeset.

### Out of scope

- Persisting the column order in `stateKey` state: it widens the persisted-state format and was not requested.
- Moving a column across the frozen boundary, which would change its `frozen` state from a drag.
- Having the table infer column groups: groups are application-written `#headerGroup` rows (DAT-033), so the application pins columns with `reorderable` and rewrites its own `colspan` from `colReorder`.
- `med-tree-table` and `med-data-view`: they have their own column code and are not part of the DataTable parity plan.
- Reordering rows: it already exists as `reorderable` and `rowReorder` (DAT-010).

## Track

**Track:** full
**Rationale:** Interface fires: new public inputs (`reorderableColumns`, `reorderable`) and a new output (`colReorder`). Size fires: pointer drag, keyboard and announcement, frozen and hidden handling, a demo and e2e tests are likely above 8 tasks. No new capability, data, dependency or constitution gate fires, and breadth is one capability.
**Security:** not-relevant
**Security rationale:** Presentation-only change to a client-side table: no authentication, data handling, external input, secrets, infrastructure or dependency change. The column order is held in memory and never stored.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-034 added; DAT-024 modified |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/**` (component, column, specs), the DataTable docs page and demo under `projects/site/src/app/pages/docs/components/`, `e2e/site/`, and a changeset.
- **Interfaces:** new inputs `reorderableColumns` on `med-data-table` and `reorderable` on `med-table-column`; new output `colReorder`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
