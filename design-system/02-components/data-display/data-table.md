## Component: DataTable

### Description
A tabular data grid (`med-data-table` with `med-table-column` content children) rendering a flat `T[]` of rows into a native `<table>`. Supports column-driven sorting, single/multiple row selection with a "select all" checkbox, a single global text filter, custom cell templates, an empty state, and pagination (via the existing `med-paginator`). It is a deliberately scoped-down v1: no virtual scrolling, no frozen/sticky columns, no column reorder/resize, no row expansion, and no per-column filter row — each cut is explicitly tied to a known bug class in the original library it's replacing, per the component's doc comment (`data-table.component.ts:26-48`).

### Variants
| Variant | When to use |
|---|---|
| No selection (`selectionMode` unset/`null`, default) | Read-only table, rows not clickable for selection |
| Single selection (`selectionMode="single"`) | One row selectable at a time via row click/Enter/Space; re-clicking the selected row is a no-op — `data-table.component.ts:187,320-341` |
| Multiple selection (`selectionMode="multiple"`) | Checkbox column added, including a header "select all" that selects the whole filtered/sorted set, not just the current page — `data-table.component.ts:58-67,101-121,349-351` |
| Paginated (`paginator`) | Adds `med-paginator` below the table, slicing `sortedValue()` client-side — `data-table.component.ts:180-182,189-191,234-240` |
| Filterable (`filterable`) | Adds a global search `<input medInputText type="search">` above the table filtering all columns' rendered text — `data-table.component.ts:84-96,194-217` |

