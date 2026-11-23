# Data Display

**Capability:** `data-display`
**ID prefix:** `DAT`
**Paths:** `projects/medra/ui/src/lib/data-table/**`, `projects/medra/ui/src/lib/data-view/**`, `projects/medra/ui/src/lib/tree/**`, `projects/medra/ui/src/lib/tree-table/**`, `projects/medra/ui/src/lib/virtual-scroller/**`, `projects/medra/ui/src/lib/timeline/**`, `projects/medra/ui/src/lib/organization-chart/**`, `projects/medra/ui/src/lib/chart/**`, `projects/medra/ui/src/lib/scroll-panel/**`

## Purpose

Lets applications present collections and hierarchies of data: tables, card lists, trees, tree tables, long virtualized lists, timelines, organization charts, charts and scrollable regions. The components provide sorting, filtering, paging, selection and keyboard navigation where applicable.

## Requirements

### REQ DAT-001: Data table rendering

`med-data-table` SHALL render one header cell per visible `med-table-column` and one row per item in `value`, showing `row[field]` by default or a custom cell template when provided. When there is nothing to show it SHALL render the empty label (default "No results found") in a single cell spanning all visible columns. The table SHALL carry `ariaLabel` when provided.

#### Scenario DAT-001.S1: Empty state

- **Given** a data table with an empty `value`
- **When** it renders
- **Then** the empty label is shown in one cell spanning all columns

### REQ DAT-002: Data table single-column sorting

Clicking a sortable header SHALL cycle ascending, descending, then unsorted, unless `removableSort` is `false` (default `true`), in which case it SHALL only alternate between ascending and descending once the column is sorted. Switching to another column SHALL start that column at ascending. Non-sortable headers SHALL ignore clicks. Sortable headers SHALL be Tab stops and respond to Enter and Space like a click; non-sortable headers SHALL NOT be Tab stops and ignore Space. The table SHALL render sorted from the initial `sortField` and `sortOrder`. `sortField` and `sortOrder` SHALL be two-way, and `sort` SHALL emit the resulting metadata and sorted data.

#### Scenario DAT-002.S1: Three-state cycle

- **Given** an unsorted table with a sortable column
- **When** the user clicks its header three times
- **Then** the order goes ascending, descending, then unsorted

#### Scenario DAT-002.S2: Keyboard

- **Given** a focused sortable header
- **When** the user presses Space
- **Then** the sort cycles as for a click

#### Scenario DAT-002.S3: Presort

- **Given** a table whose `sortField` is `price` and `sortOrder` is `desc` from the first render
- **When** the table renders
- **Then** the rows are in descending price order
- **And** the price header reports a descending sort

#### Scenario DAT-002.S4: Sort that cannot be removed

- **Given** a table with `removableSort` set to `false` and an unsorted sortable column
- **When** the user clicks its header three times
- **Then** the order goes ascending, descending, then ascending again
- **And** the table is never unsorted

### REQ DAT-003: Data table multi-column sorting

With `sortMode="multiple"`, a plain click SHALL replace the sort with just that column, Shift+click SHALL add the column keeping the others (or cycle its order in place and remove it once it returns to none), ties SHALL be broken by later keys, and a 1-based priority badge SHALL appear next to each active sorted column. `sort` SHALL emit the multi-sort metadata and data.

#### Scenario DAT-003.S1: Shift adds

- **Given** a table sorted by column A in multiple mode
- **When** the user Shift+clicks column B
- **Then** the data is sorted by A then B and both show priority badges

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

### REQ DAT-005: Data table pagination

With `paginator`, the table SHALL show only the current page of rows (`rows`, default 10, with `first` two-way) using an embedded paginator, and SHALL forward `rowsPerPageOptions` to it. Setting `first` from outside SHALL show the page that contains it, and a page change by the user SHALL write the new `first` back. Choosing a size in the paginator's rows per page select SHALL change the number of visible rows and return to the first page.

#### Scenario DAT-005.S1: Page slice

- **Given** 25 rows, 10 per page and `first` of 10
- **When** the table renders
- **Then** rows 11 to 20 are shown

#### Scenario DAT-005.S2: Page set from code

- **Given** 25 rows, 10 per page and a bound `first` of 0
- **When** the host sets `first` to 20
- **Then** rows 21 to 25 are shown
- **And** the third page is the current page in the paginator

