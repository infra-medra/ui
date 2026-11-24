# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-063: Data table horizontal column virtualization

`<med-data-table>` SHALL accept `virtualScrollColumns` (`boolean`, default `false`) and `virtualScrollColumnWidth` (`number`, default `120`, clamped to at least 1px). When `virtualScrollColumns` is `true` and the table is not stacked, `<med-data-table>` SHALL always render left-frozen and right-frozen columns and SHALL render only the non-frozen visible columns whose cumulative widths (using resized/declared `px` width or `virtualScrollColumnWidth`) intersect the horizontal scroll viewport plus a column buffer, inserting left and right horizontal spacer `<th>`/`<td>` cells in header, filter, body, frozen, skeleton, and footer rows so the total table width equals the sum of all visible column widths (plus utility columns). `totalColumnCount` SHALL reflect the rendered column count (including active horizontal spacers) so `colspan` rows stay aligned, and `<table>` SHALL expose `aria-colcount` with rendered data cells carrying `aria-colindex`.

#### Scenario DAT-063.S1: Only horizontal window and frozen columns render, and scrolling shifts the window

- **Given** a table with `virtualScrollColumns` set to `true`, `virtualScrollColumnWidth` `100`, 1 left-frozen column (`100px`), and 50 scrollable columns (`5,000px` scrollable width) in a `400px`-wide viewport
- **When** the table renders and then scrolls horizontally to `scrollLeft = 2,500`
- **Then** fewer than 20 columns are rendered in the DOM per row, the left-frozen column stays rendered, and the total table width is `5,100px`
- **And** scrolling to `2,500px` unmounts early scrollable columns, renders columns around index `25` with a left spacer, and keeps `aria-colcount="51"`

#### Scenario DAT-063.S2: Real-browser horizontal column virtualization with frozen column and vertical virtual scroll

- **Given** a `virtualScroll` + `virtualScrollColumns` table with `scrollHeight="200px"`, a left-frozen column, and 40 scrollable columns in a real browser
- **When** the user scrolls horizontally to the middle of the table
- **Then** the left-frozen column remains pinned on the left edge while middle columns appear in view and off-screen columns are omitted from the DOM
