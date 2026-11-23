# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

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

`med-table-column` SHALL accept `sortBy`, the name of the row property a sort by that column compares (default the column's `field`), and `sortCompare`, a function that compares two rows for ascending order and returns a negative number, zero or a positive number. Whenever the table sorts by a column, from a header click or key, from the initial or two-way `sortField` and `sortOrder`, or as a key of `multiSortMeta`, it SHALL order rows with that column's `sortCompare` when set, otherwise by the column's `sortBy` value with the default comparison, and a descending order SHALL reverse the result. `sortCompare` SHALL take precedence over `sortBy`. `sortField`, `multiSortMeta`, `aria-sort`, the `sort` event, `lazyLoad` and the persisted state SHALL keep naming the column by its `field`. With `lazy` the table SHALL NOT sort, as DAT-007 defines. Rows that compare equal SHALL keep their relative order, and the subheader grouping key SHALL keep the default comparison.

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

## MODIFIED Requirements

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
