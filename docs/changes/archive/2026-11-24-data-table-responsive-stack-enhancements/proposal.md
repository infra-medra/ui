# Proposal: data-table-responsive-stack-enhancements

## Why

When `<med-data-table>` is in `responsiveLayout="stack"`, column headers are visually hidden (`sr-only`) and non-interactive, leaving users with no visible UI to sort columns while stacked. Additionally, `breakpoint` only evaluates viewport width via `window.matchMedia`, which prevents tables inside narrower split panes, drawers, or side-by-side panels from stacking based on their own container width.

## What Changes

- Render an accessible stacked sort control bar (`data-med-stack-sort`) when `stacked()` is active and at least one visible column is `sortable()`, with overridable English label inputs (`stackSortLabel`, `stackSortAscLabel`, `stackSortDescLabel`, `stackSortClearLabel`).
- Add `breakpointMode` (`'viewport' | 'container'`, default `'viewport'`) on `<med-data-table>` so consumers can opt into `ResizeObserver`-based container-width stacking against `breakpoint` (supporting `px`, `em`, and `rem` CSS lengths).

## Scope

### In scope

- Stacked sort control bar (column select + sort direction / clear controls) in `DataTableComponent`.
- `breakpointMode` (`'viewport' | 'container'`) using `ResizeObserver` in `DataTableComponent`.
- Unit/component tests in `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts`.

### Out of scope

- Virtual scroll extensions (variable row height, horizontal column virtualization, expansion/grouping/reorder in virtual mode) — separate design-per-item changes.

## Track

**Track:** fast
**Rationale:** Additive enhancements to `data-display` (`DAT-050`, `DAT-060`) preserving default `viewport` breakpoint behavior and `DAT-052` header semantics.
**Security:** not-relevant
**Security rationale:** Client-side `ResizeObserver` width measurement and sort signal updates on in-memory columns; no external input parsing, storage, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-050, DAT-060 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts`, `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts`.
- **Interfaces:** New `breakpointMode`, `stackSortLabel`, `stackSortAscLabel`, `stackSortDescLabel`, `stackSortClearLabel` inputs on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
