# Proposal: add-data-table-cell-selection-and-context-menu

## Why

Applications using `<med-data-table>` currently can only select entire rows, apply conditional classes at the row level (`rowClass`), and wire row-level context menus manually on custom cell templates. Adding cell-level selection, conditional cell styling (`cellClass`), and built-in `ContextMenu` integration completes the remaining interaction parity items for `DataTableComponent`.

## What Changes

- Add cell-level selection (`cellSelection`, `cellSelect`, `cellUnselect`) to `<med-data-table>` supporting single and multiple cell selection, keyboard activation, and `dataKey` matching.
- Add conditional cell styling (`cellClass`) to `<med-data-table>` so applications can style individual body cells based on row data and column field.
- Add `ContextMenu` integration (`contextMenu`, `contextMenuSelection`, `contextMenuSelect`) to `<med-data-table>` so right-clicking or keyboard-invoking a context menu on a body row selects that row as the context target and opens the linked `[medContextMenu]`.
- Document and demonstrate cell selection, `cellClass`, and `ContextMenu` integration on the DataTable documentation page.

## Scope

### In scope

- Cell-level selection (`cellSelection`, `cellSelect`, `cellUnselect`, `TableCellSelection`) in `DataTableComponent`.
- Conditional cell class callback (`cellClass`) in `DataTableComponent`.
- Built-in `ContextMenuDirective` integration (`contextMenu`, `contextMenuSelection`, `contextMenuSelect`, `TableContextMenuSelectEvent`) in `DataTableComponent`, plus a public `show(...)` method on `ContextMenuDirective`.
- Unit tests, TSDoc updates, `minor` changeset, and live documentation examples with Playwright coverage.

### Out of scope

- Paginator position (`paginatorPosition`) and `currentPageReport` customization — separate pagination parity change.
- `virtualScroll` and `responsiveLayout="stack"` — separate layout changes requiring dedicated design.
- Range drag-selection across cells — only click and keyboard single/multiple cell selection are included.

## Track

**Track:** full
**Rationale:** Fires `Interface` (new public inputs, outputs, and exported types on `DataTableComponent` and `ContextMenuDirective`) and `Size` (expected > 8 tasks across library implementation, unit tests, TSDoc, docs demos, and Playwright verification).
**Security:** not-relevant
**Security rationale:** Purely presentational Angular table selection, CSS class binding, and context menu triggering in `@medra.dev/ui`; no authentication, sensitive data, external input parsing, secrets, infrastructure, or dependency changes.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-024, DAT-043, DAT-044, DAT-045 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/`, `projects/medra/ui/src/lib/context-menu/`, `projects/medra/ui/src/public-api.ts`, `projects/site/src/app/pages/docs/components/`, `e2e/site/`
- **Interfaces:** New `cellSelection`, `cellClass`, `contextMenu`, `contextMenuSelection` inputs/models and `cellSelect`, `cellUnselect`, `contextMenuSelect` outputs on `DataTableComponent`; `show()` method on `ContextMenuDirective`; exported `TableCellSelection` and `TableContextMenuSelectEvent` types.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
