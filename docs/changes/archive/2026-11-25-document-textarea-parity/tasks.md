# Tasks: document-textarea-parity

## Task List

- [x] T001 [TEST] [TXA-001] Create failing Playwright test `e2e/site/textarea-docs.spec.ts` asserting `TXA-001.S1` (zero console/hydration errors, all 12 `EXAMPLES` links in order, visible sections, non-empty code blocks, and interactive updates) — verify: red (`npx playwright test --reporter=list --project=site e2e/site/textarea-docs.spec.ts`)
  - evidence red 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/textarea-docs.spec.ts` exit 1 — "Call log: | - Expect 'toHaveCount' getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']') with timeout 5000ms | - waiting for getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']')"
- [x] T002 [TXA-001] after T001 Create the missing `textarea-*.demo.{ts,html}` and English `.txt` files and update `projects/site/src/app/pages/docs/components/textarea.page.ts` with `EXAMPLES` and `<app-component-doc [examples]="examples">` — verify: green (`npm test && npm run build:site && npx playwright test --reporter=list --project=site e2e/site/textarea-docs.spec.ts`)
  - evidence green 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/textarea-docs.spec.ts` exit 0
