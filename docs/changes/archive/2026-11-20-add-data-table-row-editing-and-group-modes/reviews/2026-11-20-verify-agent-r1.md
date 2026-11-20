# Review: add-data-table-row-editing-and-group-modes — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 2 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

The suite is green and DAT-008, DAT-037, DAT-010 and DAT-024 are implemented and covered by tests that assert their Given and Then clauses. DAT-036 is not met in general. The expansion row keeps `colspan = totalColumnCount - 1` but starts at the first column, so it overlaps the merged cell whenever any column precedes the grouped column, such as a selection, reorder or earlier data column. I reproduced this in Chromium. Two major findings remain: `rowEditComplete` omits untouched editable fields, which the plan's Editing model contradicts, and the row-action buttons use a focus-outline token that does not exist in the theme.

## Findings

### F-01 [critical] Expansion row overlaps the merged cell unless the grouped column is first

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:490` (`expansionColspan`) · DAT-036.S3 · T011
**Problem:** The expansion `<td>` has `colspan = totalColumnCount - 1` and is the first cell of its row, so it covers slots 0 to total-2. The merged cell occupies slot `k` of that row. When `k` is not 0, and also not the last column, the colspan runs across the occupied slot, which the HTML table model treats as a table model error. The HTML table model fills slots from the left and only skips occupied slots at the start. I reproduced it in Chromium with `[S][TEAM rowspan=3][name]` and an expansion `<td colspan=2>`. The expansion cell rendered at x=11 and width 190, while the TEAM cell sits at x=52 and width 149, so the two overlap. Any table with `selectionMode` multiple or radio, `reorderable`, or a data column before the `groupRowsBy` column hits this. The requirement says the expansion row leaves the merged column out "so the table stays rectangular" and that selection, row expansion and column reorder keep working on grouped rows. The unit test (`team` is the first column, no utility columns) and the e2e demo (`category` is first) only exercise the one placement that works.
**Fix:** Render the expansion row's cells around the merged column. Compute `lead` as the utility columns that precede the data columns plus the index of the span column among `visibleColumns()`, and `trail` as the columns after it. Emit a leading `<td colspan=lead>` and a trailing `<td colspan=trail>`, each only when its colspan is greater than 0, and put the expansion template in a single one. Alternatively, merge the expansion content into one cell by restricting `rowspan` mode to a span column that is first or last, and document that limit. Add a unit test with `selectionMode="multiple"` (or `reorderable`) plus `rowGroupMode="rowspan"` and an expanded row, asserting that the expansion cells' colspans plus the merged cell add up to `totalColumnCount`. Add an e2e assertion on the real geometry.

### F-02 [major] `rowEditComplete.values` leaves out editable fields the user did not touch

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1507` (`saveRowEdit`) · DAT-035 · plan "Editing model"
**Problem:** `saveRowEdit` emits `values = this.rowDraft`, which holds only the fields whose edit template called `onChange` or `onSave`. The plan states that `values` "holds every editable field, taking the draft value when one was recorded and the row's current value otherwise". The requirement says the event carries "the value of each editable field". If a user edits only Name and saves, the event is `{ name }` and Stock is missing. The only test (DAT-035.S1) types into both inputs, so the gap is never exercised.
**Fix:** In `saveRowEdit`, start from every editable column that has an edit template, using `rowFieldValue(row, field)` as the default, and overlay `rowDraft`. Add a test where only one of the two inputs is changed and `values` still contains both fields.

### F-03 [major] Row-action buttons use `outline-primary-500`, a token the theme does not define

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1006` (`rowActionButtonClass`) · T007 · Articles II and VI
**Problem:** The theme defines `--color-brand-*` and no `--color-primary-*` (`tailwind-theme-medraui.css`, no match for `color-primary` in any stylesheet under `projects/`). No other class in the table used `primary-500` before this change. Tailwind therefore generates no rule for `focus-visible:outline-primary-500`, and the edit, save and cancel buttons get a 2px outline with no valid colour. The plan's Article II and VI rows promise brand tokens and focus visibility. The group toggle uses `outline-brand-500`, so the two new controls are inconsistent.
**Fix:** Use `focus-visible:outline-brand-500` in `rowActionButtonClass`. Add an e2e or unit check that the focused action button has a non-`none` computed outline.

### F-04 [minor] Row-level Enter saves from anywhere in the edited row, not only from an edit template

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1338` · DAT-035 · T008
**Problem:** The guard checks only `editingRow() === row` and that the target is not a `button`, `textarea` or `a`. Enter pressed on the focused `<tr>` itself, or on a display cell of the edited row, therefore saves the row. The requirement scopes Enter and Escape to "within an edit template". With `selectionMode` set, Enter on the focused edited row also stops selecting it.
**Fix:** Handle Enter in the row-mode branch only when `target.closest('[data-med-editing]')` is truthy, matching the requirement. Leave Escape row-wide only if that is intended, and say so in D-03.

### F-05 [minor] The row-level Enter and Escape handling has no test of its own

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` (`DAT-035.S3`) · T008
**Problem:** The host template's inputs call `onSave` on `keydown.enter` and `onCancel` on `keydown.escape`. The S3 test therefore passes through the template's own handlers, and the `onRowKeydown` fallback added in T008 never runs. Deleting the fallback would leave every test green. This is the single-input pattern L-006 warns about.
**Fix:** Add a test with an edit template that has no key handlers, such as the `stock` input, and assert that Enter in it emits `rowEditComplete` once and Escape emits `rowEditCancel`. Add a check that Enter on a template that already calls `onSave` does not emit twice.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-035` | S1 to S6 have unit tests (`data-table.component.spec.ts:2520` to `2581`, S1 in the `row editing` describe) and an e2e (`data-table-row-editing.spec.ts:6`). Tasks T005 to T008 have red and green lines. Gap: the event omits untouched fields (F-02), the buttons have no valid focus colour (F-03), and Enter is not scoped to the edit template (F-04). | partial |
| `DAT-036` | S1, S2 and S4 have unit tests (`:2665`, `:2702`) and S1 and S3 have e2e (`data-table-row-groups.spec.ts:6`). The S3 behaviour holds only when the grouped column is first with no utility columns (F-01). | partial |
| `DAT-037` | S1 to S4 have unit tests (`:2788`, `:2806`, `:2838`, `:2846`) and S2 has e2e (`data-table-row-groups.spec.ts:66`). The tests assert the hidden rows, `aria-expanded`, the emitted values, the absence of a toggle and selection that survives. T013 has red and green lines. | met |
| `DAT-008` | S1 to S5 (`:900`, `:2377`, `:2392`, `:2412`, `:2420`). The S1 retag asserts the emit and the exit from edit mode (L-002 checked). T002 has a red line, T003 and T004 have green lines. | met |
| `DAT-010` | S1 (`:1251`, `:1856`) is an unchanged assertion retagged. The grouping additions are covered through DAT-036 and DAT-037. T014 has green evidence only, recorded as a user-approved blocker for a characterization test (L-003). | met |
| `DAT-024` | S1 to S10 in `data-table-docs.spec.ts:20`, `:68` to `:170`, plus `data-table.page.ts` and the four new demo and prose files. The suite is reported green and I did not rerun it. | met |

Audits: no assertion was removed from any existing test (the only removed lines in the spec diff are two test titles that gained scenario IDs). No skips or loosened matchers were added. Changed files map to tasks T001 to T020, and no scope creep was found. Constitution gates: Articles I, III, IV, VII, VIII and X pass; Articles II and VI are affected by F-03 and Article V by F-01, whose layout case is only tested in the one configuration that works.
