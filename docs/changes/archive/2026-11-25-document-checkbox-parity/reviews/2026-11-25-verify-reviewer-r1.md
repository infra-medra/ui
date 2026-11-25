# Review: document-checkbox-parity — verify

**Stage:** verify
**Verdict:** fail
**Counts:** critical 1 · major 0 · minor 0
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

The `/docs/components/checkbox` documentation page, its 11 demo components and English `.txt` prose fragments accurately reflect `CheckboxComponent` (`projects/medra/ui/src/lib/checkbox/checkbox.component.ts`), `projects/medra/ui/src/lib/checkbox/` has zero unintended modifications, and both `npm run build:site` and `npx playwright test --reporter=list --project=site e2e/site/checkbox-docs.spec.ts` exit 0. However, verification fails because `e2e/site/checkbox-docs.spec.ts:70` violates Constitution Article XI: the `Dynamic` interactive check asserts `expect(dynamicDemo).toContainText('Marketing')`, which is already satisfied by the checkbox's static `<label>` text and therefore does not verify that the bound `Selected:` value updated.

## Findings

### F-01 [critical] Dynamic demo assertion matches static label instead of bound value

**Where:** `e2e/site/checkbox-docs.spec.ts:67-70` · `CKB-001.S1` / Constitution Article XI
**Problem:** After checking the `Marketing` checkbox in `app-checkbox-dynamic-demo`, line 70 asserts `await expect(dynamicDemo).toContainText('Marketing');`. Because `projects/site/src/app/pages/docs/components/demos/checkbox-dynamic.demo.html:11` renders `Marketing` as the static `<label>` text for that checkbox (`categories` includes `{ key: 'M', name: 'Marketing' }`), `dynamicDemo` always contains `'Marketing'` before any interaction. Even if `[(ngModel)]="selectedCategories"` failed to update `<p>Selected: {{ selectedCategories.join(', ') || 'none' }}</p>` (`checkbox-dynamic.demo.html:15-17`), the assertion would still pass silently, leaving the `Dynamic` bound-value clause of `CKB-001.S1` unverified in violation of Constitution Article XI.
**Fix:** Scope the assertion to the bound output paragraph before and after checking `Marketing` in `e2e/site/checkbox-docs.spec.ts:67-70`:
```ts
const dynamicOutput = dynamicDemo.locator('p');
await expect(dynamicOutput).toContainText('Selected: Accounting');
await dynamicDemo.getByRole('checkbox', { name: 'Marketing' }).check();
await expect(dynamicOutput).toContainText('Selected: Accounting, Marketing');
```

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `CKB-001` | `projects/site/src/app/pages/docs/components/checkbox.page.ts:46-195`, 11 `projects/site/src/app/pages/docs/components/demos/checkbox-*.demo.{ts,html}` & `projects/site/src/content/docs/checkbox-*.txt` files, `e2e/site/checkbox-docs.spec.ts:19-117` (T001 red / T002 green; `npm run build:site` & Playwright exit 0; prose matches `projects/medra/ui/src/lib/checkbox/checkbox.component.ts` with zero changes to `projects/medra/ui/src/lib/checkbox/`; however `e2e/site/checkbox-docs.spec.ts:70` violates Constitution Article XI on the `Dynamic` bound-value clause) | partial |
