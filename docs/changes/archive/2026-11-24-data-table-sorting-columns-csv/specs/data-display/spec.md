# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-058: Data table column cell merging

`<med-table-column>` SHALL accept a `merge` boolean input (default `false`). When `merge` is `true` on a visible non-frozen column and the table is neither stacked nor in `virtualScroll`, `<med-data-table>` SHALL merge consecutive rows on the displayed page that share the same raw cell value in that column by setting `rowspan` on the first cell of the run (plus any expanded `#rowexpansion` rows within the run) and omitting covered cells in subsequent rows, without requiring `groupRowsBy`.

#### Scenario DAT-058.S1: Merging consecutive equal cells on non-grouped columns

- **Given** a table with columns `region` (`merge` true) and `status` (`merge` true), where `groupRowsBy` is unset, and rows with consecutive equal values in `region` and `status`
- **When** the table renders
- **Then** consecutive equal cells in both `region` and `status` are merged with `rowspan` > 1 and covered cells are omitted
- **And** rows stay rectangular across page boundaries without altering row sort order

### REQ DAT-059: Data table utility column templates

`<med-data-table>` SHALL accept optional `<ng-template #reorderHeader>`, `<ng-template #reorderFooter>`, `<ng-template #selectionHeader>`, `<ng-template #selectionFooter>`, `<ng-template #rowActionsHeader>`, and `<ng-template #rowActionsFooter>` templates. When provided, each template SHALL render inside its corresponding utility column header `<th>` or footer `<td>`, and any utility footer template SHALL trigger rendering of `<tfoot>` even when no data column defines a footer.

#### Scenario DAT-059.S1: Custom utility header and footer templates

- **Given** a table with `reorderable`, `selectionMode="multiple"`, `editMode="row"`, and custom `#reorderHeader`, `#reorderFooter`, `#selectionHeader`, `#selectionFooter`, `#rowActionsHeader`, and `#rowActionsFooter` templates
- **When** the table renders
- **Then** each utility header and footer cell renders its custom template content

## MODIFIED Requirements

### REQ DAT-003: Data table multi-column sorting

With `sortMode="multiple"`, a plain click SHALL replace the sort with just that column, Shift+click SHALL add the column keeping the others (or cycle its order in place, removing it once it returns to none when `removableSort` is `true`, or cycling back to ascending when `removableSort` is `false`), ties SHALL be broken by later keys, and a 1-based priority badge SHALL appear next to each active sorted column. `sort` SHALL emit the multi-sort metadata and data.

#### Scenario DAT-003.S1: Shift adds

- **Given** a table sorted by column A in multiple mode
- **When** the user Shift+clicks column B
- **Then** the data is sorted by A then B and both show priority badges

#### Scenario DAT-003.S2: Non-removable multi-column sort

- **Given** a table with `sortMode="multiple"` and `removableSort` set to `false`, sorted ascending by column A and descending by column B
- **When** the user Shift+clicks column B
- **Then** column B cycles back to ascending instead of being removed from `multiSortMeta`

### REQ DAT-009: Data table CSV export

`exportCSV(options?)` SHALL download all rows that pass the global filter and every column rule as CSV with the header first, in the current sorted order, using `csvSeparator` and `exportFilename`, quoting values that contain the separator, a quote or a newline and doubling inner quotes. Only visible columns SHALL be exported. With `selectionOnly` it SHALL export only selected rows (only the header when none). With `includeFooter` set to `true` and at least one visible column having `footer` text, it SHALL append the footer row after the data rows.

#### Scenario DAT-009.S1: Quoting

- **Given** a cell value containing a comma
- **When** the table is exported
- **Then** that value is enclosed in quotes in the CSV

#### Scenario DAT-009.S2: Filtered export

- **Given** a table with an active column rule that hides one of three rows
- **When** the table is exported
- **Then** the CSV holds the header and only the two rows that pass the rule

#### Scenario DAT-009.S3: Footer included in CSV export

- **Given** a table with visible columns whose `footer` texts are `"Total"` and `"100"`
- **When** `exportCSV({ includeFooter: true })` is called
- **Then** the exported CSV appends `"Total,100"` after the data rows

### REQ DAT-034: Data table column reorder

