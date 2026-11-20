---
'@medra.dev/ui': minor
---

DataTable: add the `reorderableColumns` input so users can move a column by dragging its header onto another header or with Alt+ArrowLeft and Alt+ArrowRight on a focused header, the `reorderable` input on `med-table-column` to pin a column in place, the `colReorder` output that emits `dragIndex`, `dropIndex` and the new `columns` order, and the `columnMoveAnnouncement` input to customize the live-region text.
