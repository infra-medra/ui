# Plan: add-select-button-item-template

## Summary

Add optional `<ng-template #item>` template projection (`itemTemplate` `contentChild`) to `SelectButtonComponent` rendered inside each option `<button>` via `NgTemplateOutlet` with context `{ $implicit: option, selected, index }` (falling back to `option.label`), export `SelectButtonItemContext<T>`, add a `fluid` boolean input (also reading optional `MED_FLUID_CONTEXT`) that switches the host to `block w-full`, group to `flex w-full`, and option buttons to `flex-1 justify-center`, document `Template` and `Fluid` on `/docs/components/select-button` (11 sections total), verify in Jest and Playwright, and ship a `minor` changeset.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `SelectButtonComponent` and the new doc demos are standalone and use signal `input`, `contentChild`, and `computed` with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Option buttons continue using `buttonVariants` tokens and `mergeClasses`; `fluid` only adds `block w-full` / `flex w-full` / `flex-1 justify-center` layout classes. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | No overlays added; `SelectButtonTemplateDemo` uses `<med-icon>` (`IconComponent`) registered in `app.config.ts`. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | pass | Existing `ControlValueAccessor` and field states (`disabled`, `invalid`, etc.) are preserved unchanged. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | `T001` (`[TEST]`) maps `SLB-002.S1` and `SLB-003` unit behavior to Jest before `T002`; `T003` (`[TEST]`) + `T004` verify `SLB-003.S1` and `SLB-004.S1` in Playwright. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Custom `#item` content renders inside native `<button>` with `role="radio"`/`aria-checked` (single) or `aria-pressed` (multiple), preserving roving tabindex and arrow-key navigation. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, prose `.txt`, demos, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No new internal UI strings added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds a `minor` changeset (`.changeset/select-button-item-template-fluid.md`) for `@medra.dev/ui`. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Jest and Playwright tests tagged `SLB-002.S1`, `SLB-003.S1`, and `SLB-004.S1` assert all Given and Then clauses with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

| Scenario | Level | Target File | Verification |
| --- | --- | --- | --- |
| SLB-002.S1 | Unit | `projects/medra/ui/src/lib/select-button/select-button.component.spec.ts` | `#item` renders custom markup inside each option button with `{ $implicit: option, selected, index }`, updating `aria-checked` and bound value on click and arrow keys |
| SLB-003.S1 | Unit + E2E | `select-button.component.spec.ts`, `e2e/site/select-button-docs.spec.ts` | `<med-select-button fluid>` fills its container with equal-width options while default remains narrower |
| SLB-004.S1 | E2E | `e2e/site/select-button-docs.spec.ts` | `/docs/components/select-button` renders 11 `#example-*` links in order and `Template`/`Fluid` prose, demos, and code blocks |

## Architecture & Design

### 1. `SelectButtonComponent` (`projects/medra/ui/src/lib/select-button/select-button.component.ts`)
- Export `export interface SelectButtonItemContext<T = unknown> { $implicit: SelectOption<T>; selected: boolean; index: number; }` and re-export from `public-api.ts` if needed.
- Add `readonly itemTemplate = contentChild<TemplateRef<SelectButtonItemContext<T>>>('item');` and import `NgTemplateOutlet` + `TemplateRef`.
- Inside `<button #optionButton>`, render `@if (itemTemplate(); as tpl) { <ng-container *ngTemplateOutlet="tpl; context: { $implicit: option, selected: isSelected(option.value), index: i }" /> } @else { {{ option.label }} }`.
- Inject `private readonly fluidContext = inject(MED_FLUID_CONTEXT, { optional: true });` and add `readonly fluid = input(false, { transform: booleanAttribute });`.
- Compute `protected readonly isFluid = computed(() => this.fluid() || (this.fluidContext?.() ?? false));`.
- Bind host `[class.block]="isFluid()"` and `[class.w-full]="isFluid()"` and `[class.inline-block]="!isFluid()"`, group `flex w-full` when `isFluid()`, and option button `flex-1 justify-center` when `isFluid()`.

### 2. Documentation & E2E (`projects/site/`, `e2e/site/`)
- Add `select-button-template.demo.{ts,html}`, `select-button-fluid.demo.{ts,html}`, and English `.txt` prose files.
- Update `select-button.page.ts` `EXAMPLES` to 11 entries (`Template` after `Multiple`, `Fluid` after `Sizes`).

## Decisions

- **Context shape `{ $implicit: option, selected, index }`:** Matches Angular `ngTemplateOutlet` idioms so `let-option` works out of the box alongside `let-selected="selected"`.
