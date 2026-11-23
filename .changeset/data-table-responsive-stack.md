---
'@medra.dev/ui': minor
---

DataTable: add the opt-in `responsiveLayout="stack"` mode. Below the `breakpoint` input (a CSS length, `960px` by default), each body row renders as a block and each cell shows its column label beside its value. The label is the new `stackLabel` input on `med-table-column` when set, otherwise the column's `header`, and a column with neither shows no label. The default `responsiveLayout` stays `scroll`, and `virtualScroll` always keeps the table unstacked.
