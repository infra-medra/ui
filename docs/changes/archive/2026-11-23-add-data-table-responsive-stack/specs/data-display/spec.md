# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-050: Data table responsive stack layout

`med-data-table` SHALL accept `responsiveLayout` (`scroll` default, or `stack`) and `breakpoint` (a CSS length, default `960px`). With `responsiveLayout="stack"` and a viewport narrower than `breakpoint`, the table SHALL be stacked: each body row renders as a block and each data cell shows its column's label next to its value. With the default `scroll`, or at a viewport at least as wide as `breakpoint`, the table SHALL render and scroll horizontally exactly as before. Switching the viewport across `breakpoint` SHALL update the layout without a reload. A cell's label SHALL be the column's `stackLabel` when set, else its `header`, and a column with neither SHALL show no label. A `breakpoint` that is not a valid CSS length SHALL leave the table unstacked. `virtualScroll` SHALL keep the table unstacked, because its row positions assume a fixed row height. Labels SHALL NOT add any internal string.

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

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, cell selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, paginator position, page report and paginator options, vertical scroll with a sticky header, virtual scroll, lazy virtual scroll, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, conditional cell style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, caption/summary slots, custom empty template, skeleton loading, and context menu integration, and the responsive stacked layout). A demo SHALL NOT use an input, output or template the component does not implement.

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
