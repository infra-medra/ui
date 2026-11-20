# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

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
