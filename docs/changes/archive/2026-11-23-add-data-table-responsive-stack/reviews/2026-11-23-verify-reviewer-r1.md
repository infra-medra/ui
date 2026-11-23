# Review: add-data-table-responsive-stack — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 3 · minor 4
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

The implementation follows the approved design closely: `responsiveLayout`, `breakpoint` and `stackLabel` exist, `stacked()` gates every grid feature, the header row is clipped rather than removed, and all 35 scenarios have tagged tests (`medra coverage`: 35/35). No test was weakened, and the locked test hashes match. The verdict is `fail` because the T001 `red` checkpoint never ran the tests: the recorded command failed on a Jest usage error, so the TDD evidence for the whole unit suite is missing. There are also gaps: utility cells and the utility header cells have no explicit roles while stacked, and several e2e tests tagged with a scenario ID do not assert the Then clauses they claim to cover.

## Findings

### F-01 [critical] T001 red evidence is a Jest CLI usage error, not a failing test run

**Where:** `docs/changes/add-data-table-responsive-stack/tasks.md:8` · T001 (DAT-050, DAT-051, DAT-052)
**Problem:** The red line records `npx jest … -t 'responsive stack' --kind red` exit 1 with output `"Unrecognized option 'kind'. | CLI Options Documentation: …"`. The `--kind red` flag ended up inside the test command, so Jest refused to start and no test ran. With `testing.mode: tdd`, this means there is no evidence that the 19 unit tests failed before T002–T007 implemented them. It is likely, though unproven, that they would have failed, because the hosts bind inputs that did not exist at `24aa29c`.
**Fix:** Re-establish red evidence for T001. Run the locked spec file against the `diff_base` implementation, for example in a `git worktree` at `24aa29c` with the current `data-table.component.spec.ts` copied in. Record the failing run through the medra CLI, without `--kind` inside the command string, or get the human to explicitly accept the gap at the verify gate.

### F-02 [major] Utility header and body cells have no explicit roles while stacked

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:474-527` (selection, radio, reorder and row-actions `<td>`), `:594`, `:615`, `:707` (utility `<th>`, including the row-actions header carrying `rowActionsHeaderLabel()`), `:428` (subheader `<td>`), and the expansion and empty `<td>` · DAT-051
**Problem:** DAT-051 requires that "the table, its row groups, rows, header cells and data cells SHALL carry explicit `table`, `rowgroup`, `row`, `columnheader` and `cell` roles, so display overrides do not drop them". Only the data `<th>`/`<td>` produced by `@for (col of visibleColumns())` get `[attr.role]`. The selection checkbox or radio cell, the row-actions cell and its "Actions" header, the reorder cells, and the colspan cells (subheader, expansion, empty) keep implicit semantics inside a `display: block` table that has `role="table"`. Those implicit semantics are exactly what D-03 says may be dropped, so a `role="row"` can own children with no cell role and the actions column header may not be announced. DAT-051.S1 does not catch this because its host has no selection or edit column.
**Fix:** Bind `[attr.role]="stacked() ? 'columnheader' : null"` on every utility `<th>`, and `[attr.role]="stacked() ? 'cell' : null"` on every utility and colspan `<td>`, including the skeleton rows. Extend the DAT-051.S1 test, or add a case, with `selectionMode="multiple"` and `editMode="row"` that asserts every `th` in the header row is a `columnheader` and every body `td` is a `cell`.

### F-03 [major] E2E tests tagged with a scenario ID do not assert that scenario's Then clauses (Article XI)

**Where:** `e2e/site/data-table-responsive-stack.spec.ts:161-170` (DAT-052.S8), `:142-147` (DAT-052.S3), `:149-159` (DAT-052.S6), `:130-140` (DAT-052.S2) · DAT-052
**Problem:** Article XI requires every test tagged with a scenario ID to assert each Given and Then clause of that scenario.
- The DAT-052.S8 test is titled "restores the sticky header and the resize handle", but after widening it asserts only `display: table`, `table-header-group` and a visible `th`. It never checks that the frozen column is sticky again, that clicking the header sorts, or that a resize handle shows.
- The DAT-052.S3 test has no column with `visible` false, because the demo has none, so "the hidden column renders no cell" is not asserted.
- The DAT-052.S6 test has no `#headerGroup` in the demo. Its loop over `thead tr.sr-only` measures only the main header row, and it never asserts the 300px scroll limit.
- The DAT-052.S2 test has no frozen rows in the demo, and it counts cells instead of asserting their labels.
The unit tests cover most of these clauses, but the real-browser tests that Article V assigns to these layout scenarios do not.
**Fix:** In the DAT-052.S8 e2e test, after widening, assert that the frozen name cell has `position: sticky`, that `[data-col-resize-handle="true"]` has count > 0, and that clicking the Name header changes `aria-sort`. For S2, S3 and S6, either use a fixture page or demo that has frozen rows, a `visible=false` column and a `#headerGroup` row, and assert those clauses (plus `maxHeight`/`scrollHeight` ≤ 300px for S6), or drop the scenario tag from tests that cannot cover the scenario and keep the tag only where every clause is asserted.

