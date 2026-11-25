# Plan: enhance-date-picker-parity

## Summary

Implement the 7 remaining PrimeNG DatePicker parity features (`inline`, `showButtonBar`, `view="year"`, `timeOnly`, `#date` template, `fluid`, `variant="filled"`) in `DatePickerComponent` and `DatePickerPanelComponent`, document all 7 features with interactive demos and English prose on `/docs/components/date-picker`, verify them in Jest and Playwright, and ship a `minor` changeset for `@medra.dev/ui`.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | Standalone components (`DatePickerComponent`, `DatePickerPanelComponent`, docs demos) using signal `input`/`output`/`computed`/`viewChild`/`contentChild` and `@if`/`@switch`/`@for` with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Styled via design tokens and CVA (`inputTextVariants`, `dayCellVariants`, `monthCellVariants`), consumer `class` merged via `mergeClasses`, and `dark:` variants defined for button bar, decade grid, and inline panel. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | Overlay mode continues using `OverlayService` + focus trap; inline mode embeds `DatePickerPanelComponent` directly; all icons use `IconComponent`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | pass | `DatePickerComponent` implements `ControlValueAccessor` across `inline`, `view="year"`, `timeOnly`, and `showButtonBar`, handling `null` vs `Date` / `[]` / `{ start: null, end: null }` and all five field states (`default`, `hover`, `focus`, `disabled`, `invalid`). |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | Jest unit test tasks (`date-picker.component.spec.ts`, `date-picker-panel.component.spec.ts`) are ordered before implementation tasks; CSS/layout scenarios (`DTP-022.S1`, `DTP-023.S1`, `DTP-017.S1`, `DTP-017.S2`) are verified in Playwright real browser. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Year decade grid uses `role="grid"`, `role="gridcell"`, `aria-selected`, `aria-disabled`, `aria-activedescendant`, and keyboard arrow navigation; button bar buttons use `<button type="button">` with focus-visible rings and accessible labels. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, comments, TSDoc, prose `.txt` files, demos, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | pass | All new UI strings (`todayLabel`, `clearLabel`, `previousDecadeLabel`, `nextDecadeLabel`) are overridable via inputs with English defaults, with no translation service. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds a `minor` changeset for `@medra.dev/ui` without changing the Angular major version or peer ranges. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Every Jest and Playwright test tagged with a scenario ID asserts all Given and Then clauses of that scenario with defaults left unset where the scenario relies on them. |

## Complexity Tracking

None.

## Test Strategy

| Scenario | Level | Target File | Verification |
| --- | --- | --- | --- |
| DTP-017.S1 | Unit + E2E | `date-picker.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | Inline panel renders without `<input>`/`toggle`, updates value on day click, stays open |
| DTP-017.S2 | Unit + E2E | `date-picker.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `document.activeElement` is not moved into inline panel on mount |
| DTP-018.S1 | Unit + E2E | `date-picker.component.spec.ts`, `date-picker-panel.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `showButtonBar` Today selects today & Clear resets value |
| DTP-019.S1 | Unit + E2E | `date-picker.component.spec.ts`, `date-picker-panel.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `view="year"` opens on year grid, pages decades, commits Jan 1 of year, formats `yyyy` |
| DTP-020.S1 | Unit + E2E | `date-picker.component.spec.ts`, `date-picker-panel.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `timeOnly` hides calendar grids, renders only time controls, formats time |
| DTP-021.S1 | Unit + E2E | `date-picker.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `#date` template renders inside day cells with context and preserves click selection |
| DTP-022.S1 | Unit + E2E | `date-picker.component.spec.ts`, `e2e/site/date-picker-docs.spec.ts` | `variant="filled"` applies filled surface styling; `fluid` adds `med-date-picker-fluid` and 100% container width |
| DTP-023.S1 | E2E | `e2e/site/date-picker-docs.spec.ts` | `/docs/components/date-picker` renders all 26 sections visibly with non-empty code blocks and zero console/hydration errors |

## Architecture & Design

### 1. Types & Exports (`projects/medra/ui/src/lib/date-picker/date-picker.types.ts`)
- Add `DatePickerView = 'date' | 'month' | 'year'`.
- Add `DatePickerDateTemplateContext`:
  ```ts
  export interface DatePickerDateTemplateContext {
    $implicit: Date;
    date: number;
    month: number;
    year: number;
    today: boolean;
    selected: boolean;
    disabled: boolean;
    selectable: boolean;
    outsideMonth: boolean;
  }
  ```