#### Scenario DAT-005.S3: Page change written back

- **Given** 25 rows, 10 per page and a two-way bound `first` of 0
- **When** the user goes to the second page
- **Then** the bound `first` is 10

#### Scenario DAT-005.S4: Rows per page

- **Given** 25 rows on the third page with 10 per page and `rowsPerPageOptions` of 10 and 20
- **When** the user chooses 20
- **Then** 20 rows are shown
- **And** the first page is the current page

### REQ DAT-006: Data table selection

With `selectionMode="single"`, clicking a row, or pressing Enter or Space on a focused row, SHALL select it with `aria-selected`; selecting an already-selected row SHALL be a no-op. With `selectionMode="radio"`, the table SHALL behave as in `single` mode and SHALL also render a radio button in each row that reflects whether the row is selected, selecting the row when chosen and not selecting it twice when the radio is the click target; it SHALL render no select-all control. With `selectionMode="multiple"`, each row SHALL have a checkbox toggling it in the `selection` array and a header checkbox SHALL select or deselect all rows, showing an indeterminate (dash) state for partial selection and a check for full selection; clicking a row checkbox SHALL NOT also trigger row-level single selection. With no selection mode, no selection UI and no row tabindex SHALL be rendered. `rowSelect` and `rowUnselect` SHALL emit on changes. With `dataKey`, selected rows SHALL match by key across different object references; without it, by reference.

#### Scenario DAT-006.S1: Select all

- **Given** a table in multiple mode
- **When** the user checks the header checkbox
- **Then** every row is selected

#### Scenario DAT-006.S2: Key matching

- **Given** `dataKey` set and a selection holding a different reference with the same key
- **When** the table renders
- **Then** that row is shown as selected

#### Scenario DAT-006.S3: Radio selection

- **Given** a table in `radio` mode
- **When** the user chooses the radio button of a row
- **Then** that row is selected and its radio is checked
- **And** no other row's radio is checked, and `rowSelect` emits once

### REQ DAT-007: Data table loading and lazy mode

With `loading` in the default spinner mode, the table SHALL dim and overlay a spinner (label "Loading") while keeping existing rows; skeleton loading behavior is defined in DAT-042. With `lazy`, the table SHALL NOT sort, filter (globally or by column) or slice `value` itself, SHALL treat it as the current page, SHALL use `totalRecords` for the paginator, and SHALL emit `lazyLoad` once on init and again on each page, sort, filter or column filter change, with the active `columnFilters` in the event. Without `lazy`, `lazyLoad` SHALL never emit.

#### Scenario DAT-007.S1: Lazy emission

- **Given** a lazy table
- **When** the user changes the page
- **Then** `lazyLoad` emits with the new request

#### Scenario DAT-007.S2: Lazy column filter

- **Given** a lazy table with a `columnFilter` column and three rows in `value`
- **When** the user applies a rule that would hide one of them
- **Then** all three rows are still shown
- **And** `lazyLoad` emits with that rule in `columnFilters`

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

### REQ DAT-011: Data view

`med-data-view` SHALL render one projected item per entry in `value` in order, using grid classes when `layout` is `grid` and list otherwise, and the empty label (customizable, or a `#empty` template) when empty. A `sortComparator` SHALL reorder items without mutating the source and SHALL apply before pagination; a null comparator SHALL keep the given order. `#header` and `#footer` templates SHALL be rendered around the list bound to `value`. A search box SHALL appear only when `filterPredicate` is set and SHALL narrow the items as the user types.

#### Scenario DAT-011.S1: Sort before page

- **Given** a data view with a comparator and paginator on page 2
- **When** it renders
- **Then** page 2 reflects the sorted order

### REQ DAT-012: Data view paging, loading and lazy mode

With `paginator`, the data view SHALL show only `rows` items per page with an embedded paginator (`rowsPerPageOptions` forwarded, `first` two-way, `pageChange` emitted) and SHALL hide the paginator for an empty dataset. With `loading` it SHALL replace the list with a loading row. With `lazy` it SHALL NOT slice `value`, SHALL use `totalRecords` for the paginator, SHALL emit `lazyLoad` on init (unless `lazyLoadOnInit` is false) and when `first` changes, and SHALL NOT emit when not lazy.

