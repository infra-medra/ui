# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-038: Data table column filter menu

A column with `columnFilter` SHALL show a funnel button in its header with the accessible name "Filter {header}" and an `aria-expanded` state, and activating the button SHALL open a menu holding a match mode select (only when the column offers more than one mode), a value control for the column's `filterType`, and Apply and Clear buttons. Pressing Apply, or Enter in the value control, SHALL commit the rule, close the menu and return the table to its first page; the table SHALL then show only the rows that pass every column rule and the global filter. Clear SHALL remove the column's rule. A rule with an empty value SHALL filter nothing. The funnel button SHALL show an active state while its column has a rule. Escape or a click outside the menu SHALL close it without committing and return the focus to the funnel button. Activating the funnel button SHALL NOT change the sort. A column without `columnFilter` SHALL show no funnel button. The model `columnFilters` SHALL hold each column's rule (match mode and value) keyed by field, SHALL be two-way, and SHALL filter the rows and set the funnel states when an application changes it. The `filter` output SHALL also emit when a column rule commits, with the current global text and the filtered rows.

#### Scenario DAT-038.S1: Apply a text rule

- **Given** a table with a `name` column that has `columnFilter` and the rows "Widget", "Gadget" and "Widget Pro"
- **When** the user opens the funnel menu of `name`, types "wid" and presses Enter
- **Then** only "Widget" and "Widget Pro" are shown
- **And** the menu is closed and the funnel button shows its active state

#### Scenario DAT-038.S2: Combines with the global filter

- **Given** a `filterable` table with a `columnFilter` on `name`, and an active rule "wid" on `name`
- **When** the global filter text is set to "pro"
- **Then** only rows that match both are shown

#### Scenario DAT-038.S3: Clear

- **Given** a table with an active rule on `name`
- **When** the user opens the funnel menu and activates Clear
- **Then** all rows are shown again
- **And** the funnel button no longer shows its active state

#### Scenario DAT-038.S4: Funnel does not sort

- **Given** a sortable `name` column with `columnFilter` and no sort applied
- **When** the user activates its funnel button
- **Then** the menu opens and the sort order is unchanged

#### Scenario DAT-038.S5: Escape discards the draft

- **Given** an open filter menu where the user typed a value without applying it
- **When** the user presses Escape
- **Then** the menu closes, the rows are unfiltered and the funnel button has the focus
- **And** its `aria-expanded` is `false`

#### Scenario DAT-038.S6: Returns to the first page

- **Given** a paginated table showing its second page
- **When** the user applies a column rule
- **Then** the table shows the first page of the filtered rows

#### Scenario DAT-038.S7: Column without the input

- **Given** a table where only `name` has `columnFilter`
- **When** the headers are rendered
- **Then** the `name` header has a funnel button and the other headers have none

#### Scenario DAT-038.S8: Two-way model

- **Given** a table whose `columnFilters` is set to a rule on `name` by the application
- **When** the table renders
- **Then** the rows are filtered by that rule and the `name` funnel button shows its active state
- **And** applying a new rule through the menu updates `columnFilters`

### REQ DAT-039: Data table column filter match modes

A `columnFilter` column SHALL offer the match modes of its `filterType`: for `text` (default) contains (default mode), notContains, startsWith, endsWith, equals and notEquals; for `numeric` equals (default mode), notEquals, lt, lte, gt and gte; for `date` dateIs (default mode), dateIsNot, dateBefore and dateAfter. `filterMatchModes` SHALL restrict the offered modes to those it lists that belong to the type, and `filterMatchMode` SHALL set the preselected mode when it is offered. Text modes SHALL compare case-insensitively against the cell's text, treating a missing value as the empty string. Numeric modes SHALL compare numbers, and a cell whose value is not a finite number SHALL match no numeric mode. Date modes SHALL compare calendar days in the local time zone of cells that are `Date` objects or ISO date strings, and a cell that is neither SHALL match no date mode.

#### Scenario DAT-039.S1: Text modes

- **Given** a text column with the values "Widget", "Gadget" and "widget pro"
- **When** the rule is startsWith "wid", then endsWith "GET", then notEquals "widget"
- **Then** the rows shown are "Widget" and "widget pro", then "Widget" and "Gadget", then "Gadget" and "widget pro"

#### Scenario DAT-039.S2: Numeric modes

- **Given** a numeric column with the values 5, 10 and 20 and one cell that is the text "n/a"
- **When** the rule is gte 10
- **Then** the rows with 10 and 20 are shown and the row with "n/a" is not

#### Scenario DAT-039.S3: Date modes compare days

- **Given** a date column holding 2026-03-09 23:30, 2026-03-10 08:00 and 2026-03-11 00:00
- **When** the rule is dateBefore 2026-03-11, then dateIs 2026-03-10
- **Then** the first two rows are shown, then only the second

#### Scenario DAT-039.S4: Offered modes

