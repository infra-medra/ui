# Data Display

**Capability:** `data-display`
**ID prefix:** `DAT`
**Paths:** `projects/medra/ui/src/lib/data-table/**`, `projects/medra/ui/src/lib/data-view/**`, `projects/medra/ui/src/lib/tree/**`, `projects/medra/ui/src/lib/tree-table/**`, `projects/medra/ui/src/lib/virtual-scroller/**`, `projects/medra/ui/src/lib/timeline/**`, `projects/medra/ui/src/lib/organization-chart/**`, `projects/medra/ui/src/lib/chart/**`, `projects/medra/ui/src/lib/scroll-panel/**`

## Purpose

Lets applications present collections and hierarchies of data: tables, card lists, trees, tree tables, long virtualized lists, timelines, organization charts, charts and scrollable regions. The components provide sorting, filtering, paging, selection and keyboard navigation where applicable.

## Requirements

<!-- retired: DAT-039.S4 -->

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

With `sortMode="multiple"`, a plain click SHALL replace the sort with just that column, Shift+click SHALL add the column keeping the others (or cycle its order in place, removing it once it returns to none when `removableSort` is `true`, or cycling back to ascending when `removableSort` is `false`), ties SHALL be broken by later keys, and a 1-based priority badge SHALL appear next to each active sorted column. `sort` SHALL emit the multi-sort metadata and data.

#### Scenario DAT-003.S1: Shift adds

- **Given** a table sorted by column A in multiple mode
- **When** the user Shift+clicks column B
- **Then** the data is sorted by A then B and both show priority badges

#### Scenario DAT-003.S2: Non-removable multi-column sort

- **Given** a table with `sortMode="multiple"` and `removableSort` set to `false`, sorted ascending by column A and descending by column B
- **When** the user Shift+clicks column B
- **Then** column B cycles back to ascending instead of being removed from `multiSortMeta`

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

With `loading` in the default spinner mode, the table SHALL dim and overlay a spinner (label "Loading") while keeping existing rows; skeleton loading behavior is defined in DAT-042. With `lazy`, the table SHALL NOT sort, filter (globally or by column) or slice `value` itself, SHALL treat it as the current page, SHALL use `totalRecords` for the paginator, and SHALL emit `lazyLoad` once on init and again on each page, sort, filter or column filter change, with the active `columnFilters` in the event. When `virtualScroll` is also set, the table SHALL request rows by block as DAT-048 defines instead of by page. Without `lazy`, `lazyLoad` SHALL never emit.

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

When `selectionMode` is `single`, `radio` or `multiple`, or when `keyboardNavigation` is `true`, body rows SHALL be focusable, and ArrowDown and ArrowUp on a focused row SHALL move focus to the next and previous row of the current page, Home SHALL move it to the first row and End to the last row. Plain Arrow, Home, and End navigation SHALL NOT change the selection, and focus SHALL stay on the row at either end of the page, without wrapping. In `multiple` mode, Space and Enter on a focused row SHALL toggle that row in the selection; `Shift+ArrowDown`, `Shift+ArrowUp`, `Shift+Home`, and `Shift+End` SHALL move focus and select the contiguous range of rows from the anchor row to the target row; and `Ctrl+A` (or `Meta+A`) on a focused body row outside interactive/editing elements SHALL select all loaded rows. Without a selection mode and with `keyboardNavigation` false (default), these keys SHALL NOT be handled by the table.

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
- **And** in a table without a selection mode and without `keyboardNavigation` the key presses are not handled by the table

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

#### Scenario DAT-026.S6: Shift+Arrow range selection in multiple mode

- **Given** a table in `multiple` mode with focus on the second row
- **When** the user presses Shift+ArrowDown twice, then Shift+ArrowUp once
- **Then** pressing Shift+ArrowDown twice selects rows 2 through 4 and moves focus to row 4
- **And** pressing Shift+ArrowUp once shrinks the selected range to rows 2 through 3 and moves focus to row 3

#### Scenario DAT-026.S7: Ctrl+A select all in multiple mode

- **Given** a table in `multiple` mode with focus on a body row
- **When** the user presses Ctrl+A
- **Then** every loaded row is selected
- **And** default text selection is prevented

#### Scenario DAT-026.S8: Keyboard navigation without selection mode

- **Given** a table without `selectionMode` and with `keyboardNavigation` set to `true`
- **When** the user focuses the first row and presses ArrowDown, then End, then Home
- **Then** focus moves to the second row, then the last row of the page, then the first row
- **And** `selection` remains unchanged

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

`med-data-table` SHALL render the content of a `#headerGroup` template, written by the application as one or more `<tr>` rows, inside the table header above the column header row, and SHALL render the content of a `#footerGroup` template in a table footer after the body. Without a `#footerGroup` template and without a visible column that has a footer (DAT-054), the table SHALL NOT render a footer. Sorting, filtering, selection, resize handles and frozen columns SHALL keep working on the column header row. The application owns the `colspan` and `rowspan` of the cells it writes.

#### Scenario DAT-033.S1: Header group above the column row

- **Given** a table with a `#headerGroup` template holding one row with a cell spanning two columns
- **When** it renders
- **Then** that row appears in the table header before the row of column headers

#### Scenario DAT-033.S2: Footer group renders after the body

- **Given** a table with a `#footerGroup` template holding one row
- **When** it renders
- **Then** the table has a footer after its body containing that row

#### Scenario DAT-033.S3: No footer without a template or a column footer

- **Given** a table without a `#footerGroup` template and with no column that has a `footer` or a `#footer` template
- **When** it renders
- **Then** it has no footer element

#### Scenario DAT-033.S4: Sorting still works with a header group

- **Given** a table with a `#headerGroup` template and a sortable column
- **When** the user clicks the sortable column's header
- **Then** the rows are sorted by that column

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

