# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-062: Data table expansion, grouping, and row reorder in virtual scroll

When `virtualScroll` is `true` (and `lazy` is `false`), `<med-data-table>` SHALL support `#rowexpansion`, `rowGroupMode` (`'subheader'` and `'rowspan'`), `expandableRowGroups`, and `reorderable`:
1. `#rowexpansion`: Expanding a row SHALL render its expansion row directly beneath its data row in the virtual body, counting toward total scrollable height and `aria-rowcount` while keeping virtualization active.
2. `rowGroupMode="subheader"` and `expandableRowGroups`: Subheader rows SHALL be interleaved in the virtual item stream (using `groupRowsBy` as primary sort key), and collapsing a group via `expandableRowGroups` SHALL omit its rows from the virtual stream and emit `rowGroupCollapse`/`rowGroupExpand`.
3. `rowGroupMode="rowspan"`: Each rendered group run inside the virtual window SHALL render the merged `groupRowsBy` cell on the first rendered row of that run in the window with `rowspan` equal to the number of rendered rows (plus rendered expansion rows) of that run inside the window, omitting covered cells so the table remains rectangular even when the top of a group is scrolled out of view.
4. `reorderable`: Dragging a row in `virtualScroll` SHALL pin the dragged row in the rendered DOM until `drop` or `dragend`, and dropping on another row SHALL emit `rowReorder` with `dragIndex` and `dropIndex` relative to `value()`.

#### Scenario DAT-062.S1: Row expansion in virtual scroll

- **Given** a `virtualScroll` table with `scrollHeight="200px"`, `virtualScrollItemSize` `40`, 50 rows, `dataKey="id"`, and a `#rowexpansion` template
- **When** the user expands row 0 and scrolls down and back up
- **Then** the expansion row renders beneath row 0 inside the virtual body and increases the scrollable height
- **And** row 0 remains expanded after scrolling away and back

#### Scenario DAT-062.S2: Subheader grouping and expandable row groups in virtual scroll

- **Given** a `virtualScroll` table with `rowGroupMode="subheader"`, `groupRowsBy="team"`, `expandableRowGroups`, and rows in teams `"Alpha"` and `"Beta"`
- **When** the table renders and the user collapses `"Alpha"`
- **Then** subheader rows render in the virtual body and collapsing `"Alpha"` hides `"Alpha"`'s rows from the virtual stream while keeping `"Beta"`'s rows and emitting `rowGroupCollapse`

#### Scenario DAT-062.S3: Row-span grouping in virtual scroll across scroll offsets

- **Given** a `virtualScroll` table with `rowGroupMode="rowspan"`, `groupRowsBy="team"`, `scrollHeight="160px"`, `virtualScrollItemSize` `40`, and 20 rows in team `"Alpha"` followed by 10 in `"Beta"`
- **When** the table scrolls to offset `200px` (midway through `"Alpha"`)
- **Then** the first rendered row of `"Alpha"` in the window renders the `"Alpha"` cell with `rowspan` matching the rendered `"Alpha"` rows in the window
- **And** every rendered `<tr>` has a rectangular cell count matching the table columns

#### Scenario DAT-062.S4: Row reorder in virtual scroll

- **Given** a `virtualScroll` table with `reorderable` and 50 rows
- **When** the user starts dragging row 0, scrolls so row 0 would leave the window, and drops onto row 15
- **Then** row 0 remains pinned in the DOM during the drag
- **And** `rowReorder` emits `{ dragIndex: 0, dropIndex: 15 }` relative to `value()`
