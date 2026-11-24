# Tasks: data-table-virtual-variable-height

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-061 Prefix-sum height index helper

- [x] T001 [TEST] [DAT-061] Write unit tests for prefix-sum index construction, binary-search `findRowAtOffset`, `rangeAtVariableOffset`, and `rangeHeight` in `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts` exit 1 — "You might want to include a file extension in your import, or update your 'moduleFileExtensions', which is currently ['ts', 'mts', 'html', 'js', 'json', 'mjs']. | See https://jestjs.io/docs/configuration#modulefileextensions-arraystring | > 1 | import { buildVirtualHeightIndex, findRowAtOffset, rang"
- [x] T002 [DAT-061] after T001 Implement `buildVirtualHeightIndex`, `findRowAtOffset`, `rangeAtVariableOffset`, and `rangeHeight` in `projects/medra/ui/src/lib/data-table/data-table-virtual-heights.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-heights.spec.ts` exit 0

## Phase 2: DAT-061 DataTableComponent variable row height integration

- [x] T003 [TEST] [DAT-061] Write component tests for `DAT-061.S1` (callback row heights, cumulative spacers, `End` key scroll+focus, `lazy` placeholder fallback) and `'auto'` cell wrapping/measurement in `projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-virtual-variable-height.spec.ts` exit 1 — "✕ REQ DAT-061: virtualScrollRowHeight='auto' omits fixed height and cell truncate, and updates offsets from ResizeObserver (68 ms) | ✕ REQ DAT-061: virtualScrollRowHeight='auto' compensates scrollTop when rows above viewport change height and resets on data change (163 ms) | ● DataTableComponent vir"
- [x] T004 [DAT-061] after T002, T003 Add `virtualScrollRowHeight` (`callback | 'auto' | null`) and `ResizeObserver` row height measurement with `scrollTop` delta compensation in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T003 tests pass (green), `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit` exits 0, and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit && npx jest projects/medra/ui/src/lib/data-table` exit 0

## Phase 3: DAT-061.S2 Real-browser verification

- [x] T005 [DAT-061] after T004 Add a `virtualScrollRowHeight="auto"` demo/route and Playwright test for `DAT-061.S2` in `e2e/site/data-table-virtual-variable-height.spec.ts` — verify: `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual-variable-height.spec.ts` passes
  - evidence green 2026-11-24: `npx playwright test --reporter=list --project=site e2e/site/data-table-virtual-variable-height.spec.ts` exit 0
