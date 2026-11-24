# Proposal: persist-data-table-extended-state

## Why

Users of a `med-data-table` with a `stateKey` lose their column order, column widths, hidden columns, collapsed row groups, search text, multi-column sort and page size every time they reload or return to the page. Today the stored state holds only the page offset, the single-column sort, the expanded rows and the column filter rules, so every other customization has to be rebuilt by hand. Applications that want it must write their own storage code around the table's events, which duplicates what `stateKey` promises.

## What Changes

- A table with a `stateKey` saves and restores the column order, the resized column widths, which columns are hidden, the collapsed row groups, the global filter text, `multiSortMeta` and the page size, alongside what it saves today.
- A column's `visible` becomes two-way, so an application's column toggle reflects a visibility restored from storage.
- State saved by an older version restores without errors: each missing field keeps its default.
- Saved entries that name a column the table no longer declares, or that hold a value of the wrong shape, are skipped one by one while the rest of the state restores.
- A stored single-column `sortField` that names no declared column is also skipped, so every column-bound field follows the same rule.
- The persisted state example on the DataTable documentation page shows the new fields.

## Scope

### In scope

- A new requirement DAT-056 for the extended stored state and its validation on restore.
- DAT-010's state sentence pointing to DAT-056; DAT-024 gains a scenario for the updated persisted state demo.

### Out of scope

- Persisting selection, cell or row edits, and the virtual scroll position — they depend on row data that may change between visits; revisit if requested.
- A `stateSave`/`stateRestore` event pair or a custom storage adapter — `stateStorage` covers session and local storage today.
- Versioning or migrating the stored format — missing fields already default, so no version key is needed.
- Persisting the tree table's state — a separate component with its own spec requirements.

## Track

**Track:** full
**Rationale:** Data fires: the stored state format gains seven fields. Interface fires: `med-table-column`'s `visible` changes from an input to a two-way model. New capability, breadth, dependency, security and size do not fire.
**Security:** relevant
**Security rationale:** New or changed external input: the table deserializes more fields from session or local storage, which other same-origin code can write, so every field must be type-checked and bounded before it reaches table state. No authentication, secrets or HTML rendering are involved; the restored filter text is bound as an input value.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-056 added; DAT-010, DAT-024 modified |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/` (data table and table column), the DataTable documentation page.
- **Interfaces:** `med-table-column` `visible` becomes a model (`[(visible)]`); existing `[visible]` bindings keep working.
- **Data:** The JSON stored under `stateKey` gains `columnOrder`, `columnWidths`, `columnVisibility`, `collapsedRowGroups`, `globalFilter`, `multiSortMeta` and `rows`; older stored values still restore.
- **Dependencies:** None.

## Open Questions

None.
