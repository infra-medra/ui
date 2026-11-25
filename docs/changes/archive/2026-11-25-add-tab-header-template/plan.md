# Plan: add-tab-header-template

## Summary

Add optional `<ng-template #header>` template projection to `TabComponent` (`headerTemplate` `contentChild`) and render it inside `TabsComponent`'s `role="tab"` buttons via `NgTemplateOutlet`, widen `TabComponent.header` from `input.required<string>()` to `input('')`, exclude `headerTemplate` from lazy `contentTemplate` resolution so `#header` works cleanly alongside both eager `<ng-content />` and lazy `<ng-template>` panels, document `Template` (`#example-template`) on `/docs/components/tabs`, verify in Jest and Playwright, and ship a `minor` changeset.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `TabComponent`, `TabsComponent`, and `TabsTemplateDemo` are standalone and use signal `input`/`contentChild`/`contentChildren`/`computed` with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Existing `tabButtonClass` tokens (`border-brand-500`, `dark:border-brand-400`, `text-surface-*`) are preserved; `NgTemplateOutlet` renders inside the existing `button[role="tab"]` flex/inline-flex layout. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | No overlays added; `TabsTemplateDemo` uses `<med-icon>` (`IconComponent`). |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | Tabs is a navigation/layout widget, not a form input control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | `T001` (`[TEST]`) maps `TBD-002.S1` to Jest unit tests before `T002`, and `T003` (`[TEST]`) + `T004` verify custom-header tab rendering and panel switching in Playwright (`TBD-002.S1`, `TBD-003.S1`). |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | Custom `#header` content renders inside native `button[role="tab"]`, preserving `aria-selected`, `aria-controls`, roving `tabindex`, and `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard navigation. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, prose `.txt`, demos, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No new internal UI strings added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds a `minor` changeset (`.changeset/tabs-header-template.md`) for `@medra.dev/ui` without changing Angular major or peer ranges. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Jest and Playwright tests tagged `TBD-002.S1` and `TBD-003.S1` assert all Given and Then clauses with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

| Scenario | Level | Target File | Verification |
| --- | --- | --- | --- |
| TBD-002.S1 | Unit + E2E | `projects/medra/ui/src/lib/tabs/tabs.component.spec.ts`, `e2e/site/tabs-docs.spec.ts` | `#header` renders inside `button[role="tab"]` alongside both eager `<ng-content />` and lazy `<ng-template>` panels, and switching tabs updates `aria-selected` & visible `role="tabpanel"` |
| TBD-003.S1 | E2E | `e2e/site/tabs-docs.spec.ts` | `/docs/components/tabs` renders `Template` (`#example-template`), prose, custom-header demo, and code blocks with zero console/hydration errors |

## Architecture & Design

### 1. `TabComponent` (`projects/medra/ui/src/lib/tabs/tab.component.ts`)
- Change `readonly header = input.required<string>();` to `readonly header = input('');`.
- Add `readonly headerTemplate = contentChild<TemplateRef<void>>('header');`.
- Query `private readonly allTemplates = contentChildren(TemplateRef);` and compute:
  ```ts
  protected readonly contentTemplate = computed(() => {
    const header = this.headerTemplate();
    return this.allTemplates().find((template) => template !== header) ?? null;
  });
  ```
  This ensures `<ng-template #header>` is never treated as the lazy panel body template, while preserving lazy `<ng-template>` support both with and without `#header`.

### 2. `TabsComponent` (`projects/medra/ui/src/lib/tabs/tabs.component.ts`)
- Import `NgTemplateOutlet` from `@angular/common`.
- Inside `button[role="tab"]`:
  - Add `inline-flex items-center gap-2` to `tabButtonClass` so icon/badge `#header` templates align cleanly.
  - Render:
    ```html
    @if (tab.headerTemplate(); as headerTemplate) {
      <ng-container [ngTemplateOutlet]="headerTemplate" />
    } @else {
      {{ tab.header() }}
    }
    ```

### 3. Documentation, E2E & Changeset (`TBD-003`)
- Create `projects/site/src/app/pages/docs/components/demos/tabs-template.demo.{ts,html}` (using registered `<med-icon>` icons + `<med-badge>` or badge pill + `<ng-template #header>`) and `projects/site/src/content/docs/tabs-template.txt`.
- Add `Template` (`#example-template`) to `EXAMPLES` and template in `projects/site/src/app/pages/docs/components/tabs.page.ts`.
- Extend `e2e/site/tabs-docs.spec.ts` to assert all 7 sections and verify `Template` renders custom `#header` content inside `role="tab"` and switches panels on click.
- Add `.changeset/tabs-header-template.md` (`"@medra.dev/ui": minor`).

## Decisions

- **Exclude `headerTemplate` via `contentChildren(TemplateRef)` + `.find(t => t !== header)`:** Keeps lazy `<ng-template>` opt-in syntax unchanged (no extra `lazy` input or `#content` rename required) while preventing `#header` from colliding with `contentTemplate`.
