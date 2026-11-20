# Review: add-data-table-frozen-columns-rows-and-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Round 3. F-02 from r2 is resolved: a new test asserts the 60px minimum and the right-edge stacking. The dispatch carried `suite: green`, so the suite was not re-run. Only `data-table.component.spec.ts` changed since r2, and the diff against `diff_base` shows no removed assertions, skips or loosened matchers. F-03 was not claimed as fixed and stays open as a minor finding. Every other requirement is carried from r2.

## Findings

### F-03 [minor] The expansion column clause of DAT-028 is satisfied only by a plan decision

**Where:** `docs/changes/add-data-table-frozen-columns-rows-and-scroll/specs/data-display/spec.md:9` (DAT-028) · plan Design, "Utility columns"
**Problem:** Still open from r1 and r2 and not claimed as fixed. The requirement says the "expansion" column freezes with a left frozen column, but the component has no expansion toggle column (expansion renders a full-width `colspan` row). The clause has nothing to apply to, and the spec does not say so.
**Fix:** At archive, reword the requirement to name only the reorder, selection and radio columns, or note that the expansion row spans the full width and is never sticky.

## Resolved from r2

- **F-02 resolved.** `data-table.component.spec.ts:1548-1560` adds "right-frozen columns stack from the right edge and a width-less one adds 60px to the next offset". The host (`:1491-1496`) gives the third column no `width` and `alignFrozen="right"`. The test freezes the second column to the right as well, then asserts `right: 0px` on the third column and `right: 60px` on the second, on the header and on the first body row. The 60px minimum (`MIN_FROZEN_COLUMN_PX`, `data-table.component.ts:38`) and the two-column right stack are both asserted, and the test is not vacuous. I ran the "frozen columns" tests: 7 passed.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-028` | S3 (left stack, right edge, right stack with 60px minimum), S4, S5 and S6 in `data-table.component.spec.ts:1521-1600`, re-checked in r3. S1, S2 and S4 carried from r2: `e2e/site/data-table-frozen.spec.ts:23,48,65`. See F-03. | met |
| `DAT-029` | Carried from r2: S1, S2, S4 and S5 in `data-table.component.spec.ts`; S3 and S6 in `e2e/site/data-table-frozen.spec.ts:94,111`. | met |
| `DAT-030` | Carried from r2: S1 and S2 in `e2e/site/data-table-frozen.spec.ts:129,142`. | met |
| `DAT-024` | Carried from r2: S1-S5 existing, S6 in `e2e/site/data-table-docs.spec.ts:115`. | met |
