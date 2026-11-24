# Tasks: data-table-keyboard-selection

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DAT-026 Row keyboard navigation, range selection, and Ctrl+A

- [x] T001 [TEST] [DAT-026] Write tests for DAT-026.S6, DAT-026.S7, DAT-026.S8 (Shift+Arrow range selection, Ctrl+A select all, and keyboardNavigation without selectionMode) in `projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` exit 1 — "✕ DAT-026.S7: Meta+A selects every loaded row and Ctrl+A on a checkbox inside the row does not hijack the shortcut (87 ms) | ✕ DAT-026.S8: without selectionMode and with keyboardNavigation=true, ArrowDown, End, and Home move row focus and leave selection unchanged (127 ms) | ● DataTableComponent row"
- [x] T002 [DAT-026] after T001 Add `keyboardNavigation` input, row `Shift+Arrow*`/`Shift+Home`/`Shift+End` range selection, and `Ctrl+A`/`Meta+A` select-all in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` exit 0

## Phase 2: DAT-043 Cell arrow navigation, range selection, Ctrl+A, and mouse drag

- [x] T003 [TEST] [DAT-043] Write tests for DAT-043.S3, DAT-043.S4, DAT-043.S5 (cell arrow navigation, Shift+Arrow rectangular range, Ctrl+A all cells, and mousedown/mouseenter/mouseup drag selection) in `projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts` exit 1 — "✓ DAT-026.S7: Meta+A selects every loaded row and Ctrl+A on a checkbox inside the row does not hijack the shortcut (139 ms) | ✓ DAT-026.S8: without selectionMode and with keyboardNavigation=true, ArrowDown, End, and Home move row focus and leave selection unchanged (110 ms) | DataTableComponent cell"
- [x] T004 [DAT-043] after T003 Implement cell arrow navigation, cell `Shift+Arrow*` range selection, cell `Ctrl+A`/`Meta+A` select-all, and mouse-drag rectangular cell selection in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T003 tests pass (green) and `npx jest projects/medra/ui/src/lib/data-table` passes
  - evidence green 2026-11-24: `npx jest projects/medra/ui/src/lib/data-table` exit 0 [test-edited: projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts +9/-1 other (1 line(s) of the red version were removed or edited); reason "User authorized fixing Shift+Home anchor expectation in DAT-043.S3 test"]
