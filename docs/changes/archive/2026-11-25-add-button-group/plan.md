# Plan: add-button-group

## Summary

Implement `ButtonGroupComponent` (`<med-button-group>`) in `projects/medra/ui/src/lib/button-group/` as a standalone `role="group"` container that connects adjacent `button[medButton]` / `a[medButton]` children horizontally with collapsed inner borders, square inner corners, and focus/hover stacking (`z-10`), export it from `@medra.dev/ui`, document it under `Button Group` (`#example-button-group`) on `/docs/components/button`, verify layout and styling in Playwright, and ship a `minor` changeset.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `ButtonGroupComponent` and `ButtonGroupDemo` are standalone components using signal `input`/`computed` with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | `buttonGroupVariants` uses CVA, merges consumer `class` via `mergeClasses`, and preserves `ButtonDirective` dark-mode tokens/borders on grouped children. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | n/a | No overlays or icons added in `ButtonGroupComponent`; docs demo uses `IconComponent` (`<med-icon>`). |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | `ButtonGroupComponent` is a layout/grouping container, not a form input control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | `T001` (`[TEST]`) maps `BTD-002.S1` to Jest unit tests before `T002` implementation, and `T003` (`[TEST]`) + `T004` verify real-browser layout/radii/borders (`BTD-002.S1`, `BTD-003.S1`) in Playwright. |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Host exposes `role="group"`; projected buttons retain native keyboard navigation and `:focus-visible` rings elevated with `z-10` so adjacent buttons never clip focus outlines. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, prose `.txt`, demos, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | `ButtonGroupComponent` introduces no internal UI strings. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds a `minor` changeset (`.changeset/button-group.md`) for `@medra.dev/ui` without changing Angular major or peer ranges. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Jest and Playwright tests tagged `BTD-002.S1` and `BTD-003.S1` assert all Given and Then clauses with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

| Scenario | Level | Target File | Verification |
| --- | --- | --- | --- |
| BTD-002.S1 | Unit + E2E | `projects/medra/ui/src/lib/button-group/button-group.component.spec.ts`, `e2e/site/button-docs.spec.ts` | `role="group"`, `mergeClasses`, inner border/radius utility classes in Jest, and real-browser `getComputedStyle` border-radius checks in Playwright |
| BTD-003.S1 | E2E | `e2e/site/button-docs.spec.ts` | `/docs/components/button` renders `Button Group` (`#example-button-group`), prose, `<med-button-group>` demo, and code block with zero console/hydration errors |

## Architecture & Design

### 1. `ButtonGroupComponent` & Styles (`projects/medra/ui/src/lib/button-group/`)
- `button-group.styles.ts`:
  - Export `buttonGroupVariants = cva(...)` with:
    - `inline-flex items-center`
    - `[&>*:not(:first-child)]:rounded-l-none`
    - `[&>*:not(:last-child)]:rounded-r-none`
    - `[&>*:not(:first-child)]:-ml-px`
    - `[&>*:hover]:z-10 [&>*:focus-visible]:z-10`
- `button-group.component.ts`:
  - `selector: 'med-button-group'`
  - `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`
  - `host: { role: 'group', '[class]': 'hostClass()' }`
  - `readonly class = input('', { alias: 'class' })`
  - `protected readonly hostClass = computed(() => mergeClasses(buttonGroupVariants(), this.class()))`
  - Template: `<ng-content />`
- Export both `ButtonGroupComponent` and `buttonGroupVariants` from `projects/medra/ui/src/public-api.ts`.
- Add `.changeset/button-group.md` (`"@medra.dev/ui": minor`).

### 2. Documentation & E2E (`projects/site/` & `e2e/site/button-docs.spec.ts`)
- Create `projects/site/src/app/pages/docs/components/demos/button-group.demo.{ts,html}` and `projects/site/src/content/docs/button-group.txt`.
- Add `Button Group` (`#example-button-group`) to `EXAMPLES` and template in `projects/site/src/app/pages/docs/components/button.page.ts`.
- Extend `e2e/site/button-docs.spec.ts` to assert all 16 sections (`Button Group` included) and verify real-browser `borderTopRightRadius === '0px'` on the first button and `borderTopLeftRadius === '0px'` on the middle/last buttons inside `<med-button-group>`.

## Decisions

- **CSS-only child selectors on `med-button-group` (`[&>*:...]`):** Avoids coupling `ButtonDirective` to an optional parent injection token while working seamlessly for both `button[medButton]` and `a[medButton]` children.