With `reorderableColumns`, `med-data-table` SHALL let the user move a column by dragging its header cell onto another column's header cell, which places the dragged column at the target column's position in the column order. The order SHALL include hidden columns (`visible` false), so a hidden column keeps its place and returns to it when shown. When `reorderAcrossFrozen` is `false` (default), a frozen column SHALL move only to the position of another column frozen on the same edge, and a column that is not frozen SHALL NOT be dropped among frozen columns, so no drag changes a column's frozen state. When `reorderAcrossFrozen` is `true`, moving a column onto a target column across a frozen boundary SHALL succeed and SHALL update the moved column's `frozen` and `alignFrozen` state to match the target column, recomputing frozen offsets. A column whose `reorderable` is `false` SHALL NOT be draggable and SHALL NOT be a drop target. Dropping a column on itself SHALL change nothing. At the end of a drag that moves a column, `colReorder` SHALL emit `dragIndex`, `dropIndex` and `columns`, where the indices are positions in the full column order including hidden columns and `columns` lists the fields in the new order. A focused header cell of a reorderable column SHALL move the column one position toward the start with Alt+ArrowLeft and toward the end with Alt+ArrowRight, skipping hidden columns, with the same movement limits and the same `colReorder` event, keeping focus on that header and announcing the new position through a live region. Header, body and footer cells, the `#headerGroup` and `#footerGroup` rows and frozen offsets SHALL follow the new order, and the application owns the `colspan` of the group rows it writes. Without `reorderableColumns` the table SHALL NOT make headers draggable or react to Alt+Arrow.

#### Scenario DAT-034.S1: Dragging a header moves the column

- **Given** a table with `reorderableColumns` and columns A, B and C
- **When** the user drags header A onto header C
- **Then** the headers and every body row show B, C and A in that order

#### Scenario DAT-034.S2: Event payload

- **Given** a table with `reorderableColumns` and columns A, B and C
- **When** the user drags header A onto header C
- **Then** `colReorder` emits `dragIndex` 0, `dropIndex` 2 and `columns` `['b', 'c', 'a']`

#### Scenario DAT-034.S3: Dropping on the origin does nothing

- **Given** a table with `reorderableColumns` and columns A, B and C
- **When** the user drags header B onto header B
- **Then** the column order is unchanged
- **And** `colReorder` does not emit

#### Scenario DAT-034.S4: Frozen columns stay on their side

- **Given** a table with `reorderableColumns`, `reorderAcrossFrozen` false, a column F frozen on the left, and free columns A and B
- **When** the user drags header A onto header F
- **Then** the column order is unchanged
- **And** `colReorder` does not emit

#### Scenario DAT-034.S5: Frozen columns reorder among themselves

- **Given** a table with `reorderableColumns` and columns F1 and F2 both frozen on the left, followed by free column A
- **When** the user drags header F1 onto header F2
- **Then** F2 is shown before F1 and both stay frozen with their offsets recomputed

#### Scenario DAT-034.S6: Hidden columns keep their place

- **Given** a table with `reorderableColumns` and columns A, B and C, where B has `visible` false
- **When** the user drags header A onto header C and then B is set to visible
- **Then** `colReorder` emitted `columns` `['b', 'c', 'a']`
- **And** the headers show B, C and A in that order

#### Scenario DAT-034.S7: A column that is not reorderable stays put

- **Given** a table with `reorderableColumns` and columns A, B and C, where B has `reorderable` false
- **When** the user drags header A onto header B
- **Then** the column order is unchanged
- **And** header B is not draggable

#### Scenario DAT-034.S8: Keyboard moves the column one position

- **Given** a table with `reorderableColumns` and columns A, B and C, with focus on header B
- **When** the user presses Alt+ArrowRight
- **Then** the columns show A, C and B in that order
- **And** focus stays on header B
- **And** `colReorder` emits `dragIndex` 1, `dropIndex` 2 and `columns` `['a', 'c', 'b']`
- **And** a live region announces the new position of column B

#### Scenario DAT-034.S9: Keyboard stops at the edge

- **Given** a table with `reorderableColumns` and columns A, B and C, with focus on header A
- **When** the user presses Alt+ArrowLeft
- **Then** the column order is unchanged
- **And** `colReorder` does not emit

#### Scenario DAT-034.S10: Group rows follow the application

