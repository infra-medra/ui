# Classification: DataTable parity with PrimeNG

Source: the PrimeNG table index (66 topics) compared with `projects/medra/ui/src/lib/data-table/` on 2026-11-19. Classes: **D** already supported, only documentation missing; **I** missing in MedraUi and present in PrimeNG, to implement; **X** discarded; **Q** needed a user decision.

## This change (1 of 7): D — document what exists

| PrimeNG topic(s) | Class | MedraUi support | Example id |
|---|---|---|---|
| Basic | D | `value`, `med-table-column` | `basic` |
| Selection: Single, Multiple, Checkbox | D | `selectionMode` single / multiple (checkbox column), `dataKey` | `selection-single`, `selection-multiple` |
| Keyboard (Enter/Space row selection) | D | `onRowKeydown`; arrow-key navigation is checked in change 2 | covered by `selection-single` |
| Sort: Single, Multiple | D | `sortField`/`sortOrder`, `sortMode="multiple"` | `sort-single`, `sort-multiple` |
| Filter (global) | D | `filterable`, `globalFilterFields`, `filterDelay` | `filter-global` |
| Pagination | D | `paginator`, `rows`, `rowsPerPageOptions`, `first` | `pagination` |
| Scroll: Vertical | D | `scrollable`, `scrollHeight` | `scroll-vertical` |
| Row Expansion | D | `#rowexpansion`, `expandedRowKeys` | `row-expansion` |
| Row Group: Subheader | D | `rowGroupMode="subheader"`, `groupRowsBy` | `row-group-subheader` |
| Column Resize | D | `resizableColumns`, `colResize` | `column-resize` |
| Edit: Cell | D | `editMode="cell"`, `#editTemplate` | `edit-cell` |
| Lazy, loading | D | `lazy`, `totalRecords`, `lazyLoad`, `loading` | `loading`, `lazy` |
| Empty State | D | `emptyLabel` | `empty-state` |
| Template | D | column `ng-template` | `templates` |
| Conditional Style | D | `rowClass` | `conditional-style` |
| Stateful | D | `stateKey`, `stateStorage` | `stateful` |
| Export (CSV) | D | `exportCSV()` | `export-csv` |
| Row Reorder + events | D | `reorderable`, `rowReorder`, `rowSelect`, `sort`, `filter` | `row-reorder-events` |

## Later changes: I — implement, then document

| Change | PrimeNG topics |
|---|---|
| 2 Appearance and selection | Size, Grid Lines, Striped Rows, Selection: Radio, Keyboard arrow navigation |
| 3 Sorting and pagination | Presort, Removable sort, Programmatic pagination |
| 4 Columns | Frozen Columns (the `frozen` input is inert today), Frozen Columns Multiple, Frozen Rows, Scroll: Horizontal and Flexible, Column Resize: Fit Mode and Expand Mode, Column Toggle, Column Group |
| 5 Editing and rows | Edit: Row, Cell & Selection, Row Group: RowSpan and Expandable |
| 6 Filters | Filter: Advanced (per-column), Filter: Overlay, Filter & Sort |
| 7 Data and extras | Virtual Scroll, Lazy with Preload, Skeleton, Dynamic Columns, Context Menu, Samples, Advanced, Database Editor |

## X — discarded

| PrimeNG topic | Reason |
|---|---|
| Pass Through, Styled / Unstyled | Do not apply by nature; MedraUi uses class overrides (Article II). |
| Document (structure/styling reference) | A PrimeNG reference section with no feature behind it. |
| Responsive "stack" layout | Not an index topic of the PrimeNG page; the component's existing horizontal scroll stays. |
| Form controls (Signal Forms, Template Driven, Reactive Forms) | The table is not a form control, so Article IV does not apply. |
| Accessibility, Theming | Already shared sections of the docs page. |

## Q — decided by the user (2026-11-19)

| Question | Decision |
|---|---|
| Split into changes | Several changes by theme; this proposal is change 1. |
| Former v1 cuts (virtual scroll, per-column filter) | Implement both (changes 6 and 7). |
| Former v1 cut (responsive stack) | Discard. |
