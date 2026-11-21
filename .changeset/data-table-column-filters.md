---
'@medra.dev/ui': minor
---

DataTable: add a column filter menu. A `med-table-column` with `columnFilter` gets a funnel button in its header that opens a menu with a match mode select, a value control and Apply and Clear buttons. `filterType` (`text`, `numeric` or `date`) picks the value control and the offered match modes, `filterMatchModes` restricts them and `filterMatchMode` sets the preselected one. The new two-way `columnFilters` model holds each column's rule keyed by field, combines with the global filter, is saved and restored with the persisted state and applies to `exportCSV()`. The `columnFilterLabel`, `applyFilterLabel`, `clearFilterLabel`, `filterMatchModeLabel` and `matchModeLabels` inputs customize the menu text. `lazyLoad` events now carry `columnFilters`, and the `filter` output also emits when a column rule is applied.
