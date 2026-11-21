# Proposal: add-data-table-column-filters

## Why

People building tables with `med-data-table` can search only across all columns at once, so they cannot narrow a table to, for example, "price above 100" or "created before March" without writing the filtering themselves. The PrimeNG table the component replaces filters per column with a menu of match modes, and the component's own docs record that as a deliberate v1 cut. This is change 6 of the DataTable parity plan, following the row editing and group modes change.

## What Changes

- A column with `columnFilter` shows a funnel button in its header that opens a filter menu: a match mode select, a value control for the column's `filterType` (`text`, `numeric` or `date`), and Apply and Clear buttons.
- Match modes cover text (contains, does not contain, starts with, ends with, equals, does not equal), numbers (equals, does not equal, less than, less than or equal, greater than, greater than or equal) and dates (is, is not, before, after).
- Column filters combine with each other and with the global filter: a row stays only when it passes all of them. Applying a filter returns the table to its first page.
- A new two-way `columnFilters` model holds the active rule of each column, so an application can read, preset or clear filters; the existing `filter` output also emits when a column rule commits.
- In `lazy` mode the table does not filter by column itself; `lazyLoad` carries the active column filters so the server can.
- With `stateKey`, active column filters are persisted and restored with the sort state, and CSV export includes only the rows that pass every filter.
- The DataTable documentation page gains a column filter example.

## Scope

### In scope

- `columnFilter`, `filterType`, `filterMatchMode` and `filterMatchModes` on `med-table-column`, the funnel button and its menu, and keyboard and ARIA behavior of that menu.
- The `columnFilters` model, filtering by every match mode listed above, and the `filter` output extension.
- The `lazyLoad` event carrying column filters, `stateKey` persistence and the CSV export rule.
- A documentation example with a demo, e2e coverage for the menu in a real browser, and a changeset.

### Out of scope

- More than one rule per column and an AND/OR operator between rules: it needs a rule-list UI and was not requested; one rule per column covers the stated need.
- A `between` mode and a multi-select (`in`) mode: they need a two-value or list control and were not requested.
- A filter row under the header and custom filter templates: the user chose the menu form; other forms layer on later without a breaking change.
- Persisting the global filter text in `stateKey`: it is separate from column filters and was not requested.
- Virtual scroll, `responsiveLayout="stack"`, context menu and the other extras: later changes of the plan.
- `med-tree-table` and `med-data-view`: they have their own filtering and are not part of the DataTable parity plan.

## Track

**Track:** full
**Rationale:** Interface fires: new public column inputs (`columnFilter`, `filterType`, `filterMatchMode`, `filterMatchModes`), a new model (`columnFilters`), a changed `lazyLoad` payload and a widened `filter` output. Data fires: the object persisted under `stateKey` gains column filters (additive). Size fires: the menu, three match mode families, lazy, state, export, demo and e2e tests are likely above 8 tasks. No new capability, dependency or constitution gate fires, and breadth is one capability.
**Security:** not-relevant
**Security rationale:** No criterion fires. The filter text is typed by the user, compared in memory with row values and, in `lazy` mode, handed to the application through `lazyLoad`; the table never renders it as HTML, sends it anywhere or touches authentication, secrets or dependencies. The persisted rules live in the same browser storage as the existing sort state.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-004, DAT-007, DAT-009, DAT-010, DAT-024 modified; DAT-038, DAT-039 added |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/` (`data-table.component.ts`, `table-column.component.ts`, `data-table.types.ts`), the DataTable docs page and its demo, e2e specs under `e2e/site/`.
- **Interfaces:** new `columnFilter`, `filterType`, `filterMatchMode` and `filterMatchModes` inputs on `med-table-column`; new `columnFilters` model on `med-data-table`; `TableLazyLoadEvent` gains `columnFilters`; the `filter` output also emits on column rule commits.
- **Data:** the object persisted under `stateKey` gains a `columnFilters` entry; storage written before this change still restores.
- **Dependencies:** None.

## Open Questions

None.
