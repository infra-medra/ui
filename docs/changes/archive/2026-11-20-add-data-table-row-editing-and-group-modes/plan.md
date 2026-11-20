# Plan: add-data-table-row-editing-and-group-modes

## Summary

All behavior lives in `projects/medra/ui/src/lib/data-table/` (`data-table.component.ts`, `data-table.types.ts`). Row editing (DAT-035) adds an `editingRow` signal and a per-field draft beside the existing `editingCell`, an actions column and four outputs/inputs. Cell editing (DAT-008) gains `editTrigger` and a guard that keeps clicks and keys inside an edit cell away from row selection and row navigation. Row-span grouping (DAT-036) adds a `groupSpans` computed that gives each displayed row either a span or "omit"; the shared `#dataCells` template reads it, and expansion rows shrink by one column. Expandable groups (DAT-037) add an `expandedRowGroups` model of collapsed group values and a toggle in the subheader row. The DataTable docs page gains four sections (DAT-024.S10) and a `minor` changeset records the API.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | D-01 to D-07 use `input()`, `model()`, `output()`, `signal()` and `computed()` on the existing standalone `DataTableComponent`; the demos are standalone |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | The actions column, buttons and group toggle (D-01, D-06) use surface and brand tokens with `dark:` variants through the table's existing class helpers; the consumer `class` path is unchanged |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | No overlay is added; the new buttons use `med-icon` with the existing `pencil-square`, `check`, `x-mark`, `chevron-right` and `chevron-down` icons |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | The table is not a form control; edit templates own their inputs (proposal Out of scope) |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Test Strategy maps every scenario of DAT-008, DAT-035, DAT-036, DAT-037 and DAT-024.S10; DAT-036.S1 to S3 (rendered spans and a rectangular table), DAT-035.S1 and DAT-024.S10 get Playwright coverage; tasks will order `[TEST]` first |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | D-03 gives Enter/Escape in an edit row and the key guard; D-06 gives the group toggle `aria-expanded`, a label and native button keyboard; D-01 gives the buttons labels and the header an sr-only label; S-level tests in the Test Strategy cover each, and focus rings reuse the table's token classes |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | Original logic written against the deltas; icons come from the existing set; all code, docs and the changeset are English |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | D-01 and D-06 add `editRowLabel`, `saveRowLabel`, `cancelRowLabel`, `rowActionsHeaderLabel` and `rowGroupToggleLabel`, each with an English default; no translation service |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | D-08 adds a `minor` changeset; `package.json` peer ranges are untouched |

## Complexity Tracking

None.

## Test Strategy

- **Command:** `npx jest projects/medra/ui/src/lib/data-table` (unit); `npx playwright test e2e/site/data-table-row-editing.spec.ts e2e/site/data-table-row-groups.spec.ts e2e/site/data-table-docs.spec.ts --trace off` (e2e)
- **Framework:** Jest with `jest-preset-angular` and Angular `TestBed`; Playwright against the docs site

| Scenario | Level | Test location |
|---|---|---|
| `DAT-008.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-008.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent editing')`) |
| `DAT-008.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent editing')`) |
| `DAT-008.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent editing')`) |
| `DAT-008.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent editing')`) |
| `DAT-035.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent row editing')`) |
| `DAT-035.S1` | e2e | `e2e/site/data-table-row-editing.spec.ts` (real clicks on the docs demo) |
| `DAT-035.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-035.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-035.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-035.S5` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-035.S6` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-036.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent row-span grouping')`) |
| `DAT-036.S1` | e2e | `e2e/site/data-table-row-groups.spec.ts` (cell geometry spans the group's rows) |
| `DAT-036.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-036.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-036.S3` | e2e | `e2e/site/data-table-row-groups.spec.ts` (expansion row stays aligned in a real layout) |
| `DAT-036.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-037.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`describe('DataTableComponent expandable row groups')`) |
| `DAT-037.S2` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-037.S2` | e2e | `e2e/site/data-table-row-groups.spec.ts` (Enter on the focused toggle) |
| `DAT-037.S3` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-037.S4` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` |
| `DAT-010.S1` | unit | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (existing test, unchanged) |
| `DAT-024.S1` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entries) |
| `DAT-024.S2` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test; must pass with the new entries) |
| `DAT-024.S3` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S4` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S5` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S6` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S7` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S8` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S9` | e2e | `e2e/site/data-table-docs.spec.ts` (existing test, unchanged) |
| `DAT-024.S10` | e2e | `e2e/site/data-table-docs.spec.ts` and `e2e/site/data-table-row-editing.spec.ts` |

