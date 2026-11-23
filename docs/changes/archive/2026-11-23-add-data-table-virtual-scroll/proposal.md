# Proposal: add-data-table-virtual-scroll

## Why

Applications that show thousands of rows in `<med-data-table>` must either page them or render one DOM row per item, which makes scrolling, sorting and filtering slow on large datasets. A lazy table can only fetch data page by page, so a server-backed list cannot be browsed as one continuous scroll. Virtual scroll and lazy loading with preload are the last data-handling items of the DataTable parity plan with PrimeNG, and the remaining parity items depend on them.

## What Changes

- With `virtualScroll`, the table renders only the rows that fit its scroll viewport plus a small buffer, while the scrollbar still represents every row.
- Sorting, the global filter, column filters, selection (including select-all), editing, frozen columns, frozen rows and the context menu keep working over the whole row set, not only the rendered rows.
- Keyboard navigation reaches rows outside the viewport by scrolling them into view, and assistive technology hears the real row count and row positions.
- In `lazy` mode with `virtualScroll`, the table asks for blocks of rows through `lazyLoad` as the user scrolls, preloading the next block, and shows placeholder cells for rows not loaded yet.
- The documentation page gets a virtual scroll example and a lazy virtual scroll example.

## Scope

### In scope

- `virtualScroll` and `virtualScrollItemSize` inputs on `DataTableComponent`, for vertical scrolling with a fixed row height.
- Lazy loading by block with preload and placeholder rows when `lazy` and `virtualScroll` are both set.
- Keyboard navigation and ARIA row count and row index across the virtual row set.
- Unit tests, TSDoc, a `minor` changeset, two documentation examples and Playwright coverage.

### Out of scope

- Row expansion, subheader and row-span grouping, expandable row groups and row reorder in virtual mode — they change row height or need rows outside the DOM during a drag, and each needs its own design.
- Variable row heights — the fixed `virtualScrollItemSize` keeps the scroll math declarative and predictable.
- Horizontal (column) virtualization — tables in this library have tens of columns at most.
- Combining `virtualScroll` with `paginator` — two windowing models on one table; virtual mode replaces the paginator.
- `med-tree-table` and `med-data-view` — they have their own scrolling code and are not part of the DataTable parity plan.
- `paginatorPosition` and `currentPageReport` — a separate pagination parity change.

## Track

**Track:** full
**Rationale:** Fires `Interface` (new public inputs on `DataTableComponent` and a changed `lazyLoad` emission contract in virtual mode) and `Size` (more than 8 tasks across the library, unit tests, docs demos and Playwright). No other criterion fires: one capability, no stored data, no new dependency (`@angular/cdk` is already used).
**Security:** not-relevant
**Security rationale:** Purely presentational change to row rendering and scrolling in `@medra.dev/ui`; no authentication, sensitive data, new external input parsing, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-007, DAT-024, DAT-046, DAT-047, DAT-048 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/`, `projects/site/src/app/pages/docs/components/`, `e2e/site/`
- **Interfaces:** New `virtualScroll` and `virtualScrollItemSize` inputs on `DataTableComponent`; `lazyLoad` emits per block when `lazy` and `virtualScroll` are both set.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
