# Plan: add-data-table-virtual-scroll

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains `virtualScroll` and `virtualScrollItemSize` inputs (DAT-046), keyboard navigation and ARIA row positions across the whole row set (DAT-047), and block-based lazy loading with preload and placeholder rows when `lazy` and `virtualScroll` are both set (DAT-048, DAT-007). The table windows its body itself: it listens to `scroll` on the existing `data-med-scroll-viewport` element, derives the window of row indices from `scrollTop`, the measured viewport height and `virtualScrollItemSize`, renders those rows plus a buffer between two spacer rows whose heights stand for the rows outside the window, and keeps the header, frozen rows and frozen columns on the existing sticky layout. The DataTable documentation page (`projects/site/src/app/pages/docs/components/data-table.page.ts`) adds a virtual scroll and a lazy virtual scroll demo (DAT-024.S14). Unit tests live in `data-table.component.spec.ts` and layout-dependent scenarios are verified by Playwright.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Window state is `signal`/`computed`; the scroll listener and `ResizeObserver` write signals, so the view updates without zone.js. Demo components are standalone. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Spacer rows and placeholder cells reuse the existing `med-skeleton` and surface tokens; no new colors. The consumer `class` merge on the wrapper is untouched. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlay or icon is added. The context menu keeps going through `ContextMenuDirective`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `DataTableComponent` is not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario to Jest, and the scenarios that depend on scroll geometry (`DAT-046.S1`, `S2`, `S6`, `S7`, `DAT-047.S1`, `S2`, `DAT-048.S2`) also to Playwright, because jsdom has no layout. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | `aria-rowcount` on the table and `aria-rowindex` on every rendered row; spacer rows are `aria-hidden`; placeholder rows are not focusable; ArrowUp/ArrowDown/Home/End scroll the target row into view before focusing it (D-04). Focus ring styling is unchanged. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Windowing logic and demos are written from scratch, in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | No new visible or announced string: placeholders are skeleton cells without text. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | A `minor` changeset; no dependency or peer range change. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (unit) and `npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` (e2e, every data-table spec, see L-009)
- **Framework:** Jest (unit) and Playwright (e2e)
- **jsdom note:** jsdom reports no layout, so unit tests define `clientHeight` on the scroll viewport, set `scrollTop` and dispatch a `scroll` event to drive the window; geometry is asserted in Playwright.

| Scenario | Level | Test location |
|---|---|---|
| `DAT-046.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-046.S1` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-046.S2` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-046.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-046.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-046.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-046.S6` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-046.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-046.S7` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-046.S8` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-047.S1` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-047.S2` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-047.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-048.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-048.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-048.S2` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-048.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-048.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-048.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-007.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, must still pass) |
| `DAT-007.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, must still pass) |
| `DAT-024.S14` | e2e | `e2e/site/data-table-virtual-scroll.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-frozen.spec.ts` (existing, must still pass) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-resize-visibility-groups.spec.ts` (existing, must still pass) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-frozen.spec.ts` (existing, must still pass) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-column-reorder.spec.ts` (existing, must still pass) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-row-editing.spec.ts` (existing, must still pass) |
| `DAT-024.S11` | e2e | `e2e/site/data-table-column-filters.spec.ts` (existing, must still pass) |
| `DAT-024.S12` | e2e | `e2e/site/data-table-slots-skeleton.spec.ts` (existing, must still pass) |
| `DAT-024.S13` | e2e | `e2e/site/data-table-cell-context.spec.ts` (existing, must still pass) |

## Risks

- Browsers cap the height of a single element (about 33 million pixels in Chromium, about 17.9 million in Firefox): at 40 pixels per row, tables above roughly 440,000 rows break. The TSDoc for `virtualScroll` states the limit.
- `rowGroupMode`, `#rowexpansion` and `reorderable` combined with `virtualScroll` are out of scope (proposal); the TSDoc says they are ignored in virtual mode, and the tasks add a guard so they do not render half-working.
- Fast scrolling can leave a block requested but delivered late; placeholders cover it and the requested-block set prevents duplicate requests.

## Architecture & Interfaces

- **Inputs (`data-table.component.ts`):**
  - `virtualScroll = input(false, { transform: booleanAttribute })`.
  - `virtualScrollItemSize = input(40, { transform: numberAttribute })`: row height in pixels.
- **Window state (private/protected signals):**
  - `viewportScrollTop = signal(0)` and `viewportHeight = signal(0)`, written by a `(scroll)` listener on `[data-med-scroll-viewport]` and by a `ResizeObserver` created next to `observeHeaderHeight()`; `viewportHeight` falls back to the pixel value of `scrollHeight()` and then to 400 when the element reports no layout.
  - `virtualRange = computed(() => ({ start, end }))`: `start = max(0, floor((scrollTop - headerHeight) / size) - BUFFER)`, `end = min(total, ceil((scrollTop - headerHeight + viewportHeight) / size) + BUFFER)`, with `BUFFER = 5`.
  - `virtualEntries = computed(...)`: the ordered list rendered by the body `@for`. Each entry is either `{ kind: 'spacer', height }` or `{ kind: 'row', row, index }` where `index` is the absolute index in the processed row set. It holds the rows of `virtualRange` plus, when it lies outside that range, the row currently in edit (D-03), with spacers filling every gap so the sum of spacer heights and row heights equals `total × virtualScrollItemSize`.
