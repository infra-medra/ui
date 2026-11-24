# Review: data-table-responsive-stack-enhancements — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-24

## Summary

Round 2 resolves the critical real-browser gap and the main code defects from Round 1: `DataTableComponent` fixes `<select>` pre-sort synchronization and `removableSort="false"` resetting (`F-02`), leading-dot decimal and host `em` unit handling in `breakpointPx` (`F-04`), and `data-table-responsive-stack-enhancements.spec.ts` adds unit tests for ascending `sort` emission, pre-sorted mount, `removableSort="false"`, `sortMode="multiple"`, `lazyLoad`, label overrides, and render gating (`F-03`), while Playwright real-browser tests pass (`20/20`) for `DAT-050.S7` and `DAT-060.S1`. Both `DAT-050` and `DAT-060` now meet their contracts. The most important remaining finding is that the new real-browser `DAT-060.S1` Playwright test omits asserting rendered `tbody tr` row reordering, uses a non-discriminating `darkBg !== ''` check, and verifies only programmatic DOM focus rather than computed `:focus-visible` outline styles.

## Findings

### F-01 [major] Incomplete assertions in real-browser `DAT-060.S1` test (row order, dark-mode comparison, and focus ring)

**Where:** `e2e/site/data-table-responsive-stack.spec.ts:214-233` · `DAT-060` (`DAT-060.S1`), Constitution Articles V & XI
**Problem:** Although `e2e/site/data-table-responsive-stack.spec.ts:214-233` is tagged `// DAT-060.S1` and titled `visible stacked sort bar sorts rows, shows focus ring, and styles in dark mode`, three checks are incomplete or non-discriminating:
1. After `select.selectOption('role')` and `dirBtn.click()`, the test asserts only `aria-sort` on the hidden `thead th[scope="col"]` (`lines 222, 228`) and never asserts that the rendered `tbody tr` rows reorder ascending then descending (Constitution Article XI; unlike the Jest test at `data-table-responsive-stack-enhancements.spec.ts:143-157`).
2. Under `.dark`, `expect(darkBg).not.toBe('')` (`lines 230-232`) always passes in Chromium because `getComputedStyle(el).backgroundColor` never returns an empty string, so it never verifies that dark-mode tokens change the sort bar's appearance compared to light mode (unlike `DAT-051.S5` at `lines 115-127`).
3. `await dirBtn.focus(); await expect(dirBtn).toBeFocused();` (`lines 224-226`) checks only `document.activeElement` via programmatic `.focus()`, not computed `:focus-visible` focus-ring styling (`outlineStyle`/`outlineWidth` via keyboard navigation such as `Tab`).
**Fix:** Assert the rendered `tbody tr` cell text order after selecting `role` (ascending) and clicking `data-med-stack-sort-dir` (descending), read `sortBar`'s light `backgroundColor` before adding `.dark` and assert `darkBg !== lightBg`, and trigger focus with keyboard `Tab` (or verify computed `outlineStyle !== 'none'` and non-zero `outlineWidth`).

### F-02 [minor] Incomplete Jest coverage for `sortMode="multiple"` column selection, multiple-mode `sort` emission, and `lazyLoad` payloads

**Where:** `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts:209-288` · `DAT-060`
**Problem:** The new `DAT-060` test (`lines 209-288`) covers toggling and clearing pre-existing `multiSortMeta`, `lazyLoad` count increase on clear, custom label overrides, and render gating, but leaves three paths untested in Jest:
1. `AdvancedStackSortHostComponent` initializes `multiSortMeta = [{ field: 'price', order: 'asc' }]` (`line 241`) and never dispatches a `<select>` `change` event, so `onStackSortFieldChange`'s `sortMode === 'multiple'` branch (`data-table.component.ts:3240-3241`) is never exercised.
2. `(sort)` is not bound on `AdvancedStackSortHostComponent` (`lines 216-231`), so `sort` event emission in `sortMode="multiple"` is unasserted.
3. Under `[lazy]="true"` (`lines 275-281`), `lazyLoad` is checked only via `lazyEvents.length > beforeLazyCount` on `clearBtn.click()`, without verifying `lazyLoad` on column selection/direction toggle or checking the emitted `TableLazyLoadEvent` (`sortField`/`multiSortMeta`).
**Fix:** Bind `(sort)` on `AdvancedStackSortHostComponent`, dispatch a `<select>` `change` to `'name'` in `sortMode="multiple"` and assert `multiSortMeta` and the `sort` payload, and assert the emitted `TableLazyLoadEvent` fields across selection, toggle, and clear in `lazy` mode.

### F-03 [minor] Working-tree diff against `diff_base` `8661bd0` still contains uncommitted files from previously archived changes

**Where:** `docs/changes/data-table-responsive-stack-enhancements/.medra.yaml:5`, `.changeset/data-table-extended-state.md`, `docs/changes/archive/2026-11-23-persist-data-table-extended-state/`, `docs/changes/archive/2026-11-24-data-table-advanced-filters/`, `docs/changes/archive/2026-11-24-data-table-keyboard-selection/`, `docs/changes/archive/2026-11-24-data-table-sorting-columns-csv/` · `proposal.md` Scope
**Problem:** Carried from r1 (`F-05`): `git status` confirms that the working tree against `diff_base` `8661bd0` still holds uncommitted edits and new files from four previously archived changes alongside this change's files.
**Fix:** Commit the previously archived changes separately before archiving `data-table-responsive-stack-enhancements` so the diff against `diff_base` isolates this change's files.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-050` | `projects/medra/ui/src/lib/data-table/data-table.component.ts:1200-1204, 1345-1394, 1730-1751` (including leading-dot `breakpointPx` and host `em` font-size fix at `1349-1363`); `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:5506-5593` (`DAT-050.S1`–`S6`, carried from r1); `e2e/site/data-table-responsive-stack.spec.ts:28-94` (`DAT-050.S1`–`S4`, carried from r1); `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts:41-100` (`DAT-050.S7`); `projects/site/src/app/pages/docs/components/demos/data-table-responsive-stack.demo.html:70-82` and `e2e/site/data-table-responsive-stack.spec.ts:192-212` (`DAT-050.S7` real-browser `600px -> 420px -> 500px` `table -> block -> table`, Playwright 20/20 green); tasks `T001` (red), `T002` (green) | met |
| `DAT-060` | `projects/medra/ui/src/lib/data-table/data-table.component.ts:584-620, 684-685, 1206-1212, 1902-1909, 2556-2562, 3039, 3076, 3219-3279` (including `[selected]`/`[disabled]` `<option>` bindings at `592, 594` and `removableSort="false"` reset at `3233-3236`); `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts:103-288` (`DAT-060.S1` asc/desc/clear + `sort` emissions + `aria-sort`, pre-sorted mount & `removableSort="false"`, `sortMode="multiple"`, `lazy`, custom labels, render gating; Jest `Suite: green`); `e2e/site/data-table-responsive-stack.spec.ts:214-233` (`DAT-060.S1` visible bar, column selection, toggle, `aria-sort`, Playwright 20/20 green); tasks `T001` (red), `T002` (green) | met |
