# Review: document-row-identity-and-row-labels — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Every ADDED and MODIFIED requirement is met. The five DAT-027 unit tests and the DAT-024.S5 and DAT-027.S1 e2e tests assert each Given and Then clause, and the component behavior they describe exists in the code (`rowAriaLabel` at `data-table.component.ts:342,362`, `rowTrackBy` at `:307` and `:1073`). The suite is green, and the diff shows no removed assertions, skips or loosened matchers. The one finding is that the working tree against `diff_base` also holds another change's uncommitted work.

## Findings

### F-01 [minor] Diff against `diff_base` carries work from another change

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:429-430,807` · `.changeset/data-table-removable-sort.md` · `data-table.page.ts` presort, removable-sort and programmatic-pagination entries · DAT-002 and DAT-005 test tags
**Problem:** The proposal puts "Changing the component" and "A changeset" out of scope, yet the diff adds the `removableSort` input and a minor changeset. The diff also adds three sort and pagination demos and DAT-002.S3, DAT-002.S4 and DAT-005.S2-S4 tests. No task of this change accounts for them. They match the untracked `docs/changes/archive/2026-11-20-extend-data-table-sorting-and-pagination/`, so they look like uncommitted work from that change. I did not judge them against this change's contract.
**Fix:** Commit the archived sorting-and-pagination change on its own, separately from this change, so this change's diff holds only the DAT-027 and DAT-024.S5 files.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-027` (S1-S5) | `data-table.component.spec.ts:1391` (S1), `:1400` (S2, multiple and radio), `:1412` (S3), `:1422` and `:1446` (S4, element reuse by id plus the index default), `:1466` (S5, one row expanded, in the reordered list). `e2e/site/data-table-docs.spec.ts:112` (S1, named checkbox in the demo). T001 green, T002 red and green. | met |
| `DAT-024` (S1-S5) | `e2e/site/data-table-docs.spec.ts:59`, `:67`, `:80`, `:89`, `:100` (S5, prose, one demo and a code block for `row-aria-label` and `row-track-by`). The demos, prose files and `EXAMPLES` entries exist. T002 red, T003 green. | met |
