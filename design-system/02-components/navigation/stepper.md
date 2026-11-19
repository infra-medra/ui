## Component: Stepper

### Description
`Stepper` (`<med-stepper>`) is a multi-step wizard: it reuses `<med-steps>` unchanged for its own header row (instead of a second parallel step-indicator), plus Next/Back navigation buttons and one content panel per step declared as real content children (`<med-step-panel label="...">`, the same declared-content-children shape `<med-tab>` uses inside `<med-tabs>`). `projects/medra/ui/src/lib/stepper/stepper.component.ts:6-13`

### Variants
| Variant | When to use |
|---|---|
| `linear` (`false`, default) | Any step header is clickable at any time (subject to per-panel `disabled`). |
| `linear` (`true`) | Header items with an index greater than `activeIndex` are disabled — users can still click back to an already-visited step, but can't jump ahead of the current one. Maps onto `StepsComponent`'s existing per-item `disabled`, not its `readonly` (which would block both directions). `projects/medra/ui/src/lib/stepper/stepper.component.ts:15-24,67-72` |
| `showNavigation` (`true`, default) | Renders the Back/Next/Finish button row. |
| `showNavigation` (`false`) | Hides the button row — consumer drives step advancement externally via `[(activeIndex)]`. `projects/medra/ui/src/lib/stepper/stepper.component.ts:43-48,54` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `activeIndex` | `model<number>` | `0` | Two-way bindable current step index. `projects/medra/ui/src/lib/stepper/stepper.component.ts:52` |
| `linear` | `boolean` (`booleanAttribute`) | `false` | See Variants. `projects/medra/ui/src/lib/stepper/stepper.component.ts:53` |
| `showNavigation` | `boolean` (`booleanAttribute`) | `true` | See Variants. `projects/medra/ui/src/lib/stepper/stepper.component.ts:54` |
| `ariaLabel` | `string` | `'Stepper'` | Passed through to the internal `<med-steps>`. `projects/medra/ui/src/lib/stepper/stepper.component.ts:57` |
| `backLabel` | `string` | `'Back'` | Back button text. `projects/medra/ui/src/lib/stepper/stepper.component.ts:58` |
| `nextLabel` | `string` | `'Next'` | Next button text (non-last step). `projects/medra/ui/src/lib/stepper/stepper.component.ts:59` |
| `completeLabel` | `string` | `'Finish'` | Next button text on the last step. `projects/medra/ui/src/lib/stepper/stepper.component.ts:60` |
| `completed` (output) | `EventEmitter<void>` | — | Emitted instead of advancing when Next is clicked on the last step. `projects/medra/ui/src/lib/stepper/stepper.component.ts:63,91-97` |

`StepPanelComponent` (`<med-step-panel>`, content child, **not meant to be set directly by consumers**): `label` (`input.required<string>`), `disabled` (`input(false)`). `projects/medra/ui/src/lib/stepper/step-panel.component.ts:31-32`

