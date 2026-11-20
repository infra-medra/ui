# Review: add-data-table-frozen-columns-rows-and-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

Round 2. F-01 from r1 is resolved: frozen rows are now display-only, and a new unit test asserts it. The dispatch carried `suite: green`, so the suite was not re-run. Only `data-table.component.ts` and its spec changed since r1, and the diff against `diff_base` shows no removed assertions, skips or loosened matchers. F-02 and F-03 were not claimed as fixed and stay open as minor findings. Every other requirement is carried from r1.

## Findings

### F-02 [minor] The 60px minimum width and right-edge stacking have no assertion

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:1537-1546` (second DAT-028.S3 test) · DAT-028
**Problem:** Still open from r1 and not claimed as fixed. The test title says "a frozen column without a width counts 60px", but it only asserts `right: 0px` on the single right-frozen column. Nothing checks that a width-less frozen column adds 60px to the next offset, and nothing checks that several right-frozen columns stack. DAT-028 states both rules. This is the L-002 pattern.
**Fix:** Add a case with a width-less frozen column followed by another frozen column on the same edge, and assert the second offset is `60px`. Assert a two-column right stack.

### F-03 [minor] The expansion column clause of DAT-028 is satisfied only by a plan decision

**Where:** `docs/changes/add-data-table-frozen-columns-rows-and-scroll/specs/data-display/spec.md:9` (DAT-028) · plan Design, "Utility columns"
**Problem:** Still open from r1 and not claimed as fixed. The requirement says the "expansion" column freezes with a left frozen column, but the component has no expansion toggle column (expansion renders a full-width `colspan` row). The clause has nothing to apply to, and the spec does not say so.
**Fix:** At archive, reword the requirement to name only the reorder, selection and radio columns, or note that the expansion row spans the full width and is never sticky.

## Resolved from r1

- **F-01 resolved.** `data-table.component.ts:242-266`: `dataCells` takes a `frozen` context flag. `frozenRow` passes `frozen: true`, the `dblclick` binding is a no-op for it, and the editing branch is skipped (`!frozen && isEditingCell(...)`). `rowClassFor(row, i, false)` drops `cursor-pointer` for frozen rows (`:259`, `:881-886`). The test at `data-table.component.spec.ts:1653` uses `editMode="cell"` with the editable `name` column, dispatches a `dblclick` on the frozen cell, asserts no `input.edit-input` renders, and asserts the frozen row has no `cursor-pointer` while the next data row does. The harness column is editable and its edit template renders `input.edit-input` (`:60-63`), so the test is not vacuous. I ran it: 2 passed. The `med-icon` warning in its output is existing noise.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-028` | Carried from r1: S1, S2 and S4 in `e2e/site/data-table-frozen.spec.ts:23,48,65`; S3, S4, S5 and S6 in `data-table.component.spec.ts:1521-1584`. Code is unchanged in the regions it covers. See F-02 and F-03. | met |
| `DAT-029` | S1, S2, S4 and S5 in `data-table.component.spec.ts:1599-1674`, re-checked in r2 for the `frozen` flag change. S3 and S6 in `e2e/site/data-table-frozen.spec.ts:94,111`, carried from r1. The display-only behaviour is asserted at `:1653`. | met |
| `DAT-030` | Carried from r1: S1 and S2 in `e2e/site/data-table-frozen.spec.ts:129,142`. | met |
| `DAT-024` | Carried from r1: S1-S5 existing, S6 in `e2e/site/data-table-docs.spec.ts:115`. | met |
