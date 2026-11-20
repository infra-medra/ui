# Plan: add-data-table-resize-modes-visibility-groups

## Summary

All behavior lives in `projects/medra/ui/src/lib/data-table/` (`data-table.component.ts`, `table-column.component.ts`) and is documented on the DataTable docs page under `projects/site/src/app/pages/docs/components/`. `columnResizeMode` (DAT-031) adds a `fit`/`expand` switch to the existing pointer-driven resize, `visible` (DAT-032) introduces a `visibleColumns` computed that every render, span, frozen-offset and export path reads in place of `columns()`, and the `#headerGroup` and `#footerGroup` templates (DAT-033) render extra rows in `<thead>` and a new `<tfoot>`. DAT-001, DAT-009 and DAT-010 follow from the same computed. DAT-024 is satisfied by four new docs sections: expand-mode resize, column toggle, column groups and a frozen column with the utility columns, plus a rewrite of the existing resize prose for the new default.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | D-01 to D-04 use `input()`, `contentChild()`, `computed()` and `signal()` on the existing standalone components; the demos are standalone |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | The only new element is `<tfoot>` (D-04), styled with the same surface and border tokens and `dark:` variants as the header; the table's consumer `class` path through `mergeClasses` is unchanged |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added; the column-toggle demo uses the existing `med-multi-select` |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | No form control is added or changed |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario; DAT-031.S1, S4 and DAT-024.S8 are layout-dependent and get Playwright coverage; tasks will order `[TEST]` first |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | n/a | No interactive element is added: the resize handle stays pointer-only and `aria-hidden` as today (keyboard resize is out of scope per the proposal), and hidden columns leave the DOM so they leave the accessibility tree |
| VII | Does every piece of logic, prose, example and icon in this change contain only original work, with all text added or changed outside `roadmap/` written in English? | pass | The approach follows D-01 and D-02, written from the delta requirements, and all docs prose, demos and comments are written in English |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The change adds no internal string: the footer and group rows are application-written templates |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | D-06 adds a `minor` changeset and touches no peer range |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` for unit tests; `npx playwright test e2e/site/data-table-columns.spec.ts e2e/site/data-table-docs.spec.ts e2e/site/data-table-frozen.spec.ts` for real-browser tests
- **Framework:** Jest with Angular testing utilities (jsdom, no layout, so widths come from stubbed `getBoundingClientRect`); Playwright for layout

| Scenario | Level | Test location |
|---|---|---|
| `DAT-031.S1` | e2e | `e2e/site/data-table-columns.spec.ts` (live fit demo; a unit test with stubbed rects covers the state) |
| `DAT-031.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-031.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-031.S4` | e2e | `e2e/site/data-table-columns.spec.ts` (live expand demo) |
| `DAT-031.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-032.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-033.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-033.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-033.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-033.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-001.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-009.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-010.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S8` | e2e | `e2e/site/data-table-frozen.spec.ts` |

## Resize and visibility mechanics

- Fit mode reads the dragged `<th>` width and its `nextElementSibling` width on pointer down. Hidden columns are not rendered (D-03), so the sibling is the next visible column.
- The applied delta is clamped to `[40 - startWidth, nextStartWidth - 40]`, and both widths are written into `resizedColumnWidths`, which already feeds `columnWidth()` and `frozenColumnPx()`.
- Expand mode clamps the dragged width at 40px and writes an inline table width of the start width plus the applied delta; the existing `overflow-x-auto` wrapper then scrolls.
- `frozenLayout`, `utilityFrozen`, `hasFrozenColumn`, `totalColumnCount`, the header and cell loops and `exportCSV` read `visibleColumns`; sorting and the default global-filter fields keep reading `columns()`.

## Decisions

### D-01: Fit mode moves width only between the dragged column and its right neighbour

**Choice:** In `fit`, only the dragged column and the next visible column get explicit widths, with a constant sum. No other column is touched.
**Alternatives:** Snapshot every column's width at drag start and redistribute proportionally; shrink the neighbour only until it hits the minimum and then take from the next ones.
**Rationale:** The table is already `table-fixed` and `w-full`, so a constant sum leaves the share of every auto-width column unchanged. This is the PrimeNG behavior the proposal names and the rule DAT-031.S1 and S2 state.

### D-02: Expand mode sets an inline table width

**Choice:** `expand` writes `width: <px>` on the `<table>` (start width plus applied delta), overriding `w-full`, and lets the existing `overflow-x-auto` wrapper scroll.
**Alternatives:** A `min-width` on the table, which cannot shrink it again after the drag reverses; resizing the wrapper.
**Rationale:** With `table-fixed`, growing the table by the dragged column's delta keeps every other column's width exact, which is what DAT-031.S4 asserts.

### D-03: One `visibleColumns` computed, sort and filter keep reading all columns

**Choice:** `visible: false` columns are filtered out of a single `visibleColumns` computed used by rendering, spans, frozen offsets and CSV export. Sort and the default global-filter fields keep reading `columns()`, and resized widths stay in the map keyed by field.
**Alternatives:** Wrap hidden cells in `@if` inside each loop; remove a hidden column from `columns()`.
**Rationale:** One derived list keeps the five consumers consistent and satisfies DAT-032's rule that hidden columns keep their sort, filter and width state. `[hidden]` or CSS hiding would leave the cells in the accessibility tree.

### D-04: Group rows are templates rendered in place, with a new `<tfoot>`

**Choice:** `contentChild('headerGroup')` is rendered with `ngTemplateOutlet` at the top of `<thead>`, above the leaf header row, and `contentChild('footerGroup')` inside a `<tfoot>` after the last `<tbody>`, only when the template exists. The footer is not sticky and its classes use the header's surface and border tokens with `dark:` variants.
**Alternatives:** A declarative `med-table-column-group` component; a template that replaces the whole header (as PrimeNG does).
**Rationale:** The user chose the template-driven route with the leaf row kept intact. Because the rows sit in the same `<thead>`, sorting, resize handles, frozen offsets and the `ResizeObserver` header height (frozen-rows `top` offset) keep working unchanged.

### D-05: Docs extend the resize section and add four sections

**Choice:** Keep `example-column-resize` for the fit default, add `example-column-resize-expand`, `example-column-toggle` (a `med-multi-select` driving `visible`), `example-column-groups` (header and footer group) and `example-frozen-columns-utility` (reorder handle, multiple selection and a frozen first column), each with demo, code block and prose, and register them in `EXAMPLES`.
**Alternatives:** One combined resize demo with a mode switch; documenting the utility columns inside the existing frozen section.
**Rationale:** DAT-024 requires one section per example with its own demo and code block, and S8 needs a dedicated demo to scroll and measure.

### D-06: The `fit` default ships as a `minor` changeset

**Choice:** One `minor` changeset notes the new inputs and that resizing now defaults to `fit`.
**Alternatives:** Keep `expand` as the default to avoid a behavior change; a `major` changeset.
**Rationale:** The user chose `fit` as the default at proposal time. A `major` is barred by Article X outside an Angular baseline move.
