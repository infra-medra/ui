# Proposal: add-data-table-pagination-options

## Why

Applications that paginate a `<med-data-table>` cannot place the paginator above the table, change its "Showing X-Y of Z" report, or turn on the first/last page buttons, page jump input, page link count or single-page hiding, although the embedded `med-paginator` already implements every one of them. Long tables force users to scroll to the bottom to change page, and applications that need a report such as "Page 2 of 7" or a different page-link count must drop the built-in paginator and wire their own. The table also gives the application no event when the user changes page outside lazy mode. These are the pagination items of the DataTable parity plan with PrimeNG that the frozen-rows and virtual scroll changes left to a separate change.

## What Changes

- The paginator can sit below the table (as today), above it, or both above and below, with both copies always showing the same page.
- The page report can be hidden or reworded through a template with placeholders for the first and last row, the total, the current page, the page count and the page size.
- The first/last page buttons, the page jump input, the number of page links and hiding the paginator when there is only one page can be configured from the table.
- The table emits an event whenever the user changes the page or the page size.
- The documentation page gets a paginator options example.

## Scope

### In scope

- `paginatorPosition`, `showCurrentPageReport`, `currentPageReportTemplate`, `showFirstLastIcon`, `showJumpToPageInput`, `pageLinks` and `alwaysShowPaginator` inputs on `DataTableComponent`, forwarded to the embedded paginator.
- Distinct, overridable accessible names for the two paginators when both are shown.
- A `pageChange` output carrying the paginator's page event.
- Unit tests, TSDoc, a `minor` changeset, one documentation example and Playwright coverage.

### Out of scope

- `med-tree-table` and `med-data-view` — they embed the same paginator but are not part of the DataTable parity plan; they can adopt the same inputs in their own change.
- A page dropdown (`showJumpToPageDropdown`) — `med-paginator` deliberately offers only the jump input, and its windowed page links already cover fast navigation.
- Paginator templates for custom left/right content — no consumer has asked for them, and the caption and summary slots already hold custom content next to the table.
- Pagination in `virtualScroll` mode — DAT-046 replaces the paginator there, and this change keeps that.

## Track

**Track:** full
**Rationale:** Fires `Interface`: new public inputs and a new `pageChange` output on `DataTableComponent`. `Size` does not fire on its own (mostly forwarding), and no other criterion fires: one capability, no stored data, no new dependency.
**Security:** not-relevant
**Security rationale:** Presentational change to paginator placement and labels in `@medra.dev/ui`; the report template is plain text interpolation rendered through Angular text binding, with no authentication, sensitive data, new external input parsing, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-049, DAT-024 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/`, `projects/site/src/app/pages/docs/components/`, `e2e/site/`
- **Interfaces:** New inputs `paginatorPosition`, `showCurrentPageReport`, `currentPageReportTemplate`, `showFirstLastIcon`, `showJumpToPageInput`, `pageLinks`, `alwaysShowPaginator`, `paginatorAriaLabel`, `paginatorTopAriaLabel`, `paginatorBottomAriaLabel` and output `pageChange` on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
