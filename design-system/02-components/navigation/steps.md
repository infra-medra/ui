## Component: Steps

### Description
`Steps` (`<med-steps>`) is a horizontal progress/navigation indicator: numbered circles connected by a line, each labeled. **Resolved 2026-08-19:** it now follows the same ARIA APG roving-tabindex toolbar pattern as `Dock`/`SelectButton` — one enabled step is the single Tab stop at a time, and Arrow keys move (not activate) the roving stop between the rest; it previously rendered every enabled step as an individually-tabbable button in plain document Tab order, reasoned then as "more like independent breadcrumb links." `readonly` (default `false`) turns every step into a non-interactive display indicator. `Stepper` reuses this component unchanged for its own header row. `projects/medra/ui/src/lib/steps/steps.component.ts:7-30`

### Variants
| Variant | When to use |
|---|---|
| Interactive (`readonly` false, default) | Free navigation between already-known steps (e.g. an editable multi-section form's progress bar). |
| `readonly` (`true`) | Read-only progress display with no navigation (e.g. a shipping-status tracker). |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly StepItem[]` | `[]` | `{ label: string; disabled?: boolean }`. `projects/medra/ui/src/lib/steps/steps.component.ts:67`, `projects/medra/ui/src/lib/steps/steps.types.ts:1-4` |
| `activeIndex` | `model<number>` | `0` | Two-way bindable (`[(activeIndex)]`) current step index. `projects/medra/ui/src/lib/steps/steps.component.ts:68` |
| `readonly` | `boolean` (`booleanAttribute`) | `false` | Disables click-to-jump on every step, rendering plain `<span>`s instead of `<button>`s. `projects/medra/ui/src/lib/steps/steps.component.ts:69` |
| `ariaLabel` | `string` | `'Progress'` | Label on the wrapping `<nav>`. `projects/medra/ui/src/lib/steps/steps.component.ts:70` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the `<ol>`. `projects/medra/ui/src/lib/steps/steps.component.ts:71` |

### States
| State | Visual | Behavior |
|---|---|---|
| Completed | Filled circle (`bg-brand-500`), white checkmark icon instead of the number. | Steps before `activeIndex`. `projects/medra/ui/src/lib/steps/steps.styles.ts:6-18`, `projects/medra/ui/src/lib/steps/steps.component.ts:75-78` |
| Active (current) | Outlined circle (`border-brand-500`), brand-colored text, `aria-current="step"`. | `projects/medra/ui/src/lib/steps/steps.styles.ts:12`, `projects/medra/ui/src/lib/steps/steps.component.ts:35,46` |
| Upcoming | Neutral outlined circle (`border-surface-300`). | Steps after `activeIndex`. `projects/medra/ui/src/lib/steps/steps.styles.ts:13` |
| Hover/Focus (interactive mode) | Native `<button>` hover/focus (no bespoke class beyond the button itself). | Only when `!readonly() && !item.disabled`. `projects/medra/ui/src/lib/steps/steps.component.ts:34-44` |
| Disabled (per item) | `opacity-(--opacity-disabled)` in read-only mode; in interactive mode a disabled item simply doesn't render as clickable (falls into the read-only branch). | `projects/medra/ui/src/lib/steps/steps.component.ts:34,92-94` |
| N/A: Loading, Error | Not implemented (Steps is a progress/nav indicator, not a form field). | — |

### Accessibility
- **Role/ARIA:** Wrapping `<nav [attr.aria-label]>`; the active step gets `aria-current="step"` on either the `<button>` or `<span>`, whichever is rendered — confirmed by `steps.component.spec.ts — 'marks the current step with aria-current="step"'`. `projects/medra/ui/src/lib/steps/steps.component.ts:30,35,46`
- **Disabled items are removed from the accessibility tree's interactive surface entirely, not just dimmed:** a disabled item in interactive mode renders as a plain `<span>`, never a `<button>` — there is no `aria-disabled` attribute anywhere in this component (unlike `Tabs`, which does use `aria-disabled` on a still-focusable-when-active button). Verified by `steps.component.spec.ts — 'renders one interactive step per non-disabled item, a plain span for the disabled one'` (4 items, only 3 buttons render). `projects/medra/ui/src/lib/steps/steps.component.ts:34,92-94`
- **`readonly` removes every step from the tab order**, not just the disabled ones — zero `<button>` elements render at all, confirmed by `steps.component.spec.ts — 'readonly renders every step as a non-interactive span, even enabled ones'`. `projects/medra/ui/src/lib/steps/steps.component.ts:34`
- **Keyboard navigation — resolved 2026-08-19:** the interactive `<ol>` now carries `role="toolbar"` (dropped when `readonly`) and implements the ARIA APG roving-tabindex pattern: one enabled step is the single Tab stop at a time, ArrowLeft/Right move the roving stop between enabled steps with wraparound, Home/End jump to the first/last enabled step, and a `disabled` step (rendered as a `<span>`, never a `<button>`) is skipped automatically. Arrow keys only move focus — they don't activate a step, matching `Dock`'s model rather than a radiogroup's automatic activation; clicking (or Enter/Space on the focused button) is still what navigates `activeIndex`. Confirmed by `steps.component.spec.ts` — `'role="toolbar" on the interactive list, dropped in readonly mode'`, `'roving tabindex: only one step is in the Tab order at a time, starting with the first enabled step'`, `'ArrowRight moves the roving tab stop to (and focuses) the next enabled step, skipping the disabled one'`, `'ArrowLeft from the first step wraps around to the last enabled step'`, `'Home/End jump the roving tab stop to the first/last enabled step'`, `'Arrow-key navigation only moves focus, it does not activate the step (activeIndex is unchanged)'`. `projects/medra/ui/src/lib/steps/steps.component.ts:104-171`
- **Screen reader:** `aria-current="step"` communicates the active step. Completed steps' checkmark icon (`<med-icon name="check">`) is rendered with no `ariaLabel` input, so `IconComponent` defaults it to `aria-hidden="true"` and it announces nothing — the step's own visible label span remains the sole accessible name. `projects/medra/ui/src/lib/icon/icon.component.ts:50,63`
- Note that `ariaLabel` (nav label) is verified end-to-end: `steps.component.spec.ts — 'sets aria-label on the nav'`.

**A11y verdict:** Covered — **resolved 2026-08-19**: the implemented semantics (`aria-current`, decorative icon, disabled-item exclusion, readonly exclusion) are all test-covered, and the previously-missing Arrow-key navigation is now implemented as an ARIA APG roving-tabindex toolbar (see Keyboard navigation above for the tests). The product decision — Steps moves from "every step individually tabbable, like breadcrumb links" to "one tab stop, Arrow keys roving between the rest" — was made in favor of the standard toolbar pattern, same as `Dock`'s own Wave 2 fix.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use interactive `Steps` (default) when users should be able to jump to any earlier or later step directly. | Don't use `readonly` when free navigation is expected — it disables the click-to-jump behavior on every step. |
| Bind `[(activeIndex)]` for two-way sync. | Don't expect every enabled step to be individually Tab-reachable — the toolbar uses roving tabindex, so Tab lands on one step and Arrow keys move between the rest (Enter/Space or a click still navigates `activeIndex`). |
| Rely on a `disabled` item automatically dropping out of the tab order (rendered as `<span>`, no button at all) — no extra `aria-disabled` wiring needed on your side. `steps.component.spec.ts — 'renders one interactive step per non-disabled item, a plain span for the disabled one'` | Don't expect a disabled step to expose `aria-disabled` semantics like `Tabs` does — it's a plain non-interactive `<span>`, a different accessibility shape than `TabComponent`'s disabled state. |

### Code example (Angular)
```html
<med-steps [items]="checkoutSteps" [(activeIndex)]="stepsActiveIndex" class="max-w-[36rem]" />
```

### Source
- `projects/medra/ui/src/lib/steps/steps.component.ts`
- `projects/medra/ui/src/lib/steps/steps.styles.ts`
- `projects/medra/ui/src/lib/steps/steps.types.ts`
- Usage: `projects/showcase/src/app/app.html:505-508`