- **Given** a table with `reorderableColumns`, a `#headerGroup` row and columns A, B and C
- **When** the user drags header A onto header C
- **Then** the group row keeps its cells as the application wrote them
- **And** the column header row shows B, C and A

#### Scenario DAT-034.S11: Off by default

- **Given** a table without `reorderableColumns`
- **When** the user drags a header or presses Alt+ArrowRight on a focused header
- **Then** the column order is unchanged
- **And** no header is draggable

#### Scenario DAT-034.S12: Moving a column across a frozen boundary when reorderAcrossFrozen is true

- **Given** a table with `reorderableColumns` and `reorderAcrossFrozen` set to `true`, a left-frozen column F, and a free column A
- **When** the user drags header A onto header F
- **Then** column A moves to F's position, becomes left-frozen, and frozen offsets are recomputed

### REQ DAT-055: Data table custom column sorting

`med-table-column` SHALL accept `sortBy`, the name of the row property a sort by that column compares (default the column's `field`), and `sortCompare`, a function that compares two rows for ascending order and returns a negative number, zero or a positive number. Whenever the table sorts by a column, from a header click or key, from the initial or two-way `sortField` and `sortOrder`, or as a key of `multiSortMeta`, it SHALL order rows with that column's `sortCompare` when set, otherwise by the column's `sortBy` value with the default comparison, and a descending order SHALL reverse the result. `sortCompare` SHALL take precedence over `sortBy`. `sortField`, `multiSortMeta`, `aria-sort`, the `sort` event, `lazyLoad` and the persisted state SHALL keep naming the column by its `field`, while `lazyLoad` SHALL additionally emit `sortBy` (resolved `col.sortBy() ?? sortField`) and `multiSortByMeta` (each entry's field resolved to `col.sortBy() ?? m.field`). With `lazy` the table SHALL NOT sort, as DAT-007 defines. Rows that compare equal SHALL keep their relative order, and the subheader grouping key SHALL keep the default comparison.

#### Scenario DAT-055.S1: Sort by another property

- **Given** an unsorted table with a sortable column whose `field` is `status`, showing "Open", "Blocked" and "Done", with `sortBy` set to `statusRank` holding 1, 2 and 3 for those rows
- **When** the user clicks the column header
- **Then** the rows are ordered "Open", "Blocked", "Done"
- **And** `sortField` is `status` and the header cell's `aria-sort` is `ascending`

#### Scenario DAT-055.S2: Sort with a compare function

- **Given** an unsorted table with a sortable column `version` holding "1.10", "1.9" and "1.2", and a `sortCompare` that compares version numbers part by part
- **When** the user clicks the column header twice
- **Then** the rows are ordered "1.2", "1.9", "1.10" after the first click and "1.10", "1.9", "1.2" after the second

#### Scenario DAT-055.S3: Compare function in multiple sort

- **Given** a table with `sortMode="multiple"`, sorted by a column `team`, and a sortable column `version` with a `sortCompare` that compares version numbers
- **And** two rows of the same team with versions "1.10" and "1.9"
- **When** the user Shift+clicks the `version` header
- **Then** within that team the row with "1.9" comes before the row with "1.10"
- **And** `multiSortMeta` holds `team` then `version`

#### Scenario DAT-055.S4: Presort uses the custom sort

- **Given** a table whose `sortField` is `status` and `sortOrder` is `desc` from the first render, and the `status` column of DAT-055.S1 with its `sortBy`
- **When** the table renders
- **Then** the rows are ordered "Done", "Blocked", "Open"

#### Scenario DAT-055.S5: Lazy mode leaves sorting to the application

- **Given** a `lazy` table with a sortable column `status` that has `sortBy` and `sortCompare` set
- **When** the user clicks the column header
- **Then** the rows keep the order of `value`
- **And** `lazyLoad` emits with `sortField` `status` and `sortOrder` `asc`

#### Scenario DAT-055.S6: Lazy load emits resolved sortBy and multiSortByMeta

- **Given** a `lazy` table with column `status` having `sortBy="statusRank"`
- **When** the user sorts by `status` ascending (and in `sortMode="multiple"`)
- **Then** `lazyLoad` emits `sortField: 'status'`, `sortBy: 'statusRank'`, and `multiSortByMeta` with `field: 'statusRank'`
