# Delta: Data display

**Capability:** `data-display`

## MODIFIED Requirements

### REQ DAT-026: Data table row keyboard navigation

When `selectionMode` is `single`, `radio` or `multiple`, or when `keyboardNavigation` is `true`, body rows SHALL be focusable, and ArrowDown and ArrowUp on a focused row SHALL move focus to the next and previous row of the current page, Home SHALL move it to the first row and End to the last row. Plain Arrow, Home, and End navigation SHALL NOT change the selection, and focus SHALL stay on the row at either end of the page, without wrapping. In `multiple` mode, Space and Enter on a focused row SHALL toggle that row in the selection; `Shift+ArrowDown`, `Shift+ArrowUp`, `Shift+Home`, and `Shift+End` SHALL move focus and select the contiguous range of rows from the anchor row to the target row; and `Ctrl+A` (or `Meta+A`) on a focused body row outside interactive/editing elements SHALL select all loaded rows. Without a selection mode and with `keyboardNavigation` false (default), these keys SHALL NOT be handled by the table.

#### Scenario DAT-026.S1: Arrow movement

- **Given** a table in `single` mode with focus on the second row
- **When** the user presses ArrowDown
- **Then** focus moves to the third row
- **And** the selection is unchanged

#### Scenario DAT-026.S2: Home and End

- **Given** a table in `radio` mode with focus on a middle row
- **When** the user presses Home, then End
- **Then** focus moves to the first row, then to the last row of the page

#### Scenario DAT-026.S3: Edges and no selection mode

- **Given** a focused first row in `single` mode
- **When** the user presses ArrowUp
- **Then** focus stays on the first row
- **And** in a table without a selection mode and without `keyboardNavigation` the key presses are not handled by the table

#### Scenario DAT-026.S4: Movement in multiple mode

- **Given** a table in `multiple` mode with two rows selected and focus on the second row
- **When** the user presses ArrowDown, then End, then Home
- **Then** focus moves to the third row, then to the last row of the page, then to the first row
- **And** the same two rows stay selected

#### Scenario DAT-026.S5: Toggling a row by key in multiple mode

- **Given** a table in `multiple` mode with focus on an unselected row
- **When** the user presses Space
- **Then** that row is added to the selection
- **And** pressing Enter on it removes it from the selection again

#### Scenario DAT-026.S6: Shift+Arrow range selection in multiple mode

- **Given** a table in `multiple` mode with focus on the second row
- **When** the user presses Shift+ArrowDown twice, then Shift+ArrowUp once
- **Then** pressing Shift+ArrowDown twice selects rows 2 through 4 and moves focus to row 4
- **And** pressing Shift+ArrowUp once shrinks the selected range to rows 2 through 3 and moves focus to row 3

#### Scenario DAT-026.S7: Ctrl+A select all in multiple mode

- **Given** a table in `multiple` mode with focus on a body row
- **When** the user presses Ctrl+A
- **Then** every loaded row is selected
- **And** default text selection is prevented

#### Scenario DAT-026.S8: Keyboard navigation without selection mode

- **Given** a table without `selectionMode` and with `keyboardNavigation` set to `true`
- **When** the user focuses the first row and presses ArrowDown, then End, then Home
- **Then** focus moves to the second row, then the last row of the page, then the first row
- **And** `selection` remains unchanged

### REQ DAT-043: Data table cell selection

When `cellSelection` is `true` and `selectionMode` is `'single'` or `'multiple'`, `<med-data-table>` SHALL allow selecting individual data cells instead of whole rows. Clicking a data cell, or pressing Enter or Space on a focused data cell, SHALL select or toggle that cell (`{ row, field }`), set `aria-selected="true"` and `tabindex="0"` on data cells, and emit `cellSelect` or `cellUnselect`. Pressing ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, or End on a focused data cell SHALL move focus to the target data cell within table bounds. In `'single'` mode, `selection` SHALL hold `{ row, field } | null` and selecting an already-selected cell SHALL be a no-op; in `'multiple'` mode, `selection` SHALL hold an array of `{ row, field }` entries, `Shift+Arrow*` / `Shift+Home` / `Shift+End` SHALL select the rectangular range of cells from the anchor cell to the target cell, `Ctrl+A` (or `Meta+A`) on a focused data cell SHALL select all data cells across loaded rows and visible columns, and dragging with the primary mouse button (`mousedown` on an anchor cell, hovering other cells, and releasing `mouseup`) SHALL select the rectangular range of cells between the anchor cell and the hovered cell. With `dataKey`, cell row matching SHALL compare by key across different object references; without it, by reference.

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

#### Scenario DAT-043.S3: Cell arrow navigation and Shift+Arrow range selection

- **Given** a table with `cellSelection` and `selectionMode="multiple"` with focus on cell `(row 1, col 0)`
- **When** the user presses ArrowRight, then Shift+ArrowDown and Shift+ArrowRight
- **Then** ArrowRight moves focus to `(row 1, col 1)` without selecting
- **And** Shift+ArrowDown followed by Shift+ArrowRight selects the rectangular range from `(row 1, col 1)` to `(row 2, col 2)`

#### Scenario DAT-043.S4: Ctrl+A selects all cells in multiple mode

- **Given** a table with `cellSelection` and `selectionMode="multiple"` with focus on a data cell
- **When** the user presses Ctrl+A
- **Then** `selection` contains every `{ row, field }` pair for loaded rows and visible columns
- **And** default text selection is prevented

#### Scenario DAT-043.S5: Mouse drag selects a rectangular cell range

- **Given** a table with `cellSelection` and `selectionMode="multiple"`
- **When** the user presses `mousedown` on cell `(row 0, col 0)`, moves `mouseenter` onto cell `(row 1, col 1)`, and releases `mouseup`
- **Then** `selection` contains all 4 cells in the 2×2 rectangle from `(row 0, col 0)` to `(row 1, col 1)`
- **And** subsequent mouse movement after `mouseup` does not alter `selection`
