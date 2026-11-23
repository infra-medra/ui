# Plan: add-data-table-column-templates-and-custom-sort

## Summary

`TableColumnComponent` (`projects/medra/ui/src/lib/data-table/table-column.component.ts`) gains a `#header` template query (DAT-053), a `footer` input with a `#footer` template query (DAT-054), and `sortBy`/`sortCompare` inputs (DAT-055). `DataTableComponent` renders the header template in place of the `header` text inside the existing header cell, so sort indicator, priority badge, funnel button, resize handle and `aria-sort` stay where they are, and its click and key handlers ignore events coming from interactive elements inside the template. One `<tfoot>` renders when a `#footerGroup` template or a visible column footer exists (DAT-033), holding the footer group rows first and a column footer row built from `visibleColumns()` with the same frozen, alignment and stacked helpers the header and body use. Every client-side sort goes through one per-column comparator resolved by `field`, so header sorting, presorting and `multiSortMeta` all use it while the sort state keeps naming the `field`. The docs page gets a `column-header-footer` example (DAT-024.S17) and a `minor` changeset ships it.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | New members are `input()`, `contentChild()`/`contentChildren()` and `computed()` signals on the existing standalone components; the new demo is standalone (D-01, D-05). |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Footer cells reuse `SIZE_PADDING_CLASS`, `ALIGN_CLASS`, `gridClass()`, `frozenCellClass(col, null, 0)` and the existing `<tfoot>` classes (`bg-surface-50 dark:bg-surface-800/50`, `border-surface-200 dark:border-surface-700`) through `mergeClasses`, as D-04 of the responsive stack change did; no new styling system. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | No new overlay; the funnel popover and sort icon stay as they are, and the demo's header icon uses `med-icon`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The change adds no form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario to Jest; the layout ones (`DAT-054.S5`, `DAT-054.S6`, `DAT-053.S1`, `DAT-053.S3`) and `DAT-024.S17` also to Playwright. Tasks will order each `[TEST]` first. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | The header cell keeps `scope="col"`, `aria-sort`, `tabindex` and its focus ring; D-02 keeps Enter/Space on a templated button from sorting (`DAT-053.S3`); footer cells are plain `<td>` with stacked roles and an `aria-hidden` label as body cells (`DAT-054.S6`); footer text uses the existing `text-surface-700 dark:text-surface-200` on `surface-50`/`surface-800`, checked in the e2e run. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Logic, demo data and docs prose are written for this change in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | No internal string is added: header and footer content and labels come from the consumer (`header`, `footer`, `stackLabel`, templates). |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | `.changeset/data-table-column-templates-and-custom-sort.md` is `minor`; no dependency or peer range changes. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | `DAT-053.S2`/`S3` and `DAT-055.S1`/`S2` start with `sortField` unset; `DAT-055.S1` leaves `sortCompare` unset; `DAT-054.S1` leaves `#footer` unset; every test asserts each Given and Then clause, noted in the task wording. |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` (unit) and `npx playwright test --reporter=list --trace off e2e/site/data-table-*.spec.ts` (e2e, every data-table spec so the footer group, frozen and stacked layouts are re-verified)
- **Framework:** Jest (unit) and Playwright (e2e)

