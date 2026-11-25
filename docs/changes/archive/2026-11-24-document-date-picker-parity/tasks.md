# Tasks: document-date-picker-parity

> A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: DTP-016 DatePicker documentation demos, prose, and e2e verification

- [x] T001 [TEST] [DTP-016] Write Playwright e2e test for `DTP-016.S1` (verifying every `EXAMPLES` "On this page" link, section prose, live demo, code block, and interactive Range/Clear/Forms demos) in `e2e/site/date-picker-docs.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-24: `npx playwright test --reporter=list --project=site e2e/site/date-picker-docs.spec.ts` exit 1 — "Call log: | - Expect 'toHaveCount' getByRole('navigation', { name: 'On this page' }).locator('a') with timeout 5000ms | - waiting for getByRole('navigation', { name: 'On this page' }).locator('a')"
- [x] T002 [DTP-016] after T001 Add English prose `.txt` files, demo `.demo.ts`/`.demo.html` components, and update `projects/site/src/app/pages/docs/components/date-picker.page.ts` with `EXAMPLES` and all 19 sections — verify: `npm run build:site` exits 0 and `npx playwright test --reporter=list --project=site e2e/site/date-picker-docs.spec.ts` passes (green)
  - evidence green 2026-11-24: `npx playwright test --reporter=list --project=site e2e/site/date-picker-docs.spec.ts` exit 0 [test-edited: e2e/site/date-picker-docs.spec.ts +1/-1 other (1 line(s) of the red version were removed or edited); reason "User authorized scoping tocLinks selector to a[href*='#example-'] in e2e/site/date-picker-docs.spec.ts"]
