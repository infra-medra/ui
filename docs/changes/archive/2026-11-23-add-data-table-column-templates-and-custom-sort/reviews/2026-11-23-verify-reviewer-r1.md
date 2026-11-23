# Review: add-data-table-column-templates-and-custom-sort — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

All 37 scenarios are cited by tests, the TDD evidence is complete and the suite is green, but one SHALL clause of DAT-055 is not implemented. In `sortMode="multiple"` with subheader grouping, the grouping key goes through `compareByColumn`, so a `sortBy` or `sortCompare` on the grouping column replaces the default comparison that the requirement (and task T006) say the group key must keep. There is also one stacked-footer clause of DAT-054 that is not met for the utility cells, plus two minor issues. The four context points the implementer raised check out (see Notes).

## Findings

### F-01 [critical] Multi-sort subheader grouping key uses the column's custom comparator

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1761-1767` · DAT-055, T006
**Problem:** DAT-055 says "the subheader grouping key SHALL keep the default comparison", and T006 says "keeping the default comparison for the group key". The single-sort branch does this (`this.compareRows(a, b, groupField, 'asc')`, line ~1781). The multiple-sort branch does not: it puts the group field first in `effectiveMeta` (`[{ field: groupField, order: 'asc' }, ...]`, line 1761) and sends every entry through `this.compareByColumn(a, b, entry.field, entry.order)` (line 1767). `compareByColumn` finds the column whose `field` equals `groupRowsBy` and uses its `sortCompare`, or else its `sortBy`. So when `rowGroupMode="subheader"` is combined with `sortMode="multiple"` and the grouping column has `sortBy`/`sortCompare`, groups are ordered by the custom comparison. No test covers this case.
**Fix:** In the multiple-sort comparator, compare the group entry with `compareRows(a, b, groupField, 'asc')` and every other entry with `compareByColumn`. One way is to sort with `compareRows` on `groupField` first, then loop over `meta.filter((m) => m.field !== groupField)` with `compareByColumn`. Add a unit test: a table with `rowGroupMode="subheader"`, `sortMode="multiple"` and a grouping column whose `sortBy` orders differently from its `field`. Assert that the groups follow the default order of `field`.

### F-02 [major] Stacked column footer leaves the selection and row-actions utility cells visible

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:800-802` and `:828-829` · DAT-054
**Problem:** DAT-054 says that while stacked, "footer cells without content SHALL be hidden". The column-footer data cells get `[class.hidden]="stacked() && !hasFooterContent(col)"`. The footer utility cells do not. They are always empty, and they still render while stacked: the selection cell (`@if (hasSelectionColumn())`) and the row-actions cell (`@if (editMode() === 'row')`). The reorder cell is already gone because `rowReorderActive()` is false while stacked. So a stacked table with `selectionMode="multiple"`/`"radio"` or `editMode="row"` gets empty padded cells in its footer block. DAT-054.S6 and its tests use no utility columns, so nothing catches this.
**Fix:** Add `[class.hidden]="stacked()"` to the column-footer selection and row-actions `<td>`s, or skip rendering them while stacked. Then extend the stacked unit test, or add one, with `selectionMode="multiple"` and assert that the footer utility cell is hidden.

### F-03 [minor] e2e DAT-053.S1 icon count passes without the sort indicator

**Where:** `e2e/site/data-table-column-templates.spec.ts:44` · DAT-053.S1, Article XI
**Problem:** `expect(await header.locator('med-icon').count()).toBeGreaterThanOrEqual(2)` is meant to check "the template icon plus the sort indicator". But the demo's `#header` template already holds two `med-icon`s by itself (`tag`, and `magnifying-glass` inside the button), so this assertion would still pass if the sort chevron were missing. The unit test (`data-table-column-templates.spec.ts`, DAT-053.S1, `price.querySelector('med-icon')` with a template that has no icon) does cover the clause, so this only weakens the real-browser check.
**Fix:** Assert the sort indicator specifically, for example `header.locator('med-icon[name="chevron-down"]')` with `toHaveCount(1)`, or require a count of at least 3.

### F-04 [minor] Docs section placed after `example-responsive-stack` instead of after `example-templates`

**Where:** `projects/site/src/app/pages/docs/components/data-table.page.ts:246` and `:739` · DAT-024, T009
**Problem:** plan.md (line 86) and T009 both say to register `example-column-header-footer` "after `example-templates`" (line 225 / 571). The entry and the section were added after `example-responsive-stack` instead. DAT-024 does not fix the order, and S1 (index order matches section order) still holds, so this is a deviation from the plan, not a spec violation.
**Fix:** Move the `EXAMPLES` entry and the `<section>` to just after `example-templates`, or record the deviation in the plan.

## Notes on the dispatch context

- **(a) DAT-054.S5 e2e at 1280px:** this is consistent with the spec. The stacked-layout requirement (`docs/specs/data-display/spec.md:1397`) says frozen columns "SHALL stop being sticky" while stacked, so S5 cannot be exercised at 400px. The S5 Given ("wider than its viewport") refers to the table's scroll viewport, and the test asserts `scrollWidth > clientWidth` before scrolling. The edit was user-approved and is recorded in the T008 evidence. It is not a weakening.
- **(b) `data-table.page.ts`:** this edit is in scope. T009 and plan.md line 86 name this file explicitly; it is only missing from T008's file list. The only deviation is the placement (F-04).
- **(c) DAT-033.S3 rename:** only the test title changed (+1/-1). The assertion (`querySelector('tfoot')` is null) and the host (`NoFooterHostComponent`, two columns with no `footer`/`#footer`) are unchanged and match the MODIFIED Given. It is not a weakening.
- **(d) `cellTemplate` exclusion by `elementRef.nativeElement`:** this is sound. The anchor comment node is stable per `<ng-template>`, while `TemplateRef` instances from separate queries need not be identical. Note that `contentChildren(TemplateRef)` matches direct children only, whereas the old `contentChild(TemplateRef)` searched descendants. That is acceptable for `med-table-column`, which projects templates directly. The change also fixes an older quirk: an `#editTemplate` written first used to be taken as the cell template.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-053` | `data-table-column-templates.spec.ts` DAT-053.S1–S4; `e2e/site/data-table-column-templates.spec.ts` S1, S2, S3; T002, T003 green | met |
| `DAT-054` | `data-table-column-templates.spec.ts` DAT-054.S1–S7; e2e S5, S6; T004, T005 green; stacked utility footer cells not hidden (F-02) | partial |
| `DAT-055` | `data-table-column-templates.spec.ts` DAT-055.S1–S5; T006 green; multi-sort subheader group key not on default comparison (F-01) | partial |
| `DAT-033` | `data-table.component.spec.ts:2076-2120` DAT-033.S1–S4; T004 green | met |
| `DAT-024` | `e2e/site/data-table-docs.spec.ts` S1–S16, `e2e/site/data-table-column-templates.spec.ts` DAT-024.S17; T009 green | met |
