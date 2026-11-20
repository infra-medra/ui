# Data Display

**Capability:** `data-display`
**ID prefix:** `DAT`
**Paths:** `projects/medra/ui/src/lib/data-table/**`, `projects/medra/ui/src/lib/data-view/**`, `projects/medra/ui/src/lib/tree/**`, `projects/medra/ui/src/lib/tree-table/**`, `projects/medra/ui/src/lib/virtual-scroller/**`, `projects/medra/ui/src/lib/timeline/**`, `projects/medra/ui/src/lib/organization-chart/**`, `projects/medra/ui/src/lib/chart/**`, `projects/medra/ui/src/lib/scroll-panel/**`

## Purpose

Lets applications present collections and hierarchies of data: tables, card lists, trees, tree tables, long virtualized lists, timelines, organization charts, charts and scrollable regions. The components provide sorting, filtering, paging, selection and keyboard navigation where applicable.

## Requirements

### REQ DAT-001: Data table rendering

`med-data-table` SHALL render one header cell per `med-table-column` and one row per item in `value`, showing `row[field]` by default or a custom cell template when provided. When there is nothing to show it SHALL render the empty label (default "No results found") in a single cell spanning all columns. The table SHALL carry `ariaLabel` when provided.

#### Scenario DAT-001.S1: Empty state

- **Given** a data table with an empty `value`
- **When** it renders
- **Then** the empty label is shown in one cell spanning all columns

### REQ DAT-002: Data table single-column sorting

Clicking a sortable header SHALL cycle ascending, descending, then unsorted. Switching to another column SHALL start that column at ascending. Non-sortable headers SHALL ignore clicks. Sortable headers SHALL be Tab stops and respond to Enter and Space like a click; non-sortable headers SHALL NOT be Tab stops and ignore Space. `sortField` and `sortOrder` SHALL be two-way, and `sort` SHALL emit the resulting metadata and sorted data.

#### Scenario DAT-002.S1: Three-state cycle

- **Given** an unsorted table with a sortable column
- **When** the user clicks its header three times
- **Then** the order goes ascending, descending, then unsorted

#### Scenario DAT-002.S2: Keyboard

- **Given** a focused sortable header
- **When** the user presses Space
- **Then** the sort cycles as for a click

### REQ DAT-003: Data table multi-column sorting

With `sortMode="multiple"`, a plain click SHALL replace the sort with just that column, Shift+click SHALL add the column keeping the others (or cycle its order in place and remove it once it returns to none), ties SHALL be broken by later keys, and a 1-based priority badge SHALL appear next to each active sorted column. `sort` SHALL emit the multi-sort metadata and data.

#### Scenario DAT-003.S1: Shift adds

- **Given** a table sorted by column A in multiple mode
- **When** the user Shift+clicks column B
- **Then** the data is sorted by A then B and both show priority badges

### REQ DAT-004: Data table global filter

With `filterable`, a search box SHALL filter rows whose values match the text in any column (or only `globalFilterFields`) after `filterDelay` milliseconds (default 300) while the input reflects each keystroke immediately. `filter` SHALL emit the text and the filtered data once the debounce commits. `globalFilterValue` SHALL be two-way and the placeholder customizable.

#### Scenario DAT-004.S1: Debounce

- **Given** a filterable table
- **When** the user types and the delay has not yet elapsed
- **Then** the input shows the text but rows are not yet filtered

### REQ DAT-005: Data table pagination

With `paginator`, the table SHALL show only the current page of rows (`rows`, default 10, with `first` two-way) using an embedded paginator, and SHALL forward `rowsPerPageOptions` to it.

#### Scenario DAT-005.S1: Page slice

- **Given** 25 rows, 10 per page and `first` of 10
- **When** the table renders
- **Then** rows 11 to 20 are shown

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

With `loading` the table SHALL dim and overlay a spinner (label "Loading") while keeping existing rows. With `lazy`, the table SHALL NOT sort, filter or slice `value` itself, SHALL treat it as the current page, SHALL use `totalRecords` for the paginator, and SHALL emit `lazyLoad` once on init and again on each page, sort or filter change. Without `lazy`, `lazyLoad` SHALL never emit.

#### Scenario DAT-007.S1: Lazy emission

- **Given** a lazy table
- **When** the user changes the page
- **Then** `lazyLoad` emits with the new request

### REQ DAT-008: Data table cell editing

With `editMode="cell"`, double-clicking an editable column cell SHALL show its edit template bound to the row; a plain click SHALL NOT. Enter SHALL commit by emitting `editComplete` with row, field and value and leave edit mode; Escape SHALL cancel via `editCancel` without committing. Only one cell SHALL be in edit mode at a time, non-editable columns SHALL ignore double-clicks, and nothing SHALL happen when `editMode` is unset.

#### Scenario DAT-008.S1: Commit

- **Given** a cell in edit mode
- **When** the user presses Enter
- **Then** `editComplete` emits and the cell leaves edit mode

### REQ DAT-009: Data table CSV export

`exportCSV()` SHALL download all rows as CSV with the header first, in the current sorted order, using `csvSeparator` and `exportFilename`, quoting values that contain the separator, a quote or a newline and doubling inner quotes. With `selectionOnly` it SHALL export only selected rows (only the header when none).

#### Scenario DAT-009.S1: Quoting

- **Given** a cell value containing a comma
- **When** the table is exported
- **Then** that value is enclosed in quotes in the CSV

### REQ DAT-010: Data table grouping, reorder, resize, expansion and state

The data table SHALL, with `rowGroupMode="subheader"`, insert a subheader row per consecutive distinct `groupRowsBy` value spanning all columns, with that field as primary sort key. With `reorderable`, it SHALL show a drag handle per row and emit `rowReorder` with indices into `value`, not display positions; dropping on the origin row SHALL do nothing. With `resizableColumns` it SHALL render column resize handles; with `scrollable` it SHALL keep a sticky header. It SHALL render the `#rowexpansion` template for rows whose key is in `expandedRowKeys`. With `stateKey`, it SHALL persist sort state to session or local storage per `stateStorage`.

#### Scenario DAT-010.S1: Reorder indices

- **Given** a sorted reorderable table
- **When** the user drags row 0 onto row 2
- **Then** `rowReorder` emits indices relative to `value`

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

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows and row keyboard navigation). A demo SHALL NOT use an input, output or template the component does not implement.

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

When `selectionMode` is `single` or `radio`, ArrowDown and ArrowUp on a focused row SHALL move focus to the next and previous row of the current page, Home SHALL move it to the first row and End to the last row. Moving focus SHALL NOT change the selection. Focus SHALL stay on the row at either end of the page, without wrapping. In `multiple` mode or without a selection mode these keys SHALL NOT be handled by the table.

#### Scenario DAT-026.S1: Arrow movement

- **Given** a table in `single` mode with focus on the second row
- **When** the user presses ArrowDown
- **Then** focus moves to the third row
- **And** the selection is unchanged

#### Scenario DAT-026.S2: Home and End

- **Given** a table in `radio` mode with focus on a middle row
- **When** the user presses Home, then End
- **Then** focus moves to the first row, then to the last row of the page

#### Scenario DAT-026.S3: Edges and other modes

- **Given** a focused first row in `single` mode
- **When** the user presses ArrowUp
- **Then** focus stays on the first row
- **And** in `multiple` mode the key presses are not handled by the table
