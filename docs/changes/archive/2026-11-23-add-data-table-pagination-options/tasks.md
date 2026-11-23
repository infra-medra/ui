# Tasks: add-data-table-pagination-options

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-049 Data table paginator position and options

- [x] T001 [TEST] [DAT-049] Write tests for DAT-049.S1, DAT-049.S2, DAT-049.S3, DAT-049.S4, DAT-049.S5, DAT-049.S6, DAT-049.S7, DAT-049.S8, DAT-049.S9 in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t DAT-049` exit 1 — "5131 |     expect(caption.compareDocumentPosition(paginators[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(); | > 5132 |     expect(paginators[0].compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(); | |                                                                "
- [x] T002 [DAT-049] after T001 Add the `paginatorPosition`, `showCurrentPageReport`, `currentPageReportTemplate`, `showFirstLastIcon`, `showJumpToPageInput`, `pageLinks`, `alwaysShowPaginator` and three aria-label inputs plus the `pageChange` output, with TSDoc, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests that read the inputs and output compile
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t DAT-049.S9` exit 0
- [x] T003 [DAT-049] after T002 Render the single `<med-paginator>` template at the top (inside the wrapper, after the caption, in `data-med-paginator-top`), bottom or both, forwarding every input and `pageChange`, in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-23: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 0

## Phase 2: DAT-024 Data table documentation page

- [x] T004 [TEST] [DAT-024] Write tests for DAT-024.S15 and DAT-049.S1 (paginator above the header, below the caption, in the live demo) in `e2e/site/data-table-pagination.spec.ts`, and add the `paginator-options` slug to the checked lists in `e2e/site/data-table-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-23: `npx playwright test e2e/site/data-table-pagination.spec.ts e2e/site/data-table-docs.spec.ts --project=site` exit 1 — "167 |     for (const slug of PAGINATOR_OPTIONS) { | > 168 |       expect(anchorIds, `no section for '${slug}'`).toContain(`example-${slug}`); | |                                                     ^"
- [x] T005 [DAT-024] after T004 Add the paginator options demo (paginator above and below, custom page report, first/last buttons, jump input) in `projects/site/src/app/pages/docs/components/demos/data-table-paginator-options.demo.ts` and `projects/site/src/app/pages/docs/components/demos/data-table-paginator-options.demo.html`, with prose in `projects/site/src/content/docs/data-table-paginator-options.txt` — verify: files exist and the demo compiles
  - evidence green 2026-11-23: `test -f projects/site/src/app/pages/docs/components/demos/data-table-paginator-options.demo.ts && test -f projects/site/src/app/pages/docs/components/demos/data-table-paginator-options.demo.html && test -f projects/site/src/content/docs/data-table-paginator-options.txt && npx tsc --noEmit -p projects/site/tsconfig.app.json && npm run build:site` exit 0
- [x] T006 [DAT-024] after T005 Register the `example-paginator-options` section after `example-programmatic-pagination` and add the new inputs and output to the API reference in `projects/site/src/app/pages/docs/components/data-table.page.ts` and `projects/site/src/content/api/data-table.json` — verify: T004 tests pass (green)
  - evidence green 2026-11-23: `npx playwright test e2e/site/data-table-pagination.spec.ts e2e/site/data-table-docs.spec.ts --project=site --reporter=list` exit 0

## Phase 3: Release

- [x] T007 Add a `minor` changeset for `@medra.dev/ui` describing the new paginator inputs and `pageChange` output in `.changeset/data-table-pagination-options.md` — verify: the file names `'@medra.dev/ui': minor`
  - evidence green 2026-11-23: `grep -q "'@medra.dev/ui': minor" .changeset/data-table-pagination-options.md` exit 0
- [x] T008 [DAT-049] after T001, T006 Run the full unit suite and every data-table Playwright spec in `e2e/site/` — verify: `npm test` and `npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` exit 0
  - evidence green 2026-11-23: `npm test && npx playwright test --reporter=list --project=site e2e/site/data-table-*.spec.ts` exit 0
