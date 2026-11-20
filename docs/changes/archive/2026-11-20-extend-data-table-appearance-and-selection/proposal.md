# Proposal: extend-data-table-appearance-and-selection

## Why

People building tables with `med-data-table` cannot change its density, draw grid lines, stripe rows, offer radio-button selection or move between rows with the arrow keys, although the PrimeNG table it replaces supports all five. Each gap forces consumers to override classes or write their own keyboard handling, and keyboard users can only Tab through every row one by one. This is change 2 of 7 toward DataTable parity and follows the documentation change that recorded these gaps.

## What Changes

- The table accepts a `size` (`sm`, `default`, `lg`) that changes cell padding and text size.
- The table can draw grid lines between cells (`showGridlines`) and alternate row backgrounds (`stripedRows`).
- `selectionMode="radio"` shows one radio button per row for single selection.
- In `single` and `radio` selection modes, ArrowUp, ArrowDown, Home and End move focus between the rows of the current page.
- The docs page gains five examples (size, grid lines, striped rows, radio selection and keyboard navigation) in its existing structure.

## Scope

### In scope

- New inputs `size`, `showGridlines` and `stripedRows`, and the new `selectionMode` value `radio`, on `med-data-table`.
- Arrow, Home and End key navigation between focusable rows.
- Docs-page examples for each of the five features, with tests citing every scenario.
- A changeset for the library change.

### Out of scope

- Arrow-key navigation in `multiple` mode or without a selection mode: rows there are not focusable today, and making them so changes existing behavior. A later change can add it.
- Shift+arrow range selection: it needs its own scenarios and is not a PrimeNG topic of this change.
- Sorting, pagination, columns, editing, filters and virtual scroll: changes 3 to 7 of the sequence.
- Theme or token redesign: the new variants reuse existing tokens.

## Track

**Track:** full
**Rationale:** Interface fires, because new public inputs and a new `selectionMode` value change what consumers can bind. Size fires, because five features with implementation, tests and docs are expected to exceed 8 tasks. New capability, breadth (one capability), data, dependency, security, constitution and learnings did not fire.
**Security:** not-relevant
**Security rationale:** None fired: presentation inputs and keyboard focus handling only, with no authentication, sensitive data, external input, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-006, DAT-024 modified; DAT-025, DAT-026 added |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/**`, the DataTable docs page, its demos and content under `projects/site/src/`, and `e2e/site/`.
- **Interfaces:** `med-data-table` gains inputs `size`, `showGridlines` and `stripedRows` and the `selectionMode` value `radio`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
