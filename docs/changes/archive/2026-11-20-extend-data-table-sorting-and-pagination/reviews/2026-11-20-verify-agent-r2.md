# Review: extend-data-table-sorting-and-pagination — verify

**Stage:** verify
**Verdict:** pass
**Counts:** critical 0 · major 0 · minor 0
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Both findings of r1 are resolved and the suite is green at dispatch. The DAT-005.S4 test now starts on the third page, then asserts that `first` is 0 and that the current page is "Page 1" after choosing a size of 3. DAT-005 is therefore `met`, and no regression was found in the changed files.

## Findings

None.

Resolved from r1:

- F-01: `data-table.component.spec.ts:1017-1039` sets `first` to 2, asserts the current page is "Page 3", chooses 3 rows per page, then asserts `first()` is 0 and the current page is "Page 1". The test can now fail if the table stays on a later page.
- F-02: `data-table-presort.demo.html` binds `[(sortField)]` and `[(sortOrder)]` to demo fields and adds "Sort by name" and "Reset to quantity (desc)" buttons that change them from code. The `.demo.ts` holds the matching fields and handlers. This matches the plan's presort design.

Audits this round: weakening audit on `data-table.component.spec.ts` against `c4e0e5a` found no removed assertions, skips, loosened matchers or mocks of the behavior under test. The only changes are additions and the extended S4 test. Scope-creep check: changed files are the component, the spec, the docs page, the three demos with their prose files, and the changeset, all accounted for by T001 to T005.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-002` | carried from r1: `removableSort` input at `data-table.component.ts:430`, `toggleSort` at `:807`. Tests S1 `spec.ts:147`, S2 `:220`, S3 `:168-169`, S4 `:178-179` assert the real `aria-sort` sequences. The presort demo now follows the plan (F-02). T001 red and T002 green. | met |
| `DAT-005` | S1 `spec.ts:309`, S2 `:325-326` and S3 `:339-340` assert the page slice, the current page and the written-back `first`. S4 `:1017` now asserts the move off page 3, the row count, `first() === 0` and "Page 1" as the current page (F-01 fixed). Suite green at dispatch. | met |
