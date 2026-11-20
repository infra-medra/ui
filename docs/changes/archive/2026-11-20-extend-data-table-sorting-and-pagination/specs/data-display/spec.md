# Delta: Data display

**Capability:** `data-display`

## MODIFIED Requirements

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
