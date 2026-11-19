## Component: Knob

### Description
`KnobComponent` (`med-knob`) is a circular dial — functionally the same discrete-numeric-value contract `SliderComponent` implements (`ControlValueAccessor`, `min`/`max`/`step`, Arrow/Home/End keyboard model, drag-to-set), just laid out radially instead of linearly (`projects/medra/ui/src/lib/knob/knob.component.ts:56-62`). Drawn as two SVG arcs (background track + value fill) on a fixed `0 0 100 100` viewBox. The arc spans 270°, leaving a 90° gap at the bottom (6 o'clock) — the shape recognized as "a knob" (a volume dial), not a full circular progress ring; dragging into the gap clamps to whichever end is angularly closer (`knob.component.ts:64-68`).

The `<svg>` itself is the interactive element (`role="slider"`, `tabindex`, all pointer/keyboard listeners) — same "the track owns the whole gesture via pointer capture on itself" technique Slider uses (`knob.component.ts:70-74`).

### Variants
| Variant | When to use |
|---|---|
| `severity` (`ButtonSeverity`, default `'primary'`) | Colors the value arc via `SOLID_SEVERITY_TEXT` lookup |
| `readonly` | Shows the current value but ignores pointer/keyboard input |
| `showValue` (default `true`) | Toggles the numeric value text rendered in the center of the dial |

`size` is a raw pixel diameter (default `100`), not the shared `sm`/`default`/`lg` field-size scale — expected here since Knob is a graphical dial, not a text-input-shaped control.

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `0` | `knob.component.ts:118` |
| `max` | `number` | `100` | `knob.component.ts:119` |
| `step` | `number` | `1` | `knob.component.ts:120` |
| `size` | `number` (px) | `100` | Rendered diameter — `knob.component.ts:122` |
| `strokeWidth` | `number` | `10` | `knob.component.ts:123` |
| `severity` | `ButtonSeverity` | `'primary'` | `knob.component.ts:124` |
| `disabled` | `boolean` | `false` | `knob.component.ts:125` |
| `invalid` | `boolean` | `false` | Colors the value arc red (`text-danger-500`) — `knob.component.ts:126,175` |
| `readonly` | `boolean` | `false` | `knob.component.ts:128` |
| `showValue` | `boolean` | `true` | `knob.component.ts:129` |
| `ariaLabel` | `string \| null` | `null` | `knob.component.ts:130` |
| `class` | `string` | `''` | `knob.component.ts:131` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Two SVG arcs: gray track (`stroke-surface-200`) + colored value arc (`stroke-current`, severity-driven) — `knob.component.ts:109-110` | — |
| Hover | `cursor-pointer` when interactive — `knob.component.ts:158` | |
| Focus | `focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 rounded-full` — `knob.component.ts:160` | Arrow Right/Up increments by `step`, Arrow Left/Down decrements, Home/End jump to min/max — `knob.component.ts:229-257` |
| Active (dragging) | Value arc follows pointer angle in real time via `setPointerCapture` — `knob.component.ts:207-216` | |
| Disabled | `opacity-(--opacity-disabled)`, `tabindex="-1"`, `aria-disabled="true"` — `knob.component.ts:101,159` | Pointer/keyboard handlers no-op (`isInteractive()` gate) |
| Read-only | `aria-readonly="true"` — `knob.component.ts:102` | Same as disabled for interaction purposes (`isInteractive` = `!disabled && !readonly`), but not visually dimmed |
| Loading | Not implemented | |
| Error | Value arc colored `text-danger-500`/`dark:text-danger-400` when `invalid=true` (`knob.component.ts:175`); `aria-invalid="true"` set on the `<svg role="slider">` — resolved 2026-08-19 | `knob.component.ts:97-98` |

### Accessibility
- **Role/ARIA — `aria-invalid` gap resolved 2026-08-19:** `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`, `aria-invalid`, `aria-disabled`, `aria-readonly` (`knob.component.ts:95-103`) — all `aria-value*`/`role` attributes directly spec-verified: `knob.component.spec.ts:54-65 — 'exposes min/max/value via aria-value* on the svg (role="slider")'`. `aria-invalid` was a genuine source gap, not just a test-coverage gap: the `invalid` input existed and drove the value arc's danger color, but no `[attr.aria-invalid]` binding existed anywhere in the template — confirmed missing by reading the full template, not inferred from spec silence alone. Fixed by adding `[attr.aria-invalid]="invalid() ? 'true' : null"` to the `<svg>` alongside the other `aria-*` bindings, the same convention `ButtonDirective`/`InputTextDirective`/etc. already use. Directly verified: `knob.component.spec.ts` — `'sets aria-invalid on the slider when invalid is true, and omits it otherwise (Wave 2 a11y fix — the `invalid` input previously only drove the value arc's danger color, with no aria-invalid wired up at all)'`.
- **Keyboard navigation:** `ArrowRight`/`ArrowUp` increment by `step`, `ArrowLeft`/`ArrowDown` decrement — spec-verified with a non-default `step=2`: `knob.component.spec.ts:67-85 — 'ArrowRight/ArrowUp increase by step, ArrowLeft/ArrowDown decrease'`. `Home`/`End` jump to `min`/`max` — `:87-100`. Clamping at the bounds (no overshoot past `max` via keyboard) is spec-verified: `:102-110 — 'keyboard input never moves the value past min/max'`. This matches Slider's keyboard model, as the doc states.
- **Disabled/readonly distinction:** both set `tabindex="-1"` and block keyboard input identically, but only `disabled` is expected to also dim the control visually (per the States table) — both interaction-blocking behaviors are directly spec-verified as functionally identical: `knob.component.spec.ts:112-124 — 'disabled: pointer/keyboard input has no effect, and tabindex is -1'` and `:126-138 — 'readonly: shows the value, ignores keyboard input, tabindex is -1'`.
- **Pointer interaction:** dragging maps angle to value correctly at a known reference point (12 o'clock ≈ midpoint) — `knob.component.spec.ts:148-162`; dragging into the bottom 90° gap clamps to the angularly-nearer end rather than producing an invalid/NaN value — `:164-178 — 'dragging into the bottom gap clamps to the nearer end, not an invalid value'`; and `pointerup` correctly ends the drag so a later stray `pointermove` has no effect — `:180-195 — 'pointerup ends the drag — further pointermove has no effect'`.
- **Screen reader:** `aria-valuenow` reflects the live numeric value (spec-verified throughout the keyboard/pointer tests above); `ariaLabel` must be supplied by the consumer (no default text label, `ariaLabel` default is `null`) — the visible center text (`showValue`) is not itself an accessible name, and no spec test wires `ariaLabel` and checks it lands on the `<svg>`, so that specific plumbing is `[not covered by tests]` even though the input exists.
- **A11y verdict:** Covered — **the `aria-invalid` gap is resolved 2026-08-19** (real source fix: `[attr.aria-invalid]` was missing entirely, now added and spec-verified). `role`/`aria-value*` wiring, full keyboard model (Arrow/Home/End with bounds clamping), disabled/readonly interaction-blocking, and pointer-drag angle math (including gap-clamping) remain directly spec-verified as before. `ariaLabel` plumbing itself still has no dedicated test — a minor remaining gap, not part of the `aria-invalid` fix.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Always pass `ariaLabel` — there's no default and no visible `<label>` association | — |
| Use `readonly` (not just `disabled`) when the value should remain visually undimmed but non-interactive — both spec-verified to block input identically | Don't expect PageUp/PageDown large-step support — only Arrow keys and Home/End are wired (spec-confirmed) |
| Trust `invalid` for both the visual danger color and `aria-invalid` — both are now wired together (`knob.component.ts:97-98,175`, resolved 2026-08-19) | Don't add your own `aria-invalid` binding on top of `invalid` — it's now redundant |
| Trust keyboard input to clamp cleanly at `min`/`max` without overshoot (spec-verified) | Don't worry about a stray `pointermove` after `pointerup` moving the value — drag-end is spec-verified to fully stop tracking |

### Code example (Angular)
```html
<med-knob ariaLabel="Volume" [(ngModel)]="knobDemoValue" name="demo-knob" />

<med-knob ariaLabel="Brightness" severity="warn" [min]="0" [max]="10" [step]="1" [(ngModel)]="knobBrightnessDemoValue" name="demo-knob-warn" />

<med-knob ariaLabel="Read-only example" readonly [(ngModel)]="knobReadonlyDemoValue" name="demo-knob-readonly" />
```
Source: `projects/showcase/src/app/app.html:1219-1221`

### Source
- `projects/medra/ui/src/lib/knob/knob.component.ts`
