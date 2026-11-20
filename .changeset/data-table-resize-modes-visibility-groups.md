---
'@medra.dev/ui': minor
---

`DataTableComponent` gains column resize modes, column visibility and column groups. The new `columnResizeMode` input picks how `resizableColumns` behaves: `fit` (the new default) keeps the table width and trades width between the dragged column and its right neighbour, while `expand` grows or shrinks the table with the dragged column. A `med-table-column` accepts `visible` to hide a column without removing it from the template. The new `#headerGroup` template renders application-written rows above the column header row, and `#footerGroup` renders rows in a table footer.
