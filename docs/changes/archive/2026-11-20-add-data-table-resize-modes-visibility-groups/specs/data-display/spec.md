# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-031: Data table column resize modes

With `resizableColumns`, `med-data-table` SHALL resize a column by dragging its handle according to `columnResizeMode`, which is `fit` (default) or `expand`. In `fit` mode the sum of the dragged column's width and the next visible column's width SHALL stay constant, so the table width does not change, and the last visible column SHALL NOT render a resize handle. In `expand` mode only the dragged column SHALL change width and the table width SHALL change by the same amount, so the table wrapper scrolls horizontally when the table becomes wider than it. In both modes a column SHALL NOT shrink below 40px, and `colResize` SHALL emit the header element and the dragged column's width delta when the drag ends. Frozen column offsets SHALL follow the resized widths.

#### Scenario DAT-031.S1: Fit mode trades width with the neighbour

- **Given** a resizable table in the default mode whose first two columns are 200px and 100px wide
- **When** the user drags the first column's handle 50px to the right
- **Then** the first column is 250px wide and the second is 50px wide
- **And** the table width is unchanged

#### Scenario DAT-031.S2: Fit mode stops at the minimum width

- **Given** a resizable table in `fit` mode whose second column is 100px wide
- **When** the user drags the first column's handle far enough to the right that the second column would be narrower than 40px
- **Then** the second column is 40px wide and the first column grows only by the width the second gave up

#### Scenario DAT-031.S3: Last column has no handle in fit mode

- **Given** a resizable table in `fit` mode
- **When** it renders
- **Then** every column header except the last one visible has a resize handle

#### Scenario DAT-031.S4: Expand mode grows the table

- **Given** a resizable table with `columnResizeMode="expand"` whose first column is 200px wide
- **When** the user drags the first column's handle 50px to the right
- **Then** the first column is 250px wide and every other column keeps its width
- **And** the table is 50px wider

#### Scenario DAT-031.S5: Resize event

- **Given** a resizable table in either mode
- **When** the user drags a handle 30px to the right and releases it
- **Then** `colResize` emits the column's header element and a delta of 30

### REQ DAT-032: Data table column visibility

A `med-table-column` SHALL accept `visible` (default `true`). While `visible` is `false`, the data table SHALL NOT render that column's header cell, body cells or footer cell, SHALL NOT count it in the column span of grouping, expansion and empty-state rows, SHALL NOT include it in frozen column offsets, and SHALL NOT export it in CSV. The column's sort state, filter matching and resized width SHALL be kept, so setting `visible` back to `true` restores the column as it was. Changing `visible` at runtime SHALL update the table without recreating the rows.

#### Scenario DAT-032.S1: Hidden column is not rendered

- **Given** a table with three columns, the second with `visible` false
- **When** it renders
- **Then** the header row has two cells and every body row has two cells

#### Scenario DAT-032.S2: Toggling restores the column

- **Given** a table with a column whose `visible` was set to false
- **When** `visible` is set back to true
- **Then** the column's header and cells render again in their original position

#### Scenario DAT-032.S3: Spanning rows follow visible columns

- **Given** a table with four columns, one hidden, showing the empty label
- **When** it renders
- **Then** the empty-state cell spans three columns

#### Scenario DAT-032.S4: Frozen offsets skip hidden columns

- **Given** a table whose first three columns are `frozen` and 100px wide, the second with `visible` false
- **When** it renders
- **Then** the third column sticks at offset 100px

#### Scenario DAT-032.S5: Hidden column is not exported

- **Given** a table with a hidden column
- **When** `exportCSV()` runs
- **Then** the CSV header and rows hold only the visible columns

#### Scenario DAT-032.S6: Hidden column keeps its state

- **Given** a table sorted by a column that is then hidden and shown again
- **When** it is shown
- **Then** the table is still sorted by that column

### REQ DAT-033: Data table column groups

`med-data-table` SHALL render the content of a `#headerGroup` template, written by the application as one or more `<tr>` rows, inside the table header above the column header row, and SHALL render the content of a `#footerGroup` template in a table footer after the body. Without a `#footerGroup` template the table SHALL NOT render a footer. Sorting, filtering, selection, resize handles and frozen columns SHALL keep working on the column header row. The application owns the `colspan` and `rowspan` of the cells it writes.

#### Scenario DAT-033.S1: Header group above the column row

- **Given** a table with a `#headerGroup` template holding one row with a cell spanning two columns
- **When** it renders
- **Then** that row appears in the table header before the row of column headers

#### Scenario DAT-033.S2: Footer group renders after the body

- **Given** a table with a `#footerGroup` template holding one row
- **When** it renders
- **Then** the table has a footer after its body containing that row

#### Scenario DAT-033.S3: No footer without a template

- **Given** a table without a `#footerGroup` template
- **When** it renders
- **Then** it has no footer element

#### Scenario DAT-033.S4: Sorting still works with a header group

- **Given** a table with a `#headerGroup` template and a sortable column
- **When** the user clicks the sortable column's header
- **Then** the rows are sorted by that column

## MODIFIED Requirements

### REQ DAT-001: Data table rendering

`med-data-table` SHALL render one header cell per visible `med-table-column` and one row per item in `value`, showing `row[field]` by default or a custom cell template when provided. When there is nothing to show it SHALL render the empty label (default "No results found") in a single cell spanning all visible columns. The table SHALL carry `ariaLabel` when provided.

#### Scenario DAT-001.S1: Empty state

- **Given** a data table with an empty `value`
- **When** it renders
- **Then** the empty label is shown in one cell spanning all columns

### REQ DAT-009: Data table CSV export

`exportCSV()` SHALL download all rows as CSV with the header first, in the current sorted order, using `csvSeparator` and `exportFilename`, quoting values that contain the separator, a quote or a newline and doubling inner quotes. Only visible columns SHALL be exported. With `selectionOnly` it SHALL export only selected rows (only the header when none).

#### Scenario DAT-009.S1: Quoting

- **Given** a cell value containing a comma
- **When** the table is exported
- **Then** that value is enclosed in quotes in the CSV

### REQ DAT-010: Data table grouping, reorder, resize, expansion and state

The data table SHALL, with `rowGroupMode="subheader"`, insert a subheader row per consecutive distinct `groupRowsBy` value spanning all visible columns, with that field as primary sort key. With `reorderable`, it SHALL show a drag handle per row and emit `rowReorder` with indices into `value`, not display positions; dropping on the origin row SHALL do nothing. With `resizableColumns` it SHALL render column resize handles that behave per `columnResizeMode`; with `scrollable` it SHALL keep a sticky header. It SHALL render the `#rowexpansion` template for rows whose key is in `expandedRowKeys`. With `stateKey`, it SHALL persist sort state to session or local storage per `stateStorage`.

#### Scenario DAT-010.S1: Reorder indices

- **Given** a sorted reorderable table
- **When** the user drags row 0 onto row 2
- **Then** `rowReorder` emits indices relative to `value`

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize with its fit and expand modes, column toggle, column groups, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll). A demo SHALL NOT use an input, output or template the component does not implement.

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