A column with `columnFilter` SHALL show a funnel button in its header with the accessible name "Filter {header}" and an `aria-expanded` state (when `filterDisplay` is `'menu'`), and activating the button SHALL open a menu holding a match mode select (only when the column offers more than one mode), a value control for the column's `filterType`, an Add Rule button (`addRuleLabel`) to add additional rules combined with an `AND`/`OR` operator (`'and'` default, `'or'` optional, with `matchAllLabel` / `matchAnyLabel`), and Apply and Clear buttons. Pressing Apply, or Enter in the value control, SHALL commit the rule(s), close the menu and return the table to its first page; the table SHALL then show only the rows that pass every column's rule group (matching all active rules when `'and'` or at least one active rule when `'or'`) and the global filter. Clear SHALL remove the column's rules. A rule with an empty value SHALL filter nothing. The funnel button SHALL show an active state while its column has any active rule. Escape or a click outside the menu SHALL close it without committing and return the focus to the funnel button. Activating the funnel button SHALL NOT change the sort. A column without `columnFilter` SHALL show no funnel button. The model `columnFilters` SHALL hold each column's rule (`{ matchMode, value }`) or rule group (`{ operator, rules }`) keyed by field, SHALL be two-way, and SHALL filter the rows, persist/restore boundedly when `stateKey` is set, and set the funnel states when an application changes it. The `filter` output SHALL also emit when a column rule commits, with the current global text and the filtered rows.

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

#### Scenario DAT-038.S9: Multiple rules with AND and OR operators

- **Given** a table with a `name` column with `columnFilter` and rows "Alpha", "Beta", "Alpha Beta", and "Gamma"
- **When** the user adds two rules on `name` (`contains` "alpha" and `contains` "beta") with operator `'and'`, then switches the operator to `'or'`
- **Then** under `'and'` only "Alpha Beta" is shown
- **And** under `'or'` "Alpha", "Beta", and "Alpha Beta" are shown

### REQ DAT-039: Data table column filter match modes

A `columnFilter` column SHALL offer the match modes of its `filterType`: for `text` (default) contains (default mode), notContains, startsWith, endsWith, equals, notEquals and in; for `numeric` equals (default mode), notEquals, lt, lte, gt, gte, between and in; for `date` dateIs (default mode), dateIsNot, dateBefore, dateAfter, between and in. `filterMatchModes` SHALL restrict the offered modes to those it lists that belong to the type, and `filterMatchMode` SHALL set the preselected mode when it is offered. Text modes SHALL compare case-insensitively against the cell's text, treating a missing value as the empty string. Numeric modes SHALL compare numbers, and a cell whose value is not a finite number SHALL match no numeric mode. Date modes SHALL compare calendar days in the local time zone of cells that are `Date` objects or ISO date strings, and a cell that is neither SHALL match no date mode. `between` SHALL take a two-element `[min, max]` array and match inclusive bounds (ignoring a `null` bound, and inactive when both bounds are empty/null). `in` SHALL take an array of allowed values (optionally populated from `filterOptions` or distinct column values in the UI) and match when the cell equals any element in the array (inactive when empty).

#### Scenario DAT-039.S1: Text modes

- **Given** a text column with the values "Widget", "Gadget" and "widget pro"
- **When** the rule is startsWith "wid", then endsWith "GET", then notEquals "widget"
- **Then** the rows shown are "Widget" and "widget pro", then "Widget" and "Gadget", then "Gadget" and "widget pro"

#### Scenario DAT-039.S2: Between mode for numeric and date columns

- **Given** a numeric `price` column with values 10, 25, 50 and a date `created` column with values "2026-01-01", "2026-01-15", "2026-02-01"
- **When** `price` uses `between` `[15, 50]` and `created` uses `between` `["2026-01-10", "2026-01-20"]`
- **Then** `price` matches 25 and 50
- **And** `created` matches "2026-01-15"

#### Scenario DAT-039.S3: Multi-select `in` mode

- **Given** a text `category` column with values "A", "B", "C"
- **When** the rule uses `in` with `["a", "C"]`
- **Then** rows with category "A" and "C" are shown and "B" is excluded

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

### REQ DAT-043: Data table cell selection

When `cellSelection` is `true` and `selectionMode` is `'single'` or `'multiple'`, `<med-data-table>` SHALL allow selecting individual data cells instead of whole rows. Clicking a data cell, or pressing Enter or Space on a focused data cell, SHALL select or toggle that cell (`{ row, field }`), set `aria-selected="true"` and `tabindex="0"` on data cells, and emit `cellSelect` or `cellUnselect`. Pressing ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, or End on a focused data cell SHALL move focus to the target data cell within table bounds. In `'single'` mode, `selection` SHALL hold `{ row, field } | null` and selecting an already-selected cell SHALL be a no-op; in `'multiple'` mode, `selection` SHALL hold an array of `{ row, field }` entries, `Shift+Arrow*` / `Shift+Home` / `Shift+End` SHALL select the rectangular range of cells from the anchor cell to the target cell, `Ctrl+A` (or `Meta+A`) on a focused data cell SHALL select all data cells across loaded rows and visible columns, and dragging with the primary mouse button (`mousedown` on an anchor cell, hovering other cells, and releasing `mouseup`) SHALL select the rectangular range of cells between the anchor cell and the hovered cell. With `dataKey`, cell row matching SHALL compare by key across different object references; without it, by reference.

#### Scenario DAT-043.S1: Single cell selection

- **Given** a table with `cellSelection` and `selectionMode="single"`
- **When** the user clicks a data cell
- **Then** that cell has `aria-selected="true"` and `selection` holds `{ row, field }`
- **And** `cellSelect` emits with that row and field, and clicking a second cell moves selection to the second cell

#### Scenario DAT-043.S2: Multiple cell selection and key matching

- **Given** a table with `cellSelection`, `selectionMode="multiple"`, and `dataKey`
- **When** the user clicks two different data cells
- **Then** both cells have `aria-selected="true"` and `selection` contains both `{ row, field }` entries
- **And** clicking an already-selected cell deselects it and emits `cellUnselect`

#### Scenario DAT-043.S3: Cell arrow navigation and Shift+Arrow range selection

- **Given** a table with `cellSelection` and `selectionMode="multiple"` with focus on cell `(row 1, col 0)`
- **When** the user presses ArrowRight, then Shift+ArrowDown and Shift+ArrowRight
- **Then** ArrowRight moves focus to `(row 1, col 1)` without selecting
- **And** Shift+ArrowDown followed by Shift+ArrowRight selects the rectangular range from `(row 1, col 1)` to `(row 2, col 2)`

#### Scenario DAT-043.S4: Ctrl+A selects all cells in multiple mode

- **Given** a table with `cellSelection` and `selectionMode="multiple"` with focus on a data cell
- **When** the user presses Ctrl+A
- **Then** `selection` contains every `{ row, field }` pair for loaded rows and visible columns
- **And** default text selection is prevented

#### Scenario DAT-043.S5: Mouse drag selects a rectangular cell range

