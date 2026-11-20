# Review: add-data-table-frozen-columns-rows-and-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 3
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

DAT-028, DAT-029, DAT-030 and the DAT-024 modification are implemented as the deltas and plan describe, and every scenario has a test that asserts its Given/When/Then clauses. The dispatch carried `suite: green`, so the suite was not re-run. The `tdd` red and green evidence lines are present on every task, and the diff shows no removed assertions, skips or loosened matchers. The most important finding is that frozen rows still carry the cell double-click edit handler, which the plan's D-02 says they must not have. The other two findings are test-precision gaps.

## Findings

### F-01 [minor] Frozen rows keep the cell edit handler and the selectable-row cursor

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:244` (`dataCells`, `(dblclick)="onCellDblClick(...)"`) and `:261` (`frozenRow` uses `rowClassFor`) · DAT-029, plan D-02
**Problem:** Plan D-02 says frozen rows are display-only, with "no handlers". The `frozenRow` template reuses `dataCells`, which binds `onCellDblClick`. With `editMode="cell"` and an editable column, a double-click on a frozen row opens the editor, and `saveEdit` emits `editComplete` for a row that is not in `value`. `frozenRow` also applies `rowClassFor`, which adds `cursor-pointer` whenever `selectionMode` is set, although frozen rows cannot be selected (DAT-029.S4). No test covers either case.
**Fix:** Skip the edit handler and the editing branch for frozen rows. For example, pass a `frozen` flag in the `dataCells` context and have `onCellDblClick` return early. Drop `cursor-pointer` from the frozen row class. Add a unit test that a double-click on a frozen cell does not open the editor.

### F-02 [minor] The 60px minimum width and right-edge stacking have no assertion

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:1549` (second DAT-028.S3 test) · DAT-028
**Problem:** The test title says "a frozen column without a width counts 60px", but it only asserts `right: 0px` on the single right-frozen column. Nothing checks that a width-less frozen column adds 60px to the next offset, and nothing checks that several right-frozen columns stack. DAT-028 states both rules. This is the L-002 pattern: the tag matches, and the clause is not asserted.
**Fix:** Add a case with a width-less frozen column followed by another frozen column on the same edge. Assert the second offset is `60px`, and assert a two-column right stack.

### F-03 [minor] The expansion column clause of DAT-028 is satisfied only by a plan decision

**Where:** `docs/changes/add-data-table-frozen-columns-rows-and-scroll/specs/data-display/spec.md` (DAT-028) · plan Design, "Utility columns"
**Problem:** The requirement says the "expansion" column freezes with a left frozen column. The component has no expansion toggle column (expansion renders a full-width `colspan` row), so the clause has nothing to apply to. The plan records this, but the spec still reads as if a column exists, and a later reader cannot tell the clause is vacuous.
**Fix:** At archive, reword the requirement to name only the reorder, selection and radio columns. Alternatively, add a note that the expansion row spans the full width and is never sticky.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-028` | S1, S2 and S4 (computed `table-layout` and alpha) in `e2e/site/data-table-frozen.spec.ts:23,48,65`. S3, S4 (`table-fixed` and `bg-surface-*`), S5 and S6 in `data-table.component.spec.ts:1521-1584`. Implementation: `frozenLayout`, `frozenStyle`, `utilityStyle` and `frozenCellClass` in `data-table.component.ts`. Tasks T002-T006 carry red and green evidence. See F-02 and F-03. | met |
| `DAT-029` | S1, S2, S4 and S5 in `data-table.component.spec.ts:1599-1653`. S3 and S6 in `e2e/site/data-table-frozen.spec.ts:94,111`. Frozen rows come from a separate `frozenRows` computed, so they bypass sort, filter, paging and selection. Tasks T007-T010 carry red and green evidence. See F-01. | met |
| `DAT-030` | S1 and S2 in `e2e/site/data-table-frozen.spec.ts:129,142`. Implementation: `flexHeight`, host `min-w-0`, wrapper `flex-1 min-h-0`. Tasks T011-T012 carry red and green evidence. | met |
| `DAT-024` | S1-S5 carried by the existing tests, S6 in `e2e/site/data-table-docs.spec.ts:115`. `EXAMPLES` has the five new entries in `data-table.page.ts:161-165`, with five demos and prose files. The demos use only implemented inputs. Tasks T013-T017 carry red and green evidence. | met |
