# Review: extend-data-table-appearance-and-selection — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-20

## Summary

The implementation matches the approved deltas. The `size`, `showGridlines` and `stripedRows` inputs, the `radio` selection mode and the row keyboard navigation are all in `data-table.component.ts`. Five docs sections were added and the changeset is `minor`. Red and green evidence exists for every `[TEST]` and implementation task. The diff against `diff_base` removes no assertions and adds no skips. The only edits to existing tests are scenario-ID tags. The suite was green at dispatch. The one finding is a minor test gap: DAT-025 requires a text-size change, and no test asserts it.

## Findings

### F-01 [minor] DAT-025 text-size change is not asserted

**Where:** `e2e/site/data-table-appearance.spec.ts:11` · DAT-025.S1
**Problem:** DAT-025 says `size` "SHALL change the cell padding and text size". The component maps `sm`, `default` and `lg` to `text-xs`, `text-sm` and `text-base` (`data-table.component.ts`, `SIZE_TEXT_CLASS`). The S1 test measures only vertical padding, so a regression in text size would pass. The scenario's Then clause names only padding, so this does not make the requirement `partial`.
**Fix:** In the S1 test, also compare `getComputedStyle(td).fontSize` of the `lg` table against the `sm` table and assert it is larger.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DAT-025` | S1–S3: `e2e/site/data-table-appearance.spec.ts:11,29,51` measure computed padding, side borders and row backgrounds on the live demos. Implementation: `SIZE_PADDING_CLASS`, `gridClass()` and `rowClassFor()` in `data-table.component.ts`. T001 red, T002 and T003 green. | met |
| `DAT-026` | S1–S3: `data-table.component.spec.ts:425,453,467`. They assert focus moves, the selection is unchanged, the ends do not wrap, and `multiple` and no-mode leave the key unhandled (`defaultPrevented` false). Implementation: `onRowKeydown` and `moveRowFocus`. T006 red, T007 green. | met |
| `DAT-006` | S3: `data-table.component.spec.ts:341` covers one `rowSelect`, only the chosen radio checked, and no select-all. S1 (`:533`) and S2 (`:913`) are retagged only; their assertions are unchanged. T004 red, T005 green. | met |
| `DAT-024` | S1–S3 carried by the unchanged tests (`e2e/site/data-table-docs.spec.ts:56,64,77`). S4: `data-table-docs.spec.ts:86` checks the five new sections and one demo each, and `data-table.page.ts` registers them in `EXAMPLES`. The demos use only inputs the component implements. T008 red, T009 and T010 green. | met |