- **Given** a table with `cellSelection` and `selectionMode="multiple"`
- **When** the user presses `mousedown` on cell `(row 0, col 0)`, moves `mouseenter` onto cell `(row 1, col 1)`, and releases `mouseup`
- **Then** `selection` contains all 4 cells in the 2×2 rectangle from `(row 0, col 0)` to `(row 1, col 1)`
- **And** subsequent mouse movement after `mouseup` does not alter `selection`

### REQ DAT-044: Data table conditional cell styling

`med-data-table` SHALL accept `cellClass` (`((row: T, field: string) => string) | null`, default `null`) and SHALL apply the returned CSS classes to each corresponding body data `<td>` alongside column alignment, gridlines, and frozen cell classes.

#### Scenario DAT-044.S1: Conditional cell class applied

- **Given** a table with `cellClass` returning `'bg-red-100'` when `field === 'status'` and `row.status === 'critical'`
- **When** the table renders
- **Then** only the `status` cell of rows with `status === 'critical'` receives `'bg-red-100'`

### REQ DAT-045: Data table context menu integration

`med-data-table` SHALL accept `contextMenu` (`ContextMenuDirective | null`, default `null`) and `contextMenuSelection` (`model<T | null>(null)`), and SHALL emit `contextMenuSelect` (`{ originalEvent, row, field? }`) when a context menu is invoked on a body row (via right-click, `ContextMenu` key, or `Shift+F10`). When `contextMenu` is set, invoking the context menu on a body row SHALL prevent the native browser context menu, update `contextMenuSelection` to that row, emit `contextMenuSelect`, and open the linked `ContextMenuDirective` at the pointer position (or anchored to the row element for keyboard invocation).

#### Scenario DAT-045.S1: Right-click row opens linked context menu

- **Given** a table with `[contextMenu]="cm"` and `[(contextMenuSelection)]="selectedRow"`
- **When** the user right-clicks a body row
- **Then** `contextMenuSelection` is updated to that row and `contextMenuSelect` emits
- **And** the linked `ContextMenuDirective` opens its menu panel

#### Scenario DAT-045.S2: Keyboard context menu on focused row

- **Given** a table with `[contextMenu]="cm"` and a focused body row
- **When** the user presses `Shift+F10` or the `ContextMenu` key
- **Then** `contextMenuSelection` is updated to that row, `contextMenuSelect` emits, and the linked `ContextMenuDirective` opens

### REQ DAT-046: Data table virtual scroll

With `virtualScroll`, `med-data-table` SHALL render in its body only the rows from the processed row set (`value` after sorting, the global filter and column filters) that intersect the scroll viewport, plus a buffer of rows above and below it, and SHALL size the scrollable area to the full processed row count times `virtualScrollItemSize` (pixels, default 40), so the scrollbar represents every row. The viewport height SHALL be `scrollHeight`, including `flex`; with `virtualScroll` and no `scrollHeight`, the viewport SHALL be 400 pixels tall, so a large `value` is never rendered whole. The header, the `frozenValue` rows and the footer SHALL stay in view while the body scrolls, and frozen columns SHALL stay pinned on the rendered rows. With `virtualScroll`, the paginator SHALL NOT render and `first` and `rows` SHALL NOT slice the processed row set. A change of sort or filter SHALL scroll the body back to the first row. Selection SHALL apply to the whole processed row set: the select-all control SHALL select or deselect every row of it, including rows not rendered, and a selected row SHALL show as selected again when it scrolls back into the window. Cell editing, row editing, cell selection, conditional row and cell styles and the context menu SHALL behave on a rendered row as they do without `virtualScroll`. An open cell or row edit SHALL survive its row leaving the rendered window: scrolling SHALL neither commit nor cancel it, and the row SHALL render again in edit mode, with the value typed so far, when it scrolls back into the window. Without `virtualScroll`, the table SHALL render every row of the current page as before.

#### Scenario DAT-046.S1: Only the window is rendered

- **Given** a table with `virtualScroll`, `scrollHeight="400px"`, `virtualScrollItemSize` 40 and 10,000 rows in `value`
- **When** the table renders
- **Then** fewer than 100 body rows are in the DOM
- **And** the scrollable area is 400,000 pixels tall

#### Scenario DAT-046.S2: Scrolling renders the rows in view

- **Given** the table of DAT-046.S1
- **When** the body is scrolled to 200,000 pixels
- **Then** the row at index 5,000 of `value` is rendered inside the viewport
- **And** the row at index 0 is no longer in the DOM

#### Scenario DAT-046.S3: Sort applies to the whole set

- **Given** the table of DAT-046.S1 scrolled to the middle, with a sortable column
- **When** the user sorts that column descending
- **Then** the body scrolls back to the top
- **And** the first rendered row holds the largest value of that column across all 10,000 rows

#### Scenario DAT-046.S4: Select-all covers rows not rendered

- **Given** a table with `virtualScroll`, `selectionMode="multiple"` and 10,000 rows
- **When** the user checks the header checkbox
- **Then** `selection` holds all 10,000 rows
- **And** after scrolling to the last row, that row's checkbox is checked

#### Scenario DAT-046.S5: No paginator in virtual mode

- **Given** a table with `virtualScroll`, `paginator` and `rows` 10
- **When** the table renders
- **Then** no paginator is rendered
- **And** rows beyond the tenth are reachable by scrolling

#### Scenario DAT-046.S6: Header and frozen rows stay in view

- **Given** a table with `virtualScroll` and one row in `frozenValue` at the top
- **When** the body is scrolled to the middle
- **Then** the header row and the frozen row are still visible at the top of the viewport

#### Scenario DAT-046.S7: Default viewport height

- **Given** a table with `virtualScroll`, no `scrollHeight` and 10,000 rows
- **When** the table renders
- **Then** the scroll viewport is 400 pixels tall
- **And** fewer than 100 body rows are in the DOM

#### Scenario DAT-046.S8: Edit survives scrolling away

- **Given** a table with `virtualScroll` and `editMode="cell"`, with a cell of row 0 in edit mode holding the typed text "draft"
- **When** the body is scrolled until row 0 leaves the DOM and then back to the top
- **Then** that cell is still in edit mode with "draft" in its editor
- **And** neither `editComplete` nor `editCancel` was emitted

### REQ DAT-047: Data table virtual scroll keyboard and row positions

