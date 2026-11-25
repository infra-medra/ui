# Plan: add-dialog-modal

## Summary

Add `modal` (`boolean`, default `true`) to `DialogComponent`, `DialogOptions` (`DialogService.open()`), and `DialogShellComponent` so dialogs can open without a modal backdrop or focus trap (`hasBackdrop: false`, `aria-modal` omitted, `closeOnOutsideClick` governed by `dismissableMask`), document `Without Modal` (`#example-without-modal`) on `/docs/components/dialog`, verify non-modal behavior in Jest and Playwright, and ship a `minor` changeset.

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| I | Does every new or changed class in this change use standalone declarations and signal APIs, with no NgModule and no reliance on zone.js? | pass | `DialogComponent`, `DialogShellComponent`, and `DialogWithoutModalDemo` are standalone and use signal `input`/`model`/`computed` with no NgModule or zone.js reliance. |
| II | Does every styled element in this change use design tokens and CVA, merge the consumer `class` through the shared helper, and define its dark-mode appearance under the `dark` class? | pass | Existing dialog surface tokens (`bg-surface-0 dark:bg-surface-800`, `shadow-overlay-lg`) and `mergeClasses` are preserved unchanged. |
| III | Does every overlay and icon in this change reuse the shared OverlayService, focus trap and icon wrapper instead of a private implementation? | pass | Reuses `OverlayService.openGlobal` / `openGlobalTemplate` (`hasBackdrop`, `trapFocus`, `closeOnOutsideClick`) directly. |
| IV | Does every input component in this change implement ControlValueAccessor, handle falsy values distinctly from null/undefined, and define all five field states? | n/a | Dialog is an overlay/presentation component, not a form control. |
| V | Does each scenario map to a Jest test task ordered before its implementation task, and is every layout- or CSS-dependent scenario assigned a real-browser verification? | pass | `T001` (`[TEST]`) maps `DLD-002.S1` to Jest unit tests before `T002`, and `T003` (`[TEST]`) + `T004` verify non-modal backdrop/interactivity in Playwright (`DLD-002.S1`, `DLD-003.S1`). |
| VI | Does the plan specify ARIA roles, keyboard interactions, focus visibility and contrast for each interactive element, with a test or check for each? | pass | `role="dialog"` keeps `aria-modal="true"` when `modal` is `true` and omits `aria-modal` when `modal` is `false`; Escape dismissal (`closeOnEscape`) remains active. |
| VII | Is every piece of logic, prose, example and icon in this change original, and is all text added or changed outside `roadmap/` written in English? | pass | All code, TSDoc, prose `.txt`, demos, and tests are original and written in English. |
| VIII | Is every internal UI string in this change overridable through an input or per-call field with an English default, and does the change add no translation service? | n/a | No new UI strings added. |
| X | Does this change keep the `@medra.dev/ui` major equal to the repository's Angular major, use no `major` changeset unless it also moves the Angular baseline, and keep the peer ranges on that Angular major? | pass | Adds a `minor` changeset (`.changeset/dialog-modal.md`) for `@medra.dev/ui` without changing Angular major or peer ranges. |
| XI | Does every test tagged with a scenario ID assert each Given and Then clause of that scenario, with defaults left unset where the scenario relies on them? | pass | Jest and Playwright tests tagged `DLD-002.S1` and `DLD-003.S1` assert all Given and Then clauses with defaults left unset. |

## Complexity Tracking

None.

## Test Strategy

| Scenario | Level | Target File | Verification |
| --- | --- | --- | --- |
| DLD-002.S1 | Unit + E2E | `dialog.component.spec.ts`, `dialog.service.spec.ts`, `e2e/site/dialog-docs.spec.ts` | `[modal]="false"` / `modal: false` opens without `.cdk-overlay-backdrop`, omits `aria-modal`, and leaves outside elements clickable |
| DLD-003.S1 | E2E | `e2e/site/dialog-docs.spec.ts` | `/docs/components/dialog` renders `Without Modal` (`#example-without-modal`), prose, demo, and code block with zero console/hydration errors |

## Architecture & Design

### 1. `DialogComponent` (`projects/medra/ui/src/lib/dialog/dialog.component.ts`)
- Add `readonly modal = input(true, { transform: booleanAttribute });`.
- Update the inline `<ng-template #panelTemplate>` `role="dialog"` host element:
  - `[attr.aria-modal]="modal() ? 'true' : null"` (instead of hardcoded `aria-modal="true"`).
- In `open()`:
  - Pass `hasBackdrop: this.modal()`, `closeOnBackdropClick: this.dismissableMask()`, and `closeOnOutsideClick: this.dismissableMask()` to `this.overlayService.openGlobalTemplate(...)`.

### 2. `DialogService` & `DialogShellComponent` (`dialog.service.ts`, `dialog-shell.component.ts`, `dialog.tokens.ts`)
- Add `modal?: boolean;` (`Default: true`) to `DialogOptions` in `dialog.service.ts` (and `DialogShellData` / `DialogShellComponent` options).
- In `DialogService.open()`:
  - Pass `modal: options.modal ?? true` to `DialogShellComponent`.
  - Pass `hasBackdrop: options.modal ?? true`, `closeOnBackdropClick: options.dismissableMask`, and `closeOnOutsideClick: options.dismissableMask` to `this.overlayService.openGlobal(...)`.
- In `DialogShellComponent` host bindings:
  - Change `'aria-modal': 'true'` to `'[attr.aria-modal]': 'modal ? "true" : null'` where `protected readonly modal = this.options.modal ?? true;`.

### 3. Documentation, E2E & Changeset (`DLD-003`)
- Create `projects/site/src/app/pages/docs/components/demos/dialog-without-modal.demo.{ts,html}` and `projects/site/src/content/docs/dialog-without-modal.txt`.
- Add `Without Modal` (`#example-without-modal`) to `EXAMPLES` and template in `projects/site/src/app/pages/docs/components/dialog.page.ts`.
- Extend `e2e/site/dialog-docs.spec.ts` to assert all 10 sections and verify `Without Modal` opens `role="dialog"` with zero `.cdk-overlay-backdrop`, no `aria-modal`, and clickable outside elements.
- Add `.changeset/dialog-modal.md` (`"@medra.dev/ui": minor`).

## Decisions

- **Map `dismissableMask` to both `closeOnBackdropClick` and `closeOnOutsideClick`:** Ensures `dismissableMask: false` prevents outside-click dismissal in non-modal mode just as it prevents backdrop-click dismissal in modal mode, leveraging `OverlayService`'s existing `closeOnOutsideClick` option.
