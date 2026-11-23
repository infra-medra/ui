# Delta: Data Display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-043: Data table cell selection

When `cellSelection` is `true` and `selectionMode` is `'single'` or `'multiple'`, `<med-data-table>` SHALL allow selecting individual data cells instead of whole rows. Clicking a data cell, or pressing Enter or Space on a focused data cell, SHALL select or toggle that cell (`{ row, field }`), set `aria-selected="true"` and `tabindex="0"` on data cells, and emit `cellSelect` or `cellUnselect`. In `'single'` mode, `selection` SHALL hold `{ row, field } | null` and selecting an already-selected cell SHALL be a no-op; in `'multiple'` mode, `selection` SHALL hold an array of `{ row, field }` entries. With `dataKey`, cell row matching SHALL compare by key across different object references; without it, by reference.

#### Scenario DAT-043.S1: Single cell selection

- **Given** a table with `cellSelection` and `selectionMode="single"`
- **When** the user clicks a data cell
- **Then** that cell has `aria-selected="true"` and `selection` holds `{ row, field }`
- **And** `cellSelect` emits with that row and field, and clicking a second cell moves selection to the second cell

#### Scenario DAT-043.S2: Multiple cell selection and key matching

- **Given** a table with `cellSelection`, `selectionMode="multiple"`, and `dataKey`
- **When** the user clicks two different data cells
- **Then** both cells have `aria-selected="true"` and `selection` contains both `{ row, field }` entries
- **And** clicking an already-selected cell deselects it and emits `cellUnselect`

### REQ DAT-044: Data table conditional cell styling

`med-data-table` SHALL accept `cellClass` (`((row: T, field: string) => string) | null`, default `null`) and SHALL apply the returned CSS classes to each corresponding body data `<td>` alongside column alignment, gridlines, and frozen cell classes.

#### Scenario DAT-044.S1: Conditional cell class applied

- **Given** a table with `cellClass` returning `'bg-red-100'` when `field === 'status'` and `row.status === 'critical'`
- **When** the table renders
- **Then** only the `status` cell of rows with `status === 'critical'` receives `'bg-red-100'`

### REQ DAT-045: Data table context menu integration

`med-data-table` SHALL accept `contextMenu` (`ContextMenuDirective | null`, default `null`) and `contextMenuSelection` (`model<T | null>(null)`), and SHALL emit `contextMenuSelect` (`{ originalEvent, row, field? }`) when a context menu is invoked on a body row (via right-click, `ContextMenu` key, or `Shift+F10`). When `contextMenu` is set, invoking the context menu on a body row SHALL prevent the native browser context menu, update `contextMenuSelection` to that row, emit `contextMenuSelect`, and open the linked `ContextMenuDirective` at the pointer position (or anchored to the row element for keyboard invocation).

#### Scenario DAT-045.S1: Right-click row opens linked context menu

- **Given** a table with `[contextMenu]="cm"` and `[(contextMenuSelection)]="selectedRow"`
- **When** the user right-clicks a body row
- **Then** `contextMenuSelection` is updated to that row and `contextMenuSelect` emits
- **And** the linked `ContextMenuDirective` opens its menu panel

#### Scenario DAT-045.S2: Keyboard context menu on focused row

- **Given** a table with `[contextMenu]="cm"` and a focused body row
- **When** the user presses `Shift+F10` or the `ContextMenu` key
- **Then** `contextMenuSelection` is updated to that row, `contextMenuSelect` emits, and the linked `ContextMenuDirective` opens

## MODIFIED Requirements

### REQ DAT-024: Data table documentation page

The DataTable documentation page SHALL declare an ordered `EXAMPLES` list that feeds its "On this page" index, and every entry SHALL resolve to a section whose `id` equals the entry id and which holds English prose, a live demo and a code block showing that demo's template. The page SHALL cover each DataTable feature the component already implements (basic table, single, multiple and radio selection, cell selection, single and multiple sorting, global filter, column filter menu, pagination with page-size options, vertical scroll with a sticky header, row expansion, subheader row grouping, row-span grouping, expandable row groups, column resize with its fit and expand modes, column toggle, column groups, column reorder, cell editing, cell editing with selection, row editing, loading, lazy mode, empty state, column templates, conditional row style, conditional cell style, persisted state, CSV export, row reorder with `dataKey` and events, size, grid lines, striped rows, row keyboard navigation, accessible row labels and row identity, frozen columns, frozen columns combined with the reorder and selection columns, frozen rows, horizontal scroll and flexible scroll, caption/summary slots, custom empty template, skeleton loading, and context menu integration). A demo SHALL NOT use an input, output or template the component does not implement.

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
