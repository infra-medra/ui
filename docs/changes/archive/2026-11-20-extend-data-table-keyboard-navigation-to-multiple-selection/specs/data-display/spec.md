# Delta: Data display

**Capability:** `data-display`

## MODIFIED Requirements

### REQ DAT-026: Data table row keyboard navigation

When `selectionMode` is `single`, `radio` or `multiple`, body rows SHALL be focusable, and ArrowDown and ArrowUp on a focused row SHALL move focus to the next and previous row of the current page, Home SHALL move it to the first row and End to the last row. Moving focus SHALL NOT change the selection. Focus SHALL stay on the row at either end of the page, without wrapping. In `multiple` mode, Space and Enter on a focused row SHALL toggle that row in the selection. Without a selection mode these keys SHALL NOT be handled by the table.

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
- **And** in a table without a selection mode the key presses are not handled by the table

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
