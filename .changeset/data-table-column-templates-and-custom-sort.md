---
'@medra.dev/ui': minor
---

DataTable: add a `#header` template to `med-table-column` that replaces the column's header text while keeping the sort indicator, filter button, resize handle and `aria-sort`, with clicks and key presses on interactive content inside it no longer sorting the column; add a `footer` input and a `#footer` template to `med-table-column` and a column footer row to `med-data-table` (the template receives every filtered and sorted row across all pages, or the current `value` when `lazy`); and add `sortBy` and `sortCompare` inputs to `med-table-column` for sorting a column by a different row property or by a custom comparator.
