# Review: add-data-table-column-reorder — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

F-01 from r1 is resolved: `onColDragStart` now calls `event.preventDefault()` when a column resize is in progress, and a new unit test proves it. The suite is green per dispatch, and the spec file still has no removed lines against `b1468e5`, so no test was weakened. Only the component and its spec changed since r1, so the remaining requirements are carried forward. The one open item is a minor mislabelled scenario tag on the new test.

## Findings

### F-02 [minor] New D-03 test is tagged with scenario `DAT-034.S6`, which it does not exercise

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:2288-2289` · DAT-034.S6, plan D-03
**Problem:** The test asserts that `dragstart` is cancelled during a resize. S6 is about hidden columns keeping their place. The tag makes `medra coverage` list line 2288 as S6 evidence, and a reader of the coverage output would take it as proof of a scenario it does not test (see L-002). The real S6 test at line 2247 is unaffected.
**Fix:** Drop the scenario ID from the test title and the comment, and keep the "plan D-03" reference. For example: `it('plan D-03: dragstart is cancelled while a column resize is in progress and the order does not change', ...)`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-034` | r2: F-01 fix verified at `data-table.component.ts:1059-1062`. The new test at `data-table.component.spec.ts:2289-2306` starts a resize through `pointerdown` on the handle, dispatches a cancelable `dragstart`, asserts `defaultPrevented` is true, then asserts that the order is unchanged and `colReorder` was not emitted. The other scenarios carry from r1: S1–S11 are in the `describe('DataTableComponent column reorder')` block, and S1, S5 and S8 also have e2e tests in `e2e/site/data-table-column-reorder.spec.ts`, which is unchanged since r1 (same snapshot hash). `medra coverage` reports 20/20, and `suite: green`. | met |
| `DAT-024` | carried from r1. The page, demo and prose files and `e2e/site/data-table-docs.spec.ts` are unchanged (same snapshot hashes). | met |
