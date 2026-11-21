# Plan: add-data-table-column-filters

## Summary

All behavior lives in `projects/medra/ui/src/lib/data-table/` (`data-table.component.ts`, `table-column.component.ts`, `data-table.types.ts`) plus one new pure module, `data-table-column-filter.ts`, that holds the match modes. A column opts in with `columnFilter` and gets a funnel button in its header that opens a `med-popover` with a match mode select, a value control for its `filterType` and Apply and Clear buttons (DAT-038, DAT-039). Active rules live in a two-way `columnFilters` model that `filteredValue` applies after the global text filter; in `lazy` mode the model only feeds `lazyLoad` (DAT-004, DAT-007). The same model is persisted with the sort state and read back by `exportCSV()` through `sortedValue()` (DAT-010, DAT-009). The DataTable docs page gains a `example-column-filters` section (DAT-024.S11) and a `minor` changeset records the API.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | D-01 to D-04 add `input()`, `model()`, `signal()` and `computed()` members to the existing standalone `DataTableComponent` and `TableColumnComponent`; the demo is standalone and `FormsModule` is imported per component, not as an NgModule of ours |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | D-05 styles the funnel button and menu with surface and brand tokens plus `dark:` variants through the table's class helpers; the popover merges its own class through `mergeClasses`, and the consumer `class` path of the table is unchanged |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | D-03 opens the menu with `med-popover` (which uses `OverlayService.openConnectedTemplate`) and D-05 draws the funnel with `med-icon` (`funnel`, which exists in the mini and solid sets); no private overlay |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The table is not a form control; the menu's value controls reuse the existing `med-select`, `med-date-picker` and `medInputText`, and D-04 keeps `0` and an empty string distinct from `null` |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario of DAT-038, DAT-039, DAT-004, DAT-007, DAT-009, DAT-010 and DAT-024.S11; the menu's focus return, outside click and date picker flow (DAT-038.S1, S5, DAT-039.S3) and the docs page get Playwright coverage; tasks will order `[TEST]` first |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | D-05 gives the funnel `aria-label`, `aria-haspopup="dialog"`, `aria-expanded`, native button keyboard and a brand focus outline; the pane is `role="dialog"` with a label; Enter applies, Escape closes and refocuses (D-03); the active state changes the icon variant as well as its color; each has a unit or e2e test in the Test Strategy |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Original matching and menu logic written against the deltas; the icon comes from the existing set; all code, docs and the changeset are English |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | D-05 adds `columnFilterLabel`, `applyFilterLabel`, `clearFilterLabel`, `filterMatchModeLabel` and `matchModeLabels` inputs with English defaults; no translation service |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | D-08 adds a `minor` changeset; `package.json` peer ranges are untouched |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` (unit); `npx playwright test e2e/site/data-table-column-filters.spec.ts e2e/site/data-table-docs.spec.ts --trace off` (e2e)
- **Framework:** Jest with `jest-preset-angular` and Angular `TestBed`; Playwright against the docs site

| Scenario | Level | Test location |
|---|---|---|
| `DAT-038.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent column filters')`) |
| `DAT-038.S1` | e2e | `e2e/site/data-table-column-filters.spec.ts` (real clicks and Enter on the docs demo) |
| `DAT-038.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-038.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-038.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (sortable and reorderable columns, selection column before, click and Enter on the funnel) |
| `DAT-038.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-038.S5` | e2e | `e2e/site/data-table-column-filters.spec.ts` (Escape and outside click, focus back on the funnel) |
| `DAT-038.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-038.S7` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-038.S8` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-039.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` |
| `DAT-039.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` |
| `DAT-039.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table-column-filter.spec.ts` |
| `DAT-039.S3` | e2e | `e2e/site/data-table-column-filters.spec.ts` (a date picked in the menu's date picker applies) |
| `DAT-039.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-004.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-004.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-007.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-007.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-009.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-009.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-010.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-010.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (text, numeric and date rules round-trip) |
| `DAT-010.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entry) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entry) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S11` | e2e | `e2e/site/data-table-docs.spec.ts` and `e2e/site/data-table-column-filters.spec.ts` |

## Filter model