#### Scenario DAT-012.S1: Lazy init skipped

- **Given** a lazy data view with `lazyLoadOnInit` false
- **When** it initializes
- **Then** no `lazyLoad` event is emitted

### REQ DAT-013: Tree structure and expansion

`med-tree` SHALL render expanded nodes with nested children, SHALL hide descendants when a node collapses while keeping the node, and SHALL show an expand/collapse button only on nodes with children. The root list SHALL be `role="tree"` with nested `role="group"`. Nodes SHALL be `role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, and parents SHALL expose `aria-expanded` on the row (leaves SHALL NOT). Per-node templates, selected by node type with an untyped fallback, SHALL customize content; without any template a plain icon and label SHALL render.

#### Scenario DAT-013.S1: Collapse

- **Given** an expanded parent node
- **When** the user collapses it
- **Then** its descendants are hidden and the parent remains

### REQ DAT-014: Tree selection

With `selectionMode` null the tree SHALL render no interactive selection controls. In single mode, clicking a selectable node, or pressing Enter, SHALL select it; clicking the selected node again SHALL be a no-op and nodes with `selectable: false` SHALL NOT be selectable. In multiple mode nodes toggle in and out of the selection array. In checkbox mode it SHALL behave like multiple with `aria-checked` and a visibly filled checkbox, and SHALL propagate selection to descendants and up to parents unless `propagateSelectionDown` or `propagateSelectionUp` is disabled.

#### Scenario DAT-014.S1: Propagation

- **Given** a checkbox tree with propagation enabled
- **When** the user checks a parent
- **Then** its descendants are checked

### REQ DAT-015: Tree keyboard, filter, virtual scroll and drag

The tree SHALL support ArrowDown/ArrowUp across visible rows, ArrowRight to expand a collapsed parent (or step into its first child when expanded), ArrowLeft to collapse an expanded parent (or move to the parent from a leaf or collapsed node), and Home/End. With `filterable` it SHALL show a search box; typing SHALL keep matches and their ancestors visible and hide the rest, force-expanding collapsed ancestors temporarily and restoring the real state when cleared, with `aria-posinset`/`aria-setsize` counting only visible siblings. With `virtualScroll` it SHALL render a virtual-scroll `role="tree"` viewport. With `draggableNodes`/`droppableNodes` it SHALL mark nodes draggable and emit `nodeDrop`.

#### Scenario DAT-015.S1: Filter ancestors

- **Given** a filter text matching a deep node
- **When** the user types it
- **Then** the matching node and its ancestors are visible and other nodes are hidden

### REQ DAT-016: Tree table

`med-tree-table` SHALL flatten a tree into one row per node in document order, expanded by default, with an expand/collapse toggle (with `aria-expanded` and a swapped label) only on rows with children, and deeper rows indented further. Collapsing SHALL hide descendants and re-expanding SHALL restore them. It SHALL show the empty label across all columns when empty and carry `ariaLabel`. Rows SHALL have `aria-level`, `aria-posinset`, `aria-setsize` and `aria-expanded` on parents, a roving tabindex starting at the first row, ArrowUp/ArrowDown, Home/End, ArrowRight (expand or step into first child) and ArrowLeft (collapse, or move to parent from a leaf). It SHALL support single selection, column sorting and pagination.

#### Scenario DAT-016.S1: Treegrid navigation

- **Given** a tree table with the first row focused
- **When** the user presses ArrowDown
- **Then** focus and the tab stop move to the next visible row

### REQ DAT-017: Tree table resize, editing, frozen columns and virtual scroll

With `columnResizable`, each header cell SHALL have a drag handle that resizes only its column, never below a minimum width. With `editMode="cell"`, double-clicking an editable cell SHALL show its edit template, save SHALL emit `editComplete` (node, field, value), cancel SHALL emit `editCancel`, and the expand toggle SHALL remain on an editable first column. Left- or right-frozen columns SHALL be sticky at offset 0 in header and body (also in virtual-scroll mode), and any frozen column SHALL force a fixed table layout. With `virtualScroll` it SHALL render a virtual-scroll viewport instead of a real table while keeping the header row.

#### Scenario DAT-017.S1: Frozen column

- **Given** a left-frozen first column
- **When** the table renders
- **Then** header and body cells of that column are sticky at left 0

### REQ DAT-018: Virtual scroller

`med-virtual-scroller` SHALL render only a viewport of rows sized by the consumer class (not by content) with `itemSize` (default 40) fixed row height, and SHALL handle thousands of items without rendering one DOM row per item. It SHALL emit `lazyLoad` with the rendered range once when the item count is within `lazyLoadThreshold` of the rendered range, not for the same count again, and again after items grow past the threshold. `scrollIndexChange` SHALL emit `{first, last}` on the rendered range independently of the threshold. `scrollToIndex()` SHALL scroll to an item, optionally with a behavior. `loading` SHALL render a trailing spinner row; `orientation` `horizontal` SHALL scroll horizontally.

#### Scenario DAT-018.S1: Lazy only once per length

- **Given** a scroller whose item count is within the threshold
- **When** change detection runs repeatedly without the count changing
- **Then** `lazyLoad` is emitted only once

### REQ DAT-019: Timeline

`med-timeline` SHALL render one list item per event in `value` with projected content, a marker for each (default dot, or a `#marker` template), and a connector between events but not after the last. It SHALL render nothing for an empty value. An `#opposite` template SHALL render in its own column before the marker bound to the event and be absent otherwise. `layout` SHALL support vertical (default) and horizontal, and `align` SHALL support left, right and alternate.

