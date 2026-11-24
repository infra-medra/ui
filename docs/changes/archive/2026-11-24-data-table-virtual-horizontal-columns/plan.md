# Plan: data-table-virtual-horizontal-columns

## Summary

We add `virtualScrollColumns` (`boolean`, default `false`) and `virtualScrollColumnWidth` (`number`, default `120`) to `DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`), reusing `buildVirtualHeightIndex`, `rangeAtVariableOffset`, and `rangeHeight` (`projects/medra/ui/src/lib/data-table/data-table-virtual-heights.ts`) as a 1D cumulative width index over non-frozen visible columns. Left-frozen and right-frozen columns always stay rendered, while scrollable columns are sliced to `[startCol, endCol)` from `viewportScrollLeft` and `measuredViewportWidth`, flanked by `data-med-col-spacer-left` and `data-med-col-spacer-right` cells in header, filter, body, frozen, skeleton, and footer rows. `tableWidthPx` reflects the full width across all visible columns (with `table-fixed`), `totalColumnCount` tracks the rendered column count (including active horizontal spacers) so `colspan` rows stay aligned, and `aria-colcount`/`aria-colindex` expose true column positions.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | All new state (`viewportScrollLeft`, `measuredViewportWidth`, `virtualColumnLayout`) uses Angular signals and computeds inside standalone `DataTableComponent`. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | Horizontal spacers use `border-0 p-0` with no new color tokens or styled components. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No new overlays or icons introduced. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps `DAT-063.S1` to Jest component tests ordered before implementation and `DAT-063.S2` (sticky frozen column + horizontal scroll + `table-fixed` layout) to Playwright real-browser verification. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | `<table>` exposes `aria-colcount`, rendered `<th>`/`<td>` expose 1-based `aria-colindex`, and horizontal spacers carry `aria-hidden="true"`. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, specs, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No internal UI strings are added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | n/a | No package version or dependency changes. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Both `DAT-063.S1` and `DAT-063.S2` tests will assert every Given/When/Then clause with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts` and `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual-columns.spec.ts`
- **Framework:** Jest (`jest-preset-angular`) + Playwright

| Scenario | Level | Test location |
|---|---|---|
| `DAT-063.S1` | integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts` |
| `DAT-063.S2` | e2e | `e2e/site/data-table-virtual-columns.spec.ts` |

## Architecture & Interfaces

- **Column partitioning (`virtualColumnLayout`):**
  - When `!virtualScrollColumns() || stacked()`: `leftFrozen = []`, `scrollable = visibleColumns()`, `rightFrozen = []`, `leftSpacerPx = 0`, `rightSpacerPx = 0` (zero-overhead passthrough).
  - When `virtualScrollColumns() && !stacked()`:
    - Partition `visibleColumns()` into `leftFrozen` (`isFrozen() && alignFrozen() === 'left'`), `scrollable` (`!isFrozen()`), `rightFrozen` (`isFrozen() && alignFrozen() === 'right'`).
    - Build cumulative width index over `scrollable` using `buildVirtualHeightIndex(scrollable.length, fallbackWidth, (i) => resolveColPxWidth(scrollable[i]))`.
    - Compute `[start, end)` via `rangeAtVariableOffset(offsets, scrollLeft, effectiveViewportWidth, VIRTUAL_COLUMN_BUFFER)` where `effectiveViewportWidth = Math.max(1, measuredViewportWidth() || DEFAULT_VIRTUAL_VIEWPORT_WIDTH_PX)`.
    - `leftSpacerPx = rangeHeight(offsets, 0, start)`, `rightSpacerPx = rangeHeight(offsets, end, scrollable.length)`.
- **Table & `colspan` alignment:**
  - `tableWidthPx` returns `utilityWidth() + leftFrozenWidth + totalScrollableWidth + rightFrozenWidth` when `virtualScrollColumns() && !stacked()` (and `table-fixed` is enabled so declared/default widths are honored).
  - `renderedColumns` returns `[...leftFrozen, ...scrollable.slice(start, end), ...rightFrozen]` and `totalColumnCount` includes `(leftSpacerPx > 0 ? 1 : 0) + (rightSpacerPx > 0 ? 1 : 0)`.
  - `expansionSegments()` treats horizontal spacers and rendered columns uniformly so `#rowexpansion` `colspan`s stay exact.

## Decisions

### D-01: Reuse `data-table-virtual-heights.ts` cumulative index for horizontal column widths

**Choice:** Reuse `buildVirtualHeightIndex`, `rangeAtVariableOffset`, and `rangeHeight` for variable-width horizontal columns.
**Alternatives:** Implementing a separate prefix-sum helper for widths.
**Rationale:** The 1D prefix-sum + binary search math is identical for row heights and column widths; reusing it avoids code duplication.

### D-02: Partition frozen columns outside the horizontal scrollable window

**Choice:** Keep `leftFrozen` and `rightFrozen` columns outside the virtualized `scrollable` slice and place horizontal spacers only around the `scrollable` slice.
**Alternatives:** Mixing frozen columns into the prefix-sum array and pinning them individually.
**Rationale:** Matches `frozenLayout` sticky edge assumptions (`left`/`right` offsets depend only on consecutive frozen columns at each edge) and keeps `leftSpacerPx` / `rightSpacerPx` strictly between frozen edges.