- Types go in `data-table.types.ts`: `TableFilterType = 'text' | 'numeric' | 'date'`; `TableFilterMatchMode`, the union of the 16 mode names in DAT-039; `TableColumnFilter { matchMode: TableFilterMatchMode; value: string | number | Date | null }`; and `TableColumnFilters = Readonly<Record<string, TableColumnFilter>>`. `TableLazyLoadEvent` gains `columnFilters: TableColumnFilters`.
- `TableColumnComponent` gains `columnFilter` (boolean), `filterType` (default `'text'`), `filterMatchMode` and `filterMatchModes` (both default `null`). A pure helper in `data-table-column-filter.ts` returns a column's offered modes: the type's modes in the canonical order of DAT-039, intersected with `filterMatchModes` when set, falling back to the type's default mode alone if the intersection is empty. The preselected mode is `filterMatchMode` when offered, else the type default when offered, else the first offered.
- The same module exports `matchesColumnFilter(cell, rule, type)`. A rule is active only when its value is not `null`, `''` or `NaN`; an inactive rule matches every row. Text modes lower-case both sides and read `null` and `undefined` as `''`. Numeric modes require `typeof cell === 'number'` and a finite value, and match nothing otherwise. Date modes turn the cell into a local calendar day key: a `Date` by its local getters, a `YYYY-MM-DD` string by its parts (never through `new Date()`, which would read it as UTC), and a longer ISO string through `new Date()` then local getters; anything else, or an invalid date, matches nothing. The rule's `Date` is reduced to the same key.
- `columnFilters = model<TableColumnFilters>({})`. `filteredValue` keeps `lazy()` as an identity passthrough; otherwise it applies the global text filter as today, then every active rule whose column is declared. A rule for an unknown field is kept in the model and ignored. `lazyLoad`'s effect adds `columnFilters: this.columnFilters()`, so a column rule change emits it like any other filter change.

## Menu