With `virtualScroll` and a selection mode, ArrowDown, ArrowUp, Home and End (DAT-026) SHALL move focus across the whole processed row set instead of the current page: when the target row is outside the rendered window, the table SHALL scroll it into view, render it and focus it. Focus SHALL stay on the first or last row of the set at either end, without wrapping. The `<table>` SHALL expose `aria-rowcount` equal to the number of header rows plus frozen rows plus the processed row count (or `totalRecords` in lazy mode), and every rendered body row SHALL expose `aria-rowindex` with its 1-based position in that count, so assistive technology announces the real position of a row rather than its position in the DOM.

#### Scenario DAT-047.S1: Arrow down past the window

- **Given** a table with `virtualScroll`, `selectionMode="single"` and 10,000 rows, with focus on the last row rendered in the viewport
- **When** the user presses ArrowDown
- **Then** the body scrolls so the next row is in view
- **And** that row has focus

#### Scenario DAT-047.S2: End reaches the last row

- **Given** the table of DAT-047.S1 with focus on the first row
- **When** the user presses End
- **Then** the row at index 9,999 is rendered and has focus

#### Scenario DAT-047.S3: Row positions reflect the full set

- **Given** a table with `virtualScroll`, one header row, no frozen rows and 10,000 rows, scrolled so the row at index 5,000 is rendered
- **When** the table and that row are inspected
- **Then** the table's `aria-rowcount` is 10001
- **And** that row's `aria-rowindex` is 5002

### REQ DAT-048: Data table lazy virtual scroll

With both `lazy` and `virtualScroll`, `med-data-table` SHALL size the scrollable area to `totalRecords` times `virtualScrollItemSize` and SHALL request rows by block: on init and whenever the viewport, or the next block after it, reaches rows whose block was not requested yet, it SHALL emit `lazyLoad` with `first` set to the block's first row index and `rows` to the block size, together with the current sort, global filter and `columnFilters`. The block size SHALL be `rows`, so blocks start at multiples of `rows`. Requesting the block after the visible one before the user reaches it is the preload. The table SHALL NOT emit `lazyLoad` twice for the same block until a sort or filter change, which SHALL discard every requested block, scroll the body to the first row and emit `lazyLoad` with `first` 0. The application SHALL hand loaded rows back by keeping `value` as an array of `totalRecords` entries and writing each block's rows at their row indices; an entry that is `undefined` or `null` is a row not loaded yet, and the table SHALL keep no cache of its own. A rendered row whose data is not loaded yet SHALL show skeleton placeholder cells across every visible column, as in DAT-042, and SHALL NOT be selectable, editable or focusable until its data arrives.

#### Scenario DAT-048.S1: First block and preload on init

- **Given** a table with `lazy`, `virtualScroll` and `totalRecords` 100,000
- **When** the table initializes
- **Then** `lazyLoad` emits for the first block with `first` 0
- **And** `lazyLoad` emits for the block after it

#### Scenario DAT-048.S2: Scrolling requests the block in view once

- **Given** the table of DAT-048.S1 after its initial requests
- **When** the user scrolls to row 50,000 and back up a few rows twice
- **Then** `lazyLoad` emits once for the block containing row 50,000
- **And** it does not emit again for that block

#### Scenario DAT-048.S3: Placeholders until data arrives

- **Given** the table of DAT-048.S1 with `selectionMode="single"`, scrolled to a block that was requested but not delivered
- **When** the rows in the viewport are inspected
- **Then** each shows skeleton placeholder cells for every visible column
- **And** clicking one does not change `selection`

#### Scenario DAT-048.S4: Sort resets the blocks

- **Given** the table of DAT-048.S1 scrolled to row 50,000, with a sortable column
- **When** the user sorts that column
- **Then** the body scrolls to the first row
- **And** `lazyLoad` emits with `first` 0 and the new sort field

#### Scenario DAT-048.S5: Blocks follow rows and the sparse value

- **Given** a table with `lazy`, `virtualScroll`, `rows` 50, `totalRecords` 100,000 and a `value` of 100,000 entries where only indices 0 to 49 hold rows
- **When** the user scrolls to row 120
- **Then** `lazyLoad` emits with `first` 100 and `rows` 50
- **And** rows 0 to 49 render with their data while row 120 shows placeholder cells

### REQ DAT-049: Data table paginator position and options

With `paginator`, `med-data-table` SHALL place its paginator according to `paginatorPosition`: below the table and its summary when `bottom` (default), above the table header and below the caption when `top`, or in both places when `both`. With `both`, the two paginators SHALL always show the same page and page size, and a page or page-size change made in either SHALL update the rows and the other paginator. The table SHALL forward to every paginator it renders: `showCurrentPageReport` (default true) as whether the page report shows, `currentPageReportTemplate` (default none, which keeps the "Showing X-Y of Z" report) as the report text with `{first}`, `{last}`, `{totalRecords}`, `{currentPage}`, `{totalPages}` and `{rows}` replaced by their values, `showFirstLastIcon` (default false) as whether first and last page buttons show, `showJumpToPageInput` (default false) as whether a page number input shows, `pageLinks` (default 5) as the most page links shown at once, and `alwaysShowPaginator` (default true) as whether a paginator shows when there is only one page. A single paginator SHALL carry the accessible name `paginatorAriaLabel` (default "Pagination"); with `both`, the top paginator SHALL carry `paginatorTopAriaLabel` (default "Pagination, top") and the bottom one `paginatorBottomAriaLabel` (default "Pagination, bottom"), so the two navigation landmarks have distinct names. When the user changes the page or the page size in any paginator, the table SHALL emit `pageChange` with the new `first`, `rows`, zero-based `page` and `pageCount`, in lazy mode as well as without it; setting `first` from outside SHALL NOT emit `pageChange`. Without `paginator`, with `virtualScroll`, or with no rows to page, no paginator SHALL render, as before.

#### Scenario DAT-049.S1: Paginator above the table

- **Given** a table with `paginator`, `paginatorPosition="top"`, a caption and 25 rows
- **When** the table renders
- **Then** exactly one paginator is rendered
- **And** it comes after the caption and before the table header in document order

#### Scenario DAT-049.S2: Both paginators stay in step

- **Given** a table with `paginator`, `paginatorPosition="both"`, 10 rows per page and 25 rows
- **When** the user goes to the third page in the top paginator
- **Then** rows 21 to 25 are shown
- **And** the bottom paginator shows the third page as current

#### Scenario DAT-049.S3: Distinct landmark names

- **Given** a table with `paginator` and `paginatorPosition="both"`
- **When** the two paginators are inspected
- **Then** the top one is named "Pagination, top" and the bottom one "Pagination, bottom"
- **And** setting `paginatorTopAriaLabel` to "Pages above" names the top one "Pages above"

