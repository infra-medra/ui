# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-035: Data table row editing

With `editMode="row"`, `med-data-table` SHALL render an actions column after the data columns with an edit button in each body row, labelled for assistive technology with the action. Activating a row's edit button SHALL show the edit template of every editable column of that row at once, bound to the row, and SHALL replace the edit button with a save button and a cancel button. The save button SHALL emit `rowEditComplete` with the row and the value of each editable field as given by its edit template, then leave edit mode; the cancel button SHALL emit `rowEditCancel` with the row without emitting `rowEditComplete`, then leave edit mode. Within an edit template, Enter SHALL behave as the save button and Escape as the cancel button. Columns that are not editable, or have no edit template, SHALL keep their display content while the row is edited. Clicking an actions-column button SHALL NOT select the row. Only one row SHALL be in edit mode at a time: activating the edit button of another row SHALL first cancel the row being edited, emitting `rowEditCancel` for it. With `editMode` unset or `cell`, the table SHALL NOT render the actions column.

#### Scenario DAT-035.S1: Edit and save a row

- **Given** a table with `editMode="row"` and two editable columns
- **When** the user activates a row's edit button, changes both values and activates its save button
- **Then** both edit templates were shown at once while the row was edited
- **And** `rowEditComplete` emits once with the row and both values
- **And** the row shows its display content again

#### Scenario DAT-035.S2: Cancel a row edit

- **Given** a row in edit mode
- **When** the user activates its cancel button
- **Then** `rowEditCancel` emits with the row and `rowEditComplete` does not emit
- **And** the row shows its display content again

#### Scenario DAT-035.S3: Keyboard commit and cancel

- **Given** a row in edit mode with the focus inside an edit template
- **When** the user presses Enter
- **Then** `rowEditComplete` emits and the row leaves edit mode
- **And** pressing Escape in a later edit emits `rowEditCancel` instead

#### Scenario DAT-035.S4: Actions column only in row mode

- **Given** tables with `editMode` unset and with `editMode="cell"`
- **When** they render
- **Then** neither table has an actions column or an edit button

#### Scenario DAT-035.S5: One row at a time

- **Given** a row in edit mode
- **When** the user activates the edit button of another row
- **Then** `rowEditCancel` emits for the first row
- **And** only the second row shows its edit templates

#### Scenario DAT-035.S6: Edit buttons do not select the row

- **Given** a table with `editMode="row"` and `selectionMode="single"`
- **When** the user activates a row's edit button
- **Then** the row is not selected and `rowSelect` does not emit

### REQ DAT-036: Data table row-span grouping

With `rowGroupMode="rowspan"` and `groupRowsBy` naming a visible column's field, `med-data-table` SHALL render no subheader rows and SHALL render that column's cell once per run of consecutive rows on the displayed page that share the `groupRowsBy` value, in the first row of the run, with a `rowspan` equal to the length of the run plus the number of expanded `#rowexpansion` rows inside the run, and SHALL omit that column's cell from the other rows of the run. An expansion row inside a run SHALL leave the merged cell's column out of its own cells, so the table stays rectangular. As with `subheader`, `groupRowsBy` SHALL be the primary sort key, and a run SHALL NOT span a page boundary, so a group split across two pages is rendered once on each page with the rows of that page. When the `groupRowsBy` column is hidden or does not exist, the table SHALL render every cell and merge nothing. Selection, row expansion, row editing, frozen columns and column reorder SHALL keep working on rows whose group cell is omitted.

#### Scenario DAT-036.S1: Grouped cell spans its rows

- **Given** a table with `rowGroupMode="rowspan"`, `groupRowsBy="team"` and three rows of team A followed by two of team B
- **When** it renders
- **Then** the team column has two cells, one with `rowspan` 3 and one with `rowspan` 2
- **And** no subheader row is rendered

#### Scenario DAT-036.S2: Groups split by a page break

- **Given** the same table paginated with `rows` 2
- **When** the second page is displayed
- **Then** the remaining team A row has its own team cell with `rowspan` 1 and the team B rows follow with their own spanning cell

#### Scenario DAT-036.S3: Expanded row inside a group

- **Given** the same table with `#rowexpansion` and the second team A row expanded
- **When** it renders
- **Then** the team A cell has `rowspan` 4 (three rows plus one expansion row)
- **And** the expansion row has one cell fewer than a data row and the table has no misaligned cells

#### Scenario DAT-036.S4: Hidden group column merges nothing

- **Given** the same table with the team column `visible` false
- **When** it renders
- **Then** every row has its own cells and none has a `rowspan` attribute above 1

### REQ DAT-037: Data table expandable row groups

