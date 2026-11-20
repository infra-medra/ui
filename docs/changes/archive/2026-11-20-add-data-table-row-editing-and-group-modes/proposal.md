# Proposal: add-data-table-row-editing-and-group-modes

## Why

People building tables with `med-data-table` can edit only one cell at a time, only by double-clicking it, and can group rows only with a full-width subheader that cannot be collapsed. The PrimeNG table the component replaces supports editing a whole row with save and cancel, merging a grouped cell vertically, and collapsing a group, and the component's own docs record the first two as cuts. This is change 5 of the DataTable parity plan, following the archived column changes.

## What Changes

- `editMode="row"` adds an actions column with an edit button per row; editing a row shows every editable cell's edit template at once, and its save and cancel buttons commit or discard all of them together.
- Two new outputs, `rowEditComplete` (row and the edited value per field) and `rowEditCancel`, report row editing.
- `editMode="cell"` gains an `editTrigger` input (`dblclick` default, or `click`) so a cell can enter edit mode on a single click.
- Editing a cell or a row never changes the selection, and keys pressed inside an edit template no longer select a row or move row focus, with any `selectionMode`.
- `rowGroupMode="rowspan"` renders the `groupRowsBy` column cell once per group, spanning the group's rows on the displayed page, instead of a subheader row.
- A new `expandableRowGroups` input adds a toggle button to each subheader row of `rowGroupMode="subheader"`; it collapses or expands the group's rows, tracked in a two-way `expandedRowGroups` model and reported by `rowGroupExpand` and `rowGroupCollapse`.
- The DataTable documentation page gains examples for row editing, cell editing with selection, row-span grouping and expandable row groups.

## Scope

### In scope

- `editMode="row"`, its actions column, `rowEditComplete` and `rowEditCancel`.
- `editTrigger` on `editMode="cell"` and the selection and keyboard coexistence rules for both edit modes.
- `rowGroupMode="rowspan"` for the `groupRowsBy` column.
- `expandableRowGroups`, `expandedRowGroups`, `rowGroupExpand` and `rowGroupCollapse`.
- Documentation examples with demos, e2e coverage for the new behavior, and a changeset.

### Out of scope

- Validation rules or form-control integration for edited values: the edit templates already own their inputs, and the table is not a form control (Article IV does not apply).
- Persisting edit state or collapsed groups in `stateKey` state: it widens the persisted-state format and was not requested.
- Merging cells of columns other than the `groupRowsBy` column: it needs a per-column API and was not requested.
- Per-column filters and the advanced filter overlay: change 6 of the plan.
- Virtual scroll, preload and the other extras: change 7 of the plan.
- `med-tree-table` and `med-data-view`: they have their own editing and grouping code and are not part of the DataTable parity plan.

## Track

**Track:** full
**Rationale:** Interface fires: new public inputs (`editTrigger`, `expandableRowGroups`, `expandedRowGroups`), new values of `editMode` and `rowGroupMode`, and new outputs (`rowEditComplete`, `rowEditCancel`, `rowGroupExpand`, `rowGroupCollapse`). Size fires: row editing, row spanning, group collapsing, keyboard rules, demos and e2e tests are likely above 8 tasks. No new capability, data, dependency or constitution gate fires, and breadth is one capability.
**Security:** not-relevant
**Security rationale:** Presentation-only change to a client-side table: no authentication, authorization, secrets or personal data handling. Edited values are emitted to the application and never stored or sent by the table.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-035, DAT-036 and DAT-037 added; DAT-008, DAT-010 and DAT-024 modified |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/**` (component, column, specs), the DataTable docs page and demos under `projects/site/src/app/pages/docs/components/`, `e2e/site/`, and a changeset.
- **Interfaces:** new inputs `editTrigger`, `expandableRowGroups` and `expandedRowGroups`; new values `row` of `editMode` and `rowspan` of `rowGroupMode`; new outputs `rowEditComplete`, `rowEditCancel`, `rowGroupExpand` and `rowGroupCollapse`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