- **Given** a numeric column with `filterMatchModes` listing gt, lt and a text-only mode, and `filterMatchMode` gt
- **When** the user opens its filter menu
- **Then** the match mode select offers only gt and lt, with gt selected

## MODIFIED Requirements

### REQ DAT-004: Data table global filter

With `filterable`, a search box SHALL filter rows whose values match the text in any column (or only `globalFilterFields`) after `filterDelay` milliseconds (default 300) while the input reflects each keystroke immediately. `filter` SHALL emit the text and the filtered data once the debounce commits, and also when a column rule commits (DAT-038). `globalFilterValue` SHALL be two-way and the placeholder customizable. The global filter and the column rules SHALL combine: a row is shown only when it passes both.

#### Scenario DAT-004.S1: Debounce

- **Given** a filterable table
- **When** the user types and the delay has not yet elapsed
- **Then** the input shows the text but rows are not yet filtered

#### Scenario DAT-004.S2: Filter output on a column rule

- **Given** a filterable table with a `columnFilter` column and the global text "pro"
- **When** the user applies a column rule
- **Then** `filter` emits the text "pro" and the rows that pass both filters

### REQ DAT-007: Data table loading and lazy mode

With `loading` the table SHALL dim and overlay a spinner (label "Loading") while keeping existing rows. With `lazy`, the table SHALL NOT sort, filter (globally or by column) or slice `value` itself, SHALL treat it as the current page, SHALL use `totalRecords` for the paginator, and SHALL emit `lazyLoad` once on init and again on each page, sort, filter or column filter change, with the active `columnFilters` in the event. Without `lazy`, `lazyLoad` SHALL never emit.

#### Scenario DAT-007.S1: Lazy emission

- **Given** a lazy table
- **When** the user changes the page
- **Then** `lazyLoad` emits with the new request

#### Scenario DAT-007.S2: Lazy column filter

- **Given** a lazy table with a `columnFilter` column and three rows in `value`
- **When** the user applies a rule that would hide one of them
- **Then** all three rows are still shown
- **And** `lazyLoad` emits with that rule in `columnFilters`

### REQ DAT-009: Data table CSV export

`exportCSV()` SHALL download all rows that pass the global filter and every column rule as CSV with the header first, in the current sorted order, using `csvSeparator` and `exportFilename`, quoting values that contain the separator, a quote or a newline and doubling inner quotes. Only visible columns SHALL be exported. With `selectionOnly` it SHALL export only selected rows (only the header when none).

#### Scenario DAT-009.S1: Quoting

- **Given** a cell value containing a comma
- **When** the table is exported
- **Then** that value is enclosed in quotes in the CSV

#### Scenario DAT-009.S2: Filtered export

- **Given** a table with an active column rule that hides one of three rows
- **When** the table is exported
- **Then** the CSV holds the header and only the two rows that pass the rule

### REQ DAT-010: Data table grouping, reorder, resize, expansion and state

The data table SHALL, with `rowGroupMode="subheader"`, insert a subheader row per consecutive distinct `groupRowsBy` value spanning all visible columns, with that field as primary sort key, and SHALL let the user collapse those groups with `expandableRowGroups` (DAT-037). With `rowGroupMode="rowspan"` it SHALL merge the `groupRowsBy` column's cells vertically instead (DAT-036). With `reorderable`, it SHALL show a drag handle per row and emit `rowReorder` with indices into `value`, not display positions; dropping on the origin row SHALL do nothing. With `resizableColumns` it SHALL render column resize handles that behave per `columnResizeMode`; with `scrollable` it SHALL keep a sticky header. It SHALL render the `#rowexpansion` template for rows whose key is in `expandedRowKeys`. With `stateKey`, it SHALL persist sort state and the active column filters (DAT-038) to session or local storage per `stateStorage`, and SHALL restore them on init, including state stored before column filters existed.

#### Scenario DAT-010.S1: Reorder indices

- **Given** a sorted reorderable table
- **When** the user drags row 0 onto row 2
- **Then** `rowReorder` emits indices relative to `value`

#### Scenario DAT-010.S2: Column filters persist

- **Given** a table with a `stateKey` and a `columnFilter` column where the user applied a rule
- **When** a new table with the same `stateKey` is created
- **Then** its `columnFilters` holds that rule and its rows are filtered by it

#### Scenario DAT-010.S3: Older stored state

- **Given** stored state under a `stateKey` that has a sort but no column filters
- **When** a table with that `stateKey` is created
- **Then** the sort is restored and no column rule is active

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll). A demo SHALL NOT use an input, output or template the component does not implement.

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

#### Scenario DAT-024.S11: Column filter menu documented

- **Given** the page after this change
- **When** the column filter section is inspected
- **Then** it has prose, a working demo and a code block
- **And** applying a rule in the demo's filter menu reduces the rows shown
