# Plan: add-data-table-responsive-stack

## Summary

`DataTableComponent` (`projects/medra/ui/src/lib/data-table/data-table.component.ts`) gains `responsiveLayout` and `breakpoint` inputs, and `TableColumnComponent` gains `stackLabel` (DAT-050). A `stacked` computed is true only when `responsiveLayout` is `stack`, `virtualScroll` is off and a `matchMedia('(width < <breakpoint>)')` signal matches; all layout is CSS classes toggled by `stacked`, with no measuring. While stacked, the table keeps its semantics with explicit ARIA roles and a visually hidden header row, and each cell renders an `aria-hidden` label element (DAT-051). The features that assume a horizontal grid read `stacked` and switch off as the delta states (DAT-052). The docs page gets a `responsive-stack` example (DAT-024.S16), and a `minor` changeset ships it.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | New members are `input()` signals and `computed()`/`signal()`; the media listener is registered in `afterNextRender` and removed through `DestroyRef`; no NgModule or zone.js API (D-01). |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Stacked classes extend the table's existing class maps and `mergeClasses` calls, using `border-surface-200`, `text-surface-500` and `bg-surface-*` tokens with `dark:` pairs (D-04). The consumer `class` merge on the root is untouched. The table has no CVA today, so the stacked classes follow its map pattern rather than adding a new one. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | The change adds no overlay and no icon. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The change adds no form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario to a Jest test, and `DAT-050.S1`/`S2`/`S3`/`S4`, `DAT-051.S2`/`S5`, `DAT-052.S2`/`S3`/`S6`/`S8` and `DAT-024.S16` also to Playwright at a narrow and a wide viewport. Tasks will order each `[TEST]` first. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | D-03 fixes the roles and the visually hidden header; D-05 removes sortable headers from the tab order while stacked so no invisible focus stop remains (`DAT-052.S1`); row and checkbox focus rings are unchanged; label contrast uses `surface-500` on `surface-0` and `surface-400` on dark, both checked in the e2e run. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All logic, demo and docs text is written for this change in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | The change adds no internal string: labels come from the consumer's `header` or `stackLabel`. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | The changeset is `minor` and no dependency or peer range changes. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | `DAT-050.S1` leaves `responsiveLayout`, `breakpoint` and `stackLabel` unset; every other test asserts each Given and Then clause, noted in the task wording. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (unit) and `npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` (e2e, every data-table spec so the default scroll layout is re-verified)
- **Framework:** Jest (unit) and Playwright (e2e)

| Scenario | Level | Test location |
|---|---|---|
| `DAT-050.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-050.S1` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-050.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-050.S2` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-050.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-050.S3` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-050.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-050.S4` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-050.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-050.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S2` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-051.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-051.S5` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-052.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S2` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-052.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S3` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-052.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S6` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-052.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S8` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-052.S8` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (the new `responsive-stack` slug joins the checked lists) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S11` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S12` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S13` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S14` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S15` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S16` | e2e | `e2e/site/data-table-responsive-stack.spec.ts` |

Unit tests mock `window.matchMedia` with a controllable `MediaQueryList` (jsdom has none) and fire its `change` event for `DAT-050.S4`. jsdom cannot check layout, so the e2e spec measures real geometry at 400px and 1280px wide: block rows, a hidden header that takes no space, no horizontal overflow when stacked, sticky offsets gone, and label and separator colors in light and `dark`.

## Design

