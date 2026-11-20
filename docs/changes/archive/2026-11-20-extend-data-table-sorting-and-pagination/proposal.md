# Proposal: extend-data-table-sorting-and-pagination

## Why

People building a `med-data-table` cannot tell from the docs that a table can start sorted or that its page can be set from code, because the page shows neither, and they cannot stop the sort header from clearing the sort on a third click. The PrimeNG table the component replaces documents presort, removable sort and programmatic pagination, and the first two are only half there: both work through `model()` inputs but have no example or scenario, and the sort cycle is fixed. This is change 3 of 7 toward DataTable parity.

## What Changes

- A `med-data-table` accepts `removableSort`, default `true`: a third click on a sorted header clears the sort, as today. With `false`, the header only alternates between ascending and descending.
- A table renders sorted from its initial `sortField` and `sortOrder` (presort), now stated and tested.
- The current page can be set from code through `first`, and the paginator reflects it and writes user page changes back, now stated and tested.
- Choosing a size in the "rows per page" select changes the visible rows and returns to the first page, now stated and tested.
- The docs page gains three examples: presort, removable sort and programmatic pagination.

## Scope

### In scope

- The `removableSort` input of `med-data-table` in single sort mode.
- DAT-002 and DAT-005 rewritten with scenarios for presort, removable sort, programmatic pagination, page write-back and the rows per page select.
- Docs examples for presort, removable sort and programmatic pagination, with tests citing every scenario, and a changeset.

### Out of scope

- Resetting the page when the sort or filter changes: the maintainers decided the current sorting behavior stays as it is.
- `removableSort` in `sortMode="multiple"`: Shift+click already removes a column from the sort there (DAT-003); a later change can extend the option.
- `med-tree-table` and `med-data-view`: they have their own sorting and paging code and are not part of the DataTable parity plan.

## Track

**Track:** full
**Rationale:** The Interface criterion fired: `removableSort` is a new public input of `med-data-table`. No other criterion fired. One capability is touched, no capability is created, no data shape or dependency changes, and the change needs about eight tasks or fewer.
**Security:** not-relevant
**Security rationale:** None fired. The change adds a sorting option and documentation to an existing component, with no input, data, permission, secret or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-002, DAT-005 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts` and its spec, the docs page and three new demos in `projects/site`, and the e2e specs that cite DAT-002 and DAT-005.
- **Interfaces:** One new input, `removableSort` on `med-data-table`, defaulting to `true`, so existing templates behave as before.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
