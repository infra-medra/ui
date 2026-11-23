# Proposal: add-data-table-slots-and-skeleton

## Why

Applications using `<med-data-table>` currently have no way to render a table-level caption bar, a bottom summary bar, a custom empty-state template, or skeleton loading placeholders. Today consumers must wrap the table in external containers for headers/summaries and are limited to plain `emptyLabel` text and a spinner overlay during loading.

## What Changes

- Add `#caption` and `#summary` template slots to `<med-data-table>` so applications can render custom content above and below the table.
- Add `#empty` template slot to `<med-data-table>` so applications can replace the default `emptyLabel` message with rich content (icons, actions, custom copy).
- Add `loadingMode` (`'spinner' | 'skeleton'`, default `'spinner'`) to `<med-data-table>` so applications can show skeleton placeholder rows during loading while keeping the existing spinner overlay as the default.
- Document and demonstrate all new slots and loading skeleton behavior on the DataTable documentation page.

## Scope

### In scope

- `<med-data-table>` template slots for caption, summary, and empty state.
- `<med-data-table>` skeleton loading mode when `loading` is active.
- Unit tests, TSDoc updates, changeset, and live documentation examples with Playwright coverage for the new features.

### Out of scope

- Paginator position (`paginatorPosition`) and `currentPageReport` customization — separate pagination parity change.
- Cell-level conditional styling (`cellClass`), cell selection, and `ContextMenu` integration — separate interaction changes.
- `virtualScroll` and `responsiveLayout="stack"` — larger layout changes requiring dedicated design.

## Track

**Track:** full
**Rationale:** Fires `Interface` (new public template slots and loading API on `DataTableComponent`) and `Size` (expected > 8 tasks across library implementation, unit tests, TSDoc, docs demos, and Playwright verification).
**Security:** not-relevant
**Security rationale:** Purely presentational Angular template projection and loading placeholders in `@medra.dev/ui`; no authentication, sensitive data, external input parsing, secrets, infrastructure, or dependency changes.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-007, DAT-024, DAT-040, DAT-041, DAT-042 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/`, `projects/site/src/app/pages/docs/components/`, `e2e/site/`
- **Interfaces:** New template slots and loading configuration input on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
