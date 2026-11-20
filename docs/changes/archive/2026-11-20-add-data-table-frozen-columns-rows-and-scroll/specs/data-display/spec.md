# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen rows, horizontal scroll and flexible scroll). A demo SHALL NOT use an input, output or template the component does not implement.

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
