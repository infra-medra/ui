# Review: add-select-button-item-template — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 2
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

All three requirements (`SLB-002`, `SLB-003`, `SLB-004`) are implemented and verified with passing Jest unit tests (`suite: green`) and Playwright real-browser checks on `/docs/components/select-button`, with all TDD red/green evidence recorded and zero constitution violations. Two minor improvements remain: `select-button-fluid.txt` phrases the `medFluid` directive as a wrapper element name rather than `<med-fluid>` / `[medFluid]`, and the `SLB-002.S1` Jest test queries `.custom-item` on the component host instead of explicitly scoping inside each `<button>`.

## Findings

### F-01 [minor] Fluid documentation prose uses attribute selector with wrapper wording

**Where:** `projects/site/src/content/docs/select-button-fluid.txt:3` · SLB-004
**Problem:** The prose states "(or wrap the control in `medFluid`)", pairing wrapper phrasing with the attribute selector `medFluid` rather than `<med-fluid>` or `[medFluid]`. `FluidDirective` (`projects/medra/ui/src/lib/fluid/fluid.directive.ts:21`) declares `selector: 'med-fluid, [medFluid]'`, so using `<medFluid>` as an element tag fails Angular template compilation.
**Fix:** Update line 3 of `projects/site/src/content/docs/select-button-fluid.txt` to "(or wrap the control in `<med-fluid>` or an ancestor with `medFluid`)".

### F-02 [minor] SLB-002.S1 unit test does not scope `.custom-item` query to option buttons

**Where:** `projects/medra/ui/src/lib/select-button/select-button.component.spec.ts:334` · SLB-002.S1
**Problem:** The `SLB-002.S1` spec checks `fixture.nativeElement.querySelectorAll('.custom-item')` rather than querying `button .custom-item` (or checking `btns.every((b) => b.querySelector('.custom-item') !== null)`), so the assertion relies on the template having no other DOM location rather than directly verifying each option button contains the projected markup.
**Fix:** Assert containment per button using `btns.map((b) => b.querySelector('.custom-item')?.textContent?.trim())` (or `fixture.nativeElement.querySelectorAll('button .custom-item')`) in `projects/medra/ui/src/lib/select-button/select-button.component.spec.ts:334`.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `SLB-002` | `projects/medra/ui/src/lib/select-button/select-button.component.ts:11-15,73-77,100` (`SelectButtonItemContext`, `itemTemplate` `#item`, `NgTemplateOutlet` + `option.label` fallback), `projects/medra/ui/src/public-api.ts:126`; Jest `SLB-002.S1` at `projects/medra/ui/src/lib/select-button/select-button.component.spec.ts:306-358` and fallback test at lines `52-55`; T001 red / T002 green (`npm test` suite green) | met |
| `SLB-003` | `projects/medra/ui/src/lib/select-button/select-button.component.ts:43-47,84,93,105,112-114,149-151` (`fluid` input, `MED_FLUID_CONTEXT`, `block w-full` / `inline-block`, `flex-1 justify-center`); Jest `SLB-003` specs at `projects/medra/ui/src/lib/select-button/select-button.component.spec.ts:360-411`; Playwright `SLB-003.S1` width & equal-option assertions at `e2e/site/select-button-docs.spec.ts:91-112`; T001/T003 red, T002/T004 green | met |
| `SLB-004` | `projects/site/src/app/pages/docs/components/select-button.page.ts:46-58,110-126`, `projects/site/src/app/pages/docs/components/demos/select-button-{template,fluid}.demo.{ts,html}`, `projects/site/src/content/docs/select-button-{template,fluid}.txt`, `projects/site/src/content/api/select-button.json:51-57,86-92`; Playwright `SLB-004.S1` 11-link order, visibility, click update & zero-error check at `e2e/site/select-button-docs.spec.ts:19-85,164`; T003 red / T004 green | met |