### Props (Angular Inputs/Outputs)
**`DataTableComponent<T>` (`med-data-table`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly T[]` | `[]` | Row data — `data-table.component.ts:186` |
| `selectionMode` | `'single' \| 'multiple' \| null` | `null` | Row selection mode — `data-table.component.ts:187` |
| `selection` | `T \| readonly T[] \| null` (model) | `null` | Selected row(s); shape depends on `selectionMode` — `data-table.component.ts:188` |
| `paginator` | `boolean` (attribute) | `false` | Enables pagination — `data-table.component.ts:189` |
| `rows` | `number` (attribute) | `10` | Rows per page — `data-table.component.ts:190` |
| `first` | `number` (model) | `0` | Index of the first row of the current page — `data-table.component.ts:191` |
| `sortField` | `string \| null` (model) | `null` | Currently sorted column's `field` — `data-table.component.ts:192` |
| `sortOrder` | `'asc' \| 'desc' \| null` (model) | `null` | Current sort direction; cycles `asc → desc → none` on header click — `data-table.component.ts:50-56,193,302-313` |
| `filterable` | `boolean` (attribute) | `false` | Enables the global filter input — `data-table.component.ts:194` |
| `globalFilterValue` | `string` (model) | `''` | Current filter text — `data-table.component.ts:195` |
| `filterPlaceholder` | `string` | `'Search'` | Filter input placeholder/`aria-label` — `data-table.component.ts:197` |
| `emptyLabel` | `string` | `'No results found'` | Text shown in the empty-state row — `data-table.component.ts:198` |
| `selectAllLabel` | `string` | `'Select all rows'` | `aria-label` for the header select-all checkbox — `data-table.component.ts:199` |
| `ariaLabel` | `string \| null` | `null` | `aria-label` on the `<table>` element — `data-table.component.ts:98,200` |
| `rowTrackBy` | `(row: T, index: number) => unknown` | `(_row, index) => index` | `@for` track function for rows — `data-table.component.ts:135,201` |
| `rowClass` | `((row: T) => string) \| null` | `null` | Extra per-row classes — `data-table.component.ts:202,268-275` |
| `rowAriaLabel` | `((row: T) => string) \| null` | `null` | Per-row checkbox `aria-label` in multiple-selection mode — `data-table.component.ts:150,203` |
| `class` | `string` | `''` | Extra classes on the scroll wrapper — `data-table.component.ts:204` |

**`TableColumnComponent` (`med-table-column`, content child, renders nothing itself)**
| Property | Type | Default | Description |
|---|---|---|---|
| `field` | `string` (required) | — | Key read off each row (`row[field]`) — `table-column.component.ts:38` |
| `header` | `string` | `''` | Column header text — `table-column.component.ts:39` |
| `sortable` | `boolean` (attribute) | `false` | Enables header-click sorting for this column — `table-column.component.ts:40` |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment of header/cells — `table-column.component.ts:41` |
| `width` | `string \| null` | `null` | Inline `style.width` of the column — `table-column.component.ts:42` |
| projected `<ng-template let-row let-rowIndex="rowIndex">` | `TemplateRef` (content child) | — | Custom cell markup replacing the default `row[field]` text — `table-column.component.ts:44` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Zebra-free rows, `hover:bg-surface-50` | `data-table.component.ts:272` |
| Hover | Row background `hover:bg-surface-50` / dark variant when unselected — `data-table.component.ts:272` |
| Focus | No custom focus-visible ring class found on rows; single-selection rows get `tabindex="0"` — `data-table.component.ts:139` |
| Active/Selected | Row background `bg-brand-50` / dark `bg-brand-500/10`, `aria-selected` set — `data-table.component.ts:138,272` |
| Disabled | Not implemented (no row- or table-level disabled state found) | — |
| Loading | Not implemented — no loading/skeleton state found | — |
| Empty | `@empty` block renders a single centered row with `emptyLabel()` spanning all columns — `data-table.component.ts:172-176,198` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Real `<table>`/`<thead>`/`<tbody>`/`<th scope="col">`/`<td>` markup (implicit native table semantics, no explicit `role="table"`/`role="grid"` needed). `aria-label` on the table (`data-table.component.ts:98`), `aria-sort` on sortable headers cycling `none`/`ascending`/`descending` (`data-table.component.ts:123,277-285`), `aria-selected` on selectable rows (`data-table.component.ts:138`). Selection checkboxes have `aria-label` (`data-table.component.ts:109,150`). Confirmed by spec: `data-table.component.spec.ts` — `'clicking a sortable header cycles asc -> desc -> none (unsorted), not a two-state toggle'` asserts `aria-sort` transitions `ascending → descending → none` on repeated clicks of the same header; `'clicking a non-sortable header does nothing'` asserts a non-sortable header's `aria-sort` stays `null`; `'clicking a row selects it, marking aria-selected and highlighting it'` asserts `aria-selected="true"`/`"false"` on the clicked vs. other rows; `'the header checkbox reflects a partial selection as indeterminate'` asserts the select-all checkbox's `indeterminate`/`checked` DOM properties (not an ARIA attribute — no `aria-checked="mixed"` tested) [not covered by tests].
- **Keyboard navigation — resolved 2026-08-19:** Sortable column headers are now real Tab stops (`tabindex="0"` when `col.sortable()`) with a `(keydown)` handler cycling sort on both `Enter` and `' '` (Space) — the same standard toolbar/button activation pair `onRowKeydown` already used for row selection, plus a `focus-visible` ring matching the rest of the library's interactive-element convention. Previously the `<th>` had no `tabindex` and no `keydown` handler at all — sorting was genuinely mouse/click-only, not just under-tested. Single-selection rows are focusable (`tabindex="0"`) and respond to `keydown` for `Enter`/`' '` per source (`data-table.component.ts:139,141,330`). `'rows have no tabindex at all when selection is not enabled'` confirms rows are correctly excluded from tab order when `selectionMode` is unset. No arrow-key row navigation exists or is tested. Confirmed by `data-table.component.spec.ts` — `'a sortable header is a real Tab stop; a non-sortable one is not (Wave 2 fix — 2026-08-19)'`, `'Space on a focused sortable header cycles sort, same as a click (Wave 2 fix — 2026-08-19)'`, `'Enter on a focused sortable header cycles sort, same as a click'`, `'Space on a focused non-sortable header does nothing'`, and (row selection) `'Enter on a focused row selects it'` / `'Space on a focused row selects it (Wave 2 fix — 2026-08-19: was source-only, untested)'` — the row-selection test was previously misnamed `'Enter/Space on a focused row selects it'` while only dispatching Enter; it's now split into two tests, each actually exercising the key it claims to. `data-table.component.ts:123-130,260-267,296-313`
- **Screen reader:** `aria-sort`, `aria-selected`, `aria-label` on filter input and checkboxes as above. No `aria-live` region for filter/sort/empty-state changes — e.g. the empty-state test (`'shows the empty label and spans all columns when there is nothing to show'`) only asserts the row's text content and `colspan`, not any live-region announcement [not covered by tests].

**A11y verdict:** Covered — **both keyboard gaps resolved 2026-08-19**: sortable headers are now Tab-reachable and Enter/Space-activatable (previously click-only), and the row-selection Space path — previously source-only despite a misleadingly named test — is now directly spec-verified alongside Enter. Row selection (`aria-selected`) and column sort (`aria-sort`) ARIA state remain directly asserted by the spec as before.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `selectionMode="multiple"` when you need "select all" semantics over the filtered/sorted set, not just the visible page (`data-table.component.ts:58-67,244-253`; confirmed by spec `'the header select-all checkbox selects/deselects every row'`) | Don't expect frozen columns, column reorder/resize, row expansion, per-column filters, or virtual scrolling — explicitly out of scope for v1 (`data-table.component.ts:26-48`) |
| Provide `rowTrackBy` for large/changing datasets to keep `@for` diffing cheap (`data-table.component.ts:135,201`) | Don't expect arrow-key row navigation — only Tab/Shift+Tab move between the table's Tab stops (sortable headers, single-selection rows); no arrow-key model exists |
| Trust that a sortable header is fully keyboard-operable — Tab-focusable and Enter/Space-activatable, directly tested (`data-table.component.spec.ts` — `'a sortable header is a real Tab stop...'`, `'Space on a focused sortable header cycles sort...'`) | Don't assume every `<th>` is a Tab stop — only `sortable` columns get `tabindex="0"`; a non-sortable header stays out of the tab order (confirmed by the same test) |
| Rely on the indeterminate select-all checkbox for "some rows selected" — its `indeterminate`/`checked` DOM state is directly tested (`data-table.component.spec.ts` — `'the header checkbox reflects a partial selection as indeterminate'`) | — |

### Code example (Angular)
```html
<med-data-table [value]="dataTableProducts" selectionMode="single" [(selection)]="dataTableSingleSelection" ariaLabel="Products (single select)">
  <med-table-column field="name" header="Name" sortable />
  <med-table-column field="category" header="Category" />
  <med-table-column field="price" header="Price" align="right">
    <ng-template let-row>{{ '$' + row.price }}</ng-template>
  </med-table-column>
</med-data-table>
```
(Adapted from `projects/showcase/src/app/app.html:1174-1204`.)

### Source
- `projects/medra/ui/src/lib/data-table/data-table.component.ts`
- `projects/medra/ui/src/lib/data-table/table-column.component.ts`
- `projects/medra/ui/src/lib/data-table/data-table.types.ts`
- Showcase usage: `projects/showcase/src/app/app.html:1174-1204`