#### Scenario DAT-019.S1: Connectors

- **Given** a timeline of three events
- **When** it renders
- **Then** there are three markers and two connectors

### REQ DAT-020: Organization chart

`med-organization-chart` SHALL render the root and expanded descendants of `value` and nothing when `value` is null. Parents SHALL have a toggle (labels "Expand"/"Collapse" customizable) that hides or shows descendants while keeping the node, and SHALL emit `nodeExpand`/`nodeCollapse`; leaves SHALL have none. With no `selectionMode` no interactive buttons SHALL render. In single mode clicking or pressing Enter SHALL select a selectable node, re-selecting SHALL be a no-op and `selectable: false` nodes SHALL NOT select. In multiple mode nodes toggle in the selection array. Checkbox mode SHALL cascade downward to selectable descendants and upward to parents (leaving partially checked parents indeterminate), skipping `selectable: false` branches.

#### Scenario DAT-020.S1: Cascade up

- **Given** a checkbox chart where all but one child of a parent are checked
- **When** the user checks the last child
- **Then** the parent becomes checked

### REQ DAT-021: Organization chart keyboard

In the organization chart ArrowDown SHALL move focus from a node to its first child (or expand a collapsed node, emitting `nodeExpand`), ArrowUp SHALL move to the parent (no-op at the root), ArrowLeft/ArrowRight SHALL move between selectable siblings, and Home/End SHALL jump to the first/last selectable sibling. Siblings with `selectable: false` SHALL be skipped.

#### Scenario DAT-021.S1: Skip unselectable

- **Given** a sibling with `selectable: false` between two selectable nodes
- **When** the user presses ArrowRight on the first
- **Then** focus lands on the third node

### REQ DAT-022: Chart

`med-chart` SHALL render a canvas and draw a chart of `type` (default `bar`) from `data`, `options` and `plugins` using Chart.js, with `width`, `height`, `responsive`, `ariaLabel`, `ariaLabelledBy` and a style class. It SHALL emit `onDataSelect` when the user selects a data point and SHALL expose `refresh`, `reinit` and `getBase64Image`. It SHALL NOT instantiate Chart.js during server-side rendering, and SHALL degrade without error when the Chart.js package is not installed.

#### Scenario DAT-022.S1: Missing library

- **Given** Chart.js is not installed
- **When** the chart renders
- **Then** no error is thrown and no chart is drawn

### REQ DAT-023: Scroll panel

`med-scroll-panel` SHALL be a keyboard-focusable scrollable viewport (the host itself) projecting its content, with `aria-label` only when provided and a consumer `class` merged onto the host. `scrollTop(value)` SHALL scroll to the offset, clamping to the range between 0 and the maximum scrollable offset, and `refresh()` SHALL re-clamp the offset when content shrinks.

#### Scenario DAT-023.S1: Overshoot clamp

