# Review: add-data-table-column-templates-and-custom-sort — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-23

## Summary

Round 2 confirms that r1 findings F-01, F-02 and F-04 are fixed, each covered by a discriminating test or a correct placement. No regressions were found in the changed files. All five requirements are now `met`, the suite is green, and the pre-checks report 37/37 scenarios cited, complete TDD evidence and no weakened test files. The only open item is F-03, the weak real-browser icon count. It stays minor because the unit test tagged DAT-053.S1 asserts the sort-indicator clause directly, and that clause depends on the DOM, not on layout.

## Findings

### F-01 [minor] e2e DAT-053.S1 icon count passes without the sort indicator (carried from r1 F-03, open)

**Where:** `e2e/site/data-table-column-templates.spec.ts:44` · DAT-053.S1, Article XI
**Problem:** This line has not changed since r1: `expect(await header.locator('med-icon').count()).toBeGreaterThanOrEqual(2)`. The demo's `#header` template already projects two `med-icon`s (`tag`, plus `magnifying-glass` inside the button), so the assertion would still pass if the sort chevron were missing. Re-graded on its merits, it stays minor, for three reasons:
- The unit test tagged DAT-053.S1 (`projects/medra/ui/src/lib/data-table/data-table-column-templates.spec.ts:194-204`) uses a template whose icon is a `.header-icon` element, not a `med-icon`. Its `price.querySelector('med-icon')` assertion therefore discriminates the sort indicator, so the clause has real compliance evidence.
- Whether the indicator is present is a DOM fact, not a layout or CSS fact. Article V does not require a real-browser check for it.
- The e2e test is new in this change, so nothing was loosened from an earlier version, and it is not a weakening.

On the letter of Article XI, though, the e2e test carries the DAT-053.S1 tag and does not discriminate the "still shows the sort indicator" Then clause. That is why this is a finding and not a note. The file is locked by a test checkpoint, and the implementer correctly did not edit it without user consent.
**Fix:** With user consent to unlock the checkpoint, replace line 44 with an assertion on the indicator itself, for example `await expect(header.locator('med-icon[name="chevron-down"]')).toHaveCount(1)`. If consent is not given, record the gap as accepted in the change's notes, or drop the `DAT-053.S1` tag from the e2e test so the tag claims only what the test asserts. Fixing this is not needed for this verdict.

## Re-check of r1 findings

- **r1 F-01 [critical], fixed.** The multiple-sort comparator (`projects/medra/ui/src/lib/data-table/data-table.component.ts:1761-1780`) no longer prepends the group field to `effectiveMeta`. It compares the group key with `compareRows(a, b, groupField, 'asc')` (line 1768), the same default comparison the single-sort branch uses (line 1787). Only the remaining `multiSortMeta` entries go through `compareByColumn` (line 1774). With a group field and an empty meta the rows are still sorted (`!groupField && effectiveMeta.length === 0`), and a meta entry on the group field is still filtered out, as before the change. The new tests in `projects/medra/ui/src/lib/data-table/data-table-verify-fixes.spec.ts:766-784` discriminate the case. The grouping column's `sortBy`/`sortCompare` (rank Beta=1, Alpha=2) would put the Beta group first, while the asserted order `['Axle', 'Zeta', 'Bolt', 'Cog']` puts Alpha first. The second test also shows that a `desc` meta entry on the group field leaves the groups ascending, while the secondary key `name desc` still applies (`['Zeta', 'Axle', 'Cog', 'Bolt']`).
- **r1 F-02 [major], fixed.** The column-footer selection cell (line 801) and row-actions cell (line 829) now carry `[class.hidden]="stacked()"`. The reorder cell needs no change, because `rowReorderActive()` is false while stacked. New tests (`data-table-verify-fixes.spec.ts:688-717`) assert the following:
  - With `selectionMode="multiple"`, the stacked footer selection cell is hidden.
  - With `editMode="row"`, the stacked footer row-actions cell is hidden.
  - In both cases the footer cell that has content stays visible.
  - Outside the stacked layout, the selection cell stays visible, which guards against over-hiding.
- **r1 F-04 [minor], fixed.** The `EXAMPLES` entry `example-column-header-footer` now follows `example-templates` (`projects/site/src/app/pages/docs/components/data-table.page.ts:225-226`), and its `<section>` follows the templates section (lines 571 and 579), before `example-caption-summary`, as plan.md and T009 specify. The old entry and section after `example-responsive-stack` are gone, so index order and section order still match (DAT-024.S1). The e2e tests locate the section by id (`e2e/site/data-table-column-templates.spec.ts:132`), not by position, so the move breaks nothing.
- **r1 F-03 [minor], open.** Re-graded above as F-01.

## Regression check

The changed files contain only the three fixes, the TSDoc paragraph and the docs move. The new comparator path keeps the earlier behavior for tables without subheader grouping, and `Array.prototype.sort` keeps the stable order DAT-055 requires. The new spec file is additive and loosens no matcher. Behavior under test is not mocked: the only mock is `window.matchMedia`, the same one `data-table-responsive-stack.spec.ts` uses.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-053` | Carried from r1: `data-table-column-templates.spec.ts` DAT-053.S1–S4; `e2e/site/data-table-column-templates.spec.ts` S1, S2, S3; T002, T003 green. The e2e S1 icon count is weak (F-01), but the unit S1 test discriminates the clause | met |
| `DAT-054` | `data-table-column-templates.spec.ts` DAT-054.S1–S7; e2e S5, S6; T004, T005 green; stacked utility footer cells now hidden, `data-table-verify-fixes.spec.ts:688-717` | met |
| `DAT-055` | `data-table-column-templates.spec.ts` DAT-055.S1–S5; T006 green; multi-sort subheader group key now on the default comparison, `data-table-verify-fixes.spec.ts:766-784` | met |
| `DAT-033` | Carried from r1: `data-table.component.spec.ts:2076-2120` DAT-033.S1–S4; T004 green | met |
| `DAT-024` | `e2e/site/data-table-docs.spec.ts` S1–S16, `e2e/site/data-table-column-templates.spec.ts` DAT-024.S17; T009 green; section now placed after `example-templates` as planned | met |
