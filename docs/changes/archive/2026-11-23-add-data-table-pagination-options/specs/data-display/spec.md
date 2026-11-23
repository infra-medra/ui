# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, cell selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, paginator position, page report and paginator options, vertical scroll with a sticky header, virtual scroll, lazy virtual scroll, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, conditional cell style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, caption/summary slots, custom empty template, skeleton loading, and context menu integration). A demo SHALL NOT use an input, output or template the component does not implement.

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
