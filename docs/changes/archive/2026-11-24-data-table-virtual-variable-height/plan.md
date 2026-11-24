# Plan: data-table-virtual-variable-height

## Summary

We add `virtualScrollRowHeight` (`((row: T, index: number) => number) | 'auto' | null`, default `null`) to `DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) backed by a pure prefix-sum height index helper in `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.ts`. When `virtualScrollRowHeight` is a function or `'auto'`, `rangeAt`, `virtualEntries` spacer heights, row `<tr [style.height.px]>`, and `focusVirtualRow` read cumulative offsets and binary-search the prefix-sum array (`O(log N)`), while `'auto'` mode disables fixed-height clipping on cells and measures rendered `tr[aria-rowindex]` elements after render via `ResizeObserver` with `scrollTop` delta compensation for rows above the viewport. When `virtualScrollRowHeight` is `null`, the existing `O(1)` `virtualScrollItemSize` path stays unchanged, satisfying `DAT-061` and preserving `DAT-046`–`DAT-048`.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `DataTableComponent` remains standalone with signal inputs/computeds; `data-table-virtual-heights.ts` exports pure functions/classes with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | n/a | No new styled elements or color tokens are introduced; `'auto'` mode only toggles `truncate` / `[style.height.px]` on existing body cells/rows. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlays or icons are added or modified. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps `DAT-061.S1` to Jest unit/component tests and `DAT-061.S2` (natural wrapping + `ResizeObserver` height measurement) to Playwright real-browser e2e verification. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Keyboard `ArrowUp`/`ArrowDown`/`Home`/`End` (`focusVirtualRow`) uses cumulative row offsets (`rowOffset`/`rowHeight`) and preserves `aria-rowcount`/`aria-rowindex`, verified in `DAT-061.S1`. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, specs, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No internal UI strings are added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | n/a | No package version or dependency changes. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Every scenario test in `DAT-061.S1` and `DAT-061.S2` will assert all Given/When/Then clauses with default inputs left unset. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts` and `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual-variable-height.spec.ts`
- **Framework:** Jest (`jest-preset-angular`) + Playwright

| Scenario | Level | Test location |
|---|---|---|
| `DAT-061.S1` | unit + integration | `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts`, `projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts` |
| `DAT-061.S2` | e2e | `e2e/site/data-table-virtual-variable-height.spec.ts` |

## Architecture & Interfaces

- **`data-table-virtual-heights.ts`:**
  - `buildVirtualHeightIndex(total, defaultSize, resolveHeight)`: builds `Float64Array` prefix sums (`offsets` of length `total + 1`, where `offsets[0] = 0` and `offsets[i + 1] = offsets[i] + h(i)`).
  - `findRowAtOffset(offsets, offset)`: binary search returning the largest `i` with `offsets[i] <= offset`.
  - `rangeAtVariableOffset(offsets, scrollTopOffset, viewportHeight, bufferRows)`: returns `[start, end)`.
  - `rangeHeight(offsets, fromIndex, toIndex)`: returns `offsets[toIndex] - offsets[fromIndex]` for spacer heights in `O(1)`.
- **`DataTableComponent`:**
  - New input `virtualScrollRowHeight = input<((row: T, index: number) => number) | 'auto' | null>(null)`.
  - `measuredRowHeights` (`signal<ReadonlyMap<number, number>>`) for `'auto'` mode, reset when `sortedValue()` / `effectiveTotalRecords()` changes, updated by a `ResizeObserver` watching rendered `tbody tr[aria-rowindex]` elements after render.
  - When `virtualScrollRowHeight() === 'auto'`, body cells omit `truncate` and `<tr>` omits fixed `[style.height.px]` so content wraps naturally; when a callback is provided, `<tr [style.height.px]="virtualRowHeight(entry.index)">` applies the exact height.

## Decisions

### D-01: Prefix-sum `Float64Array` + binary search over Fenwick tree

**Choice:** Use a `Float64Array` prefix-sum array (`offsets` of length `total + 1`) rebuilt in `computed()` when row data or measured heights change, with `O(log N)` binary search for viewport range lookup and `O(1)` `offsets[end] - offsets[start]` for spacers.
**Alternatives:** Fenwick tree (BIT) for `O(log N)` point updates; or linear scan over rows.
**Rationale:** Building a `Float64Array` of 100k numbers takes < 1ms and makes spacer/range lookups `O(1)`/`O(log N)` with zero tree-indexing bugs, while keeping the `'auto'` measurement path simple (batching `ResizeObserver` updates per frame into one map update).

### D-02: Separate `virtualScrollRowHeight` input preserving `virtualScrollItemSize` O(1) path

**Choice:** Add `virtualScrollRowHeight: ((row: T, index: number) => number) | 'auto' | null = null` instead of overloading `virtualScrollItemSize`.
**Alternatives:** Accepting `'auto'` or a callback in `virtualScrollItemSize`.
**Rationale:** Keeps `virtualScrollItemSize` as a clean numeric `numberAttribute` input (used as both the fixed height when `virtualScrollRowHeight` is `null` and the initial estimate / `lazy` placeholder fallback when `virtualScrollRowHeight` is set), preserving full backward compatibility with `DAT-046`–`DAT-048`.