#### Scenario DAT-049.S4: Custom page report

- **Given** a table with `paginator`, 10 rows per page, 25 rows, `first` of 10 and `currentPageReportTemplate` "Page {currentPage} of {totalPages}, rows {first}-{last} of {totalRecords} ({rows} per page)"
- **When** the table renders
- **Then** the paginator reads "Page 2 of 3, rows 11-20 of 25 (10 per page)"

#### Scenario DAT-049.S5: Report hidden

- **Given** a table with `paginator` and `showCurrentPageReport` false
- **When** the table renders
- **Then** the paginator shows no page report

#### Scenario DAT-049.S6: Paginator options forwarded

- **Given** a table with `paginator`, 10 rows per page, 200 rows, `showFirstLastIcon`, `showJumpToPageInput` and `pageLinks` 3
- **When** the table renders
- **Then** the paginator shows first and last page buttons and a page number input
- **And** it shows 3 page links

#### Scenario DAT-049.S7: Single page hidden

- **Given** a table with `paginator`, 10 rows per page, 8 rows and `alwaysShowPaginator` false
- **When** the table renders
- **Then** no paginator is rendered
- **And** with `alwaysShowPaginator` left at its default the paginator is rendered

#### Scenario DAT-049.S8: Page change event

- **Given** a table with `paginator`, 10 rows per page, 25 rows and a `pageChange` listener
- **When** the user goes to the second page
- **Then** `pageChange` emits once with `first` 10, `rows` 10, `page` 1 and `pageCount` 3
- **And** when the host then sets `first` to 20, `pageChange` does not emit again

#### Scenario DAT-049.S9: Default placement unchanged

- **Given** a table with `paginator` and no `paginatorPosition`, with a summary
- **When** the table renders
- **Then** exactly one paginator is rendered, after the summary, named "Pagination"
- **And** it shows the "Showing 1-10 of 25" report for 25 rows

### REQ DAT-050: Data table responsive stack layout