- **Given** a scroll panel with content taller than the viewport
- **When** `scrollTop` is called with a value beyond the maximum
- **Then** the offset is set to the maximum scrollable offset

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, plus caption/summary slots, custom empty template, and skeleton loading). A demo SHALL NOT use an input, output or template the component does not implement.

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

### REQ DAT-025: Data table appearance

`med-data-table` SHALL accept `size` (`sm`, `default` default, `lg`), which SHALL change the cell padding and text size, `showGridlines` (default false), which SHALL draw borders between cells, and `stripedRows` (default false), which SHALL give alternate body rows a different background. The three inputs SHALL be independent of each other and of the selection mode.

#### Scenario DAT-025.S1: Size

- **Given** a table with `size` `lg`
- **When** it renders
- **Then** its cells have more padding than a table with `size` `sm`

#### Scenario DAT-025.S2: Grid lines

- **Given** a table with `showGridlines`
- **When** it renders
- **Then** each body cell has a visible border on its sides
- **And** a table without `showGridlines` has none

#### Scenario DAT-025.S3: Striped rows

- **Given** a table with `stripedRows` and at least two body rows
- **When** it renders
- **Then** the first and second rows have different background colors

### REQ DAT-026: Data table row keyboard navigation

When `selectionMode` is `single`, `radio` or `multiple`, body rows SHALL be focusable, and ArrowDown and ArrowUp on a focused row SHALL move focus to the next and previous row of the current page, Home SHALL move it to the first row and End to the last row. Moving focus SHALL NOT change the selection. Focus SHALL stay on the row at either end of the page, without wrapping. In `multiple` mode, Space and Enter on a focused row SHALL toggle that row in the selection. Without a selection mode these keys SHALL NOT be handled by the table.

#### Scenario DAT-026.S1: Arrow movement

- **Given** a table in `single` mode with focus on the second row
- **When** the user presses ArrowDown
- **Then** focus moves to the third row
- **And** the selection is unchanged

#### Scenario DAT-026.S2: Home and End

- **Given** a table in `radio` mode with focus on a middle row
- **When** the user presses Home, then End
- **Then** focus moves to the first row, then to the last row of the page

#### Scenario DAT-026.S3: Edges and no selection mode

- **Given** a focused first row in `single` mode
- **When** the user presses ArrowUp
- **Then** focus stays on the first row
- **And** in a table without a selection mode the key presses are not handled by the table

#### Scenario DAT-026.S4: Movement in multiple mode

- **Given** a table in `multiple` mode with two rows selected and focus on the second row
- **When** the user presses ArrowDown, then End, then Home
- **Then** focus moves to the third row, then to the last row of the page, then to the first row
- **And** the same two rows stay selected

#### Scenario DAT-026.S5: Toggling a row by key in multiple mode

- **Given** a table in `multiple` mode with focus on an unselected row
- **When** the user presses Space
- **Then** that row is added to the selection
- **And** pressing Enter on it removes it from the selection again

### REQ DAT-027: Data table row identity and row labels

With `rowAriaLabel` set, the table SHALL give the selection checkbox and the selection radio of each row the accessible name that the function returns for that row; without it, the name SHALL be "Select row". With `rowTrackBy` set, the table SHALL identify each row by the value the function returns for it, so a row keeps its rendered element when `value` is replaced by new objects that return the same identity; by default a row is identified by its index. When `dataKey` is not set or a row has no value for it, the row expansion key SHALL be that identity as text.

#### Scenario DAT-027.S1: Row label names the selection control

- **Given** a table in multiple mode whose `rowAriaLabel` returns "Select " followed by the row's name
- **When** the table renders
- **Then** the checkbox of each row has the accessible name "Select " followed by that row's name

#### Scenario DAT-027.S2: Default row label

- **Given** a table in multiple mode, or in radio mode, with no `rowAriaLabel`
- **When** the table renders
- **Then** every row checkbox or radio has the accessible name "Select row"

#### Scenario DAT-027.S3: Radio row label

- **Given** a table in radio mode whose `rowAriaLabel` returns "Select " followed by the row's name
- **When** the table renders
- **Then** the radio of each row has the accessible name "Select " followed by that row's name

#### Scenario DAT-027.S4: Row keeps its element across a refresh

