# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-056: Data table persisted state

With `stateKey`, `med-data-table` SHALL save to the storage chosen by `stateStorage`, whenever one of them changes, the page offset, `sortField` and `sortOrder`, the expanded row keys and the column filter rules (DAT-010), and also the column order (DAT-034), the resized width of each column (DAT-031), whether each declared column is visible (DAT-032), the collapsed row groups (`expandedRowGroups`, DAT-037), the committed global filter text (`globalFilterValue`, DAT-004), `multiSortMeta` (DAT-003) and the page size chosen in the paginator (DAT-049). When the table restores the state on init it SHALL apply each saved field on its own: a field that is missing, or whose value has the wrong shape, SHALL keep the table's current value for that field and SHALL NOT stop the other fields from restoring, and stored text that is not valid JSON SHALL restore nothing and raise no error. Restoring SHALL skip every saved entry that names a field no declared column has: such a column in the saved order, width or visibility, a `multiSortMeta` entry, and a `sortField`. In the restored order, declared columns the saved order does not list SHALL follow the listed ones in declaration order. A width SHALL be restored only when it is a positive finite number of pixels, a page size only when it is a positive integer and, when `rowsPerPageOptions` is set, one of those options, and a `multiSortMeta` entry only when its order is `asc` or `desc`. A restored visibility SHALL set the column's `visible`, which SHALL be two-way on `med-table-column` so an application bound with `[(visible)]` receives it; an application that later writes `visible` SHALL override the restored value. The restored global filter text SHALL appear in the search box and filter the rows at once, without waiting for `filterDelay`. Restoring SHALL NOT emit `colReorder`, `colResize`, `sort`, `filter`, `pageChange`, `rowGroupExpand` or `rowGroupCollapse`; the two-way models it sets SHALL emit their change events.

#### Scenario DAT-056.S1: Extended state round trip

- **Given** a table with a `stateKey`, `resizableColumns`, `reorderableColumns`, `sortMode="multiple"`, `filterable`, a paginator with `rowsPerPageOptions` `[5, 10]`, `rowGroupMode="subheader"` with `expandableRowGroups`, and columns `name`, `team` and `price`
- **And** the user moved `price` to the first position, resized `name` to 180 pixels, hid `team`, collapsed the group `A`, committed the global filter text `ab`, sorted by `name` ascending and then `price` descending, and chose 5 rows per page
- **When** a new table with the same `stateKey` and the same columns is created
- **Then** its column order is `price`, `name`, `team`
- **And** the `name` header cell is 180 pixels wide
- **And** `team` is not rendered and its `visible` is `false`
- **And** `expandedRowGroups` holds `A`
- **And** the search box shows `ab` and only rows matching `ab` are shown
- **And** `multiSortMeta` is `name` ascending then `price` descending
- **And** each page shows 5 rows

#### Scenario DAT-056.S2: State saved by an older version

- **Given** stored state under a `stateKey` that holds only a page offset, `sortField` `name` with `sortOrder` `asc`, and no other field
- **When** a table with that `stateKey` is created
- **Then** the sort by `name` ascending and the page offset are restored
- **And** the columns keep their declaration order, declared widths and declared `visible` values
- **And** `expandedRowGroups`, `globalFilterValue` and `multiSortMeta` keep their initial values and the page size equals `rows`
- **And** no error is thrown

#### Scenario DAT-056.S3: Saved entries for removed columns are skipped

- **Given** stored state whose column order is `legacy`, `price`, `name`, whose widths and visibility include `legacy`, whose `multiSortMeta` is `legacy` ascending then `name` descending, and whose `sortField` is `legacy`
- **When** a table declaring only `name`, `team` and `price` is created with that `stateKey`
- **Then** its column order is `price`, `name`, `team`
- **And** `multiSortMeta` is `name` descending
- **And** `sortField` keeps its initial value
- **And** no error is thrown

#### Scenario DAT-056.S4: A malformed field does not block the others

- **Given** stored state whose `columnWidths` value is a string, whose page size is `-3`, and whose global filter text is `ab`
- **When** a table with that `stateKey` is created
- **Then** every column keeps its declared width
- **And** the page size equals `rows`
- **And** the search box shows `ab` and the rows are filtered by it

#### Scenario DAT-056.S5: Page size outside the options

- **Given** stored state with page size 50 under a `stateKey`
- **When** a table with that `stateKey` and `rowsPerPageOptions` `[5, 10]` is created
- **Then** the page size equals `rows`

