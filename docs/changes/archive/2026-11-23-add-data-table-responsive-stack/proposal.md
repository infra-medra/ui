# Proposal: add-data-table-responsive-stack

## Why

Applications that show a `<med-data-table>` on phones and narrow panes can only let it scroll sideways, so a user must pan across a wide table to read one record. The class doc lists a stacked layout as a deliberate v1 scope cut, to avoid the regression of the original library's mode (#16510), and says it can be layered on without a breaking change. This change is that layer: an opt-in layout that renders each row as a block with each cell labelled by its column header.

## What Changes

- A table can opt in to a stacked layout below a width breakpoint: each row becomes a block and each cell shows its column header as a label next to its value. The default stays the horizontal scroll, so existing tables do not change.
- A column can override its label, and a column with no header and no override shows no label.
- The table keeps its table semantics when stacked, so a screen reader still announces each cell's column header.
- Features that depend on a horizontal grid (sorting by header click, frozen columns, resize, column reorder, row reorder, row-span merging, virtual scroll) have stated behavior when stacked, listed in the delta.
- The documentation page gets a responsive stack example, and the class doc's scope-cut note is updated.

## Scope

### In scope

- `responsiveLayout` (`scroll` default, `stack`) and `breakpoint` (default `960px`) inputs on `DataTableComponent`, and a `stackLabel` input on `TableColumnComponent`.
- Layout done in CSS under a state attribute, with a `matchMedia` signal that only decides whether the stacked state applies. Rationale: a runtime breakpoint string cannot be written into a CSS media or container query without injecting a `<style>` element, while the signal keeps every layout rule in CSS and defaults to the scroll layout during server rendering.
- Table semantics kept when stacked through explicit `role` attributes on the native elements, and a visually hidden (never removed) header row.
- Stated behavior for sorting, frozen columns and rows, resize, column reorder and visibility, selection, row reorder, expansion, row groups, virtual scroll, scroll height, row-span grouping, column groups, and row and cell editing.
- Light and dark appearance from existing design tokens, Jest tests, Playwright tests at a narrow and a wide viewport, a documentation example (extends DAT-024), a `minor` changeset for `@medra.dev/ui`, and the class doc update.

### Out of scope

- Any change to the default horizontal-scroll behavior, because existing tables must render as before.
- A per-row custom stacked template: cells keep the column templates already declared, so one template serves both layouts.
- A sort control while stacked: it would need an internal string and a new overlay or select; a consumer can drive the sort model from its own control, and `aria-sort` stays correct.
- Container-width breakpoints: the breakpoint is a viewport width, as in the original library; a container-based variant can be added later without a breaking change.
- `med-tree-table` and `med-data-view`, which are not part of the DataTable parity plan.

## Track

**Track:** full
**Rationale:** Fires `Interface` (new public inputs on `DataTableComponent` and `TableColumnComponent`) and `Constitution` (Articles V and VI cannot be answered without a design decision on the mechanism and the accessibility approach). `Size` is likely to fire as well. One capability, no stored data, no new dependency.
**Security:** not-relevant
**Security rationale:** Presentational layout change; `breakpoint` is passed only to `window.matchMedia` and never written to the DOM or a stylesheet, and labels render through Angular text binding. No authentication, sensitive data, new external input parsing, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-050, DAT-051, DAT-052, DAT-024 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/`, `projects/site/src/app/pages/docs/components/`, `e2e/site/`, `.changeset/`
- **Interfaces:** New inputs `responsiveLayout` and `breakpoint` on `DataTableComponent` and `stackLabel` on `TableColumnComponent`. No outputs.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