- **Given** a table whose `rowTrackBy` returns the row's `id`, rendered with rows 1, 2 and 3
- **When** `value` is replaced by new objects with ids 3, 2 and 1
- **Then** each row is shown in the new order
- **And** the element rendered for id 2 is the same element as before the replacement

#### Scenario DAT-027.S5: Expansion follows the identity

- **Given** a table with no `dataKey`, whose `rowTrackBy` returns the row's `id`, and `expandedRowKeys` holding the key "2"
- **When** the table renders with the rows in any order
- **Then** the row with id 2 is expanded
- **And** no other row is expanded

### REQ DAT-028: Data table frozen columns

In `med-data-table`, a `med-table-column` with `frozen` SHALL stay in view while the table wrapper scrolls horizontally, in the header and in every body row. `alignFrozen` SHALL pick the left edge (default) or the right edge. Several frozen columns on the same edge SHALL stack in column order, each offset by the widths of the frozen columns before it on that edge, using the column's `width` or, when it has none, a 60px minimum. A frozen cell SHALL have an opaque background so that scrolled content does not show through. Any frozen column SHALL make the table use a fixed layout, so declared widths hold. When at least one column is frozen on the left, the reorder handle, selection and radio columns SHALL be frozen on the left as well, ahead of the frozen data columns, and each frozen data column's offset SHALL include their widths. The row expansion row spans the full table width and SHALL NOT be sticky.

#### Scenario DAT-028.S1: Left frozen column stays in view

- **Given** a table wider than its wrapper with its first column `frozen` and 120px wide
- **When** the wrapper is scrolled horizontally to the right
- **Then** the first column's header and body cells stay at the left edge of the wrapper
- **And** the other columns scroll away

#### Scenario DAT-028.S2: Right frozen column

- **Given** a table wider than its wrapper with its last column `frozen` and `alignFrozen` set to `right`
- **When** the wrapper is scrolled horizontally to the left
- **Then** the last column's header and body cells stay at the right edge of the wrapper

#### Scenario DAT-028.S3: Several frozen columns stack

- **Given** a table whose first two columns are `frozen`, the first 120px wide and the second 100px wide
- **When** the table renders
- **Then** the first frozen column sticks at offset 0
- **And** the second frozen column sticks at offset 120px

#### Scenario DAT-028.S4: Fixed layout and opaque cells

- **Given** a table with a `frozen` column
- **When** the table renders
- **Then** the table uses a fixed layout
- **And** each frozen cell has an opaque background

#### Scenario DAT-028.S5: Utility columns freeze with a left frozen column

- **Given** a table with `selectionMode="multiple"` and a `frozen` first data column
- **When** the table renders
- **Then** the selection checkbox column is sticky at offset 0
- **And** the frozen data column's offset equals the width of the selection column

#### Scenario DAT-028.S6: Utility columns scroll without a left frozen column

- **Given** a table with `selectionMode="multiple"` and only a right-frozen data column
- **When** the table renders
- **Then** the selection checkbox column is not sticky

### REQ DAT-029: Data table frozen rows

`med-data-table` SHALL render the rows in `frozenValue` using the same column templates: directly under the header, before the rows from `value`, when `frozenRowsPosition` is `top` (default), or after the rows from `value` when it is `bottom`. Frozen rows SHALL ignore sorting, the global filter and pagination, SHALL NOT take part in selection, and SHALL stay in view while a `scrollable` table scrolls vertically: below the sticky header for `top`, at the bottom edge of the wrapper for `bottom`. When `frozenValue` is empty or not set, no frozen row SHALL be rendered.

#### Scenario DAT-029.S1: Frozen rows render first

- **Given** a table with three rows in `value` and one row in `frozenValue`
- **When** the table renders
- **Then** the frozen row is the first body row
- **And** the three rows from `value` follow it

#### Scenario DAT-029.S2: Frozen rows ignore sort, filter and paging

- **Given** a table with `frozenValue`, `paginator` with two rows per page, a sorted column and a global filter
- **When** the user sorts, filters and changes page
- **Then** the frozen rows keep their order and stay visible on every page

#### Scenario DAT-029.S3: Top frozen rows stay in view while scrolling

- **Given** a `scrollable` table with `frozenValue` and more rows than fit in `scrollHeight`
- **When** the wrapper is scrolled vertically
- **Then** the frozen rows stay directly under the header