- **Row set:** in virtual mode `pagedValue()` returns the whole `sortedValue()` (no `first`/`rows` slice, no paginator). `total` is `effectiveTotalRecords()`.
- **Template:** the viewport element is scrollable and gets `scrollHeight()` as its height cap, or `400px` when `virtualScroll` is set and `scrollHeight()` is null. The body `@for` iterates `virtualEntries()` in virtual mode and tracks rows by `rowTrackBy()(row, index)` with the absolute index. Spacers render as `<tr aria-hidden="true">` with one zero-padding, zero-border `<td [attr.colspan]="totalColumnCount()">` whose height is the gap. Rows get `[style.height.px]="virtualScrollItemSize()"` and `[attr.aria-rowindex]`; the `<table>` gets `[attr.aria-rowcount]`.
- **Lazy blocks:**
  - `requestedBlocks` is a plain `Set<number>` held outside signals. An effect reads `virtualRange()` and, for every block from the block of `start` to the block after the block of `end` that is not in the set, adds it and emits `lazyLoad` with `first = block × rows()` and `rows = rows()`, plus the current sort, global filter and `columnFilters`.
  - A second effect watches `sortField`, `sortOrder`, `multiSortMeta`, `globalFilterValue`, `columnFilters` and `rows`: it clears the set, resets the scroll position to 0 and lets the range effect request block 0 and the block after it. The existing `lazy` effect skips when `virtualScroll()` is on.
  - Entries whose `row` is `null` or `undefined` render a placeholder `<tr>` with a `med-skeleton` in every visible column (reusing the DAT-042 markup), with no `tabindex`, no click or key handlers and no selection column input.
- **Keyboard:** `moveRowFocus` in virtual mode computes the target absolute index from the focused row's `aria-rowindex`, scrolls the viewport so that row is fully in view, and focuses it in `afterNextRender` once it exists (D-04).
- **Select-all:** `toggleSelectAll()` keeps using `sortedValue()`; in lazy virtual mode it skips unloaded entries.
- **Docs (`projects/site/src/app/pages/docs/components/data-table.page.ts`):** two `EXAMPLES` entries, `virtual-scroll` (10,000 generated rows) and `lazy-virtual-scroll` (100,000 `totalRecords`, a sparse `value` filled block by block after a short simulated delay), each with prose, a live demo and a template code block.

## Decisions

### D-01: Own windowing with spacer rows instead of `CdkVirtualScrollViewport`

**Choice:** Compute the window in `DataTableComponent` from the scroll position of the existing viewport element and fill the gaps with spacer `<tr>` elements.
**Alternatives:** Wrap the `<table>` in `cdk-virtual-scroll-viewport` with `*cdkVirtualFor` on the rows.
**Rationale:** The CDK viewport transforms its content wrapper, which breaks the sticky header, sticky frozen rows and sticky frozen columns that already work through `position: sticky` inside `[data-med-scroll-viewport]`. Spacer rows keep one scroll container and one `<table>`, so DAT-046's header, frozen row and frozen column requirements need no new layout code.

### D-02: Absolute row index as the track key and template index

**Choice:** In virtual mode the body iterates entries that carry the absolute index, and `rowTrackBy`, `rowClassFor`, `cellClass` and the edit checks receive that index.
**Alternatives:** Keep the window-local `$index`.
**Rationale:** Callbacks such as `rowTrackBy` and `rowClass` already document a row index in the processed set; a window-local index would change meaning with every scroll and would make a row's view be recreated whenever the window moves by one row.

### D-03: Pin the row in edit instead of storing its draft

**Choice:** When `editingCell()` or `editingRow()` points to a row outside the window, render that row anyway, between spacers, until the edit ends.
**Alternatives:** Destroy the row and restore a copied draft when it returns.
**Rationale:** In cell mode the edit template owns its input state and reports nothing until `onSave`, so the table cannot copy a draft; keeping the view alive preserves the typed value (DAT-046.S8) and never commits or cancels the edit. The cost is at most one extra row in the DOM.

### D-04: Scroll first, focus after render

**Choice:** For ArrowUp/ArrowDown/Home/End the table sets `scrollTop` so the target row is in view, then focuses `tr[aria-rowindex="N"]` in `afterNextRender`.
**Alternatives:** Focus a spacer and move focus later, or give every row in the set a roving `tabindex` regardless of rendering.
**Rationale:** Only rendered rows can take focus; scrolling first makes the window include the target, and `aria-rowindex` already identifies it.

### D-05: Lazy `value` is a sparse array of `totalRecords` entries

**Choice:** The application writes each loaded block into an array of `totalRecords` entries; `undefined` or `null` means not loaded. The table keeps no row cache.
**Alternatives:** A table-owned cache fed through a method such as `setBlock(first, rows)`.
**Rationale:** Keeps `value` a plain input, matches DAT-048's text, and leaves caching, eviction and retry to the application. The table only remembers which blocks it requested.

### D-06: Fixed row height is enforced by the table, not assumed

**Choice:** Body rows get an explicit `height` of `virtualScrollItemSize` and body cells in virtual mode clip their overflow.
**Alternatives:** Trust the consumer to keep content within the row size.
**Rationale:** A taller row would drift every scroll offset; clipping makes the failure visible and local, and the TSDoc for `virtualScrollItemSize` states that content must fit.
