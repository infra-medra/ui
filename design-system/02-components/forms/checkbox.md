## Component: Checkbox

### Description
`Checkbox` (`med-checkbox`) wraps a real, visually-hidden native `<input type="checkbox">` (`opacity-0`, absolutely positioned) that drives all interaction state (checked, focus, hover, disabled) via Tailwind `peer-*` variants onto a decorative sibling `<span>` box — the decorative box never tracks its own copy of state, so nothing can fall out of sync with the native input. It avoids a binary-`false` pitfall by normalizing `writeValue` with `=== true` rather than a truthiness check, so `false`/`null`/`undefined` all resolve to unchecked rather than `false` being misread as "unset". Implements `ControlValueAccessor`. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:13-23`

### Variants
| Variant | When to use |
|---|---|
| Checked/unchecked (standard boolean) | Standard binary choice. |
| `indeterminate` | "Partially selected" state, e.g. a parent checkbox for a mixed-selection group; shows a minus icon instead of a check. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:52-53` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Box size (`size-4`/`size-5`/`size-6`, own scale, not the field-token scale). `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:62`, `projects/medra/ui/src/lib/checkbox/checkbox.styles.ts:26-28` |
| `invalid` | `boolean` | `false` | Error styling + `aria-invalid`. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:63` |
| `indeterminate` | `boolean` | `false` | Sets the native `indeterminate` IDL property and swaps the icon to a minus. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:64` |
| `disabled` | `boolean` | `false` | Disables the input. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:65` |
| `inputId` | `string \| null` | `null` | `id` for the native input, for pairing with an external `<label for>`. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:66` |
| `class` | `string` | `''` | Extra classes merged onto the decorative box (not the hidden native input). `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:67` |

No `@Output()`s; value flows through `ControlValueAccessor`.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Unchecked: `border-surface-300`/dark `border-surface-600`, transparent background | — |
| Hover | Not implemented (no `peer-hover:*` class found in `checkboxBoxVariants`) | — |
| Focus | `peer-focus-visible:ring-(--focus-ring-width)` with ring offset, brand color | `projects/medra/ui/src/lib/checkbox/checkbox.styles.ts:20` |
| Active | Not implemented | — |
| Disabled | `peer-disabled:opacity-(--opacity-disabled)` | Native `disabled` attribute driven by `isDisabled()` (input OR Reactive Forms). `projects/medra/ui/src/lib/checkbox/checkbox.styles.ts:21`, `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:71` |
| Loading | Not implemented | — |
| Error (invalid) | `border-danger-500`/dark `border-danger-400` | `aria-invalid="true"` set on the native input when `invalid()` is true. `projects/medra/ui/src/lib/checkbox/checkbox.styles.ts:31`, `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:47` |

