# Proposal: add-data-table-frozen-columns-rows-and-scroll

## Why

People building wide or tall tables with `med-data-table` cannot keep a key column or a summary row in view while the rest scrolls, because `frozen` is accepted on a column but ignored and no input pins rows. They also cannot size a scrolling table to the height of its container. The PrimeNG table the component replaces supports frozen columns, frozen rows and flexible scroll height. This is change 4a of the DataTable parity plan; the column resize modes, column toggle and column group follow as change 4b.

## What Changes

- A column with `frozen` stays visible while the table scrolls horizontally, in the header and in every row. `alignFrozen` picks the left or right edge, and several frozen columns on one edge stack in column order.
- With a column frozen on the left, the reorder handle, selection checkbox and expansion toggle columns freeze on the left too, ahead of it.
- A new `frozenValue` input pins rows to the top of the table, under the header, or, with `frozenRowsPosition="bottom"`, to the bottom. They ignore sorting, filtering and paging, and stay visible in a vertical scroll.
- `scrollHeight="flex"` makes a scrolling table fill the height of its parent instead of using a fixed maximum height.
- A table wider than its container scrolls horizontally inside the table wrapper, and this is now stated and tested.
- The docs page gains examples for frozen columns, frozen columns on both edges, frozen rows, horizontal scroll and flexible scroll.

## Scope

### In scope

- Sticky positioning of `frozen` columns in `med-data-table`, using the declarative `position: sticky` technique that `med-tree-table` already uses.
- The `frozenValue` and `frozenRowsPosition` inputs, and the `flex` value of `scrollHeight`.
- Fixed widths for the reorder handle, selection and expansion columns, so their sticky offsets are exact.
- New requirements DAT-028 to DAT-030 with scenarios, tests that cite each scenario, and a changeset for `@medra.dev/ui`.
- DAT-024 extended with the new docs examples.

### Out of scope

- Selecting frozen rows: they are display-only, so `selection` keeps holding rows from `value` only.
- Column resize modes, column toggle and column group: change 4b, where the toggle will be a `visible` input on `med-table-column`.
- `med-tree-table` and `med-data-view`: `med-tree-table` already freezes columns, and neither is part of the DataTable parity plan.
- A change to the existing vertical scroll with a fixed `scrollHeight`: it keeps working as in DAT-010.

## Track

**Track:** full
**Rationale:** Interface fires: `frozenValue`, `frozenRowsPosition` and the `flex` value of `scrollHeight` are new public API, and `frozen` changes from inert to active. Size fires: tests, sticky layout, five demos and a changeset exceed 8 tasks. New capability, Breadth, Data, Dependency and Security do not fire (one existing capability, no stored data, no new dependency). No active learning scoped to `data-display` asks for a plan.
**Security:** not-relevant
**Security rationale:** None fired. The change adds CSS positioning and one array input rendered through the existing row templates, with no new external input, data, permission, secret or dependency.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-024, DAT-028, DAT-029, DAT-030 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/` (component, column doc comments, spec), the DataTable docs page and its demos and prose under `projects/site/`, `e2e/site/data-table-docs.spec.ts`, and a new changeset.
- **Interfaces:** new `frozenValue` and `frozenRowsPosition` inputs on `med-data-table`; `scrollHeight` accepts `flex`; the existing `frozen` and `alignFrozen` inputs of `med-table-column` now take effect in `med-data-table`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
