# Tasks: add-button-group

## Task List

- [x] T001 [TEST] [BTD-002] Write failing Jest unit tests in `projects/medra/ui/src/lib/button-group/button-group.component.spec.ts` covering `BTD-002.S1` (`role="group"`, connected border/radius classes, and `mergeClasses` override) — verify: red (`npx jest projects/medra/ui/src/lib/button-group/button-group.component.spec.ts`)
  - evidence red 2026-11-25: `npx jest projects/medra/ui/src/lib/button-group/button-group.component.spec.ts` exit 1 — "> 4 | import { ButtonGroupComponent } from './button-group.component'; | | ^ | 5 | import { buttonGroupVariants } from './button-group.styles';"
- [x] T002 [BTD-002] after T001 Implement `ButtonGroupComponent` and `buttonGroupVariants` in `projects/medra/ui/src/lib/button-group/`, export them in `projects/medra/ui/src/public-api.ts`, and add `.changeset/button-group.md` (`minor`) — verify: green (`npx jest projects/medra/ui/src/lib/button-group/button-group.component.spec.ts && npm run build:ui`)
  - evidence green 2026-11-25: `npx jest projects/medra/ui/src/lib/button-group/button-group.component.spec.ts && npm run build:ui` exit 0
- [x] T003 [TEST] [BTD-003] after T002 Extend `e2e/site/button-docs.spec.ts` with failing Playwright real-browser assertions for `Button Group` (`#example-button-group`, `BTD-003.S1`, and connected `borderRadius` checks for `BTD-002.S1`) — verify: red (`npx playwright test --reporter=list --project=site e2e/site/button-docs.spec.ts`)
  - evidence red 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/button-docs.spec.ts` exit 1 — "Call log: | - Expect 'toHaveCount' getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']') with timeout 5000ms | - waiting for getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']')"
- [x] T004 [BTD-003] after T003 Create `button-group.demo.{ts,html}` and `button-group.txt` and register `Button Group` in `projects/site/src/app/pages/docs/components/button.page.ts` — verify: green (`npm test && npm run build:ui && npm run build:site && npx playwright test --reporter=list --project=site e2e/site/button-docs.spec.ts`)
  - evidence green 2026-11-25: `npx playwright test --reporter=list --project=site e2e/site/button-docs.spec.ts` exit 0
