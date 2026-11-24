# Delta: Data display

**Capability:** `data-display`

## ADDED Requirements

### REQ DAT-060: Data table stacked sort control

When `stacked()` is `true` and at least one visible column has `sortable` enabled, `<med-data-table>` SHALL render a visible sort control bar (`data-med-stack-sort`) allowing the user to pick a sortable column (labelled by `stackSortLabel`, default `"Sort by"`) and toggle or clear its sort order (`stackSortAscLabel`, `stackSortDescLabel`, `stackSortClearLabel`), updating `sortField`/`sortOrder` (or `multiSortMeta` in `sortMode="multiple"`), emitting `sort`, and triggering `lazyLoad` in `lazy` mode, while keeping the hidden `<thead>` header cells non-interactive per DAT-052.

#### Scenario DAT-060.S1: Sorting while stacked via the stacked sort control

- **Given** a stacked table with sortable columns `name` ("Name") and `price` ("Price")
- **When** the user selects `price` in the stacked sort control and toggles the sort direction to descending
- **Then** the stacked rows are ordered by `price` ascending, then descending
- **And** `sort` emits and `aria-sort` on the `price` header updates accordingly

## MODIFIED Requirements

### REQ DAT-050: Data table responsive stack layout

`med-data-table` SHALL accept `responsiveLayout` (`scroll` default, or `stack`), `breakpoint` (a CSS length, default `960px`), and `breakpointMode` (`'viewport'` default, or `'container'`). With `responsiveLayout="stack"` and the measured width (viewport width when `breakpointMode` is `'viewport'`, or the table host element's `ResizeObserver` width when `breakpointMode` is `'container'`) narrower than `breakpoint`, the table SHALL be stacked: each body row renders as a block and each data cell shows its column's label next to its value. With the default `scroll`, or at a width at least as wide as `breakpoint`, the table SHALL render and scroll horizontally exactly as before. Switching the viewport or container width across `breakpoint` SHALL update the layout without a reload. A cell's label SHALL be the column's `stackLabel` when set, else its `header`, and a column with neither SHALL show no label. A `breakpoint` that is not a valid CSS length SHALL leave the table unstacked. `virtualScroll` SHALL keep the table unstacked, because its row positions assume a fixed row height.

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

#### Scenario DAT-050.S7: Container-width breakpoint via ResizeObserver

- **Given** a table with `responsiveLayout="stack"`, `breakpointMode="container"`, and `breakpoint="500px"` inside a wide viewport
- **When** the host container's observed width changes from 600px to 420px and back to 500px
- **Then** the table is unstacked at 600px, stacked at 420px, and unstacked again at 500px
