# Delta: data-display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

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