`med-data-table` SHALL accept `responsiveLayout` (`scroll` default, or `stack`), `breakpoint` (a CSS length, default `960px`), and `breakpointMode` (`'viewport'` default, or `'container'`). With `responsiveLayout="stack"` and the measured width (viewport width when `breakpointMode` is `'viewport'`, or the table host element's `ResizeObserver` width when `breakpointMode` is `'container'`) narrower than `breakpoint`, the table SHALL be stacked: each body row renders as a block and each data cell shows its column's label next to its value. With the default `scroll`, or at a width at least as wide as `breakpoint`, the table SHALL render and scroll horizontally exactly as before. Switching the viewport or container width across `breakpoint` SHALL update the layout without a reload. A cell's label SHALL be the column's `stackLabel` when set, else its `header`, and a column with neither SHALL show no label. A `breakpoint` that is not a valid CSS length SHALL leave the table unstacked. `virtualScroll` SHALL keep the table unstacked, because its row positions assume a fixed row height.

#### Scenario DAT-050.S1: Defaults keep the scroll layout

- **Given** a table with `responsiveLayout`, `breakpoint` and every column's `stackLabel` left unset, at a viewport of 400px
- **When** it renders
- **Then** the table is not stacked and no cell shows a label
- **And** the table wrapper still scrolls horizontally

#### Scenario DAT-050.S2: Stack below the breakpoint

- **Given** a table with `responsiveLayout="stack"`, `breakpoint` left unset and two columns headed "Name" and "Role"
- **When** the viewport is 800px wide
- **Then** each row is a block and each cell shows "Name" or "Role" as its label next to its value

#### Scenario DAT-050.S3: Scroll at or above the breakpoint

- **Given** a table with `responsiveLayout="stack"` and `breakpoint="600px"`
- **When** the viewport is 600px wide
- **Then** the table is not stacked and no cell shows a label

#### Scenario DAT-050.S4: Layout follows the viewport

- **Given** a stacked table at a viewport of 800px
- **When** the viewport widens to 1200px and narrows to 800px again
- **Then** the table is unstacked at 1200px and stacked again at 800px, without a reload

#### Scenario DAT-050.S5: Label override and missing header

- **Given** a stacked table with a column whose `header` is "Name" and `stackLabel` is "Full name", and a column with no `header` and no `stackLabel`
- **When** it renders
- **Then** the first column's cells show the label "Full name"
- **And** the second column's cells show no label

#### Scenario DAT-050.S6: Invalid breakpoint and virtual scroll

- **Given** a table with `responsiveLayout="stack"` and `breakpoint="wide"`, and another with `responsiveLayout="stack"` and `virtualScroll`, at a viewport of 400px
- **When** they render
- **Then** neither table is stacked

#### Scenario DAT-050.S7: Container-width breakpoint via ResizeObserver

- **Given** a table with `responsiveLayout="stack"`, `breakpointMode="container"`, and `breakpoint="500px"` inside a wide viewport
- **When** the host container's observed width changes from 600px to 420px and back to 500px
- **Then** the table is unstacked at 600px, stacked at 420px, and unstacked again at 500px

### REQ DAT-051: Data table stacked semantics and appearance

A stacked `med-data-table` SHALL keep its table semantics: the table, its row groups, rows, header cells and data cells SHALL carry explicit `table`, `rowgroup`, `row`, `columnheader` and `cell` roles, so display overrides do not drop them, and each cell SHALL stay associated with its column header. The header row SHALL be visually hidden but remain in the accessibility tree and in the DOM, never removed or set to `display: none`. The label SHALL be hidden from assistive technology (`aria-hidden`), because the column header already names the cell. The stacked appearance SHALL use the existing surface and border design tokens with a dark-mode counterpart, SHALL honor `size` padding and `showGridlines` and `stripedRows`, and SHALL merge the consumer `class`.

#### Scenario DAT-051.S1: Roles while stacked

- **Given** a stacked table with two columns and one row
- **When** it renders
- **Then** the table has the `table` role, each body and header row has the `row` role, each header cell has the `columnheader` role and each body cell has the `cell` role

#### Scenario DAT-051.S2: Header row stays accessible

- **Given** a stacked table
- **When** its header row is inspected
- **Then** it is present in the DOM and not `display: none` or `aria-hidden`
- **And** it is not visible and takes no space in the layout

#### Scenario DAT-051.S3: Label hidden from assistive technology

- **Given** a stacked table whose column has a `header`
- **When** a body cell is inspected
- **Then** its label element is `aria-hidden="true"`

#### Scenario DAT-051.S4: No stack roles or labels when unstacked

- **Given** a table with `responsiveLayout="stack"` at a viewport at least as wide as `breakpoint`
- **When** it renders
- **Then** no explicit stack roles and no label elements are present

#### Scenario DAT-051.S5: Appearance in both color schemes

- **Given** a stacked table in the light scheme and in the `dark` scheme
- **When** a row and a label are rendered
- **Then** row separators, label text and row background use the design tokens of each scheme
- **And** a consumer `class` on the table is merged onto its root

### REQ DAT-052: Data table stacked layout and other features

While stacked, `med-data-table` SHALL behave as follows with each other feature. Sorting: header click and keyboard sorting SHALL be unavailable and the header cells SHALL leave the tab order, while `aria-sort` and the sort state set by the application SHALL still apply. Frozen columns and frozen rows SHALL stop being sticky and render as ordinary stacked cells and rows in their normal order. Column resize and column reorder SHALL be inactive, their handles hidden, while `visible` SHALL still hide columns. The selection checkbox or radio SHALL render as the first line of its row without a label, and keyboard row selection SHALL be unchanged. The row reorder handle and row reordering SHALL be inactive. Expandable rows SHALL keep their toggle and render the expansion content as a full-width block under its row. Subheader group rows SHALL render as full-width blocks, and row-span merging SHALL be inactive so each row shows its own value. `scrollable` and `scrollHeight` SHALL still limit the height and scroll vertically, with a header that is not sticky. A `#headerGroup` column group SHALL be visually hidden with the header row, and the label SHALL come only from the column headers. Cell editing and row editing SHALL work in the stacked cells, and the row actions cell SHALL show its buttons without a label. The caption and summary slots SHALL be unchanged. Returning to the unstacked layout SHALL restore every one of these features.

#### Scenario DAT-052.S1: Sorting while stacked

- **Given** a stacked table with a `sortable` column sorted ascending by the application
- **When** the user clicks or presses Enter on the hidden header cell area
- **Then** the sort does not change
- **And** the header cell is not in the tab order and keeps `aria-sort="ascending"`

#### Scenario DAT-052.S2: Frozen columns and rows while stacked

- **Given** a stacked table with a frozen column and frozen rows
- **When** it renders
- **Then** no cell or row is sticky and the frozen cells and rows appear in their normal order, each labelled

#### Scenario DAT-052.S3: Resize, reorder and visibility while stacked

- **Given** a stacked table with `resizableColumns`, `reorderableColumns` and one column with `visible` false
- **When** it renders
- **Then** no resize handle shows, no header is draggable and the hidden column renders no cell

#### Scenario DAT-052.S4: Selection, row reorder and expansion while stacked

- **Given** a stacked table with `selectionMode="multiple"`, `reorderable` and a `#rowexpansion` template
- **When** the user checks a row and expands it
- **Then** the row is selected and its checkbox cell shows no label
- **And** no row reorder handle shows and the expansion content renders as a full-width block under the row

#### Scenario DAT-052.S5: Row groups and row spans while stacked

- **Given** a stacked table with `rowGroupMode="subheader"` and another with `rowGroupMode="rowspan"`, both with `groupRowsBy`
- **When** they render
- **Then** the subheader row is a full-width block
- **And** the row-span table shows the group value in every row, with no merged cell

#### Scenario DAT-052.S6: Scroll height and column groups while stacked

- **Given** a stacked table with `scrollable`, `scrollHeight="300px"` and a `#headerGroup` row
- **When** it renders
- **Then** the body scrolls vertically within 300px and the header is not sticky
- **And** the header group row is visually hidden and no label comes from it

#### Scenario DAT-052.S7: Editing while stacked

- **Given** a stacked table with `editMode="row"` and an editable column
- **When** the user activates a row's edit button
- **Then** the cell shows its edit template under the label
- **And** the actions cell shows its buttons with no label

#### Scenario DAT-052.S8: Features return when unstacked

- **Given** a stacked table with a frozen column, a sortable column and `resizableColumns`
- **When** the viewport widens to or past `breakpoint`
- **Then** the column is sticky again, clicking the header sorts and the resize handle shows

### REQ DAT-053: Data table column header template

`med-table-column` SHALL accept a `#header` template. When a column has one, its header cell SHALL render the template in place of the `header` text, and SHALL keep the sort indicator, the multi-sort priority badge, the column filter button, the resize handle, `aria-sort`, and the click, keyboard and drag behavior of that header cell. A click on, or Enter or Space pressed in, an interactive element inside the template (a button, link, input, select or element with a `tabindex`) SHALL NOT sort the column. The `header` text SHALL still be used wherever the table needs the column's name as plain text: the column filter labels, the column move announcement, the stacked label fallback and the CSV export header. Without a `#header` template the header cell SHALL render the `header` text exactly as before.

#### Scenario DAT-053.S1: Template replaces the header text

- **Given** a sortable column with `header` "Price" and a `#header` template rendering "Price (USD)" with an icon
- **When** the table renders
- **Then** the header cell shows "Price (USD)" and the icon, and does not also show the text "Price" on its own
- **And** the header cell still shows the sort indicator

#### Scenario DAT-053.S2: Sorting still works on a templated header

- **Given** an unsorted table with a sortable column that has a `#header` template
- **When** the user clicks the header cell outside any interactive element, and then focuses it and presses Enter
- **Then** the rows are sorted ascending by that column after the click and descending after Enter
- **And** the header cell's `aria-sort` reports each order

#### Scenario DAT-053.S3: Interactive content in the template does not sort

- **Given** an unsorted table with a sortable column whose `#header` template holds a button
- **When** the user clicks the button, and then focuses it and presses Enter and Space
- **Then** the button receives the click and the key presses
- **And** the rows keep their original order and the header cell's `aria-sort` stays `none`

#### Scenario DAT-053.S4: Plain-text name still used

- **Given** a column with `header` "Price", a `#header` template rendering "Price (USD)", and `columnFilter` set
- **When** the table renders and `exportCSV()` is called
- **Then** the column filter button is labelled "Filter Price"
- **And** the first line of the exported CSV names the column "Price"

### REQ DAT-054: Data table column footer

`med-table-column` SHALL accept a `footer` text and a `#footer` template, and the template SHALL win when both are set. When at least one visible column has a footer, `med-data-table` SHALL render a column footer row inside the table footer, with one cell per visible column in column order, an empty cell for each visible column without a footer, and an empty cell for each utility column (selection, row reorder, row actions). The `#footer` template SHALL receive as `$implicit` the rows that pass the global filter and every column rule, in the current sorted order and across all pages; with `lazy` it SHALL receive the current `value`. With a `#footerGroup` template, its rows SHALL render first and the column footer row after them in the same footer. Footer cells SHALL follow column order, column visibility, column alignment and the sticky offsets of frozen columns, and with `scrollable` the footer SHALL stay at the bottom of the viewport as the `#footerGroup` footer does. While stacked, the column footer row SHALL render as a block, each footer cell with content SHALL show its column label next to that content as a body cell does, and footer cells without content SHALL be hidden.

#### Scenario DAT-054.S1: Text footer

- **Given** a table with a column "Name" whose `footer` is "Total" and a column "Price" with no footer
- **When** it renders
- **Then** the table footer holds one row with two cells, "Total" and an empty cell, in column order

#### Scenario DAT-054.S2: Template receives the filtered rows of every page

- **Given** a table with rows priced 10, 20 and 30, `paginator` on with `rows` 1, and a global filter that leaves the rows priced 10 and 20
- **And** a "Price" column whose `#footer` template shows the sum of the price of the rows it receives
- **When** the table renders
- **Then** the "Price" footer cell shows 30

#### Scenario DAT-054.S3: Footer group and column footer together

- **Given** a table with a `#footerGroup` template holding one row and a column whose `footer` is "Total"
- **When** it renders
- **Then** the table footer holds the footer group row first and the column footer row after it

#### Scenario DAT-054.S4: Footer follows visibility and order

- **Given** a table with columns A, B and C, each with a `footer`, where B has `visible` set to `false`
- **When** it renders, and then the application moves C before A
- **Then** the footer row shows A's and C's footers in that order at first, and C's then A's after the move, with no cell for B

#### Scenario DAT-054.S5: Frozen footer cell

- **Given** a `scrollable` table, wider than its viewport, with a left-frozen first column that has a `footer`
- **When** the user scrolls the table to the right end
- **Then** the frozen column's footer cell stays at the same left offset as that column's body cells

#### Scenario DAT-054.S6: Footer while stacked

- **Given** a stacked table with a column "Price" whose `footer` is "Sum: 30" and a column "Name" with no footer
- **When** it renders
- **Then** the column footer row is a block, the "Price" footer cell shows the label "Price" next to "Sum: 30"
- **And** the "Name" footer cell is hidden

#### Scenario DAT-054.S7: Lazy footer gets the current page

- **Given** a `lazy` table whose `value` holds two rows priced 5 and 7, and a "Price" column whose `#footer` template shows the sum of the price of the rows it receives
- **When** it renders
- **Then** the "Price" footer cell shows 12

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

### REQ DAT-057: Data table filter row and custom filter template

`<med-data-table>` SHALL accept `filterDisplay` (`'menu' | 'row'`, default `'menu'`). When `filterDisplay` is `'row'` and the table is not stacked, it SHALL render a filter row inside `<thead>` directly below the column header row, with a filter control in each `columnFilter` column's cell (and empty cells for utility and non-filterable columns). `<med-table-column>` SHALL accept a `#filter` template (`filterTemplate`), which when present SHALL render in place of the default filter control in both `filterDisplay="row"` and `filterDisplay="menu"` with context `{ $implicit: value, filter, clear, matchMode }`.

#### Scenario DAT-057.S1: Inline filter row below headers

- **Given** a table with `filterDisplay="row"` and a `name` column with `columnFilter`
- **When** the user types "wid" into the `name` filter row input
- **Then** the table filters rows immediately to those matching "wid" without opening a popover menu
- **And** `columnFilters` is updated and `filter` emits

#### Scenario DAT-057.S2: Custom `#filter` template in row and menu modes

- **Given** a column with `columnFilter` and a `#filter` template calling `filter(value)` and `clear()`
- **When** rendered in `filterDisplay="row"` or in `filterDisplay="menu"`
- **Then** the custom `#filter` template is rendered instead of the default control
- **And** invoking `filter(value)` filters the rows and invoking `clear()` removes the column filter

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

### REQ DAT-060: Data table stacked sort control

When `stacked()` is `true` and at least one visible column has `sortable` enabled, `<med-data-table>` SHALL render a visible sort control bar (`data-med-stack-sort`) allowing the user to pick a sortable column (labelled by `stackSortLabel`, default `"Sort by"`) and toggle or clear its sort order (`stackSortAscLabel`, `stackSortDescLabel`, `stackSortClearLabel`), updating `sortField`/`sortOrder` (or `multiSortMeta` in `sortMode="multiple"`), emitting `sort`, and triggering `lazyLoad` in `lazy` mode, while keeping the hidden `<thead>` header cells non-interactive per DAT-052.

#### Scenario DAT-060.S1: Sorting while stacked via the stacked sort control

- **Given** a stacked table with sortable columns `name` ("Name") and `price` ("Price")
- **When** the user selects `price` in the stacked sort control and toggles the sort direction to descending
- **Then** the stacked rows are ordered by `price` ascending, then descending
- **And** `sort` emits and `aria-sort` on the `price` header updates accordingly

### REQ DAT-061: Data table variable row height in virtual scroll

`<med-data-table>` SHALL accept `virtualScrollRowHeight` (`((row: T, index: number) => number) | 'auto' | null`, default `null`). When `virtualScroll` is `true` and `virtualScrollRowHeight` is `null`, every row SHALL keep the fixed `virtualScrollItemSize` height (DAT-046). When `virtualScrollRowHeight` is a function, the table SHALL size each row's `<tr>` height, total scrollable area, top/bottom spacers, rendered window, and keyboard `ArrowUp`/`ArrowDown`/`Home`/`End` scroll targets from the cumulative heights returned by the function (clamped to at least 1px, and falling back to `virtualScrollItemSize` for unloaded `lazy` placeholders or non-finite values). When `virtualScrollRowHeight` is `'auto'`, body rows SHALL NOT force fixed `virtualScrollItemSize` height or clip cell text, and the table SHALL measure rendered row heights after render using `virtualScrollItemSize` as the initial estimate for unmeasured rows, updating cumulative offsets and spacers accordingly.

#### Scenario DAT-061.S1: Callback-driven variable row heights

- **Given** a `virtualScroll` table with `scrollHeight="200px"`, `virtualScrollItemSize` `40`, 50 rows where even rows are `80px` tall and odd rows are `40px` tall via `virtualScrollRowHeight`
- **When** the table renders and scrolls to offset `1,200px`
- **Then** the total scrollable height is `3,000px` (`25 * 80 + 25 * 40`)
- **And** the rendered rows match the cumulative-offset window around `1,200px` with each `<tr>` styled to its row height
- **And** pressing `End` scrolls to and focuses the last row (`index 49`)

#### Scenario DAT-061.S2: Auto-measured variable row heights in a real browser

- **Given** a `virtualScroll` table with `virtualScrollRowHeight="auto"`, `scrollHeight="200px"`, `virtualScrollItemSize` `40`, and rows whose text wraps to varying heights
- **When** the table renders in a browser and scrolls down
- **Then** body rows render at their natural content heights without truncation
- **And** the measured heights update the scrollable height beyond the `40px`-per-row initial estimate

### REQ DAT-062: Data table expansion, grouping, and row reorder in virtual scroll

When `virtualScroll` is `true` (and `lazy` is `false`), `<med-data-table>` SHALL support `#rowexpansion`, `rowGroupMode` (`'subheader'` and `'rowspan'`), `expandableRowGroups`, and `reorderable`:
1. `#rowexpansion`: Expanding a row SHALL render its expansion row directly beneath its data row in the virtual body, counting toward total scrollable height and `aria-rowcount` while keeping virtualization active.
2. `rowGroupMode="subheader"` and `expandableRowGroups`: Subheader rows SHALL be interleaved in the virtual item stream (using `groupRowsBy` as primary sort key), and collapsing a group via `expandableRowGroups` SHALL omit its rows from the virtual stream and emit `rowGroupCollapse`/`rowGroupExpand`.
3. `rowGroupMode="rowspan"`: Each rendered group run inside the virtual window SHALL render the merged `groupRowsBy` cell on the first rendered row of that run in the window with `rowspan` equal to the number of rendered rows (plus rendered expansion rows) of that run inside the window, omitting covered cells so the table remains rectangular even when the top of a group is scrolled out of view.
4. `reorderable`: Dragging a row in `virtualScroll` SHALL pin the dragged row in the rendered DOM until `drop` or `dragend`, and dropping on another row SHALL emit `rowReorder` with `dragIndex` and `dropIndex` relative to `value()`.

#### Scenario DAT-062.S1: Row expansion in virtual scroll

- **Given** a `virtualScroll` table with `scrollHeight="200px"`, `virtualScrollItemSize` `40`, 50 rows, `dataKey="id"`, and a `#rowexpansion` template
- **When** the user expands row 0 and scrolls down and back up
- **Then** the expansion row renders beneath row 0 inside the virtual body and increases the scrollable height
- **And** row 0 remains expanded after scrolling away and back

#### Scenario DAT-062.S2: Subheader grouping and expandable row groups in virtual scroll

- **Given** a `virtualScroll` table with `rowGroupMode="subheader"`, `groupRowsBy="team"`, `expandableRowGroups`, and rows in teams `"Alpha"` and `"Beta"`
- **When** the table renders and the user collapses `"Alpha"`
- **Then** subheader rows render in the virtual body and collapsing `"Alpha"` hides `"Alpha"`'s rows from the virtual stream while keeping `"Beta"`'s rows and emitting `rowGroupCollapse`

#### Scenario DAT-062.S3: Row-span grouping in virtual scroll across scroll offsets

- **Given** a `virtualScroll` table with `rowGroupMode="rowspan"`, `groupRowsBy="team"`, `scrollHeight="160px"`, `virtualScrollItemSize` `40`, and 20 rows in team `"Alpha"` followed by 10 in `"Beta"`
- **When** the table scrolls to offset `200px` (midway through `"Alpha"`)
- **Then** the first rendered row of `"Alpha"` in the window renders the `"Alpha"` cell with `rowspan` matching the rendered `"Alpha"` rows in the window
- **And** every rendered `<tr>` has a rectangular cell count matching the table columns

#### Scenario DAT-062.S4: Row reorder in virtual scroll

- **Given** a `virtualScroll` table with `reorderable` and 50 rows
- **When** the user starts dragging row 0, scrolls so row 0 would leave the window, and drops onto row 15
- **Then** row 0 remains pinned in the DOM during the drag
- **And** `rowReorder` emits `{ dragIndex: 0, dropIndex: 15 }` relative to `value()`

### REQ DAT-063: Data table horizontal column virtualization

`<med-data-table>` SHALL accept `virtualScrollColumns` (`boolean`, default `false`) and `virtualScrollColumnWidth` (`number`, default `120`, clamped to at least 1px). When `virtualScrollColumns` is `true` and the table is not stacked, `<med-data-table>` SHALL always render left-frozen and right-frozen columns and SHALL render only the non-frozen visible columns whose cumulative widths (using resized/declared `px` width or `virtualScrollColumnWidth`) intersect the horizontal scroll viewport plus a column buffer, inserting left and right horizontal spacer `<th>`/`<td>` cells in header, filter, body, frozen, skeleton, and footer rows so the total table width equals the sum of all visible column widths (plus utility columns). `totalColumnCount` SHALL reflect the rendered column count (including active horizontal spacers) so `colspan` rows stay aligned, and `<table>` SHALL expose `aria-colcount` with rendered data cells carrying `aria-colindex`.

#### Scenario DAT-063.S1: Only horizontal window and frozen columns render, and scrolling shifts the window

- **Given** a table with `virtualScrollColumns` set to `true`, `virtualScrollColumnWidth` `100`, 1 left-frozen column (`100px`), and 50 scrollable columns (`5,000px` scrollable width) in a `400px`-wide viewport
- **When** the table renders and then scrolls horizontally to `scrollLeft = 2,500`
- **Then** fewer than 20 columns are rendered in the DOM per row, the left-frozen column stays rendered, and the total table width is `5,100px`
- **And** scrolling to `2,500px` unmounts early scrollable columns, renders columns around index `25` with a left spacer, and keeps `aria-colcount="51"`

#### Scenario DAT-063.S2: Real-browser horizontal column virtualization with frozen column and vertical virtual scroll

- **Given** a `virtualScroll` + `virtualScrollColumns` table with `scrollHeight="200px"`, a left-frozen column, and 40 scrollable columns in a real browser
- **When** the user scrolls horizontally to the middle of the table
- **Then** the left-frozen column remains pinned on the left edge while middle columns appear in view and off-screen columns are omitted from the DOM