#### Scenario DAT-056.S6: Restored visibility reaches the application

- **Given** stored state where the `team` column is hidden
- **When** a table with that `stateKey` is created whose `team` column binds `[(visible)]` to an application signal that starts `true`
- **Then** the application signal becomes `false` and `team` is not rendered
- **And** when the application sets the signal to `true`, `team` is rendered again and the stored state records it as visible

#### Scenario DAT-056.S7: A shown column declared hidden stays shown

- **Given** a table with a `stateKey` whose `notes` column is declared with `visible` `false`
- **And** the user made `notes` visible
- **When** a new table with the same `stateKey` and the same declaration is created
- **Then** `notes` is rendered

#### Scenario DAT-056.S8: Restoring emits no user events

- **Given** stored state holding a column order, a width, a `multiSortMeta`, a global filter text and a page size
- **When** a table with that `stateKey` is created
- **Then** `colReorder`, `colResize`, `sort`, `filter` and `pageChange` do not emit

#### Scenario DAT-056.S9: Unreadable stored text

- **Given** the text `{not json` stored under a `stateKey`
- **When** a table with that `stateKey` is created
- **Then** the table renders with its declared state and no error is thrown

## MODIFIED Requirements

### REQ DAT-010: Data table grouping, reorder, resize, expansion and state

The data table SHALL, with `rowGroupMode="subheader"`, insert a subheader row per consecutive distinct `groupRowsBy` value spanning all visible columns, with that field as primary sort key, and SHALL let the user collapse those groups with `expandableRowGroups` (DAT-037). With `rowGroupMode="rowspan"` it SHALL merge the `groupRowsBy` column's cells vertically instead (DAT-036). With `reorderable`, it SHALL show a drag handle per row and emit `rowReorder` with indices into `value`, not display positions; dropping on the origin row SHALL do nothing. With `resizableColumns` it SHALL render column resize handles that behave per `columnResizeMode`; with `scrollable` it SHALL keep a sticky header. It SHALL render the `#rowexpansion` template for rows whose key is in `expandedRowKeys`. With `stateKey`, it SHALL persist the page offset, sort state, expanded row keys and the active column filters (DAT-038) to session or local storage per `stateStorage`, together with the further fields DAT-056 lists, and SHALL restore them on init, including state stored before column filters existed.

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

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, cell selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, paginator position, page report and paginator options, vertical scroll with a sticky header, virtual scroll, lazy virtual scroll, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, conditional cell style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, caption/summary slots, custom empty template, skeleton loading, context menu integration, the responsive stacked layout, and column header and footer templates with custom column sorting). A demo SHALL NOT use an input, output or template the component does not implement.

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

#### Scenario DAT-024.S12: Slots, custom empty template and skeleton loading documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the caption/summary slots, custom empty template, and skeleton loading examples each have a section with prose, a working demo and a code block

#### Scenario DAT-024.S13: Cell selection, conditional cell style and context menu documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the cell selection, conditional cell style, and context menu integration examples each have a section with prose, a working demo and a code block

#### Scenario DAT-024.S14: Virtual scroll and lazy virtual scroll documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the virtual scroll and lazy virtual scroll examples each have a section with prose, a working demo and a code block
- **And** the virtual scroll demo holds at least 10,000 rows while rendering fewer than 100 body rows

#### Scenario DAT-024.S15: Paginator options documented

- **Given** the page after this change
- **When** its sections are listed
- **Then** the paginator options example has a section with prose, a working demo and a code block
- **And** its demo shows a paginator above and below the table with a custom page report

#### Scenario DAT-024.S16: Responsive stack layout documented

- **Given** the page after this change
- **When** the responsive stack example section is inspected
- **Then** it has prose, a working demo and a code block
- **And** its demo uses `responsiveLayout="stack"` and shows each cell with its column header as a label at a narrow viewport

#### Scenario DAT-024.S17: Column header and footer templates and custom sorting documented

- **Given** the page after this change
- **When** the column header and footer templates example section is inspected
- **Then** it has prose, a working demo and a code block
- **And** its demo uses a `#header` template, a column footer and a column with `sortBy` or `sortCompare`

#### Scenario DAT-024.S18: Extended persisted state documented

- **Given** the page after this change
- **When** the persisted state example section is inspected
- **Then** it has prose, a working demo and a code block
- **And** its demo uses a `stateKey` with column reorder, column resize, a column toggle bound with `[(visible)]`, the global filter and a paginator with `rowsPerPageOptions`
- **And** its prose lists every field the table persists
