## Component: ToggleSwitch

### Description
`ToggleSwitch` (`med-toggle-switch`) is the plain iOS-style on/off switch, built the same way as `Checkbox`: a real, visually-hidden native `<input type="checkbox" role="switch">` drives all interaction state (checked, focus, hover, disabled) via `peer-*` variants on two decorative siblings (track + thumb) — neither decorative element tracks its own copy of state. `role="switch"` is the standard HTML pattern for this: same element and same Space-to-toggle keyboard behavior as a checkbox, only the screen-reader announcement changes ("on/off" instead of "checked/unchecked"). It deliberately has no `label`/`onLabel`/`offLabel` inputs — a labeled toggle with text is a separate component (`ToggleButton`)'s job. Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:6-18`

### Variants
| Variant | When to use |
|---|---|
| No visual "variant" axis beyond `size` and `invalid` — see Props. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Track (`h-4 w-7`/`h-5 w-9`/`h-6 w-11`) and thumb size. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:51`, `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts:24-26` |
| `invalid` | `boolean` | `false` | Error styling (danger ring around the track) + `aria-invalid`. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:52` |
| `disabled` | `boolean` | `false` | Disables the input. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:53` |
| `inputId` | `string \| null` | `null` | `id` for the native input, for pairing with an external `<label for>`. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:54` |
| `class` | `string` | `''` | Extra classes merged onto the track. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:55` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default (off) | `bg-surface-300`/dark `bg-surface-600` track, thumb at left | — |
| Hover | Not implemented (no `peer-hover:*` class found) | — |
| Focus | `peer-focus-visible:ring-(--focus-ring-width)` with ring offset, brand color, on the track | `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts:18` |
| Active (on/checked) | Track `bg-brand-500`/dark `bg-brand-400`, thumb translated right (`peer-checked:translate-x-*`) | `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts:17,51-53` |
| Disabled | `peer-disabled:opacity-(--opacity-disabled)` on the track | Native `disabled` driven by `isDisabled()` (input OR Reactive Forms). `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts:19`, `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:59` |
| Loading | Not implemented | — |
| Error (invalid) | `ring-2 ring-danger-500`/dark `ring-danger-400` around the track | `aria-invalid="true"` on the native input when `invalid()` is true. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts:29`, `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:41` |

### Accessibility
- **Role/ARIA:** Native input carries `role="switch"` in addition to `type="checkbox"`, so screen readers announce "on/off" rather than "checked/unchecked" — verified by `toggle-switch.component.spec.ts` — `'sets role="switch" on the native input'`; `aria-invalid` set conditionally, verified by `'sets aria-invalid when invalid is true'`; track and thumb are `aria-hidden="true"`. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:35-36,41,45-46`
- **Keyboard navigation:** None found beyond native checkbox behavior (Space toggles, Tab focuses) — no custom keydown handling in the component, and the spec only exercises toggling via a synthetic `change` event, not a keyboard event. `[not covered by tests]`
- **Screen reader:** No built-in `aria-label`/`aria-labelledby`; labelling is left to the consumer pairing an external `<label for>` with `inputId` — the `inputId` pass-through is verified by `toggle-switch.component.spec.ts` — `'applies the inputId to the native input for external label pairing'`. Note: this component intentionally has no built-in text label at all (`onLabel`/`offLabel` are not implemented here — reserved for the separate `ToggleButton` component).
- **Form integration (`ControlValueAccessor`):** `writeValue(false)`, `writeValue(null)`, and `writeValue(undefined)` all normalize to unchecked without throwing — `toggle-switch.component.spec.ts` — `'writeValue(false/null/undefined) all normalize to unchecked, never throwing'` (same binary-`false`-safe pattern as `Checkbox`). A `FormControl` initialized `true` renders checked — `'a FormControl initialized with true renders checked'`.

**A11y verdict:** Covered — `role="switch"`, `aria-invalid`, `aria-hidden` on decorative elements, `inputId` pairing, and the binary-value-safe CVA are all directly tested; the only gap is the absence of a keyboard-specific (Space-key) simulation, though this is native `<input>` behavior the switch doesn't customize.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `inputId` and pair it with an external `<label for>` — the component provides no built-in label. | Don't use `ToggleSwitch` when you need on/off text labels baked into the control; use `ToggleButton` instead. `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts:16-18` |
| Rely on `role="switch"` semantics rather than treating it as a plain checkbox in ARIA-aware tooling. | Don't expect a hover style — none is defined. |
| Trust `writeValue` to normalize `false`/`null`/`undefined` all to unchecked without error (`toggle-switch.component.spec.ts` — `'writeValue(false/null/undefined) all normalize to unchecked, never throwing'`). | Don't add manual nullish-guarding around a bound `FormControl`/`ngModel` boolean before passing it in — the component already handles it. |

### Code example (Angular)
```html
<med-toggle-switch [(ngModel)]="toggleSwitchDemoValue" name="demo-toggle" />
<med-toggle-switch invalid />
<med-toggle-switch disabled />
<med-toggle-switch size="sm" [(ngModel)]="toggleSwitchSizeDemo" name="demo-toggle-sm" />
```

### Source
- `projects/medra/ui/src/lib/toggle-switch/toggle-switch.component.ts`
- `projects/medra/ui/src/lib/toggle-switch/toggle-switch.styles.ts`
- Usage: `projects/showcase/src/app/app.html:90-106`
