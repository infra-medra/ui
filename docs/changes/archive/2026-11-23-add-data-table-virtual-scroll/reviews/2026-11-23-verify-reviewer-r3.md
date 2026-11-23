# Review: add-data-table-virtual-scroll — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

Round 3 confirms that both round-2 findings are fixed in behaviour. F-08: `focusVirtualRow` now uses the larger of the two bottom sticky heights, and a new test covers it. F-09: the pending-focus effect moves focus only while the anchor row still holds it, and keeps the anchor pinned when the target is not rendered. Every requirement is met, the spec diff only adds or refactors tests without loosening any assertion, and the suite is reported green, so the verdict is pass-with-findings. Two small gaps remain in these fixes. The `observeSectionHeight` TSDoc correction that round 2 asked for as part of F-08 was not made (F-10). The second F-09 path (target not rendered, anchor kept pinned) has no test (F-11).

### Resolution of round-2 findings

| ID | Status | Evidence |
|---|---|---|
| F-08 | resolved (TSDoc leftover in F-10) | `data-table.component.ts:1117` computes `coveredBottom = Math.max(this.frozenBottomHeight(), this.footerHeight())`, with a comment at line 1116. The `footerHeight` TSDoc at line 1008 now says the footer overlaps the bottom frozen rows. New test `data-table.component.spec.ts:4920` mocks THEAD 40, TBODY 48 and TFOOT 32. It expects `HEADER + 1000*40 - 400 + FROZEN`, so the old sum (80) would fail it. The footer-only test at `:4911` keeps the assertion `HEADER + VIRTUAL_ROW_COUNT * 40 - 400 + FOOTER` through the new `withSectionHeights`/`endScrollTop` helpers, and nothing was loosened. The test host's new `[frozenValue]="frozen"` input defaults to `null`, so the `rowGroupMode` and `#rowexpansion` guard tests (`:4851`, `:4861`) are unchanged. |
| F-09 | resolved (test gap in F-11) | Lines 1258-1276: the `afterNextRender` callback checks that `pendingFocusIndex` is still the same. It then finds the anchor row by `aria-rowindex`. If `activeElement` is not that row, it calls `clearPendingFocus()` and returns, so focus that moved to another row, a checkbox, an editor or the viewport stays where the user put it. When the target is not rendered, only `pendingFocusIndex` is cleared (line 1270), so the anchor stays pinned and keeps focus. New test `:5001` moves focus to the scroll viewport after End and before `deliver`, then asserts focus stays there. |

### Regression review of the round-3 edits

- **`Math.max` for the covered bottom (line 1117):** With no footer, `footerHeight()` is `0` because `observeSectionHeight` sets `0` while the section is absent. The result then equals the HEAD behaviour (frozen-bottom height only). With no frozen-bottom rows it equals the round-2 footer-only behaviour. No regression.
- **Anchor guard (lines 1261-1266):** The anchor is looked up with `tbody tr[aria-rowindex=…]`, without `[tabindex]`. Frozen rows use `frozenRowPosition`, which lies outside the body range in both frozen positions (line 1103), so they cannot match it by mistake. When focus is no longer on the anchor, unpinning it is safe because nothing focused is removed. One theoretical path: focus sits on a descendant of the anchor row while the row is outside the window. That path is not reachable by mouse or Tab, because Tab focus scrolls the descendant into view, which brings the anchor back into the window. Not reported.
- **Anchor kept pinned after an abandoned target (line 1270):** The anchor stays pinned until the next key move (`focusVirtualRow` calls `clearPendingFocus()` first, line 1112) or until a sort, filter or `rows` reset (line 1299). This holds even if focus later leaves the anchor. The cost is one extra rendered row, and the code comment documents it. `virtualEntries` (lines 1060-1062) filters out indices `>= total`, so a pinned index that has gone stale after the data shrinks renders nothing. No regression.
- **Repeated data deliveries:** Each change of `pagedValue()[pending]` queues an `afterNextRender`. After the first one runs, `pendingFocusIndex` is `null`, so the later ones return at line 1259. No double focus.

## Findings

### F-10 [minor] `observeSectionHeight` TSDoc still says it observes a `<tbody>`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1201` · DAT-047 (round-2 F-08)
**Problem:** The TSDoc reads "the rendered height of a conditional `<tbody>`". Since round 2, line 1241 also uses the helper for the `#footerGroupFoot` `<tfoot>`. The round-2 F-08 fix asked for this wording change ("Then update the `observeSectionHeight` TSDoc … to say 'section' instead of '`<tbody>`'"), and it was not made.
**Fix:** Change the TSDoc to "the rendered height of a conditional table section (`<tbody>` or `<tfoot>`)".

### F-11 [minor] The "target not rendered, anchor stays pinned" path of the F-09 fix has no test

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1268-1272`; `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:4975-5027` · DAT-048 (round-2 F-09, second path)
**Problem:** Round-2 F-09 named two paths. The new test at spec `:5001` covers only the first (focus moved elsewhere). The second path is the one where focus dropped to `<body>`: the user scrolls the viewport away before the block arrives, the target is outside the window, and the anchor must stay pinned and focused. No test exercises it. A regression to the round-2 code (calling `clearPendingFocus()` in that branch) would pass the current unit spec.
**Fix:** Add a unit test to the "lazy virtual scroll edges" block. Focus row 0 and press End. Then scroll to a middle index with `scrollToRow`, so that neither row 0 nor the End target is in the window. Deliver the last block and run `detectChanges` twice. Assert that `rowAt(fixture, 0)` is still rendered and that `document.activeElement` is still that row.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-046` | Carried from r1/r2: unit tests for S1, S3, S4, S5, S7 and S8, the reorderable, `rowGroupMode` and `#rowexpansion` guards (`data-table.component.spec.ts:4851`, `:4861`), and E2E `data-table-virtual-scroll.spec.ts` S1, S2, S6 and S7. The round-3 host change (`[frozenValue]="frozen"`, defaulting to `null`) leaves the guard tests unchanged. Suite reported green (unit 234/234, Playwright `data-table-*.spec.ts` 58/58, `medra suite` green). | met |
| `DAT-047` | Carried from r1/r2: unit tests for S1 and S3 (`:4933` lazy `aria-rowcount`), E2E S1 and S2. New in r3: the overlap test for frozen-bottom rows plus footer (`:4920`) closes F-08, and the footer-only test (`:4911`) is preserved through the new helpers. F-10 is a TSDoc leftover only. | met |
| `DAT-048` | Carried from r1/r2: unit tests for S1–S5, the `rows`-change reset (`:4960`), the unloaded-target focus test (`:4975`), and E2E S2. New in r3: the abandoned-move test (`:5001`) closes the first F-09 path. The second path is implemented (line 1270) but untested (F-11). | met |
| `DAT-007` | Carried from r1: unit tests at spec `:848` and `:3415`. The page-based lazy effect still skips when `virtualScroll()` is on. Not touched in r3. Suite reported green. | met |
| `DAT-024` | Carried from r1: E2E `data-table-virtual-scroll.spec.ts:152` (S14) and the existing `data-table-*.spec.ts` (S1–S13). Playwright reported 58/58 in this round. | met |
