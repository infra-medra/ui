# Review: add-data-table-resize-modes-visibility-groups — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Every ADDED and MODIFIED requirement is implemented and covered by tests that assert each Given and Then clause. The suite is green (dispatch `suite: green`), no test was weakened, and the changed files all trace to a task or plan decision. Two minor evidence and test-scope gaps remain. The most important one is that the DAT-024.S7 e2e test does not check the fit-mode resize section the scenario names. The `diff_base` (280f710) predates the committed frozen-columns change, so the inspection used the working tree against HEAD for the change's own code, per L-004.

## Findings

### F-01 [minor] DAT-024.S7 test does not check the fit-mode resize section

**Where:** `e2e/site/data-table-docs.spec.ts:18` · DAT-024.S7
**Problem:** The scenario says "the fit and expand resize modes, the column toggle and the column groups each have a section with prose, a working demo and a code block". `RESIZE_TOGGLE_GROUPS` lists only `column-resize-expand`, `column-toggle` and `column-groups`. The fit section (`example-column-resize`, whose prose was rewritten in this change) is not asserted by S7. DAT-024.S3 and the S1 index check may cover it incidentally, but no test ties it to S7's Then clause (L-002).
**Fix:** Add `'column-resize'` to `RESIZE_TOGGLE_GROUPS` so the test asserts all four sections.

### F-02 [minor] T015 green evidence does not show its verify condition

**Where:** `docs/changes/add-data-table-resize-modes-visibility-groups/tasks.md:45-46` · T015
**Problem:** T015's verify is "T007 tests pass (green)", which are the Playwright tests in `e2e/site/data-table-columns.spec.ts`. The green evidence line instead records a Jest run (`npx jest ... -t 'resize modes'`). It does not show the e2e tests passing at that task. T019's evidence later runs the whole Playwright set green, so the outcome is not in doubt, but the T015 audit trail is misaligned.
**Fix:** Re-record T015's green evidence with `npx playwright test e2e/site/data-table-columns.spec.ts` (through `medra task`), or note that T019 carries it.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-031` | Code: `columnResizeMode` input, `onColResizeStart/Move/End`, `hasResizeHandle`, `pinMeasuredWidths` in `data-table.component.ts`. Tests: S1, S2, S3, S4 and S5 in `data-table.component.spec.ts` (stubbed rects; both modes for S5; 40px floor asserted). Real browser: `e2e/site/data-table-columns.spec.ts:30,46`. Tasks T006 to T009 have red then green evidence. | met |
| `DAT-032` | Code: `visible` input in `table-column.component.ts`; `visibleColumns` read by the header and cell loops, `totalColumnCount`, `hasFrozenColumn`, `utilityFrozen`, `frozenLayout` and `exportCSV`. Sort and the default filter fields stay on `columns()`. Tests: S1 to S6 in `data-table.component.spec.ts` (Visibility hosts). Tasks T002, T004, T005 have red then green evidence. | met |
| `DAT-033` | Code: `headerGroupTemplate` and `footerGroupTemplate`, a `<tfoot>` rendered only when the template exists. Tests: S1 to S4 in `data-table.component.spec.ts` (group hosts). Tasks T010 to T012 have red then green evidence. | met |
| `DAT-001` | Empty-state `colspan` uses `totalColumnCount` over visible columns. Test: `data-table.component.spec.ts` DAT-001.S1 (single cell, label, colspan 3 with one hidden column). | met |
| `DAT-009` | `exportCSV` uses `visibleColumns`. Tests: DAT-009.S1 (quoting plus hidden column) and DAT-032.S5. | met |
| `DAT-010` | Subheader and expansion `colspan` use `totalColumnCount`; handles follow `columnResizeMode`. Tests: DAT-010.S1 reorder indices with a hidden column, and the updated resize-handle count at spec line 1318. | met |
| `DAT-024` | Four new sections registered in `data-table.page.ts` `EXAMPLES`, each with prose, demo and code block; demos use only implemented inputs and templates. Tests: `e2e/site/data-table-docs.spec.ts` S1 to S7; `e2e/site/data-table-frozen.spec.ts:163` S8 (reorder, selection and frozen cells stay in view on scroll). See F-01 and F-02 for minor gaps. | met |
