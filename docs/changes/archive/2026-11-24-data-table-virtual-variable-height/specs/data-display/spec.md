# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-061: Data table variable row height in virtual scroll

`<med-data-table>` SHALL accept `virtualScrollRowHeight` (`((row: T, index: number) => number) | 'auto' | null`, default `null`). When `virtualScroll` is `true` and `virtualScrollRowHeight` is `null`, every row SHALL keep the fixed `virtualScrollItemSize` height (DAT-046). When `virtualScrollRowHeight` is a function, the table SHALL size each row's `<tr>` height, total scrollable area, top/bottom spacers, rendered window, and keyboard `ArrowUp`/`ArrowDown`/`Home`/`End` scroll targets from the cumulative heights returned by the function (clamped to at least 1px, and falling back to `virtualScrollItemSize` for unloaded `lazy` placeholders or non-finite values). When `virtualScrollRowHeight` is `'auto'`, body rows SHALL NOT force fixed `virtualScrollItemSize` height or clip cell text, and the table SHALL measure rendered row heights after render using `virtualScrollItemSize` as the initial estimate for unmeasured rows, updating cumulative offsets and spacers accordingly.

#### Scenario DAT-061.S1: Callback-driven variable row heights

- **Given** a `virtualScroll` table with `scrollHeight="200px"`, `virtualScrollItemSize` `40`, 50 rows where even rows are `80px` tall and odd rows are `40px` tall via `virtualScrollRowHeight`
- **When** the table renders and scrolls to offset `1,200px`
- **Then** the total scrollable height is `3,000px` (`25 * 80 + 25 * 40`)
- **And** the rendered rows match the cumulative-offset window around `1,200px` with each `<tr>` styled to its row height
- **And** pressing `End` scrolls to and focuses the last row (`index 49`)

#### Scenario DAT-061.S2: Auto-measured variable row heights in a real browser

- **Given** a `virtualScroll` table with `virtualScrollRowHeight="auto"`, `scrollHeight="200px"`, `virtualScrollItemSize` `40`, and rows whose text wraps to varying heights
- **When** the table renders in a browser and scrolls down
- **Then** body rows render at their natural content heights without truncation
- **And** the measured heights update the scrollable height beyond the `40px`-per-row initial estimate
