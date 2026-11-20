# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

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

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity). A demo SHALL NOT use an input, output or template the component does not implement.

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
