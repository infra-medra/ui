# Plan: add-data-table-frozen-columns-rows-and-scroll

## Summary

`med-data-table` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains active `frozen`/`alignFrozen` columns, a `frozenValue` + `frozenRowsPosition` pair of inputs, and `scrollHeight="flex"`. Frozen columns reuse the declarative `position: sticky` technique of `med-tree-table`: each frozen cell gets an inline `left`/`right` offset derived from a `computed()` over the column list, with no resize listener (DAT-028). Frozen rows render through the same column templates in their own sticky `<tbody>` sections, fed by a separate input that bypasses the sort/filter/page pipeline (DAT-029). `scrollHeight="flex"` turns the host into a flex column so the wrapper fills its parent, and the existing `overflow-x-auto` wrapper is pinned down with tests (DAT-030). The docs page gets five examples (DAT-024.S6) and a minor changeset ships the API.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Only `DataTableComponent` (already standalone, OnPush) changes; new inputs use `input()`, offsets use `computed()`, the header measurement uses `signal` + `ResizeObserver` (D-03). Five new demos are standalone. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Frozen cells use `bg-surface-*` tokens with `dark:` variants, built through `mergeClasses` like the existing cell classes; the wrapper keeps `mergeClasses(…, this.class())` (D-04). |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay and no new icon: sticky positioning and an existing row template only. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `med-data-table` is a display component, not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario; scroll/sticky/height scenarios (DAT-028.S1/S2, DAT-029.S3/S6, DAT-030.S1/S2) go to Playwright because jsdom has no layout. Tasks will order `[TEST]` first. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | No new interactive element. Frozen rows get no `tabindex`, `aria-selected` or key handlers (D-02); frozen cells keep native `th`/`td` semantics. Unit test DAT-029.S4 asserts they are not selectable. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Original code written for this repo; the technique is a plain CSS idiom. All TSDoc, demos, prose and the changeset are English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | No new internal UI string: frozen rows render consumer templates. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | One `minor` changeset in `.changeset/`, no dependency or peer change. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` (unit); `npx playwright test e2e/site/data-table-frozen.spec.ts e2e/site/data-table-docs.spec.ts` (real browser)
- **Framework:** Jest with Angular TestBed (jsdom) and Playwright against the docs site. `testing.mode` is `tdd`: each `[TEST]` task precedes its implementation.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-028.S1` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-028.S2` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-028.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-028.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (class `table-fixed`, opaque `bg-surface-*` class); computed `table-layout` and `background-color` in `e2e/site/data-table-frozen.spec.ts` |
| `DAT-028.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-028.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-029.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-029.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-029.S3` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-029.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-029.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-029.S6` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-030.S1` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-030.S2` | e2e | `e2e/site/data-table-frozen.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` |

## Design

**Frozen columns.** A `frozenLayout` computed maps each `TableColumnComponent` to `{ side, offset }`. Right-edge offsets sum the widths of later right-frozen columns; left-edge offsets start from the left utility width and add earlier left-frozen columns. A column's width is the resized width from `resizedColumnWidths()`, else the parsed pixel value of `width()`, else 60 (same fallback as `TreeTableComponent`). Header and body cells apply `position: sticky; left|right: <offset>px; z-index: 1`, plus an opaque background and a border on the scroll-facing edge. Body-cell background follows row state (selected, striped, hover through a `group` class on the row), because a sticky cell does not inherit it. Any frozen column adds `table-fixed`, as `resizableColumns` already does.

**Utility columns.** The reorder handle (32px), selection and radio (40px) cells get exact inline pixel widths instead of `w-8`/`w-10`. When a left-frozen data column exists they are sticky on the left in the order reorder, selection; their summed width is the base offset. Without a left-frozen column, or with only right-frozen ones, they stay unsticky. The component has no expansion toggle column (expansion is driven by `toggleRowExpansion()` and renders a full-width `colspan` row), so there is nothing to freeze there; that row is not sticky.

**Frozen rows.** Row cells move into one `ng-template` reused by the `value` loop and by two extra sections: a `<tbody>` before the main one (`top`) and one after (`bottom`), each rendered only for a non-empty `frozenValue`. They are sticky: `top` at the measured header height, `bottom` at `0`, both with an opaque background. Frozen rows render the utility cells empty, carry no selection state, handlers, `tabindex`, drag or group header, and are excluded from `sortedValue`, `pagedValue`, `allSelected`, CSV export and `effectiveTotalRecords`.

**Flexible height.** With `scrollable` and `scrollHeight="flex"` the host becomes `flex flex-col h-full min-h-0` and the wrapper `flex-1 min-h-0 overflow-auto` with no `max-height`; any other value keeps today's `max-height`. The header stays sticky as before. The wrapper keeps `overflow-x-auto` and the host gets `min-w-0`, so a wide table never widens the page.

## Decisions

### D-01: Declarative sticky offsets from a computed, not DOM measurement

**Choice:** Frozen column offsets come from a `computed()` over declared and resized widths, with a 60px fallback, and the table switches to fixed layout so declared widths hold.
**Alternatives:** Measure cell widths with `ResizeObserver` and write offsets imperatively (PrimeNG's approach); `position: sticky` without offsets.
**Rationale:** The imperative approach is the source of PrimeNG's "does not recompute on layout change" bugs and `med-tree-table` already proves the declarative one. Offsets stay exact only under fixed layout, which DAT-028 requires.

### D-02: Frozen rows are display-only and share one row template

**Choice:** Extract the cell loop into one `ng-template` used by `value` rows and frozen rows; frozen rows get no handlers, `tabindex`, `aria-selected` or drag, and empty utility cells.
**Alternatives:** Prepend `frozenValue` to the paged list with a flag; duplicate the cell markup.
**Rationale:** A merged list would leak frozen rows into sort, filter, paging, selection and CSV export (DAT-029). A duplicated cell loop would drift from the real one, losing column templates and alignment.

### D-03: Sticky `<tbody>` sections with one measured header height

**Choice:** Frozen-top and frozen-bottom rows each sit in their own sticky `<tbody>`. The top section's `top` is the header height, taken from a `ResizeObserver` on the `<thead>` stored in a signal, started after first render in the browser only.
**Alternatives:** Per-row sticky `<tr>` with per-row heights measured; frozen rows inside the sticky `<thead>`; a CSS custom property set by hand.
**Rationale:** One measurement covers any number of frozen rows and the `bottom` case needs none. Putting them in `<thead>` would break "first body row" (DAT-029.S1). This is the one place a measurement is unavoidable, because header height depends on size, font and wrapping; D-01's concern applies to column widths, which stay declarative.

### D-04: `flex` through host classes, not a pixel height

**Choice:** `scrollHeight="flex"` switches the host to a flex column and the wrapper to `flex-1 min-h-0`, built through `mergeClasses`.
**Alternatives:** `height: 100%` on the wrapper; reading the parent height in JS.
**Rationale:** Percentage heights need every ancestor to have a definite height, and the filter bar and paginator share the host. A flex column gives the wrapper exactly the remaining space with no JS.

### D-05: Utility column widths become inline pixels

**Choice:** Reorder 32px, selection and radio 40px, set inline on `th` and `td` (and `min-width`) in place of `w-8`/`w-10`.
**Alternatives:** Keep Tailwind widths and measure them; `rem`-based offsets.
**Rationale:** Sticky offsets must be exact numbers and a `w-*` class is only a request under table layout. Pixel widths match today's 16px-root values, so appearance does not change.
