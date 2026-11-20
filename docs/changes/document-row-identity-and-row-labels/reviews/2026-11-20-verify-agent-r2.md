# Review: document-row-identity-and-row-labels — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Round 2 carries every requirement forward from r1: `changed_since_previous` is empty, so no code changed, and the suite is green. F-01 from r1 is not fixed. It stays open as a minor finding, because the gate decision of 2026-11-20 treats the sorting-and-pagination work as out of scope and no code changed. No regressions and no new findings.

## Findings

### F-01 [minor] Diff against `diff_base` carries work from another change (carried from r1, open)

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts` (`removableSort` input and the sort toggle) · `.changeset/data-table-removable-sort.md` · the presort, removable-sort and programmatic-pagination entries in `data-table.page.ts` · DAT-002 and DAT-005 test tags
**Problem:** The re-check of the diff against `c4e0e5a` still shows `removableSort` and the minor changeset. The proposal puts "Changing the component" and "A changeset" out of scope, and no task of this change accounts for them. The gate note records them as out of scope for this change, with no code change. They stay in the working tree, so the finding is open, not resolved. I did not judge them against this change's contract.
**Fix:** Commit the archived sorting-and-pagination change on its own, separately from this change, so this change's diff holds only the DAT-027 and DAT-024.S5 files. Until then, treat this as a known and accepted minor finding.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-027` (S1-S5) | carried from r1: `data-table.component.spec.ts:1391` (S1), `:1400` (S2), `:1412` (S3), `:1422` and `:1446` (S4), `:1466` (S5); `e2e/site/data-table-docs.spec.ts:112` (S1). No changed code since r1. Suite green at dispatch. | met |
| `DAT-024` (S1-S5) | carried from r1: `e2e/site/data-table-docs.spec.ts:59`, `:67`, `:80`, `:89`, `:100`. No changed code since r1. | met |