With `rowGroupMode="subheader"` and `expandableRowGroups`, `med-data-table` SHALL render a toggle button in each subheader row, exposing `aria-expanded` and an accessible name that includes the group value. Activating it with a click, Enter or Space SHALL collapse an expanded group, hiding every body row of that group (and any `#rowexpansion` row attached to them), or expand a collapsed one. The two-way `expandedRowGroups` model SHALL hold the group values that are collapsed, and an application that sets it SHALL control which groups start collapsed; with the default empty model all groups SHALL start expanded. `rowGroupExpand` and `rowGroupCollapse` SHALL emit the group value when the user expands or collapses it. Collapsing a group SHALL NOT change the selection, the sort or the paginator, and rows of a collapsed group SHALL stay in `exportCSV()` output. Without `expandableRowGroups`, or with another `rowGroupMode`, the table SHALL NOT render a toggle button and every group SHALL be shown.

#### Scenario DAT-037.S1: Collapse a group

- **Given** a table with `expandableRowGroups` and two groups of three rows
- **When** the user activates the toggle of the first group
- **Then** the three rows of that group are hidden and its subheader stays
- **And** the toggle reports `aria-expanded` false and `rowGroupCollapse` emits that group's value

#### Scenario DAT-037.S2: Expand a group again

- **Given** a collapsed group
- **When** the user activates its toggle with the Enter key
- **Then** its rows are shown and `rowGroupExpand` emits that group's value

#### Scenario DAT-037.S3: No toggle without the input

- **Given** a table with `rowGroupMode="subheader"` and without `expandableRowGroups`
- **When** it renders
- **Then** subheader rows have no toggle button and all groups are shown

#### Scenario DAT-037.S4: Selection survives collapsing

- **Given** a selected row inside an expanded group
- **When** the user collapses and expands that group
- **Then** the row is still selected

## MODIFIED Requirements

### REQ DAT-008: Data table cell editing

With `editMode="cell"`, an editable column cell SHALL show its edit template bound to the row when the user double-clicks it, or when the user clicks it if `editTrigger` is `click` (default `dblclick`); with `editTrigger="dblclick"` a plain click SHALL NOT. Enter SHALL commit by emitting `editComplete` with row, field and value and leave edit mode; Escape SHALL cancel via `editCancel` without committing. Only one cell SHALL be in edit mode at a time, non-editable columns SHALL ignore the trigger, and nothing SHALL happen when `editMode` is unset. Entering, committing or cancelling an edit SHALL NOT itself change the selection with any `selectionMode`: a click that enters edit mode with `editTrigger="click"` SHALL NOT select the row, while with `editTrigger="dblclick"` the clicks that precede the double-click keep selecting the row as a row click does without editing. A click or key pressed inside an edit template SHALL NOT select a row or move the row keyboard focus.

#### Scenario DAT-008.S1: Commit

- **Given** a cell in edit mode
- **When** the user presses Enter
- **Then** `editComplete` emits and the cell leaves edit mode

#### Scenario DAT-008.S2: Single-click trigger

- **Given** a table with `editMode="cell"`, `editTrigger="click"` and `selectionMode="single"`
- **When** the user clicks an editable cell
- **Then** the cell shows its edit template
- **And** the row is not selected

#### Scenario DAT-008.S3: Keys inside an edit template

- **Given** a table with `selectionMode="single"` and a cell in edit mode holding a text input
- **When** the user types a space and presses ArrowDown in the input
- **Then** the row is not selected and the focus stays in the input

#### Scenario DAT-008.S4: Double-click default

- **Given** a table with `editMode="cell"` and no `editTrigger`
- **When** the user clicks an editable cell once
- **Then** the cell does not enter edit mode

#### Scenario DAT-008.S5: Selection on the double-click path

- **Given** a table with `editMode="cell"`, no `editTrigger` and `selectionMode="single"`
- **When** the user double-clicks an editable cell and then clicks inside its edit template
- **Then** the row was selected by the first click of the double-click, as a row click selects it
- **And** the click inside the edit template does not change the selection and the cell stays in edit mode

### REQ DAT-010: Data table grouping, reorder, resize, expansion and state

The data table SHALL, with `rowGroupMode="subheader"`, insert a subheader row per consecutive distinct `groupRowsBy` value spanning all visible columns, with that field as primary sort key, and SHALL let the user collapse those groups with `expandableRowGroups` (DAT-037). With `rowGroupMode="rowspan"` it SHALL merge the `groupRowsBy` column's cells vertically instead (DAT-036). With `reorderable`, it SHALL show a drag handle per row and emit `rowReorder` with indices into `value`, not display positions; dropping on the origin row SHALL do nothing. With `resizableColumns` it SHALL render column resize handles that behave per `columnResizeMode`; with `scrollable` it SHALL keep a sticky header. It SHALL render the `#rowexpansion` template for rows whose key is in `expandedRowKeys`. With `stateKey`, it SHALL persist sort state to session or local storage per `stateStorage`.

#### Scenario DAT-010.S1: Reorder indices

- **Given** a sorted reorderable table
- **When** the user drags row 0 onto row 2
- **Then** `rowReorder` emits indices relative to `value`

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll). A demo SHALL NOT use an input, output or template the component does not implement.

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

#### Scenario DAT-024.S10: Row editing and grouping features documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the row editing, cell editing with selection, row-span grouping and expandable row groups examples each have a section with prose, a working demo and a code block
- **And** activating a row's edit button in the row editing demo shows its edit templates
