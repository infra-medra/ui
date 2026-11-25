# Proposal: document-input-number-parity

## Why

`InputNumberComponent` (`projects/medra/ui/src/lib/input-number/input-number.component.ts`) already implements full functional parity with PrimeNG InputNumber, but `/docs/components/input-number` currently documents only the intro, basic import, and vertical/clear layout. We need to bring `/docs/components/input-number` to the same `EXAMPLES` + "On this page" + prose + interactive demo + code block structure as `AutoComplete` and `DatePicker`.

## What Changes

## Scope

### In scope
- Triage of PrimeNG InputNumber candidates:
  - **Already supported, needs documentation (17 sections):** `Basic`, `Numerals` (`useGrouping`, `minFractionDigits`, `maxFractionDigits`, `min`, `max`), `Locale`, `Currency` (`mode="currency"`, `currency`, `currencyDisplay`), `Prefix & Suffix`, `Buttons` (`showButtons`, `buttonLayout`: `stacked`, `horizontal`, `vertical`), `Clear Icon` (`showClear`), `Float Label`, `Ifta Label`, `Sizes` (`sm`, `default`, `lg`), `Fluid` (`fluid`), `Filled` (`variant="filled"`), `Disabled`, `Invalid`, `Signal Forms`, `Template Driven`, `Reactive Forms`.
  - **Missing in MedraUi (0):** None — all functional features already exist in `InputNumberComponent`.
  - **Not applicable / discarded (4):** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs concepts not used in MedraUi); `Forms` grouped into the three concrete Angular form examples (`Signal Forms`, `Template Driven`, `Reactive Forms`); `Accessibility` documented via the API reference and ARIA attributes (`role="spinbutton"`, `incrementLabel`, `decrementLabel`, `clearLabel`) rather than a separate interactive demo.
- Update `projects/site/src/app/pages/docs/components/input-number.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 17 sections in order.
- Create `.demo.ts` / `.demo.html` pairs and English `.txt` prose files for each new section under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Widen `min` and `max` inputs on `InputNumberComponent` (`projects/medra/ui/src/lib/input-number/input-number.component.ts`) to `number | null | undefined` (normalizing `undefined` to `null`) so Angular Signal Forms `[formField]` binds without type errors or `NaN` clamping, covered by Jest unit tests in `input-number.component.spec.ts` and a `patch` changeset (`.changeset/input-number-signal-forms-bounds.md`).
- Add Playwright real-browser verification in `e2e/site/input-number-docs.spec.ts` (`INN-001.S1`).

### Out of scope
- Adding any new features or visual changes to `InputNumberComponent` beyond the `min`/`max` `undefined` compatibility fix for Signal Forms.

## Track

**Track:** fast
**Rationale:** Documentation parity change (`projects/site/` + `e2e/site/`) plus a minimal `min`/`max` `undefined` type-compatibility fix on `InputNumberComponent` for Signal Forms.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| input-number | new | INN-001, INN-002 |

## Impact

- **Code:** `projects/medra/ui/src/lib/input-number/input-number.component.ts`, `projects/medra/ui/src/lib/input-number/input-number.component.spec.ts`, `projects/site/src/app/pages/docs/components/input-number.page.ts`, `projects/site/src/app/pages/docs/components/demos/input-number-*.demo.{ts,html}`, `projects/site/src/content/docs/input-number-*.txt`, `e2e/site/input-number-docs.spec.ts`, `.changeset/input-number-signal-forms-bounds.md`
- **Interfaces:** Widens `InputNumberComponent.min` and `InputNumberComponent.max` from `number | null` to `number | null | undefined` (backwards-compatible).
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