| Scenario | Level | Test location |
|---|---|---|
| `DAT-053.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-053.S1` | e2e | `e2e/site/data-table-column-templates.spec.ts` |
| `DAT-053.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-053.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-053.S3` | e2e | `e2e/site/data-table-column-templates.spec.ts` |
| `DAT-053.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S5` | e2e | `e2e/site/data-table-column-templates.spec.ts` |
| `DAT-054.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-054.S6` | e2e | `e2e/site/data-table-column-templates.spec.ts` |
| `DAT-054.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-055.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-055.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-055.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-055.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-055.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts` |
| `DAT-033.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, must still pass) |
| `DAT-033.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, must still pass) |
| `DAT-033.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test rewritten to the new Given: no `#footerGroup` and no column `footer` or `#footer`) |
| `DAT-033.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing, must still pass) |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (the new `column-header-footer` slug joins the checked lists) |
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
| `DAT-024.S16` | e2e | `e2e/site/data-table-docs.spec.ts` (existing, must still pass) |
| `DAT-024.S17` | e2e | `e2e/site/data-table-column-templates.spec.ts` |

The unit tests live in a new spec file beside `data-table-responsive-stack.spec.ts`, since `data-table.component.spec.ts` is already 5,800 lines. `DAT-054.S5` unit checks the bound `position`/`left` of the footer cell against the body cell; the e2e test scrolls a real table and compares `getBoundingClientRect().left`. `DAT-054.S6` unit mocks `matchMedia` as the stack spec does; e2e checks block layout and the visible label at 400px. `DAT-053.S3` e2e confirms a real button keeps keyboard activation (Space has no default suppressed).

## Design

- **Column API:** `footer = input('')` (empty means no footer, as `header`), `sortBy = input<string | null>(null)`, `sortCompare = input<TableSortCompare | null>(null)`, `headerTemplate = contentChild('header', { read: TemplateRef })`, `footerTemplate = contentChild('footer', { read: TemplateRef })`. `TableSortCompare` is exported from `data-table.types.ts` (D-03). TSDoc on each, and the class doc gets a paragraph on named templates.
- **Header cell:** inside the existing `<span class="inline-flex items-center gap-1">`, `@if (col.headerTemplate(); as h) { <ng-container [ngTemplateOutlet]="h" [ngTemplateOutletContext]="{ $implicit: col.header() }" /> } @else { {{ col.header() }} }`. Everything else in the `<th>` is unchanged. `columnFilterLabel()(col.header())`, `columnMoveAnnouncement`, `stackLabelFor` and `exportCSV` keep reading `header()` (`DAT-053.S4`).
- **Interactive guard:** `onHeaderClick` and `onHeaderKeydown` return early when `isFromInteractiveContent(event)` is true (D-02).
- **Footer:** `hasColumnFooter = computed(() => visibleColumns().some((c) => !!c.footer() || !!c.footerTemplate()))`, `footerRows = computed(() => sortedValue())` (lazy already returns `value()`). The `<tfoot>` renders when `footerGroupTemplate() || hasColumnFooter()`; the `#footerGroupFoot` ref is renamed `#tableFoot` and `observeSectionHeight` keeps measuring it, so sticky bottom frozen rows still account for it. It holds the footer group outlet, then `<tr data-med-footer-row>` with: empty utility `<td>`s for reorder and selection using `utilityStyle`/`utilityPosition`/`utilityLeft`/`utilityZIndex`; one `<td>` per visible column with `footerCellClass(col)`, `isFrozenColumn`/`frozenPosition`/`frozenEdge`/`frozenZIndex`; an empty row-actions `<td>` when `editMode() === 'row'`. Template wins over text; context `{ $implicit: footerRows() }`.
- **Stacked footer:** `<tfoot>`, the footer `<tr>` and cells get `block` and the stacked roles (`rowgroup`, `row`, `cell`) like the body; a cell with content renders the same `aria-hidden` `stackLabelFor(col)` span with `stackLabelClass(false)`; cells without content and the utility cells get `hidden` while stacked (D-04).
- **Sort:** `compareRows(a, b, field, order)` becomes `compareByColumn`: it finds the column in `columns()` (hidden ones too) whose `field()` is `field`; ascending result is `sortCompare(a, b)` when set, else the existing default comparison on `sortBy() ?? field`; `desc` negates. A `sortField` naming no column uses the default on `field`. The `groupField` key and `groupSpans` keep the default comparison. `Array.prototype.sort` is stable, so equal rows keep their order. `lazy` is untouched, as `sortedValue` already returns `value()` (`DAT-055.S5`).
- **Cell template query:** `cellTemplate` stops being the first `TemplateRef` and becomes the first non-named one (D-01).
- **Docs:** `data-table-column-header-footer.demo.ts/.html` (a `#header` with an icon and a hint button, a `#footer` sum, a status column with `sortBy`, a version column with `sortCompare`), `projects/site/src/content/docs/data-table-column-header-footer.txt`, an `example-column-header-footer` entry after `example-templates` in `data-table.page.ts`, and rows for `footer`, `sortBy`, `sortCompare` in `projects/site/src/content/api/data-table.json`.
- **Changeset:** `.changeset/data-table-column-templates-and-custom-sort.md`, `'@medra.dev/ui': minor`.

