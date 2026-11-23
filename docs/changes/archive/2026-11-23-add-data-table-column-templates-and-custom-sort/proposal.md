# Proposal: add-data-table-column-templates-and-custom-sort

## Why

Applications using `<med-data-table>` cannot put anything but plain text in a column header, cannot show a per-column footer such as a total without writing a whole `#footerGroup` row by hand, and cannot sort a column by anything but the raw value of its `field`. Today a header with an icon, a hint or a unit has to be faked in the cell template. Totals need a hand-written `<tr>` that the application must keep in step with column order, visibility and frozen offsets. Columns whose display value differs from their natural order, such as status labels, version strings or computed values, sort alphabetically and wrongly. These are the column template and sorting items of the DataTable parity plan with PrimeNG.

## What Changes

- A column can render its own header content from a template, while the header keeps its sort indicator, filter button, resize handle and sorting behavior.
- A column can declare a footer, as text or as a template that receives the filtered and sorted rows, and the table renders a footer row that follows column order, visibility, frozen columns and the stacked layout.
- A column can sort by another row property or by its own comparison function, in single and multiple sort modes, while the sort state still names the column by its `field`.
- The documentation page gets an example covering the three features.

## Scope

### In scope

- A `#header` template and a `footer` input with a `#footer` template on `med-table-column`.
- `sortBy` and `sortCompare` inputs on `med-table-column`, used by header sorting, presorting and multi-column sorting.
- Clicks and keys on interactive elements inside a header template do not sort the column.
- The column footer row alongside `#footerGroup`, with the footer rule of DAT-033 updated to match.
- A docs example, Jest tests, Playwright tests for the layout scenarios, and a `minor` changeset for `@medra.dev/ui`.

### Out of scope

- A table-level `customSort` mode or `sortFunction` output: a per-column comparator covers the same need without the table handing its whole sort to the application.
- Footer values in CSV export: export stays rows only, because a footer is often a computed summary the application formats itself.
- Sending `sortBy` to the server in lazy mode: `lazyLoad` keeps naming the column by `field`, and the application can map it to its own sort key.
- Header and footer templates for the utility columns (selection, reorder, row actions): they have no `med-table-column` to declare them on.
- `med-tree-table` and `med-data-view`, which are not part of the DataTable parity plan.

## Track

**Track:** full
**Rationale:** Fires `Interface`: new public inputs (`footer`, `sortBy`, `sortCompare`) and content templates (`#header`, `#footer`) on `TableColumnComponent`, and a changed public footer rule (DAT-033). `Constitution` also needs design decisions for Article VI (interactive content inside a sortable header) and Article V (footer layout with frozen and stacked columns). One capability, no stored data, no new dependency.
**Security:** not-relevant
**Security rationale:** No security criterion fires. The header and footer templates are Angular templates that the application writes itself and that render through normal Angular bindings, with no `innerHTML` and no sanitization bypass. `sortCompare` is a function the application supplies. No authentication, sensitive data, external input parsing, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-053, DAT-054, DAT-055, DAT-033, DAT-024 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/` (`table-column.component.ts`, `data-table.component.ts`); the DataTable docs page, a new demo and its prose in `projects/site/`; `e2e/site/`.
- **Interfaces:** New `med-table-column` inputs `footer`, `sortBy` and `sortCompare` and templates `#header` and `#footer`. A table now renders a `<tfoot>` when a visible column has a footer, even without `#footerGroup`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
