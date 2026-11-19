## Component: RadioButton

### Description
`RadioButton` (`med-radio-button`) uses the same architecture as `Checkbox`: a real, visually-hidden native `<input type="radio">` drives all interaction state (checked, hover, focus, disabled) via `peer-*` Tailwind variants against a decorative ring, with the "selected" dot conditionally rendered inside it. Unlike `Checkbox`'s binary value, a radio's `value` is an arbitrary generic `T` compared by `===` against the bound group value, so there's no falsy-value ambiguity (`undefined`/`null`/`0`/`false` all compare correctly). Each instance is its own `ControlValueAccessor`; grouping is achieved by binding every radio in the group to the same `[(ngModel)]` (or `formControlName`) and giving them the same `name`. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:6-14`

### Variants
| Variant | When to use |
|---|---|
| No visual "variant" axis beyond `size` and `invalid` — see Props. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `name` | `string` (required) | — | Native `name` attribute grouping radios together. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:50` |
| `value` | `T` (required, generic) | — | The value this radio represents; group value is compared with `===`. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:51` |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Ring size (`size-4`/`size-5`/`size-6`) and inner dot size. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:52`, `projects/medra/ui/src/lib/radio-button/radio-button.styles.ts:28-30` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid`. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:53` |
| `disabled` | `boolean` | `false` | Disables the input. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:54` |
| `inputId` | `string \| null` | `null` | `id` for the native input, for pairing with an external `<label for>`. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:55` |
| `class` | `string` | `''` | Extra classes merged onto the decorative ring. `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:56` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Unchecked: `border-surface-300`/dark `border-surface-600` ring, transparent | — |
| Hover | Not implemented (no `peer-hover:*` class found in `radioRingVariants`) | — |
| Focus | `peer-focus-visible:ring-(--focus-ring-width)` with ring offset, brand color | `projects/medra/ui/src/lib/radio-button/radio-button.styles.ts:22` |
| Active | Not implemented | — |
| Disabled | `peer-disabled:opacity-(--opacity-disabled)` | Native `disabled` driven by `isDisabled()` (input OR Reactive Forms). `projects/medra/ui/src/lib/radio-button/radio-button.styles.ts:23`, `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:61` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`/dark `border-danger-400` on the ring | `aria-invalid="true"` on the native input when `invalid()` is true. `projects/medra/ui/src/lib/radio-button/radio-button.styles.ts:33`, `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:37` |

### Accessibility
- **Role/ARIA:** Uses the native `<input type="radio">` role implicitly; `aria-invalid` set conditionally, verified by `radio-button.component.spec.ts` — `'sets aria-invalid when invalid is true'`; decorative ring has `aria-hidden="true"` (queried directly in `'merges a consumer class override onto the ring'`). `projects/medra/ui/src/lib/radio-button/radio-button.component.ts:37,41`
- **Keyboard navigation — investigated and partly resolved 2026-08-19:** No custom keydown handling in the component, by design — Space/click activation of a single radio, and Arrow-key movement *between* same-`name` radios, are both entirely native `<input type="radio">` browser behavior; the component's only job is to keep emitting real `<input type="radio" name="...">` elements for the browser to drive, which it does (verified elsewhere in this doc — same `name` grouping, real native input). Single-radio Space/click activation is now directly proven via the browser's real activation path (previously only a synthetic `change` event): `radio-button.component.spec.ts` — `'is a real native <input type="radio">, so Space/click activation is entirely native — the same DOM activation behavior checks it and fires the shared FormControl, with no directive-level keydown handling (Wave 2 keyboard-coverage fix). Arrow-key movement *between* same-`name` radios is likewise entirely browser-native group behavior...'`. Cross-radio Arrow-key group navigation itself remains genuinely untestable at this layer — jsdom does not implement the browser's native radio-group arrow-key focus/selection behavior, so no unit test can exercise it; this is a jsdom limitation, not a component gap.
- **Screen reader:** No built-in `aria-label`/`aria-labelledby`; labelling is left to the consumer pairing an external `<label for>` with `inputId` — the `inputId` pass-through is verified by `radio-button.component.spec.ts` — `'applies the inputId to the native input for external label pairing'`.
- **Group/mutual-exclusion mechanism (important nuance):** each `RadioButton` instance is its own independent `ControlValueAccessor` with its own `groupValue` signal — mutual exclusivity is **not** self-contained group logic, it emerges from every radio in the group being bound to the *same* `FormControl`/`ngModel`: when one instance's `onChange` fires, the shared control's new value flows back into every other instance via `writeValue`, unchecking them. This is directly verified by `radio-button.component.spec.ts` — `'only the radio matching the control value is checked'` and `'selecting one radio deselects the other through the shared control'` (both using a `GroupHostComponent` with two radios bound to one shared `FormControl`).

**A11y verdict:** Covered — **the keyboard-coverage gap is resolved 2026-08-19** for what's testable at this layer: single-radio Space/click activation is now directly proven via the real native activation path. Cross-radio Arrow-key group navigation remains correctly untested — it's genuine browser-native behavior that jsdom itself cannot simulate, not a component-level gap; the component's only real responsibility (emitting real `<input type="radio" name="...">` elements) is already verified by the group-behavior tests above. `aria-invalid`, `aria-hidden` on the ring, `inputId` pairing, and the shared-`FormControl` mutual-exclusion mechanism remain directly tested as before.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Give every radio in a group the same `name` and bind them all to the same `[(ngModel)]`/`formControl` — grouping is achieved this way, not through a wrapping group component. | Don't give radios in the same logical group different `name` values — native keyboard arrow-key grouping and mutual exclusivity depend on a shared `name`. |
| Set `inputId` and pair it with an external `<label for>`. | Don't rely on the component for an accessible name; without a paired label, screen reader users only hear "radio button". |
| Remember mutual exclusion is driven entirely by the shared `FormControl`/`ngModel` value round-tripping through each instance's own `writeValue` (`radio-button.component.spec.ts` — `'selecting one radio deselects the other through the shared control'`), not by any cross-instance coordination in the component itself. | Don't bind radios in the same group to *separate* `FormControl`/`ngModel` instances even if they share `name` — each `RadioButtonComponent` is an independent `ControlValueAccessor`, so without a shared control, selecting one will not deselect the other at the Angular/model level (only native DOM radio behavior would, and that's untested). |

### Code example (Angular)
```html
<med-radio-button name="plan" value="free" [(ngModel)]="radioPlan" />
<med-radio-button name="plan" value="pro" [(ngModel)]="radioPlan" />
<med-radio-button name="plan" value="disabled-option" disabled [(ngModel)]="radioPlan" />
```

### Source
- `projects/medra/ui/src/lib/radio-button/radio-button.component.ts`
- `projects/medra/ui/src/lib/radio-button/radio-button.styles.ts`
- Usage: `projects/showcase/src/app/app.html:264-280`
