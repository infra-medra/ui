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

With `filterable`, a search box SHALL filter rows whose values match the text in any column (or only `globalFilterFields`) after `filterDelay` milliseconds (default 300) while the input reflects each keystroke immediately. `filter` SHALL emit the text and the filtered data once the debounce commits. `globalFilterValue` SHALL be two-way and the placeholder customizable.

#### Scenario DAT-004.S1: Debounce

- **Given** a filterable table
- **When** the user types and the delay has not yet elapsed
- **Then** the input shows the text but rows are not yet filtered

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
