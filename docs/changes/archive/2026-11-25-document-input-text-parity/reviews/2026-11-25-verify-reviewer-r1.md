# Review: document-input-text-parity — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

The `/docs/components/input-text` documentation parity expansion satisfies `REQ ITX-001` and `ITX-001.S1`: `projects/site/src/app/pages/docs/components/input-text.page.ts` exposes `EXAMPLES` with all 13 sections in order (`Basic` through `Reactive Forms`) via `<app-component-doc [examples]="examples">`, English `.txt` prose, interactive demos, and `<app-code-block>` snippets, while `projects/medra/ui/src/lib/input-text/` has zero changes. `npm run build:site` (exit 0), `npm run release:check` (exit 0), CLI `Suite: green`, TDD evidence (`T001` red, `T002` green), and Playwright `e2e/site/input-text-docs.spec.ts` (`1 passed`, zero console/hydration errors) all pass, with Constitution Articles I–VIII, X, and XI satisfied and the two CLI-flagged spec files (`date-picker-panel.component.spec.ts` and `input-number.component.spec.ts`) verified as prior archived work with no weakened tests. Verification passes with one minor finding (`F-01`): `projects/site/src/content/docs/input-text-fluid.txt:3` implies `fluid` or `medFluid` makes the input full-width, whereas `inputTextVariants` already applies `w-full` unconditionally by default.

## Findings

### F-01 [minor] `input-text-fluid.txt` implies `fluid` / `medFluid` causes full-width sizing despite default `w-full`

**Where:** `projects/site/src/content/docs/input-text-fluid.txt:3`, `projects/medra/ui/src/lib/input-text/input-text.directive.ts:39,46-52`, `projects/medra/ui/src/lib/input-text/input-text.styles.ts:18` · `REQ ITX-001`
**Problem:** `projects/site/src/content/docs/input-text-fluid.txt:3` states: `` Set `fluid` (or wrap controls in `medFluid`) so the text input spans the full width of its container. `` However, `inputTextVariants` (`projects/medra/ui/src/lib/input-text/input-text.styles.ts:18`) unconditionally includes `'w-full'` in its base class list, and `InputTextDirective.hostClass` (`projects/medra/ui/src/lib/input-text/input-text.directive.ts:46-52`) merges `this.fluid() || (this.fluidContext?.() ?? false) ? 'w-full' : ''` before `this.class()`. Because `'w-full'` is already active by default (unless overridden via `class`, as in the `w-64` demos), `fluid` and `medFluid` do not change the default width behavior and saying "so the text input spans the full width of its container" overstates their effect.
**Fix:** Update `projects/site/src/content/docs/input-text-fluid.txt:3` to document accurately that `input[medInputText]` fills the width of its container by default (`w-full` in `inputTextVariants`) and accepts `fluid` (or an ancestor `medFluid` / `<med-fluid>`) for form-control API parity.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `ITX-001` | `projects/site/src/app/pages/docs/components/input-text.page.ts:52-66,102-187` exposes `EXAMPLES` and `<app-component-doc [examples]="examples">` with all 13 ordered sections (`Basic`, `Clear Icon`, `Filled`, `Float Label`, `Ifta Label`, `Sizes`, `Fluid`, `Help Text`, `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, `Reactive Forms`); all 14 English `.txt` files (`projects/site/src/content/docs/input-text-*.txt`, with one minor wording improvement noted in `F-01` for `input-text-fluid.txt:3`) and 13 `.demo.{ts,html}` pairs (`projects/site/src/app/pages/docs/components/demos/input-text-*.demo.{ts,html}`) match `InputTextDirective` (`projects/medra/ui/src/lib/input-text/input-text.directive.ts`, zero changes in `projects/medra/ui/src/lib/input-text/` and `projects/site/src/content/api/input-text.json` accurate); Constitution Articles I–VIII, X (`@medra.dev/ui` `21.0.1` matching `@angular/core` `21.2.25`, `npm run release:check` exit 0), and XI satisfied; CLI pre-checks confirm `Suite: green`, `1/1` scenario coverage, `T001` `red` / `T002` `green` TDD evidence (`docs/changes/document-input-text-parity/tasks.md:5-8`), and flagged `date-picker-panel.component.spec.ts` / `input-number.component.spec.ts` diffs are prior archived changes with no skips or test weakening; `npm run build:site` (exit 0) and Playwright `npx playwright test --reporter=list --project=site e2e/site/input-text-docs.spec.ts` (`ITX-001.S1` at `e2e/site/input-text-docs.spec.ts:21-118`, `1 passed`, zero console/hydration errors, exit 0) pass. | met |
