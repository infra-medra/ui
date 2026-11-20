---
'@medra.dev/ui': minor
---

DataTable: add `editMode="row"`, which edits every editable cell of a row at once from an actions column with edit, save and cancel buttons, the `rowEditComplete` and `rowEditCancel` outputs and the `editRowLabel`, `saveRowLabel`, `cancelRowLabel` and `rowActionsHeaderLabel` inputs. Add the `editTrigger` input (`dblclick` or `click`) for `editMode="cell"`, and keep clicks and keys inside an edit cell away from row selection and row keyboard navigation. Add `rowGroupMode="rowspan"`, which merges the `groupRowsBy` column's cells vertically, and the `expandableRowGroups` input with the `expandedRowGroups` model, the `rowGroupExpand` and `rowGroupCollapse` outputs and the `rowGroupToggleLabel` input, so users can collapse subheader groups.
