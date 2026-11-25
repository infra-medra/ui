# Proposal: document-radio-button-parity

## Why

`RadioButtonComponent` (`projects/medra/ui/src/lib/radio-button/radio-button.component.ts`) already implements every PrimeNG RadioButton capability (`name`/`value` grouping, `size`, `variant="filled"`, `invalid`, `disabled`, and `ControlValueAccessor` for Signal Forms / Template Driven / Reactive Forms), but `/docs/components/radio-button` documents only the intro and one basic example, without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/radio-button` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 10 RadioButton examples.

## Scope

### In scope
- Triage of PrimeNG RadioButton candidates (`10-radio-button.md`):
  - **Already supported, needs documentation (10 sections):** `Group` (shared `name`, bound value), `Dynamic` (`@for` generated options), `Card` (selectable card layout composed from `<label>` + `med-radio-button`), `Sizes` (`sm`, `default`, `lg`), `Filled` (`variant="filled"`), `Disabled` (`[disabled]`), `Invalid` (`[invalid]`), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`), `Reactive Forms` (`[formControl]`).
  - **Missing in MedraUi:** none.
  - **Not applicable / grouped:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Forms` grouped into the three concrete Angular form examples; `Accessibility` documented via the API reference and native `<input type="radio">` / `aria-invalid` semantics.
- Update `projects/site/src/app/pages/docs/components/radio-button.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 10 sections in order (reusing `RadioButtonBasicDemo` for `Group`).
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/radio-button-docs.spec.ts` (`RDB-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/radio-button/`. If the `Signal Forms` demo exposes a type-compatibility gap with `[formField]` (as happened with `InputNumber` `min`/`max`), it will be raised as a finding and handled in a dedicated library change rather than silently widening scope.

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| radio-button | new | RDB-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/radio-button.page.ts`, `projects/site/src/app/pages/docs/components/demos/radio-button-*.demo.{ts,html}`, `projects/site/src/content/docs/radio-button-*.txt`, `e2e/site/radio-button-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