### 2. `DatePickerPanelComponent` (`date-picker-panel.component.ts` & `date-picker.styles.ts`)
- **Inputs / Outputs:**
  - `pickerView = input<DatePickerView>('date')`
  - `autoFocus = input(true, { transform: booleanAttribute })`: skips initial `.focus()` in `ngAfterViewInit()` when `false` (`inline` mode).
  - `disabled = input(false, { transform: booleanAttribute })`: disables interaction and applies disabled styling when `true`.
  - `showButtonBar = input(false, { transform: booleanAttribute })`
  - `todayLabel = input('Today')`
  - `clearLabel = input('Clear')`
  - `previousDecadeLabel = input('Previous decade')`
  - `nextDecadeLabel = input('Next decade')`
  - `timeOnly = input(false, { transform: booleanAttribute })`
  - `dateTemplate = input<TemplateRef<DatePickerDateTemplateContext> | null>(null)`
  - `clearRequested = output<void>()`
- **Button Bar (`DTP-018`):** Footer row rendered when `showButtonBar()` is `true` with Today (`todayLabel()`) and Clear (`clearLabel()`) buttons. Today commits today's date (when selectable) and closes overlay unless `inline` or `showTime`. Clear emits `clearRequested`.
- **Year-Only View (`DTP-019`):** When `pickerView() === 'year'`, `ngAfterViewInit()` initializes `view.set('year')`. In `navigation="calendar"`, renders a 12-year decade `role="grid"` with prev/next decade buttons (`previousDecadeLabel()`, `nextDecadeLabel()`). Selecting a year commits `new Date(year, 0, 1)`.
- **Time-Only Mode (`DTP-020`):** When `timeOnly()` is `true`, hides calendar grids and renders only the time controls row; adjusting hour/minute/period emits `dateSelect` with a `Date` carrying the chosen time.
- **Custom `#date` Template (`DTP-021`):** Renders `<ng-container *ngTemplateOutlet="dateTemplate()!; context: dayTemplateContext(cell)" />` inside each day cell when provided.

### 3. `DatePickerComponent` (`date-picker.component.ts`)
- **New Inputs / Queries:** `inline`, `showButtonBar`, `todayLabel`, `view: DatePickerView`, `previousDecadeLabel`, `nextDecadeLabel`, `timeOnly`, `variant: FieldVariant`, `fluid`, and `dateTemplate = contentChild<TemplateRef<DatePickerDateTemplateContext>>('date')`.
- **Inline Rendering (`DTP-017`):** When `inline()` is `true`, renders `<med-date-picker-panel ... [autoFocus]="false" [disabled]="isDisabled()" />` directly in the host without `<input>` or overlay trigger, and does not close on selection/clear.
- **Formatting & ReadOnly (`DTP-019`, `DTP-020`):** `readOnly` includes `timeOnly() || view() !== 'date'`; `displayText()` formats `yyyy` for `view() === 'year'` and `formatTime(date, hourFormat())` for `timeOnly()`.
- **Fluid & Filled (`DTP-022`):** Passes `variant: this.variant()` to `inputTextVariants`, and sets host class `relative block w-full med-date-picker-fluid` when `fluid()` is `true`.

### 4. Documentation & Changeset (`DTP-023`)
- Add 7 demos (`Inline`, `Button Bar`, `Year Picker`, `Time Only`, `Date Template`, `Fluid`, `Filled`) and `.txt` files to `projects/site/src/app/pages/docs/components/date-picker.page.ts`, `demos/`, and `projects/site/src/content/docs/`.
- Extend `e2e/site/date-picker-docs.spec.ts` to cover all 26 sections and real-browser layout/interaction checks.
- Add `.changeset/date-picker-parity.md` (`"@medra.dev/ui": minor`).

## Decisions

- **Inline focus guard via `autoFocus` input:** Rather than special-casing DOM ancestry inside `DatePickerPanelComponent`, an explicit `autoFocus = input(true)` keeps the panel pure and testable while preventing focus stealing on inline mount.
- **Keep `timeOnly` and `view="year"` as `readOnly` inputs:** Consistent with `showTime`, `view="month"`, `multiple`, and `range` documented cuts, avoiding fragile free-text time/year parsing.