### States
| State | Visual | Behavior |
|---|---|---|
| Completed/Active/Upcoming (header) | Same visual states as `Steps` (reused unchanged). | — |
| Active panel | Visible (`[hidden]="!active()"`), driven one-directionally by the parent via `panel.active.set(i === active)`. | `projects/medra/ui/src/lib/stepper/step-panel.component.ts:23-25`, `projects/medra/ui/src/lib/stepper/stepper.component.ts:77-83` |
| Inactive panel | `hidden` attribute. | — |
| Disabled panel | Header item disabled (composes with `linear`'s own disabling — either reason disables that header item); Next does **not** auto-skip a disabled panel — advancing by one step only blocks *jumping to it via the header*. | `projects/medra/ui/src/lib/stepper/stepper.component.ts:26-30,67-72` |
| Can't go back (first step) | Back button `[disabled]`. | `projects/medra/ui/src/lib/stepper/stepper.component.ts:45,75,85-89` |
| Last step | Next button label switches to `completeLabel` and emits `completed` instead of advancing. | `projects/medra/ui/src/lib/stepper/stepper.component.ts:46,74,91-97` |
| Loading / Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `StepPanelComponent` host has `role="group"` and `[attr.aria-label]` set directly from the panel's own `label` (not `aria-labelledby` pointing at the header button, since `StepsComponent` doesn't expose per-item ids to link against). `projects/medra/ui/src/lib/stepper/step-panel.component.ts:14-27`
- **Panel visibility uses the native `hidden` attribute**, confirmed end-to-end (not just via the `active` signal in isolation): `stepper.component.spec.ts — 'shows only the first panel initially, others hidden'` and `'Next advances to the next panel'` both assert on rendered `hidden`/text state, so an assistive-tech user relying on `hidden`-attribute suppression gets a correctly non-exposed inactive panel.
- **`linear` removes ahead-of-current steps from the tab order, not just from clickability** — it composes through `StepsComponent`'s existing disabled-item mechanism, so an ahead-of-current header renders as a non-interactive `<span>` (no button, no `aria-disabled`), same shape as a plain `Steps` disabled item. Verified by `stepper.component.spec.ts — 'linear mode disables header steps ahead of the current one, but back navigation stays clickable'` (header button count drops from 3 to 1, then to 2 as `activeIndex` advances). A panel's own `disabled` composes with this the same way: `stepper.component.spec.ts — "a panel's own disabled composes with linear (stays disabled even once reachable)"`.
- **Back/Next use native `disabled`, not just visual styling** — `stepper.component.spec.ts — 'Back is disabled on the first step, enabled after advancing'` asserts the actual `.disabled` DOM property, so screen readers/switch access correctly see Back as unavailable on step 0.
- **The last step's Next button changes its accessible name** (text content switches from `nextLabel()` to `completeLabel()`, default "Finish") rather than only changing behavior silently — verified by `stepper.component.spec.ts — "the last step's Next button reads \"Finish\" and emits completed instead of advancing"`.
- **Keyboard navigation — resolved 2026-08-19:** the header now inherits `Steps`' own Wave 2 fix — a `role="toolbar"` roving-tabindex pattern (one Tab stop, Arrow keys move between enabled headers, Home/End jump to first/last, disabled headers skipped). Back/Next are plain native `<button>`s, confirmed real (not `role="button"` div stand-ins) by `stepper.component.spec.ts — "Back and Next are real native <button>s, so Enter/Space activate them the same way a click does..."`, which dispatches a synthetic `click` (the same event a browser turns a focused button's Enter/Space keypress into — jsdom doesn't synthesize that conversion itself) and confirms navigation still advances/retreats correctly.
- **Screen reader:** Each panel's `aria-label` matches its header label, giving a self-contained accessible name with no cross-component id wiring needed. Confirmed by `stepper.component.spec.ts — 'each panel carries role="group" and an aria-label matching its own label'`.

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: the panel's `role="group"`/`aria-label` now has a direct DOM-level assertion, and keyboard coverage exists at both levels — the reused `Steps` header's roving-tabindex Arrow-key navigation (see `steps.md`) plus a dedicated Back/Next keyboard-activation test here. The state machine (hidden panels, disabled Back, linear-mode header gating, Finish-label swap) remains solidly test-covered end-to-end.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Declare one `<med-step-panel label="...">` per step as a direct content child of `<med-stepper>`. | Don't set `StepPanelComponent.active` directly — it's pushed in one-directionally by the parent `StepperComponent`. |
| Use `linear` when steps must be completed roughly in order but still allow going back. | Don't expect `linear` (or a panel's own `disabled`) to auto-skip a step on Next — it only blocks jumping to it via the header. |
| Rely on Back being natively `disabled` (not just styled) on the first step — safe for assistive tech and keyboard-only users. `stepper.component.spec.ts — 'Back is disabled on the first step, enabled after advancing'` | Don't assume the last step's Next button keeps saying "Next" — its label and semantics change to `completeLabel` (default "Finish") and it emits `completed` instead of advancing. `stepper.component.spec.ts — "the last step's Next button reads \"Finish\" and emits completed instead of advancing"` |

### Code example (Angular)
```html
<med-stepper linear (completed)="onStepperCompleted()" class="block max-w-[36rem]">
  <med-step-panel label="Cart">
    <p>Review your cart items.</p>
  </med-step-panel>
  <med-step-panel label="Shipping">
    <p>Enter your shipping address.</p>
  </med-step-panel>
  <med-step-panel label="Payment">
    <p>Enter your payment details.</p>
  </med-step-panel>
</med-stepper>
```

### Source
- `projects/medra/ui/src/lib/stepper/stepper.component.ts`
- `projects/medra/ui/src/lib/stepper/step-panel.component.ts`
- Reused: `projects/medra/ui/src/lib/steps/steps.component.ts`
- Usage: `projects/showcase/src/app/app.html:510-524`
