# Proposal: document-input-text-parity

## Why

`InputTextDirective` (`projects/medra/ui/src/lib/input-text/input-text.directive.ts`) already supports all core PrimeNG InputText capabilities (`size`, `variant="filled"`, `fluid`, `invalid`, native `disabled`, `ControlValueAccessor` for Signal Forms / Template Driven / Reactive Forms, plus `<med-float-label>`, `<med-ifta-label>`, help text, and clear-button composition), but `/docs/components/input-text` currently documents only the intro, basic import, and a combined `Sizes and states` section without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/input-text` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 13 InputText examples.

## Scope

### In scope
- Triage of PrimeNG InputText candidates (`07-input-text.md`):
  - **Already supported, needs documentation (13 sections):** `Basic`, `Clear Icon` (composition with trailing `<med-icon name="x-mark">` clear button), `Filled` (`variant="filled"`), `Float Label` (`<med-float-label>`), `Ifta Label` (`<med-ifta-label>`), `Sizes` (`sm`, `default`, `lg`), `Fluid` (`[fluid]` / `<med-fluid>`), `Help Text` (`aria-describedby` helper `<small>`), `Disabled` (`disabled`), `Invalid` (`[invalid]`), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`), `Reactive Forms` (`[formControl]`).
  - **Not applicable / grouped:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Forms` grouped into the three concrete Angular form examples (`Signal Forms`, `Template Driven`, `Reactive Forms`); `Accessibility` documented via the API reference and native `<input>` / `aria-invalid` / `aria-describedby` semantics.
- Update `projects/site/src/app/pages/docs/components/input-text.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 13 sections in order.
- Create `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/input-text-docs.spec.ts` (`ITX-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/input-text/` (library code and public API are untouched; no changeset required).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| input-text | new | ITX-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/input-text.page.ts`, `projects/site/src/app/pages/docs/components/demos/input-text-*.demo.{ts,html}`, `projects/site/src/content/docs/input-text-*.txt`, `e2e/site/input-text-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