## Decisions

### D-01: Named template queries, and the cell template skips them

**Choice:** `#header` and `#footer` are read with `contentChild('header' | 'footer', { read: TemplateRef })`. `cellTemplate` becomes `computed` over `contentChildren(TemplateRef)`, returning the first template that is not the header, footer or edit template.
**Alternatives:** Keep `contentChild(TemplateRef)` and document that the cell template must come first; require a `#body` name for cell templates; structural directives (`*medHeader`).
**Rationale:** `contentChild(TemplateRef)` returns the first template in document order, so a `#header` written above the cell template would silently replace every cell. Skipping named templates keeps every existing unnamed cell template working with no consumer change, and matches the `#editTemplate` / `#headerGroup` idiom the table already uses instead of adding directives.

### D-02: Interactive content is detected by the event target

**Choice:** `isFromInteractiveContent(event)` returns true when `event.target` is not the `<th>` itself and `target.closest('button, a[href], input, select, textarea, [tabindex]')` is inside the `<th>`. Clicks from there do not sort; key events from there are left to the element, with no `preventDefault`, so they neither sort nor move the column.
**Alternatives:** Ask consumers to call `stopPropagation`; a `medHeaderAction` marker directive; stop all events from inside the template.
**Rationale:** The spec names the element kinds, so the table can enforce it without consumer code. Not calling `preventDefault` keeps Space and Enter activating the button (`DAT-053.S3`). Clicks on plain text in the template still sort (`DAT-053.S2`). The existing funnel button already stops propagation, so it is unaffected.

### D-03: `sortCompare` type is bivariant in the row

**Choice:** `export type TableSortCompare = { bivarianceHack(a: unknown, b: unknown): number }['bivarianceHack'];`
**Alternatives:** `(a: any, b: any) => number`; make `TableColumnComponent` generic.
**Rationale:** The column is not generic (its class doc explains why), and under `strict` a `(a: Product, b: Product) => number` is not assignable to `(a: unknown, b: unknown) => number`. A method-signature type accepts the consumer's typed function without `any`.

### D-04: One footer, column footer row after the footer group

**Choice:** A single `<tfoot>` holds the `#footerGroup` rows and then the column footer row, sticky and measured as the footer group's `<tfoot>` is today.
**Alternatives:** A second `<tfoot>`; rendering the column footer row before the group rows.
**Rationale:** HTML allows one `<tfoot>` per table, and the delta fixes the order (`DAT-054.S3`). Reusing the existing sticky and height logic keeps `scrollable` and bottom frozen rows behaving as they do with a footer group.

### D-05: The footer gets every filtered row, not the page

**Choice:** The `#footer` template's `$implicit` is `sortedValue()`, which is the filtered, sorted, unpaged set and, with `lazy`, `value()`.
**Alternatives:** `pagedValue()`; passing both as separate context keys.
**Rationale:** Totals over the visible page mislead with a paginator, and the delta fixes this set (`DAT-054.S2`, `S7`). A page-only key can be added later without breaking `$implicit`.

### D-06: One comparator per column, resolved by `field`

**Choice:** Sorting resolves the column by `field` at compare time and uses its `sortCompare`, else its `sortBy`, for every sort path; the sort state, events, `lazyLoad` and persisted state keep the `field`.
**Alternatives:** Store `sortBy` in `sortField`; a table-level `customSort`/`sortFunction` (out of scope in the proposal).
**Rationale:** Keeping `field` as the key leaves `aria-sort`, persisted state and `lazyLoad` consumers unchanged (`DAT-055.S1`, `S5`), and one resolution point covers header, presort and multi-sort (`DAT-055.S3`, `S4`).
