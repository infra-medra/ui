# Proposal: document-checkbox-parity

## Why

`CheckboxComponent` (`projects/medra/ui/src/lib/checkbox/checkbox.component.ts`) already implements binary and array-group modes (`binary`, `value`, `trueValue`, `falseValue`), `indeterminate`, `size`, `variant="filled"`, `disabled`, `readonly`, `invalid`, and `ControlValueAccessor` (Signal Forms, Template Driven, Reactive Forms), but `/docs/components/checkbox` currently documents only the intro, basic import, and two grouped sections (`Sizes and states`, `Group-by-array and custom true/false values`) without `EXAMPLES` or "On this page" anchor navigation.

## What Changes

Structure `/docs/components/checkbox` with `EXAMPLES` ("On this page" anchor navigation), English `.txt` prose, interactive demos, and code blocks for all 11 Checkbox examples.

## Scope

### In scope
- Triage of PrimeNG Checkbox candidates (`13-checkbox.md`):
  - **Already supported, needs documentation (11 sections):** `Basic`, `Group` (array group & custom `trueValue`/`falseValue`, reusing `CheckboxGroupDemo`), `Indeterminate` (`[indeterminate]`), `Dynamic` (`@for` dynamic category checkboxes), `Sizes` (`sm`, `default`, `lg`), `Filled` (`variant="filled"`), `Disabled` (`[disabled]`), `Invalid` (`[invalid]`), `Signal Forms` (`[formField]`), `Template Driven` (`[(ngModel)]`), `Reactive Forms` (`[formControl]`).
  - **Not applicable / grouped:** `Pass Through`, `Styled`, `Unstyled`, `Document` (PrimeNG theming/internal docs); `Forms` grouped into the three concrete Angular form examples (`Signal Forms`, `Template Driven`, `Reactive Forms`); `Indicator` (PrimeNG custom indicator slot — `CheckboxComponent` renders `<med-icon name="check" />` / `<med-icon name="minus" />` built-in); `Accessibility` documented via the API reference and native `<input type="checkbox">` / `aria-invalid` semantics.
- Update `projects/site/src/app/pages/docs/components/checkbox.page.ts` to use `<app-component-doc [examples]="examples">` and `EXAMPLES` with all 11 sections in order.
- Create missing `.demo.ts` / `.demo.html` pairs and English `.txt` prose files under `projects/site/src/app/pages/docs/components/demos/` and `projects/site/src/content/docs/`.
- Add Playwright real-browser verification in `e2e/site/checkbox-docs.spec.ts` (`CKB-001.S1`).

### Out of scope
- Any changes to `projects/medra/ui/src/lib/checkbox/` (library code and public API are untouched; no changeset required).

## Track

**Track:** fast
**Rationale:** Documentation-only parity change (`projects/site/` + `e2e/site/`) with zero library code changes.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| checkbox | new | CKB-001 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/checkbox.page.ts`, `projects/site/src/app/pages/docs/components/demos/checkbox-*.demo.{ts,html}`, `projects/site/src/content/docs/checkbox-*.txt`, `e2e/site/checkbox-docs.spec.ts`
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
