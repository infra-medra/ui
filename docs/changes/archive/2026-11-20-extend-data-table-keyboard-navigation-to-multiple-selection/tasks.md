# Tasks: extend-data-table-keyboard-navigation-to-multiple-selection

## Phase 1: DAT-026 Data table row keyboard navigation

- [x] T001 [TEST] [DAT-026] Write tests for DAT-026.S3, DAT-026.S4, DAT-026.S5 and update the existing multiple-mode expectation in `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts -t DAT-026` exit 1 — "495 |       }); | 496 |       const rows = bodyRows(fixture); | > 497 |       expect(rows[1].getAttribute('tabindex')).toBe('0');"
- [x] T002 [DAT-026] after T001 Make rows focusable in `multiple` mode and handle ArrowUp, ArrowDown, Home, End, Space and Enter for it in `projects/medra/ui/src/lib/data-table/data-table.component.ts` — verify: T001 tests pass (green)
  - evidence green 2026-11-20: `npx jest projects/medra/ui/src/lib/data-table/data-table.component.spec.ts` exit 0
- [x] T003 [DAT-026] after T002 Add a `multiple` table to the keyboard navigation example and update its prose in `projects/site/src/app/pages/docs/components/demos/data-table-keyboard-navigation.demo.html` — verify: `npx playwright test e2e/site/data-table-docs.spec.ts --project=site` passes
  - evidence green 2026-11-20: `npx playwright test e2e/site/data-table-docs.spec.ts --project=site --trace off` exit 0
- [x] T004 [DAT-026] after T002 Add a patch changeset describing the multiple-mode keyboard navigation in `.changeset/data-table-multiple-keyboard-navigation.md` — verify: `npx changeset status` lists `@medra.dev/ui` as patch
  - evidence green 2026-11-20: `npx changeset status` exit 0
