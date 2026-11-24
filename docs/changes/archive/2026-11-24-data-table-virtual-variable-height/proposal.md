# Proposal: data-table-virtual-variable-height

## Why

`<med-data-table>` in `virtualScroll` mode currently enforces a uniform `virtualScrollItemSize` pixel height on every body row and clips cell overflow, preventing tables with multi-line text, wrapping cells, or row-specific heights from using virtualization without truncating content or misaligning scroll offsets.

## What Changes

- Add `virtualScrollRowHeight` input (`((row: T, index: number) => number) | 'auto' | null`, default `null`) on `<med-data-table>`.
- When `virtualScrollRowHeight` is a function, compute row offsets, viewport window range, top/bottom spacer heights, and keyboard `focusVirtualRow` scroll targets from a prefix-sum index over per-row heights (using `virtualScrollItemSize` for unloaded `lazy` placeholders or invalid values).
- When `virtualScrollRowHeight` is `'auto'`, allow body rows/cells to size naturally without fixed-height clipping, measure rendered rows with `ResizeObserver`, update the prefix-sum height cache, and compensate `scrollTop` when measured heights above the viewport change.
- Preserve the O(1) fixed-height path when `virtualScrollRowHeight` is `null` (default).

## Scope

### In scope

- Prefix-sum / binary-search virtual range and offset calculation helper for variable row heights.
- `virtualScrollRowHeight` (`callback | 'auto' | null`) integration in `DataTableComponent` (rendering, spacers, scroll range, keyboard navigation `focusVirtualRow`, `lazy` placeholder fallback).
- Unit tests and real-browser Playwright verification for variable-height virtual scrolling.

### Out of scope

- Row expansion, row grouping (`subheader`/`rowspan`), expandable row groups, and row reordering inside `virtualScroll` — separate change with its own design.
- Horizontal column virtualization — separate change with its own design.

## Track

**Track:** full
**Rationale:** Architectural design required for prefix-sum virtual offset indexing, `'auto'` `ResizeObserver` height measurement, and scroll-anchor compensation without viewport jumping.
**Security:** not-relevant
**Security rationale:** Purely client-side row height measurement and scroll offset calculation on in-memory rows; no external input parsing, storage, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-061 |

## Impact

- **Code:** New helper `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.ts` (plus `.spec.ts`), `projects/medra/ui/src/lib/data-table/data-table.component.ts`, `data-table-virtual-variable-height.spec.ts`, and `e2e/site/data-table-virtual-variable-height.spec.ts`.
- **Interfaces:** New `virtualScrollRowHeight` input on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
