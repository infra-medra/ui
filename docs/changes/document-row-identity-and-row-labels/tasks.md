# Tasks: document-row-identity-and-row-labels

## Phase 1: DAT-024 Data table documentation page

- [x] T002 [TEST] [DAT-024, DAT-027] Add `row-aria-label` and `row-track-by` to the examples checked by DAT-024.S5, and check that the checkboxes of the `row-aria-label` demo are named per row as DAT-027.S1 states, in `e2e/site/data-table-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts --trace off` exit 1 — "103 |     for (const slug of ROW_LABELS_AND_IDENTITY) { | > 104 |       expect(anchorIds, `no section for '${slug}'`).toContain(`example-${slug}`); | |                                                     ^"

## Phase 2: DAT-027 Data table row identity and row labels

- [x] T001 [DAT-027] after T002 Bind `rowAriaLabel`, `rowTrackBy` and `expandedRowKeys` in a dedicated test host, and add characterization tests for DAT-027.S1, DAT-027.S2, DAT-027.S3, DAT-027.S4, DAT-027.S5 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests pass (green); they describe behavior the component already has, so no red run exists for them, and a failure means a component defect for a new proposal
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table` exit 0
- [x] T003 [DAT-024, DAT-027] after T001, T002 Add the `row-aria-label` and `row-track-by` examples (demos, prose files and code imports) after `selection-radio` in `projects/site/src/app/pages/docs/components/data-table.page.ts` — verify: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts` passes (green)
  - evidence green 2026-11-20: `npx playwright test --project=site e2e/site/data-table-docs.spec.ts --trace off` exit 0
