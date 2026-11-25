# Proposal: document-select-button-parity

## Why

`SelectButtonComponent` (`projects/medra/ui/src/lib/select-button/select-button.component.ts`) already implements most PrimeNG SelectButton capabilities (single and `multiple` modes, data-driven `options` with `optionLabel`/`optionValue`/`optionDisabled`, `size`, `invalid`, `disabled`, `allowEmpty`, and `ControlValueAccessor` for Signal Forms / Template Driven / Reactive Forms), but `/docs/components/select-button` documents only the intro and two examples, without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/select-button` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for the 9 already-supported examples. The two missing features (custom item template and `fluid`) are handled in a follow-up full-track change.

## Scope

### In scope
- Triage of PrimeNG SelectButton candidates (`15-select-button.md`):
  - **Already supported, needs documentation (9 sections):** `Basic` (single selection), `Multiple` (`multiple`), `Sizes` (`sm`, `default`, `lg`), `Disabled` (`[disabled]` and per-option `disabled`), `Invalid` (`[invalid]`), `Allow Empty` (`allowEmpty`), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`), `Reactive Forms` (`[formControl]`).
  - **Missing in MedraUi (follow-up change `add-select-button-item-template`):** `Template` (custom item content) and `Fluid` (`fluid` input / fluid context).
  - **Not applicable / grouped:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Forms` grouped into the three concrete Angular form examples; `Accessibility` covered by the API reference (`radiogroup`/`group` roles, roving tabindex).
- Update `projects/site/src/app/pages/docs/components/select-button.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with the 9 sections in order (reusing `SelectButtonBasicDemo` and `SelectButtonAllowEmptyDemo`).
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/select-button-docs.spec.ts` (`SLB-001.S1`).

### Out of scope
- Any change to `projects/medra/ui/src/lib/select-button/`. If a Signal Forms demo exposes a `[formField]` type gap, it is raised as a finding and handled in a dedicated library change.
- `Template` and `Fluid` (follow-up change).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| select-button | new | SLB-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/select-button.page.ts`, `projects/site/src/app/pages/docs/components/demos/select-button-*.demo.{ts,html}`, `projects/site/src/content/docs/select-button-*.txt`, `e2e/site/select-button-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
