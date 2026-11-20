# Review: add-data-table-row-editing-and-group-modes — verify

**Stage:** verify
**Verdict:** pass
**Counts:** critical 0 · major 0 · minor 0
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

The only open finding of round 2 (F-01) is resolved, and the suite is green. `expansionRowsRender` skips the expansion row when the merged column is the only column (`lead + trail === 0`), and the same flag is used in the rowspan computation (`data-table.component.ts:841`), so the skipped row adds nothing to the rowspan. A new unit test covers the case. No regressions were found in the changed files.

## Findings

None.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-035` | carried from r2 (S1 to S6 unit tests, e2e `data-table-row-editing.spec.ts`; the r3 edits do not touch the row-edit paths) | met |
| `DAT-036` | S1, S2 and S4 carried from r2. S3: r2 split-colspan test still present; new test "DAT-036.S3: with the merged column as the only column…" asserts no `.expanded-detail` and rowspans `['A:3','B:2']`, so F-01 is fixed. The row-edit trailing cell is counted in `trail`, so the table stays rectangular. | met |
| `DAT-037` | carried from r2 (S1 to S4 unit tests, S2 e2e) | met |
| `DAT-008` | carried from r2 (S1 to S5) | met |
| `DAT-010` | carried from r2 (S1) | met |
| `DAT-024` | carried from r2 (docs e2e, page and demos; not in `changed_since_previous`) | met |

Audits: the weakening audit of `data-table.component.spec.ts` against `0458357` found two removed lines, both test titles retitled with scenario IDs (the same two as in r2); no skips or loosened matchers were added. Scope check: the changed files are the component and its spec, both already mapped to T008 to T011 and T013, so there is no scope creep. The suite was not rerun, since the dispatch carries `suite: green`.
