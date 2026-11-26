# Review: document-slider-parity — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 1
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

Every touched requirement is implemented and every scenario has a test that asserts its Given and Then clauses. The suite is green, TDD evidence is complete, and no test file was weakened. The vertical layout, the pointer mapping (`rect.bottom - clientY` against `rect.height`) and the 14-section docs page match SLD-001 and SLD-005. Horizontal output keeps the same class set and the same `left`/`width` inline styles, so it renders as before. The one finding is minor: the SLD-004.S1 host puts the `disabled` attribute on a `[formControl]` element, which makes Angular log a dev-mode warning on every run.

## Findings

### F-01 [minor] SLD-004.S1 host triggers Angular's reactive-forms `disabled` attribute warning

**Where:** `projects/medra/ui/src/lib/slider/slider.component.spec.ts:466-473` · SLD-004 / T002
**Problem:** `DisabledHostComponent` uses `<med-slider disabled [formControl]="volume" />`. The static `disabled` attribute also binds to `FormControlDirective`'s `disabled` input, and in dev mode that input logs "It looks like you're using the disabled attribute with a reactive form directive…". This warning is the excerpt recorded as T003's red evidence ("Specify the `disabled` property at control creation time"), so it shows up in the test output on every run. The test still checks the scenario, because `isDisabled()` reads the component's own `disabled` input. The cost is noise that can hide real warnings.
**Fix:** Pick one way to disable the slider. Either keep the component's `disabled` input and drop `[formControl]` (write 50 with `writeValue` and spy on `registerOnChange`), or keep `[formControl]` and disable it with `new FormControl<SliderValue>({ value: 50, disabled: true })`. Do not combine the two.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `SLD-001` | `e2e/site/slider-docs.spec.ts:32` (SLD-001.S1) checks the 14 TOC links and their labels in order, the section ids in order, non-empty prose, a visible demo and a non-empty code block per section, no console errors or hydration messages, ArrowRight on the Basic, Signal Forms, Template Driven and Reactive Forms demos, and the Controlled buttons. The page is `projects/site/src/app/pages/docs/components/slider.page.ts`. T001 red, T006 green | met |
| `SLD-002` | `slider.component.spec.ts:475` (SLD-002.S1): value 50, then ArrowRight, then the control value and `aria-valuenow` are 51. T001 red, T002 green | met |
| `SLD-003` | `slider.component.spec.ts:489` (SLD-003.S1): `{start: 20, end: 40}`, then End on the start thumb, then the value is `{start: 40, end: 40}`. T002 green | met |
| `SLD-004` | `slider.component.spec.ts:503` (SLD-004.S1): `aria-disabled="true"`, then ArrowRight and End, then the value stays 50. T002 green; see F-01 | met |
| `SLD-005` | `slider.component.spec.ts:549` (S1: thumb `bottom: 30%`, fill `bottom: 0%`/`height: 30%`), `:564` (S2: default min/max, a press 25% from the top gives 75), and `e2e/site/slider-vertical.spec.ts:5` (S3: track taller than wide, an upward drag raises `aria-valuenow`). The implementation is in `slider.component.ts` (`fillStyle`, `thumbStyle`, `valueFromPointer`) and the `orientation` variants in `slider.styles.ts`; the `.changeset/slider-vertical.md` changeset is `minor`. T003/T004 red, T005/T006 green | met |