- **Inputs:** `responsiveLayout = input<'scroll' | 'stack'>('scroll')`, `breakpoint = input('960px')` on the table, and `stackLabel = input<string | null>(null)` on the column. A column's label is `stackLabel() ?? header()`, and an empty result renders no label element.
- **`stacked` computed:** `responsiveLayout() === 'stack' && !virtualScroll() && matches()`. `matches` is a `signal(false)`. An `effect` re-creates a `MediaQueryList` for `(width < ${breakpoint()})` whenever `breakpoint` changes, sets `matches` from it, listens to `change`, and removes the listener on cleanup. It runs only in the browser (`isPlatformBrowser`, as the file already does), so server rendering and the first client render are unstacked. An invalid length makes `matchMedia` report no match, which leaves the table unstacked (`DAT-050.S6`).
- **Root and classes:** the template reads `stacked()` into `[attr.data-stacked]` on the table, and class helpers (`tableClass`, `headerCellClass`, `bodyCellClass`, `utilityCellClass`) add stacked classes from one constant map per element kind. Rows get `block` with a `border-b`; cells get `flex items-baseline gap-2` and `text-left`; the table, row groups and rows get `block`; `showGridlines`, `stripedRows` and `size` classes still apply.
- **Header row:** `sr-only` classes on the `<thead>` (absolute, 1px, clipped), never `display: none` or `hidden`. The sticky classes of `scrollActive` are dropped while stacked.
- **Roles:** `[attr.role]` on the table, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>` and `<td>` is `table`, `rowgroup`, `row`, `columnheader` or `cell` only while stacked, and `null` otherwise, so unstacked markup is unchanged (`DAT-051.S4`).
- **Label element:** `<span aria-hidden="true" class="...">` rendered before the cell content only when `stacked()` and the label is non-empty. Colors: `text-surface-500 dark:text-surface-400`, row border `border-surface-200 dark:border-surface-700`.
- **Feature switches:** every one reads `stacked()`: header `(click)`/`(keydown)` sorting and `tabindex` (`onHeaderClick`, `onHeaderKeydown`, the header `[attr.tabindex]`), `isColumnDraggable`, `hasResizeHandle`, `rowReorderActive`, `frozenStyle`, `frozenUtilityClass`, `frozenCellClass`, the frozen `<tbody>` sticky classes, and the row-span column (`rowspanColumn`), which returns `null` while stacked. The `colspan` cells (subheader, expansion, empty, spacer) become `block` full-width through the same maps. Cell and row editing, selection and the caption and summary slots are not touched.
- **Class doc:** the scope-cut bullet becomes a description of the opt-in layout; the "None of these are dead ends" sentence is adjusted.
- **Docs:** `data-table-responsive-stack.demo.ts/.html` and a content text file under `projects/site/src/content/docs/`, an `example-responsive-stack` entry in `data-table.page.ts` placed after the horizontal and flexible scroll examples, and API rows for the three inputs. The demo uses the default breakpoint, and the e2e test sets the viewport.
- **Changeset:** `.changeset/data-table-responsive-stack.md`, `'@medra.dev/ui': minor`.

## Decisions

### D-01: A `matchMedia` signal decides, CSS lays out

**Choice:** Track the breakpoint with one `MediaQueryList` signal and put every layout rule in classes toggled by `stacked()`.
**Alternatives:** A pure CSS media or container query; a `ResizeObserver` on the wrapper; injecting a `<style>` element with the breakpoint.
**Rationale:** A breakpoint chosen at run time cannot be written into a Tailwind class or a CSS query, and a `<style>` element adds a CSP concern. The signal is one boolean, and layout stays in CSS where a real browser verifies it (`DAT-050.S2`, `S4`).

### D-02: Viewport width, not container width

**Choice:** `breakpoint` is compared with the viewport (`(width < bp)`).
**Alternatives:** Observe the table wrapper's own width.
**Rationale:** It matches the original library and the proposal. A container variant can be added later as a new value of `responsiveLayout` without breaking this API.

### D-03: Native elements with explicit roles, header clipped not hidden

**Choice:** Keep `<table>`/`<tr>`/`<td>` and add explicit roles while stacked; clip the header with `sr-only`.
**Alternatives:** Rebuild rows as `div`s with roles; `display: none` or `aria-hidden` on the header; CSS `content: attr()` labels.
**Rationale:** Setting `display: block` on table elements can drop their semantics in some browsers, and explicit roles restore them without a second DOM. A clipped header stays in the accessibility tree, so each cell keeps its column header. A label element can be `aria-hidden`, which generated content cannot, so the header is not announced twice (`DAT-051.S1`–`S3`).

### D-04: Existing class maps and tokens

**Choice:** Extend the existing `mergeClasses` helpers and class maps in the component with surface and border tokens and `dark:` pairs.
**Alternatives:** Introduce a new CVA recipe for the table.
**Rationale:** The table styles through these helpers today and has no CVA; a recipe for one boolean would be a second styling system in the file (`DAT-051.S5`).

### D-05: Sorting is not offered while stacked

**Choice:** While stacked, header click and key sorting do nothing and sortable headers leave the tab order; `aria-sort` and the application's sort model still apply.
**Alternatives:** Keep the clipped headers focusable; add a built-in sort select.
**Rationale:** A focusable header the user cannot see is a keyboard trap for screen magnifier users, and a built-in control needs an internal string and a new overlay, which the proposal puts out of scope (`DAT-052.S1`).

### D-06: Inactive grid features return unchanged

**Choice:** Frozen, resize, column reorder, row reorder and row-span read `stacked()` at the point of use, and keep their own state (widths, order, frozen offsets).
**Alternatives:** Clear that state when stacking starts.
**Rationale:** Reading the flag keeps one source of truth and lets the layout return exactly as it was when the viewport widens (`DAT-052.S8`).

### D-07: `virtualScroll` keeps the table unstacked

**Choice:** `stacked` is false whenever `virtualScroll` is on.
**Alternatives:** Stack with measured row heights.
**Rationale:** Window math assumes a fixed `virtualScrollItemSize`, and the proposal marks variable heights unsupported (`DAT-050.S6`).
