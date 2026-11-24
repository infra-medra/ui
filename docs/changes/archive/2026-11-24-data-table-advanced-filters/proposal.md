# Proposal: data-table-advanced-filters

## Why

`<med-data-table>` currently limits each column filter to a single rule in a header popover menu and lacks range (`between`), multi-select (`in`), inline filter rows, and custom filter templates. Supporting multi-rule `AND`/`OR` filtering, `between` and `in` match modes, a `filterDisplay="row"` header row, and `#filter` column templates enables complex data-grid filtering workflows without custom workarounds.

## What Changes

- Support multiple filter rules per column combined with an `AND` (`'and'`) or `OR` (`'or'`) operator in `columnFilters`, the filter menu UI, and persisted state (`stateKey`), while remaining backward-compatible with single-rule `{ matchMode, value }` entries.
- Add `between` (numeric and date inclusive range) and `in` (multi-select value list) match modes to `TableFilterMatchMode` and the filter UI.
- Add `filterDisplay` (`'menu' | 'row'`, default `'menu'`) on `<med-data-table>` to render an inline filter row below the column headers when `'row'` is selected.
- Add `#filter` (`filterTemplate`) and `filterOptions` inputs on `<med-table-column>` so consumers can supply custom filter controls in both row and menu filter displays, or explicit options for `in` multi-select filters.

## Scope

### In scope

- `TableColumnFilterGroup` (`{ operator, rules }`), `between` and `in` match modes in `data-table.types.ts` and `data-table-column-filter.ts`.
- Multi-rule `AND`/`OR` UI in the column filter menu, `filterDisplay="row"` inline filter row, and `#filter` template rendering in `DataTableComponent` and `TableColumnComponent`.
- Bounded deserialization of multi-rule and array filter values in `data-table-state.ts`.
- Unit/component tests covering all new and modified scenarios.

### Out of scope

- Virtual scroll extensions, CSV footer export, frozen column boundary moves, and responsive stack container breakpoints — separate changes.

## Track

**Track:** fast
**Rationale:** Additive filtering capabilities within a single existing capability (`data-display`), preserving backward compatibility for single-rule `columnFilters` and default `filterDisplay="menu"`.
**Security:** relevant
**Security rationale:** Extends `parseStoredColumnFilters` in `data-table-state.ts` to deserialize and bound nested multi-rule arrays and `in`/`between` array values from `localStorage`/`sessionStorage`, and renders consumer `#filter` templates.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-038, DAT-039, DAT-057 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.types.ts`, `data-table-column-filter.ts`, `data-table-state.ts`, `table-column.component.ts`, `data-table.component.ts`, and `data-table-advanced-filters.spec.ts`.
- **Interfaces:** New `filterDisplay`, `addRuleLabel`, `removeRuleLabel`, `matchAllLabel`, `matchAnyLabel` inputs on `DataTableComponent`; `#filter` template and `filterOptions` input on `TableColumnComponent`; `between`/`in` match modes and `TableColumnFilterGroup` in `TableColumnFilters`.
- **Data:** `columnFilters` persisted in `stateStorage` now also accepts `{ operator, rules }` and array rule values.
- **Dependencies:** None.

## Open Questions

None.
