# Tasks: data-table-virtual-horizontal-columns

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-063.S1 Horizontal column virtualization in DataTableComponent

- [x] T001 [TEST] [DAT-063] Write component tests for `DAT-063.S1` (only horizontal window + frozen columns rendered, `5,100px` total table width, scrolling to `2,500px` shifts window with left/right spacers, `aria-colcount`/`aria-colindex`, and `colspan` alignment) in `projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts` exit 1 — "✕ REQ DAT-063: preserves left/right frozen columns, declared px widths, and utility columns, and disables horizontal virtualization when stacked (352 ms) | ● DataTableComponent virtualScrollColumns (DAT-063) › DAT-063.S1: renders only horizontal window and frozen columns with 5,100px width, shifts w"
- [x] T002 [DAT-063] after T001 Implement `virtualScrollColumns`, `virtualScrollColumnWidth`, `virtualColumnLayout`, horizontal spacers across header/filter/body/frozen/skeleton/footer rows, `tableWidthPx`, `totalColumnCount`, and `aria-colcount`/`aria-colindex` in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green), `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit` exits 0, and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table-virtual-columns.spec.ts +12/-15 other (15 line(s) of the red version were removed or edited); reason "User authorized fixing window.matchMedia mock in data-table-virtual-columns.spec.ts to update cached MediaQueryList and fire change listener"]

## Phase 2: DAT-063.S2 Real-browser verification

- [x] T003 [DAT-063] after T002 Add a `virtualScroll` + `virtualScrollColumns` demo with a left-frozen column and 40 scrollable columns in `projects/site/src/app/pages/docs/components/demos/data-table-virtual-scroll.demo.html` / `.ts` and Playwright test for `DAT-063.S2` in `e2e/site/data-table-virtual-columns.spec.ts` — verify: `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual*.spec.ts` passes
  - evidence green 2026-11-24: `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual*.spec.ts` exit 0
