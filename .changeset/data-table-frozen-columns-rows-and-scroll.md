---
'@medra.dev/ui': minor
---

`DataTableComponent` now freezes columns, freezes rows and supports a flexible scroll height. A `med-table-column` with `frozen` stays in view while the table scrolls horizontally, and `alignFrozen` picks the left or right edge. The new `frozenValue` input pins rows to the top of the table, or to the bottom with `frozenRowsPosition="bottom"`, outside sorting, filtering, paging and selection. `scrollHeight="flex"` makes a scrolling table fill the height of its parent.
