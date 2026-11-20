# Review: add-data-table-row-editing-and-group-modes — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

All five round-1 findings (F-01 to F-05) are resolved, and the suite is green. The critical F-01 fix works: `expansionLayout` splits the expansion row into a leading and a trailing cell around the merged column, and a new unit test with a selection column asserts that the cells plus the merged slot add up to the column count. One minor edge remains: a table whose only column is the merged one renders an expansion row with no cell, so the expansion content never shows.

## Findings

### F-01 [minor] Expansion row renders no cell when the merged column is the only column

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:861` (`expansionLayout`) and `:490` · DAT-036.S3 · T011
**Problem:** `lead = utilityBefore + idx` and `trail = cols.length - idx - 1 + (editMode === 'row' ? 1 : 0)`. With `rowGroupMode="rowspan"`, one visible column (the grouped one), no selection, no reorder and no row-edit actions column, both are 0. The template emits neither cell, so an expanded row has no `<td>` and its `#rowexpansion` content is lost. The case is unusual and no requirement scenario covers it.
**Fix:** When `lead + trail === 0`, skip rendering the expansion row, or document that `rowspan` grouping needs a second column. Add a one-line unit test for whichever is chosen.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-035` | S1 to S6 unit tests. This round: F-02 fixed (`saveRowEdit` builds `values` from every editable column, test "values include editable fields the user did not touch" asserts `{ name, stock }`). F-03 fixed (`rowActionButtonClass` uses `outline-brand-500`; no `primary-500` is left under `data-table/`). F-04 fixed (Enter saves only inside `[data-med-editing]`, test "Enter on the edited row outside an edit template does not save it"). F-05 fixed (test with the key-handler-free `stock-input` asserts one `rowEditComplete` and one `rowEditCancel`). Round-1 e2e `data-table-row-editing.spec.ts` is unchanged. | met |
| `DAT-036` | S1, S2 and S4 carried from r1. S3: F-01 fixed; the new test "with a selection column before the merged column…" asserts the split colspans `[1, 1]` plus the merged slot equal 3. The e2e S3 now checks the expansion cell geometry against the merged cell and the table edge. The only gap is the minor edge above. | met |
| `DAT-037` | carried from r1 (S1 to S4 unit tests, S2 e2e; unchanged by this round's edits). | met |
| `DAT-008` | carried from r1 (S1 to S5). The `onRowKeydown` change keeps the edit-cell guard, and the spec diff only adds tests. | met |
| `DAT-010` | carried from r1 (S1 unchanged assertion retagged; T014 green evidence only, recorded as a user-approved blocker). | met |
| `DAT-024` | carried from r1 (docs e2e, page and demos). `data-table-docs.spec.ts` is not in `changed_since_previous`. | met |

Audits: weakening audit on `data-table.component.spec.ts` against `0458357` found only two removed lines, both test titles that gained scenario IDs. No skips or loosened matchers were added. `data-table-row-groups.spec.ts` is untracked, so it has no base to diff; its S3 assertions were strengthened rather than loosened. Scope check: this round's changed files are the three already mapped to T008 to T011 and T013, so no scope creep. The suite was not rerun, since the dispatch carries `suite: green`.
