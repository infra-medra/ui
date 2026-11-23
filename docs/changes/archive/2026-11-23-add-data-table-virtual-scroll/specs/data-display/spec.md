# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

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

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, cell selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, vertical scroll with a sticky header, virtual scroll, lazy virtual scroll, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, conditional cell style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, caption/summary slots, custom empty template, skeleton loading, and context menu integration). A demo SHALL NOT use an input, output or template the component does not implement.

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
