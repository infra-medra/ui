# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single and multiple selection, single and multiple sorting, global filter, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, column resize, cell editing, loading, lazy mode, empty state, column templates, conditional row style, persisted state, CSV export, and row reorder with `dataKey` and events). A demo SHALL NOT use an input, output or template the component does not implement.

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
