# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-034: Data table column reorder

With `reorderableColumns`, `med-data-table` SHALL let the user move a column by dragging its header cell onto another column's header cell, which places the dragged column at the target column's position in the column order. The order SHALL include hidden columns (`visible` false), so a hidden column keeps its place and returns to it when shown. A frozen column SHALL move only to the position of another column frozen on the same edge, and a column that is not frozen SHALL NOT be dropped among frozen columns, so no drag changes a column's frozen state. A column whose `reorderable` is `false` SHALL NOT be draggable and SHALL NOT be a drop target. Dropping a column on itself SHALL change nothing. At the end of a drag that moves a column, `colReorder` SHALL emit `dragIndex`, `dropIndex` and `columns`, where the indices are positions in the full column order including hidden columns and `columns` lists the fields in the new order. A focused header cell of a reorderable column SHALL move the column one position toward the start with Alt+ArrowLeft and toward the end with Alt+ArrowRight, skipping hidden columns, with the same movement limits and the same `colReorder` event, keeping focus on that header and announcing the new position through a live region. Header, body and footer cells, the `#headerGroup` and `#footerGroup` rows and frozen offsets SHALL follow the new order, and the application owns the `colspan` of the group rows it writes. Without `reorderableColumns` the table SHALL NOT make headers draggable or react to Alt+Arrow.

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

- **Given** a table with `reorderableColumns`, a column F frozen on the left, and free columns A and B
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

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll). A demo SHALL NOT use an input, output or template the component does not implement.

#### Scenario DAT-024.S1: Index matches sections

- **Given** the DataTable documentation page is rendered
- **When** the "On this page" entries are compared with the page sections
- **Then** each entry id matches exactly one section on the page
- **And** the entries appear in the same order as the sections

#### Scenario DAT-024.S2: Every example is complete

- **Given** the DataTable documentation page is rendered
- **When** an example section is inspected
- **Then** it contains prose, a live demo and a code block that shows the demo's template

#### Scenario DAT-024.S3: Existing features stay documented

- **Given** the page before this change documented multi-column sort, cell editing, CSV export, lazy mode, grouped rows and row reorder
- **When** the page is rendered after this change
- **Then** each of those features still has a section with a working demo

#### Scenario DAT-024.S4: New appearance and selection features documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** radio selection, size, grid lines, striped rows and keyboard navigation each have a section with a working demo

#### Scenario DAT-024.S5: Row labels and row identity documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the `row-aria-label` and `row-track-by` examples each have a section with prose, a working demo and a code block

#### Scenario DAT-024.S6: Frozen and scroll features documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the `frozen-columns`, `frozen-columns-both`, `frozen-rows`, `scroll-horizontal` and `scroll-flexible` examples each have a section with prose, a working demo and a code block

#### Scenario DAT-024.S7: Resize modes, column toggle and column groups documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the fit and expand resize modes, the column toggle and the column groups each have a section with prose, a working demo and a code block

#### Scenario DAT-024.S8: Frozen column with utility columns documented

- **Given** the page after this change
- **When** the frozen column with utility columns section is inspected
- **Then** its demo has a reorder handle, a selection column and a frozen data column
- **And** scrolling the demo horizontally keeps the reorder handle, the selection column and the frozen data column in view

#### Scenario DAT-024.S9: Column reorder documented

- **Given** the page after this change
- **When** the column reorder section is inspected
- **Then** it has prose, a working demo and a code block
- **And** dragging a header in the demo moves the column