### Accessibility
- **Role/ARIA:** Uses the native `<input type="checkbox">` role implicitly (no explicit `role` attribute needed); `aria-invalid` set conditionally, verified by `checkbox.component.spec.ts` — `'sets aria-invalid when invalid is true'`; decorative box has `aria-hidden="true"` so assistive tech only sees the real input, and the spec queries it via `span[aria-hidden="true"]` — `'applies the box size class for size=%s'`. `projects/medra/ui/src/lib/checkbox/checkbox.component.ts:47,51`
- **Keyboard navigation — resolved 2026-08-19:** None implemented by the component itself, by design — Space-to-toggle/Tab-to-focus is native `<input type="checkbox">` behavior that needs no directive-level reimplementation. Previously only exercised via a synthetic `change` event; now directly proven via the browser's real checkbox activation path: `checkbox.component.spec.ts` — `'is a real native <input type="checkbox">, so Space-key activation is entirely native — the same DOM activation behavior a Space keypress triggers (toggling checked and firing change/click) works end-to-end with no directive-level keydown handling (Wave 2 keyboard-coverage fix)'` calls the native `.click()` activation (the same DOM path a focused Space keypress triggers) and asserts `checked`, `registerOnChange`, and the icon swap all update correctly.
- **`aria-describedby` — investigated 2026-08-19, by design (deferred), not a bug:** no form primitive in this library implements a general consumer-supplied hint/error-id convention yet (see `input-text.md`'s Accessibility section for the full investigation, which applies library-wide); adding one unilaterally here would mean inventing an architectural pattern out of scope for this pass.
- **Screen reader:** No built-in `aria-label`/`aria-labelledby`; labelling is left to the consumer pairing an external `<label for>` with `inputId` — the `inputId` pass-through itself is verified by `checkbox.component.spec.ts` — `'applies the inputId to the native input for external label pairing'`.
- **Form integration (`ControlValueAccessor`) — binary-`false` regression guard:** `writeValue` normalizes with `=== true` rather than truthiness, so `writeValue(false)` renders a real unchecked state (not "unset") — `checkbox.component.spec.ts` — `'writeValue(false) renders unchecked with a real boolean false, not undefined/unset'`. `writeValue(null)`/`writeValue(undefined)` both normalize to `false` without throwing — `'writeValue(null) and writeValue(undefined) both normalize to false, never throwing'`. Unchecking always emits a real `false` (never `undefined`) through `registerOnChange` — `'unchecking emits a real false through registerOnChange, not undefined'`. A `FormControl` initialized with `false` renders correctly unchecked — `'a FormControl initialized with false renders unchecked (real-world regression scenario)'`. `indeterminate` sets the native IDL property and swaps the icon to a minus, verified together — `'shows the minus icon (not check) when indeterminate, and sets the native indeterminate property'`.

**A11y verdict:** Covered — **the keyboard-coverage gap is resolved 2026-08-19**: Space-key toggling was always correct native `<input>` behavior, now directly proven via the real DOM checkbox-activation path rather than only a synthetic `change` event. `aria-invalid`, `aria-hidden` on the decorative box, and the binary-`false`/indeterminate form-integration edge cases remain directly tested as before. `aria-describedby` is **By design (deferred)** — a library-wide gap, not specific to Checkbox.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `inputId` and pair it with an external `<label for>` — the component provides no built-in label. | Don't rely on the component for an accessible name; without a paired label, screen reader users only hear "checkbox". |
| Use `indeterminate` for "select all" parent checkboxes representing a mixed child selection. | Don't expect `indeterminate` to be mutually exclusive with `checked` automatically — both are independent inputs the consumer must coordinate. |
| Trust `writeValue`/`registerOnChange` to always deal in real booleans — `false`/`null`/`undefined` all normalize safely (`checkbox.component.spec.ts` — `'writeValue(false) renders unchecked with a real boolean false, not undefined/unset'`), guarding against the binary-`false` pitfall. | Don't reuse `checkboxBoxVariants` (the CVA behind the decorative box) on a custom checkbox-like element that has no real sibling `<input class="peer">` driving `:checked`/`:indeterminate` — the classes are `peer-*` variants and silently do nothing without a real peer input. |
| Be aware `class` merges onto the decorative inner `<span>`, not the host — the host keeps its own static `inline-flex items-center` classes, so a consumer's `class` never targets the host directly (unlike components that route `class` to `host: { '[class]': ... }`). | Don't rely solely on a property-bound `[class]="expr"` test to validate class merging; a real static `class="..."` attribute on `<med-checkbox>` also lands natively on the host element in Angular, which the current spec (`'merges a consumer class override onto the decorative box'`, using `setInput`) does not exercise. |

### Code example (Angular)
```html
<med-checkbox [(ngModel)]="checkboxDemoValue" name="demo" />
<med-checkbox indeterminate />
<med-checkbox invalid />
<med-checkbox disabled />
<med-checkbox size="sm" />
<med-checkbox size="lg" />
```

### Source
- `projects/medra/ui/src/lib/checkbox/checkbox.component.ts`
- `projects/medra/ui/src/lib/checkbox/checkbox.styles.ts`
- Usage: `projects/showcase/src/app/app.html:60-80`