- Each header cell of a `columnFilter` column renders a `<button type="button">` inside the `th` and a `<med-popover>` next to it. The button stops `click` and `keydown` propagation so neither the header's sort handler nor its Alt+Arrow reorder handler sees it (D-02), and its `(click)` calls `pop.toggle($event.currentTarget)`.
- A `filterDraft` signal holds `{ field, matchMode, value }` for the one open menu. The popover's `shown` output seeds it from the column's current rule, or from the preselected mode and an empty value; `hidden` clears it and focuses the funnel button, so focus returns even where a click does not focus a button. Apply and Enter in the value control call `applyColumnFilter(col)`; Clear calls `clearColumnFilter(col)`; both close the popover.
- Value controls: `text` uses `<input medInputText>`, `numeric` uses `<input type="number" medInputText>` and stores a `number` (an empty or invalid field stores `null`, so `0` stays a real value), `date` uses `<med-date-picker>`; the match mode uses `<med-select>` only when more than one mode is offered. `med-select` and `med-date-picker` are value accessors with no signal model, so the table imports `FormsModule` and binds them with `[ngModel]` and `(ngModelChange)`.
- `applyColumnFilter` writes the rule into `columnFilters` (an inactive draft deletes the column's key instead), sets `first` to `0`, and emits `filter` with `{ value: globalFilterValue(), data: filteredValue() }`.

## State and export

- `persistTableState` adds `columnFilters` to the stored object and `restoreTableState` reads it back column by column: a text rule needs a string, a numeric rule a finite number, a date rule an ISO string turned into a `Date` (invalid dates are dropped), and an entry for an unknown field or with a wrong type is dropped. A stored object with no `columnFilters` key restores exactly as before (DAT-010.S3). `exportCSV()` already reads `sortedValue()`, which sits after `filteredValue()`, so the filtered export needs no change beyond TSDoc.

## Decisions

### D-01: One rule per column, held in a record keyed by field

**Choice:** `columnFilters` is a `Record<field, { matchMode, value }>` model, written whole on every commit, with no operator and no rule list.
**Alternatives:** An array of rules; a per-column `model` on `TableColumnComponent`; PrimeNG's `{ operator, constraints[] }` shape.
**Rationale:** The proposal fences out several rules per column and an AND/OR operator, and a record keyed by field makes an application preset, read and clear a column in one expression. A shape that is a strict subset of PrimeNG's can grow into its constraints later without breaking readers.

### D-02: The funnel is a real button that stops header events

**Choice:** A native `<button>` inside the `th`, with `click` and `keydown` propagation stopped on it.
**Alternatives:** Handle the funnel inside `onHeaderClick` and `onHeaderKeydown` by checking the event target; make the whole header open the menu when the column is not sortable.
**Rationale:** The `th` toggles sort on click, Enter and Space and moves columns on Alt+Arrow, so a button that let those events through would sort or move the column when activated (DAT-038.S4). Stopping them at the button leaves the header handlers untouched, and the test enables `sortable` and `reorderable` together with a selection column before it (L-006, L-007).

### D-03: The menu is a `med-popover`, and the table refocuses the funnel on close

**Choice:** One `med-popover` per filterable column, a draft signal seeded on `shown` and cleared on `hidden`, with `hidden` focusing the funnel button.
**Alternatives:** A private overlay built on `OverlayService`; an inline panel under the header; relying on the overlay's focus restore alone.
**Rationale:** Article III says reuse the shared overlay, and `med-popover` already gives Escape and outside-click closing, `role="dialog"` and a labeled pane. Its restore-focus target is whatever had focus before opening, which is not the button in browsers that do not focus a button on click, so the explicit refocus makes DAT-038.S5 hold everywhere. The e2e test applies a date from `med-date-picker`'s own panel inside the menu to prove a nested overlay does not dismiss it.

### D-04: Matching lives in a pure module, with strict types and local-day dates

**Choice:** `matchesColumnFilter` and the mode lists are plain functions in `data-table-column-filter.ts`; numeric modes accept only real finite numbers; dates compare by local calendar day and `YYYY-MM-DD` strings are parsed from their parts.
**Alternatives:** Inline the logic in the component; coerce numeric strings with `Number()`; compare date-times or UTC days.
**Rationale:** A pure module is testable without `TestBed` and keeps the component file from growing (DAT-039.S1 to S3). DAT-039 states that a non-numeric cell matches nothing, so coercion would contradict it; `new Date('2026-03-10')` reads UTC and would shift the day west of Greenwich, which the parts-based parse avoids.

### D-05: The funnel and menu follow the existing icon, token and string conventions

**Choice:** `med-icon` `funnel` in the `mini` variant, `solid` plus a brand color when a rule is active, `focus-visible:outline-brand-500`, `aria-haspopup="dialog"` and `aria-expanded`. Strings come from `columnFilterLabel` (a function of the header, default `Filter {header}`), `applyFilterLabel`, `clearFilterLabel`, `filterMatchModeLabel` and a `matchModeLabels` record that overrides the English names of the modes.
**Alternatives:** A color-only active state; a `primary-500` outline.
**Rationale:** The icon variant changes shape as well as color, so the state is not color-only (Article VI). `brand-*` is the token the theme defines (L-008) and Article VIII requires overridable strings.

### D-06: A column rule change returns to the first page; an external change does not

**Choice:** Only the menu's Apply and Clear set `first` to `0`; writing `columnFilters` from the application leaves `first` alone.
**Alternatives:** An effect on `columnFilters` that resets `first`; no reset.
**Rationale:** DAT-038 states the reset for the user's Apply. An effect would also reset a `first` just restored from `stateKey` before the stored rules apply, which would break DAT-010.S2.

### D-07: Lazy mode keeps the menu and the model, and only changes who filters

**Choice:** In `lazy` mode the funnel, menu and `columnFilters` work as usual, `filteredValue` returns `value()` unchanged, and `lazyLoad` carries the rules.
**Alternatives:** Hide the funnel in lazy mode; move rule evaluation behind a server callback.
**Rationale:** The user chose at intake that lazy tables emit the rules and do not filter locally; the table already treats the global filter the same way (DAT-007).

### D-08: Docs add one section and a `minor` changeset

**Choice:** Add `example-column-filters` after `example-filter-global` in `EXAMPLES` in `projects/site/src/app/pages/docs/components/data-table.page.ts`, with prose, a demo (text, numeric and date columns) and a code block, and add `.changeset/data-table-column-filters.md` as `minor`. Update the class doc and `filterable` TSDoc that call per-column filters a cut.
**Alternatives:** Extend the global filter section; a `patch` changeset.
**Rationale:** DAT-024 needs one section per example with its own demo and code block, new public API is a `minor`, and `major` is barred by Article X. The old "No per-column filter row" note would contradict the code.
