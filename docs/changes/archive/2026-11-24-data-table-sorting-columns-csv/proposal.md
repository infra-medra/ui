# Proposal: data-table-sorting-columns-csv

## Why

`<med-data-table>` currently ignores `removableSort="false"` in `sortMode="multiple"`, blocks reordering columns across frozen boundaries, only supports automatic `rowspan` cell merging on `groupRowsBy`, has no header/footer template slots for utility columns, omits column footers from `exportCSV()`, and does not expose resolved `sortBy` property names in `lazyLoad` events. Addressing these six sorting, column, and CSV gaps completes the non-virtual table feature set.

## What Changes

- Respect `removableSort="false"` in `sortMode="multiple"` so descending columns cycle back to ascending instead of being removed.
- Add `reorderAcrossFrozen` (default `false`) on `<med-data-table>` and two-way `frozen`/`alignFrozen` models on `<med-table-column>` so columns can optionally move across frozen boundaries and adopt the target's frozen state.
- Add `merge` boolean input on `<med-table-column>` to merge consecutive equal cells vertically via `rowspan` on any column beyond `groupRowsBy`.
- Add `#reorderHeader`, `#reorderFooter`, `#selectionHeader`, `#selectionFooter`, `#rowActionsHeader`, and `#rowActionsFooter` template slots on `<med-data-table>`.
- Add `includeFooter` option to `exportCSV()` to append a footer row from visible columns' `footer` text.
- Include `sortBy` and `multiSortByMeta` (resolved from `col.sortBy() ?? col.field()`) on `TableLazyLoadEvent` while keeping `sortField` and `multiSortMeta` keyed by `col.field()`.

## Scope

### In scope

- `removableSort` in `toggleMultiSort`, `reorderAcrossFrozen` in `canMoveColumn`/`moveColumn`, `merge` column `rowspan` calculation, utility header/footer `contentChild` templates, `exportCSV({ includeFooter })`, and `sortBy`/`multiSortByMeta` in `TableLazyLoadEvent`.
- Unit/component tests covering all new and modified scenarios.

### Out of scope

- Virtual scroll extensions and responsive stack container breakpoints — separate changes.

## Track

**Track:** fast
**Rationale:** Cohesive, additive enhancements to sorting, column layout, utility slots, and CSV export within `data-display`, preserving existing defaults and backward compatibility.
**Security:** not-relevant
**Security rationale:** Operates purely on in-memory column definitions, template projections, and client-side CSV download; no stored-state deserialization, auth, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-003, DAT-009, DAT-034, DAT-055, DAT-058, DAT-059 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.types.ts`, `table-column.component.ts`, `data-table.component.ts`, and `data-table-sorting-columns-csv.spec.ts`.
- **Interfaces:** `reorderAcrossFrozen` and utility header/footer templates on `DataTableComponent`; `merge` and two-way `frozen`/`alignFrozen` on `TableColumnComponent`; `includeFooter` on `exportCSV`; `sortBy`/`multiSortByMeta` on `TableLazyLoadEvent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
