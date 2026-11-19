## Component: Slider

### Description
`Slider` (`med-slider`) implements the WAI-ARIA APG "Slider" pattern (single mode) and "Slider (Multi-Thumb)" pattern (`range` mode). Each thumb is its own `role="slider"` `<div>` (not a native `<input type="range">`, which can't do two handles), independently focusable and keyboard-driven. A single set of pointer listeners lives on the track rather than on each thumb: `pointerdown` computes the clicked position, picks the nearest thumb (in range mode), moves focus there, and pointer-captures the track — so drag and click-to-jump share one code path and a click anywhere on the track can start dragging. In `range` mode, dragging past the other handle clamps instead of crossing (`start` can never exceed `end`). Unlike most other form controls in this lib, the value is never `null`: an unwritten value defaults to `min` (single) or `{ start: min, end: max }` (range). Horizontal orientation only in v1 — no `orientation` input exists yet. Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/slider/slider.component.ts:21-55`

### Variants
| Variant | When to use |
|---|---|
| Single (`range` off, default) | One thumb, value is a plain `number`. |
| `range` | Two thumbs, value is `{ start, end }`; handles cannot cross. `projects/medra/ui/src/lib/slider/slider.component.ts:37-43,208-218` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `0` | Minimum value. `projects/medra/ui/src/lib/slider/slider.component.ts:130` |
| `max` | `number` | `100` | Maximum value. `projects/medra/ui/src/lib/slider/slider.component.ts:131` |
| `step` | `number` | `1` | Step increment for keyboard arrows and value snapping. `projects/medra/ui/src/lib/slider/slider.component.ts:132` |
| `range` | `boolean` | `false` | Switches between single-thumb (`number`) and two-thumb (`SliderRange`) value shape. `projects/medra/ui/src/lib/slider/slider.component.ts:133` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Track height and thumb size. `projects/medra/ui/src/lib/slider/slider.component.ts:134` |
| `disabled` | `boolean` | `false` | Disables pointer and keyboard interaction. `projects/medra/ui/src/lib/slider/slider.component.ts:135` |
| `invalid` | `boolean` | `false` | Error styling (danger fill/thumb border) + `aria-invalid` on thumb(s). `projects/medra/ui/src/lib/slider/slider.component.ts:136` |
| `ariaLabel` | `string \| null` | `null` | `aria-label` for the single thumb (single mode only). `projects/medra/ui/src/lib/slider/slider.component.ts:137` |
| `startLabel` / `endLabel` | `string` | `'Minimum value'` / `'Maximum value'` | `aria-label`s for the two thumbs in range mode. `projects/medra/ui/src/lib/slider/slider.component.ts:138-139` |
| `class` | `string` | `''` | Extra classes merged onto the track wrapper. `projects/medra/ui/src/lib/slider/slider.component.ts:140` |

No `@Output()`s; value flows through `ControlValueAccessor` (`number` or `SliderRange`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Thin track bar (`bg-surface-200`/dark `bg-surface-700`) with a brand-colored fill segment and a white circular thumb with brand border | — |
| Hover | Not implemented (no explicit hover class on track/thumb; `cursor-pointer` is set on the wrapper when enabled) | `projects/medra/ui/src/lib/slider/slider.styles.ts:22` |
| Focus | Thumb gets `focus-visible:ring-(--focus-ring-width)` with ring offset, brand color | `projects/medra/ui/src/lib/slider/slider.styles.ts:65` |
| Active (dragging) | No distinct dedicated "active" class — dragging is tracked via internal `activeThumb` signal and pointer capture, driving the same fill/position styles as any value change | `projects/medra/ui/src/lib/slider/slider.component.ts:146,231-268` |
| Disabled | `pointer-events-none opacity-(--opacity-disabled)` on the wrapper; thumbs get `tabIndex="-1"` and `aria-disabled="true"` | `disabled` input OR Reactive Forms `setDisabledState()`. `projects/medra/ui/src/lib/slider/slider.styles.ts:21`, `projects/medra/ui/src/lib/slider/slider.component.ts:85,90,156` |
| Loading | Not implemented | — |
| Error (invalid) | Fill and thumb border/focus-ring switch to danger colors | `aria-invalid="true"` on every thumb when `invalid()` is true. `projects/medra/ui/src/lib/slider/slider.styles.ts:52-56,75-78`, `projects/medra/ui/src/lib/slider/slider.component.ts:91,106,120` |

### Accessibility
- **Role/ARIA:** Each thumb is `role="slider"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow` plus `aria-label` (`ariaLabel` in single mode, `startLabel`/`endLabel` in range mode), `aria-disabled`, and `aria-invalid`. `projects/medra/ui/src/lib/slider/slider.component.ts:84-124`. In range mode, each thumb's `aria-valuemin`/`aria-valuemax` is dynamically bounded by the *other* thumb's current position (not the global `min`/`max`) — verified by `slider.component.spec.ts` — `"each thumb's dynamic min/max is bounded by the other thumb's current position"`. `aria-valuemin`/`max`/`now` in single mode: `'defaults to min, exposes aria-valuemin/max/now'`. `aria-invalid`: `'sets aria-invalid when invalid is true'`. `aria-label`/`startLabel`/`endLabel`: `'sets aria-label from ariaLabel'`, `'sets aria-label from startLabel/endLabel'`.
- **Keyboard navigation:** ArrowRight/ArrowUp increments by `step`, ArrowLeft/ArrowDown decrements — `slider.component.spec.ts` — `'ArrowRight/ArrowUp increases by step, ArrowLeft/ArrowDown decreases'`; PageUp/PageDown move by `step * 10`, Home/End jump to `min`/`max` — `'PageUp/PageDown step by step*10, Home/End jump to min/max'`; values clamp at bounds rather than wrapping — `'clamps at min/max instead of wrapping'`; in range mode, each thumb's keyboard range is clamped by the other thumb rather than the global bound — `'the start thumb can never cross past the end thumb'`, `'the end thumb can never cross past the start thumb'`, and both thumbs step fully independently — `'arrow keys step each thumb independently'`. `onTouched` fires on the very first keyboard interaction — `'calls onTouched on the first keyboard interaction'`. All handled per-thumb. `projects/medra/ui/src/lib/slider/slider.component.ts:270-311`
- **Pointer interaction:** A single pointer-listener set on the track (not per-thumb) handles both click-to-jump and drag: clicking the track jumps the value to that position — `'clicking the track jumps the thumb to that position'`; dragging (`pointermove` after `pointerdown`) keeps updating live, and movement after `pointerup` is correctly ignored — `'dragging (pointermove after pointerdown) keeps updating the value'`; in range mode, a track click moves whichever thumb is closer to the click point — `'clicking the track moves whichever thumb is closer to the click position'`. Both pointer and keyboard interaction are fully inert while disabled — `'disabled: keyboard and pointer interaction are both no-ops, thumb is aria-disabled and untabbable'`.
- **Screen reader:** `aria-valuenow` (numeric) is exposed on every thumb; no `aria-valuetext` for a formatted display string was found (unlike InputNumber) — `[not covered by tests]`, and likely a real gap for sliders with non-obvious units (e.g. currency, percentages). No `aria-describedby` for external hint/error text found. `[not covered by tests]`
- **Form integration (`ControlValueAccessor`):** `writeValue(null/undefined)` normalizes to `min` (single mode) or `{ start: min, end: max }` (range mode) without throwing, never leaving the thumb in an undefined DOM position — `'writeValue(null/undefined) normalizes to min, never throwing'` and `'writeValue(null/undefined) normalizes to { start: min, end: max }'`. `FormControl` round-trip and `setDisabledState` are both tested — `'a FormControl initialized with a value renders it'`, `'disables via setDisabledState (Reactive Forms disable())'`.

**A11y verdict:** Covered — role/ARIA value attributes (including the dynamic range-mode min/max clamping), the full keyboard matrix, pointer drag/click-to-jump, disabled-state gating, and null-safe form integration are all directly and thoroughly tested; the only real gaps are `aria-valuetext` (no formatted-value announcement for non-numeric-feeling scales) and `aria-describedby` for error text, both unwired and untested.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Always set `ariaLabel` (single mode) or `startLabel`/`endLabel` (range mode) — there's no visible text label built in. | Don't expect a vertical slider — orientation is horizontal-only in v1, no `orientation` input exists. `projects/medra/ui/src/lib/slider/slider.component.ts:51-55` |
| Use `range` for min/max style filters where two handles are needed. | Don't expect range handles to swap identity when dragged past each other — they clamp instead of crossing. `projects/medra/ui/src/lib/slider/slider.component.ts:40-42` |
| Consider adding a formatted value announcement (e.g. via `aria-valuetext` on top of the component, or a visible readout) for scales where the raw number isn't self-explanatory (currency, percentages) — the component itself only exposes the raw numeric `aria-valuenow`. | Don't assume `writeValue(null)` leaves the slider in a visually undefined state — it deterministically resets to `min` (or `{start: min, end: max}` in range mode), verified by `slider.component.spec.ts` — `'writeValue(null/undefined) normalizes to min, never throwing'`. |

### Code example (Angular)
```html
<med-slider ariaLabel="Volume" [(ngModel)]="sliderDemoValue" name="demo-slider" />
<med-slider [step]="10" size="sm" ariaLabel="Step of 10" [(ngModel)]="sliderStepDemoValue" name="demo-slider-step" />
<med-slider range size="lg" startLabel="From" endLabel="To" [(ngModel)]="sliderRangeDemoValue" name="demo-slider-range" />
```

### Source
- `projects/medra/ui/src/lib/slider/slider.component.ts`
- `projects/medra/ui/src/lib/slider/slider.styles.ts`
- `projects/medra/ui/src/lib/slider/slider.types.ts`
- Usage: `projects/showcase/src/app/app.html:377-392`
