# Review: add-data-table-responsive-stack — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 1 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

Round 3 fixes r2's F-02, F-03 and F-04 in the code and tests, and I confirmed each fix against the files on disk. All requirements are `met`. `medra coverage` reports 35 of 35 scenarios covered. The responsive-stack Jest cases pass (31 passed). The responsive-stack, features, docs and row-editing Playwright specs pass, 34 of 34, in this round. These include DAT-024.S16 and the new DAT-052.S7 test.

The one open major finding is r2's F-01, now F-01 here. `tasks.md` still holds T001's Jest usage error as its red line. The CLI cannot correct that record, so the remaining fix is a human acceptance in the verify gate approval note. That note has not been written yet.

### Status of r2 findings

| r2 | Status in r3 |
|---|---|
| F-01 [major] T001 red reproduced but not recorded | Still open, see F-01 below. The coordinator's reproduction matches r2's own run at `24aa29c`: 15 failed, 4 passed, and the 4 are the preservation scenarios. Confirmed: `medra task` has only `context`, `done`, `block` and `unblock`, so a done task cannot get a corrected evidence line |
| F-02 [major] locked e2e tests over-claim scenario tags | Fixed under the user's authorization. I decoded the T008 snapshot of `e2e/site/data-table-responsive-stack.spec.ts`. Its sha256 is `c9bb1e56…`, equal to `test_hashes.T008`. I diffed it against the current file: the only changes are the four test titles and their tag comments, at `:130-131`, `:142-143`, `:149-150` and `:161-162`. No assertion, locator or step changed. That is within the scope of the gate note of 2026-11-23T18:12:46Z, which says "user authorizes --allow-test-edit for this only". The lock is now stale, see F-02 below |
| F-03 [minor] no `row`/`columnheader` roles on consumer `#headerGroup` rows | Fixed. `syncHeaderGroupVisibility` and `addStackRole` (`data-table.component.ts:1354-1392`) add `role="row"` and `columnheader` or `cell` while stacked, marked with `data-med-stack-role`, and remove only those roles on unstack. The new test at `data-table-responsive-stack.spec.ts:440-481` covers a plain row and a row with roles set by the application, in both directions. Its assertions cannot pass on the code before the fix: `plain.getAttribute('role')` returned `null` there. One edge case remains, see F-03 below |
| F-04 [minor] DAT-052.S7 checked only through a CSS class | Fixed. The demo has a third table with `editMode="row"` (`data-table-responsive-stack.demo.html:52-67`). `features.spec.ts:197-232` asserts at 400px that the editor's top is at or below the label's bottom edge and that their `x` positions differ by 2px at most. It also checks that the actions cell shows Save and Cancel with no label. The test passed this round |

## Findings

### F-01 [major] T001's recorded red is still the Jest usage error; the accepted alternative (gate-note acceptance) is not yet on record

**Where:** `docs/changes/add-data-table-responsive-stack/tasks.md:8` (T001), `:10` (T002) · DAT-050, DAT-051, DAT-052

**Problem:** `tasks.md:8` still records `--kind red` passed to Jest: exit 1, "Unrecognized option 'kind'". No test ran in that line. The current gate note asks for the run to be recorded "in medra state", and the CLI cannot do that for a done task. That leaves r2's second option: the human accepts the gap explicitly in the verify gate note. Recording the reproduction there is acceptable. The reproduction meets the Article's intent: at `diff_base`, the locked tests (sha256 `c751ed6d…`, equal to `test_hashes.T001`, unchanged today) fail on behaviour in 15 cases. The 4 that pass are preservation scenarios. But the acceptance does not exist yet. Until it does, the audit trail for TDD is wrong. The T002 green line, which omits S4, is the same kind of record gap. S4 is green in the suite.

**Fix:** At the verify gate, have the human approve with a note that cites three things. First, the reproduction: command `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t 'responsive stack'`, worktree at `24aa29c` with the locked spec, exit 1, 15 failed and 4 passed, the 4 being DAT-050.S1, S3, S6 and DAT-051.S4. Second, an acceptance that `tasks.md:8` and `:10` are known-wrong evidence lines. Third, the F-02 rename, so one note covers both record gaps.

### F-02 [minor] The T008 lock no longer matches `e2e/site/data-table-responsive-stack.spec.ts`, and no CLI record ties the drift to the authorization

**Where:** `docs/changes/add-data-table-responsive-stack/.medra.yaml` `test_hashes.T008` (`c9bb1e56…`) against the file on disk (`901dfc18…`) · T008, DAT-052

**Problem:** The edit is rename-only and authorized, as shown above. But it was made without an `--allow-test-edit` checkpoint, because every task was already done. So the locked hash and the file now disagree, and the only link to the authorization is the free-text gate note. Anyone who later compares `test_hashes` with the tree will see a locked test file changed after red, with no reason recorded.

**Fix:** Cite the rename in the same verify gate approval note as F-01. Name the four tests, say the edit is title and comment only, and give the before and after hashes (`c9bb1e56…` → `901dfc18…`). No code change is needed.

### F-03 [minor] Header-group cells added to an already-hidden row while stacked get no role

**Where:** `projects/medra/ui/src/lib/data-table/data-table.component.ts:1364-1370` · DAT-051

**Problem:** Roles are assigned only when a row first gets `data-med-stack-hidden`. Later passes of `afterEveryRender` skip any row that already carries the flag. A consumer `#headerGroup` can render its cells conditionally, for example with `@for` over visible columns or `@if`. If it adds a `<th>` to an existing row while the table is stacked, that cell gets no `columnheader` role and is never marked. That is the semantics gap F-03 of r2 set out to close, in a narrower case. The new test does not cover it, because its header group is static.

**Fix:** In the `stacked` branch, drop the `!row.hasAttribute('data-med-stack-hidden')` guard for the cell loop. Call `addStackRole` for the row and its cells on every pass: it already skips any element that has a role. Add a unit case that toggles a header-group cell while the table is stacked and asserts its role.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-050` | Unit DAT-050.S1–S6 in the locked spec (hash unchanged), plus the empty `stackLabel` and first-render cases (`data-table-responsive-stack.spec.ts:413-438`). e2e S1–S4 and the hydration check (`features.spec.ts:235`) passed this round. The red record is wrong (F-01) | met |
| `DAT-051` | Unit DAT-051.S1–S5, plus the utility, skeleton and new header-group role cases (`data-table-responsive-stack.spec.ts:214-293`, `:440-481`). e2e S2 and S5 passed this round. Dynamic header-group cells are an edge case (F-03, minor) | met |
| `DAT-052` | Unit DAT-052.S1–S8 plus hardening (`data-table-responsive-stack.spec.ts:295-411`). e2e `features.spec.ts` asserts every clause of S2, S3, S6, S7 and S8 and the full-width blocks, and the hydration check, 7 of 7 passed. The locked partial tests are retitled as smoke checks (r2 F-02 fixed; lock drift F-02, minor) | met |
| `DAT-024` | `data-table.page.ts` section with prose, a live demo and a raw-template code block (`?raw` import, so it includes the third table). `data-table-docs.spec.ts` passed 14 of 14 and DAT-024.S16 passed this round with the three-table demo. All new prose and identifiers are in English | met |
