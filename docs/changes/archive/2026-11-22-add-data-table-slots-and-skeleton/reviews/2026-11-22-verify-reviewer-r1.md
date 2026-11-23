# Review: add-data-table-slots-and-skeleton — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-22

## Summary

Verification fails because restructuring `med-data-table` to nest its scroll viewport inside an outer bordered container broke existing Playwright e2e direct-child selectors in `e2e/site/data-table-frozen.spec.ts` and `e2e/site/data-table-column-reorder.spec.ts`, causing 8 e2e failures including `DAT-024.S8` (part of this change's `DAT-024` requirement). The new `DAT-040`, `DAT-041`, `DAT-042`, `DAT-007`, and `DAT-024.S12` implementation, unit tests, docs demos, changeset, and TDD red/green evidence are otherwise complete and compliant.

## Findings

### F-01 [critical] Wrapper DOM change breaks existing Playwright scroll and frozen-column selectors

**Where:** `e2e/site/data-table-frozen.spec.ts:11`, `e2e/site/data-table-frozen.spec.ts:101`, `e2e/site/data-table-frozen.spec.ts:118`, `e2e/site/data-table-column-reorder.spec.ts:59` (triggered by `projects/medra/ui/src/lib/data-table/data-table.component.ts:340-346`) · `DAT-024.S8` (and `DAT-028.S1`, `DAT-028.S2`, `DAT-029.S3`, `DAT-029.S6`, `DAT-030.S1`, `DAT-030.S2`, `DAT-034.S5`)
**Problem:** Moving `overflow-x-auto` and `overflow-y-auto` from the outer `wrapperClass()` container (`med-data-table > div`) to the nested inner viewport (`med-data-table > div > div`) leaves no element matching `med-data-table > div.overflow-x-auto` or `> div.overflow-y-auto`. Running `npx playwright test --reporter=list --project=site e2e/site/data-table-frozen.spec.ts e2e/site/data-table-column-reorder.spec.ts e2e/site/data-table-slots-skeleton.spec.ts` timed out (30s) on all 7 tests using those selectors in `e2e/site/data-table-frozen.spec.ts` (including `DAT-024.S8` at line 164) and on `DAT-034.S5` in `e2e/site/data-table-column-reorder.spec.ts:54` (`T008` only ran `data-table-slots-skeleton.spec.ts` and `data-table-docs.spec.ts`, and `T009` ran Jest only). (One additional failure in that run, `DAT-034.S8` at `e2e/site/data-table-column-reorder.spec.ts:84`, is a pre-existing timing race where `headerLabels` reads before Angular renders the keyboard reorder shown in the failure snapshot.)
**Fix:** Update the scroll-viewport locators in `e2e/site/data-table-frozen.spec.ts` (`med-data-table > div.overflow-x-auto` → `med-data-table div.overflow-x-auto`, and `> div.overflow-y-auto` → `div.overflow-y-auto`) and `e2e/site/data-table-column-reorder.spec.ts:59` (`med-data-table > div.overflow-x-auto` → `med-data-table div.overflow-x-auto`), or add a dedicated `data-med-scroll-viewport` attribute on the inner viewport in `projects/medra/ui/src/lib/data-table/data-table.component.ts:346` and query that across the e2e specs, then re-run the `e2e/site/data-table-*.spec.ts` suite.

### F-02 [minor] Skeleton rows omit opaque frozen utility backgrounds and frozen cell side borders

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:484-495`, `projects/medra/ui/src/lib/data-table/data-table.component.ts:1292-1294` · `DAT-042` / `DAT-028`
**Problem:** In skeleton loading mode, the `reorderable` and `selectionMode` utility `<td>` cells call `utilityStyle(...)` (which sets `position: sticky` when `utilityFrozen()` is true) without an opaque background class, so horizontally scrolled skeleton cells can show through sticky utility columns. Additionally, `skeletonCellClass(col)` applies `'sticky z-[1] bg-surface-0 dark:bg-surface-800'` when `col.frozen()` is true without the `border-r` / `border-l` and `border-surface-200 dark:border-surface-700` divider used by `frozenCellClass`.
**Fix:** Add `utilityFrozen() ? 'bg-surface-0 dark:bg-surface-800' : ''` to the skeleton `reorderable` and `selectionMode` utility cells, and include `(col.alignFrozen() === 'left' ? 'border-r' : 'border-l') + ' border-surface-200 dark:border-surface-700'` in `skeletonCellClass(col)` when `col.frozen()` is true.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-040` | `T001` (red) → `T002` (green); Jest `DAT-040.S1`, `DAT-040.S2` (`projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3532,3575`); Playwright `DAT-040.S1` (`e2e/site/data-table-slots-skeleton.spec.ts:62`, passed) | met |
| `DAT-041` | `T003` (red) → `T004` (green); Jest `DAT-041.S1`, `DAT-041.S2` (`projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3599,3627`); Playwright `DAT-041.S1` (`e2e/site/data-table-slots-skeleton.spec.ts:92`, passed) | met |
| `DAT-042` | `T005` (red) → `T006` (green, valid zoneless `signal(true)` host fix); Jest `DAT-042.S1`, `DAT-042.S2` (`projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:3650,3680,3703`); Playwright `DAT-042.S1`/`DAT-042.S2` (`e2e/site/data-table-slots-skeleton.spec.ts:106`, passed) | met |
| `DAT-007` | `T005`–`T006`; Jest `DAT-007.S1`, `DAT-007.S2`, and default spinner `loading` tests (`projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:730-742,847,3414`) | met |
| `DAT-024` | `T007` (red) → `T008` (green for `data-table-slots-skeleton.spec.ts` and `data-table-docs.spec.ts`); Playwright `DAT-024.S12` (`e2e/site/data-table-slots-skeleton.spec.ts:13,62,92,106`, passed); `DAT-024.S8` (`e2e/site/data-table-frozen.spec.ts:164`) failed in focused Playwright run due to `F-01` | partial |
