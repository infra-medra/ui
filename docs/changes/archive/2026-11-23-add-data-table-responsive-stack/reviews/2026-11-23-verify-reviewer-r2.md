# Review: add-data-table-responsive-stack — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 2 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

Round 2 resolves the implementation findings from r1. Utility, colspan and skeleton cells now get explicit roles while stacked. Subheader and expansion rows and cells are full-width blocks, and this is checked both in Jest and in a real browser. An empty `stackLabel` follows the plan's `??`. The first client render is unstacked, as the plan requires. The stacked edit label takes its own line. The locked test files are unchanged (their hashes match `test_hashes`). Every requirement is `met`, the Jest suite is green, and in this round I ran the two responsive-stack Playwright specs (17 passed) and the docs spec (14 passed).

The main remaining finding is F-01, the TDD record. I reproduced T001's red independently: it fails on behaviour at `diff_base`. But `tasks.md` still records the Jest usage error. I downgrade this from critical to major and flag it for explicit human acceptance at the verify gate.

### Status of r1 findings

| r1 | Status in r2 |
|---|---|
| F-01 [critical] T001 red is a Jest usage error | Red reproduced independently, but not recorded. Downgraded to major, see F-01 below |
| F-02 [major] utility cells have no roles | Fixed. `data-table.component.ts:414-559`, `:592-707` and `:723-756` bind `role` while stacked. `data-table-responsive-stack.spec.ts:188-265` covers multiple and radio selection, row actions, subheader, expansion, empty and skeleton rows, and the unstacked case |
| F-03 [major] e2e tags do not assert Then clauses | Partly fixed. `data-table-responsive-stack-features.spec.ts` asserts every clause of DAT-052.S2, S3, S6 and S8. The locked tests keep their over-claiming tags, see F-02 below |
| F-04 [major] full-width block not verified, vacuous frozen-row check | Fixed. `groupCellClass()` and `expansionCellClass()` add `block` (`:1950-1957`). Unit tests at `data-table-responsive-stack.spec.ts:269-356` cover it, with `scrollable` on so the frozen-row check can fail. Real-browser width checks are at `features.spec.ts:145-170` |
| F-05 [minor] empty `stackLabel` | Fixed. `(col.stackLabel() ?? col.header()) \|\| null` (`:2839-2841`), tested at `:387-396` |
| F-06 [minor] first render can be stacked | Fixed. `stacked` is gated on `browserReady`, which is set in `afterNextRender` (`:1077-1087`, `:1401-1402`). Tested in Jest (`:398-410`) and in e2e without hydration errors (`features.spec.ts:196-209`) |
| F-07 [minor] T002 green omits S4 | Not changed (record only). Folded into F-01 below |
| F-08 [minor] edit template "under" the label | Fixed in code: `stackLabelClass(true)` returns `block pb-1` (`:2846-2848`). Only class-level evidence, see F-04 below |

## Findings

### F-01 [major] T001's red is reproduced but not recorded; the `tasks.md` evidence still shows a Jest usage error

**Where:** `docs/changes/add-data-table-responsive-stack/tasks.md:8` (T001), `:10` (T002) · DAT-050, DAT-051, DAT-052

**Problem:** `testing.mode` is `tdd`, so T001 needs a recorded red line. The line in `tasks.md` is still the run that failed with `Unrecognized option 'kind'`, so no test ran in it.

In this round I reran the check independently:
- **Setup:** a temporary `git worktree` at `diff_base` `24aa29c`, with the locked `data-table.component.spec.ts` copied in (hash `c751ed6d…`, equal to `test_hashes.T001`).
- **Command:** `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'responsive stack'`
- **Result:** exit 1, with 15 failed and 4 passed.
- **The 15 failures are behavioural assertion failures.** Examples: `Expected length: 0` / `Received length: 1` on resize handles, a sticky `thead` class string, and `rowspan` cells still merged. The NG0303 unknown-property messages are logged, not thrown.
- **The 4 that passed are the preservation scenarios** DAT-050.S1, DAT-050.S3, DAT-050.S6 and DAT-051.S4. They assert "nothing changes" (unstacked, no labels, no roles), so they pass on pre-change code by design.

The locked hash shows that the tests did not change after the T001 checkpoint. The red was observed after the implementation, though, not before it. Its test-first intent is now shown, but its audit record is wrong.

In the same record, T002's green line runs `-t 'DAT-050.S(1|3|6):'` and omits S4. This is carried from r1 F-07. S4 is green in the suite (`suite.exit: 0`).

**Judgment on gate acceptance:** flagging this for human acceptance at the gate is acceptable. An independent run against `diff_base` shows the tests can fail on the missing behaviour, so the critical condition ("missing red") no longer holds. What remains is the traceability of the evidence, which the human can accept or have corrected.