## Editing model

- `editMode` widens to `'cell' | 'row' | null`. `editTrigger` is `input<'dblclick' | 'click'>('dblclick')`.
- `isEditingCell(row, col)` stays the single question the `#dataCells` template asks. In `cell` mode it reads `editingCell`; in `row` mode it is true when `editingRow` is `row` and the column is `editable` with an `editTemplate`. The edit cell carries `data-med-editing` and a `(click)` that stops propagation, so a click inside it never reaches the row's selection handler.
- Cell mode context is unchanged: `{ $implicit, onSave, onCancel }`. Row mode adds `onChange(value)` to the same context: `onChange` records the field's draft value; `onSave(value)` records it and commits the row; `onCancel()` cancels the row. A template written for cell mode therefore works in row mode.
- `rowDraft` is a plain record of field to value, reset on every start, save and cancel. `rowEditComplete` carries a `TableRowEditEvent { row, values }` where `values` holds every editable field, taking the draft value when one was recorded and the row's current value otherwise. `rowEditCancel` carries the row. Both types go in `data-table.types.ts`.
- `startRowEdit(row)` cancels the row being edited first (emitting `rowEditCancel`), then sets `editingRow`. The actions column and its header cell render only when `editMode() === 'row'`; `totalColumnCount` adds one for it, and the frozen-row template renders an empty cell for it.
- The row's `(keydown)` runs a guard before selection: a key whose target is inside a `[data-med-editing]` cell never selects a row or moves row focus (this also fixes Space in `single` and `radio` mode). In an edited row, Enter outside a `button`, `textarea` and `a` saves the row and Escape cancels it.

## Grouping model

- `rowGroupMode` widens to `'subheader' | 'rowspan' | null`. The sort key `effectiveGroupField` follows `groupRowsBy` in both modes; `isGroupStart` and the subheader row stay `subheader`-only.
- `groupSpans` computed: when the mode is `rowspan` and `groupRowsBy` names a visible column, walk `pagedValue()` once and give the first row of each run of equal values a span (run length plus its expanded rows when `#rowexpansion` exists) and every other row of the run `0`; otherwise it is empty. `#dataCells` receives `span` in its context and, for the grouped column, omits the cell at `0` and writes `[attr.rowspan]` at a positive span. Frozen rows pass no span, so they keep every cell.
- The expansion row's `colspan` is `totalColumnCount() - 1` when `groupSpans` is non-empty, because the spanning cell already occupies that column in the expansion row's flow.
- `expandedRowGroups = model<readonly string[]>([])` holds the collapsed group values, as DAT-037 states. A body row is rendered unless `expandableRowGroups` is on, the mode is `subheader` and `groupValue(row)` is in the model. The subheader's toggle button toggles membership and emits `rowGroupExpand` or `rowGroupCollapse` with the group value; selection, sort, `first` and `exportCSV()` read `value()` or `sortedValue()`, which collapsing does not touch.

## Decisions

### D-01: Row editing is a second mode of the existing edit pipeline, with an actions column

**Choice:** Reuse `editTemplate`, `editable` and `#dataCells`; add `editingRow`, a draft record, and an actions column placed after the data columns whose buttons use `med-icon` (`pencil-square`, `check`, `x-mark`). Strings come from `editRowLabel`, `saveRowLabel`, `cancelRowLabel` and `rowActionsHeaderLabel` inputs with English defaults, and the header cell shows the last as `sr-only` text.
**Alternatives:** A separate `rowEditTemplate` per column; public `startRowEdit`/`saveRowEdit` methods with no built-in column.
**Rationale:** The user chose the actions-column model at intake. One edit template per column keeps cell and row mode interchangeable, and Article VIII requires overridable strings.

