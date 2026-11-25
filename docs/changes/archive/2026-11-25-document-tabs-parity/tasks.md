# Tasks: document-tabs-parity

## Task List

- [x] T001 [TEST] [TBD-001] Create failing Playwright test `e2e/site/tabs-docs.spec.ts` asserting `TBD-001.S1` (zero console/hydration errors, all 6 `EXAMPLES` links in order, visible sections, non-empty code blocks, and interactive tab switching) — verify: red (`npx playwright test --reporter=list --project=site e2e/site/tabs-docs.spec.ts`)
  - evidence red 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/tabs-docs.spec.ts` exit 1 — "Call log: | - Expect 'toHaveCount' getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']') with timeout 5000ms | - waiting for getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']')"
- [x] T002 [TBD-001] after T001 Create the missing `tabs-*.demo.{ts,html}` and English `.txt` files and update `projects/site/src/app/pages/docs/components/tabs.page.ts` with `EXAMPLES` and `<app-component-doc [examples]="examples">` — verify: green (`npm test && npm run build:site && npx playwright test --reporter=list --project=site e2e/site/tabs-docs.spec.ts`)
  - evidence green 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/tabs-docs.spec.ts` exit 0 [test-edited: e2e/site/tabs-docs.spec.ts +1/-1 other (1 line(s) of the red version were removed or edited); reason "Playwright click() requires { force: true } on [aria-disabled=true] tabs to verify click-suppression"]