### F-04 [major] "Full-width block" clauses of DAT-052.S4 and S5 are not verified, and the frozen-row clause of DAT-052.S2 is vacuous in Jest

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:5706-5770`, `:5677-5690`; `data-table.component.ts:428` · DAT-052.S2, DAT-052.S4, DAT-052.S5
**Problem:**
- DAT-052.S4 ("the expansion content renders as a full-width block under the row") and DAT-052.S5 ("the subheader row is a full-width block") are asserted only through `colSpan`, which has the same value when the table is unstacked, so the tests would pass without any stacked styling. Neither scenario has a real-browser check, although both are layout-dependent (Article V).
- The plan's Design says the colspan cells (subheader, expansion, empty, spacer) "become `block` full-width through the same maps". The subheader `<td>` still uses `groupCellClass()` unchanged (`:428`), and only its `<tr>` gets `block`.
- In DAT-052.S2, the host leaves `scrollable` false, and frozen `<tbody>` elements are sticky only when `scrollActive()`. The `.sticky` count of 0 for frozen rows therefore holds whether or not stacking disables them.
**Fix:** Add `stacked() ? 'block' : ''` to `groupCellClass()`, as the plan states. In the unit tests, assert the `block` class on the subheader and expansion `<tr>`/`<td>` while stacked, and its absence when unstacked. Add an e2e check that the expansion and subheader rows' widths equal the table width at 400px. Set `scrollable = true` in the DAT-052.S2 unit host, so that the frozen-row assertion can fail.

### F-05 [minor] An empty `stackLabel` falls through to `header`, which diverges from the plan's `stackLabel() ?? header()`

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:2833` · DAT-050
**Problem:** `stackLabelFor` returns `col.stackLabel() || col.header() || null`. The plan's Design specifies `stackLabel() ?? header()`, with an empty result rendering no label. With `||`, a consumer cannot suppress the label of a column that has a header by setting `stackLabel=""`, while the TSDoc says "Unset, the column's `header` is used", which implies that a set empty value would win.
**Fix:** Use `col.stackLabel() ?? col.header()` and return `null` for an empty string. Alternatively, keep `||` and update the plan and the TSDoc to say that an empty `stackLabel` counts as unset.

### F-06 [minor] The first client render can be stacked, contrary to the plan's Design

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1070-1085`; `docs/changes/add-data-table-responsive-stack/plan.md:84` · DAT-050
**Problem:** The plan says `matches` is a `signal(false)` set from an effect, "so server rendering and the first client render are unstacked". The implementation evaluates `window.matchMedia(...).matches` synchronously inside the `breakpointQuery`/`stacked` computeds. On a narrow viewport, the first client render under `provideClientHydration` (the site uses it) therefore differs from the server markup: label `@if` blocks, roles and classes appear during hydration. The e2e suite passes, but this is an unrecorded deviation from the approved design.
**Fix:** Either follow the plan (start unstacked and set `matches` after the first render), or update `plan.md`'s Design to record the synchronous evaluation and why hydration tolerates it.

### F-07 [minor] T002 green evidence omits DAT-050.S4

**Where:** `docs/changes/add-data-table-responsive-stack/tasks.md:10` · T002
**Problem:** T002's verify clause names DAT-050.S1, S3, S4 and S6, but the recorded command runs `-t 'DAT-050.S(1|3|6):'`, so S4 was not shown green at T002. The full-suite run at T013 covers it later.
**Fix:** No code change is needed. Note in the verify gate that S4 is covered by T013, or record a green run that includes `S4`.

### F-08 [minor] DAT-052.S7 "edit template under the label" is asserted only as DOM order

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts:5773-5792`; label markup `data-table.component.ts:395` · DAT-052.S7
**Problem:** The label is an `inline-block w-28` span, and the edit template follows it inline, so the input renders beside the label, not under it, whenever it fits on the line. The test checks only `DOCUMENT_POSITION_FOLLOWING`. Either the scenario wording ("under") or the rendering is off.
**Fix:** If "under" only means "after, within the same cell", reword DAT-052.S7 at archive to "after the label". Otherwise, render the edit template on its own line while stacked and assert the vertical position in e2e.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-050` | Unit `data-table.component.spec.ts` DAT-050.S1–S6 (lines ~5504–5590); e2e `data-table-responsive-stack.spec.ts` S1–S4 (display, labels, no reload); T002, T003, T011 green. The TDD red is missing (F-01) | met |
| `DAT-051` | Unit DAT-051.S1–S5; e2e S2 (header box ≤ 1px) and S5 (light/dark computed colours differ); T004 green. Utility and colspan cells lack explicit roles (F-02) | partial |
| `DAT-052` | Unit DAT-052.S1–S8; e2e S2, S3, S6, S8; T005–T007 green. Several e2e Then clauses are not asserted (F-03), and the full-width block clauses are not verified (F-04) | partial |
| `DAT-024` | `data-table.page.ts` `example-responsive-stack` entry and section; demo, prose `.txt` and code block; e2e `data-table-docs.spec.ts` S1/S2 extended and `data-table-responsive-stack.spec.ts` DAT-024.S16; T008 red and T010 green | met |
