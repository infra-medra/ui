# Proposal: enhance-date-picker-parity

## Why

After documenting the 19 already-implemented DatePicker features in `document-date-picker-parity`, 7 PrimeNG DatePicker parity features remain unimplemented in `@medra.dev/ui` and undocumented on `/docs/components/date-picker`: `inline` mode, `showButtonBar` (Today / Clear), `view="year"` (year-only picker with decade paging), `timeOnly` mode, custom `#date` cell template (`DatePickerDateTemplateContext`), `fluid` layout, and `variant="filled"`.

## What Changes

## Scope

### In scope
- Implement `inline`, `showButtonBar` (`todayLabel`, `clearLabel`), `view="year"` (`previousDecadeLabel`, `nextDecadeLabel`), `timeOnly`, `#date` `TemplateRef<DatePickerDateTemplateContext>`, `fluid`, and `variant` (`FieldVariant`) in `DatePickerComponent` and `DatePickerPanelComponent` (`projects/medra/ui/src/lib/date-picker/`).
- Add Jest unit tests in `date-picker.component.spec.ts` and `date-picker-panel.component.spec.ts` covering all new scenarios.
- Add 7 interactive documentation examples (`Inline`, `Button Bar`, `Year Picker`, `Time Only`, `Date Template`, `Fluid`, `Filled`), English `.txt` prose files, and Playwright real-browser checks in `e2e/site/date-picker-docs.spec.ts`.
- Add a `minor` changeset for `@medra.dev/ui`.

### Out of scope
- Changing existing behavior of `single`, `multiple`, `range`, `view="month"`, `navigation="drilldown"`, or `showTime` when the new inputs remain at their defaults.
- Adding any translation service (all new UI labels use inputs with English defaults per Constitution Article VIII).

## Track

**Track:** full
**Rationale:** Adds 7 new public API/template/layout capabilities to `@medra.dev/ui` (`DatePickerComponent` / `DatePickerPanelComponent`), requiring a technical plan, test-first task breakdown, changeset, and real-browser verification.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| date-picker | modified | DTP-017, DTP-018, DTP-019, DTP-020, DTP-021, DTP-022, DTP-023 |

## Impact

- **Code:** `projects/medra/ui/src/lib/date-picker/`, `projects/site/src/app/pages/docs/components/date-picker.page.ts`, `projects/site/src/app/pages/docs/components/demos/`, `projects/site/src/content/docs/`, `e2e/site/date-picker-docs.spec.ts`
- **Interfaces:** New inputs/templates on `DatePickerComponent` (`inline`, `showButtonBar`, `todayLabel`, `view="year"`, `previousDecadeLabel`, `nextDecadeLabel`, `timeOnly`, `#date`, `fluid`, `variant`) and `DatePickerDateTemplateContext` exported from `@medra.dev/ui`
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`)

## Open Questions

None.
