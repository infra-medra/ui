# Review: document-tabs-parity — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

`REQ TBD-001` (`TBD-001.S1`) is met and verified: `projects/site/src/app/pages/docs/components/tabs.page.ts` exposes all 6 `EXAMPLES` (`Basic`, `Dynamic`, `Controlled`, `Scrollable`, `Lazy`, `Disabled`) in order with `<app-component-doc [examples]="examples">`, English `.txt` prose aligned with `TabsComponent`/`TabComponent`, live demos, and non-empty HTML/TS code blocks, with zero changes to `projects/medra/ui/src/lib/tabs/`, `npm run build:site` passing, `npm test` green, and `e2e/site/tabs-docs.spec.ts` passing in Chromium with zero console or hydration errors. All applicable Constitution articles (I–VIII, X, XI) are satisfied, and the single-line test edit in `e2e/site/tabs-docs.spec.ts:116` (`{ force: true }`) is legitimate click-suppression verification on `[aria-disabled="true"]` rather than test weakening. Two minor findings remain: `projects/site/src/content/docs/tabs-lazy.txt:3` refers to `"the \"Overview\" tab above"` even though the demo renders below the prose, and `e2e/site/tabs-docs.spec.ts:51-53` only asserts the first `<app-code-block>` per section rather than also checking secondary `.ts` code blocks.

## Findings

### F-01 [minor] `tabs-lazy.txt` refers to `"the \"Overview\" tab above"` when the demo renders below

**Where:** `projects/site/src/content/docs/tabs-lazy.txt:3` · `REQ TBD-001`
**Problem:** `projects/site/src/content/docs/tabs-lazy.txt:3` states `Plain projected content (the "Overview" tab above) is instantiated the moment <med-tabs> itself renders`, whereas `projects/site/src/app/pages/docs/components/tabs.page.ts:103-105` renders `<app-prose id="example-lazy" ... [content]="lazyContent" />` above `<app-tabs-lazy-demo />` (so the `"Overview"` tab sits below that paragraph, while the `Scrollable` demo is above it).
**Fix:** Change `the "Overview" tab above` to `the "Overview" tab below` in `projects/site/src/content/docs/tabs-lazy.txt:3`.

### F-02 [minor] `e2e/site/tabs-docs.spec.ts` asserts only the first code block per section

**Where:** `e2e/site/tabs-docs.spec.ts:51-53` · `TBD-001.S1`
**Problem:** Lines 51–53 check `demoWrapper.locator('app-code-block pre code').first()`, leaving the secondary TypeScript `<app-code-block>` elements in `Dynamic`, `Controlled`, `Scrollable`, and `Lazy` (`projects/site/src/app/pages/docs/components/tabs.page.ts:86,93,100,107`) unasserted in Playwright (verified non-empty by reading `tabs-dynamic.demo.ts`, `tabs-controlled.demo.ts`, `tabs-navigators.demo.ts`, and `tabs-lazy.demo.ts`).
**Fix:** Loop over all matches of `demoWrapper.locator('app-code-block pre code')` in `e2e/site/tabs-docs.spec.ts:51-53` and assert each rendered code block is visible and non-empty.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `TBD-001` | `TBD-001.S1`: `e2e/site/tabs-docs.spec.ts:14-123` (`T001` red, `T002` green; `npx playwright test --reporter=list --project=site e2e/site/tabs-docs.spec.ts` exit 0, `npm run build:site` exit 0, `npm test` `suite: green`); `projects/site/src/app/pages/docs/components/tabs.page.ts:34-117`, `projects/site/src/app/pages/docs/components/demos/tabs-*.demo.{ts,html}`, `projects/site/src/content/docs/tabs-*.txt`; zero changes to `projects/medra/ui/src/lib/tabs/`; Constitution Articles I–VIII, X, XI satisfied | met |
