# Review: extend-data-table-sorting-and-pagination — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 0 · major 1 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

The `removableSort` input, the retagged tests and the new S2, S3 and S4 tests of DAT-002 are correct, and the suite is green. The change fails because the second Then of DAT-005.S4 (return to the first page after choosing a page size) has no test, although `medra coverage` lists the scenario as covered. DAT-005 is therefore `unverified`, and verify approval would merge an unproven clause into the living spec.

## Findings

### F-01 [major] DAT-005.S4 test never checks the return to the first page

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:1017` · DAT-005.S4, T001
**Problem:** The scenario's Given is "25 rows on the third page", and its second Then is "the first page is the current page". The test starts on page 1 (`rows = 1`, `first` never moved) and only asserts `bodyRows` has length 3. It cannot fail if the table stays on a later page after a size change. The `// DAT-005.S4` tag makes `medra coverage` report 8/8, but the "And" clause has no assertion, and D-03 retagged the old test without extending it.
**Fix:** In the DAT-005.S4 test, move to a later page before choosing the size (set `fixture.componentInstance.first.set(2)` with `rows = 1`, or click `button[aria-label="Page 3"]`). After choosing the size, assert `fixture.componentInstance.first()` is `0` and that `button[aria-current="page"]` has `aria-label` `Page 1`. If this exposes a component bug, fix the component under T002's scope.

### F-02 [minor] Presort demo does not match the plan's design

**Where:** `projects/site/src/app/pages/docs/components/demos/data-table-presort.demo.html:1` · plan, "Sorting and paging design", T003
**Problem:** The plan says `presort` binds `sortField` and `sortOrder` two-way and has buttons that change them from code. The demo sets static attributes (`sortField="quantity" sortOrder="desc"`), with no binding and no buttons. DAT-002.S3 is still shown, but the two-way contract named in the plan is not demonstrated.
**Fix:** Bind `[(sortField)]` and `[(sortOrder)]` to demo fields and add the buttons the plan describes, or amend the plan section to say the demo is static.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-002` | Code: `removableSort` input at `data-table.component.ts:430`, `toggleSort` at `:807`. Tests: S1 `spec.ts:147`, S2 `:220`, S3 `:168-169`, S4 `:178-179` assert the real `aria-sort` sequences. Task evidence T001 red and T002 green, suite green at dispatch. No assertions removed, no skips, no mocks of the behavior under test. | met |
| `DAT-005` | S1 `spec.ts:309`, S2 `:325-326` and S3 `:339-340` assert the page slice, the current page and the written-back `first`. S4 `:1017` asserts the row count only, not the return to the first page (F-01). | unverified |
