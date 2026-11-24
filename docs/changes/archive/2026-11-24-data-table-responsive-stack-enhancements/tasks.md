# Tasks: data-table-responsive-stack-enhancements

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-050, DAT-060 Container-width breakpoint and stacked sort control

- [x] T001 [TEST] [DAT-050, DAT-060] Write tests for DAT-050.S7 (`breakpointMode="container"` with `ResizeObserver`) and DAT-060.S1 (visible stacked sort control toggling/clearing sort while stacked) in `projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts` exit 1 — "expect(received).toBe(expected) // Object.is equality | Expected: true | Received: false"
- [x] T002 [DAT-050, DAT-060] after T001 Implement `breakpointMode` (`'viewport' | 'container'`) with `ResizeObserver` and the stacked sort control bar (`data-med-stack-sort`) with overridable label inputs in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green), `npx tsc -p projects/medra/ui/tsconfig.lib.json --noEmit` exits 0, and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table-responsive-stack-enhancements.spec.ts +10/-9 weakening (an assertion was removed or changed); reason "User authorized fixing ResizeObserver mock target matching and aria-sort none expectation in data-table-responsive-stack-enhancements.spec.ts"]