**Fix:** Do one of the following:
- Record the reproduced red for T001 in the medra state, with the command, exit 1 and a failure excerpt from the `diff_base` worktree run, plus a green line for T002 that includes `S4`.
- Have the human accept the gap explicitly in a verify gate note that cites this reproduction (15 failed / 4 passed at `24aa29c`, with the 4 passing tests being preservation scenarios).

### F-02 [major] The locked e2e tests still carry scenario tags whose Then clauses they do not assert (Article XI)

**Where:** `e2e/site/data-table-responsive-stack.spec.ts:130-170` (DAT-052.S2, S3, S6, S8) · DAT-052

**Problem:** The file is locked by T008 and is unchanged, so its tests are tagged as before:
- **DAT-052.S2** checks only the sticky count and that there is more than one cell. It does not check order or labels.
- **DAT-052.S3** does not check the `visible` false column.
- **DAT-052.S6** does not check the 300px limit or that no label comes from the header group.
- **DAT-052.S8** does not check stickiness, sorting or the resize handle after widening.

The new `e2e/site/data-table-responsive-stack-features.spec.ts:55-193` does assert every clause of these four scenarios against the demo's second table, and all 6 of its tests pass. So the scenarios are verified in a real browser. However, Article XI's gate asks whether every test tagged with a scenario ID asserts each clause, and for these four locked tests the answer is still no.

**Fix:** Do one of the following:
- With the user's authorization (`medra task done … --allow-test-edit --reason`), drop the scenario prefix from the four locked tests, or rename them as partial checks so the tag stays only on the complete tests in `features.spec.ts`.
- Have the human accept the duplicate partial tags at the verify gate, given that the complete tests exist.

### F-03 [minor] Consumer `#headerGroup` rows get no explicit `row`/`columnheader` roles while stacked

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1351-1369` (`syncHeaderGroupVisibility`) · DAT-051

**Problem:** While stacked, `<thead>` has `role="rowgroup"` and `display: block`. The component adds `sr-only` to the consumer's `#headerGroup` `<tr>` but no `role="row"`, and its `<th>` cells get no `role="columnheader"`. Those rows stay in the accessibility tree by design (DAT-052), but they rely on implicit semantics inside overridden display. DAT-051 says explicit roles exist precisely to guard against losing those semantics.

I treat DAT-051's explicit-role clause as governing the markup the component renders, not markup the consumer supplies. That is why DAT-051 is `met`. Still, the component already edits these rows, so the gap is cheap to close. `expectStackRoles` (`data-table-responsive-stack.spec.ts:167-179`) never sees a header-group row, because its host has none.

**Fix:** In `syncHeaderGroupVisibility`, while stacked, set `role="row"` on each header-group row and `role="columnheader"` on its `th` cells, mark them with the same `data-med-stack-hidden` flag, and remove them when unstacking. Add a unit case with a `#headerGroup` that asserts both roles while stacked and their absence when unstacked.

### F-04 [minor] DAT-052.S7 "under the label" is checked only through a CSS class

**Where:** `projects/medra/ui/src/lib/data-table/data-table-responsive-stack.spec.ts:358-383`; `data-table.component.ts:2846-2848` · DAT-052.S7

**Problem:** The fix makes the editing label `block pb-1`, which does put the editor on the next line. The test, however, asserts only the class names and DOM order in jsdom. "Under" is a layout clause (Article V asks for real-browser verification of layout scenarios), and no Playwright test opens a row editor in a stacked table. The approved tasks did not assign DAT-052.S7 to e2e, so this is a minor gap, not a deviation from the plan.

**Fix:** Add a Playwright check at 400px on a stacked table with `editMode="row"`: activate Edit and assert that the editor's `boundingBox().y` is at or below the label's bottom edge. Alternatively, accept the class-level evidence and reword DAT-052.S7 at archive to "on its own line after the label".

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-050` | Unit DAT-050.S1–S6 in the locked spec, plus the empty `stackLabel` and first-render cases (`data-table-responsive-stack.spec.ts:387-410`). e2e S1–S4 and the hydration check (`features.spec.ts:196`), 17/17 passed this round. Red reproduced at `24aa29c`, but the record is wrong (F-01) | met |
| `DAT-051` | Unit DAT-051.S1–S5, plus the role cases for utility, colspan and skeleton cells (`:188-265`). e2e S2 and S5 passed. Consumer header-group rows lack explicit roles (F-03, minor) | met |
| `DAT-052` | Unit DAT-052.S1–S8, plus S2, S4, S5 and S7 hardening (`:269-383`). e2e `features.spec.ts` asserts all clauses of S2, S3, S6 and S8 and the full-width blocks, 6/6 passed. Partial tags remain on the locked duplicates (F-02) | met |
| `DAT-024` | `data-table.page.ts:242`, `:726-730` (prose, demo, raw-template code block). e2e `data-table-docs.spec.ts` 14/14 passed and DAT-024.S16 passed this round, with the updated two-table demo | met |