#### Scenario DAT-029.S4: Frozen rows are not selectable

- **Given** a table with `selectionMode="single"` and `frozenValue`
- **When** the user clicks a frozen row
- **Then** no row is selected
- **And** `rowSelect` does not emit

#### Scenario DAT-029.S5: Bottom frozen rows

- **Given** a table with three rows in `value`, one row in `frozenValue` and `frozenRowsPosition` set to `bottom`
- **When** the table renders
- **Then** the frozen row is the last body row

#### Scenario DAT-029.S6: Bottom frozen rows stay in view while scrolling

- **Given** a `scrollable` table with `frozenValue`, `frozenRowsPosition` set to `bottom` and more rows than fit in `scrollHeight`
- **When** the wrapper is scrolled vertically to the top
- **Then** the frozen rows stay at the bottom edge of the wrapper

### REQ DAT-030: Data table horizontal and flexible scroll

A `med-data-table` wider than its container SHALL scroll horizontally inside its wrapper, without scrolling the page. With `scrollable`, `scrollHeight` SHALL accept a CSS length as a maximum height, or the value `flex`; with `flex` the wrapper SHALL fill the height of its parent and scroll vertically inside it, with the header kept sticky.

#### Scenario DAT-030.S1: Wide table scrolls inside the wrapper

- **Given** a table whose columns are wider together than its container
- **When** the table renders
- **Then** the wrapper scrolls horizontally
- **And** the page itself does not scroll horizontally

#### Scenario DAT-030.S2: Flexible height fills the parent

- **Given** a `scrollable` table with `scrollHeight="flex"` inside a parent with a fixed height and more rows than fit
- **When** the table renders
- **Then** the wrapper is as tall as its parent
- **And** the wrapper scrolls vertically with the header kept sticky

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

### REQ DAT-040: Data table caption and summary slots

`med-data-table` SHALL accept optional `caption` and `summary` projected templates. When provided, `caption` SHALL render above the table header inside the table container, and `summary` SHALL render below the table body/footer and above the paginator. When omitted, neither region SHALL render.

#### Scenario DAT-040.S1: Caption and summary rendered

- **Given** a data table with both `#caption` and `#summary` templates
- **When** the table renders
- **Then** the caption content appears above the table header
- **And** the summary content appears below the table and before any paginator

#### Scenario DAT-040.S2: Omitted slots render nothing

- **Given** a data table without `#caption` or `#summary` templates
- **When** the table renders
- **Then** no extra caption or summary wrapper elements are rendered

### REQ DAT-041: Data table custom empty template

`med-data-table` SHALL accept an optional `#empty` template. When the table has zero visible rows and `loading` is false, the table SHALL render the `#empty` template inside the empty-state cell spanning all visible columns instead of `emptyLabel`. When `#empty` is omitted, `emptyLabel` SHALL continue to render.

#### Scenario DAT-041.S1: Custom empty template shown

- **Given** a data table with an empty `value` array, `loading` false, and a custom empty template
- **When** the table renders
- **Then** the custom empty template is rendered inside the empty-state row
- **And** the default `emptyLabel` text is not shown

#### Scenario DAT-041.S2: Fallback to emptyLabel

- **Given** a data table with an empty `value` array, `loading` false, and no custom empty template
- **When** the table renders
- **Then** `emptyLabel` is rendered

### REQ DAT-042: Data table skeleton loading

`med-data-table` SHALL accept `loadingMode` (`'spinner' | 'skeleton'`, default `'spinner'`). When `loading` is true and `loadingMode` is `'skeleton'`, the table SHALL render placeholder skeleton cells across every visible column instead of the spinner overlay, preserving the table header, with the row count matching `rows` when `paginator` is enabled or 5 rows otherwise. When `loading` returns to false, normal data rows (or the empty state) SHALL render.

#### Scenario DAT-042.S1: Skeleton rows rendered while loading

- **Given** a data table configured for skeleton loading with `loading` true and three visible columns
- **When** the table renders
- **Then** skeleton placeholder cells are rendered for each visible column
- **And** the spinner overlay is not shown

#### Scenario DAT-042.S2: Data rows restored after loading

- **Given** a data table in skeleton loading state with rows in `value`
- **When** `loading` becomes false
- **Then** the skeleton placeholders are removed and the data rows are rendered
