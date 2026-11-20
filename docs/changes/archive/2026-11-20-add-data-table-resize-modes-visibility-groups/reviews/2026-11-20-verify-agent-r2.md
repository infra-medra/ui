# Review: add-data-table-resize-modes-visibility-groups — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Round 2 confirms F-01 is fixed: `RESIZE_TOGGLE_GROUPS` now lists `column-resize`, so the DAT-024.S7 test asserts the fit, expand, toggle and groups sections. The only file changed since round 1 is `e2e/site/data-table-docs.spec.ts`, and the diff against `diff_base` adds assertions and constants only, so there is no weakening and no regression. F-02 stays open as a minor finding: the gate note says the implementer left it as is because T019 carries the Playwright evidence. All requirements are `met`, and the suite is green by dispatch.

## Findings

### F-02 [minor] T015 green evidence does not show its verify condition

**Where:** `docs/changes/add-data-table-resize-modes-visibility-groups/tasks.md:45-46` · T015
**Problem:** T015's verify is "T007 tests pass (green)", which are the Playwright tests in `e2e/site/data-table-columns.spec.ts`. The green evidence line records a Jest run (`npx jest ... -t 'resize modes'`) instead. This is unchanged since round 1. T019's evidence (line 54) runs the whole Playwright set green, so the outcome is not in doubt, and the implementer accepted the gap at the gate.
**Fix:** Re-record T015's green evidence with `npx playwright test e2e/site/data-table-columns.spec.ts` (through `medra task`), or leave it, since T019 carries the Playwright evidence.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-031` | carried from r1: code in `data-table.component.ts`; S1 to S5 in `data-table.component.spec.ts` and `e2e/site/data-table-columns.spec.ts:30,46`; T006 to T009 red then green. | met |
| `DAT-032` | carried from r1: `visible` input in `table-column.component.ts`; S1 to S6 in `data-table.component.spec.ts`; T002, T004, T005 red then green. | met |
| `DAT-033` | carried from r1: `headerGroupTemplate`, `footerGroupTemplate`, conditional `<tfoot>`; S1 to S4 in `data-table.component.spec.ts`; T010 to T012 red then green. | met |
| `DAT-001` | carried from r1: `totalColumnCount` over visible columns; DAT-001.S1 in `data-table.component.spec.ts`. | met |
| `DAT-009` | carried from r1: `exportCSV` uses `visibleColumns`; DAT-009.S1 and DAT-032.S5. | met |
| `DAT-010` | carried from r1: subheader and expansion colspan use `totalColumnCount`; DAT-010.S1 and the resize-handle count test. | met |
| `DAT-024` | r2: `e2e/site/data-table-docs.spec.ts` S7 now asserts all four sections (`column-resize`, `column-resize-expand`, `column-toggle`, `column-groups`); the diff against `diff_base` only adds code. S1 to S6 and S8 carried from r1 (`data-table-frozen.spec.ts:163` for S8). F-02 is open and minor. | met |
