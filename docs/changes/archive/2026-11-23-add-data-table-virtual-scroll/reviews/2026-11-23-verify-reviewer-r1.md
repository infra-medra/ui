# Review: add-data-table-virtual-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 6
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

The implementation meets every scenario of DAT-046, DAT-047, DAT-048, DAT-007 and DAT-024. `medra coverage` reports 32 of 32 scenarios covered, the unit spec diff is additive only, and the suite is green, so the verdict is pass-with-findings. The most important finding is F-01. A runtime change of `rows` in lazy virtual mode clears the requested blocks but does not scroll back to the top, and it requests only the blocks of the first screen. The blocks in view are not requested until the user scrolls again. This contradicts the plan and the component's own TSDoc. The remaining findings are minor: keyboard edge cases, one weak assertion, evidence quality and scope hygiene.

## Findings

### F-01 [major] A `rows` change in lazy virtual mode neither scrolls to the top nor requests the blocks in view

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1226-1245` (scroll reset effect), `:1291-1306` (block request effect), `:335-337` (TSDoc) · DAT-048, T002/T006
**Problem:** The plan (Architecture, "Lazy blocks") says the reset effect watches `sortField`, `sortOrder`, `multiSortMeta`, `globalFilterValue`, `columnFilters` **and `rows`**, clears the set and resets the scroll position. The class TSDoc at line 335 also says "a change to the sort, the global filter, the column filters or `rows` ... scrolls back to the top". The scroll reset effect does not read `pageSize()`. The block effect does include `pageSize()` in its key. On a `rows` change it therefore clears `requestedBlocks` and requests `rangeAt(0)`, the first screen, while the viewport stays where it was (for example at row 50,000). The rows in view keep their placeholders, and their blocks (now of the new size) are never requested until the next scroll moves `virtualRange`. DAT-048 requires the table to request blocks that the viewport reaches and that were not requested yet. With a stale request key, the visible rows are never requested.
**Fix:** Read `this.pageSize()` in the scroll reset effect (lines 1228-1232), so a `rows` change also scrolls to 0 as the plan and TSDoc state. Alternatively, keep the scroll position and request `range` instead of `rangeAt(0)` when only `pageSize` changed, and correct the TSDoc. Add a unit test in the "lazy virtual scroll" describe that scrolls to row 50,000, changes `rows` and asserts either `scrollTop === 0` with `first: 0`, or a `lazyLoad` for the block that holds row 50,000 at the new size.

### F-02 [minor] Keyboard scroll-into-view ignores a sticky `#footerGroup`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1112` · DAT-047
**Problem:** `focusVirtualRow` subtracts only `frozenBottomHeight()` from the bottom of the viewport. When `footerGroupTemplate()` is set, the `<tfoot>` (line 746) is also `sticky bottom-0` in virtual mode, so ArrowDown or End can leave the focused row under the footer. DAT-047.S1 requires that the body "scrolls so the next row is in view".
**Fix:** Measure the `<tfoot>` with `observeSectionHeight` the same way as the frozen bottom body, and add its height to `coveredBottom`. Because both are `bottom-0` they overlap, so use the maximum of the two heights, not their sum.

### F-03 [minor] End or Home onto an unloaded lazy row drops focus to the document

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1125-1132`, `:713` · DAT-047, DAT-048
**Problem:** Placeholder rows have no `tabindex`, as DAT-048 requires, so `find()` returns `null` both synchronously and in `afterNextRender`. With End from row 0 in a lazy table, the scroll moves the window away and destroys the row that held focus. Focus then falls to `<body>`, and keyboard users lose their place.
**Fix:** When the target row is a placeholder, either keep focus on the closest loaded row, or remember the pending index and focus the target when its data arrives, for example in an effect on `virtualEntries()` that runs while a pending index is set. Cover it with a unit test.

### F-04 [minor] The lazy `aria-rowcount` test cannot tell `totalRecords` from `value.length`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:4634-4641` · DAT-047.S3
**Problem:** The test sets `totalRecords` to 5000 and `value` to 5000 rows. An implementation that counts `value.length` would also pass, so the "or `totalRecords` in lazy mode" clause of DAT-047 is not really exercised.
**Fix:** Make `value` shorter than `totalRecords` (for example 50 rows with `totalRecords` 5000) and keep the assertion `aria-rowcount === '5001'`.

