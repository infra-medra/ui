# Review: add-data-table-virtual-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

Round 2 confirms that all seven round-1 findings are resolved. F-01 (major) is fixed: the scroll-reset effect now tracks `pageSize()` in lazy mode (component line 1280), and the new unit test at spec line 4932 covers it. F-07 no longer applies because the diff base is now `5af81e4`. The spec diff only adds tests, every requirement is met and the suite is reported green, so the verdict is pass-with-findings. Two new minor findings remain, both in the round-2 fixes. The F-02 fix adds the footer height to the frozen-bottom height, but the two sticky sections overlap, so the sum counts the overlap twice (F-08). The pending-focus effect can take focus from another element inside the table, and it can drop focus to the page when the target is not rendered (F-09).

### Resolution of round-1 findings

| ID | Status | Evidence |
|---|---|---|
| F-01 | resolved | `data-table.component.ts:1278-1281` reads `pageSize()` when `lazy()` is set. The effect then sets `scrollTop = 0`, and the block effect requests `rangeAt(0)` under the new key. Test at `data-table.component.spec.ts:4932`. The class TSDoc (lines 335-338) now matches the behaviour. |
| F-02 | resolved (see F-08) | `footerGroupFoot` is measured (line 1240) and added to `coveredBottom` (line 1116). Test at spec line 4867. The fix used a sum, not the maximum that round 1 recommended. |
| F-03 | resolved (see F-09) | When the target is unloaded, `focusVirtualRow` pins the origin row (`focusAnchorIndex`) and records `pendingFocusIndex` (lines 1136-1142). The effect at lines 1242-1268 moves focus once the data arrives. Pending focus is cleared on the next move (line 1112) and on a sort, filter or `rows` reset (line 1288). Test at spec line 4947. |
| F-04 | resolved | Spec line 4905 uses 100 rows with `totalRecords` 5000 and asserts `aria-rowcount` `5001`. |
| F-05 | resolved | A note under the T007 evidence in `tasks.md` records that the red was a build failure and gives the assertion-level result. |
| F-06 | resolved | Spec lines 4848 and 4858. The group header `<tr>` (component line 410) has no `aria-rowindex`, so the "unpositioned rows" assertion catches a missing guard. The expansion test asserts that `.virtual-expansion` is absent. |
| F-07 | resolved | The commit is now outside the diff range (`5af81e4..HEAD` plus the working tree). It still needs a mention in the pull request description. |

### Regression review of the new code

- **Generalized pinning in `virtualEntries` (lines 1050-1082):** The new code removes duplicates (`Set`), skips indices inside `[start, end)` and out of `[0, total)`, and sorts the rest. A single `cursor` emits the spacers, so the total height stays `total * size` whether zero, one or two rows are pinned, on either side of the window. For the row being edited alone, the output matches the HEAD version. No regression found.
- **`observeSectionHeight` (lines 1201-1213):** This effect-based helper reruns when the `viewChild` appears or disappears. It disconnects the previous observer in `onCleanup`, and sets `0` on the server or when the section is absent. Using it for a `<tfoot>` is correct because the type is `HTMLTableSectionElement`. Its TSDoc still says "conditional `<tbody>`", a small inaccuracy that the F-08 fix can correct at the same time.
- **Pending-focus effect (lines 1242-1268):** Correct in the main path. Two edge paths are reported in F-09.

## Findings

