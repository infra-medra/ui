# Proposal: document-date-picker-parity

## Why

The `/docs/components/date-picker` documentation page currently exposes only 3 examples (`Basic`, `Time selection`, and `Multiple dates and month-only picking`) with no `EXAMPLES` "On this page" navigation, leaving most of `DatePickerComponent`'s existing capabilities (`dateFormat`, `locale`, `minDate`/`maxDate`/`disabledDates`/`disabledDays`, `selectionMode="range"`/`"multiple"`, `view="month"`, `numberOfMonths`, `navigation="drilldown"`, `showClear`, `size`, `disabled`, `invalid`, `FloatLabel`, `IftaLabel`, and Signal/Template-Driven/Reactive Forms) undocumented.

## What Changes

- Update `projects/site/src/app/pages/docs/components/date-picker.page.ts` to follow the `EXAMPLES` + `<app-component-doc [examples]="examples">` structure used by `AutoComplete` and `Select`.
- Document all currently implemented `DatePickerComponent` features with English prose (`content/docs/date-picker-*.txt`), live demos (`demos/date-picker-*.demo.ts`/`.html`), and code blocks:
  - **Documented (already supported):** Basic, Format, Locale, Min / Max & Disabled Dates, Multiple, Range, Time, Month Picker, Multiple Months, Drilldown Navigation, Clear Icon, Sizes, Disabled, Invalid, Float Label, Ifta Label, Signal Forms, Template Driven, Reactive Forms.
  - **Deferred to Change 2 (`enhance-date-picker-parity`):** Inline, Button Bar, Year Picker, Time Only, Date Template, Fluid, Filled.
  - **Discarded (N/A):** Pass Through, Styled/Unstyled, Document (per `00-briefing-comum.md`).
- Add Playwright e2e verification in `e2e/site/date-picker-docs.spec.ts` verifying the "On this page" navigation, live demos, and code blocks.

## Scope

### In scope

- `projects/site/src/app/pages/docs/components/date-picker.page.ts`, `projects/site/src/app/pages/docs/components/demos/date-picker-*.demo.*`, and `projects/site/src/content/docs/date-picker-*.txt`.
- `e2e/site/date-picker-docs.spec.ts` verifying every documented section renders prose, a live demo, and a code block, plus interactive smoke checks.

### Out of scope

- New library features in `projects/medra/ui/src/lib/date-picker/` (Inline, Button Bar, Year Picker, Time Only, Date Template, Fluid, Filled) — deferred to follow-up change `enhance-date-picker-parity`.

## Track

**Track:** fast
**Rationale:** Documentation-only parity pass for already-implemented `DatePickerComponent` features in `projects/site`, plus e2e coverage; no library API or breaking changes.
**Security:** not-relevant
**Security rationale:** Static documentation prose, client-side demo components, and Playwright tests; no external input parsing, storage, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `date-picker` | modified | DTP-016 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/date-picker.page.ts`, new demo/prose files under `projects/site/`, and `e2e/site/date-picker-docs.spec.ts`.
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