### D-02: Row mode extends the template context instead of replacing `onSave`

**Choice:** In row mode the context adds `onChange(value)`; `onSave(value)` records the value and commits the whole row, and `onCancel()` cancels the row.
**Alternatives:** Make `onSave` only record the value and require the actions buttons to commit; give row mode a different context shape.
**Rationale:** A cell-mode template that calls `onSave` on Enter keeps working unchanged, and a template that wants live updates calls `onChange`. DAT-035 only requires that values come "as given by its edit template".

### D-03: Keys and clicks inside an edit cell are stopped at the cell, with one guard on the row

**Choice:** Edit cells carry `data-med-editing` and stop click propagation; `onRowKeydown` returns early for any event whose target is inside such a cell, and handles Enter and Escape for an edited row before the selection branch.
**Alternatives:** Stop `keydown` propagation on the edit cell; remove `tabindex` from edited rows.
**Rationale:** Stopping propagation would also hide Escape from the row-edit handler and from consumer listeners. A single guard in the row handler fixes DAT-008.S3 and DAT-035.S3 together.

### D-04: `editTrigger="click"` stops the click that enters edit; the dblclick path keeps its row click

**Choice:** The `td` `(click)` handler enters edit mode and stops propagation only when `editTrigger()` is `click`, `editMode()` is `cell` and the column is editable. The `(dblclick)` path stays as today, so the clicks before it still select the row, as DAT-008 now states.
**Alternatives:** Suppress row selection for every click on an editable cell.
**Rationale:** The user chose at the proposal gate that the edit action alone must not change selection, which keeps current dblclick behavior (DAT-008.S5).

### D-05: Row-span is computed once per page, and counts expansion rows

**Choice:** `groupSpans` is one pass over `pagedValue()`, adding each expanded row to its run's span, and the expansion row drops one column.
**Alternatives:** Compute spans per row in the template with look-ahead; disable `#rowexpansion` in `rowspan` mode.
**Rationale:** One pass keeps the template free of repeated scans and keeps the table rectangular (DAT-036.S3); the user chose to support expansion at the proposal gate.

### D-06: Collapsed groups hide rows in the template only

**Choice:** `@if` around each body row and its expansion row, keyed on `expandedRowGroups`; the toggle is a native `<button>` with `aria-expanded` and a label from the `rowGroupToggleLabel` input, `(group, expanded) => string`, defaulting to `Collapse group X` or `Expand group X`.
**Alternatives:** Filter collapsed rows out of `pagedValue()`; hold expanded groups instead of collapsed ones.
**Rationale:** Filtering `pagedValue()` would change paging, group-start detection and export. The collapsed list matches DAT-037, which makes an empty model mean all expanded.

### D-07: Existing class and member docs are updated in place

**Choice:** Rewrite the `editMode`, `rowGroupMode` and class-doc passages that call `'row'` and `'rowspan'` documented cuts, and document each new member with TSDoc.
**Alternatives:** Leave the old notes.
**Rationale:** The notes would contradict the code, and DAT-024 forbids documenting inputs the component does not implement.

### D-08: Docs add four sections and a `minor` changeset

**Choice:** Add `example-edit-row`, `example-edit-cell-selection`, `example-row-group-rowspan` and `example-row-group-expandable` to `EXAMPLES` in `projects/site/src/app/pages/docs/components/data-table.page.ts`, after `example-edit-cell` and `example-row-group-subheader` respectively, each with prose, demo and code block, and add `.changeset/data-table-row-editing-and-group-modes.md` as `minor`.
**Alternatives:** Extend the existing cell-editing and subheader sections; a `patch` changeset.
**Rationale:** DAT-024 needs one section per example with its own demo and code block, and new public API is a `minor`; `major` is barred by Article X.
