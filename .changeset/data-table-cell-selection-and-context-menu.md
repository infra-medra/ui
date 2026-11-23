---
'@medra.dev/ui': minor
---

DataTable and ContextMenu: add `cellSelection` mode (`selectionMode` `'single'` or `'multiple'`) storing `TableCellSelection<T>` (`{ row, field }`) entries in `selection` with keyboard activation (`Enter`/`Space`), `dataKey` matching, and `cellSelect`/`cellUnselect` outputs; add `cellClass` (`(row, field) => string`) for conditional body cell styling; add `contextMenu` (`ContextMenuDirective` with `exportAs: 'medContextMenu'` and `show()`) and `contextMenuSelection` two-way binding with `contextMenuSelect` (`TableContextMenuSelectEvent<T>`) emitted on right-click, `Shift+F10`, or `ContextMenu` key.
