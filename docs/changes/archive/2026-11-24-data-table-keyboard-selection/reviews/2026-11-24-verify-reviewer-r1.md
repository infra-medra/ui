# Review: data-table-keyboard-selection — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

All 13 scenarios across `DAT-026` and `DAT-043` are implemented, cited by unit/component or e2e tests asserting every Given/When/Then clause, and pass with TDD red/green evidence and an unbroken green suite. The most important issue is in `navigateCell`, where `Shift+Arrow*` cell range selection indexes `visibleBodyRows()` using the window-relative DOM row index and breaks when `virtualScroll` is scrolled past the first row (`F-01`). Two minor issues cover stale keyboard range anchors on mouse drag start (`F-03`) and uncommitted files from the previously archived `persist-data-table-extended-state` change remaining in the working tree against `diff_base` `8661bd0` (`F-02`).

## Findings

### F-01 [major] `navigateCell` indexes `visibleBodyRows()` by local DOM index, breaking `Shift+Arrow*` cell range selection under `virtualScroll`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2966-3005` · `DAT-043`, `DAT-046`
**Problem:** `navigateCell` computes `rowIndex = rowElements.indexOf(tr)` over only the currently rendered `<tr>` elements in `tbody` (`lines 2966-2967`), and when `Shift` is held in `'multiple'` mode (`lines 2992-2995`), resolves the target row with `const visibleRows = this.visibleBodyRows(); const targetRow = visibleRows[targetRowIndex];`. When `virtualScroll` is active and scrolled past row 0 (or when lazy placeholders precede rendered rows), `virtualEntries()` renders only the active window starting at `start > 0`, so `rowElements[0]` represents `pagedValue()[start]` rather than `visibleRows[0]`; indexing `visibleRows[targetRowIndex]` selects rows from the top of the dataset instead of the neighbor of `row` (violating `DAT-046`'s requirement that `cellSelection` behaves on rendered rows under `virtualScroll` as it does without it, unlike `extendRowSelection` at `lines 2677-2705` which uses `aria-rowindex`). In addition, `r.querySelector('td[data-med-field]')` at `line 2966` checks descendants recursively rather than direct `:scope > td[data-med-field]` cells, which would misalign `rowElements` if a `#rowexpansion` template renders a nested `<med-data-table>`.
**Fix:** In `navigateCell`, narrow the `rowElements` filter at `line 2966` to `r.querySelector(':scope > td[data-med-field]') !== null`, and when `this.virtualScroll()` is enabled, resolve `targetRow` via the target `<tr>`'s `aria-rowindex` (`Number(rowElements[targetRowIndex].getAttribute('aria-rowindex')) - this.rowsBeforeBody() - 1`) in `this.pagedValue()` (returning early if `null` or `undefined` for an unloaded lazy placeholder) instead of indexing `visibleBodyRows()` by `targetRowIndex`; add a unit test covering `Shift+Arrow*` cell range selection in a scrolled `virtualScroll` table.

### F-02 [minor] Working-tree diff against `diff_base` `8661bd0` includes uncommitted files from archived change `persist-data-table-extended-state`

**Where:** `docs/changes/data-table-keyboard-selection/.medra.yaml:5`, `.changeset/data-table-extended-state.md`, `projects/medra/ui/src/lib/data-table/data-table-state.ts`, `projects/medra/ui/src/lib/data-table/table-column.component.ts` · `proposal.md` Scope
**Problem:** Repository `HEAD` sits at `8661bd0` (`diff_base` for `data-table-keyboard-selection`), while the working tree still carries uncommitted files and edits from the previously verified and archived change `persist-data-table-extended-state` (`docs/changes/archive/2026-11-23-persist-data-table-extended-state/`). Although those edits come from an already-archived change rather than unapproved additions by this change, mixing them into the same working tree causes the `git diff` against `diff_base` to span 15+ files outside `docs/changes/data-table-keyboard-selection/proposal.md` Scope (see `docs/learnings.md` L-004).
**Fix:** Commit the archived `persist-data-table-extended-state` working-tree files separately before archiving `data-table-keyboard-selection` so each change's diff against its base reflects only its own scope.

### F-03 [minor] `onCellMouseDown` leaves stale keyboard range anchor state active across drag selection

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2861-2883` · `DAT-043`
**Problem:** When starting a drag selection in `onCellMouseDown`, `this.cellRangeAnchor` and `this.cellRangeFocus` are not cleared. If a user previously extended a keyboard range ending at cell `C`, then drags out and back onto `C` (causing `onCellMouseUp` to set `suppressNextCellClick = true` so `onCellClick` does not clear the range state), a subsequent `Shift+Arrow*` from `C` matches `this.cellsEqual(this.cellRangeFocus, currentCell)` at `line 2999` and extends from the stale pre-drag keyboard anchor instead of anchoring at `C`.
**Fix:** Reset `this.cellRangeAnchor = null; this.cellRangeFocus = null;` inside `onCellMouseDown` once the early-return guards pass (around `line 2875`), and add a unit test verifying that `Shift+Arrow*` after an out-and-back cell drag re-anchors at the focused cell.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-026` | `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:499-625` (`DAT-026.S1`–`DAT-026.S5`), `projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts:85-187` (`DAT-026.S6`–`DAT-026.S8`); tasks `T001` (red) and `T002` (green: `npx jest projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` exit 0); suite green | met |
| `DAT-043` | `e2e/site/data-table-cell-context.spec.ts:61-82` (`DAT-043.S1`), `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3836-3970` (`DAT-043.S1`–`DAT-043.S2`), `projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts:234-407` (`DAT-043.S3`–`DAT-043.S5`); tasks `T003` (red) and `T004` (green: `npx jest projects/medra/ui/src/lib/data-table` exit 0, authorized test edit recorded); suite green | met |
