# Tasks: document-slider-parity

> In `tdd` mode: A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: SLD-001 Slider documentation page

- [x] T001 [TEST] [SLD-001, SLD-002, SLD-003, SLD-004] Write the Playwright test for SLD-001.S1 in `e2e/site/slider-docs.spec.ts`: zero console errors and hydration warnings, the 14 `#example-*` links in order with matching labels, visible prose, demo and non-empty code block per section, ArrowRight on the `Basic`, `Signal Forms`, `Template Driven` and `Reactive Forms` thumbs updating each displayed value, and the `Controlled` buttons moving its thumb — verify: test fails (red), because the page has no `EXAMPLES` yet; SLD-002..SLD-004 describe behavior the component already has, so their red run is this page test and T002 characterizes them
  - evidence red 2026-11-25: `npx playwright test --reporter=list --project=site --trace off e2e/site/slider-docs.spec.ts` exit 1 — "Call log: | - Expect 'toHaveCount' getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']') with timeout 5000ms | - waiting for getByRole('navigation', { name: 'On this page' }).locator('a[href*='#example-']')"
- [x] T002 [SLD-002, SLD-003, SLD-004] after T001 Add characterization tests for SLD-002.S1, SLD-003.S1 and SLD-004.S1 in `projects/medra/ui/src/lib/slider/slider.component.spec.ts`, asserting every Given and Then clause — verify: tests pass (green); they describe behavior the component already has, so a failure means a component defect for a new proposal
  - evidence green 2026-11-25: `npx jest projects/medra/ui/src/lib/slider` exit 0
## Phase 2: SLD-005 Vertical orientation

- [x] T003 [TEST] [SLD-005] Write Jest tests for SLD-005.S1 (vertical slider with value 30: thumb `bottom: 30%`, fill `bottom: 0%` and `height: 30%`) and SLD-005.S2 (default `min`/`max`, a pointer press 25% down from the top of a stubbed vertical track rect sets the value to 75) in `projects/medra/ui/src/lib/slider/slider.component.spec.ts` — verify: tests fail (red)
  - evidence red 2026-11-25: `npx jest projects/medra/ui/src/lib/slider` exit 1 — "you. We recommend using this approach to avoid 'changed after checked' errors. | Example: | // Specify the `disabled` property at control creation time:"
- [x] T004 [TEST] [SLD-005] Write the Playwright test for SLD-005.S3 in `e2e/site/slider-vertical.spec.ts`: on `/docs/components/slider`, the `Vertical` demo's track is taller than wide, and dragging its thumb upward increases `aria-valuenow` — verify: test fails (red)
  - evidence red 2026-11-25: `npx playwright test --reporter=list --project=site --trace off e2e/site/slider-vertical.spec.ts` exit 1 — "> 11 |     await demo.scrollIntoViewIfNeeded(); | |                ^ | 12 |     const thumb = demo.getByRole('slider').first();"
- [x] T005 [SLD-005] after T003, T004 Add the `orientation` variant to the four recipes in `projects/medra/ui/src/lib/slider/slider.styles.ts` and use it in `projects/medra/ui/src/lib/slider/slider.component.ts` for classes, thumb/fill positions and pointer mapping, update the component TSDoc, and add `.changeset/slider-vertical.md` (`minor`) — verify: T003 tests pass (green) with `npx jest projects/medra/ui/src/lib/slider && npm run build:ui`
  - evidence green 2026-11-25: `npx jest projects/medra/ui/src/lib/slider && npm run build:ui` exit 0

## Phase 3: SLD-001 Documentation page

- [x] T006 [SLD-001, SLD-005] after T001, T005 Rewrite `projects/site/src/app/pages/docs/components/slider.page.ts` with `EXAMPLES` and `<app-component-doc [examples]="examples">`, and add the missing `slider-*.demo.{ts,html}` demos and English `projects/site/src/content/docs/slider-*.txt` prose for all 14 sections — verify: T001 and T004 tests pass (green) with `npm run build && npm run build:site && npx playwright test --reporter=list --project=site e2e/site/slider-docs.spec.ts e2e/site/slider-vertical.spec.ts`, and `npm test` passes
  - evidence green 2026-11-25: `npm run build && npm run build:site && npx playwright test --reporter=list --project=site --trace off e2e/site/slider-docs.spec.ts e2e/site/slider-vertical.spec.ts && npm test` exit 0