### F-05 [minor] T007's red evidence is an environment build failure, not a failing assertion

**Where:** `docs/changes/add-data-table-virtual-scroll/tasks.md` T007 evidence line · T007
**Problem:** The recorded red is a WebServer build error in `projects/showcase/src/app/app.ts:138` (an import from a stale `@medra.dev/ui` build). It is not a Playwright assertion that fails for lack of the feature, so the red does not show that the new e2e tests detect the missing behaviour. The tests would very likely have failed anyway, because the demo sections did not exist.
**Fix:** No code change is needed. For future `[TEST]` checkpoints on e2e, run `npm run build:ui` before the red run, as T008's verify command already does, so the red comes from the assertions.

### F-06 [minor] The guards that ignore `rowGroupMode` and `#rowexpansion` in virtual mode have no test

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1369`, `:1424` · T002, plan Risks
**Problem:** The plan says "the tasks add a guard so they do not render half-working", and T002 lists the guard for `rowGroupMode`, `#rowexpansion` and `reorderable`. Only `reorderable` has a unit test (added under T009 after the guard was found missing in T008). `effectiveRowGroupMode` and the `expansionRowsRender` short-circuit are untested, so a regression would go unnoticed.
**Fix:** Add two cases to "DataTableComponent virtual scroll". One sets `rowGroupMode="subheader"` with `groupRowsBy` and asserts no group header rows. The other provides `#rowexpansion` with an expanded key and asserts no expansion row.

### F-07 [minor] An unrelated commit sits inside this change's diff range

**Where:** commit `5af81e4` ("chore(medra): remove vendored medra plugin from .agents"), between `diff_base` `0437159` and `HEAD` · scope
**Problem:** The deletion of `.agents/plugins/medra/**` is not in the proposal's scope. It appears in the verify diff and will ship in this change's pull request.
**Fix:** Move the commit to its own branch or pull request against `main`. If it stays, name it in the pull request description as an unrelated maintenance change.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-046` | Unit: `data-table.component.spec.ts:4486` (S1), `:4496` (S3), `:4511` (S4), `:4528` (S5), `:4538` (S7), `:4546` (S8), plus the reorderable guard test. E2E: `e2e/site/data-table-virtual-scroll.spec.ts:37` (S1), `:51` (S2), `:71` (S6), `:90` (S7). Implementation: `virtualRange`/`virtualEntries`/`pinnedEditIndex`, `viewportMaxHeight`, paginator suppression, scroll reset effect. T001 red / T002 green. | met |
| `DAT-047` | Unit: `data-table.component.spec.ts:4615`, `:4626`, `:4634` (S3; see F-04). E2E: `data-table-virtual-scroll.spec.ts:97` (S1), `:113` (S2). Implementation: `ariaRowCount`, `bodyRowPosition`, `frozenRowPosition`, `focusVirtualRow`, virtual branch of `moveRowFocus`. T003 red / T004 green. Edge cases in F-02 and F-03. | met |
| `DAT-048` | Unit: `data-table.component.spec.ts:4726` (S1), `:4734` (S2), `:4748` (S3), `:4771` (S4), `:4787` (S5). E2E: `data-table-virtual-scroll.spec.ts:134` (S2). Implementation: `requestVisibleBlocks`, block request effect, placeholder rows, `loadedRows`. T005 red / T006 green. Every scenario passes; the `rows`-change path is defective (F-01). | met |
| `DAT-007` | Existing unit tests `data-table.component.spec.ts:848` (S1) and `:3415` (S2) still pass (suite green). The page-based lazy effect skips when `virtualScroll()` is on (component line 1272). | met |
| `DAT-024` | E2E `data-table-virtual-scroll.spec.ts:152` (S14); existing `data-table-docs.spec.ts`, `data-table-frozen.spec.ts`, `data-table-column-reorder.spec.ts`, `data-table-column-filters.spec.ts`, `data-table-slots-skeleton.spec.ts` and `data-table-cell-context.spec.ts` cover S1–S13. Playwright `e2e/site/data-table-*.spec.ts` passed 58/58 (T008). New `EXAMPLES` entries at `data-table.page.ts:236-237`. | met |