### F-08 [minor] `coveredBottom` adds two sticky heights that overlap

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1116`, `:1008` (TSDoc), `:740`, `:747` · DAT-047 (round-1 F-02)
**Problem:** The frozen-bottom `<tbody>` and the `#footerGroup` `<tfoot>` both use `sticky bottom-0`, so they stick at the same edge and overlap. They do not stack. I checked this in Chromium with Playwright on a 200px viewport: the 30px sticky `tbody` spans 178–208, the 20px sticky `tfoot` spans 188–208, and the viewport bottom is 208. The covered band is therefore `max(30, 20) = 30`, but `frozenBottomHeight() + footerHeight()` gives 50. When a table has both bottom frozen rows and a footer group, ArrowDown and End scroll the focused row up by an extra `min(h1, h2)`, which leaves a visible gap above the sticky band. The row is still in view, so DAT-047.S1 holds. The TSDoc at line 1008 says the footer sits "below the bottom frozen rows", which is not what renders. The new test at spec line 4867 has no bottom frozen rows, so it cannot detect the overlap.
**Fix:** Choose one of two options:
- Use `Math.max(this.frozenBottomHeight(), this.footerHeight())` and correct the TSDoc at line 1008.
- Offset the frozen bottom body by the footer height (`[style.bottom.px]="footerHeight()"` when `scrollActive()`) so the two sections stack and the sum becomes correct. This also stops the footer from hiding the frozen bottom rows, which happens today.

Then update the `observeSectionHeight` TSDoc (line 1200) to say "section" instead of "`<tbody>`".

### F-09 [minor] The pending-focus effect can take focus from another element in the table, or drop it to the page

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1259-1263` · DAT-047, DAT-048 (round-1 F-03)
**Problem:** The guard moves focus whenever `activeElement` is `<body>` or anywhere inside the host. Two paths go wrong.
- **Focus is taken from another element in the table.** Suppose the user presses End onto an unloaded row, then clicks another row, a selection checkbox or a cell editor inside the table before the block arrives. Focus is still "inside the table", so when the data arrives it jumps to the End target, scrolled out of view because of `preventScroll`, and leaves the element the user chose. A click does not clear the pending focus; only a key move or a sort, filter or `rows` reset does.
- **Focus falls to the page.** Suppose the user scrolls the viewport with the wheel before the data arrives, so the target row is outside the window. The `querySelector` at line 1261 then returns `null`, but `clearPendingFocus()` still runs at line 1263. That unpins the anchor row, which still holds focus, and focus falls to `<body>`. This is the same symptom round-1 F-03 fixed, on a narrower path.

**Fix:** Move focus only while `activeElement` is still the anchor row, that is the row whose `aria-rowindex` is `bodyRowPosition(focusAnchorIndex())`. Clear the pending focus whenever focus is anywhere else. When the target row is not rendered, keep the anchor pinned (do not call `clearPendingFocus`) until the next key move or reset. Add a unit test that focuses another row after End and before `deliver`, and asserts that focus stays on that row.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-046` | Carried from r1: unit tests for S1, S3, S4, S5, S7 and S8 plus the reorderable guard, and E2E `data-table-virtual-scroll.spec.ts` S1, S2, S6 and S7. New in r2: the `rowGroupMode` and `#rowexpansion` guard tests (`data-table.component.spec.ts:4848`, `:4858`). The generalized `virtualEntries` was re-inspected with no regression. Suite reported green (unit 232/232, Playwright 58/58). | met |
| `DAT-047` | Carried from r1: unit tests at spec `:4615`, `:4626` and `:4634`, and E2E S1 and S2. New in r2: the footer scroll-into-view test (`:4867`), the lazy `aria-rowcount` test with `value.length` different from `totalRecords` (`:4905`), and the unloaded-target focus test (`:4947`). The remaining edge cases are F-08 and F-09 (minor). | met |
| `DAT-048` | Carried from r1: unit tests for S1–S5 and E2E S2. New in r2: the `rows`-change reset test (`:4932`) closes F-01. Placeholders still have no `tabindex`, and focus waits on the anchor row (`:4947`). | met |
| `DAT-007` | Carried from r1: unit tests at spec `:848` and `:3415`. The page-based lazy effect still skips when `virtualScroll()` is on. Suite reported green. | met |
| `DAT-024` | Carried from r1: E2E `data-table-virtual-scroll.spec.ts:152` (S14) and the existing `data-table-*.spec.ts` (S1–S13). Playwright reported 58/58 in this round. | met |
